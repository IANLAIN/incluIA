import { Lang } from "@/types";

export type SkillLevel = "junior" | "semi_senior" | "senior";

export interface SkillItem {
  name: string;
  level: SkillLevel;
}

export interface ToolCategory {
  id: string;
  nameKey: string;
  tools: string[];
}

export interface CredentialItem {
  id: string;
  type: "github" | "linkedin" | "portfolio" | "certificate";
  label: string;
  url: string;
}

export type OperativeStackTab = "base" | "tools" | "dynamics" | "credentials";

export interface WorkDynamicsItem {
  id: string;
  labelKey: string;
  selected: boolean;
}

export interface BaseInterfaceItem {
  id: string;
  labelKey: string;
  selected: boolean;
}

export const SKILL_LEVEL_ORDER: SkillLevel[] = ["junior", "semi_senior", "senior"];

export const SKILL_LEVEL_I18N: Record<SkillLevel, { labelKey: string; descKey: string }> = {
  junior: { labelKey: "profile.skillJunior", descKey: "profile.skillJuniorDesc" },
  semi_senior: { labelKey: "profile.skillSemiSenior", descKey: "profile.skillSemiSeniorDesc" },
  senior: { labelKey: "profile.skillSenior", descKey: "profile.skillSeniorDesc" },
};

export const TOOL_CATEGORIES: ToolCategory[] = [
  { id: "data_analysis", nameKey: "opStack.cat.dataAnalysis", tools: ["Excel", "Power BI", "Tableau", "Google Analytics", "SPSS", "R"] },
  { id: "programming", nameKey: "opStack.cat.programming", tools: ["Python", "JavaScript", "TypeScript", "Java", "C#", "C++", "Go", "Rust"] },
  { id: "web_dev", nameKey: "opStack.cat.webDev", tools: ["React", "Angular", "Vue.js", "Node.js", "Django", "Ruby on Rails", "Next.js", "Express"] },
  { id: "cloud_devops", nameKey: "opStack.cat.cloudDevops", tools: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "CI/CD"] },
  { id: "design", nameKey: "opStack.cat.design", tools: ["Figma", "Adobe XD", "Photoshop", "Illustrator", "Sketch", "InDesign", "After Effects"] },
  { id: "databases", nameKey: "opStack.cat.databases", tools: ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis", "Elasticsearch"] },
  { id: "testing", nameKey: "opStack.cat.testing", tools: ["Jest", "Cypress", "Selenium", "Playwright", "JUnit", "Mocha"] },
  { id: "project_mgmt", nameKey: "opStack.cat.projectMgmt", tools: ["Jira", "Trello", "Asana", "Notion", "Monday.com", "Basecamp"] },
];

export const CREDENTIAL_TYPES = [
  { id: "github" as const, iconKey: "github", labelKey: "opStack.cred.github" },
  { id: "linkedin" as const, iconKey: "linkedin", labelKey: "opStack.cred.linkedin" },
  { id: "portfolio" as const, iconKey: "portfolio", labelKey: "opStack.cred.portfolio" },
  { id: "certificate" as const, iconKey: "certificate", labelKey: "opStack.cred.certificate" },
];

export const BASE_INTERFACE_ITEMS: BaseInterfaceItem[] = [
  { id: "adaptive_ui", labelKey: "opStack.base.adaptiveUI", selected: false },
  { id: "high_contrast", labelKey: "opStack.base.highContrast", selected: false },
  { id: "reduced_motion", labelKey: "opStack.base.reducedMotion", selected: false },
  { id: "font_scale", labelKey: "opStack.base.fontScale", selected: false },
  { id: "colorblind", labelKey: "opStack.base.colorblind", selected: false },
  { id: "screen_reader", labelKey: "opStack.base.screenReader", selected: false },
];

export const WORK_DYNAMICS_ITEMS: WorkDynamicsItem[] = [
  { id: "async_comm", labelKey: "opStack.dyn.asyncComm", selected: false },
  { id: "written_instructions", labelKey: "opStack.dyn.writtenInstructions", selected: false },
  { id: "flexible_hours", labelKey: "opStack.dyn.flexibleHours", selected: false },
  { id: "quiet_environment", labelKey: "opStack.dyn.quietEnvironment", selected: false },
  { id: "no_meetings", labelKey: "opStack.dyn.noMeetings", selected: false },
  { id: "task_blocks", labelKey: "opStack.dyn.taskBlocks", selected: false },
  { id: "visual_tasks", labelKey: "opStack.dyn.visualTasks", selected: false },
  { id: "remote_first", labelKey: "opStack.dyn.remoteFirst", selected: false },
];
