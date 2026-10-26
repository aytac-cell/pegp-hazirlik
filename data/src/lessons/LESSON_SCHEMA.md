# Lesson JSON schema

One file per subject: `data/src/lessons/{geo,cul,his,ins}.json`. UTF-8, valid JSON.
Lessons are OUR OWN teaching material (not official). They exist to help a learner (Turkish-speaking,
also English UI) understand and remember everything the official question bank asks about.

`T` = `{"el": "...", "tr": "...", "en": "..."}` (Greek + Turkish + English, all required; learners can read lessons in any of them)
`G` = `{"el": "...", "tr": "...", "en": "..."}` (Greek term + translations)

```
{
  "subject": "his",
  "intro": T,                        // 2–4 sentences: what this subject covers in the exam, how to study it
  "sections": [
    {
      "id": "his-revolution",        // "<subject>-<kebab-slug>", unique
      "title": G,                    // el = a natural Greek title for the topic
      "icon": "⚔️",                  // one emoji
      "summary": T,                  // one sentence, shown in the table of contents
      "blocks": [ Block, ... ],
      "questions": ["his-12", "his-54"]   // ids of bank questions this section prepares for
    }
  ]
}
```

Block types:
- `{"type": "p", "text": T}` — a paragraph. Plain text; you may use **bold** (double asterisks) for key facts.
- `{"type": "list", "items": [T, ...]}` — bullet list.
- `{"type": "terms", "items": [G, ...]}` — glossary of Greek names/terms the learner must recognise
  in the exam (the exam is in Greek!). el must be spelled exactly as in the question bank.
- `{"type": "timeline", "items": [{"date": "1821", "text": T}, ...]}` — chronological events.
- `{"type": "map", "places": [{"name": G, "lat": 38.0, "lon": 23.7}, ...]}` — pins on our map of Greece
  (coordinates within Greece, ±10 km).
- `{"type": "tip", "text": T}` — exam tip / memory trick (e.g. a mnemonic, or "watch out: the bank says X").
- `{"type": "table", "head": [T, ...], "rows": [[T, ...], ...]}` — small comparison table (≤ 5 columns).

Rules:
1. **Accuracy first.** Every fact must agree with the official answers in the question bank file.
   Where the bank states something, teach exactly that (even if simplified). Do not add facts you are not
   sure of. General well-known context is fine if you are certain it is correct.
2. **Coverage.** Every question id of the subject must appear in at least one section's `questions`.
   The lesson must teach every fact needed to answer those questions — including the correct options
   of multiple choice, true/false statements (teach the true fact; for false statements teach the correct
   version), matching pairs, fill-in answers, open-answer lists and map locations.
3. Questions marked `"image": true` still go into a section; teach the underlying fact (e.g. who the
   person is and why they matter) without describing photos.
4. Structure: 6–12 sections per subject, logical order (history chronological; institutions from
   constitution → state organs → justice → local government → EU/international → citizen rights/services).
   Each section 3–10 blocks. Prefer short paragraphs, lists, tables and timelines over walls of text.
5. Tone: clear, friendly, for adults; Turkish natural and correct (use the same Turkish exonyms as the
   question file's tr fields). Neutral and faithful on Greek–Ottoman/Turkish history: present the
   official Greek perspective the exam expects, factually, without editorialising.
6. Always include a `terms` block in every section with the Greek forms the exam uses.

Every section also needs a `quiz` array (≥ 15 multiple-choice questions written from the section's own text);
see QUIZ_SCHEMA.md.
