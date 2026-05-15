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

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-nav]");
    if (!link) {
      return;
    }
    if (link.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    onNavigate(link.getAttribute("href"));
    document.body.classList.remove("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// Update active state for navigation links.
export function setActiveNav(path) {
  const cleanPath = path.split("?")[0];
  document.querySelectorAll("nav a[data-nav]").forEach((link) => {
    const href = link.getAttribute("href");
    const isActive = cleanPath.endsWith(href);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}
