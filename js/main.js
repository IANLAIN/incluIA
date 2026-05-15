import { setupNavigation, setActiveNav } from "./navigation.js";
import { initAuth } from "./auth.js";
import { initAiSim } from "./ai-sim.js";
import { initI18nSelect, initLanguageGate, applyTranslations } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initOnboarding } from "./onboarding.js";

const app = document.getElementById("app");
const defaultRoute = "index.html";
const routes = new Map([
  ["index.html", defaultRoute],
  ["login.html", "pages/login.html"],
  ["register.html", "pages/register.html"],
  ["dashboard-candidate.html", "pages/dashboard-candidate.html"],
  ["dashboard-company.html", "pages/dashboard-company.html"],
  ["donate.html", "pages/donate.html"],
  ["mentoring.html", "pages/mentoring.html"],
  ["onboarding.html", "pages/onboarding.html"],
  ["pages/login.html", "pages/login.html"],
  ["pages/register.html", "pages/register.html"],
  ["pages/dashboard-candidate.html", "pages/dashboard-candidate.html"],
  ["pages/dashboard-company.html", "pages/dashboard-company.html"],
  ["pages/donate.html", "pages/donate.html"],
  ["pages/mentoring.html", "pages/mentoring.html"],
  ["pages/onboarding.html", "pages/onboarding.html"],
  ["pages/candidate-dashboard.html", "pages/dashboard-candidate.html"],
  ["pages/company-dashboard.html", "pages/dashboard-company.html"],
]);

function resolveRoutePath(path) {
  if (!path) return defaultRoute;
  const clean = path.split("?")[0].replace(/^\//, "");
  if (routes.has(clean)) return routes.get(clean);
  if (clean.startsWith("pages/")) {
    const fileName = clean.slice(clean.lastIndexOf("/") + 1);
    if (routes.has(fileName)) return routes.get(fileName);
    return clean;
  }
  const asPagePath = `pages/${clean}`;
  if (routes.has(asPagePath)) return routes.get(asPagePath);
  if (clean.endsWith(".html") && !clean.includes("/")) return `pages/${clean}`;
  return clean;
}

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
async function loadPage(path, { pushState = true, initialLoad = false } = {}) {
  if (!app) return;
  const resolvedPath = resolveRoutePath(path);
  try {
    if (initialLoad) {
      upgradeInternalLinks(app);
      initPageInteractions(app);
      setActiveNav(resolvedPath);
      applyTranslations();
      if (pushState) history.pushState({ path: resolvedPath }, "", resolvedPath);
      initScrollAnimations(app);
      return;
    }

    const response = await fetch(resolvedPath, { cache: "no-store" });
    if (!response.ok) throw new Error("Fetch failed");
    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const content = parsed.getElementById("page-content");
    if (!content) throw new Error("Content missing");

    // Fade out
    app.style.opacity = "0";
    app.style.transform = "translateY(8px)";

    await new Promise(r => setTimeout(r, 120));
    app.innerHTML = content.innerHTML;
    upgradeInternalLinks(app);
    if (parsed.title) document.title = parsed.title;
    initPageInteractions(app);
    setActiveNav(resolvedPath);
    applyTranslations();
    if (pushState) history.pushState({ path: resolvedPath }, "", resolvedPath);

    // Fade in
    requestAnimationFrame(() => {
      app.style.transition = "opacity 0.35s ease, transform 0.35s ease";
      app.style.opacity = "1";
      app.style.transform = "translateY(0)";
    });

    initScrollAnimations(app);
    app.focus();
  } catch {
    app.innerHTML = `<div class="card"><h2>Error al cargar</h2><p>Intenta nuevamente o usa el menú.</p></div>`;
    app.style.opacity = "1";
    app.style.transform = "none";
  }
}

// Initialize UI behavior for the current page.
function initPageInteractions(root) {
  initAuth(root);
  initAiSim(root);
  initOnboarding(root);
}

// Normalize internal links when content is loaded inside the SPA shell.
function upgradeInternalLinks(root) {
  const pageMap = {
    "login.html": "login.html",
    "register.html": "register.html",
    "dashboard-candidate.html": "dashboard-candidate.html",
    "dashboard-company.html": "dashboard-company.html",
    "mentoring.html": "mentoring.html",
    "onboarding.html": "onboarding.html",
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

// ── Intersection Observer — scroll animations ─────────────────
function initScrollAnimations(root) {
  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = root.querySelectorAll('section, .card, .feature-card, .stat-card, .auth-panel, .auth-aside');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
        entry.target.classList.remove('section-hidden');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => {
    el.classList.add('section-hidden');
    observer.observe(el);
  });
}

if (app) {
  // Expose SPA navigate so auth.js can redirect after login
  window.__spaNavigate = (path) => loadPage(path);

  initTheme();
  initI18nSelect();
  initLanguageGate();
  setupNavigation({ onNavigate: loadPage, useSpa: true });
  window.addEventListener("popstate", () => {
    const path = resolveRouteFromLocation();
    checkAuthAndLoad(path, { pushState: false });
  });

  async function checkAuthAndLoad(path, options) {
    const isDashboard = path.includes('dashboard');
    if (window.supabase) {
      const supabaseUrl = 'https://oupbptgzfevkzzvscekj.supabase.co';
      const supabaseKey = 'sb_publishable_Obya200r1UbgWVnMbuhhiw_Xto1ETSE';
      const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      const btnLogout = document.getElementById('btn-logout');
      const btnLogin = document.getElementById('btn-login');

      if (session) {
        btnLogout?.classList.remove('hidden');
        btnLogin?.classList.add('hidden');
      } else {
        btnLogout?.classList.add('hidden');
        btnLogin?.classList.remove('hidden');
      }

      // Dashboard protection — sin sesión no entra
      if (isDashboard && !session) {
        loadPage('pages/login.html', options);
        return;
      }
      
      // Redirect to dashboard if logged in and visiting public pages
      if (session && (path === defaultRoute || path.includes('login') || path.includes('register'))) {
        const role = localStorage.getItem('user_role') || 'candidate';
        loadPage(`pages/dashboard-${role}.html`, { ...options, initialLoad: false });
        return;
      }
    }
    loadPage(path, options);
  }

  const initial = resolveRouteFromLocation();
  checkAuthAndLoad(initial, { pushState: false, initialLoad: true });
} else {
  initTheme();
  initI18nSelect();
  initLanguageGate();
  setupNavigation({ useSpa: false });
  initPageInteractions(document);
  applyTranslations();
  initScrollAnimations(document);
}
