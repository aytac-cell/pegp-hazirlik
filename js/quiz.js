// 10-question check after each lesson section. Questions are generated from the section's own
// content (linked bank questions, glossary, timeline, declension/conjugation tables), so every
// answer comes from already-validated data. Pass mark: 9/10.
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
  const pick = a => a[Math.floor(Math.random() * a.length)];

  // Greek text with its translation underneath
  function bi(L) {
    const tr = c(L);
    return `<span lang="el">${esc(plain(L.el))}</span>${tr && tr !== L.el ? `<span class="tr-sub">${esc(plain(tr))}</span>` : ""}`;
  }
  // correct option + up to 3 distinct distractors; opts are {key, html}
  function mc(kind, prompt, correct, pool) {
    const seen = new Set([correct.key]);
    const wrong = shuffle(pool).filter(o => o.key && !seen.has(o.key) && seen.add(o.key)).slice(0, 3);
    if (!wrong.length) return null;
    const opts = shuffle([correct, ...wrong]);
    return { kind, prompt, opts: opts.map(o => o.html), ans: opts.indexOf(correct) };
  }

  // ---------- generators ----------
  function fromBank(q) {
    const out = [];
    if (!q || q.image) return out;
    const head = `<div class="small muted">${esc(t("subj_" + q.subject))} · ${q.n}</div>${bi(q.prompt)}`;
    if (q.type === "mc") {
      const opts = q.options.map((o, i) => ({ key: "o" + i, html: bi(o) }));
      const r = mc("bank", head, opts[q.answer], opts.filter((_, i) => i !== q.answer));
      if (r) out.push(r);
    } else if (q.type === "tf") {
      q.items.forEach(it => {
        const T = { key: "T", html: `Σ · ${esc(t("true"))}` }, F = { key: "F", html: `Λ · ${esc(t("false"))}` };
        out.push({ kind: "bank", prompt: `${head}<div style="margin-top:.5rem">${bi(it.text)}</div>`, opts: [T.html, F.html], ans: it.answer ? 0 : 1 });
      });
    } else if (q.type === "match") {
      q.pairs.forEach(([l, r]) => {
        const opts = q.right.map((o, i) => ({ key: "r" + i + o.el, html: bi(o) }));
        const res = mc("bank", `${head}<div style="margin-top:.5rem"><b>${bi(q.left[l])}</b> → ?</div>`, opts[r], opts.filter((_, i) => i !== r && !q.pairs.some(p => p[0] === l && p[1] === i)));
        if (res) out.push(res);
      });
    } else if (q.type === "fill" && q.bank && q.bank.length) {
      q.answers.forEach((a, i) => {
        const opts = q.bank.map(b => ({ key: b.el.trim(), html: bi(b) }));
        const correct = opts.find(o => o.key === a.el.trim());
        if (!correct) return;
        const text = esc(plain(q.text.el)).replace(/\((\d+)\)\s*_{2,}/g, (m, n) => +n === i + 1 ? `<b class="blank">(${n}) ?</b>` : "___");
        const r = mc("bank", `${head}<div lang="el" style="margin-top:.5rem">${text}</div>`, correct, opts);
        if (r) out.push(r);
      });
    }
    return out;
  }

  function fromTerms(terms) {
    const out = [];
    if (terms.length < 4) return out;
    terms.forEach(x => {
      const all = terms.map(y => ({ key: c(y), html: esc(c(y)) }));
      const r = mc("term", `<span lang="el" class="quiz-big">${esc(x.el)}</span><div class="small muted">${esc(t("qMeans"))}</div>`, { key: c(x), html: esc(c(x)) }, all);
      if (r) out.push(r);
      // and the other way round: meaning → Greek
      const allEl = terms.map(y => ({ key: y.el, html: `<span lang="el">${esc(y.el)}</span>` }));
      const r2 = mc("term", `<b>${esc(c(x))}</b><div class="small muted">${esc(t("qInGreek"))}</div>`, { key: x.el, html: `<span lang="el">${esc(x.el)}</span>` }, allEl);
      if (r2) out.push(r2);
    });
    return out;
  }

  function fromTimeline(items) {
    const out = [];
    const dates = [...new Set(items.map(x => x.date))];
    if (dates.length < 4) return out;
    items.forEach(x => {
      const r = mc("date", `<div class="small muted">${esc(t("qWhen"))}</div>${bi(Object.assign({}, x.text, { el: x.text.el || c(x.text) }))}`,
        { key: x.date, html: esc(x.date) }, dates.map(d => ({ key: d, html: esc(d) })));
      if (r) out.push(r);
    });
    return out;
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

  function poolFor(sec) {
    const byKind = { bank: [], term: [], date: [], form: [] };
    const QS = window.QUESTIONS || [];
    sec.questions.forEach(id => byKind.bank.push(...fromBank(QS.find(q => q.id === id))));
    const terms = [], tl = [];
    sec.blocks.forEach(b => {
      if (b.type === "terms") terms.push(...b.items);
      if (b.type === "timeline") tl.push(...b.items);
      if (b.type === "decl") byKind.form.push(...fromDecl(b));
      if (b.type === "conj") byKind.form.push(...fromConj(b));
    });
    byKind.term.push(...fromTerms(terms));
    byKind.date.push(...fromTimeline(tl));
    return byKind;
  }

  // 10 questions, spread over the kinds of content; tops up from neighbouring sections if needed
  function build(les, sec) {
    const take = (byKind, n) => {
      const lists = Object.values(byKind).map(shuffle).filter(l => l.length);
      const out = [];
      while (out.length < n && lists.some(l => l.length)) for (const l of shuffle(lists)) if (l.length && out.length < n) out.push(l.shift());
      return out;
    };
    let qs = take(poolFor(sec), N);
    if (qs.length < N) {
      const idx = les.sections.indexOf(sec);
      const near = les.sections.filter((_, i) => i !== idx).sort((a, b) => Math.abs(les.sections.indexOf(a) - idx) - Math.abs(les.sections.indexOf(b) - idx));
      for (const s of near) { if (qs.length >= N) break; qs = qs.concat(take(poolFor(s), N - qs.length)); }
    }
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
        <article class="card qcard fade-in show-tr"><div class="quiz-prompt">${q.prompt}</div>
        <div class="options">${q.opts.map((o, k) => `<button class="opt" type="button"><span class="letter">${L4[k]}</span><span>${o}</span></button>`).join("")}</div>
        <div class="actions"></div></article>`;
      const btns = root.querySelectorAll(".opt"), actions = root.querySelector(".actions");
      btns.forEach((b, k) => b.addEventListener("click", () => {
        if (b.disabled) return;
        btns.forEach((x, j) => { x.disabled = true; if (j === q.ans) x.classList.add("correct"); else if (j === k) x.classList.add("wrong"); });
        if (k === q.ans) score++; else wrong.push(q);
        actions.innerHTML = `<div class="row">${k === q.ans ? `<span class="pill ok">✓ ${esc(t("correct"))}</span>` : `<span class="pill bad">✗ ${esc(t("wrong"))}</span>`}</div>
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
        ${wrong.length ? `<div style="text-align:left;margin-top:1.2rem"><h3>${esc(t("quizReview"))}</h3>${wrong.map(q => `<div class="card" style="box-shadow:none;margin-top:.5rem;padding:.7rem .9rem"><div class="quiz-prompt small">${q.prompt}</div><div class="fix ok" style="margin-top:.3rem">✓ ${q.opts[q.ans]}</div></div>`).join("")}</div>` : ""}
      </div>`;
      root.querySelector("[data-act]").addEventListener("click", e => (e.target.closest("[data-act]").dataset.act === "next" ? opts.onPass : opts.onFail)(score));
      root.scrollIntoView({ block: "start" });
    }
    show();
  }

  window.SectionQuiz = { build, run, N, PASS };
})();
