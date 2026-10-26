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
