// Hover dictionary: point at (or tap) any Greek word to see its dictionary form, meaning and grammar hint.
// Data: window.GREEK_DICT (data/dict.js) — keys are lower-case word forms as they appear on the site.
(function () {
  const GREEK = /[Ͱ-Ͽἀ-῿]/;
  // where a translation would give an answer away (vocabulary trainer prompts and options)
  const BLOCKED = ".word-card, input, textarea, select, .lightbox";
  let tip = null, lastKey = "", raf = 0;

  const enabled = () => Store.setting("hoverDict") !== false && !!window.GREEK_DICT;
  const esc = s => Cards.esc(s);

  function wordAt(x, y) {
    let node, offset;
    if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(x, y); if (!p) return null;
      node = p.offsetNode; offset = p.offset;
    } else if (document.caretRangeFromPoint) {
      const r = document.caretRangeFromPoint(x, y); if (!r) return null;
      node = r.startContainer; offset = r.startOffset;
    } else return null;
    if (!node || node.nodeType !== 3 || !GREEK.test(node.textContent)) return null;
    if (node.parentElement && node.parentElement.closest(BLOCKED)) return null;
    const text = node.textContent;
    let a = offset, b = offset;
    while (a > 0 && GREEK.test(text[a - 1])) a--;
    while (b < text.length && GREEK.test(text[b])) b++;
    if (b - a < 2) return null;
    const range = document.createRange();
    range.setStart(node, a); range.setEnd(node, b);
    // only when the pointer is really over the word (not in the empty space after a line)
    const rect = [...range.getClientRects()].find(r => x >= r.left - 1 && x <= r.right + 1 && y >= r.top - 1 && y <= r.bottom + 1);
    if (!rect) return null;
    return { word: text.slice(a, b), range, rect };
  }

  function lookup(word) {
    const D = window.GREEK_DICT;
    const low = word.toLocaleLowerCase("el");
    return D[low] || D[low.replace(/σ$/, "ς")] || D[word] || null;
  }

  function show(hit, entry) {
    if (!tip) { tip = document.createElement("div"); tip.className = "wtip"; tip.setAttribute("role", "tooltip"); document.body.appendChild(tip); }
    const L = I18N.lang === "en" ? "en" : "tr";
    const g = entry.g ? (entry.g[L] || entry.g.tr) : "";
    const lemma = entry.l && entry.l.toLocaleLowerCase("el") !== hit.word.toLocaleLowerCase("el") ? `<span class="wt-l" lang="el">${esc(entry.l)}</span>` : "";
    tip.innerHTML = `<div><b lang="el">${esc(hit.word)}</b>${lemma ? ` → ${lemma}` : ""}</div><div class="wt-m">${esc(entry[L] || entry.tr)}</div>${g ? `<div class="wt-g">${esc(g)}</div>` : ""}`;
    tip.style.display = "block";
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let left = Math.min(window.innerWidth - tw - 8, Math.max(8, hit.rect.left + hit.rect.width / 2 - tw / 2));
    let top = hit.rect.top - th - 8;
    if (top < 8) top = hit.rect.bottom + 8;
    tip.style.left = left + "px"; tip.style.top = top + "px";
    if (window.CSS && CSS.highlights && window.Highlight) CSS.highlights.set("hover-word", new Highlight(hit.range));
  }

  function hide() {
    lastKey = "";
    if (tip) tip.style.display = "none";
    if (window.CSS && CSS.highlights) CSS.highlights.delete("hover-word");
  }

  function at(x, y) {
    if (!enabled()) return hide();
    const hit = wordAt(x, y);
    if (!hit) return hide();
    const key = hit.word + "@" + Math.round(hit.rect.left) + "," + Math.round(hit.rect.top);
    if (key === lastKey) return;
    const entry = lookup(hit.word);
    if (!entry) return hide();
    lastKey = key;
    show(hit, entry);
  }

  // mouse: follow the pointer
  // throttled: at most one lookup every 40 ms, plus one for the final resting position
  let last = 0;
  document.addEventListener("mousemove", e => {
    const now = performance.now();
    clearTimeout(raf);
    if (now - last > 40) { last = now; at(e.clientX, e.clientY); }
    else raf = setTimeout(() => { last = performance.now(); at(e.clientX, e.clientY); }, 45);
  }, { passive: true });
  document.addEventListener("scroll", hide, { passive: true, capture: true });
  document.addEventListener("mouseleave", hide);
  // touch: tap a Greek word (outside buttons and links) to see its meaning; tap elsewhere to close
  document.addEventListener("click", e => {
    if (e.pointerType === "mouse" || (e.detail === 0)) return;
    if (e.target.closest("a, button, label, summary, [data-zoom]")) return;
    const before = lastKey;
    at(e.clientX, e.clientY);
    if (!lastKey || lastKey === before) { if (lastKey === before) hide(); }
  });
  window.addEventListener("hashchange", hide);

  window.HoverDict = { hide };
})();
