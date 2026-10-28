// Renders one question of any type. Used by study, exam and browse views.
// Cards.render(q, opts) -> controller
//   opts.mode: "study" | "exam" | "browse"
//   opts.onAnswer(ctrl): called when the learner has answered enough to be checked
// controller: { node, answer, isAnswered(), evaluate() -> {ok, part, self}, showFeedback(), showAnswer() }
(function () {
  const LETTERS = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞ";
  const t = (k, v) => I18N.t(k, v);
  const c = L => I18N.c(L);

  // escape, then allow **bold**
  function rich(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }
  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }
  function h(html) { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; }
  // Greek text + translation line (translation hidden unless the card shows translations)
  function bi(L, cls = "") {
    return `<span class="item-el ${cls}" lang="el">${esc(L.el)}</span>${trLine(L, "item-tr")}`;
  }
  // translation line, skipped when it would just repeat the Greek (numbers, years, names)
  function trLine(L, cls) {
    const tr = c(L);
    return tr && tr.trim() !== L.el.trim() ? `<span class="${cls} tr-x">${esc(tr)}</span>` : "";
  }

  function speak(text) { Voices.say(text, "el-GR", 0.92); }
  function canSpeak() { return Store.setting("voice") && "speechSynthesis" in window; }

  function header(q, mode) {
    const st = SRS.stateOf(q.id);
    let badge = "";
    if (mode === "study") {
      const cat = SRS.category(st);
      badge = cat === "unseen" ? `<span class="pill warn">${t("newCard")}</span>`
        : cat === "learning" ? `<span class="pill">${t("learning")}</span>` : `<span class="pill ok">${t("review")}</span>`;
    }
    const trMode = Store.setting("tr");
    return `
      <div class="qmeta">
        <span class="pill" style="color:var(--${q.subject})">${esc(t("subj_" + q.subject))} · ${q.n}</span>
        <span class="pill">${esc(t("type_" + q.type))}</span>
        ${badge}
        <span class="spacer"></span>
        ${canSpeak() ? `<button class="speak" type="button" data-act="speak" title="${esc(t("listen"))}" aria-label="${esc(t("listen"))}">🔊</button>` : ""}
      </div>
      <p class="qtext" lang="el">${esc(q.prompt.el)}</p>
      <p class="qtrans tr-x">${esc(c(q.prompt))}</p>
      ${trMode === "tap" ? `<button class="reveal-tr" type="button" data-act="tr">${esc(t("showTr"))}</button>` : ""}`;
  }

  // original exam pictures (local copy only) win over the free replacements
  function picturesOf(q) {
    const local = window.LOCAL_IMAGES && window.LOCAL_IMAGES[q.id];
    if (local && local.length) return local.map(e => Object.assign({ local: true }, e));
    return q.images || [];
  }

  function noteHtml(q) {
    // with pictures shown, the old "photo not shown" notes no longer apply
    if (picturesOf(q).length) return "";
    let s = "";
    if (q.image) s += `<div class="note">📷 ${esc(t("imageNote"))}</div>`;
    if (q.note) s += `<div class="note"><b>${esc(t("noteLabel"))}:</b> <span>${esc(c(q.note))}</span></div>`;
    return s;
  }

  // freely licensed replacement pictures; what they show is revealed only after answering
  function figuresHtml(q) {
    const imgs = picturesOf(q);
    if (!imgs.length) return "";
    const one = imgs.length === 1;
    return `<div class="q-figs ${one ? "one" : ""}">${imgs.map(im => `<figure class="q-fig">
        ${im.slot ? `<div class="q-slot" lang="el">Εικ. ${esc(im.slot)}</div>` : ""}
        <img src="${esc(im.file)}" alt="${esc(im.slot ? "Εικ. " + im.slot : t("q"))}" width="${im.w || ""}" height="${im.h || ""}" loading="lazy" decoding="async">
        <figcaption>${im.local ? `<span class="img-credit">📄 ${esc(t("localPicture"))}</span>`
          : `<span class="img-subj">${esc(c(im.subject))}<br></span><span class="img-credit">📷 ${esc(im.author)} · <a href="${esc(im.source)}" target="_blank" rel="noopener">${esc(im.license)}</a></span>`}</figcaption>
      </figure>`).join("")}</div>`;
  }

  // ---------- answer box (official answer) ----------
  function answerHtml(q) {
    let body = "";
    switch (q.type) {
      case "mc": {
        const o = q.options[q.answer];
        body = `<div class="a-el" lang="el">${LETTERS[q.answer]}. ${esc(o.el)}</div><div class="a-tr">${esc(c(o))}</div>`;
        break;
      }
      case "tf":
        body = `<ol>${q.items.map(it => `<li><b>${it.answer ? "Σ" : "Λ"}</b> – <span lang="el">${esc(it.text.el)}</span><div class="a-tr">${esc(c(it.text))}</div>${!it.answer && it.fix
          ? `<div class="a-fix">✓ <span lang="el">${rich(it.fix.el)}</span><div class="a-tr">${rich(c(it.fix))}</div></div>` : ""}</li>`).join("")}</ol>`;
        break;
      case "match":
        body = `<ul>${q.pairs.map(([l, r]) => `<li><span lang="el"><b>${l + 1}</b> ${esc(q.left[l].el)} → <b>${LETTERS[r]}</b> ${esc(q.right[r].el)}</span><div class="a-tr">${esc(c(q.left[l]))} → ${esc(c(q.right[r]))}</div></li>`).join("")}</ul>`;
        break;
      case "fill":
        body = `<ol>${q.answers.map(a => `<li><span lang="el">${esc(a.el)}</span><div class="a-tr">${esc(c(a))}</div></li>`).join("")}</ol>`;
        break;
      case "open":
        body = q.items && q.items.length
          ? `${q.need ? `<p class="small muted">${esc(t("needN", { n: q.need }))}</p>` : ""}<ul>${q.items.map(a => `<li><span lang="el">${esc(a.el)}</span><div class="a-tr">${esc(c(a))}</div></li>`).join("")}</ul>`
            + (q.answer ? `<details class="small" style="margin-top:.4rem"><summary>${esc(t("officialAnswer"))}</summary><div class="a-el" lang="el">${esc(q.answer.el)}</div><div class="a-tr">${esc(c(q.answer))}</div></details>` : "")
          : `<div class="a-el" lang="el">${esc(q.answer.el)}</div><div class="a-tr">${esc(c(q.answer))}</div>`;
        break;
      case "map":
        body = `${q.need ? `<p class="small muted">${esc(t("needN", { n: q.need }))}</p>` : ""}<ol>${q.places.map(p => `<li><span lang="el">${esc(p.name.el)}</span> <span class="a-tr">— ${esc(c(p.name))}</span></li>`).join("")}</ol>`
          + (q.answer ? `<div class="a-tr">${esc(c(q.answer))}</div>` : "");
        break;
    }
    return `<div class="answer-box fade-in"><h3>${esc(t("officialAnswer"))}</h3>${body}</div>`;
  }

  // ---------- type renderers ----------
  function renderMC(q, ctl) {
    const box = h(`<div class="options"></div>`);
    q.options.forEach((o, i) => {
      const b = h(`<button class="opt" type="button" data-i="${i}"><span class="letter">${LETTERS[i]}</span><span><span class="o-el" lang="el">${esc(o.el)}</span>${trLine(o, "o-tr")}</span></button>`);
      b.addEventListener("click", () => {
        if (ctl.locked) return;
        ctl.answer = i;
        box.querySelectorAll(".opt").forEach(x => x.setAttribute("aria-pressed", x === b));
        box.querySelectorAll(".opt").forEach(x => x.classList.toggle("picked", x === b));
        ctl.changed();
      });
      box.appendChild(b);
    });
    ctl.evaluate = () => ({ ok: ctl.answer === q.answer, part: ctl.answer === q.answer ? 1 : 0 });
    ctl.isAnswered = () => ctl.answer != null;
    ctl.paint = () => {
      box.querySelectorAll(".opt").forEach((x, i) => {
        x.disabled = true;
        if (i === q.answer) x.classList.add("correct");
        else if (i === ctl.answer) x.classList.add("wrong");
      });
    };
    ctl.restore = () => { if (ctl.answer != null) box.querySelectorAll(".opt")[ctl.answer].classList.add("picked"); };
    return box;
  }

  function renderTF(q, ctl) {
    ctl.answer = ctl.answer || q.items.map(() => null);
    const box = h(`<div class="tf-list"></div>`);
    q.items.forEach((it, i) => {
      const row = h(`<div class="tf-item"><div><span class="small muted">${i + 1}.</span> ${bi(it.text)}<span class="fix"></span></div>
        <div class="tf-btns" role="group"><button type="button" data-v="1" aria-pressed="false">Σ <small class="muted">${esc(t("true"))}</small></button><button type="button" data-v="0" aria-pressed="false">Λ <small class="muted">${esc(t("false"))}</small></button></div></div>`);
      row.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
        if (ctl.locked) return;
        ctl.answer[i] = b.dataset.v === "1";
        row.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
        ctl.changed();
      }));
      box.appendChild(row);
    });
    const okCount = () => q.items.filter((it, i) => ctl.answer[i] === it.answer).length;
    ctl.evaluate = () => ({ ok: okCount() === q.items.length, part: okCount() / q.items.length });
    ctl.isAnswered = () => ctl.answer.every(v => v != null);
    ctl.paint = () => {
      box.querySelectorAll(".tf-item").forEach((row, i) => {
        const it = q.items[i], good = ctl.answer[i] === it.answer;
        row.classList.add(good ? "correct" : "wrong");
        row.querySelectorAll("button").forEach(b => b.disabled = true);
        const f = row.querySelector(".fix");
        f.className = "fix " + (good ? "ok" : "bad");
        f.textContent = good ? "✓" : `✗ ${t("correctIs")} ${it.answer ? "Σ – " + t("true") : "Λ – " + t("false")}`;
        // false statements: show what is actually right
        if (!it.answer && it.fix && !row.querySelector(".tf-fix")) {
          f.insertAdjacentHTML("afterend", `<span class="tf-fix">✓ ${esc(t("correctVersion"))}: <span lang="el">${rich(it.fix.el)}</span><span class="item-tr">${rich(c(it.fix))}</span></span>`);
        }
      });
    };
    ctl.restore = () => box.querySelectorAll(".tf-item").forEach((row, i) => {
      const v = ctl.answer[i];
      if (v != null) row.querySelector(`button[data-v="${v ? 1 : 0}"]`).setAttribute("aria-pressed", "true");
    });
    return box;
  }

  function renderMatch(q, ctl) {
    ctl.answer = ctl.answer || q.left.map(() => null);
    const box = h(`<div></div>`);
    const ref = h(`<div class="card" style="box-shadow:none;background:var(--surface-2);padding:.7rem .9rem;margin-top:1rem"><div class="small muted" style="margin-bottom:.3rem">ΣΤΗΛΗ ΙΙ</div></div>`);
    q.right.forEach((r, i) => ref.appendChild(h(`<div style="margin:.15rem 0"><b>${LETTERS[i]}.</b> ${bi(r)}</div>`)));
    const list = h(`<div class="match-list"></div>`);
    q.left.forEach((l, i) => {
      const opts = q.right.map((r, j) => `<option value="${j}">${LETTERS[j]}. ${esc(r.el)}</option>`).join("");
      const row = h(`<div class="match-item"><div><b>${i + 1}.</b> ${bi(l)}<span class="fix"></span></div>
        <select class="sel" aria-label="${i + 1}"><option value="">${esc(t("chooseMatch"))}</option>${opts}</select></div>`);
      const sel = row.querySelector("select");
      sel.addEventListener("change", () => { ctl.answer[i] = sel.value === "" ? null : +sel.value; ctl.changed(); });
      list.appendChild(row);
    });
    box.appendChild(ref); box.appendChild(list);
    const want = i => q.pairs.filter(p => p[0] === i).map(p => p[1]);
    const okCount = () => q.left.filter((_, i) => want(i).includes(ctl.answer[i])).length;
    ctl.evaluate = () => ({ ok: okCount() === q.left.length, part: okCount() / q.left.length });
    ctl.isAnswered = () => ctl.answer.every(v => v != null);
    ctl.paint = () => list.querySelectorAll(".match-item").forEach((row, i) => {
      const good = want(i).includes(ctl.answer[i]);
      row.classList.add(good ? "correct" : "wrong");
      row.querySelector("select").disabled = true;
      const f = row.querySelector(".fix");
      f.className = "fix " + (good ? "ok" : "bad");
      f.textContent = good ? "✓" : `✗ ${t("correctIs")} ${want(i).map(j => LETTERS[j] + ". " + q.right[j].el).join(" / ")}`;
    });
    ctl.restore = () => list.querySelectorAll("select").forEach((s, i) => { if (ctl.answer[i] != null) s.value = ctl.answer[i]; });
    return box;
  }

  function blanksHtml(text) {
    return esc(text).replace(/\((\d+)\)\s*_{2,}/g, '<span class="blank">($1)</span>');
  }

  function renderFill(q, ctl) {
    const box = h(`<div></div>`);
    box.appendChild(h(`<div><div class="fill-text" lang="el">${blanksHtml(q.text.el)}</div><div class="qtrans tr-x">${blanksHtml(c(q.text))}</div></div>`));
    if (!q.bank || !q.bank.length) return selfAssess(q, ctl, box);
    ctl.answer = ctl.answer || q.answers.map(() => null);
    const list = h(`<div class="fill-list"></div>`);
    q.answers.forEach((_, i) => {
      const opts = q.bank.map((b, j) => `<option value="${j}">${esc(b.el)}</option>`).join("");
      const row = h(`<div class="fill-item"><b>(${i + 1})</b><div><select class="sel" aria-label="(${i + 1})"><option value="">${esc(t("chooseBlank"))}</option>${opts}</select><span class="fix"></span></div></div>`);
      const sel = row.querySelector("select");
      sel.addEventListener("change", () => { ctl.answer[i] = sel.value === "" ? null : +sel.value; ctl.changed(); });
      list.appendChild(row);
    });
    const bankBox = h(`<div class="bank"></div>`);
    q.bank.forEach(b => bankBox.appendChild(h(`<span lang="el" title="${esc(c(b))}">${esc(b.el)}</span>`)));
    box.appendChild(bankBox); box.appendChild(list);
    const norm = s => String(s).normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
    const good = i => ctl.answer[i] != null && norm(q.bank[ctl.answer[i]].el) === norm(q.answers[i].el);
    const okCount = () => q.answers.filter((_, i) => good(i)).length;
    ctl.evaluate = () => ({ ok: okCount() === q.answers.length, part: okCount() / q.answers.length });
    ctl.isAnswered = () => ctl.answer.every(v => v != null);
    ctl.paint = () => list.querySelectorAll(".fill-item").forEach((row, i) => {
      row.classList.add(good(i) ? "correct" : "wrong");
      row.querySelector("select").disabled = true;
      const f = row.querySelector(".fix");
      f.className = "fix " + (good(i) ? "ok" : "bad");
      f.textContent = good(i) ? "✓" : `✗ ${t("correctIs")} ${q.answers[i].el}`;
    });
    ctl.restore = () => list.querySelectorAll("select").forEach((s, i) => { if (ctl.answer[i] != null) s.value = ctl.answer[i]; });
    return box;
  }

  // open questions (and fill without a word bank): write/think, reveal, self-assess
  function selfAssess(q, ctl, box) {
    box = box || h(`<div></div>`);
    if (ctl.mode === "exam") {
      const ta = h(`<textarea class="sel" rows="4" style="width:100%;margin-top:1rem;font-family:var(--font-el)" lang="el" placeholder="…"></textarea>`);
      ta.addEventListener("input", () => { ctl.answer = ta.value; ctl.changed(); });
      box.appendChild(ta);
      ctl.restore = () => { if (ctl.answer) ta.value = ctl.answer; };
      ctl.lockInput = () => { ta.readOnly = true; };
    }
    ctl.self = true;
    ctl.evaluate = () => ({ ok: null, part: null, self: true });
    ctl.isAnswered = () => ctl.mode === "exam" ? !!(ctl.answer && String(ctl.answer).trim()) : true;
    ctl.paint = () => { ctl.lockInput && ctl.lockInput(); };
    return box;
  }

  function renderMap(q, ctl) {
    const box = h(`<div></div>`);
    const list = h(`<ul class="place-list"></ul>`);
    const map = GreeceMap.create(q.places, {
      guess: ctl.mode !== "browse",
      onChange(state) {
        list.querySelectorAll("li").forEach((li, i) => li.classList.toggle("active", i === state.current && !state.revealed));
        ctl.answer = state.guesses.slice();
        ctl.changed();
      }
    });
    q.places.forEach((p, i) => {
      const li = h(`<li${i === 0 ? ' class="active"' : ""}><span class="num">${i + 1}</span><span>${bi(p.name)}<span class="d"></span></span></li>`);
      li.addEventListener("click", () => map.select(i));
      list.appendChild(li);
    });
    if (ctl.mode !== "browse") box.appendChild(h(`<p class="small muted" style="margin:.8rem 0 0">${esc(t("mapHint"))}</p>`));
    box.appendChild(list);
    box.appendChild(map.node);
    ctl.map = map;
    const allGuessed = () => map.state.guesses.every(Boolean);
    const anyGuessed = () => map.state.guesses.some(Boolean);
    ctl.evaluate = () => {
      if (!anyGuessed()) return { ok: null, part: null, self: true };
      const res = map.results();
      const need = q.need || q.places.length;
      const ok = res.filter(r => r && r.ok).length;
      return { ok: ok >= need, part: Math.min(1, ok / need) };
    };
    ctl.isAnswered = () => ctl.mode === "exam" ? allGuessed() : true;
    ctl.paint = () => {
      const res = map.reveal();
      list.querySelectorAll("li").forEach((li, i) => {
        li.classList.remove("active");
        const r = res[i];
        if (r) li.querySelector(".d").textContent = ` · ${r.ok ? "✓" : "✗"} ${t("kmAway", { km: r.km })}`;
      });
    };
    ctl.restore = () => {
      if (Array.isArray(ctl.answer)) { map.state.guesses = ctl.answer.slice(); }
    };
    if (ctl.mode === "browse") map.reveal();
    return box;
  }

  function render(q, opts = {}) {
    const ctl = {
      q, mode: opts.mode || "study", answer: opts.answer ?? null, locked: false, self: false,
      changed() { opts.onChange && opts.onChange(ctl); }
    };
    const trMode = Store.setting("tr");
    const node = h(`<article class="card qcard fade-in ${trMode === "always" ? "show-tr" : ""}"></article>`);
    node.innerHTML = header(q, ctl.mode) + figuresHtml(q);
    let body;
    switch (q.type) {
      case "mc": body = renderMC(q, ctl); break;
      case "tf": body = renderTF(q, ctl); break;
      case "match": body = renderMatch(q, ctl); break;
      case "fill": body = renderFill(q, ctl); break;
      case "map": body = renderMap(q, ctl); break;
      default: body = selfAssess(q, ctl);
    }
    node.appendChild(body);
    const after = h(`<div class="after"></div>`);
    node.appendChild(after);
    ctl.restore && ctl.restore();

    node.addEventListener("click", e => {
      const a = e.target.closest("[data-act]");
      if (!a) return;
      if (a.dataset.act === "speak") speak(q.prompt.el);
      if (a.dataset.act === "tr") { node.classList.toggle("show-tr"); }
    });

    ctl.node = node;
    ctl.showTranslations = () => { if (Store.setting("tr") !== "never") node.classList.add("show-tr"); };
    ctl.showAnswer = () => {
      ctl.locked = true;
      node.classList.add("answered");
      ctl.paint && ctl.paint();
      if (!after.querySelector(".answer-box") && q.type !== "mc") after.insertAdjacentHTML("beforeend", answerHtml(q));
      if (q.type === "mc" && ctl.answer == null) after.insertAdjacentHTML("beforeend", answerHtml(q));
      after.insertAdjacentHTML("beforeend", noteHtml(q));
      ctl.showTranslations();
    };
    if (ctl.mode === "browse") {
      ctl.locked = true;
      node.classList.add("answered");
      if (q.type === "mc") ctl.paint();
      after.insertAdjacentHTML("beforeend", (q.type === "mc" ? "" : answerHtml(q)) + noteHtml(q));
    }
    return ctl;
  }

  window.Cards = { render, esc, LETTERS, speak, answerHtml, picturesOf };
})();
