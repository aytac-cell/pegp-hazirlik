# Hover dictionary (Greek word form → meaning)

Files: data/src/dict/part1.json … part4.json — one JSON object each, keyed by the Greek word form in
lower case exactly as given in the input list (accents kept):

```
{
  "δρόμου": {"l": "δρόμος", "tr": "yol", "en": "road, street", "g": {"tr": "tamlayan hâl, tekil", "en": "genitive singular"}},
  "έγραψα": {"l": "γράφω", "tr": "yazmak", "en": "to write", "g": {"tr": "geçmiş zaman (aorist), ben", "en": "aorist, 1st sg"}},
  "του":    {"l": "ο / το", "tr": "-in (tanımlık); onun", "en": "of the (article); his/its", "g": {"tr": "eril/nötr tamlayan", "en": "masc./neut. genitive"}},
  "όθωνας": {"l": "Όθωνας", "tr": "Otto (Yunanistan'ın ilk kralı)", "en": "Otto (first King of Greece)", "g": null}
}
```
- `l`: dictionary form (lemma): nominative singular for nouns (with article is NOT needed), masculine singular for
  adjectives, 1st person singular present for verbs; the word itself for indeclinables.
- `tr` / `en`: short meaning (1–4 words; most common sense first, alternatives separated by "; ").
  For proper names: Turkish/English name + 2–5 word identification. Turkish must be correct, natural Turkish.
- `g`: short grammar hint only when the form is inflected away from the lemma (case/number, tense/person,
  gender of adjective, comparative…), in tr and en; otherwise null.
- Every input form must get an entry. If a token is not a real word (fragment, abbreviation part, typo), give
  your best reading (e.g. abbreviation expanded) — never leave it out.
