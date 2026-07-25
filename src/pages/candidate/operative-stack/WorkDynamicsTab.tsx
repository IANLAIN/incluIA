import { Check } from "lucide-react";
import type { WorkDynamicsItem } from "./OperativeStackTypes";

export function WorkDynamicsTab({
  items,
  onToggle,
  t,
}: {
  items: WorkDynamicsItem[];
  onToggle: (id: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-2">{t("opStack.dyn.title")}</h3>
      <p className="text-xs text-muted-foreground mb-5">{t("opStack.dyn.sub")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={`
              flex items-center gap-3 p-4 rounded-2xl border-2 text-left cursor-pointer transition-all
              ${item.selected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
              }
            `}
          >
            <div
              className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors
                ${item.selected ? "border-primary bg-primary" : "border-muted-foreground"}
              `}
            >
              {item.selected && <Check size={12} className="text-primary-foreground" />}
            </div>
            <span className="text-sm font-semibold text-foreground">{t(item.labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
