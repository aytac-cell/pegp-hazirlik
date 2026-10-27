// Study roadmap: all lessons in one numbered path (Ders 1 … 66), easy → hard,
// 3 months (= 3 levels) × 4 weeks, 6 lessons a week, plus the week's word groups
// and a Saturday review / mock exam. Week 12 is revision.
(function () {
  const t = (k, v) => I18N.t(k, v);
  const esc = s => Cards.esc(s);
  const c = L => I18N.c(L);

  const WEEKS = [
    // Month 1 · Level 1 — basics
    { lessons: ["gram-articles", "geo-overview", "gram-cases", "cul-olympian-gods", "his-ancient-world", "ins-constitution"], words: ["a1:greetings", "a1:numbers-small", "a1:numbers-big"] },
    { lessons: ["gram-masculine", "geo-regions", "cul-myths", "gram-feminine", "his-classical-athens", "ins-president"], words: ["a1:colours", "a1:family", "a1:body"] },
    { lessons: ["gram-neuter", "geo-ionian-crete", "cul-customs", "gram-adjectives", "his-macedonia-hellenistic", "ins-citizenship"], words: ["a1:food", "a1:fruit-veg", "a1:drinks", "a1:animals"] },
    { lessons: ["gram-verb-system", "geo-aegean-islands", "cul-sport", "gram-irr-auxiliaries", "his-byzantium", "geo-climate-nature"], words: ["a1:home", "a1:clothes", "a1:weather-seasons", "a1:days-months"] },
    // Month 2 · Level 2 — verbs, middle topics
    { lessons: ["gram-verb-group-a", "geo-capitals", "cul-prehistoric", "his-ottoman-rule", "ins-parliament-elections", "cul-sites-oracles"], words: ["a2:verbs", "a2:time", "a2:town"], exam: true },
    { lessons: ["gram-verb-group-b1", "geo-relief", "cul-classical", "his-revolution-1821", "ins-government", "gram-verb-group-b2"], words: ["a2:travel", "a2:shopping", "a2:health"], exam: true },
    { lessons: ["gram-irr-active-1", "geo-rivers-lakes", "cul-byzantium", "his-modern-state", "ins-justice", "ins-local-government"], words: ["a2:work", "a2:adjectives"], exam: true },
    { lessons: ["gram-irr-active-2", "geo-economy", "cul-modern-heritage", "his-balkan-wars", "ins-rights", "gram-verb-tense-use"], words: ["a2:phrases", "a2:school-office"], exam: true },
    // Month 3 · Level 3 — hardest topics, exam practice
    { lessons: ["gram-verb-passive", "geo-towns", "cul-music", "his-schism-asia-minor", "ins-services", "gram-irr-deponent"], words: ["b1:connectors", "b1:opinion", "b1:society", "b1:exam-state"], exam: true },
    { lessons: ["gram-verb-mood-negation", "geo-waters", "cul-cinema", "his-ww2-occupation", "ins-independent-authorities", "ins-parties-history"], words: ["b1:work-economy", "b1:environment", "b1:exam-law", "b1:exam-history"], exam: true },
    { lessons: ["gram-irr-review", "geo-transport", "cul-literature", "his-civil-war-postwar", "his-junta-metapolitefsi", "ins-eu-international"], words: ["b1:idioms", "b1:exam-geography", "b1:exam-culture"], exam: true },
    { revision: true, lessons: [], words: [], exam: true }
  ];
  const ORDER = WEEKS.flatMap(w => w.lessons);              // ORDER[i] = section id of lesson i+1

  const numberOf = id => { const i = ORDER.indexOf(id); return i < 0 ? null : i + 1; };
  const subjectOf = id => id.split("-")[0];
  const sectionOf = id => { const les = (window.LESSONS || {})[subjectOf(id)]; return les && les.sections.find(s => s.id === id); };
  const lessonHref = id => `#/learn?s=${subjectOf(id)}&sec=${id}`;
  const isDone = id => !!Store.data.read[id];
  const nextOpen = () => ORDER.find(id => !isDone(id)) || null;
  const neighbours = id => { const i = ORDER.indexOf(id); return i < 0 ? null : { prev: ORDER[i - 1] || null, next: ORDER[i + 1] || null }; };

  function wordGroup(key) {
    const [lv, cat] = key.split(":");
    const l = (window.WORDS || []).find(x => x.level === lv), g = l && l.cats.find(x => x.id === cat);
    if (!g) return null;
    const seen = g.words.every(w => SRS.stateOf(`w:${w.id}:p`) || SRS.stateOf(`w:${w.id}:r`));
    return { l, g, seen };
  }

  function lessonRow(id) {
    const sec = sectionOf(id); if (!sec) return "";
    const n = numberOf(id), done = isDone(id), next = id === nextOpen();
    const q = Store.data.quiz[id];
    return `<a class="road-item ${done ? "done" : ""} ${next ? "next" : ""}" href="${lessonHref(id)}">
      <span class="road-n">${done ? "✓" : n}</span>
      <span class="road-t"><b>${esc(t("roadLesson", { n }))} · ${esc(c(sec.title))}</b><small>${sec.icon || ""} ${esc(t("subj_" + subjectOf(id)))}${q && !done && q.needReread ? ` · 🔁 ${esc(t("quizRereadShort"))}` : ""}${done && q ? ` · ${q.best}/10` : ""}</small></span>
      ${next ? `<span class="pill warn">${esc(t("roadNext"))}</span>` : ""}
    </a>`;
  }

  // card for the home page: the next lesson in the path
  function nextCard() {
    const total = ORDER.length, done = ORDER.filter(isDone).length, id = nextOpen();
    if (!id) return `<div class="card road-next"><h2>🎓 ${esc(t("roadAllDone"))}</h2><a class="btn btn-primary" href="#/exam">${esc(t("examStart"))}</a></div>`;
    const sec = sectionOf(id), n = numberOf(id), w = Math.floor((n - 1) / 6);
    return `<div class="card road-next">
      <div class="row"><span class="road-n big">${n}</span>
        <div><div class="small muted">${esc(t("roadNextLesson"))} · ${esc(t("progMonth", { n: Math.floor(w / 4) + 1 }))} · ${esc(t("progWeek"))} ${w + 1}</div>
        <h2 style="margin:.1rem 0 0">${esc(c(sec.title))}</h2><div class="small muted">${sec.icon || ""} ${esc(t("subj_" + subjectOf(id)))}</div></div>
        <span class="spacer"></span><a class="btn btn-primary" href="${lessonHref(id)}">▶ ${esc(t("roadStart", { n }))}</a></div>
      <div class="row" style="margin-top:.7rem"><div class="bar" style="flex:1"><span class="seg-mature" style="width:${100 * done / total}%"></span></div><span class="small"><b>${done}</b>/${total}</span><a class="small" href="#/roadmap">${esc(t("roadOpen"))} →</a></div>
    </div>`;
  }

  function view() {
    const app = document.getElementById("app");
    const total = ORDER.length, done = ORDER.filter(isDone).length;
    const months = [0, 1, 2].map(m => {
      const weeks = WEEKS.slice(m * 4, m * 4 + 4).map((w, k) => {
        const wi = m * 4 + k;
        const wDone = w.lessons.filter(isDone).length;
        const current = w.lessons.includes(nextOpen());
        const words = w.words.map(wordGroup).filter(Boolean);
        return `<details class="card road-week" ${current || (w.revision && !nextOpen()) ? "open" : ""}>
          <summary><b>${esc(t("progWeek"))} ${wi + 1}</b>${w.revision ? ` · ${esc(t("roadRevision"))}` : ` · ${esc(t("roadLessonsRange", { a: numberOf(w.lessons[0]), b: numberOf(w.lessons[w.lessons.length - 1]) }))}`}<span class="spacer"></span>${w.revision ? "" : `<span class="small muted">${wDone}/${w.lessons.length}</span>`}</summary>
          ${w.revision ? `<p class="small">${esc(t("roadRevisionText"))}</p>` : `<div class="road-list">${w.lessons.map(lessonRow).join("")}</div>`}
          ${words.length ? `<div class="road-extra"><b>🔤 ${esc(t("roadWords"))}:</b> ${words.map(x => `<a href="#/words?run=1&lv=${x.l.level}&cat=${x.g.id}" class="chip" style="${x.seen ? "border-color:var(--ok)" : ""}">${x.seen ? "✓ " : ""}${x.g.icon || ""} ${esc(c(x.g.name))}</a>`).join(" ")}</div>` : ""}
          <div class="road-extra"><b>📅 ${esc(t("roadSaturday"))}:</b> <a href="#/study">${esc(t("roadReview"))}</a>${w.exam ? ` · <a href="#/exam">${esc(t(w.revision ? "roadDailyExam" : "roadMockExam"))}</a>` : ""}</div>
        </details>`;
      }).join("");
      return `<section><div class="section-title"><h2>${esc(t("progMonth", { n: m + 1 }))} · ${esc(t("progLevel", { n: m + 1 }))}</h2><span class="small muted">${esc(t("roadL" + (m + 1)))}</span></div>${weeks}</section>`;
    }).join("");
    app.innerHTML = `<h1>🗺️ ${esc(t("roadTitle"))}</h1>
      <p class="muted">${esc(t("roadIntro"))}</p>
      ${nextCard()}
      <div class="card small" style="margin:1rem 0"><b>${esc(t("roadDailyTitle"))}</b><ol style="margin:.3rem 0 0;padding-left:1.2rem"><li>${esc(t("roadDaily1"))}</li><li>${esc(t("roadDaily2"))}</li><li>${esc(t("roadDaily3"))}</li><li>${esc(t("roadDaily4"))}</li></ol></div>
      ${months}`;
    const cur = app.querySelector(".road-item.next");
    if (cur) setTimeout(() => cur.scrollIntoView({ block: "center" }), 50);
  }

  window.Roadmap = { view, nextCard, numberOf, neighbours, ORDER, total: () => ORDER.length };
})();
