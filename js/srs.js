// Spaced repetition: an SM-2 variant with short learning steps (similar to Anki).
// Grades: 1 = again, 2 = hard, 3 = good, 4 = easy.
(function () {
  const MIN = 60 * 1000, DAY = 24 * 60 * MIN;
  const STEPS = [1, 10];          // learning steps in minutes
  const RELEARN = [10];           // after a lapse
  const START_EASE = 2.5, MIN_EASE = 1.3, MAX_IVL = 365;

  function startOfDay(t) { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function dueInDays(now, ivl) { return startOfDay(now) + ivl * DAY; }
  function fuzz(ivl) {
    if (ivl < 3) return ivl;
    const f = Math.max(1, Math.round(ivl * 0.05));
    return ivl + Math.round((Math.random() * 2 - 1) * f);
  }

  // Pure: returns the next state without mutating.
  function next(st, g, now) {
    const s = st ? Object.assign({}, st) : { s: "new", step: 0, ivl: 0, ease: START_EASE, reps: 0, lapses: 0, seen: 0, wrong: 0 };
    s.seen = (s.seen || 0) + 1; s.last = now;
    if (g === 1) s.wrong = (s.wrong || 0) + 1;

    if (s.s === "new" || s.s === "learning") {
      const steps = s.relearn ? RELEARN : STEPS;
      if (s.s === "new") { s.s = "learning"; s.step = 0; }
      if (g === 1) { s.step = 0; s.due = now + steps[0] * MIN; }
      else if (g === 2) { s.due = now + Math.round(steps[Math.min(s.step, steps.length - 1)] * 1.5) * MIN; }
      else if (g === 3) {
        s.step++;
        if (s.step >= steps.length) graduate(s, s.relearn ? Math.max(1, s.ivl) : 1, now);
        else s.due = now + steps[s.step] * MIN;
      } else graduate(s, s.relearn ? Math.max(2, s.ivl + 1) : 4, now);
      return s;
    }

    // review
    s.reps++;
    if (g === 1) {
      s.lapses = (s.lapses || 0) + 1;
      s.ease = Math.max(MIN_EASE, s.ease - 0.2);
      s.ivl = Math.max(1, Math.round(s.ivl * 0.5));
      s.s = "learning"; s.relearn = true; s.step = 0; s.due = now + RELEARN[0] * MIN;
      return s;
    }
    let ivl;
    if (g === 2) { ivl = Math.max(s.ivl + 1, s.ivl * 1.2); s.ease = Math.max(MIN_EASE, s.ease - 0.15); }
    else if (g === 3) { ivl = Math.max(s.ivl + 1, s.ivl * s.ease); }
    else { ivl = Math.max(s.ivl + 2, s.ivl * s.ease * 1.3); s.ease += 0.15; }
    s.ivl = Math.min(MAX_IVL, fuzz(Math.round(ivl)));
    s.due = dueInDays(now, s.ivl);
    return s;
  }

  function graduate(s, ivl, now) {
    s.s = "review"; s.relearn = false; s.step = 0; s.ivl = ivl; s.due = dueInDays(now, ivl);
  }

  // Human-readable interval for a grade button.
  function preview(st, g, now) {
    const n = next(st, g, now);
    const ms = n.due - now;
    if (ms < DAY * 0.9 && n.s === "learning") return I18N.t("minutes", { n: Math.max(1, Math.round(ms / MIN)) });
    return I18N.t("days", { n: Math.max(1, Math.round((n.due - startOfDay(now)) / DAY)) });
  }

  function stateOf(id) { return Store.data.cards[id]; }

  function category(st) {
    if (!st) return "unseen";
    if (st.s === "learning" || st.s === "new") return "learning";
    return st.ivl >= 21 ? "mature" : "young";
  }

  function isDue(st, now) {
    if (!st || st.s === "new") return false;
    if (st.s === "learning") return st.due <= now + 20 * MIN;
    return st.due <= startOfDay(now) + DAY - 1;
  }

  function newIntroducedToday() {
    const e = Store.data.log[Store.today()];
    return e ? e.new : 0;
  }

  // Build the queue for a session.
  function buildQueue(questions, opts = {}) {
    const now = Date.now();
    const due = [], fresh = [];
    for (const q of questions) {
      const st = stateOf(q.id);
      if (isDue(st, now)) due.push(q);
      else if (!st) fresh.push(q);
    }
    due.sort((a, b) => stateOf(a.id).due - stateOf(b.id).due);
    const newLimit = opts.newLimit ?? (opts.extra ? 10 : Math.max(0, Store.setting("newPerDay") - newIntroducedToday()));
    // new cards: interleave subjects so a session isn't 20 geography cards in a row
    const bySubj = {};
    for (const q of fresh) (bySubj[q.subject] || (bySubj[q.subject] = [])).push(q);
    const order = [], lists = Object.values(bySubj);
    while (order.length < newLimit && lists.some(l => l.length)) for (const l of lists) if (l.length && order.length < newLimit) order.push(l.shift());
    return shuffleSoft(due).concat(order);
  }

  // Light shuffle that keeps roughly the due order but avoids identical sequences.
  function shuffleSoft(arr) {
    const a = arr.slice();
    for (let i = 0; i < a.length - 1; i += 2) if (Math.random() < 0.5) [a[i], a[i + 1]] = [a[i + 1], a[i]];
    return a;
  }

  function counts(questions) {
    const now = Date.now();
    let due = 0, unseen = 0;
    const cat = { unseen: 0, learning: 0, young: 0, mature: 0 };
    for (const q of questions) {
      const st = stateOf(q.id);
      cat[category(st)]++;
      if (isDue(st, now)) due++;
      if (!st) unseen++;
    }
    const newToday = Math.min(unseen, Math.max(0, Store.setting("newPerDay") - newIntroducedToday()));
    return { due, newToday, cat };
  }

  // opts.ownBudget: vocabulary cards don't use up the daily new-question allowance
  function grade(q, g, firstTryOk, opts = {}) {
    const now = Date.now();
    const before = stateOf(q.id);
    const st = next(before, g, now);
    Store.data.cards[q.id] = st;
    Store.logReview(firstTryOk, !before && !opts.ownBudget);
    return st;
  }

  window.SRS = { next, preview, grade, buildQueue, counts, category, isDue, stateOf, MIN, DAY };
})();
