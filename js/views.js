// Screens. Each view renders into <main id="app"> and may return a cleanup function.
(function () {
  const t = (k, v) => I18N.t(k, v);
  const c = L => I18N.c(L);
  const esc = s => Cards.esc(s);
  const QS = () => window.QUESTIONS || [];
  // a question that relies on a photo is studied only once it has a free replacement image (q.images);
  // otherwise it stays browsable but is left out of study and exams
  const usable = q => !q.image || Cards.picturesOf(q).length > 0;
  const STUDY = () => QS().filter(usable);
  const SUBJECTS = [
    { id: "geo", icon: "🗺️", el: "Γεωγραφία", exam: 4 },
    { id: "cul", icon: "🏛️", el: "Πολιτισμός", exam: 4 },
    { id: "his", icon: "📜", el: "Ιστορία", exam: 6 },
    { id: "ins", icon: "⚖️", el: "Θεσμοί του Πολιτεύματος", exam: 6 }
  ];
  const app = () => document.getElementById("app");
  function html(s) { app().innerHTML = s; I18N.apply(app()); }
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function stackBar(cat, total) {
    const pct = n => (100 * n / Math.max(1, total)).toFixed(2) + "%";
    return `<div class="bar" aria-hidden="true"><span class="seg-mature" style="width:${pct(cat.mature)}"></span><span class="seg-young" style="width:${pct(cat.young)}"></span><span class="seg-learning" style="width:${pct(cat.learning)}"></span></div>`;
  }
  function accuracy() {
    let n = 0, ok = 0;
    for (const k in Store.data.log) { n += Store.data.log[k].n; ok += Store.data.log[k].ok; }
    return { n, pct: n ? Math.round(100 * ok / n) : null };
  }

  // ======================= HOME =======================
  function home() {
    const all = STUDY();
    const cnt = SRS.counts(all);
    const acc = accuracy();
    const learned = cnt.cat.young + cnt.cat.mature;
    const todo = cnt.due + cnt.newToday;
    const weak = all.map(q => ({ q, st: SRS.stateOf(q.id) })).filter(x => x.st && x.st.wrong > 0)
      .sort((a, b) => (b.st.wrong - a.st.wrong) || (b.st.lapses - a.st.lapses)).slice(0, 5);

    html(`
      ${Roadmap.nextCard()}
      <section class="hero">
        <div class="card hero-main">
          <h1>${esc(t("heroTitle"))}</h1>
          <p class="el-sub" lang="el">Πιστοποιητικό Επάρκειας Γνώσεων για Πολιτογράφηση</p>
          <p class="muted">${esc(t("heroText"))}</p>
          <div class="row">
            <a class="btn btn-primary" href="#/learn">📖 ${esc(t("lessonCta"))}</a>
            <a class="btn" href="#/browse">🔎 ${esc(t("browseAll"))}</a>
            <a class="btn" href="#/exam">✎ ${esc(t("examCta"))}</a>
          </div>
        </div>
        <div class="card stack">
          <div class="row" style="align-items:flex-end">
            <div><div class="today-num">${cnt.due}</div><div class="small muted">${esc(t("todayDue"))}</div></div>
            <div style="margin-left:1.2rem"><div class="today-num" style="color:var(--warn)">${cnt.newToday}</div><div class="small muted">${esc(t("todayNew"))}</div></div>
          </div>
          ${todo ? `<a class="btn btn-primary btn-block" href="#/study">▶ ${esc(t("startToday"))}</a>`
                 : `<div class="pill ok" style="justify-content:center;padding:.6rem">${esc(t("nothingDue"))}</div><a class="btn btn-block" href="#/study?extra=1">${esc(t("continueStudy"))}</a>`}
          <div class="kpis">
            <div class="kpi"><b>🔥 ${Store.streak()}</b><small>${esc(t("streak"))}</small></div>
            <div class="kpi"><b>${learned}/${all.length}</b><small>${esc(t("learned"))}</small></div>
            <div class="kpi"><b>${acc.pct == null ? "–" : acc.pct + "%"}</b><small>${esc(t("accuracy"))}</small></div>
          </div>
        </div>
      </section>

      <div class="section-title"><h2>${esc(t("subjects"))}</h2><span class="small muted">${esc(t("subjectsSub"))}</span></div>
      <div class="grid grid-4">
        ${SUBJECTS.map(s => {
          const qs = all.filter(q => q.subject === s.id), k = SRS.counts(qs);
          return `<a class="card subject-card" style="--c:var(--${s.id})" href="#/browse?s=${s.id}">
            <span class="ico" aria-hidden="true">${s.icon}</span>
            <h3 style="margin:0">${esc(t("subj_" + s.id))}</h3>
            <span class="el-name" lang="el">${esc(s.el)}</span>
            ${stackBar(k.cat, qs.length)}
            <span class="meta"><span>${k.cat.young + k.cat.mature}/${qs.length}</span><span>${k.due ? `<b style="color:var(--text)">${k.due}</b> ${esc(t("due"))}` : ""}</span></span>
            <span class="meta"><span>${s.exam} ${esc(t("inExam"))}</span></span>
          </a>`;
        }).join("")}
      </div>

      <div class="grid grid-2" style="margin-top:1rem">
        <div class="card">
          <h2>✎ ${esc(t("examCta"))}</h2>
          <p class="muted">${esc(t("examCtaText"))}</p>
          ${lastExamLine()}
          <a class="btn btn-primary" href="#/exam">${esc(t("examStart"))}</a>
        </div>
        <div class="card">
          <h2>${esc(t("weakTitle"))}</h2>
          ${weak.length ? `<div class="qlist">${weak.map(x => `<a class="qrow" style="padding:.4rem 0;grid-template-columns:52px 1fr auto" href="#/browse?id=${x.q.id}">
              <span class="num" style="color:var(--${x.q.subject})">${esc(t("subj_" + x.q.subject).slice(0, 4))} ${x.q.n}</span>
              <span><span class="t-el" lang="el">${esc(trim(x.q.prompt.el, 70))}</span></span>
              <span class="pill bad">✗ ${x.st.wrong}</span></a>`).join("")}</div>`
            : `<p class="muted small">${esc(t("weakEmpty"))}</p>`}
        </div>
      </div>
    `);
  }
  function trim(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function lastExamLine() {
    const ex = Store.data.exams;
    if (!ex.length) return "";
    const e = ex[ex.length - 1];
    return `<p class="small">${new Date(e.at).toLocaleDateString(I18N.lang)} · <b>${fmtPts(e.score)}/${e.max}</b> · <span class="${e.score >= e.max / 2 ? "pill ok" : "pill bad"}">${esc(e.score >= e.max / 2 ? t("passed") : t("failed"))}</span></p>`;
  }
  function fmtPts(x) { return Number.isInteger(x) ? String(x) : x.toFixed(1); }

  // ======================= STUDY =======================
  function study(params) {
    const subj = params.get("s");
    // ids = drill a fixed set (a lesson section's questions), regardless of what is due; grading still feeds SRS
    const ids = params.get("ids"), back = params.get("back");
    const backOk = back && back.startsWith("#/learn") ? back : null;
    const pool = ids ? ids.split(",").map(id => QS().find(q => q.id === id)).filter(q => q && usable(q))
                     : STUDY().filter(q => !subj || q.subject === subj);
    const queue = ids ? shuffle(pool) : SRS.buildQueue(pool, { extra: params.get("extra") === "1" });
    let done = 0, firstOk = 0, current = null, keyHandler = null;
    const firstSeen = new Set();

    if (!queue.length) {
      html(`<div class="card empty"><div class="big">🎉</div><h2>${esc(t("nothingDue"))}</h2>
        <div class="row" style="justify-content:center;margin-top:1rem"><a class="btn" href="#/">${esc(t("backHome"))}</a>
        <a class="btn btn-primary" href="#/study?extra=1${subj ? "&s=" + subj : ""}">${esc(t("continueStudy"))}</a></div></div>`);
      return;
    }

    html(`<div class="study-head">
        <a class="btn btn-sm btn-ghost" href="${esc(backOk || "#/")}" aria-label="${esc(t("backHome"))}">✕</a>
        <div class="bar"><span id="prog" style="width:0;background:var(--primary)"></span></div>
        <span class="small muted" id="progTxt"></span>
      </div>
      <div class="row" style="margin-bottom:.8rem${ids ? ";display:none" : ""}">
        <div class="chips">
          <a class="chip" href="#/study" aria-pressed="${!subj}">${esc(t("studyAll"))}</a>
          ${SUBJECTS.map(s => `<a class="chip" href="#/study?s=${s.id}" aria-pressed="${subj === s.id}">${esc(t("subj_" + s.id))}</a>`).join("")}
        </div>
      </div>
      <div id="slot"></div>`);
    const slot = document.getElementById("slot");

    function progress() {
      const total = done + queue.length;
      document.getElementById("prog").style.width = (100 * done / Math.max(1, total)) + "%";
      document.getElementById("progTxt").textContent = `${done}/${total}`;
    }

    function pickNext() {
      const now = Date.now();
      // a learning card that is due now jumps the queue
      const li = queue.findIndex(q => { const st = SRS.stateOf(q.id); return st && st.s === "learning" && st.due <= now; });
      if (li > 0) return queue.splice(li, 1)[0];
      return queue.shift();
    }

    function finish() {
      if (ids) {
        html(`<div class="card empty fade-in"><div class="big">✅</div><h2>${esc(t("drillDone"))}</h2>
          <p class="muted">${esc(t("sessionDoneText", { n: firstSeen.size, c: firstOk }))}</p>
          <div class="row" style="justify-content:center">${backOk ? `<a class="btn btn-primary" href="${esc(backOk)}">${esc(t("backToLesson"))}</a>` : ""}<a class="btn" href="#/">${esc(t("backHome"))}</a></div></div>`);
        return;
      }
      html(`<div class="card empty fade-in"><div class="big">✅</div><h2>${esc(t("sessionDone"))}</h2>
        <p class="muted">${esc(t("sessionDoneText", { n: firstSeen.size, c: firstOk }))}</p>
        <div class="row" style="justify-content:center"><a class="btn" href="#/">${esc(t("backHome"))}</a>
        <a class="btn btn-primary" href="#/study?extra=1${subj ? "&s=" + subj : ""}">${esc(t("continueStudy"))}</a></div></div>`);
    }

    function show() {
      progress();
      const q = pickNext();
      if (!q) return finish();
      const isFirst = !firstSeen.has(q.id); firstSeen.add(q.id);
      const actions = document.createElement("div");
      actions.className = "actions";
      let checked = false;

      const ctl = Cards.render(q, {
        mode: "study",
        onChange(ctl) {
          if (checked) return;
          if (q.type === "mc" && ctl.isAnswered()) return check();
          const b = actions.querySelector("[data-act=check]");
          if (b) b.disabled = !ctl.isAnswered();
        }
      });
      current = ctl;
      slot.innerHTML = "";
      slot.appendChild(ctl.node);
      ctl.node.appendChild(actions);

      const autoType = !ctl.self && q.type !== "map";
      if (q.type === "mc") actions.innerHTML = "";
      else if (autoType) actions.innerHTML = `<button class="btn btn-primary" data-act="check" disabled>${esc(t("check"))}</button>`;
      else actions.innerHTML = `<button class="btn btn-primary" data-act="check">${esc(t("showAnswer"))}</button>`;
      actions.insertAdjacentHTML("beforeend", `<div class="kbd-hint">${q.type === "mc" ? "1–4 · " : ""}Enter = ${esc(autoType ? t("check") : t("showAnswer"))}</div>`);

      function check() {
        if (checked) return;
        checked = true;
        ctl.showAnswer();
        const r = ctl.evaluate();
        const st = SRS.stateOf(q.id), now = Date.now();
        const btn = (g, cls, label) => `<button type="button" class="${cls}" data-g="${g}">${esc(label)}<small>${esc(SRS.preview(st, g, now))}</small></button>`;
        let fb = "";
        if (r.ok === true) fb = `<span class="pill ok">✓ ${esc(t("correct"))}</span>`;
        else if (r.ok === false) fb = `<span class="pill bad">✗ ${r.part > 0 ? esc(t("partly")) + " · " + Math.round(r.part * 100) + "%" : esc(t("wrong"))}</span>`;
        let grades;
        if (r.ok === false) grades = `<div class="grades" style="grid-template-columns:1fr">${btn(1, "g-again", t("g_again"))}</div>`;
        else if (r.ok === true) grades = `<div class="grades" style="grid-template-columns:repeat(3,1fr)">${btn(2, "g-hard", t("g_hard"))}${btn(3, "g-good", t("g_good"))}${btn(4, "g-easy", t("g_easy"))}</div>`;
        else grades = `<div class="grades">${btn(1, "g-again", t("g_again"))}${btn(2, "g-hard", t("g_hard"))}${btn(3, "g-good", t("g_good"))}${btn(4, "g-easy", t("g_easy"))}</div>`;
        actions.innerHTML = `<div class="row">${fb}</div>${grades}<div class="kbd-hint">${r.ok === false ? "Enter" : r.ok === true ? "2 · 3 · 4 · Enter = " + esc(t("g_good")) : "1 · 2 · 3 · 4"}</div>`;
        actions.dataset.auto = r.ok === false ? "1" : r.ok === true ? "3" : "";
        ctl.result = r;
        actions.querySelector(".grades button").focus({ preventScroll: true });
      }

      function grade(g) {
        const r = ctl.result || {};
        const ok = r.ok === true || (r.ok == null && g >= 3);
        if (isFirst && ok) firstOk++;
        const st = SRS.grade(q, g, isFirst && ok);
        done++;
        // learning cards come back later in this session
        if (st.s === "learning" && st.due - Date.now() < 20 * SRS.MIN) {
          const pos = Math.min(queue.length, 3 + Math.floor(Math.random() * 3));
          queue.splice(pos, 0, q);
        }
        show();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      actions.addEventListener("click", e => {
        const b = e.target.closest("button");
        if (!b) return;
        if (b.dataset.act === "check") check();
        else if (b.dataset.g) grade(+b.dataset.g);
      });

      keyHandler = e => {
        if (e.target.matches("input, textarea, select")) return;
        if (!checked) {
          if (q.type === "mc" && /^[1-4]$/.test(e.key) && q.options[+e.key - 1]) { ctl.node.querySelectorAll(".opt")[+e.key - 1].click(); e.preventDefault(); }
          else if (e.key === "Enter" && (!autoType || ctl.isAnswered())) { check(); e.preventDefault(); }
          else if (e.key === "t") ctl.node.classList.toggle("show-tr");
        } else {
          const auto = actions.dataset.auto;
          if (/^[1-4]$/.test(e.key) && actions.querySelector(`[data-g="${e.key}"]`)) { grade(+e.key); e.preventDefault(); }
          else if (e.key === "Enter" && auto) { grade(+auto); e.preventDefault(); }
        }
      };
    }

    const onKey = e => keyHandler && keyHandler(e);
    document.addEventListener("keydown", onKey);
    show();
    return () => document.removeEventListener("keydown", onKey);
  }

  // ======================= BROWSE / SEARCH =======================
  function browse(params) {
    const subj = params.get("s") || "";
    let type = params.get("type") || "";
    let query = params.get("q") || "";
    const focusId = params.get("id");
    const all = QS();
    const subjObj = SUBJECTS.find(s => s.id === subj);
    const pool = all.filter(q => !subj || q.subject === subj);
    const k = SRS.counts(pool.filter(usable));
    const types = ["mc", "tf", "fill", "match", "open", "map"].filter(ty => pool.some(q => q.type === ty));

    html(`
      ${subjObj ? `<div class="card" style="border-top:4px solid var(--${subj});margin-bottom:1rem">
          <div class="row"><span style="font-size:1.6rem">${subjObj.icon}</span><div><h1 style="margin:0">${esc(t("subj_" + subj))}</h1><div class="muted" lang="el">${esc(subjObj.el)}</div></div>
          <span class="spacer"></span>${LES()[subj] ? `<a class="btn" href="#/learn?s=${subj}">📖 ${esc(t("readLesson"))}</a>` : ""}<a class="btn btn-primary" href="#/study?s=${subj}">▶ ${esc(t("studySubject"))}</a></div>
          <div style="margin-top:.8rem">${stackBar(k.cat, pool.filter(usable).length)}</div>
          ${legend(k.cat)}
        </div>` : `<h1>${esc(t("browseAll"))}</h1>`}
      <div class="toolbar">
        <input type="search" id="q" placeholder="${esc(t("searchPh"))}" value="${esc(query)}" aria-label="${esc(t("searchPh"))}">
      </div>
      <div class="row" style="margin-bottom:.6rem">
        <div class="chips" id="subjChips">
          <button class="chip" data-s="" aria-pressed="${!subj}">${esc(t("allTypes"))}</button>
          ${SUBJECTS.map(s => `<button class="chip" data-s="${s.id}" aria-pressed="${subj === s.id}">${esc(t("subj_" + s.id))}</button>`).join("")}
        </div>
      </div>
      <div class="chips" id="typeChips" style="margin-bottom:1rem">
        <button class="chip" data-type="" aria-pressed="${!type}">${esc(t("allTypes"))}</button>
        ${types.map(ty => `<button class="chip" data-type="${ty}" aria-pressed="${type === ty}">${esc(t("type_" + ty))}</button>`).join("")}
      </div>
      <p class="small muted" id="count"></p>
      <div class="qlist" id="list"></div>`);

    const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("el");
    const hay = new Map();
    function textOf(q) {
      if (hay.has(q.id)) return hay.get(q.id);
      const parts = [];
      (function walk(o) {
        if (!o || typeof o !== "object") return;
        if ("el" in o && typeof o.el === "string") { parts.push(o.el, o.tr, o.en); return; }
        for (const k in o) walk(o[k]);
      })(q);
      const s = norm(parts.join(" "));
      hay.set(q.id, s);
      return s;
    }

    function draw() {
      const words = norm(query).split(/\s+/).filter(Boolean);
      const list = pool.filter(q => (!type || q.type === type) && words.every(w => textOf(q).includes(w)));
      document.getElementById("count").textContent = `${list.length} ${t("questions")}`;
      const box = document.getElementById("list");
      box.innerHTML = list.length ? "" : `<p class="muted">${esc(t("noResults"))}</p>`;
      for (const q of list.slice(0, 120)) box.appendChild(row(q, q.id === focusId));
      if (list.length > 120) box.insertAdjacentHTML("beforeend", `<p class="small muted">+${list.length - 120}…</p>`);
    }

    function row(q, open) {
      const st = SRS.stateOf(q.id), cat = SRS.category(st);
      const pill = { unseen: "", learning: `<span class="pill warn">${esc(t("learningS"))}</span>`, young: `<span class="pill ok">${esc(t("young"))}</span>`, mature: `<span class="pill ok">★ ${esc(t("mature"))}</span>` }[cat];
      const d = document.createElement("details");
      d.className = "card"; d.style.padding = "0";
      d.innerHTML = `<summary class="qrow" style="cursor:pointer;list-style:none">
          <span class="num" style="color:var(--${q.subject})">${q.n}</span>
          <span><span class="t-el" lang="el">${esc(q.prompt.el)}</span><span class="t-tr">${esc(c(q.prompt))}</span></span>
          <span class="row" style="gap:.3rem;justify-content:flex-end"><span class="pill">${esc(t("type_" + q.type))}</span>${pill}</span>
        </summary><div class="slot" style="padding:0 .8rem .8rem"></div>`;
      d.addEventListener("toggle", () => {
        const s = d.querySelector(".slot");
        if (d.open && !s.firstChild) { const ctl = Cards.render(q, { mode: "browse" }); ctl.node.classList.add("show-tr"); ctl.node.style.boxShadow = "none"; s.appendChild(ctl.node); }
      });
      if (open) setTimeout(() => { d.open = true; d.scrollIntoView({ block: "center" }); }, 30);
      return d;
    }

    const input = document.getElementById("q");
    let tm;
    input.addEventListener("input", () => { clearTimeout(tm); tm = setTimeout(() => { query = input.value; draw(); }, 120); });
    document.getElementById("typeChips").addEventListener("click", e => {
      const b = e.target.closest("[data-type]"); if (!b) return;
      type = b.dataset.type;
      document.querySelectorAll("#typeChips .chip").forEach(x => x.setAttribute("aria-pressed", x === b));
      draw();
    });
    document.getElementById("subjChips").addEventListener("click", e => {
      const b = e.target.closest("[data-s]"); if (!b) return;
      const p = new URLSearchParams(); if (b.dataset.s) p.set("s", b.dataset.s); if (query) p.set("q", query);
      location.hash = "#/browse" + (p.toString() ? "?" + p : "");
    });
    draw();
  }

  function legend(cat) {
    return `<div class="legend"><span><i class="seg-mature"></i>${esc(t("mature"))} ${cat.mature}</span><span><i class="seg-young"></i>${esc(t("young"))} ${cat.young}</span><span><i class="seg-learning"></i>${esc(t("learningS"))} ${cat.learning}</span><span><i style="background:var(--surface-2)"></i>${esc(t("unseen"))} ${cat.unseen}</span></div>`;
  }

  // ======================= EXAM =======================
  let examState = null;   // survives route changes within the tab

  function exam() {
    if (examState && !examState.finished) return examRun();
    if (examState && examState.finished) return examResult();
    const last = Store.setting("examMins") ?? 60;
    html(`<div class="card stack" style="max-width:640px;margin:0 auto">
        <h1>✎ ${esc(t("exam"))}</h1>
        <p class="muted">${esc(t("examIntro"))}</p>
        <div class="field"><label>${esc(t("examTimer"))}</label>
          <div class="seg" id="mins">${[0, 30, 45, 60].map(m => `<button type="button" data-m="${m}" aria-pressed="${m === last}">${m ? m + " dk" : esc(t("examNoTimer"))}</button>`).join("")}</div>
        </div>
        <label class="row" style="gap:.5rem;cursor:pointer"><input type="checkbox" id="onlyAuto" ${Store.setting("examAuto") ? "checked" : ""}> <span><b>${esc(t("examOnlyAuto"))}</b><br><span class="small muted">${esc(t("examOnlyAutoHint"))}</span></span></label>
        <button class="btn btn-primary btn-block" id="go">${esc(t("examStart"))}</button>
        <div><h3>${esc(t("examHistory"))}</h3>${examHistoryHtml()}</div>
      </div>`);
    let mins = last;
    document.getElementById("mins").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      mins = +b.dataset.m;
      document.querySelectorAll("#mins button").forEach(x => x.setAttribute("aria-pressed", x === b));
    });
    document.getElementById("go").addEventListener("click", () => {
      const onlyAuto = document.getElementById("onlyAuto").checked;
      Store.setting("examMins", mins); Store.setting("examAuto", onlyAuto);
      examState = newExam(mins, onlyAuto);
      examRun();
    });
  }

  function examHistoryHtml() {
    const ex = Store.data.exams.slice(-8).reverse();
    if (!ex.length) return `<p class="small muted">${esc(t("noExams"))}</p>`;
    return `<table class="table"><tbody>${ex.map(e => `<tr><td>${new Date(e.at).toLocaleString(I18N.lang, { dateStyle: "short", timeStyle: "short" })}</td>
      <td class="num"><b>${fmtPts(e.score)}</b>/${e.max}</td><td class="num"><span class="pill ${e.score >= e.max / 2 ? "ok" : "bad"}">${esc(e.score >= e.max / 2 ? t("passed") : t("failed"))}</span></td></tr>`).join("")}</tbody></table>`;
  }

  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function newExam(mins, onlyAuto) {
    const autoOk = q => !(q.type === "open" || (q.type === "fill" && !(q.bank && q.bank.length)));
    const qs = [];
    for (const s of SUBJECTS) {
      const pool = QS().filter(q => q.subject === s.id && usable(q) && (!onlyAuto || autoOk(q)));
      qs.push(...shuffle(pool).slice(0, s.exam));
    }
    // official order of subjects in the paper: geography, culture, history, institutions
    return { qs, answers: qs.map(() => null), cur: 0, mins, started: Date.now(), finished: false, self: {}, onlyAuto };
  }

  function examRun() {
    const S = examState;
    html(`<div class="row" style="margin-bottom:.4rem">
        <h2 style="margin:0">${esc(t("exam"))}</h2><span class="spacer"></span>
        ${S.mins ? `<span class="timer" id="timer"></span>` : ""}
        <button class="btn btn-sm" id="finish">${esc(t("examFinish"))}</button>
      </div>
      <div class="exam-nav" id="nav"></div>
      <div id="slot"></div>
      <div class="row" style="margin-top:1rem"><button class="btn" id="prev">← ${esc(t("prev"))}</button><span class="spacer"></span><button class="btn btn-primary" id="next">${esc(t("next"))} →</button></div>`);
    const slot = document.getElementById("slot");
    let ctl = null;

    function nav() {
      document.getElementById("nav").innerHTML = S.qs.map((q, i) => {
        const a = S.answers[i];
        const answered = a != null && (!Array.isArray(a) || a.some(v => v != null));
        return `<button type="button" data-i="${i}" class="${answered ? "done" : ""} ${i === S.cur ? "cur" : ""}" title="${esc(t("subj_" + q.subject))}" style="border-bottom:3px solid var(--${q.subject})">${i + 1}</button>`;
      }).join("");
    }
    function show() {
      const q = S.qs[S.cur];
      ctl = Cards.render(q, { mode: "exam", answer: S.answers[S.cur] != null ? JSON.parse(JSON.stringify(S.answers[S.cur])) : null, onChange(c) { S.answers[S.cur] = c.answer; nav(); } });
      // during the exam the translation is still available on tap — it's practice, not the real thing
      ctl.node.querySelector(".qmeta").insertAdjacentHTML("afterbegin", `<span class="pill">${esc(t("q"))} ${S.cur + 1}/${S.qs.length}</span>`);
      slot.innerHTML = ""; slot.appendChild(ctl.node);
      if (q.type === "map" && Array.isArray(S.answers[S.cur])) { ctl.map.state.guesses = S.answers[S.cur].slice(); ctl.map.select(ctl.map.state.guesses.findIndex(g => !g) === -1 ? 0 : ctl.map.state.guesses.findIndex(g => !g)); }
      document.getElementById("prev").disabled = S.cur === 0;
      document.getElementById("next").textContent = S.cur === S.qs.length - 1 ? t("examFinish") : t("next") + " →";
      nav();
    }
    document.getElementById("nav").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { S.cur = +b.dataset.i; show(); } });
    document.getElementById("prev").addEventListener("click", () => { if (S.cur > 0) { S.cur--; show(); } });
    document.getElementById("next").addEventListener("click", () => { if (S.cur < S.qs.length - 1) { S.cur++; show(); window.scrollTo({ top: 0 }); } else tryFinish(); });
    document.getElementById("finish").addEventListener("click", tryFinish);

    function unanswered() {
      return S.answers.filter(a => a == null || (Array.isArray(a) && a.every(v => v == null)) || (typeof a === "string" && !a.trim())).length;
    }
    function tryFinish() {
      const n = unanswered();
      if (n && !confirm(t("examConfirmFinish", { n }))) return;
      finishExam();
    }
    let timer = null;
    if (S.mins) {
      const tick = () => {
        const left = Math.max(0, S.started + S.mins * 60000 - Date.now());
        const el = document.getElementById("timer");
        if (!el) return clearInterval(timer);
        const m = Math.floor(left / 60000), s = Math.floor(left / 1000) % 60;
        el.textContent = `⏱ ${m}:${String(s).padStart(2, "0")}`;
        el.classList.toggle("low", left < 5 * 60000);
        if (left <= 0) { clearInterval(timer); toast(t("timeUp")); finishExam(); }
      };
      tick(); timer = setInterval(tick, 1000);
    }
    show();
    return () => clearInterval(timer);
  }

  function finishExam() {
    const S = examState;
    S.finished = true; S.secs = Math.round((Date.now() - S.started) / 1000);
    S.results = S.qs.map((q, i) => {
      const ctl = Cards.render(q, { mode: "exam", answer: S.answers[i] != null ? JSON.parse(JSON.stringify(S.answers[i])) : null });
      if (q.type === "map" && Array.isArray(S.answers[i])) ctl.map.state.guesses = S.answers[i].slice();
      return ctl.evaluate();
    });
    S.recIndex = Store.data.exams.length;
    Store.data.exams.push(examRecord());
    Store.save();
    examResult();
  }

  function examScore() {
    const S = examState;
    let score = 0; const per = {};
    S.qs.forEach((q, i) => {
      const r = S.results[i];
      let part = r.self ? (S.self[i] === true ? 1 : 0) : r.part;
      if (!r.self && (S.answers[i] == null)) part = 0;
      const pts = Math.round(part * 2 * 2) / 2;    // 2 points per question, half-point steps
      score += pts;
      const p = per[q.subject] || (per[q.subject] = [0, 0]);
      p[0] += pts; p[1] += 2;
    });
    return { score, max: S.qs.length * 2, per };
  }
  function examRecord() {
    const s = examScore();
    return { at: examState.started, score: s.score, max: s.max, per: s.per, secs: examState.secs, auto: examState.onlyAuto };
  }

  function examResult() {
    const S = examState;
    const s = examScore();
    const pass = s.score >= s.max / 2;
    const pending = S.qs.filter((q, i) => S.results[i].self && S.self[i] == null).length;
    html(`<div class="card" style="text-align:center">
        <h1>${esc(t("examResult"))}</h1>
        <div class="score-big">${fmtPts(s.score)}<span class="muted" style="font-size:1.4rem">/${s.max}</span></div>
        <p class="verdict ${pass ? "pass" : "fail"}">${esc(pass ? t("passed") : t("failed"))}</p>
        ${pending ? `<p class="pill warn">${esc(t("selfAssess"))} · ${pending}</p>` : ""}
        <div class="grid grid-4" style="margin-top:1rem;text-align:left">
          ${SUBJECTS.map(x => s.per[x.id] ? `<div class="kpi"><b style="color:var(--${x.id})">${fmtPts(s.per[x.id][0])}/${s.per[x.id][1]}</b><small>${esc(t("subj_" + x.id))}</small></div>` : "").join("")}
        </div>
        <div class="row" style="justify-content:center;margin-top:1rem">
          <button class="btn btn-primary" id="again">${esc(t("retryExam"))}</button>
          <a class="btn" href="#/">${esc(t("backHome"))}</a>
        </div>
      </div>
      <div class="section-title"><h2>${esc(t("examReview"))}</h2></div>
      <div class="exam-nav" id="nav">${S.qs.map((q, i) => {
        const r = S.results[i];
        const ok = r.self ? S.self[i] : r.ok;
        return `<button type="button" data-i="${i}" class="${ok === true ? "ok" : ok === false ? "bad" : ""}">${i + 1}</button>`;
      }).join("")}</div>
      <div id="rev" class="stack"></div>`);
    const rev = document.getElementById("rev");
    S.qs.forEach((q, i) => {
      const ctl = Cards.render(q, { mode: "exam", answer: S.answers[i] != null ? JSON.parse(JSON.stringify(S.answers[i])) : null });
      if (q.type === "map" && Array.isArray(S.answers[i])) ctl.map.state.guesses = S.answers[i].slice();
      ctl.node.id = "rq" + i;
      ctl.node.querySelector(".qmeta").insertAdjacentHTML("afterbegin", `<span class="pill">${i + 1}</span>`);
      ctl.showAnswer();
      const r = S.results[i];
      if (r.self) {
        const box = document.createElement("div");
        box.className = "self-check";
        box.innerHTML = `<b style="align-self:center">${esc(t("selfAssess"))}</b><button class="btn btn-sm" data-v="1" aria-pressed="${S.self[i] === true}">✓ ${esc(t("yes"))}</button><button class="btn btn-sm" data-v="0" aria-pressed="${S.self[i] === false}">✗ ${esc(t("no"))}</button>`;
        box.addEventListener("click", e => {
          const b = e.target.closest("button"); if (!b) return;
          S.self[i] = b.dataset.v === "1";
          Store.data.exams[S.recIndex] = examRecord(); Store.save();
          const y = window.scrollY; examResult(); window.scrollTo(0, y);
        });
        ctl.node.appendChild(box);
      } else {
        ctl.node.querySelector(".qmeta").insertAdjacentHTML("beforeend", r.ok ? `<span class="pill ok">✓</span>` : `<span class="pill bad">✗ ${Math.round((r.part || 0) * 100)}%</span>`);
      }
      rev.appendChild(ctl.node);
    });
    document.getElementById("nav").addEventListener("click", e => { const b = e.target.closest("button"); if (b) document.getElementById("rq" + b.dataset.i).scrollIntoView({ behavior: "smooth", block: "start" }); });
    document.getElementById("again").addEventListener("click", () => { examState = null; exam(); window.scrollTo(0, 0); });
  }

  // ======================= STATS =======================
  function stats() {
    const all = STUDY();
    const k = SRS.counts(all);
    const acc = accuracy();
    const ex = Store.data.exams;
    const best = ex.length ? Math.max(...ex.map(e => e.score / e.max)) : null;

    // heatmap: 16 weeks ending this week (columns = weeks, rows = Mon..Sun)
    const days = [], end = new Date(); end.setHours(0, 0, 0, 0);
    const start = new Date(end); start.setDate(end.getDate() - (16 * 7 - 1) - ((end.getDay() + 6) % 7) + 6 - 6);
    const first = new Date(end); first.setDate(end.getDate() - 16 * 7 + 1);
    while ((first.getDay() + 6) % 7 !== 0) first.setDate(first.getDate() - 1);
    for (const d = new Date(first); d <= end; d.setDate(d.getDate() + 1)) {
      const e = Store.data.log[Store.dayKey(d)], n = e ? e.n : 0;
      const l = n === 0 ? 0 : n < 10 ? 1 : n < 25 ? 2 : n < 50 ? 3 : 4;
      days.push(`<span data-l="${l}" title="${Store.dayKey(d)}: ${n}"></span>`);
    }

    const rows = SUBJECTS.map(s => {
      const qs = all.filter(q => q.subject === s.id), kk = SRS.counts(qs);
      let seen = 0, wrong = 0;
      qs.forEach(q => { const st = SRS.stateOf(q.id); if (st) { seen += st.seen || 0; wrong += st.wrong || 0; } });
      const exPer = ex.filter(e => e.per && e.per[s.id]).map(e => e.per[s.id]);
      const exPct = exPer.length ? Math.round(100 * exPer.reduce((a, p) => a + p[0], 0) / exPer.reduce((a, p) => a + p[1], 0)) : null;
      return `<tr><td><b style="color:var(--${s.id})">${esc(t("subj_" + s.id))}</b><div style="margin-top:.3rem">${stackBar(kk.cat, qs.length)}</div></td>
        <td class="num">${kk.cat.young + kk.cat.mature}/${qs.length}</td>
        <td class="num">${seen ? Math.round(100 * (seen - wrong) / seen) + "%" : "–"}</td>
        <td class="num">${exPct == null ? "–" : exPct + "%"}</td>
        <td class="num">${kk.due}</td></tr>`;
    }).join("");

    const last = ex.slice(-24);
    html(`<h1>${esc(t("stats"))}</h1>
      <div class="grid grid-4">
        <div class="kpi card"><b>🔥 ${Store.streak()}</b><small>${esc(t("streak"))}</small></div>
        <div class="kpi card"><b>${acc.n}</b><small>${esc(t("reviewsTotal"))}</small></div>
        <div class="kpi card"><b>${acc.pct == null ? "–" : acc.pct + "%"}</b><small>${esc(t("accuracy"))}</small></div>
        <div class="kpi card"><b>${best == null ? "–" : Math.round(best * 100) + "%"}</b><small>${esc(t("bestScore"))} · ${ex.length} ${esc(t("examsTaken"))}</small></div>
      </div>
      <div class="card" style="margin-top:1rem"><h2>${esc(t("activity"))}</h2><div class="heat">${days.join("")}</div></div>
      <div class="card" style="margin-top:1rem"><h2>${esc(t("cardStates"))}</h2>${stackBar(k.cat, all.length)}${legend(k.cat)}</div>
      <div class="card" style="margin-top:1rem;overflow-x:auto"><h2>${esc(t("bySubject"))}</h2>
        <table class="table"><thead><tr><th></th><th class="num">${esc(t("learned"))}</th><th class="num">${esc(t("accuracy"))}</th><th class="num">${esc(t("exam"))}</th><th class="num">${esc(t("due"))}</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="card" style="margin-top:1rem"><h2>${esc(t("examHistory"))}</h2>
        ${last.length ? `<div class="examchart"><div class="pass-line" style="bottom:50%"></div>${last.map(e => `<div class="b ${e.score >= e.max / 2 ? "" : "fail"}" style="height:${Math.max(2, 100 * e.score / e.max)}%" title="${fmtPts(e.score)}/${e.max}"></div>`).join("")}</div>
          <p class="small muted" style="margin-top:.4rem">- - - 20/40</p>` : `<p class="muted small">${esc(t("noExams"))}</p>`}
      </div>`);
  }

  // ======================= SETTINGS =======================
  function settings() {
    const seg = (key, opts) => `<div class="seg" data-key="${key}">${opts.map(([v, label]) => `<button type="button" data-v="${v}" aria-pressed="${String(Store.setting(key)) === String(v)}">${esc(label)}</button>`).join("")}</div>`;
    const hasGreekVoice = "speechSynthesis" in window && speechSynthesis.getVoices().some(v => /^el/i.test(v.lang));
    html(`<div class="card" style="max-width:640px;margin:0 auto">
      <h1>${esc(t("settings"))}</h1>
      <div class="field"><label>${esc(t("setLang"))}</label>${seg("lang", [["tr", "Türkçe"], ["en", "English"]])}</div>
      <div class="field"><label>${esc(t("setTr"))}</label>${seg("tr", [["always", t("trAlways")], ["tap", t("trTap")], ["never", t("trNever")]])}</div>
      <div class="field"><label for="np">${esc(t("setNew"))}</label><input type="number" id="np" min="5" max="100" value="${Store.setting("newPerDay")}"><span class="hint">${esc(t("setNewHint"))}</span></div>
      <div class="field"><label>${esc(t("setTheme"))}</label>${seg("theme", [["auto", t("themeAuto")], ["light", t("themeLight")], ["dark", t("themeDark")]])}</div>
      <div class="field"><label>${esc(t("setVoice"))}</label>${seg("voice", [["true", t("voiceOn")], ["false", t("voiceOff")]])}${hasGreekVoice ? "" : `<span class="hint">${esc(t("voiceMissing"))}</span>`}</div>
      <div class="field"><label>${esc(t("setVoiceChoice"))}</label>${seg("voiceGender", [["", t("voiceAuto")], ["f", "♀ " + t("voiceFemale")], ["m", "♂ " + t("voiceMale")]])}
        <span class="hint">${esc(t("voiceChoiceHint"))}</span>
        <div id="voiceLists" class="stack" style="margin-top:.6rem"></div></div>
      <div class="field"><label>${esc(t("backup"))}</label>
        <div class="row"><button class="btn" id="exp">⬇ ${esc(t("exportBtn"))}</button>
        <label class="btn" style="cursor:pointer">⬆ ${esc(t("importBtn"))}<input type="file" id="imp" accept="application/json,.json" hidden></label></div></div>
      <div class="field"><button class="btn" id="reset" style="color:var(--bad)">${esc(t("resetBtn"))}</button></div>
    </div>`);
    const SAMPLE = { el: "Καλημέρα! Αυτή είναι η φωνή μου.", tr: "Merhaba! Bu benim sesim.", en: "Hello! This is my voice." };
    const LANGS = [["el", "el-GR", "Ελληνικά"], ["tr", "tr-TR", "Türkçe"], ["en", "en-US", "English"]];
    function drawVoiceLists() {
      const box = document.getElementById("voiceLists"); if (!box) return;
      box.innerHTML = LANGS.map(([k, code, name]) => {
        const vs = Voices.list(code), cur = Store.setting("voice_" + k) || "";
        const sign = v => ({ f: "♀ ", m: "♂ " }[Voices.gender(v)] || "");
        return `<div class="row"><span style="min-width:80px">${name}</span>
          <select class="sel" data-vl="${k}" ${vs.length ? "" : "disabled"}><option value="">${esc(vs.length ? t("voiceAutoPick") : t("voiceNone"))}</option>${vs.map(v => `<option value="${esc(v.name)}" ${v.name === cur ? "selected" : ""}>${sign(v)}${esc(v.name)}</option>`).join("")}</select>
          <button class="btn btn-sm" type="button" data-try="${k}" ${vs.length ? "" : "disabled"}>▶ ${esc(t("voiceTry"))}</button>
          ${Voices.genderMissing(code) ? `<span class="hint">${esc(t("voiceNoGender").replace("{l}", name))}</span>` : ""}</div>`;
      }).join("");
      box.querySelectorAll("[data-vl]").forEach(s => s.addEventListener("change", () => { Store.setting("voice_" + s.dataset.vl, s.value); toast(t("saved")); }));
      box.querySelectorAll("[data-try]").forEach(b => b.addEventListener("click", () => {
        const [k, code] = LANGS.find(x => x[0] === b.dataset.try); Voices.say(SAMPLE[k], code, 1);
      }));
    }
    drawVoiceLists();
    Voices.onChange(() => { if (location.hash.startsWith("#/settings")) drawVoiceLists(); });
    app().querySelectorAll(".seg").forEach(s => s.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      let v = b.dataset.v; if (v === "true") v = true; if (v === "false") v = false;
      Store.setting(s.dataset.key, v);
      window.App.applySettings();
      settings(); toast(t("saved"));
    }));
    document.getElementById("np").addEventListener("change", e => {
      const v = Math.max(5, Math.min(100, Math.round(+e.target.value || 20)));
      e.target.value = v; Store.setting("newPerDay", v); toast(t("saved"));
    });
    document.getElementById("exp").addEventListener("click", () => {
      const blob = new Blob([Store.exportJSON()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = `pegp-ilerleme-${Store.today()}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    document.getElementById("imp").addEventListener("change", async e => {
      const f = e.target.files[0]; if (!f) return;
      try { Store.importJSON(await f.text()); window.App.applySettings(); toast(t("importOk")); settings(); }
      catch (err) { toast(t("importBad")); }
    });
    document.getElementById("reset").addEventListener("click", () => {
      if (confirm(t("resetConfirm"))) { Store.reset(); examState = null; toast(t("resetDone")); }
    });
  }

  // ======================= ABOUT =======================
  function about(params) {
    const tr = I18N.lang === "tr";
    const count = QS().length;
    html(`<div class="card stack" style="max-width:760px;margin:0 auto">
      <h1>${esc(t("aboutTitle"))}</h1>
      ${tr ? `
        <p>Bu site, Yunan vatandaşlığına başvuranların girdiği <b lang="el">Πιστοποιητικό Επάρκειας Γνώσεων για Πολιτογράφηση (Π.Ε.Γ.Π.)</b> sınavının konu bölümüne (Coğrafya, Tarih, Kültür, Devlet Kurumları) hazırlanmak için yapılmış ücretsiz bir çalışma aracıdır. Resmi soru bankasındaki ${count} sorunun tamamı, Yunanca asılları değiştirilmeden yer alır.</p>
        <h2>Kaynak</h2>
        <p>Soruların ve resmi cevapların kaynağı: <b lang="el">«Υπουργείο Εσωτερικών – Γενική Γραμματεία Ιθαγένειας – Πλατφόρμα Εξετάσεων Πιστοποιητικού Επάρκειας Γνώσεων για Πολιτογράφηση (Π.Ε.Γ.Π)»</b>, <a href="https://exetaseis-ithageneia.ypes.gr" target="_blank" rel="noopener">https://exetaseis-ithageneia.ypes.gr</a> (Τράπεζα θεμάτων → Γενική κατηγορία). ${esc(t("bankVersion"))} Sınava girmeden önce resmi sitedeki güncel bankayı mutlaka kontrol edin.</p>
        <h2>Bizim eklediğimiz içerik</h2>
        <p>Türkçe ve İngilizce çeviriler, haritalar (Natural Earth kamu malı verisinden çizilmiştir), soruların etkileşimli biçimleri, notlar ve sınav simülasyonu bu sitenin kendi içeriğidir; resmi materyal değildir. Çevirilerde hata görürseniz Yunanca asıl esastır. Fotoğrafa dayanan bazı sorularda fotoğraflar telif nedeniyle gösterilmez.</p>
        <h2>Resmi değildir</h2>
        <p>${esc(t("footerDisclaimer"))}</p>
        <h2>Nasıl çalışır?</h2>
        <p><b>Akıllı tekrar:</b> Her soruyu cevapladıktan sonra ne kadar zorlandığını seçersin. Bildiğin sorular giderek daha seyrek (1 gün, 3 gün, 1 hafta, …), zorlandıkların daha sık karşına çıkar. Her gün önce vadesi gelen tekrarlar, sonra ayarlardaki sayı kadar yeni soru gelir.</p>
        <p><b>Sınav provası:</b> Gerçek sınavdaki dağılımla 20 soru (4 coğrafya, 4 kültür, 6 tarih, 6 kurumlar), her soru 2 puan. Resmi kılavuza göre konu bölümünden en az 20/40 ve toplamda (Yunanca dil bölümüyle birlikte) en az 70/100 gerekir. Çok parçalı sorularda verilen kısmi puan bizim tahminimizdir.</p>
        <p><b>Gizlilik:</b> İlerlemen yalnızca bu cihazdaki tarayıcıda saklanır; sunucuya hiçbir şey gönderilmez. Ayarlardan yedek alıp başka cihaza taşıyabilirsin.</p>`
      : `
        <p>This site is a free study tool for the subject part (Geography, History, Culture, Institutions) of the <b lang="el">Πιστοποιητικό Επάρκειας Γνώσεων για Πολιτογράφηση (Π.Ε.Γ.Π.)</b> exam taken by applicants for Greek citizenship. All ${count} questions of the official bank are included, with the Greek originals unchanged.</p>
        <h2>Source</h2>
        <p>Questions and official answers: <b lang="el">«Υπουργείο Εσωτερικών – Γενική Γραμματεία Ιθαγένειας – Πλατφόρμα Εξετάσεων Πιστοποιητικού Επάρκειας Γνώσεων για Πολιτογράφηση (Π.Ε.Γ.Π)»</b>, <a href="https://exetaseis-ithageneia.ypes.gr" target="_blank" rel="noopener">https://exetaseis-ithageneia.ypes.gr</a> (Τράπεζα θεμάτων → Γενική κατηγορία). ${esc(t("bankVersion"))} Always check the current bank on the official site before your exam.</p>
        <h2>Content we added</h2>
        <p>The Turkish and English translations, maps (drawn from public-domain Natural Earth data), interactive question formats, notes and the mock exam are this site's own content, not official material. If a translation looks wrong, the Greek original prevails. Photos used by some questions are not shown for copyright reasons.</p>
        <h2>Not official</h2>
        <p>${esc(t("footerDisclaimer"))}</p>
        <h2>How it works</h2>
        <p><b>Spaced repetition:</b> after each question you rate how hard it was. Questions you know come back less and less often (1 day, 3 days, a week, …); the ones you struggle with come back sooner. Each day you get your due reviews first, then the number of new questions set in Settings.</p>
        <p><b>Mock exam:</b> 20 questions with the real distribution (4 geography, 4 culture, 6 history, 6 institutions), 2 points each. Per the official guide you need at least 20/40 in the subject part and at least 70/100 overall (including the Greek language part). Partial credit on multi-part questions is our own estimate.</p>
        <p><b>Privacy:</b> your progress is stored only in this browser on this device; nothing is sent to a server. You can export a backup in Settings.</p>`}
      ${imageCreditsHtml()}
      <h2 id="changes">${esc(t("changesTitle"))}</h2>
      ${(window.APP_CHANGES || []).map(r => `<div><h3 style="margin-bottom:.2rem">${esc(t("version", { v: r.v }))} <span class="small muted">· ${esc(r.date)}</span>${r.v === window.APP_VERSION ? ' <span class="pill ok">✓</span>' : ""}</h3>
        <ul style="margin:.2rem 0 0;padding-left:1.2rem">${(r[I18N.lang] || r.tr).map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}
    </div>`);
    if (params && params.get("changes")) setTimeout(() => document.getElementById("changes").scrollIntoView({ behavior: "smooth" }), 30);
  }

  // ======================= LESSONS =======================
  const LES = () => window.LESSONS || {};
  // lesson language: "tr" | "en" | "el" | "el+" (Greek with the interface-language translation under it)
  const lessonLang = () => Store.setting("lessonLang") || I18N.lang;
  const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  const plain = s => String(s || "").replace(/\*\*/g, "");
  // say = put a 🔊 right after the Greek sentence (before its translation line)
  function rich(T, say) {
    const L = lessonLang();
    if ((L === "el" || L === "el+") && T.el) {
      return `<span lang="el">${fmt(T.el)}</span>${say ? sayBtn(T) : ""}` + (L === "el+" ? `<span class="tr-sub">${fmt(c(T))}</span>` : "");
    }
    return fmt(T[L] || c(T));
  }
  // 🔊 for a Greek paragraph (only when reading in Greek)
  function sayBtn(T) {
    const L = lessonLang();
    return (L === "el" || L === "el+") && T.el && Store.setting("voice") && "speechSynthesis" in window
      ? ` <button class="speak" type="button" data-say="${esc(plain(T.el))}" aria-label="${esc(t("listen"))}">🔊</button>` : "";
  }
  function lessonLangSeg() {
    const cur = lessonLang();
    const opts = [["tr", "Türkçe"], ["en", "English"], ["el", "Ελληνικά"], ["el+", "Ελληνικά + " + (I18N.lang === "en" ? "EN" : "TR")]];
    return `<div class="row lesson-lang"><span class="small muted">${esc(t("lessonLang"))}</span>
      <div class="seg" id="lessonLang">${opts.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${v === cur}">${esc(l)}</button>`).join("")}</div></div>`;
  }
  function bindLessonLang(rerender) {
    const seg = document.getElementById("lessonLang");
    if (seg) seg.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      Store.setting("lessonLang", b.dataset.v);
      const y = window.scrollY; rerender(); window.scrollTo(0, y);
    });
  }
  // one delegated listener for every lesson 🔊 button (views re-render, so don't bind per render)
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-say]");
    if (b) Cards.speak(b.dataset.say);
  });
  function titleHtml(G) {
    const L = lessonLang();
    return L === "el" || L === "el+"
      ? { main: esc(G.el), sub: esc(c(G)), mainLang: ' lang="el"' }
      : { main: esc(G[L] || c(G)), sub: esc(G.el), subLang: ' lang="el"' };
  }

  function learn(params) {
    const subj = params.get("s"), secId = params.get("sec");
    const les = subj && LES()[subj];
    if (!les) return learnIndex();
    const sec = secId && les.sections.find(x => x.id === secId);
    if (!sec) return learnToc(subj, les);
    return learnSection(subj, les, sec);
  }

  // lessons also include the grammar course, which has no exam questions
  const LSUBJECTS = SUBJECTS.concat([{ id: "gram", icon: "📝", el: "Γραμματική" }]);

  function readCount(les) { return les.sections.filter(x => Store.data.read[x.id]).length; }

  function learnIndex() {
    html(`<h1>📖 ${esc(t("learnTitle"))}</h1>
      <p class="muted">${esc(t("learnIntro"))}</p>
      <div class="grid grid-2">${LSUBJECTS.map(s => {
        const les = LES()[s.id];
        if (!les) return "";
        const n = les.sections.length, r = readCount(les);
        return `<a class="card subject-card" style="--c:var(--${s.id})" href="#/learn?s=${s.id}">
          <span class="row"><span class="ico" aria-hidden="true">${s.icon}</span><span><h3 style="margin:0">${esc(t("subj_" + s.id))}</h3><span class="el-name" lang="el">${esc(s.el)}</span></span></span>
          <span class="small muted">${esc(c(les.intro))}</span>
          <div class="bar"><span class="seg-mature" style="width:${100 * r / n}%"></span></div>
          <span class="meta"><span>${r}/${n} ${esc(t("sectionsRead"))}</span></span>
        </a>`;
      }).join("")}</div>
      <p class="small muted" style="margin-top:1rem">${esc(t("learnNote"))}</p>`);
  }

  function learnToc(subj, les) {
    const s = LSUBJECTS.find(x => x.id === subj);
    const next = les.sections.find(x => !Store.data.read[x.id]) || les.sections[0];
    html(`<div class="lesson">
      <div class="card" style="border-top:4px solid var(--${subj});margin-bottom:1rem">
        <div class="row"><span style="font-size:1.6rem">${s.icon}</span><div><h1 style="margin:0">${esc(t("subj_" + subj))}</h1><div class="muted" lang="el">${esc(s.el)}</div></div></div>
        <p style="margin-top:.8rem">${rich(les.intro)}</p>
        ${lessonLangSeg()}
        <div class="row" style="margin-top:.8rem">
          <a class="btn btn-primary" href="#/learn?s=${subj}&sec=${next.id}">▶ ${esc(readCount(les) ? t("continueLesson") : t("readLesson"))}</a>
          ${subj !== "gram" ? `<a class="btn" href="#/study?s=${subj}">${esc(t("studySubject"))}</a>` : ""}
        </div>
      </div>
      <h2>${esc(t("toc"))}</h2>
      <div class="toc">${les.sections.map((x, i) => `<a class="card" href="#/learn?s=${subj}&sec=${x.id}">
          ${x.cover ? `<img class="toc-thumb" src="${esc(x.cover.file)}" alt="" loading="lazy">` : `<span class="ic" aria-hidden="true">${x.icon || "•"}</span>`}
          <span><b${titleHtml(x.title).mainLang || ""}>${i + 1}. ${titleHtml(x.title).main}</b><span class="s">${rich(x.summary)}</span></span>
          ${Store.data.read[x.id] ? `<span class="pill ok">✓ ${Store.data.quiz[x.id] ? Store.data.quiz[x.id].best + "/" + SectionQuiz.N : esc(t("readDone"))}</span>` : Store.data.quiz[x.id] && Store.data.quiz[x.id].needReread ? `<span class="pill bad">🔁 ${esc(t("quizRereadShort"))}</span>` : `${x.questions.length ? `<span class="small muted">${x.questions.length} ${esc(t("questions"))}</span>` : ""}`}
        </a>`).join("")}</div>
      <p class="small muted" style="margin-top:1rem">${esc(t("learnNote"))}</p>
    </div>`);
    bindLessonLang(() => learnToc(subj, les));
  }

  // pictures: caption teaches (name + key fact), credit line satisfies the CC licences; tap to enlarge
  function capOf(im) { const L = lessonLang(); return im.caption ? (L === "el" || L === "el+" ? im.caption.el : (im.caption[L] || c(im.caption))) : ""; }
  function figureHtml(im, cls = "") {
    return `<figure class="l-fig ${cls}"><button type="button" class="l-zoom" data-zoom="${esc(im.file)}" aria-label="${esc(t("zoomImage"))}">
        <img src="${esc(im.file)}" alt="${esc(capOf(im))}" width="${im.w || ""}" height="${im.h || ""}" loading="lazy" decoding="async"></button>
      <figcaption><span class="l-cap">${esc(capOf(im))}</span><span class="img-credit">📷 ${esc(im.author)} · <a href="${esc(im.source)}" target="_blank" rel="noopener">${esc(im.license)}</a></span></figcaption></figure>`;
  }
  function galleryHtml(items) {
    const n = items.length;
    return `<div class="l-gallery ${n === 1 ? "one" : n === 2 ? "two" : ""}">${items.map(im => figureHtml(im)).join("")}</div>`;
  }
  // full-screen viewer for lesson pictures (arrow keys / swipe-free buttons to move through the page's pictures)
  function openZoom(src) {
    const imgs = [...app().querySelectorAll(".l-zoom img")];
    let i = Math.max(0, imgs.findIndex(x => x.getAttribute("src") === src));
    const box = document.createElement("div");
    box.className = "lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
    const draw = () => {
      const im = imgs[i], cap = im.closest("figure").querySelector(".l-cap");
      box.innerHTML = `<button class="lb-x" type="button" aria-label="${esc(t("readerClose"))}">✕</button>
        ${imgs.length > 1 ? `<button class="lb-prev" type="button" aria-label="←">‹</button><button class="lb-next" type="button" aria-label="→">›</button>` : ""}
        <figure><img src="${esc(im.getAttribute("src"))}" alt=""><figcaption>${cap ? esc(cap.textContent) : ""}<span class="small"> · ${i + 1}/${imgs.length}</span></figcaption></figure>`;
    };
    const close = () => { box.remove(); document.removeEventListener("keydown", onKey); };
    const go = d => { i = (i + d + imgs.length) % imgs.length; draw(); };
    const onKey = e => { if (e.key === "Escape") close(); else if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1); };
    box.addEventListener("click", e => {
      if (e.target.closest(".lb-prev")) go(-1); else if (e.target.closest(".lb-next")) go(1);
      else if (e.target.closest(".lb-x") || e.target === box) close();
    });
    document.addEventListener("keydown", onKey);
    draw(); document.body.appendChild(box);
  }
  document.addEventListener("click", e => { const z = e.target.closest("[data-zoom]"); if (z) openZoom(z.dataset.zoom); });

  // example sentences: always Greek, with the translation (lesson language, or interface language when reading in Greek)
  function examplesHtml(b) {
    const L = lessonLang(), tl = L === "tr" || L === "en" ? L : I18N.lang;
    const voice = Store.setting("voice") && "speechSynthesis" in window;
    return `<div class="examples"><h3>✍️ ${esc(b.title ? (b.title[tl] || c(b.title)) : t("examplesH"))}</h3><ul class="ex-list">${b.items.map(x => `<li class="ex-item">
        <span lang="el" class="ex-el">${fmt(x.el)}</span>${voice ? ` <button class="speak" type="button" data-say="${esc(plain(x.el))}" aria-label="${esc(t("listen"))}">🔊</button>` : ""}
        <span class="tr-sub" lang="${tl}">${fmt(x[tl] || c(x))}</span>${x.note ? `<span class="ex-note">💡 ${fmt(x.note[tl] || c(x.note))}</span>` : ""}</li>`).join("")}</ul></div>`;
  }

  function inflTitle(G) {
    const tr = lessonLang() === "el" ? "" : c(G);
    return `<span lang="el">${esc(G.el)}</span>${tr ? ` <span class="small muted" style="font-family:var(--font)">— ${esc(tr)}</span>` : ""}`;
  }

  function blockHtml(b, i) {
    switch (b.type) {
      case "p": return `<p>${rich(b.text, true)}</p>`;
      case "list": return `<ul>${b.items.map(x => `<li>${rich(x, true)}</li>`).join("")}</ul>`;
      case "tip": return `<div class="tip"><b class="tip-label">💡 ${esc(t("tipH"))}:</b> ${rich(b.text, true)}</div>`;
      case "terms": return `<div><h3>${esc(t("glossary"))}</h3><div class="terms">${b.items.map(x => `<div class="term"><span class="el" lang="el">${esc(x.el)}</span><small>${esc(c(x))}</small></div>`).join("")}</div></div>`;
      case "timeline": return `<div><h3>${esc(t("timelineH"))}</h3><ul class="timeline">${b.items.map(x => `<li><span class="date">${esc(x.date)}</span>${rich(x.text)}</li>`).join("")}</ul></div>`;
      case "table": return `<div style="overflow-x:auto"><table class="table"><thead><tr>${b.head.map(h => `<th>${rich(h)}</th>`).join("")}</tr></thead><tbody>${b.rows.map(r => `<tr>${r.map(x => `<td>${rich(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      case "map": return `<div data-map="${i}"></div>`;
      case "examples": return examplesHtml(b);
      case "gallery": return galleryHtml(b.items);
      case "exam": return `<div class="exam-facts"><h3>📌 ${esc(t("examFactsH"))}</h3><p class="small muted">${esc(t("examFactsText"))}</p><ul>${b.items.map(x =>
        `<li>${rich(x, true)}${(x.q || []).map(id => { const q = QS().find(z => z.id === id); return q ? ` <a class="pill exam-ref" href="#/browse?id=${id}">${esc(t("subj_" + q.subject))} ${q.n}</a>` : ""; }).join("")}</li>`).join("")}</ul></div>`;
      case "decl": return `<div><div class="infl-title">${inflTitle(b.word)}</div>${b.note ? `<p class="small">${rich(b.note)}</p>` : ""}${Grammar.decl(b.sg, b.pl)}</div>`;
      case "conj": return `<div><div class="infl-title">${inflTitle(b.verb)}</div>${b.note ? `<p class="small">${rich(b.note)}</p>` : ""}${Grammar.conj(b.tenses)}</div>`;
      default: return "";
    }
  }

  let activeReader = null;
  function stopReader() { if (activeReader) { const r = activeReader; activeReader = null; r.stop(); } }

  function learnSection(subj, les, sec) {
    stopReader();
    const idx = les.sections.indexOf(sec);
    // previous / next follow the numbered roadmap (Ders 1 … 66); sections outside it follow their subject
    const road = Roadmap.neighbours(sec.id), lessonNo = Roadmap.numberOf(sec.id);
    const link = id => id ? { id, href: `#/learn?s=${id.split("-")[0]}&sec=${id}` } : null;
    const prev = road ? link(road.prev) : link(les.sections[idx - 1] && les.sections[idx - 1].id);
    const next = road ? link(road.next) : link(les.sections[idx + 1] && les.sections[idx + 1].id);
    const qs = sec.questions.map(id => QS().find(q => q.id === id)).filter(Boolean);
    const drillable = qs.filter(usable);
    const quizRec = Store.data.quiz[sec.id];
    html(`<article class="lesson">
      <div class="row small" style="margin-bottom:.6rem">${lessonNo
        ? `<a href="#/roadmap">🗺️ ${esc(t("roadTitle"))}</a> › <b>${esc(t("roadLesson", { n: lessonNo }))}</b> <span class="muted">/ ${Roadmap.total()} · ${esc(t("subj_" + subj))}</span>`
        : `<a href="#/learn">${esc(t("learnTitle"))}</a> › <a href="#/learn?s=${subj}">${esc(t("subj_" + subj))}</a> › <span class="muted">${idx + 1}/${les.sections.length}</span>`}</div>
      <div class="card">
        <div class="lesson-head"><h1${titleHtml(sec.title).mainLang || ""}>${sec.icon || ""} ${titleHtml(sec.title).main}</h1><div class="el-title"${titleHtml(sec.title).subLang || ""}>${titleHtml(sec.title).sub}</div></div>
        ${sec.cover ? figureHtml(sec.cover, "l-cover") : ""}
        <div class="row" style="margin-top:.8rem;justify-content:space-between">${lessonLangSeg()}${LessonReader.supported() ? `<button class="btn btn-sm" type="button" id="listenBtn">🎧 ${esc(t("listenLesson"))}</button>` : ""}</div>
        ${quizRec && quizRec.needReread ? `<div class="note" style="margin-top:.8rem">🔁 ${esc(t("quizRereadBanner", { s: quizRec.last, n: SectionQuiz.N, p: SectionQuiz.PASS }))}</div>` : ""}
        <div class="lesson-body" style="margin-top:1rem">${sec.blocks.map(blockHtml).join("")}</div>
        <div id="readEnd" aria-hidden="true"></div>
        <div class="actions" style="margin-top:1.4rem">
          ${drillable.length ? `<a class="btn btn-primary" href="#/study?ids=${drillable.map(q => q.id).join(",")}&back=${encodeURIComponent(`#/learn?s=${subj}&sec=${sec.id}`)}">✎ ${esc(t("practiceSection", { n: drillable.length }))}</a>` : ""}
        </div>
        ${qs.length ? `<details style="margin-top:1rem"><summary class="small">${esc(t("relatedQs"))} (${qs.length})</summary>
          <div class="qlist" style="margin-top:.5rem">${qs.map(q => `<a class="qrow" style="padding:.35rem 0" href="#/browse?id=${q.id}"><span class="num" style="color:var(--${q.subject})">${q.n}</span><span><span class="t-el" lang="el">${esc(trim(q.prompt.el, 110))}</span><span class="t-tr">${esc(trim(c(q.prompt), 110))}</span></span><span></span></a>`).join("")}</div>
        </details>` : ""}
        ${sec.sources && sec.sources.length ? `<div class="sources">${esc(t("sourcesH"))}: ${sec.sources.map(u => /^https?:\/\//.test(u) ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\//, ""))}</a>` : esc(u)).join(" · ")}</div>` : ""}
      </div>
      <div class="lesson-nav">
        ${prev ? `<a class="btn" href="${prev.href}">${esc(t(lessonNo ? "roadPrev" : "prevSection"))}</a>` : "<span></span>"}
        <span class="row">${Store.data.read[sec.id] && next ? `<a class="btn" href="${next.href}">${esc(t(lessonNo ? "roadNextBtn" : "nextSection"))}</a>` : ""}
        <button class="btn btn-primary" id="quizBtn" disabled>🔒 ${esc(t("quizLocked"))}</button></span>
      </div>
      <p class="small muted" style="margin-top:1rem">${esc(t("learnNote"))}</p>
    </article>`);
    sec.blocks.forEach((b, i) => {
      if (b.type !== "map") return;
      const slot = app().querySelector(`[data-map="${i}"]`);
      const m = GreeceMap.create(b.places, {});
      m.reveal();
      slot.appendChild(m.node);
    });
    bindLessonLang(() => learnSection(subj, les, sec));
    const listenBtn = document.getElementById("listenBtn");
    if (listenBtn) listenBtn.addEventListener("click", () => {
      if (activeReader) return stopReader();
      listenBtn.textContent = "⏹ " + t("stopListening");
      activeReader = LessonReader.create(app().querySelector(".lesson"), {
        lessonLang: lessonLang(), uiLang: I18N.lang,
        labels: { voice: t("setVoiceChoice"), auto: t("voiceAuto"), female: t("voiceFemale"), male: t("voiceMale"), noGender: t("voiceNoGender"), listen: t("listenLesson"), prev: t("readerPrev"), next: t("readerNext"), play: t("readerPlay"), pause: t("readerPause"), speed: t("readerSpeed"), close: t("readerClose"), noVoice: t("readerNoVoice") },
        onStop() { activeReader = null; if (listenBtn.isConnected) listenBtn.textContent = "🎧 " + t("listenLesson"); }
      });
    });
    // the section quiz unlocks once the learner has scrolled to the end of the lesson
    const quizBtn = document.getElementById("quizBtn");
    const unlock = () => { quizBtn.disabled = false; quizBtn.textContent = "📝 " + t(Store.data.read[sec.id] ? "quizRetake" : "quizStart", { n: SectionQuiz.N }); };
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { unlock(); io.disconnect(); } });
    io.observe(document.getElementById("readEnd"));
    quizBtn.addEventListener("click", () => {
      io.disconnect();
      stopReader();
      html(`<div class="lesson"><div class="row small" style="margin-bottom:.6rem"><a href="#/learn?s=${subj}&sec=${sec.id}&back=1">← ${esc(c(sec.title))}</a></div>
        <h2>📝 ${esc(t("quizTitle"))}: ${esc(c(sec.title))}</h2><p class="small muted">${esc(t("quizRule", { n: SectionQuiz.N, p: SectionQuiz.PASS }))}</p><div id="quizSlot"></div></div>`);
      SectionQuiz.run(document.getElementById("quizSlot"), {
        les, sec,
        onPass() {
          Store.data.read[sec.id] = Date.now(); Store.save();
          location.hash = next ? next.href : (lessonNo ? "#/roadmap" : `#/learn?s=${subj}`);
        },
        onFail() {
          // not passed: the section counts as unread until the quiz is passed after re-reading
          delete Store.data.read[sec.id]; Store.save();
          learnSection(subj, les, sec); window.scrollTo(0, 0);
        }
      });
    });
    return () => { io.disconnect(); stopReader(); };
  }

  function lessonImageCredits() {
    const rows = [];
    Object.values(LES()).forEach(les => les.sections.forEach(sec => {
      if (sec.cover) rows.push({ sec, im: sec.cover });
      sec.blocks.forEach(b => { if (b.type === "gallery") b.items.forEach(im => rows.push({ sec, im })); });
    }));
    if (!rows.length) return "";
    return `<details><summary><b>${esc(t("lessonImageCredits"))}</b> (${rows.length})</summary><ul class="small" style="padding-left:1.1rem">${rows.map(({ sec, im }) =>
      `<li><a href="#/learn?s=${sec.id.split("-")[0]}&sec=${sec.id}">${esc(c(sec.title))}</a> — ${esc(c(im.caption))} · ${esc(im.author)} · <a href="${esc(im.source)}" target="_blank" rel="noopener">${esc(im.license)}</a></li>`).join("")}</ul></details>`;
  }

  function imageCreditsHtml() {
    const rows = QS().filter(q => q.images && q.images.length).flatMap(q => q.images.map(im => ({ q, im })));
    if (!rows.length) return lessonImageCredits();
    return `<h2>${esc(t("imageCredits"))}</h2><p class="small muted">${esc(t("imageCreditsText"))}</p>
      ${lessonImageCredits()}
      <ul class="small" style="padding-left:1.1rem">${rows.map(({ q, im }) => `<li><a href="#/browse?id=${q.id}">${esc(t("subj_" + q.subject))} ${q.n}${im.slot ? " · Εικ. " + esc(im.slot) : ""}</a> — ${esc(c(im.subject))} · ${esc(im.author)} · <a href="${esc(im.source)}" target="_blank" rel="noopener">${esc(im.license)}</a>${im.licenseUrl ? ` (<a href="${esc(im.licenseUrl)}" target="_blank" rel="noopener">${esc(t("licenseText"))}</a>)` : ""}</li>`).join("")}</ul>`;
  }

  function notFound() { html(`<div class="card empty"><div class="big">🧭</div><p>${esc(t("notFound"))}</p><a class="btn" href="#/">${esc(t("backHome"))}</a></div>`); }

  window.Views = { home, study, browse, exam, stats, settings, about, learn, notFound, toast };
})();
