import { useState } from "react";
import { ChevronDown, X, Plus, Trash2 } from "lucide-react";
import { TOOL_CATEGORIES, SKILL_LEVEL_ORDER, SKILL_LEVEL_I18N } from "./OperativeStackTypes";
import type { SkillItem, SkillLevel } from "./OperativeStackTypes";
import { SeniorityPills } from "./SeniorityPills";

export function TechnicalToolsTab({
  skills,
  onAddSkill,
  onRemoveSkill,
  onChangeLevel,
  t,
}: {
  skills: SkillItem[];
  onAddSkill: (name: string, level: SkillLevel) => void;
  onRemoveSkill: (name: string) => void;
  onChangeLevel: (name: string, level: SkillLevel) => void;
  t: (key: string) => string;
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Flatten all tools for search
  const allTools = TOOL_CATEGORIES.flatMap((cat) => cat.tools);
  const filteredTools = searchTerm
    ? allTools.filter((tool) => tool.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  // Tools that are already added
  const addedToolNames = new Set(skills.map((s) => s.name));

  const handleQuickAdd = (toolName: string) => {
    if (!addedToolNames.has(toolName)) {
      onAddSkill(toolName, "junior");
    }
    setExpandedCategory(null);
    setSearchTerm("");
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-2">{t("opStack.tools.title")}</h3>
      <p className="text-xs text-muted-foreground mb-5">{t("opStack.tools.sub")}</p>

      {/* Quick search input */}
      <div className="relative mb-5">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value) setExpandedCategory(null);
          }}
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input-background text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
          placeholder={t("opStack.tools.searchPlaceholder")}
        />
        {searchTerm && (
          <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl border-2 border-border bg-card shadow-lg max-h-48 overflow-y-auto">
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => (
                <button
                  key={tool}
                  onClick={() => handleQuickAdd(tool)}
                  disabled={addedToolNames.has(tool)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm cursor-pointer
                    transition-colors border-0 bg-transparent
                    ${addedToolNames.has(tool)
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : "text-foreground hover:bg-primary/5"
                    }
                  `}
                >
                  {addedToolNames.has(tool) ? (
                    <span className="text-xs text-muted-foreground/60 italic">{t("opStack.tools.alreadyAdded")}</span>
                  ) : (
                    <>
                      <Plus size={14} className="text-primary shrink-0" />
                      <span className="font-semibold">{tool}</span>
                    </>
                  )}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-muted-foreground">{t("opStack.tools.noResults")}</p>
            )}
          </div>
        )}
      </div>

      {/* Category accordions */}
      <div className="space-y-2">
        {TOOL_CATEGORIES.map((cat) => {
          const isExpanded = expandedCategory === cat.id && !searchTerm;
          const categoryTools = cat.tools;
          return (
            <div key={cat.id} className="rounded-2xl border-2 border-border overflow-hidden">
              <button
                onClick={() => {
                  setExpandedCategory(isExpanded ? null : cat.id);
                  setSearchTerm("");
                }}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left cursor-pointer bg-transparent border-0 hover:bg-secondary/20 transition-colors"
              >
                <span className="text-sm font-bold text-foreground">{t(cat.nameKey)}</span>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-border/50">
                  <div className="flex flex-wrap gap-2">
                    {categoryTools.map((tool) => {
                      const isAdded = addedToolNames.has(tool);
                      const skill = skills.find((s) => s.name === tool);
                      return (
                        <div key={tool} className="w-full">
                          <div className="flex items-center gap-2 mb-1.5">
                            <button
                              onClick={() => {
                                if (isAdded) {
                                  onRemoveSkill(tool);
                                } else {
                                  onAddSkill(tool, "junior");
                                }
                              }}
                              className={`
                                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-semibold cursor-pointer transition-all
                                ${isAdded
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                }
                              `}
                            >
                              {isAdded ? (
                                <>
                                  <X size={12} /> {tool}
                                </>
                              ) : (
                                <>
                                  <Plus size={12} /> {tool}
                                </>
                              )}
                            </button>
                            {isAdded && skill && (
                              <div className="flex-1 max-w-[240px]">
                                <SeniorityPills
                                  level={skill.level}
                                  onChange={(lvl) => onChangeLevel(tool, lvl)}
                                  t={t}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Added skills summary */}
      {skills.length > 0 && (
        <div className="mt-6 p-4 rounded-2xl border-2 border-primary/20 bg-primary/5">
          <h4 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">
            {t("profile.skillsTitle")} ({skills.length})
          </h4>
          <div className="space-y-2">
            {skills.map((sk) => {
              const info = SKILL_LEVEL_I18N[sk.level];
              return (
                <div key={sk.name} className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-card border border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{sk.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {t(info.labelKey)}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveSkill(sk.name)}
                    className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer border-0 bg-transparent transition-colors"
                    aria-label={`Remove ${sk.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
