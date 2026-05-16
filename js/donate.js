/**
 * donate.js — Handles donation page interactions
 * Manages expandable payment sections and amount selection.
 */
export function initDonate(root = document) {
  const donateSection = root.querySelector("[data-donate-page]");
  if (!donateSection) return;

  // Toggle payment expansion panels
  donateSection.querySelectorAll("[data-toggle-payment]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-toggle-payment");
      const allPanels = donateSection.querySelectorAll("[data-payment-expand]");

      allPanels.forEach((panel) => {
        if (panel.id !== targetId) {
          panel.classList.remove("open");
        }
      });

      const target = document.getElementById(targetId);
      if (target) target.classList.toggle("open");
    });
  });

  // Amount selection visual toggle
  donateSection.addEventListener("click", (e) => {
    if (e.target.classList.contains("amount-btn")) {
      const parent = e.target.closest(".amount-grid");
      if (parent) {
        parent.querySelectorAll(".amount-btn").forEach((b) =>
          b.classList.remove("selected")
        );
        e.target.classList.add("selected");
        const customInput = parent
          .closest("[data-payment-expand]")
          ?.querySelector(".custom-amount input");
        if (customInput) customInput.value = "";
      }
    }
  });
}
