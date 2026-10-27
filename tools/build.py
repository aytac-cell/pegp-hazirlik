"""Validate data/src/*.json and bundle them into data/questions.js.

Usage:  python tools/build.py
Fails loudly on any schema problem so a broken bank never reaches the site.
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "src"
OUT = ROOT / "data" / "questions.js"
SUBJECTS = ["geo", "cul", "his", "ins"]
TYPES = {"mc", "tf", "fill", "match", "open", "map"}
BLANK = re.compile(r"\((\d+)\)\s*_{2,}")

errors = []

def err(qid, msg):
    errors.append(f"{qid}: {msg}")

def is_L(x):
    return isinstance(x, dict) and all(isinstance(x.get(k), str) and x[k].strip() for k in ("el", "tr", "en"))

def check_L(qid, x, where, optional=False):
    if x is None and optional:
        return
    if not is_L(x):
        err(qid, f"{where} is not a complete {{el,tr,en}} object")

def check(q):
    qid = q.get("id", "?")
    if q.get("type") not in TYPES:
        err(qid, f"bad type {q.get('type')}")
        return
    check_L(qid, q.get("prompt"), "prompt")
    check_L(qid, q.get("note"), "note", optional=True)
    check_L(qid, q.get("section"), "section", optional=True)
    t = q["type"]
    if t == "mc":
        opts = q.get("options") or []
        for i, o in enumerate(opts):
            check_L(qid, o, f"options[{i}]")
        if not (len(opts) >= 2 and isinstance(q.get("answer"), int) and 0 <= q["answer"] < len(opts)):
            err(qid, "mc answer out of range")
    elif t == "tf":
        items = q.get("items") or []
        if not items:
            err(qid, "tf without items")
        for i, it in enumerate(items):
            check_L(qid, it.get("text"), f"items[{i}].text")
            if not isinstance(it.get("answer"), bool):
                err(qid, f"items[{i}].answer not bool")
    elif t == "match":
        left, right, pairs = q.get("left") or [], q.get("right") or [], q.get("pairs") or []
        for i, o in enumerate(left):
            check_L(qid, o, f"left[{i}]")
        for i, o in enumerate(right):
            check_L(qid, o, f"right[{i}]")
        if not left or not right:
            err(qid, "match without columns")
        for p in pairs:
            if not (isinstance(p, list) and len(p) == 2 and 0 <= p[0] < len(left) and 0 <= p[1] < len(right)):
                err(qid, f"bad pair {p}")
        if {p[0] for p in pairs if isinstance(p, list) and p} != set(range(len(left))):
            err(qid, "not every left item has a pair")
    elif t == "fill":
        check_L(qid, q.get("text"), "text")
        answers = q.get("answers") or []
        for i, a in enumerate(answers):
            check_L(qid, a, f"answers[{i}]")
        if is_L(q.get("text")):
            for lang in ("el", "tr", "en"):
                n = len(BLANK.findall(q["text"][lang]))
                if n != len(answers):
                    err(qid, f"fill: {n} blanks in {lang} but {len(answers)} answers")
        for i, b in enumerate(q.get("bank") or []):
            check_L(qid, b, f"bank[{i}]")
    elif t == "open":
        check_L(qid, q.get("answer"), "answer")
        for i, a in enumerate(q.get("items") or []):
            check_L(qid, a, f"items[{i}]")
    elif t == "map":
        places = q.get("places") or []
        if not places:
            err(qid, "map without places")
        for i, p in enumerate(places):
            check_L(qid, p.get("name"), f"places[{i}].name")
            lat, lon = p.get("lat"), p.get("lon")
            if not (isinstance(lat, (int, float)) and isinstance(lon, (int, float)) and 34.5 <= lat <= 42 and 19 <= lon <= 30.5):
                err(qid, f"places[{i}] coordinates outside Greece: {lat},{lon}")
        check_L(qid, q.get("answer"), "answer", optional=True)

ISRC = SRC / "images"
ALLOWED_LICENSE = ("public domain", "pd", "cc0", "cc by", "cc-by")

def attach_images(qmap):
    """Attach freely licensed replacement images (data/src/images/*.json) to photo-based questions."""
    n = 0
    for f in sorted(ISRC.glob("*.json")) if ISRC.exists() else []:
        for qid, entry in json.loads(f.read_text(encoding="utf-8")).items():
            q = qmap.get(qid)
            where = f"images/{f.name}/{qid}"
            if not q:
                errors.append(f"{where}: unknown question"); continue
            imgs = entry.get("images") or []
            if not imgs:
                errors.append(f"{where}: no images"); continue
            for im in imgs:
                path = ROOT / (im.get("file") or "")
                lic = (im.get("license") or "").lower()
                if not im.get("file") or not path.is_file():
                    errors.append(f"{where}: missing file {im.get('file')}")
                elif path.stat().st_size > 250_000:
                    errors.append(f"{where}: {im['file']} is larger than 250 KB")
                if not lic.startswith(ALLOWED_LICENSE) or "nc" in lic.replace("-", " ").split():
                    errors.append(f"{where}: license not allowed: {im.get('license')}")
                if not str(im.get("source", "")).startswith("https://commons.wikimedia.org/wiki/File:"):
                    errors.append(f"{where}: source must be a Commons file page")
                if not is_L(im.get("subject")) or not str(im.get("author", "")).strip():
                    errors.append(f"{where}: subject/author")
            q["images"] = imgs
            n += 1
    return n

LSRC = SRC / "lessons"
LOUT = ROOT / "data" / "lessons.js"
BLOCKS = {"p", "list", "terms", "timeline", "map", "tip", "table", "decl", "conj", "examples"}
TENSES = ["present", "imperfect", "aorist", "fut_cont", "fut_simple", "perfect", "pluperfect", "fut_perfect", "subj_simple", "imperative"]
GRAM_PARTS = ["nouns", "verbs", "irregular"]

def strs(xs, n):
    return isinstance(xs, list) and len(xs) == n and all(isinstance(x, str) and x.strip() for x in xs)

def check_tenses(where, tenses):
    """tenses: list of (id, forms)"""
    if not tenses:
        errors.append(f"{where}: no tenses")
    for tid, forms in tenses:
        if tid not in TENSES:
            errors.append(f"{where}: unknown tense {tid}")
        elif not strs(forms, 2 if tid == "imperative" else 6):
            errors.append(f"{where}: tense {tid} needs {2 if tid == 'imperative' else 6} forms")

def load_lesson(s):
    """Subject lessons are one file; the grammar course is assembled from part files."""
    if s != "gram":
        f = LSRC / f"{s}.json"
        return json.loads(f.read_text(encoding="utf-8")) if f.exists() else None
    intro = LSRC / "gram" / "_intro.json"
    if not intro.exists():
        return None
    les = {"subject": "gram", "intro": json.loads(intro.read_text(encoding="utf-8"))["intro"], "sections": []}
    for part in GRAM_PARTS:
        f = LSRC / "gram" / f"{part}.json"
        if not f.exists():
            errors.append(f"lessons/gram: missing {part}.json")
            continue
        les["sections"].extend(json.loads(f.read_text(encoding="utf-8"))["sections"])
    return les

def is_T(x):
    return isinstance(x, dict) and all(isinstance(x.get(k), str) and x[k].strip() for k in ("tr", "en"))

def build_lessons(qmap):
    # lesson texts are read in Turkish, English or Greek, so every text needs all three
    is_T = is_L
    out = {}
    for s in SUBJECTS + ["gram"]:
        les = load_lesson(s)
        if les is None:
            errors.append(f"lessons: missing {s}")
            continue
        where = f"lessons/{s}"
        if not is_T(les.get("intro")):
            errors.append(f"{where}: intro")
        seen_ids, covered = set(), set()
        for sec in les.get("sections", []):
            sid = sec.get("id", "?")
            w = f"{where}/{sid}"
            if sid in seen_ids or not sid.startswith(s + "-"):
                errors.append(f"{w}: bad or duplicate id")
            seen_ids.add(sid)
            if not is_L(sec.get("title")):
                errors.append(f"{w}: title")
            if not is_T(sec.get("summary")):
                errors.append(f"{w}: summary")
            for qid in sec.get("questions", []):
                if qid not in qmap:
                    errors.append(f"{w}: unknown question {qid}")
                covered.add(qid)
            quiz = sec.get("quiz") or []
            if len(quiz) < 15:
                errors.append(f"{w}: quiz needs at least 15 questions (has {len(quiz)})")
            for qi, x in enumerate(quiz):
                opts = x.get("options") or []
                if not (is_L(x.get("q")) and is_L(x.get("explain")) and len(opts) == 4 and all(is_L(o) for o in opts)
                        and isinstance(x.get("answer"), int) and 0 <= x["answer"] < 4
                        and len({o["tr"].strip() for o in opts}) == 4 and len({o["el"].strip() for o in opts}) == 4):
                    errors.append(f"{w}: quiz[{qi}] malformed")
            for i, b in enumerate(sec.get("blocks", [])):
                bt = b.get("type")
                bw = f"{w} block {i}"
                if bt not in BLOCKS:
                    errors.append(f"{bw}: type {bt}")
                elif bt in ("p", "tip") and not is_T(b.get("text")):
                    errors.append(f"{bw}: text")
                elif bt == "list" and not all(is_T(x) for x in b.get("items") or [None]):
                    errors.append(f"{bw}: items")
                elif bt == "terms" and not all(is_L(x) for x in b.get("items") or [None]):
                    errors.append(f"{bw}: terms")
                elif bt == "timeline" and not all(isinstance(x.get("date"), str) and is_T(x.get("text")) for x in b.get("items") or [{}]):
                    errors.append(f"{bw}: timeline")
                elif bt == "map":
                    for p in b.get("places") or [None]:
                        if not (p and is_L(p.get("name")) and 34.5 <= p.get("lat", 0) <= 42 and 19 <= p.get("lon", 0) <= 30.5):
                            errors.append(f"{bw}: place {p and p.get('name')}")
                elif bt == "examples" and not (b.get("items") and all(is_L(x) and (x.get("note") is None or is_T(x.get("note"))) for x in b["items"]) and (b.get("title") is None or is_T(b.get("title")))):
                    errors.append(f"{bw}: examples")
                elif bt == "decl" and not (is_L(b.get("word")) and strs(b.get("sg"), 4) and strs(b.get("pl"), 4) and (b.get("note") is None or is_T(b.get("note")))):
                    errors.append(f"{bw}: decl")
                elif bt == "conj":
                    if not is_L(b.get("verb")) or not (b.get("note") is None or is_T(b.get("note"))):
                        errors.append(f"{bw}: conj verb/note")
                    check_tenses(bw, [(x.get("id"), x.get("forms")) for x in b.get("tenses") or []])
                elif bt == "table" and not (all(is_T(x) for x in b.get("head") or [None]) and all(all(is_T(c) for c in r) for r in b.get("rows") or [[None]])):
                    errors.append(f"{bw}: table")
        missing = [q for q in qmap if q.startswith(s + "-") and q not in covered]
        if missing:
            errors.append(f"{where}: questions not covered by any section: {', '.join(missing)}")
        out[s] = les
    return out

WSRC = SRC / "words"
WOUT = ROOT / "data" / "words.js"
LEVELS = ["a1", "a2", "b1"]

def build_words():
    out, ids = [], set()
    for lv in LEVELS:
        f = WSRC / f"{lv}.json"
        if not f.exists():
            errors.append(f"words: missing {f.name}")
            continue
        d = json.loads(f.read_text(encoding="utf-8"))
        if d.get("level") != lv or not is_T(d.get("name")) or not is_T(d.get("blurb")):
            errors.append(f"words/{lv}: header")
        for c in d.get("cats", []):
            if not is_L(c.get("name")) or not c.get("words"):
                errors.append(f"words/{lv}/{c.get('id')}: name or words")
            for w in c.get("words", []):
                wid = w.get("id")
                if not wid or wid in ids:
                    errors.append(f"words/{lv}: bad or duplicate id {wid}")
                ids.add(wid)
                if not all(isinstance(w.get(k), str) and w[k].strip() for k in ("el", "pron", "tr", "en")):
                    errors.append(f"words/{wid}: missing el/pron/tr/en")
                if not isinstance(w.get("pic", ""), str) or len(w.get("pic", "")) > 12:
                    errors.append(f"words/{wid}: pic")
                f = w.get("forms")
                if f is not None:
                    if "sg" in f or "pl" in f:
                        if not (strs(f.get("sg"), 4) and strs(f.get("pl"), 4)):
                            errors.append(f"words/{wid}: noun forms need 4 sg + 4 pl")
                    else:
                        check_tenses(f"words/{wid}", list(f.items()))
        out.append(d)
    return out

def main():
    allq = []
    for s in SUBJECTS:
        f = SRC / f"{s}.json"
        if not f.exists():
            print(f"missing {f}", file=sys.stderr)
            sys.exit(1)
        qs = json.loads(f.read_text(encoding="utf-8"))
        ns = [q.get("n") for q in qs]
        if ns != list(range(1, len(qs) + 1)):
            errors.append(f"{s}: question numbers are not 1..{len(qs)} in order")
        for q in qs:
            if q.get("subject") != s or q.get("id") != f"{s}-{q.get('n')}":
                err(q.get("id"), "id/subject mismatch")
            check(q)
        allq.extend(qs)
        counts = {}
        for q in qs:
            counts[q["type"]] = counts.get(q["type"], 0) + 1
        print(f"{s}: {len(qs)} {counts}")
    with_img = attach_images({q["id"]: q for q in allq})
    print(f"images: {with_img} questions with free replacement images")
    lessons = build_lessons({q["id"]: q for q in allq})
    words = build_words()
    if errors:
        print("\n".join(errors), file=sys.stderr)
        print(f"{len(errors)} problem(s); not writing output", file=sys.stderr)
        sys.exit(1)
    LOUT.write_text(
        "// Generated by tools/build.py from data/src/lessons/*.json. Do not edit by hand.\n"
        "// Lesson notes are this site's own teaching material, not official content.\n"
        f"window.LESSONS = {json.dumps(lessons, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8",
    )
    print(f"wrote {LOUT} ({sum(len(l['sections']) for l in lessons.values())} sections, {LOUT.stat().st_size // 1024} KB)")
    WOUT.write_text(
        "// Generated by tools/build.py from data/src/words/*.json. Do not edit by hand.\n"
        "// Vocabulary list and emoji pictures are this site's own content.\n"
        f"window.WORDS = {json.dumps(words, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8",
    )
    print(f"wrote {WOUT} ({sum(len(c['words']) for l in words for c in l['cats'])} words)")
    body = json.dumps(allq, ensure_ascii=False, separators=(",", ":"))
    OUT.write_text(
        "// Generated by tools/build.py from data/src/*.json. Do not edit by hand.\n"
        "// Questions: Υπουργείο Εσωτερικών – Γενική Γραμματεία Ιθαγένειας – Πλατφόρμα Εξετάσεων Π.Ε.Γ.Π.\n"
        "// (https://exetaseis-ithageneia.ypes.gr), bank of November 2026. Translations (tr/en) are our own.\n"
        f"window.QUESTIONS = {body};\n",
        encoding="utf-8",
    )
    print(f"wrote {OUT} ({len(allq)} questions, {OUT.stat().st_size // 1024} KB)")

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
