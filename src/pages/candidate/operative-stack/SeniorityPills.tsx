import { SkillLevel } from "./OperativeStackTypes";
import { SKILL_LEVEL_ORDER, SKILL_LEVEL_I18N } from "./OperativeStackTypes";

export function SeniorityPills({
  level,
  onChange,
  t,
}: {
  level: SkillLevel | null;
  onChange: (lvl: SkillLevel) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex gap-1.5">
      {SKILL_LEVEL_ORDER.map((lvl) => {
        const info = SKILL_LEVEL_I18N[lvl];
        const isActive = level === lvl;
        const levelIndex = SKILL_LEVEL_ORDER.indexOf(lvl);

        // Fill all pills up to and including the active one
        const fillState = (() => {
          if (!level) return "none";
          const activeIndex = SKILL_LEVEL_ORDER.indexOf(level);
          if (levelIndex < activeIndex) return "full";
          if (levelIndex === activeIndex) return "active";
          return "empty";
        })();

        const fillWidth = fillState === "none"
          ? "0%"
          : fillState === "empty"
          ? "0%"
          : fillState === "active"
          ? "100%"
          : "100%";

        const fillColor = (() => {
          if (levelIndex === 0) return "var(--primary)";
          if (levelIndex === 1) return "var(--accent)";
          return "var(--primary)";
        })();

        return (
          <button
            key={lvl}
            onClick={() => onChange(lvl)}
            className={`
              relative flex-1 px-2 py-2 rounded-xl border-2 text-[11px] font-bold
              cursor-pointer transition-all duration-200 text-center min-w-0
              ${
                isActive
                  ? "border-primary shadow-sm shadow-primary/20"
                  : "border-border hover:border-primary/40"
              }
            `}
            style={{
              backgroundColor: fillState !== "empty" && fillState !== "none"
                ? `color-mix(in srgb, ${fillColor} 18%, var(--card))`
                : "var(--card)",
            }}
            title={t(info.descKey)}
          >
            <div className="relative z-10 flex flex-col items-center">
              <span className={isActive ? "text-foreground" : "text-muted-foreground"}>
                {t(info.labelKey)}
              </span>
              {/* Visual fill indicator bar */}
              <div
                className="mt-1.5 h-1.5 rounded-full w-full max-w-[3rem] bg-muted overflow-hidden"
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: fillWidth,
                    backgroundColor: fillColor,
                    opacity: isActive || fillState === "full" ? 1 : 0.4,
                  }}
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
