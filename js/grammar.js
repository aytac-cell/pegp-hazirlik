// Inflection tables (declension of nouns/adjectives, conjugation of verbs).
// Used by grammar lessons (decl/conj blocks) and by the vocabulary trainer (word.forms).
(function () {
  const t = k => I18N.t(k);
  const esc = s => Cards.esc(s);
  const CASES = ["case_nom", "case_gen", "case_acc", "case_voc"];
  const PERSONS = ["εγώ", "εσύ", "αυτός/ή/ό", "εμείς", "εσείς", "αυτοί/ές/ά"];
  const TENSES = ["present", "imperfect", "aorist", "fut_cont", "fut_simple", "perfect", "pluperfect", "fut_perfect", "subj_simple", "imperative"];
  const TENSE_EL = {
    present: "Ενεστώτας", imperfect: "Παρατατικός", aorist: "Αόριστος", fut_cont: "Εξακολουθητικός Μέλλοντας",
    fut_simple: "Στιγμιαίος Μέλλοντας", perfect: "Παρακείμενος", pluperfect: "Υπερσυντέλικος",
    fut_perfect: "Συντελεσμένος Μέλλοντας", subj_simple: "Υποτακτική", imperative: "Προστακτική"
  };
  const CASE_EL = ["ονομαστική", "γενική", "αιτιατική", "κλητική"];

  function decl(sg, pl) {
    return `<div class="infl-wrap"><table class="table infl">
      <thead><tr><th></th><th>${esc(t("sg"))} <span class="el-h" lang="el">ενικός</span></th><th>${esc(t("pl"))} <span class="el-h" lang="el">πληθυντικός</span></th></tr></thead>
      <tbody>${CASES.map((k, i) => `<tr><th>${esc(t(k))}<span class="el-h" lang="el">${CASE_EL[i]}</span><span class="case-note">${esc(t(k + "_note"))}</span></th><td lang="el">${esc(sg[i])}</td><td lang="el">${esc(pl[i])}</td></tr>`).join("")}</tbody>
    </table></div>`;
  }

  // tenses: [{id, forms}] — renders one compact card per tense so it fits on phones
  function conj(tenses) {
    const ordered = tenses.slice().sort((a, b) => TENSES.indexOf(a.id) - TENSES.indexOf(b.id));
    return `<div class="conj-grid">${ordered.map(x => {
      const imp = x.id === "imperative";
      const persons = imp ? ["εσύ", "εσείς"] : PERSONS;
      return `<div class="conj-card"><div class="conj-h"><b>${esc(t("tense_" + x.id))}</b><span class="el-h" lang="el">${TENSE_EL[x.id] || ""}</span></div>
        <table class="infl-mini">${x.forms.map((f, i) => `<tr><td class="pers" lang="el">${persons[i] || ""}</td><td lang="el">${esc(f)}</td></tr>`).join("")}</table></div>`;
    }).join("")}</div>`;
  }

  // vocabulary word → table html (or "")
  function forWord(w) {
    const f = w.forms;
    if (!f) return "";
    if (f.sg && f.pl) return decl(f.sg, f.pl);
    const tenses = TENSES.filter(id => Array.isArray(f[id])).map(id => ({ id, forms: f[id] }));
    return tenses.length ? conj(tenses) : "";
  }

  window.Grammar = { decl, conj, forWord, TENSES };
})();
