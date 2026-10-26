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

LSRC = SRC / "lessons"
LOUT = ROOT / "data" / "lessons.js"
BLOCKS = {"p", "list", "terms", "timeline", "map", "tip", "table"}

def is_T(x):
    return isinstance(x, dict) and all(isinstance(x.get(k), str) and x[k].strip() for k in ("tr", "en"))

def build_lessons(qmap):
    out = {}
    for s in SUBJECTS:
        f = LSRC / f"{s}.json"
        if not f.exists():
            errors.append(f"lessons: missing {f.name}")
            continue
        les = json.loads(f.read_text(encoding="utf-8"))
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
                elif bt == "table" and not (all(is_T(x) for x in b.get("head") or [None]) and all(all(is_T(c) for c in r) for r in b.get("rows") or [[None]])):
                    errors.append(f"{bw}: table")
        missing = [q for q in qmap if q.startswith(s + "-") and q not in covered]
        if missing:
            errors.append(f"{where}: questions not covered by any section: {', '.join(missing)}")
        out[s] = les
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
    lessons = build_lessons({q["id"]: q for q in allq})
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
