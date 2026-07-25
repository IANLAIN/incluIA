import { Monitor, Wrench, Zap, Award } from "lucide-react";
import type { OperativeStackTab } from "./OperativeStackTypes";

const TABS: { id: OperativeStackTab; icon: React.ReactNode; labelKey: string }[] = [
  { id: "base", icon: <Monitor size={18} />, labelKey: "opStack.tab.base" },
  { id: "tools", icon: <Wrench size={18} />, labelKey: "opStack.tab.tools" },
  { id: "dynamics", icon: <Zap size={18} />, labelKey: "opStack.tab.dynamics" },
  { id: "credentials", icon: <Award size={18} />, labelKey: "opStack.tab.credentials" },
];

export function StackSidebar({
  activeTab,
  onTabChange,
  t,
}: {
  activeTab: OperativeStackTab;
  onTabChange: (tab: OperativeStackTab) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left
              cursor-pointer transition-all text-sm font-bold
              ${
                isActive
                  ? "border-primary bg-primary/10 text-foreground shadow-sm"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }
            `}
          >
            <span className={isActive ? "text-primary" : "text-muted-foreground"}>
              {tab.icon}
            </span>
            <span>{t(tab.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
