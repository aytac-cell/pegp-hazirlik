// Vocabulary trainer. Directions: el→tr, el→en (no picture) and tr→el, en→el (picture shown).
// Each word has two SRS cards: "w:<id>:r" (recognise Greek) and "w:<id>:p" (produce Greek).
(function () {
  const t = (k, v) => I18N.t(k, v);
  const esc = s => Cards.esc(s);
  const W = () => window.WORDS || [];
  const DIRS = ["tr-el", "en-el", "el-tr", "el-en"];
  const app = () => document.getElementById("app");

  function dirOf(params) {
    const d = params.get("dir") || Store.setting("wordsDir") || (I18N.lang === "en" ? "en-el" : "tr-el");
    return DIRS.includes(d) ? d : "tr-el";
  }
  const kindOf = dir => dir.endsWith("-el") ? "p" : "r";      // produce vs recognise
  const cardId = (w, dir) => `w:${w.id}:${kindOf(dir)}`;
  const allWords = lv => W().filter(l => !lv || l.level === lv).flatMap(l => l.cats.flatMap(c => c.words.map(w => Object.assign({ cat: c.id, level: l.level }, w))));
  function dirLabel(d) {
    const n = { el: "Ελληνικά", tr: "Türkçe", en: "English" };
    const [a, b] = d.split("-");
    return `${n[a]} → ${n[b]}`;
  }
  function learnedIn(words, dir) {
    return words.filter(w => { const st = SRS.stateOf(cardId(w, dir)); return st && st.s === "review"; }).length;
  }

  // ---------- index ----------
  function index(params) {
    const dir = dirOf(params), mode = Store.setting("wordsMode") || "mc";
    const now = Date.now();
    const due = allWords().filter(w => SRS.isDue(SRS.stateOf(cardId(w, dir)), now)).length;
    app().innerHTML = `
      <h1>🔤 ${esc(t("wordsTitle"))}</h1>
      <p class="muted">${esc(t("wordsIntro"))}</p>
      <div class="card stack" style="margin-bottom:1rem">
        <div class="field" style="margin:0"><label>${esc(t("wordsDir"))}</label>
          <div class="chips" id="dirs">${DIRS.map(d => `<button class="chip" data-d="${d}" aria-pressed="${d === dir}">${esc(dirLabel(d))}${d.endsWith("-el") ? " 🖼️" : ""}</button>`).join("")}</div>
          <span class="hint">${esc(t("wordsPicHint"))}</span>
        </div>
        <div class="field" style="margin:0"><label>${esc(t("wordsMode"))}</label>
          <div class="seg" id="modes"><button type="button" data-m="mc" aria-pressed="${mode === "mc"}">${esc(t("wordsModeMc"))}</button><button type="button" data-m="flip" aria-pressed="${mode === "flip"}">${esc(t("wordsModeFlip"))}</button></div>
        </div>
        ${due ? `<a class="btn btn-primary" href="#/words?run=due&dir=${dir}">▶ ${esc(t("wordsDue", { n: due }))}</a>` : ""}
      </div>
      ${W().map(l => {
        const ws = allWords(l.level);
        return `<section style="margin-bottom:1.4rem">
          <div class="section-title"><h2>${l.icon} ${esc(I18N.c(l.name))} <span class="pill">${esc(l.cefr)}</span></h2>
            <span class="small muted">${learnedIn(ws, dir)}/${ws.length}</span><span class="spacer"></span>
            <a class="btn btn-sm" href="#/words?run=1&lv=${l.level}&dir=${dir}">▶ ${esc(t("wordsAll"))}</a></div>
          <p class="small muted" style="margin-top:-.4rem">${esc(I18N.c(l.blurb))}</p>
          <div class="grid grid-4">${l.cats.map(c => {
            const cw = c.words.map(w => Object.assign({ cat: c.id }, w)), n = learnedIn(cw, dir);
            return `<a class="card subject-card" style="--c:var(--primary);padding:.8rem .9rem" href="#/words?run=1&lv=${l.level}&cat=${c.id}&dir=${dir}">
              <span class="row" style="gap:.5rem"><span style="font-size:1.4rem">${c.icon}</span><b>${esc(I18N.c(c.name))}</b></span>
              <span class="el-name" lang="el">${esc(c.name.el)}</span>
              <div class="bar"><span class="seg-mature" style="width:${100 * n / c.words.length}%"></span></div>
              <span class="meta"><span>${n}/${c.words.length}</span></span></a>`;
          }).join("")}</div></section>`;
      }).join("")}
      <p class="small muted">${esc(t("wordsNote"))}</p>`;
    app().querySelector("#dirs").addEventListener("click", e => {
      const b = e.target.closest("[data-d]"); if (!b) return;
      Store.setting("wordsDir", b.dataset.d); location.hash = "#/words?dir=" + b.dataset.d;
    });
    app().querySelector("#modes").addEventListener("click", e => {
      const b = e.target.closest("[data-m]"); if (!b) return;
      Store.setting("wordsMode", b.dataset.m);
      app().querySelectorAll("#modes button").forEach(x => x.setAttribute("aria-pressed", x === b));
    });
  }

  // ---------- session ----------
  function session(params) {
    const dir = dirOf(params), lv = params.get("lv"), cat = params.get("cat");
    const [from, to] = dir.split("-");
    const showPic = from !== "el";             // picture only when asked to produce the Greek word
    const mode = Store.setting("wordsMode") || "mc";
    let pool = allWords(lv).filter(w => !cat || w.cat === cat);
    const items = pool.map(w => ({ id: cardId(w, dir), subject: w.cat, w }));
    const queue = params.get("run") === "due"
      ? SRS.buildQueue(items, { newLimit: 0 })
      : SRS.buildQueue(items, { newLimit: 15 });
    // nothing due or new left: practise the set anyway
    if (!queue.length) queue.push(...items.sort(() => Math.random() - .5).slice(0, 15));
    const back = `#/words?dir=${dir}`;
    let done = 0, firstOk = 0, keyHandler = null;
    const first = new Set();
    const levelWords = lvl => allWords(lvl);

    app().innerHTML = `<div class="study-head">
        <a class="btn btn-sm btn-ghost" href="${back}" aria-label="${esc(t("backHome"))}">✕</a>
        <div class="bar"><span id="prog" style="width:0;background:var(--primary)"></span></div>
        <span class="small muted" id="progTxt"></span></div>
      <p class="small muted" style="margin:-.3rem 0 .8rem">${esc(dirLabel(dir))}</p>
      <div id="slot"></div>`;
    const slot = app().querySelector("#slot");

    const say = w => { if (Store.setting("voice")) Cards.speak(w.el); };
    const meaning = w => w[to === "el" ? from : to];

    function show() {
      const total = done + queue.length;
      app().querySelector("#prog").style.width = (100 * done / Math.max(1, total)) + "%";
      app().querySelector("#progTxt").textContent = `${done}/${total}`;
      const it = queue.shift();
      if (!it) return finish();
      const w = it.w, isFirst = !first.has(it.id); first.add(it.id);
      let answered = false, result = null;

      const prompt = from === "el"
        ? `<div class="word-big el" lang="el">${esc(w.el)}</div><div class="muted">${esc(w.pron)}</div>
           <button class="speak" type="button" data-act="say" aria-label="${esc(t("listen"))}">🔊</button>`
        : `${showPic && w.pic ? `<div class="word-pic" aria-hidden="true">${w.pic}</div>` : ""}<div class="word-big">${esc(w[from])}</div>`;

      const node = document.createElement("article");
      node.className = "card qcard fade-in word-card";
      node.innerHTML = `<div class="qmeta"><span class="pill">${esc(catName(w))}</span>${SRS.stateOf(it.id) ? "" : `<span class="pill warn">${esc(t("newCard"))}</span>`}</div>
        <div class="word-prompt">${prompt}</div>
        <div class="w-body"></div><div class="actions"></div>`;
      slot.innerHTML = ""; slot.appendChild(node);
      const body = node.querySelector(".w-body"), actions = node.querySelector(".actions");

      function reveal(ok) {
        answered = true; result = ok;
        const card = `<div class="answer-box fade-in" style="text-align:center">
            ${showPic && w.pic ? `<div class="word-pic sm" aria-hidden="true">${w.pic}</div>` : ""}
            <div class="word-big el" lang="el">${esc(w.el)} <button class="speak" type="button" data-act="say" aria-label="${esc(t("listen"))}">🔊</button></div>
            <div class="muted">[${esc(w.pron)}]</div>
            <div style="margin-top:.3rem">${esc(w.tr)} · <span class="muted">${esc(w.en)}</span></div></div>`;
        body.insertAdjacentHTML("beforeend", card);
        say(w);
        const st = SRS.stateOf(it.id), now = Date.now();
        const btn = (g, cls, label) => `<button type="button" class="${cls}" data-g="${g}">${esc(label)}<small>${esc(SRS.preview(st, g, now))}</small></button>`;
        const fb = ok === true ? `<span class="pill ok">✓ ${esc(t("correct"))}</span>` : ok === false ? `<span class="pill bad">✗ ${esc(t("wrong"))}</span>` : "";
        actions.innerHTML = `<div class="row">${fb}</div>` + (ok === false
          ? `<div class="grades" style="grid-template-columns:1fr">${btn(1, "g-again", t("g_again"))}</div>`
          : ok === true ? `<div class="grades" style="grid-template-columns:repeat(3,1fr)">${btn(2, "g-hard", t("g_hard"))}${btn(3, "g-good", t("g_good"))}${btn(4, "g-easy", t("g_easy"))}</div>`
          : `<div class="grades">${btn(1, "g-again", t("g_again"))}${btn(2, "g-hard", t("g_hard"))}${btn(3, "g-good", t("g_good"))}${btn(4, "g-easy", t("g_easy"))}</div>`);
      }

      if (mode === "mc") {
        // 3 distractors, preferably from the same category
        const same = pool.filter(x => x.id !== w.id && x.cat === w.cat);
        const rest = levelWords(w.level).filter(x => x.id !== w.id && x.cat !== w.cat);
        const pick = [];
        for (const src of [same, rest]) for (const x of src.slice().sort(() => Math.random() - .5)) {
          if (pick.length < 3 && !pick.some(p => answerOf(p) === answerOf(x)) && answerOf(x) !== answerOf(w)) pick.push(x);
        }
        const opts = pick.concat([w]).sort(() => Math.random() - .5);
        body.innerHTML = `<div class="options">${opts.map((o, i) => `<button class="opt" type="button" data-i="${i}"><span class="letter">${i + 1}</span><span class="o-el" ${to === "el" ? 'lang="el"' : ""}>${esc(answerOf(o))}</span></button>`).join("")}</div>`;
        body.querySelectorAll(".opt").forEach((b, i) => b.addEventListener("click", () => {
          if (answered) return;
          const ok = opts[i] === w;
          body.querySelectorAll(".opt").forEach((x, j) => { x.disabled = true; if (opts[j] === w) x.classList.add("correct"); else if (j === i) x.classList.add("wrong"); });
          reveal(ok);
        }));
      } else {
        actions.innerHTML = `<button class="btn btn-primary" data-act="flip">${esc(t("showAnswer"))}</button>`;
      }
      function answerOf(x) { return to === "el" ? x.el : x[to]; }

      function grade(g) {
        const ok = result === true || (result == null && g >= 3);
        if (isFirst && ok) firstOk++;
        const st = SRS.grade(it, g, isFirst && ok, { ownBudget: true });
        done++;
        if (st.s === "learning" && st.due - Date.now() < 20 * SRS.MIN) queue.splice(Math.min(queue.length, 3 + Math.floor(Math.random() * 3)), 0, it);
        show();
      }
      node.addEventListener("click", e => {
        const b = e.target.closest("button"); if (!b) return;
        if (b.dataset.act === "say") say(w);
        else if (b.dataset.act === "flip") reveal(null);
        else if (b.dataset.g) grade(+b.dataset.g);
      });
      keyHandler = e => {
        if (!answered) {
          if (mode === "mc" && /^[1-4]$/.test(e.key)) body.querySelectorAll(".opt")[+e.key - 1]?.click();
          else if (mode !== "mc" && (e.key === "Enter" || e.key === " ")) { reveal(null); e.preventDefault(); }
        } else if (/^[1-4]$/.test(e.key) && actions.querySelector(`[data-g="${e.key}"]`)) grade(+e.key);
        else if (e.key === "Enter") { const b = actions.querySelector(result === false ? '[data-g="1"]' : '[data-g="3"]'); if (b) grade(+b.dataset.g); }
      };
      if (from === "el") say(w);
    }

    function catName(w) {
      const l = W().find(x => x.level === w.level), c = l && l.cats.find(x => x.id === w.cat);
      return c ? I18N.c(c.name) : "";
    }
    function finish() {
      app().innerHTML = `<div class="card empty fade-in"><div class="big">✅</div><h2>${esc(t("sessionDone"))}</h2>
        <p class="muted">${esc(t("sessionDoneText", { n: first.size, c: firstOk }))}</p>
        <div class="row" style="justify-content:center"><a class="btn btn-primary" href="${back}">${esc(t("wordsBack"))}</a>
        <a class="btn" href="#/words?run=1${lv ? "&lv=" + lv : ""}${cat ? "&cat=" + cat : ""}&dir=${dir}">${esc(t("continueStudy"))}</a></div></div>`;
    }
    const onKey = e => { if (!e.target.matches("input, textarea, select") && keyHandler) keyHandler(e); };
    document.addEventListener("keydown", onKey);
    show();
    return () => document.removeEventListener("keydown", onKey);
  }

  function view(params) {
    if (!W().length) { app().innerHTML = `<div class="card empty"><p>${esc(t("loadingFail"))}</p></div>`; return; }
    return params.get("run") ? session(params) : index(params);
  }

  window.WordsView = view;
})();
