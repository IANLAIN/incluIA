// Handle navigation and mobile menu behavior.
export function setupNavigation({ onNavigate, useSpa }) {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.getElementById("site-nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  if (!useSpa || !onNavigate) {
    return;
  }

  function normalizeRoute(href) {
    try {
      const url = new URL(href, window.location.href);
      const pathname = url.pathname.replace(/\\/g, "/");
      const segments = pathname.split("/").filter(Boolean);
      const fileName = segments[segments.length - 1] || "index.html";
      const pageFiles = new Set([
        "login.html",
        "register.html",
        "dashboard-candidate.html",
        "dashboard-company.html",
        "candidate-dashboard.html",
        "company-dashboard.html",
        "donate.html",
        "mentoring.html",
        "onboarding.html",
      ]);
      if (fileName === "index.html" || pathname.endsWith("/")) {
        return "index.html";
      }
      if (pathname.includes("/pages/")) {
        return pathname.slice(pathname.lastIndexOf("/pages/") + 1);
      }
      if (pageFiles.has(fileName)) {
        return `pages/${fileName}`;
      }
      return fileName;
    } catch {
      return href;
    }
  }

  function isInternalLink(link) {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return false;
    }
    try {
      const url = new URL(href, window.location.href);
      return url.origin === window.location.origin;
    } catch {
      return true;
    }
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) {
      return;
    }
    if (!isInternalLink(link)) return;
    if (link.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    onNavigate(normalizeRoute(link.getAttribute("href")));
    document.body.classList.remove("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  const brand = document.querySelector(".brand, .brand-link");
  if (brand) {
    brand.addEventListener("click", (event) => {
      event.preventDefault();
      onNavigate("index.html");
      document.body.classList.remove("nav-open");
      if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    });
  }
}

// Update active state for navigation links.
export function setActiveNav(path) {
  const rawPath = path.split("?")[0].replace(/\\/g, "/");
  const cleanPath = rawPath.includes("/pages/")
    ? rawPath.slice(rawPath.lastIndexOf("/pages/") + 1)
    : rawPath.split("/").filter(Boolean).pop() || "index.html";
  document.querySelectorAll("nav a[data-nav]").forEach((link) => {
    const href = link.getAttribute("href");
    let targetPath = href;
    try {
      const pathname = new URL(href, window.location.href).pathname.replace(/\\/g, "/");
      targetPath = pathname.includes("/pages/")
        ? pathname.slice(pathname.lastIndexOf("/pages/") + 1)
        : pathname.split("/").filter(Boolean).pop() || pathname;
    } catch {
      targetPath = href.replace(/^\.\.\//, "");
    }
    const isActive = cleanPath === targetPath || cleanPath.endsWith(targetPath);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}
