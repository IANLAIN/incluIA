/**
 * theme.js — Dark/Light mode + Dyslexic font toggle
 * Persists preferences in localStorage.
 * Dyslexic mode adds [data-font="dyslexic"] to <html>,
 * which the CSS rule in styles.css picks up automatically.
 */
export function initTheme() {
  // ── Dark / Light mode ─────────────────────────────────────────
  const savedTheme = localStorage.getItem("app-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  document.querySelectorAll("#theme-toggle").forEach(btn => {
    btn.textContent = savedTheme === "dark" ? "☀️" : "🌙";
    btn.setAttribute("aria-pressed", savedTheme === "dark");

    btn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const newTheme = isDark ? "light" : "dark";

      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("app-theme", newTheme);

      document.querySelectorAll("#theme-toggle").forEach(b => {
        b.textContent = newTheme === "dark" ? "☀️" : "🌙";
        b.setAttribute("aria-pressed", newTheme === "dark");
      });
    });
  });

  // ── Dyslexic font toggle ───────────────────────────────────────
  // Looks for any button with id="dyslexic-toggle" in the page.
  // When activated, sets data-font="dyslexic" on <html>.
  // CSS in styles.css applies 'OpenDyslexic' to all elements.
  const savedFont = localStorage.getItem("app-font") || "default";
  if (savedFont === "dyslexic") {
    document.documentElement.setAttribute("data-font", "dyslexic");
  }

  document.querySelectorAll("#dyslexic-toggle").forEach(btn => {
    const isActive = savedFont === "dyslexic";
    btn.setAttribute("aria-pressed", isActive);
    btn.textContent = isActive ? "Aa (normal)" : "Aa (dislexia)";

    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-font");
      const next = current === "dyslexic" ? "default" : "dyslexic";

      if (next === "dyslexic") {
        document.documentElement.setAttribute("data-font", "dyslexic");
      } else {
        document.documentElement.removeAttribute("data-font");
      }

      localStorage.setItem("app-font", next);

      document.querySelectorAll("#dyslexic-toggle").forEach(b => {
        b.setAttribute("aria-pressed", next === "dyslexic");
        b.textContent = next === "dyslexic" ? "Aa (normal)" : "Aa (dislexia)";
      });
    });
  });
}
