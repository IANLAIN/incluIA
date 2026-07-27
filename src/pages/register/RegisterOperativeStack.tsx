import { useState, useCallback } from "react";
import { Monitor, Wrench, Zap, Award, Check } from "lucide-react";
import { Lang } from "@/types";
import { BaseInterfaceTab } from "@/pages/candidate/operative-stack/BaseInterfaceTab";
import { TechnicalToolsTab } from "@/pages/candidate/operative-stack/TechnicalToolsTab";
import { WorkDynamicsTab } from "@/pages/candidate/operative-stack/WorkDynamicsTab";
import { CredentialsTab } from "@/pages/candidate/operative-stack/CredentialsTab";
import { StackSidebar } from "@/pages/candidate/operative-stack/StackSidebar";
import {
  BASE_INTERFACE_ITEMS,
  WORK_DYNAMICS_ITEMS,
} from "@/pages/candidate/operative-stack/OperativeStackTypes";
import type {
  OperativeStackTab,
  BaseInterfaceItem,
  WorkDynamicsItem,
  SkillItem,
  SkillLevel,
  CredentialItem,
} from "@/pages/candidate/operative-stack/OperativeStackTypes";

export interface OperativeStackData {
  baseItems: BaseInterfaceItem[];
  skills: SkillItem[];
  dynamics: WorkDynamicsItem[];
  credentials: CredentialItem[];
}

export function RegisterOperativeStack({
  t,
  data,
  onChange,
}: {
  t: (key: string) => string;
  data: OperativeStackData;
  onChange: (data: OperativeStackData) => void;
}) {
  const [activeTab, setActiveTab] = useState<OperativeStackTab>("base");

  const toggleBase = useCallback((id: string) => {
    const next = data.baseItems.map((item) =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    onChange({ ...data, baseItems: next });
  }, [data, onChange]);

  const toggleDynamics = useCallback((id: string) => {
    const next = data.dynamics.map((item) =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    onChange({ ...data, dynamics: next });
  }, [data, onChange]);

  const addSkill = useCallback((name: string, level: SkillLevel) => {
    if (data.skills.some((s) => s.name === name)) return;
    const next = [...data.skills, { name, level }];
    onChange({ ...data, skills: next });
  }, [data, onChange]);

  const removeSkill = useCallback((name: string) => {
    const next = data.skills.filter((s) => s.name !== name);
    onChange({ ...data, skills: next });
  }, [data, onChange]);

  const changeSkillLevel = useCallback((name: string, level: SkillLevel) => {
    const next = data.skills.map((s) =>
      s.name === name ? { ...s, level } : s
    );
    onChange({ ...data, skills: next });
  }, [data, onChange]);

  const addCredential = useCallback((item: CredentialItem) => {
    const next = [...data.credentials, item];
    onChange({ ...data, credentials: next });
  }, [data, onChange]);

  const removeCredential = useCallback((id: string) => {
    const next = data.credentials.filter((c) => c.id !== id);
    onChange({ ...data, credentials: next });
  }, [data, onChange]);

  const tabCounts = {
    base: data.baseItems.filter((i) => i.selected).length,
    tools: data.skills.length,
    dynamics: data.dynamics.filter((i) => i.selected).length,
    credentials: data.credentials.length,
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Sidebar */}
      <div className="w-full lg:w-[200px] shrink-0">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          {t("opStack.sidebarTitle")}
        </h3>
        <StackSidebar activeTab={activeTab} onTabChange={setActiveTab} t={t} />
        {/* Tab completion dots */}
        <div className="flex gap-2 mt-4 px-1">
          {(Object.entries(tabCounts) as [OperativeStackTab, number][]).map(([tabKey, count]) => (
            <div
              key={tabKey}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                count > 0 ? "bg-primary" : "bg-muted"
              }`}
              title={`${t(`opStack.tab.${tabKey}`)}: ${count}`}
            />
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl border-2 border-border bg-card p-5 md:p-6 shadow-sm">
          {activeTab === "base" && (
            <BaseInterfaceTab items={data.baseItems} onToggle={toggleBase} t={t} />
          )}
          {activeTab === "tools" && (
            <TechnicalToolsTab
              skills={data.skills}
              onAddSkill={addSkill}
              onRemoveSkill={removeSkill}
              onChangeLevel={changeSkillLevel}
              t={t}
            />
          )}
          {activeTab === "dynamics" && (
            <WorkDynamicsTab items={data.dynamics} onToggle={toggleDynamics} t={t} />
          )}
          {activeTab === "credentials" && (
            <CredentialsTab
              items={data.credentials}
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
