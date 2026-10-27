# Grammar lesson + inflection tables

The grammar lesson is `data/src/lessons/gram.json`, built from three part files in `data/src/lessons/gram/`
(`nouns.json`, `verbs.json`, `irregular.json`). Each part file is:

```
{ "sections": [ Section, ... ] }
```

`Section` is exactly as in LESSON_SCHEMA.md (id prefixed "gram-", title G, icon, summary T, blocks, questions: [])
plus an optional `"sources": ["https://...", ...]` — the pages you used to check the forms (shown under the section).
All T objects need "el", "tr" and "en". Explanations must be your own words (do not copy prose from sources;
inflected forms themselves are facts and must match the sources).

Besides the normal blocks (p, list, terms, timeline, table, tip), grammar sections use two table blocks:

### Declension: `decl`
```
{"type": "decl",
 "word": {"el": "ο δρόμος", "tr": "yol", "en": "road"},
 "note": T | null,
 "sg": ["ο δρόμος", "του δρόμου", "τον δρόμο", "δρόμε"],
 "pl": ["οι δρόμοι", "των δρόμων", "τους δρόμους", "δρόμοι"]}
```
Order is always: nominative (ονομαστική), genitive (γενική), accusative (αιτιατική), vocative (κλητική).
Nominative/genitive/accusative WITH the definite article; vocative WITHOUT article.
Use "—" for a form that does not exist; give common alternatives separated by " / ".
For adjectives use `"type": "decl"` once per gender (word.el e.g. "καλός (αρσενικό)").

### Conjugation: `conj`
```
{"type": "conj",
 "verb": {"el": "γράφω", "tr": "yazmak", "en": "to write"},
 "note": T | null,
 "tenses": [ {"id": "present", "forms": ["γράφω","γράφεις","γράφει","γράφουμε","γράφετε","γράφουν(ε)"]}, ... ]}
```
`forms`: 6 persons in order εγώ, εσύ, αυτός/ή/ό, εμείς, εσείς, αυτοί/ές/ά (without pronouns).
Exception: `imperative` has 2 forms [2nd sg, 2nd pl].
Allowed tense ids (use this order; include the ones relevant to the section):
`present` (Ενεστώτας), `imperfect` (Παρατατικός), `aorist` (Αόριστος), `fut_cont` (Εξακολουθητικός Μέλλοντας,
θα + present stem), `fut_simple` (Στιγμιαίος Μέλλοντας, θα + aorist stem), `perfect` (Παρακείμενος, έχω + απαρέμφατο),
`pluperfect` (Υπερσυντέλικος, είχα + …), `fut_perfect` (Συντελεσμένος Μέλλοντας, θα έχω + …),
`subj_simple` (Υποτακτική αορίστου, να + …), `imperative` (Προστακτική — the perfective/simple imperative).
Write full forms including θα / έχω / είχα / θα έχω / να.

# Inflection forms on vocabulary words

Words in `data/src/words/{a1,a2,b1}.json` may get an optional `forms` object:
- nouns: `"forms": {"sg": [4 forms], "pl": [4 forms]}` — same rules as `decl`.
- verbs: `"forms": {"present": [6], "imperfect": [6], "aorist": [6], "fut_cont": [6], "fut_simple": [6], "perfect": [6], "imperative": [2]}`
  (deponent / -ομαι verbs: their real forms, e.g. έρχομαι → ήρθα).
Other parts of speech: no `forms`.

# Example sentences block: `examples`

```
{"type": "examples",
 "title": T | null,                       // optional heading, e.g. {"el":"Παραδείγματα","tr":"Örnekler","en":"Examples"}
 "items": [
   {"el": "Χθες **έγραψα** ένα γράμμα.",    // Greek sentence; **bold** the form being taught
    "tr": "Dün bir mektup **yazdım**.",
    "en": "Yesterday I **wrote** a letter.",
    "note": T | null}                        // optional short explanation (why this form)
 ]}
```
Examples are always shown in Greek with the translation underneath, whatever lesson language is chosen.
Use everyday, natural modern Greek (A2–B1), short sentences, real-life contexts (shopping, family, work,
travel, the citizenship process…). Every example must be grammatically correct.

# Grammar quiz questions (usage-based)

Grammar sections use the same `quiz` format as QUIZ_SCHEMA.md, but the questions must test USE of the
grammar point, mostly inside a sentence:
- gap-fill in context: q.el = "Χθες ___ ένα γράμμα. (γράφω)", options = 4 Greek forms;
- choose the tense/aspect/case that fits the context (e.g. "Κάθε μέρα ___ καφέ" vs "Αύριο θα ___");
- choose the correct article / case form after a preposition or verb;
- which sentence is correct; spot the error;
- meaning: what does the sentence express (habit, single completed action, plan …).
At least 70 % of the questions must contain a Greek sentence. Pure "give the form from the table" questions
at most 30 %.
The Greek sentence must be visible in every language version: q.tr / q.en contain the Greek sentence
(in «…») followed by the instruction in Turkish/English, e.g.
q.tr = "«Χθες ___ ένα γράμμα.» (γράφω) — Boşluğa hangi biçim gelir?"
Options that are Greek forms/sentences carry the same Greek string in el/tr/en.
`explain` states the rule that decides the answer (1–2 sentences), in el/tr/en.

# Sentence meaning on grammar quiz questions: `sentence`

Every grammar quiz question that contains a Greek sentence gets a `sentence` object, shown AFTER answering
behind a "Türkçesi / Translation" button so the learner also learns what the sentence means:

```
"sentence": {
  "el": "Ο δήμος φτιάχνει **τους δρόμους** της γειτονιάς.",   // the Greek sentence COMPLETED with the correct answer
  "tr": "Belediye mahallenin **yollarını** yapıyor.",            // natural Turkish translation
  "en": "The municipality is fixing the neighbourhood's **roads**."
}
```
- gap-fill: fill the gap with the correct option (remove the hint in brackets);
- "which sentence is correct": the correct sentence; error-spotting: the corrected sentence;
- "what does this sentence express": the sentence itself;
- several Greek sentences in one question: put each on its own line ("\n") in el and in tr/en.
**Bold** the part that the question was about, in all three languages. Questions without any Greek sentence
(pure rule questions) get no `sentence`.
