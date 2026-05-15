import { setupNavigation, setActiveNav } from "./navigation.js";
import { initAuth } from "./auth.js";
import { initAiSim } from "./ai-sim.js";

const app = document.getElementById("app");
const defaultRoute = "pages/landing.html";
const routes = new Map([
  ["index.html", defaultRoute],
  ["pages/landing.html", "pages/landing.html"],
  ["pages/login.html", "pages/login.html"],
  ["pages/dashboard-candidate.html", "pages/dashboard-candidate.html"],
  ["pages/dashboard-company.html", "pages/dashboard-company.html"],
  ["pages/mentoring.html", "pages/mentoring.html"],
  ["pages/candidate-dashboard.html", "pages/dashboard-candidate.html"],
  ["pages/company-dashboard.html", "pages/dashboard-company.html"],
]);

// Resolve the current location to a known route.
function resolveRouteFromLocation() {
  const path = window.location.pathname.replace(/\\/g, "/");
  if (path.endsWith("/") || path.endsWith("/index.html")) {
    return defaultRoute;
  }
  const match = Array.from(routes.keys()).find((key) => path.endsWith(key));
  return match ? routes.get(match) : defaultRoute;
}

// Fetch a page and inject its main content into the shell.
async function loadPage(path, { pushState = true } = {}) {
  if (!app) {
    return;
  }
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Fetch failed");
    }
    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const content = parsed.getElementById("page-content");
    if (!content) {
      throw new Error("Content missing");
    }
    app.innerHTML = content.innerHTML;
    upgradeInternalLinks(app);
    if (parsed.title) {
      document.title = parsed.title;
    }
    initPageInteractions(app);
    setActiveNav(path);
    if (pushState) {
      history.pushState({ path }, "", path);
    }
    app.focus();
  } catch (error) {
    app.innerHTML = "<div class=\"card\"><h2>Error al cargar</h2><p>Intenta nuevamente o usa el menu.</p></div>";
  }
}

// Initialize UI behavior for the current page.
function initPageInteractions(root) {
  initAuth(root);
  initAiSim(root);
}

// Normalize internal links when content is loaded inside the SPA shell.
function upgradeInternalLinks(root) {
  const pageMap = {
    "landing.html": "landing.html",
    "login.html": "login.html",
    "dashboard-candidate.html": "dashboard-candidate.html",
    "dashboard-company.html": "dashboard-company.html",
    "mentoring.html": "mentoring.html",
    "candidate-dashboard.html": "dashboard-candidate.html",
    "company-dashboard.html": "dashboard-company.html",
  };
  root.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    const normalized = pageMap[href];
    if (normalized) {
      link.setAttribute("href", `pages/${normalized}`);
      link.setAttribute("data-nav", "");
    }
  });
}

if (app) {
  setupNavigation({ onNavigate: loadPage, useSpa: true });
  window.addEventListener("popstate", () => {
    const path = resolveRouteFromLocation();
    loadPage(path, { pushState: false });
  });
  const initial = resolveRouteFromLocation();
  loadPage(initial, { pushState: false });
} else {
  setupNavigation({ useSpa: false });
  initPageInteractions(document);
}
