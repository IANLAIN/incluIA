import { useState, useCallback } from "react";
import { Monitor, Wrench, Zap, Award } from "lucide-react";
import { StackSidebar } from "./StackSidebar";
import { BaseInterfaceTab } from "./BaseInterfaceTab";
import { TechnicalToolsTab } from "./TechnicalToolsTab";
import { WorkDynamicsTab } from "./WorkDynamicsTab";
import { CredentialsTab } from "./CredentialsTab";
import {
  BASE_INTERFACE_ITEMS,
  WORK_DYNAMICS_ITEMS,
} from "./OperativeStackTypes";
import type {
  OperativeStackTab,
  BaseInterfaceItem,
  WorkDynamicsItem,
  SkillItem,
  SkillLevel,
  CredentialItem,
} from "./OperativeStackTypes";

const DEMO_SKILLS: SkillItem[] = [
  { name: "Análisis de Datos", level: "senior" },
  { name: "Python", level: "semi_senior" },
  { name: "SQL", level: "semi_senior" },
  { name: "Power BI", level: "junior" },
  { name: "Excel Avanzado", level: "senior" },
];

const DEMO_CREDENTIALS: CredentialItem[] = [
  { id: "cred-1", type: "github", label: "GitHub Profile", url: "https://github.com/bryangonzalez" },
  { id: "cred-2", type: "linkedin", label: "LinkedIn Profile", url: "https://linkedin.com/in/bryangonzalez" },
  { id: "cred-3", type: "portfolio", label: "Portfolio", url: "https://bryangonzalez.dev" },
];

const DEMO_BASE_ITEMS: BaseInterfaceItem[] = BASE_INTERFACE_ITEMS.map((item) => ({
  ...item,
  selected: ["adaptive_ui", "high_contrast", "reduced_motion"].includes(item.id),
}));

const DEMO_DYNAMICS: WorkDynamicsItem[] = WORK_DYNAMICS_ITEMS.map((item) => ({
  ...item,
  selected: ["async_comm", "written_instructions", "flexible_hours", "quiet_environment", "task_blocks"].includes(item.id),
}));

export function OperativeStack({
  t,
  isDemo = false,
}: {
  t: (key: string) => string;
  isDemo?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<OperativeStackTab>("base");
  const [baseItems, setBaseItems] = useState<BaseInterfaceItem[]>(
    isDemo ? DEMO_BASE_ITEMS : BASE_INTERFACE_ITEMS.map((i) => ({ ...i }))
  );
  const [skills, setSkills] = useState<SkillItem[]>(isDemo ? [...DEMO_SKILLS] : []);
  const [dynamics, setDynamics] = useState<WorkDynamicsItem[]>(
    isDemo ? DEMO_DYNAMICS : WORK_DYNAMICS_ITEMS.map((i) => ({ ...i }))
  );
  const [credentials, setCredentials] = useState<CredentialItem[]>(
    isDemo ? [...DEMO_CREDENTIALS] : []
  );

  const toggleBase = useCallback((id: string) => {
    setBaseItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  }, []);

  const toggleDynamics = useCallback((id: string) => {
    setDynamics((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  }, []);

  const addSkill = useCallback((name: string, level: SkillLevel) => {
    setSkills((prev) => {
      if (prev.some((s) => s.name === name)) return prev;
      return [...prev, { name, level }];
    });
  }, []);

  const removeSkill = useCallback((name: string) => {
    setSkills((prev) => prev.filter((s) => s.name !== name));
  }, []);

  const changeSkillLevel = useCallback((name: string, level: SkillLevel) => {
    setSkills((prev) =>
      prev.map((s) => (s.name === name ? { ...s, level } : s))
    );
  }, []);

  const addCredential = useCallback((item: CredentialItem) => {
    setCredentials((prev) => [...prev, item]);
  }, []);

  const removeCredential = useCallback((id: string) => {
    setCredentials((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const tabCounts = {
    base: baseItems.filter((i) => i.selected).length,
    tools: skills.length,
    dynamics: dynamics.filter((i) => i.selected).length,
    credentials: credentials.length,
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full lg:w-[220px] shrink-0">
        <div className="lg:sticky lg:top-24">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            {t("opStack.sidebarTitle")}
          </h3>
          <StackSidebar activeTab={activeTab} onTabChange={setActiveTab} t={t} />
          {/* Dot indicators for filled tabs */}
          <div className="flex gap-1.5 mt-4 px-1">
            {(Object.entries(tabCounts) as [OperativeStackTab, number][]).map(([tabKey, count]) => (
              <div
                key={tabKey}
                className="flex items-center gap-1"
                title={`${t(`opStack.tab.${tabKey}`)}: ${count}`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    count > 0 ? "bg-primary" : "bg-muted"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl border-2 border-border bg-card p-5 md:p-7 shadow-sm">
          {activeTab === "base" && (
            <BaseInterfaceTab items={baseItems} onToggle={toggleBase} t={t} />
          )}
          {activeTab === "tools" && (
            <TechnicalToolsTab
              skills={skills}
              onAddSkill={addSkill}
              onRemoveSkill={removeSkill}
              onChangeLevel={changeSkillLevel}
              t={t}
            />
          )}
          {activeTab === "dynamics" && (
            <WorkDynamicsTab items={dynamics} onToggle={toggleDynamics} t={t} />
          )}
          {activeTab === "credentials" && (
            <CredentialsTab
              items={credentials}
              onAdd={addCredential}
              onRemove={removeCredential}
              t={t}
            />
          )}
        </div>
      </div>
    </div>
  );
}
