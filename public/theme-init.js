// Applies the saved light/dark choice before first paint, so the page never flashes the wrong theme.
// Kept as a separate file because the Content-Security-Policy blocks inline scripts.
(function () {
  try {
    var saved = localStorage.getItem("sarala.theme");
    var dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
