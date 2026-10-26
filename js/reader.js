// Read a lesson section aloud with the device's speech synthesis, in the chosen lesson language.
// The page is split into "units" (heading, paragraphs, list items, tips, table rows, terms); each unit is
// split into language segments: text inside [lang="el"] is spoken with a Greek voice, the rest in the
// lesson/interface language. Controls: previous / play-pause / next unit, speed, tap a unit to jump.
(function () {
  const VOICE_LANG = { tr: "tr-TR", en: "en-US", el: "el-GR" };
  const UNIT_SEL = ".lesson-head h1, .lesson-body > p, .lesson-body li, .lesson-body .tip, .lesson-body .infl-title, .lesson-body table:not(.infl) tr, .lesson-body .term";
  const GREEK_RUN = /([\u0370-\u03FF\u1F00-\u1FFF][\u0370-\u03FF\u1F00-\u1FFF\s,'«»-]*[\u0370-\u03FF\u1F00-\u1FFF])/;
  const SKIP_SEL = ".speak, .infl-wrap, .conj-grid, .tip-label, script, style";

  const voiceFor = lang => Voices.pick(lang);     // honours the voice / gender chosen in Settings

  // walk a unit's DOM and split its text into [{lang, text}] by lang="el" spans
  function segments(node, baseLang) {
    const out = [];
    const push = (lang, text) => {
      text = text.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "").replace(/\s+/g, " ");
      if (!text.trim()) return;
      const last = out[out.length - 1];
      if (last && last.lang === lang) last.text += text; else out.push({ lang, text });
    };
    (function walk(n, lang) {
      if (n.nodeType === 3) {
        if (lang === "el") return push(lang, n.textContent);
        // Greek words inside Turkish/English text are spoken with the Greek voice
        n.textContent.split(GREEK_RUN).forEach((part, i) => push(i % 2 ? "el" : lang, part));
        return;
      }
      if (n.nodeType !== 1 || n.matches(SKIP_SEL)) return;
      const l = n.getAttribute("lang") === "el" ? "el" : (n.classList.contains("tr-sub") ? baseLang.ui : lang);
      // table cells / list separators: keep words apart
      n.childNodes.forEach(ch => walk(ch, l));
      if (/^(TD|TH|LI|DIV|SMALL)$/.test(n.tagName)) push(l, ". ");
    })(node, baseLang.main);
    return out.map(s => ({ lang: s.lang, text: s.text.replace(/(\.\s*){2,}/g, ". ").replace(/^[\s.]+|[\s.]+$/g, "") })).filter(s => s.text);
  }

  // long texts are cut at sentence ends (some engines stop speaking after ~15 s)
  function chunks(text) {
    const parts = text.match(/[^.!?;·]+[.!?;·]*\s*/g) || [text];
    const out = [];
    let cur = "";
    for (const p of parts) {
      if ((cur + p).length > 220 && cur) { out.push(cur.trim()); cur = ""; }
      cur += p;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }

  // root: the lesson article; opts: { lessonLang, uiLang, labels, onStop }
  function create(root, opts) {
    const main = opts.lessonLang === "el" || opts.lessonLang === "el+" ? "el" : opts.lessonLang;
    const base = { main, ui: opts.uiLang };
    const units = [...root.querySelectorAll(UNIT_SEL)].filter(u => !u.closest(".infl-wrap, .conj-grid") && !u.parentElement.closest(".lesson-body .tip, .lesson-body .term"));
    let idx = 0, playing = false, token = 0;
    let rate = parseFloat(Store.setting("readRate")) || 1;

    const bar = document.createElement("div");
    bar.className = "reader-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", opts.labels.listen);
    bar.innerHTML = `
      <button type="button" data-a="prev" aria-label="${opts.labels.prev}" title="${opts.labels.prev}">⏮</button>
      <button type="button" data-a="play" class="main" aria-label="${opts.labels.play}">▶</button>
      <button type="button" data-a="next" aria-label="${opts.labels.next}" title="${opts.labels.next}">⏭</button>
      <span class="reader-pos" aria-live="off"></span>
      <select class="r-gender" aria-label="${opts.labels.voice}">${[["", "🔊 " + opts.labels.auto], ["f", "♀ " + opts.labels.female], ["m", "♂ " + opts.labels.male]].map(([v, l]) => `<option value="${v}" ${v === (Store.setting("voiceGender") || "") ? "selected" : ""}>${l}</option>`).join("")}</select>
      <select class="r-speed" aria-label="${opts.labels.speed}">${[0.75, 1, 1.25, 1.5].map(r => `<option value="${r}" ${r === rate ? "selected" : ""}>${r}×</option>`).join("")}</select>
      <button type="button" data-a="close" aria-label="${opts.labels.close}" title="${opts.labels.close}">✕</button>
      <div class="reader-warn"></div>`;
    document.body.appendChild(bar);
    const playBtn = bar.querySelector('[data-a="play"]'), pos = bar.querySelector(".reader-pos"), warn = bar.querySelector(".reader-warn");

    const needed = new Set([VOICE_LANG[main], VOICE_LANG[opts.lessonLang === "el+" ? opts.uiLang : main]]);
    function checkVoices() {
      const missing = [...needed].filter(l => !voiceFor(l));
      const noGender = [...needed].filter(l => voiceFor(l) && Voices.genderMissing(l));
      warn.textContent = missing.length ? opts.labels.noVoice.replace("{l}", missing.map(l => l.slice(0, 2).toUpperCase()).join(", "))
        : noGender.length ? opts.labels.noGender.replace("{l}", noGender.map(l => l.slice(0, 2).toUpperCase()).join(", ")) : "";
    }
    checkVoices();
    Voices.onChange(checkVoices);

    function mark() {
      units.forEach((u, i) => u.classList.toggle("reading", i === idx && playing));
      pos.textContent = `${Math.min(idx + 1, units.length)}/${units.length}`;
      playBtn.textContent = playing ? "⏸" : "▶";
      playBtn.setAttribute("aria-label", playing ? opts.labels.pause : opts.labels.play);
    }

    function speakUnit() {
      const my = ++token;
      speechSynthesis.cancel();
      if (idx >= units.length) { playing = false; idx = units.length - 1; mark(); return; }
      mark();
      units[idx].scrollIntoView({ block: "center", behavior: "smooth" });
      const queue = [];
      segments(units[idx], base).forEach(s => chunks(s.text).forEach(t => queue.push({ lang: s.lang, text: t })));
      const step = () => {
        if (my !== token || !playing) return;
        const s = queue.shift();
        if (!s) { idx++; return speakUnit(); }
        const u = new SpeechSynthesisUtterance(s.text);
        u.lang = VOICE_LANG[s.lang] || s.lang;
        const v = voiceFor(u.lang); if (v) u.voice = v;
        u.rate = rate * (s.lang === "el" ? 0.95 : 1);
        u.onend = step;
        u.onerror = e => { if (e.error !== "interrupted" && e.error !== "canceled") step(); };
        speechSynthesis.speak(u);
      };
      step();
    }

    function play() { playing = true; speakUnit(); }
    function pause() { playing = false; token++; speechSynthesis.cancel(); mark(); }
    function go(d) { idx = Math.max(0, Math.min(units.length - 1, idx + d)); if (playing) speakUnit(); else mark(); }
    function stop() {
      pause();
      units.forEach(u => u.classList.remove("reading", "readable"));
      root.removeEventListener("click", onUnitClick, true);
      bar.remove();
      opts.onStop && opts.onStop();
    }

    bar.addEventListener("click", e => {
      const b = e.target.closest("[data-a]"); if (!b) return;
      ({ prev: () => go(-1), next: () => go(1), close: stop, play: () => (playing ? pause() : play()) })[b.dataset.a]();
    });
    bar.querySelector(".r-gender").addEventListener("change", e => {
      Store.setting("voiceGender", e.target.value);
      checkVoices();
      if (playing) speakUnit();
    });
    bar.querySelector(".r-speed").addEventListener("change", e => {
      rate = parseFloat(e.target.value); Store.setting("readRate", rate);
      if (playing) speakUnit();
    });
    // tap a paragraph to continue reading from there
    function onUnitClick(e) {
      if (e.target.closest("a, button, select, input, summary")) return;
      const u = e.target.closest(".readable");
      if (!u) return;
      idx = units.indexOf(u); play();
    }
    units.forEach(u => u.classList.add("readable"));
    root.addEventListener("click", onUnitClick, true);

    mark();
    play();
    return { stop, get playing() { return playing; } };
  }

  window.LessonReader = { create, supported: () => "speechSynthesis" in window };
})();
