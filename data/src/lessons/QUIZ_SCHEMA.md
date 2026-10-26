# Section quiz questions

Every lesson section gets a `quiz` array: multiple-choice questions written FROM THAT SECTION'S OWN TEXT.
After reading a section the learner answers 10 random questions from this pool and must get 9/10.

```
"quiz": [
  {
    "q": {"el": "...", "tr": "...", "en": "..."},          // the question
    "options": [T, T, T, T],                                 // exactly 4, each {"el","tr","en"}
    "answer": 2,                                             // 0-based index of the correct option
    "explain": {"el": "...", "tr": "...", "en": "..."}       // 1 sentence: the fact from the lesson that answers it
  }
]
```

Rules:
1. **Only what the section teaches.** Every question must be answerable from the text, lists, tables, timeline,
   glossary or inflection tables of THIS section. Do not ask about anything that is not stated in it, and do not
   rely on outside knowledge. `explain` restates the lesson's fact.
2. **One clearly correct answer.** The 3 wrong options must be plausible (same type: dates with dates, names with
   names, forms with forms) but clearly wrong according to the lesson. No "all of the above"/"none of the above".
   No two options with the same meaning.
3. **Coverage.** Spread the questions over the whole section — every paragraph/table/list should be asked about at
   least once. Mix kinds: facts, dates, "which is true", Greek term ↔ meaning, cause/role, and (grammar) forms
   and rules.
4. **Count:** at least 15 questions per section (more for long sections, up to 25).
5. **Languages:** el = natural modern Greek (use the same Greek terms as the section's Greek text), tr = natural
   Turkish, en = English. For Greek forms/names that must stay Greek (e.g. «του δρόμου»), put the same Greek
   string in all three languages of that option.
6. Vary the position of the correct answer (not always the same index).
7. Keep everything else in the file unchanged.
