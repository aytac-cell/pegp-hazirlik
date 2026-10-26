# Question JSON schema (Π.Ε.Γ.Π. question bank, Nov 2026 edition)

Output file: a JSON array of question objects, one per ΘΕΜΑ, in official order.
Encoding UTF-8, valid JSON (no comments, no trailing commas).

`L` = localized text object: `{"el": "...", "tr": "...", "en": "..."}`
- `el`: the OFFICIAL Greek text, verbatim. Only repair PDF-extraction artifacts
  (words split by spaces/newlines like "Π εριφέρειες", "Ε νότητας", hyphen breaks, stray spaces
  before punctuation). Never reword, shorten, modernise or "correct" the official Greek.
- `tr`: faithful, natural Turkish translation (our own derivative work).
- `en`: faithful, natural English translation (our own derivative work).

Common fields on every question:
```
{
  "id": "geo-12",          // subject code + official ΘΕΜΑ number
  "subject": "geo",        // geo | his | cul | ins
  "n": 12,                 // official ΘΕΜΑ number
  "section": L | null,     // the section heading it sits under, e.g. "Α ΕΝΟΤΗΤΑ : ΓΕΝΙΚΕΣ ΕΡΩΤΗΣΕΙΣ", if the PDF has one
  "type": "mc" | "tf" | "fill" | "match" | "open" | "map",
  "prompt": L,             // the question itself (see below)
  "note": L | null,        // optional: anything the learner must know (e.g. "original shows a photo, omitted")
  "image": false           // true if the original question depends on a photo/picture we cannot show
}
```

`prompt`: drop only the pure exam boilerplate ("Γράψτε στο τετράδιό σας τον αριθμό του θέματος και
δίπλα τη σωστή απάντηση, σημειώνοντας το αντίστοιχο γράμμα (Α ή Β ή Γ ή Δ).", "...τον αριθμό της κάθε
πρότασης σημειώνοντας Σ, αν ... Λ, αν ...", "σημειώνοντας τον αριθμό από τη στήλη I και δίπλα το γράμμα...").
Keep every substantive part of the instruction. Examples:
- MC: prompt = "Πόσες είναι οι Περιφερειακές Ενότητες της Ελλάδας;"
- open: "Γράψτε στο τετράδιό σας τον αριθμό του θέματος και τέσσερις (4) από τις (13) Διοικητικές Περιφέρειες της Ελλάδας."
  → prompt.el = "Γράψτε τέσσερις (4) από τις (13) Διοικητικές Περιφέρειες της Ελλάδας."
- match: "…και αντιστοιχίστε κάθε χρονική περίοδο της στήλης I με ένα γεγονός της στήλης II…"
  → prompt.el = "Αντιστοιχίστε κάθε χρονική περίοδο της στήλης I με ένα γεγονός της στήλης II."
- tf: prompt.el = the lead-in if there is a substantive one, otherwise "Σωστό ή Λάθος;"

Type-specific fields:

mc — single correct answer among lettered options (keep official order Α,Β,Γ,Δ):
```
"options": [L, L, L, L], "answer": 3        // 0-based index of the correct option
```

tf — one or more statements, each Σωστό (true) / Λάθος (false):
```
"items": [{"text": L, "answer": true}, ...]
```

fill — fill-in-the-blanks text. Mark each blank in all three languages as "(1) ___", "(2) ___" …
(the same numbering in el/tr/en, placed where it fits naturally in the translation).
```
"text": L,
"bank": [L, ...] | null,     // the word/phrase list offered to choose from, if the question gives one (official order)
"answers": [L, ...]          // correct filler for blank 1, 2, … in order
```

match — column I to column II:
```
"left":  [L, ...],           // Στήλη I, official order (1,2,3,…)
"right": [L, ...],           // Στήλη II, official order (Α,Β,Γ,…); may be longer than left
"pairs": [[0, 2], [1, 3], ...]   // [leftIndex, rightIndex], 0-based, from the official ΑΠΑΝΤΗΣΗ
```
Use match also for "classify each item as X or Y" questions (e.g. "river or lake", "Easter or New Year"):
left = the items, right = the categories (pairs may reuse a right index).

open — free answer (lists, "write 4 of …", definitions):
```
"answer": L,                 // the official answer text in full
"items": [L, ...] | null,    // when the answer is a list of things, each element separately
"need": 4 | null             // how many items the question asks for, if it says so
```

map — "Βρείτε και σημειώστε με (●) στον χάρτη…" questions. The official answer is a map image,
so we draw our own map: give each place approximate WGS84 coordinates from your own knowledge.
```
"places": [{"name": L, "lat": 39.64, "lon": 22.42}, ...],
"need": 2 | null,            // if the question says "two (2) of …" etc.
"answer": L | null           // any textual answer the PDF gives, else null
```
For areas (regions, islands, lakes) use a representative central point. Coordinates must be on/inside
Greece and accurate to ~10 km. If a question asks to choose N of a larger set and the PDF shows which,
list those; otherwise list a sensible complete set and set "need".

Translation conventions (Turkish):
- Use a well-established Turkish exonym when one exists (Selanik, Girit, Rodos, Midilli, Sakız,
  İstanköy, Atina, Ege Denizi, Akdeniz, Meriç, Karaağaç…), otherwise standard Latin transliteration
  (Ioannina, Patra, Kalamata). Do not add the Greek name in parentheses in tr/en; el already has it.
- Historical terms: translate faithfully and neutrally, e.g. "Τουρκοκρατία" → "Osmanlı hâkimiyeti
  dönemi"; "Μικρασιατική Καταστροφή" → "Küçük Asya Felaketi". No commentary, no softening, no editorialising.
- Institutions: Βουλή → Yunan Parlamentosu (Vouli); Πρόεδρος της Δημοκρατίας → Cumhurbaşkanı, etc.
- English: standard English exonyms (Athens, Thessaloniki, Crete, Corfu).
