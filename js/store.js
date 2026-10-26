// Progress persistence. Everything lives in localStorage on this device only.
(function () {
  const KEY = "pegp.v1";
  const DEFAULTS = {
    cards: {},          // id -> SRS state (see srs.js)
    log: {},            // "YYYY-MM-DD" -> { n: reviews, ok: correct first tries, new: new cards introduced }
    exams: [],          // { at, score, max, per: {geo:[ok,total],...}, secs, auto }
    read: {},           // lesson section id -> time its quiz was passed
    quiz: {},           // lesson section id -> { tries, last, best, passed, needReread, at }
    settings: { lang: "tr", tr: "tap", newPerDay: 20, theme: "auto", voice: true, voiceGender: "" }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return clone(DEFAULTS);
      const d = JSON.parse(raw);
      return {
        cards: d.cards || {},
        log: d.log || {},
        exams: Array.isArray(d.exams) ? d.exams : [],
        read: d.read || {},
        quiz: d.quiz || {},
        settings: Object.assign(clone(DEFAULTS.settings), d.settings || {})
      };
    } catch (e) {
      return clone(DEFAULTS);
    }
  }

  let data = load();
  let saveTimer = null;

  const Store = {
    get data() { return data; },
    save() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage full or blocked */ }
      }, 50);
    },
    setting(k, v) {
      if (v === undefined) return data.settings[k];
      data.settings[k] = v; Store.save();
    },
    today() { return Store.dayKey(new Date()); },
    dayKey(d) {
      const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    },
    logReview(firstTryOk, isNew) {
      const k = Store.today();
      const e = data.log[k] || (data.log[k] = { n: 0, ok: 0, new: 0 });
      e.n++; if (firstTryOk) e.ok++; if (isNew) e.new++;
      Store.save();
    },
    streak() {
      let s = 0; const d = new Date();
      // today counts if studied; otherwise the streak may still be alive from yesterday
      if (!data.log[Store.dayKey(d)]) d.setDate(d.getDate() - 1);
      while (data.log[Store.dayKey(d)]) { s++; d.setDate(d.getDate() - 1); }
      return s;
    },
    exportJSON() { return JSON.stringify({ app: "pegp-prep", v: 1, at: new Date().toISOString(), data }, null, 1); },
    importJSON(text) {
      const o = JSON.parse(text);
      const d = o && o.data ? o.data : o;
      if (!d || typeof d.cards !== "object") throw new Error("bad file");
      data = {
        cards: d.cards || {}, log: d.log || {}, exams: d.exams || [], read: d.read || {}, quiz: d.quiz || {},
        settings: Object.assign(clone(DEFAULTS.settings), d.settings || {})
      };
      Store.save();
    },
    reset() {
      const settings = data.settings;
      data = clone(DEFAULTS); data.settings = settings; Store.save();
    }
  };
  window.Store = Store;
})();
