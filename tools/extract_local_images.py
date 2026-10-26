"""Extract the ORIGINAL pictures of photo-based questions from the official question-bank PDFs,
for personal, local study only. Output is git-ignored and never published:
  images/local/<id>[-<slot>].jpg   and   data/local-images.js  (window.LOCAL_IMAGES)

Usage:  python tools/extract_local_images.py            (PDFs in kaynak-pdf/{his,cul}.pdf)
"""
import json, pathlib, re, sys

import fitz  # PyMuPDF

ROOT = pathlib.Path(__file__).resolve().parent.parent
PDFS = ROOT / "kaynak-pdf"
OUT = ROOT / "images" / "local"
JS = ROOT / "data" / "local-images.js"
GREEK_SLOTS = "ΑΒΓΔ"


def question_regions(doc):
    """{number: [(page_index, y_top, y_bottom)]} — the area between a ΘΕΜΑ heading and the next one."""
    heads = []
    for i, page in enumerate(doc):
        for b in page.get_text("blocks"):
            m = re.match(r"\s*Θ\s*Ε\s*Μ\s*Α\s+(\d+)", b[4].replace("\n", " "))
            if m:
                heads.append((int(m.group(1)), i, b[1]))
    heads.sort(key=lambda h: (h[1], h[2]))
    regions = {}
    for k, (n, pg, y) in enumerate(heads):
        nxt = heads[k + 1] if k + 1 < len(heads) else None
        if nxt and nxt[1] == pg:
            regions[n] = [(pg, y, nxt[2])]
        else:  # runs to the end of the page (and onto the next page up to the next heading)
            regions[n] = [(pg, y, 10_000)]
            if nxt and nxt[1] == pg + 1:
                regions[n].append((pg + 1, 0, nxt[2]))
    # a heading printed as an image can't be found: use the whole page(s) between its neighbours
    found = {h[0]: h for h in heads}
    for n in range(1, max(found, default=0)):
        if n not in found and n - 1 in found and n + 1 in found:
            between = range(found[n - 1][1] + 1, found[n + 1][1])
            if len(between) == 1:
                regions[n] = [(between[0], 0, 10_000)]
                regions[n - 1] = [r for r in regions[n - 1] if r[0] != between[0]]
    return regions


def pictures_in(doc, region):
    pics = []
    for pg, top, bottom in region:
        page = doc[pg]
        for info in page.get_image_info():
            x0, y0, x1, y1 = info["bbox"]
            if (x1 - x0) < 60 or (y1 - y0) < 60:      # skip decorations
                continue
            if top - 5 <= y0 and y1 <= bottom + 5:
                pics.append((pg, fitz.Rect(x0, y0, x1, y1)))
    return pics


def reading_order(pics):
    """rows by overlapping vertical ranges, left to right inside a row (Εικ. Α Β / Γ Δ layout)"""
    pics = sorted(pics, key=lambda p: (p[0], p[1].y0))
    rows = []
    for p in pics:
        if rows and rows[-1][0][0] == p[0] and p[1].y0 < max(r[1].y1 for r in rows[-1]) - 10:
            rows[-1].append(p)
        else:
            rows.append([p])
    return [p for row in rows for p in sorted(row, key=lambda p: p[1].x0)]


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    OUT.mkdir(parents=True, exist_ok=True)
    result, problems = {}, []
    for subj in ("his", "cul"):
        questions = json.loads((ROOT / "data" / "src" / f"{subj}.json").read_text(encoding="utf-8"))
        doc = fitz.open(PDFS / f"{subj}.pdf")
        regions = question_regions(doc)
        for q in questions:
            if not q.get("image"):
                continue
            qid = q["id"]
            pics = reading_order(pictures_in(doc, regions.get(q["n"], [])))
            if not pics:
                problems.append(f"{qid}: no picture found"); continue
            # several pictures: lettered Εικ. Α–Δ, or numbered 1–4 when the question numbers them
            numbered = len(pics) > 1 and re.search(r"εικόνας|Εικόνα\s*1|\b1\b", json.dumps(q["items"] if q["type"] == "tf" else [], ensure_ascii=False)) is not None and "Εικ. Α" not in json.dumps(q, ensure_ascii=False)
            entries = []
            for k, (pg, rect) in enumerate(pics):
                slot = None if len(pics) == 1 else (str(k + 1) if numbered else GREEK_SLOTS[k])
                name = f"{qid}.jpg" if slot is None else f"{qid}-{k + 1}.jpg"
                pix = doc[pg].get_pixmap(clip=rect, dpi=200)
                if pix.width > 900:
                    pix = doc[pg].get_pixmap(clip=rect, dpi=int(200 * 900 / pix.width))
                pix.save(OUT / name, jpg_quality=85)
                entries.append({"slot": slot, "file": f"images/local/{name}", "w": pix.width, "h": pix.height})
            result[qid] = entries
            print(f"{qid}: {len(entries)} picture(s) {[e['slot'] for e in entries]}")
    JS.write_text(
        "// LOCAL ONLY (git-ignored): original pictures from the official PDFs, for personal study.\n"
        f"window.LOCAL_IMAGES = {json.dumps(result, ensure_ascii=False)};\n", encoding="utf-8")
    print(f"wrote {JS} for {len(result)} questions")
    for p in problems:
        print("PROBLEM:", p)


if __name__ == "__main__":
    main()
