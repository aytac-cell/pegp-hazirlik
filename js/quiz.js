// 10-question check after each lesson section. Questions come only from the section itself:
// its authored quiz pool (written from the section's text) and, in grammar sections, the forms in
// its own declension/conjugation tables. Pass mark: 9/10.
(function () {
  const N = 10, PASS = 9;
  const t = (k, v) => I18N.t(k, v);
  const esc = s => Cards.esc(s);
  const c = L => I18N.c(L);
  const L4 = "ΑΒΓΔ";
  const PERSONS = ["εγώ", "εσύ", "αυτός/ή/ό", "εμείς", "εσείς", "αυτοί/ές/ά"];
  const CASES = ["case_nom", "case_gen", "case_acc", "case_voc"];
  const ok = s => typeof s === "string" && s.trim() && s.trim() !== "—";
  const plain = s => String(s || "").replace(/\*\*/g, "");

  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // correct option + up to 3 distinct distractors; opts are {key, html}
  function mc(kind, prompt, correct, pool) {
    const seen = new Set([correct.key]);
    const wrong = shuffle(pool).filter(o => o.key && !seen.has(o.key) && seen.add(o.key)).slice(0, 3);
    if (!wrong.length) return null;
    const opts = shuffle([correct, ...wrong]);
    return { kind, prompt, opts: opts.map(o => o.html), ans: opts.indexOf(correct) };
  }

  // ---------- generators ----------
  // lesson text in the chosen lesson language ("tr" | "en" | "el" | "el+")
  function lt(T) {
    const L = Store.setting("lessonLang") || I18N.lang;
    if ((L === "el" || L === "el+") && T.el) {
      const tr = c(T);
      return `<span lang="el">${esc(plain(T.el))}</span>` + (L === "el+" && tr && tr !== T.el ? `<span class="tr-sub">${esc(plain(tr))}</span>` : "");
    }
    return esc(plain(T[L] || c(T)));
  }

  // the completed Greek sentence with its translation, shown after answering ("Türkçesi" button)
  function meaningHtml(S) {
    if (!S || !S.el) return "";
    const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
    const voice = Store.setting("voice") && "speechSynthesis" in window;
    return `<div class="mean-el" lang="el">${rich(S.el)}${voice ? ` <button class="speak" type="button" data-say="${esc(plain(S.el))}" aria-label="${esc(t("listen"))}">🔊</button>` : ""}</div>
      <div class="mean-tr">${rich(S[I18N.lang] || S.tr || S.en)}</div>`;
  }

  function fromAuthored(sec) {
    return (sec.quiz || []).map(x => {
      const order = shuffle(x.options.map((_, i) => i));     // new option order every time
      return { kind: "text", prompt: lt(x.q), opts: order.map(i => lt(x.options[i])), ans: order.indexOf(x.answer), explain: lt(x.explain), meaning: meaningHtml(x.sentence) };
    });
  }

  function fromDecl(b) {
    const out = [];
    const cells = [];
    ["sg", "pl"].forEach(n => b[n].forEach((f, i) => { if (ok(f)) cells.push({ n, i, f }); }));
    const pool = cells.map(x => ({ key: x.f, html: `<span lang="el">${esc(x.f)}</span>` }));
    cells.forEach(x => {
      if (cells.filter(y => y.f === x.f).length > 1) return;          // ambiguous (same form in two cells)
      const r = mc("form", `<span lang="el" class="quiz-big">${esc(b.word.el)}</span><div>${esc(t(CASES[x.i]))} · ${esc(t(x.n))}</div>`,
        { key: x.f, html: `<span lang="el">${esc(x.f)}</span>` }, pool);
      if (r) out.push(r);
    });
    return out;
  }

  function fromConj(b) {
    const out = [];
    const cells = [];
    b.tenses.forEach(tn => tn.forms.forEach((f, i) => { if (ok(f)) cells.push({ id: tn.id, i, f, imp: tn.id === "imperative" }); }));
    const pool = cells.map(x => ({ key: x.f, html: `<span lang="el">${esc(x.f)}</span>` }));
    cells.forEach(x => {
      if (cells.filter(y => y.f === x.f).length > 1) return;
      const person = x.imp ? ["εσύ", "εσείς"][x.i] : PERSONS[x.i];
      const r = mc("form", `<span lang="el" class="quiz-big">${esc(b.verb.el)}</span><div>${esc(t("tense_" + x.id))} · <span lang="el">${person}</span></div>`,
        { key: x.f, html: `<span lang="el">${esc(x.f)}</span>` }, pool);
      if (r) out.push(r);
    });
    return out;
  }

  function formsFor(sec) {
    const out = [];
    sec.blocks.forEach(b => {
      if (b.type === "decl") out.push(...fromDecl(b));
      if (b.type === "conj") out.push(...fromConj(b));
    });
    return out;
  }

  // 10 questions from this section's own pool (usage questions written from the lesson);
  // questions generated from its inflection tables only fill in if the pool is too small
  function build(les, sec) {
    const text = shuffle(fromAuthored(sec)), forms = shuffle(formsFor(sec));
    const nForms = Math.min(forms.length, Math.max(N - text.length, 0));
    const qs = forms.slice(0, nForms).concat(text.slice(0, N - nForms));
    if (qs.length < N) qs.push(...forms.slice(nForms, nForms + N - qs.length));
    return shuffle(qs).slice(0, N);
  }

  // ---------- UI ----------
  // opts: { les, sec, onPass(score), onFail(score) }
  function run(root, opts) {
    const qs = build(opts.les, opts.sec);
    root._quiz = qs;     // for debugging/tests; not rendered
    let i = 0, score = 0;
    const wrong = [];
    function show() {
      if (i >= qs.length) return finish();
      const q = qs[i];
      root.innerHTML = `<div class="study-head"><div class="bar"><span style="width:${100 * i / qs.length}%;background:var(--primary)"></span></div><span class="small muted">${i + 1}/${qs.length} · ✓ ${score}</span></div>
        <article class="card qcard fade-in show-tr quiz-card">${q.meaning ? `<button class="mean-btn" type="button" hidden aria-expanded="false">${esc(t("meaningBtn"))}</button>` : ""}<div class="quiz-prompt">${q.prompt}</div>
        ${q.meaning ? `<div class="mean-box" hidden>${q.meaning}</div>` : ""}
        <div class="options">${q.opts.map((o, k) => `<button class="opt" type="button"><span class="letter">${L4[k]}</span><span>${o}</span></button>`).join("")}</div>
        <div class="actions"></div></article>`;
      const btns = root.querySelectorAll(".opt"), actions = root.querySelector(".actions");
      const meanBtn = root.querySelector(".mean-btn"), meanBox = root.querySelector(".mean-box");
      if (meanBtn) meanBtn.addEventListener("click", () => {
        meanBox.hidden = !meanBox.hidden;
        meanBtn.setAttribute("aria-expanded", String(!meanBox.hidden));
      });
      btns.forEach((b, k) => b.addEventListener("click", () => {
        if (b.disabled) return;
        btns.forEach((x, j) => { x.disabled = true; if (j === q.ans) x.classList.add("correct"); else if (j === k) x.classList.add("wrong"); });
        if (k === q.ans) score++; else wrong.push(q);
        if (meanBtn) meanBtn.hidden = false;      // only after answering, so it can't give the answer away
        actions.innerHTML = `<div class="row">${k === q.ans ? `<span class="pill ok">✓ ${esc(t("correct"))}</span>` : `<span class="pill bad">✗ ${esc(t("wrong"))}</span>`}</div>
          ${q.explain ? `<div class="note" style="background:var(--primary-soft)">💡 ${q.explain}</div>` : ""}
          <button class="btn btn-primary" type="button">${esc(i + 1 < qs.length ? t("next") + " →" : t("quizSeeResult"))}</button>`;
        const nb = actions.querySelector("button");
        nb.addEventListener("click", () => { i++; show(); });
        nb.focus({ preventScroll: true });
      }));
      root.scrollIntoView({ block: "start" });
    }
    function finish() {
      const pass = score >= PASS;
      const rec = Store.data.quiz[opts.sec.id] || (Store.data.quiz[opts.sec.id] = { tries: 0, best: 0 });
      rec.tries++; rec.last = score; rec.best = Math.max(rec.best, score); rec.at = Date.now(); rec.passed = rec.passed || pass;
      if (!pass) rec.needReread = true; else rec.needReread = false;
      Store.save();
      root.innerHTML = `<div class="card fade-in" style="text-align:center">
        <div class="score-big">${score}<span class="muted" style="font-size:1.4rem">/${qs.length}</span></div>
        <p class="verdict ${pass ? "pass" : "fail"}">${esc(pass ? t("quizPass") : t("quizFail"))}</p>
        <p class="muted">${esc(pass ? t("quizPassText") : t("quizFailText", { n: PASS }))}</p>
        <div class="row" style="justify-content:center">${pass
          ? `<button class="btn btn-primary" data-act="next">${esc(t("quizNext"))}</button>`
          : `<button class="btn btn-primary" data-act="reread">📖 ${esc(t("quizReread"))}</button>`}</div>
        ${wrong.length ? `<div style="text-align:left;margin-top:1.2rem"><h3>${esc(t("quizReview"))}</h3>${wrong.map(q => `<div class="card" style="box-shadow:none;margin-top:.5rem;padding:.7rem .9rem"><div class="quiz-prompt small">${q.prompt}</div><div class="fix ok" style="margin-top:.3rem">✓ ${q.opts[q.ans]}</div>${q.explain ? `<div class="small muted" style="margin-top:.3rem">💡 ${q.explain}</div>` : ""}${q.meaning ? `<div class="mean-box" style="margin-top:.5rem">${q.meaning}</div>` : ""}</div>`).join("")}</div>` : ""}
      </div>`;
      root.querySelector("[data-act]").addEventListener("click", e => (e.target.closest("[data-act]").dataset.act === "next" ? opts.onPass : opts.onFail)(score));
      root.scrollIntoView({ block: "start" });
    }
    show();
  }

  window.SectionQuiz = { build, run, N, PASS };
})();
