// Voice choice for speech (lesson reader, words, questions).
// Browsers don't report a voice's gender, so it is guessed from well-known voice names; the learner
// can also pick an exact voice per language in Settings.
(function () {
  const FEMALE = ["female", "athina", "melina", "emel", "yelda", "seda", "filiz", "zira", "hazel", "susan", "aria", "jenny",
    "michelle", "ana", "sonia", "libby", "natasha", "clara", "samantha", "karen", "moira", "tessa", "fiona", "victoria",
    "allison", "ava", "zoe", "serena", "kate", "catherine", "linda", "heera", "emma", "olivia", "joanna", "salli",
    "kimberly", "ivy", "amy", "nicole", "sarah", "eva", "maria", "elena", "ioanna", "eleni", "myrto"];
  const MALE = ["male", "nestoras", "stefanos", "nikos", "ahmet", "tolga", "cem", "david", "mark", "guy", "christopher",
    "eric", "roger", "steffan", "ryan", "thomas", "william", "alex", "daniel", "fred", "tom", "aaron", "arthur",
    "gordon", "oliver", "rishi", "george", "james", "matthew", "joey", "justin", "brian", "russell", "giorgos", "kostas"];

  function gender(v) {
    const n = (v.name || "").toLowerCase();
    if (/\bfemale\b/.test(n)) return "f";
    if (/\bmale\b/.test(n)) return "m";
    const words = n.split(/[^a-zα-ω]+/);
    if (words.some(w => FEMALE.includes(w))) return "f";
    if (words.some(w => MALE.includes(w))) return "m";
    if (/^google (ελληνικά|türkçe|us english)/.test(n)) return "f";   // Chrome's built-in voices are female
    return "";
  }

  function all() { return "speechSynthesis" in window ? speechSynthesis.getVoices() : []; }
  const pre = lang => lang.slice(0, 2).toLowerCase();
  function list(lang) {
    return all().filter(v => v.lang && v.lang.toLowerCase().replace("_", "-").startsWith(pre(lang)))
      .sort((a, b) => (b.localService - a.localService) || a.name.localeCompare(b.name));
  }

  // best voice for a language: exact choice → preferred gender → default for that language
  function pick(lang) {
    const vs = list(lang);
    if (!vs.length) return null;
    const chosen = Store.setting("voice_" + pre(lang));
    if (chosen) { const v = vs.find(x => x.name === chosen); if (v) return v; }
    const g = Store.setting("voiceGender") || "";
    if (g) { const v = vs.find(x => gender(x) === g); if (v) return v; }
    return vs.find(v => v.default) || vs[0];
  }

  // true when the learner asked for a gender this language has no voice for
  function genderMissing(lang) {
    const g = Store.setting("voiceGender") || "";
    return !!g && !Store.setting("voice_" + pre(lang)) && list(lang).length > 0 && !list(lang).some(v => gender(v) === g);
  }

  function say(text, lang, rate) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const v = pick(lang); if (v) u.voice = v;
    u.rate = rate || 0.95;
    speechSynthesis.speak(u);
  }

  // voices load asynchronously in some browsers
  const listeners = [];
  if ("speechSynthesis" in window) speechSynthesis.addEventListener ? speechSynthesis.addEventListener("voiceschanged", () => listeners.forEach(f => f()))
    : (speechSynthesis.onvoiceschanged = () => listeners.forEach(f => f()));

  window.Voices = { pick, list, gender, genderMissing, say, onChange: f => listeners.push(f) };
})();
