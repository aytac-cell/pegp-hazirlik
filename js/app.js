// Boot, hash router, theme/language, service worker.
(function () {
  const routes = {
    "": Views.home,
    "study": Views.study,
    "learn": Views.learn,
    "words": p => window.WordsView(p),
    "browse": Views.browse,
    "exam": Views.exam,
    "stats": Views.stats,
    "settings": Views.settings,
    "about": Views.about
  };
  let cleanup = null;

  function route() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [path, qs] = raw.split("?");
    const name = path.split("/")[0];
    const view = routes[name] || Views.notFound;
    if (typeof cleanup === "function") cleanup();
    cleanup = null;
    if (!window.QUESTIONS || !window.QUESTIONS.length) {
      document.getElementById("app").innerHTML = `<div class="card empty"><p>${I18N.t("loadingFail")}</p></div>`;
      return;
    }
    cleanup = view(new URLSearchParams(qs || ""));
    const navKey = name || "home";
    document.querySelectorAll("[data-nav]").forEach(a => a.classList.toggle("active", a.dataset.nav === navKey || (navKey === "browse" && a.dataset.nav === "home")));
    document.getElementById("app").focus({ preventScroll: true });
    if (name !== "browse") window.scrollTo(0, 0);
  }

  function applySettings() {
    I18N.set(Store.setting("lang"));
    const theme = Store.setting("theme");
    if (theme === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.dataset.theme = theme;
    document.getElementById("langBtn").textContent = I18N.lang.toUpperCase();
    document.getElementById("verLink").textContent = I18N.t("version", { v: window.APP_VERSION });
    const badge = document.getElementById("verBadge");
    badge.textContent = "v" + window.APP_VERSION;
    badge.title = I18N.t("changesTitle");
    I18N.apply(document);
  }

  document.getElementById("langBtn").addEventListener("click", () => {
    Store.setting("lang", I18N.lang === "tr" ? "en" : "tr");
    applySettings(); route();
  });
  document.getElementById("themeBtn").addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme === "dark" ||
      (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    Store.setting("theme", dark ? "light" : "dark");
    applySettings();
  });

  window.addEventListener("hashchange", route);
  window.App = { applySettings: () => { applySettings(); } };
  applySettings();
  route();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
