# Vocabulary JSON schema

One file per level: `data/src/words/{a1,a2,b1}.json`. UTF-8, valid JSON. Our own word list (do not copy any
other site's list), for Turkish speakers learning Greek (UI also in English).

```
{
  "level": "a1",                     // a1 | a2 | b1
  "cefr": "A1",                      // "A1" | "A2–B1" | "B1–B2"
  "icon": "🌱",
  "name": {"tr": "Başlangıç", "en": "Beginner"},
  "blurb": {"tr": "...", "en": "..."},   // one line: what this level contains
  "cats": [
    {
      "id": "greetings",             // kebab-case, unique within the level
      "icon": "👋",
      "name": {"el": "Χαιρετισμοί", "tr": "Selamlaşma", "en": "Greetings"},
      "words": [
        {"id": "a1-greetings-01", "pic": "👋", "el": "γεια σου", "pron": "ya su", "tr": "merhaba (samimi)", "en": "hello (informal)"}
      ]
    }
  ]
}
```

Word fields:
- `id`: "<level>-<cat id>-<2-digit index>", unique.
- `pic`: ONE emoji that clearly depicts the word (shown as the picture when the learner is asked to produce
  the Greek word from Turkish/English). Use "" when no emoji depicts the meaning unambiguously (abstract words,
  linking words) — never a vague or misleading emoji. Numbers may use the digit itself ("7").
- `el`: modern Greek, correctly accented (monotonic). Nouns WITH the definite article (ο σκύλος, η γάτα, το σπίτι).
  Verbs in 1st person singular present (τρώω). Adjectives in masculine singular, optionally "καλός, -ή, -ό".
- `pron`: simple Latin pronunciation readable by Turkish speakers, stressed vowel marked with an acute accent:
  χ → h, θ → th, δ → dh, γ before ε/ι/αι/ει/οι/υ → y, otherwise γ → gh, ου → u, ει/οι/ι/η/υ → i, αι → e, μπ → b/mb,
  ντ → d/nd, γκ → g. Examples: "kaliméra", "efharistó", "o skílos", "i gháta", "to spíti".
- `tr`, `en`: the meaning; short; add a hint in parentheses where needed ("merhaba (samimi)").
  Turkish must be natural, correct Turkish.

Sizes: a1 ≈ 200 words, a2 ≈ 160, b1 ≈ 150; 8–14 categories per level, 10–20 words per category.
Accuracy matters more than size: every Greek form, article, accent and translation must be correct.
