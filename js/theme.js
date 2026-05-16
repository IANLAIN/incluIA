/**
 * theme.js — Dark mode toggle + dyslexic font toggle
 * Persists choices to localStorage for cross-page continuity.
 */
export function initTheme() {
  // ── Dark Mode Toggle ─────────────────────────────────────
  const themeToggle = document.getElementById("theme-toggle");
  const html = document.documentElement;

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
    if (themeToggle) {
      themeToggle.textContent = theme === "dark" ? "☀" : "☾";
      themeToggle.setAttribute(
        "aria-pressed",
        theme === "dark" ? "true" : "false"
      );
    }
  }

  // Init from localStorage or system preference
  const saved = localStorage.getItem("app-theme");
  if (saved) {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = html.getAttribute("data-theme") || "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  // ── Dyslexic Font Toggle ───────────────────────────────────
  const dyslexicToggle = document.getElementById("dyslexic-toggle");

  function applyFont(font) {
    if (font === "dyslexic") {
      html.setAttribute("data-font", "dyslexic");
      localStorage.setItem("app-font", "dyslexic");
    } else {
      html.removeAttribute("data-font");
      localStorage.removeItem("app-font");
    }
    if (dyslexicToggle) {
      dyslexicToggle.setAttribute(
        "aria-pressed",
        font === "dyslexic" ? "true" : "false"
      );
      dyslexicToggle.style.background =
        font === "dyslexic" ? "var(--color-primary)" : "";
      dyslexicToggle.style.color =
        font === "dyslexic" ? "var(--btn-primary-text)" : "";
    }
  }

  // Init font from localStorage
  const savedFont = localStorage.getItem("app-font");
  applyFont(savedFont || "default");

  if (dyslexicToggle) {
    dyslexicToggle.addEventListener("click", () => {
      const current = html.getAttribute("data-font");
      applyFont(current === "dyslexic" ? "default" : "dyslexic");
    });
  }
}
