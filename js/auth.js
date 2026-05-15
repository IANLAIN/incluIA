// Control auth mode and role guidance.
export function initAuth(root = document) {
  const authRoot = root.querySelector("[data-auth-root]");
  if (!authRoot) {
    return;
  }

  const roleRadios = authRoot.querySelectorAll("input[name='role']");
  const roleOutput = authRoot.querySelector("[data-role-output]");
  const modeButtons = authRoot.querySelectorAll("[data-auth-mode]");
  const panels = authRoot.querySelectorAll("[data-auth-panel]");

  function updateRole() {
    if (!roleOutput) {
      return;
    }
    const selected = authRoot.querySelector("input[name='role']:checked");
    const value = selected ? selected.value : "candidato";
    roleOutput.textContent =
      value === "empresa"
        ? "Vista corporativa con ESG y guia de adaptacion."
        : "Vista de candidato con apoyo visual y tareas guiadas.";
  }

  function setMode(mode) {
    panels.forEach((panel) => {
      panel.hidden = panel.getAttribute("data-auth-panel") !== mode;
    });
    modeButtons.forEach((button) => {
      const isActive = button.getAttribute("data-auth-mode") === mode;
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  roleRadios.forEach((radio) => radio.addEventListener("change", updateRole));
  modeButtons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.getAttribute("data-auth-mode")));
  });

  updateRole();
  setMode("login");
}
