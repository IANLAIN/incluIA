import { Check } from "lucide-react";
import { BASE_INTERFACE_ITEMS } from "./OperativeStackTypes";
import type { BaseInterfaceItem } from "./OperativeStackTypes";

export function BaseInterfaceTab({
  items,
  onToggle,
  t,
}: {
  items: BaseInterfaceItem[];
  onToggle: (id: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-2">{t("opStack.base.title")}</h3>
      <p className="text-xs text-muted-foreground mb-5">{t("opStack.base.sub")}</p>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={`
              flex items-center gap-4 p-4 rounded-2xl border-2 text-left cursor-pointer transition-all
              ${item.selected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
              }
            `}
          >
            <div
              className={`
                w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors
                ${item.selected ? "border-primary bg-primary" : "border-muted-foreground"}
              `}
            >
              {item.selected && <Check size={14} className="text-primary-foreground" />}
            </div>
            <span className="text-sm font-semibold text-foreground">{t(item.labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
