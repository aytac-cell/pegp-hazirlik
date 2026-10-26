// Map of Greece drawn from Natural Earth (public domain) outlines in data/greece-map.js.
// Supports a guessing mode: the learner taps where each place is, then the real pins appear.
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const M = window.GREECE_MAP;
  const GOOD_KM = 60;           // a guess this close counts as correct

  function proj(lat, lon) { return [(lon - M.lon0) * M.cos * M.k, (M.lat1 - lat) * M.k]; }
  function unproj(x, y) { return [M.lat1 - y / M.k, M.lon0 + x / (M.cos * M.k)]; }
  function km(a, b) {
    const R = 6371, r = Math.PI / 180;
    const dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // places: [{name: L, lat, lon}]; opts: { guess: bool, onChange(state) }
  function create(places, opts = {}) {
    const wrap = document.createElement("div");
    wrap.className = "map-wrap";
    const svg = el("svg", { viewBox: `0 0 ${M.w} ${M.h}`, role: "img", "aria-label": "Map of Greece" }, wrap);
    el("path", { d: M.land, class: "other" }, svg);
    el("path", { d: M.greece, class: "gr" }, svg);
    const gGuess = el("g", {}, svg), gPins = el("g", {}, svg);

    const state = { guesses: places.map(() => null), current: 0, revealed: false };

    function drawGuesses() {
      gGuess.innerHTML = "";
      state.guesses.forEach((g, i) => {
        if (!g) return;
        const [x, y] = proj(g[0], g[1]);
        if (state.revealed) {
          const [px, py] = proj(places[i].lat, places[i].lon);
          el("line", { x1: x, y1: y, x2: px, y2: py, class: "guess-line" }, gGuess);
        }
        const c = el("g", { class: "pin" }, gGuess);
        el("circle", { cx: x, cy: y, r: 12, class: "guess", style: "fill:var(--primary);stroke:#fff;stroke-width:2" }, c);
        el("text", { x, y }, c).textContent = i + 1;
      });
    }

    function reveal() {
      state.revealed = true;
      gPins.innerHTML = "";
      places.forEach((p, i) => {
        const [x, y] = proj(p.lat, p.lon);
        const g = el("g", { class: "pin" }, gPins);
        el("circle", { cx: x, cy: y, r: 13 }, g);
        el("text", { x, y }, g).textContent = i + 1;
        const t = el("text", { x: x + 17, y, class: "lbl" }, g);
        t.textContent = I18N.c(p.name);
      });
      drawGuesses();
      return results();
    }

    function results() {
      return places.map((p, i) => {
        const g = state.guesses[i];
        if (!g) return null;
        const d = Math.round(km(g, [p.lat, p.lon]));
        return { km: d, ok: d <= GOOD_KM };
      });
    }

    if (opts.guess) {
      svg.style.cursor = "crosshair";
      svg.addEventListener("click", ev => {
        if (state.revealed) return;
        const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
        const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
        state.guesses[state.current] = unproj(loc.x, loc.y);
        // move to the next place that has no guess yet
        const nextIdx = state.guesses.findIndex(g => !g);
        state.current = nextIdx === -1 ? state.current : nextIdx;
        drawGuesses();
        opts.onChange && opts.onChange(state);
      });
    }

    return {
      node: wrap, state, reveal, results,
      select(i) { state.current = i; opts.onChange && opts.onChange(state); },
      clear() { state.guesses = places.map(() => null); state.current = 0; drawGuesses(); opts.onChange && opts.onChange(state); }
    };
  }

  window.GreeceMap = { create, km, GOOD_KM };
})();
