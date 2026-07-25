import { useState, useCallback, useRef, KeyboardEvent } from "react";
import { X, ArrowLeft, Check } from "lucide-react";
import { Lang } from "@/types";
import { useT } from "@/i18n/useT";
import { SplitScreenLayout } from "@/components/common/SplitScreenLayout";
import { SelectableCard } from "@/components/common/SelectableCard";
import { SelectableChip } from "@/components/common/SelectableChip";
import { CustomSlider } from "@/components/common/CustomSlider";
import { RadarViz } from "@/components/common/RadarViz";

type WizardStep = 1 | 2 | 3 | 4;
type EnvChipKey =
  | "wheelchair_access" | "natural_light" | "low_noise" | "quiet_zone"
  | "ergonomic_furniture" | "air_conditioning" | "elevator_access"
  | "accessible_bathroom" | "visual_signage" | "sensory_break_room"
  | "height_adjustable_desk" | "service_animal_allowed";

type Modality = "remote" | "hybrid" | "in_person";
type Schedule = "fixed" | "flexible" | "by_objectives";
type SocialLevel = "low" | "medium" | "high";
type TaskType = "long_projects" | "short_iterative" | "immediate_support";

const TOTAL_STEPS = 4;

const MODALITY_KEYS = ["opp.modality_remote", "opp.modality_hybrid", "opp.modality_in_person"] as const;
const MODALITY_VALS: Modality[] = ["remote", "hybrid", "in_person"];

const SCHEDULE_KEYS = ["opp.schedule_fixed", "opp.schedule_flexible", "opp.schedule_by_objectives"] as const;
const SCHEDULE_VALS: Schedule[] = ["fixed", "flexible", "by_objectives"];

const SOCIAL_KEYS = ["opp.social_low", "opp.social_medium", "opp.social_high"] as const;
const SOCIAL_VALS: SocialLevel[] = ["low", "medium", "high"];

const TASK_KEYS = ["opp.task_long_projects", "opp.task_short_iterative", "opp.task_immediate_support"] as const;
const TASK_VALS: TaskType[] = ["long_projects", "short_iterative", "immediate_support"];

const ENV_CHIPS: { key: EnvChipKey; tKey: string }[] = [
  { key: "wheelchair_access", tKey: "opp.env.wheelchair_access" },
  { key: "natural_light", tKey: "opp.env.natural_light" },
  { key: "low_noise", tKey: "opp.env.low_noise" },
  { key: "quiet_zone", tKey: "opp.env.quiet_zone" },
  { key: "ergonomic_furniture", tKey: "opp.env.ergonomic_furniture" },
  { key: "air_conditioning", tKey: "opp.env.air_conditioning" },
  { key: "elevator_access", tKey: "opp.env.elevator_access" },
  { key: "accessible_bathroom", tKey: "opp.env.accessible_bathroom" },
  { key: "visual_signage", tKey: "opp.env.visual_signage" },
  { key: "sensory_break_room", tKey: "opp.env.sensory_break_room" },
  { key: "height_adjustable_desk", tKey: "opp.env.height_adjustable_desk" },
  { key: "service_animal_allowed", tKey: "opp.env.service_animal_allowed" },
];

const AXIS_CONFIG = [
  { key: "axis1" as const, labelKey: "orgOnboarding.axis1Label" },
  { key: "axis2" as const, labelKey: "orgOnboarding.axis2Label" },
  { key: "axis3" as const, labelKey: "orgOnboarding.axis3Label" },
  { key: "axis4" as const, labelKey: "orgOnboarding.axis4Label" },
] as const;

const RADAR_SHORT_KEYS = [
  "about.radarAxes.processing",
  "about.radarAxes.execution",
  "about.radarAxes.environment",
  "about.radarAxes.adjustments",
] as const;

export function OrganizationPostVacancy({ lang }: { lang: Lang }) {
  const t = useT(lang);
  const skillInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<WizardStep>(1);
  const [roleTitle, setRoleTitle] = useState("");
  const [modality, setModality] = useState<Modality | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [socialLevel, setSocialLevel] = useState<SocialLevel | null>(null);
  const [taskType, setTaskType] = useState<TaskType | null>(null);
  const [roleAxes, setRoleAxes] = useState({ axis1: 50, axis2: 50, axis3: 50, axis4: 50 });
  const [envChips, setEnvChips] = useState<EnvChipKey[]>([]);
  const [published, setPublished] = useState(false);

  const radarData = RADAR_SHORT_KEYS.map((k, i) => ({
    axis: t(k),
    value: Object.values(roleAxes)[i],
  }));

  const radarDataOrg = RADAR_SHORT_KEYS.map((k) => ({
    axis: t(k),
    value: 50,
  }));

  const setAxis = useCallback((key: keyof typeof roleAxes, val: number) => {
    setRoleAxes((prev) => ({ ...prev, [key]: val }));
  }, []);

  const addSkill = useCallback((name: string) => {
    const trimmed = name.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  }, [skills]);

  const removeSkill = useCallback((name: string) => setSkills((prev) => prev.filter((s) => s !== name)), []);

  const handleSkillKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(skillInput); }
  }, [addSkill, skillInput]);

  const toggleEnvChip = useCallback((key: EnvChipKey) => {
    setEnvChips((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  }, []);

  const canStep1 = roleTitle.trim() && modality && schedule;
  const canStep2 = socialLevel && taskType;
  const canStep3 = true;
  const stepLabel = (s: number) => `${t("orgOnboarding.step")} ${s} ${t("orgOnboarding.of")} ${TOTAL_STEPS}`;

  const envDesc = useCallback(() => {
    const parts: string[] = [];
    if (modality) parts.push(t(MODALITY_KEYS[MODALITY_VALS.indexOf(modality)]));
    if (schedule) parts.push(t(SCHEDULE_KEYS[SCHEDULE_VALS.indexOf(schedule)]));
    if (socialLevel) parts.push(t(SOCIAL_KEYS[SOCIAL_VALS.indexOf(socialLevel)]));
    return parts.join(" · ");
  }, [modality, schedule, socialLevel, t]);

  const handlePublish = useCallback(() => {
    setPublished(true);
  }, []);

  if (published) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">{t("opp.title")}</h2>
          <p className="text-muted-foreground">"{roleTitle}" — {t("comp.post.submit")}</p>
          <button onClick={() => setPublished(false)} className="mt-8 px-8 py-3 rounded-2xl font-bold text-sm border-2 border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer">
            {t("orgOnboarding.step4BackToStart")}
          </button>
        </div>
      </div>
    );
  }

  const leftPanel = (
    <div className="max-w-lg mx-auto w-full">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex gap-1.5 flex-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className="h-2 rounded-full transition-all duration-500"
              style={{ width: i === step - 1 ? "48px" : "24px", backgroundColor: i <= step - 1 ? "var(--primary)" : "var(--muted)", opacity: i <= step - 1 ? 1 : 0.4 }}
            />
          ))}
        </div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
          {step === 4 ? t("opp.step4Title") : stepLabel(step)}
        </span>
      </div>

      {step > 1 && (
        <button onClick={() => setStep((step - 1) as WizardStep)}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors cursor-pointer bg-transparent border-0">
          <ArrowLeft size={16} /> {t("back")}
        </button>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("opp.step1Title")}</h2>
          <p className="text-muted-foreground text-sm mb-8">{t("opp.step1Sub")}</p>
          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-1.5">{t("opp.roleTitle")}</label>
            <p className="text-xs text-muted-foreground mb-2">{t("opp.roleHint")}</p>
            <input type="text" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-input-background text-foreground text-base focus:border-primary focus:outline-none transition-colors"
              placeholder={t("opp.rolePlaceholder")} autoFocus />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-1.5">{t("opp.modalityLabel")}</label>
            <p className="text-xs text-muted-foreground mb-3">{t("opp.modalityHint")}</p>
            <div className="grid grid-cols-3 gap-3">
              {MODALITY_KEYS.map((mk, i) => (
                <SelectableCard key={mk} selected={modality === MODALITY_VALS[i]}
                  onClick={() => setModality(MODALITY_VALS[i])} className="p-4 flex-col text-center gap-2">
                  <span className="font-semibold text-sm text-center block">{t(mk)}</span>
                </SelectableCard>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-1.5">{t("opp.scheduleLabel")}</label>
            <p className="text-xs text-muted-foreground mb-3">{t("opp.scheduleHint")}</p>
            <div className="grid grid-cols-3 gap-3">
              {SCHEDULE_KEYS.map((sk, i) => (
                <SelectableCard key={sk} selected={schedule === SCHEDULE_VALS[i]}
                  onClick={() => setSchedule(SCHEDULE_VALS[i])} className="p-4 flex-col text-center gap-2">
                  <span className="font-semibold text-sm text-center block">{t(sk)}</span>
                </SelectableCard>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-1.5">{t("opp.skillsLabel")}</label>
            <p className="text-xs text-muted-foreground mb-3">{t("opp.skillsHint")}</p>
            <input ref={skillInputRef} type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-input-background text-foreground text-base focus:border-primary focus:outline-none transition-colors"
              placeholder={t("opp.skillsPlaceholder")} />
            <div className="flex flex-wrap gap-2 mt-4">
              {skills.map((sk) => (
                <span key={sk} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 cursor-default">
                  {sk}
                  <button onClick={() => removeSkill(sk)} className="p-0.5 rounded-full hover:bg-primary/20 cursor-pointer border-0 bg-transparent text-primary"><X size={12} /></button>
                </span>
              ))}
            </div>
            {skills.length === 0 && <p className="text-xs text-muted-foreground/60 mt-3">{t("opp.noSkills")}</p>}
          </div>
          <button onClick={() => setStep(2)} disabled={!canStep1}
            className="w-full py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer">
            {t("orgOnboarding.next")} <span className="ml-2">→</span>
          </button>
        </>
      )}

      {/* STEP 2 — Routines + Physical Environment */}
      {step === 2 && (
        <>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("opp.step2Title")}</h2>
          <p className="text-muted-foreground text-sm mb-8">{t("opp.step2Sub")}</p>

          {/* Social Level */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-1.5">{t("opp.socialLevelLabel")}</label>
            <p className="text-xs text-muted-foreground mb-3">{t("opp.socialLevelHint")}</p>
            <div className="grid grid-cols-3 gap-3">
              {SOCIAL_KEYS.map((sk, i) => (
                <SelectableCard key={sk} selected={socialLevel === SOCIAL_VALS[i]}
                  onClick={() => setSocialLevel(SOCIAL_VALS[i])} className="p-4 flex-col text-center gap-2">
                  <span className="font-semibold text-sm text-center block">{t(sk)}</span>
                </SelectableCard>
              ))}
            </div>
          </div>

          {/* Task Type */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-1.5">{t("opp.taskTypeLabel")}</label>
            <p className="text-xs text-muted-foreground mb-3">{t("opp.taskTypeHint")}</p>
            <div className="grid grid-cols-1 gap-3">
              {TASK_KEYS.map((tk, i) => (
                <SelectableCard key={tk} selected={taskType === TASK_VALS[i]} onClick={() => setTaskType(TASK_VALS[i])}>
                  <span className="font-semibold text-sm">{t(tk)}</span>
                </SelectableCard>
              ))}
            </div>
          </div>

          {/* Physical Environment - Chips (migrated from Org Profile) */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-foreground mb-1.5">{t("opp.environmentTitle")}</label>
            <p className="text-xs text-muted-foreground mb-2">{t("opp.environmentHint")}</p>
            <div className="flex flex-wrap gap-2">
              {ENV_CHIPS.map((chip) => (
                <SelectableChip
                  key={chip.key}
                  selected={envChips.includes(chip.key)}
                  onClick={() => toggleEnvChip(chip.key)}
                  label={t(chip.tKey)}
                />
              ))}
            </div>
            {envChips.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{t("opp.environmentChipsTitle")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {envChips.map((ck) => (
                    <span key={ck} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                      {t(ENV_CHIPS.find((e) => e.key === ck)!.tKey)}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 mt-2">{t("opp.environmentChipsEmpty")}</p>
            )}
          </div>

          <button onClick={() => setStep(3)} disabled={!canStep2}
            className="w-full py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer">
            {t("orgOnboarding.next")} <span className="ml-2">→</span>
          </button>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("opp.step3Title")}</h2>
          <p className="text-muted-foreground text-sm mb-8">{t("opp.step3Sub")}</p>
          <div className="space-y-6">
            {AXIS_CONFIG.map((ax) => (
              <div key={ax.key}>
                <span className="text-sm font-bold text-foreground">{t(ax.labelKey)}</span>
                <div className="mt-2">
                  <CustomSlider value={roleAxes[ax.key]} onChange={(v) => setAxis(ax.key, v)}
                    labelLeft={t(`orgOnboarding.${ax.key}Left` as any)} labelRight={t(`orgOnboarding.${ax.key}Right` as any)} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(4)} disabled={!canStep3}
            className="w-full py-4 mt-8 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer">
            {t("orgOnboarding.next")} <span className="ml-2">→</span>
          </button>
        </>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("opp.step4Title")}</h2>
          <p className="text-muted-foreground text-sm mb-8">{t("opp.step4Sub")}</p>
          <div className="p-5 rounded-2xl border-2 border-border bg-card mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">{t("opp.step4QuickRead")}</h3>
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">{t("opp.previewModality")}</span>
                <div className="flex flex-wrap gap-2">
                  {modality && <SelectableChip selected={true} onClick={() => {}} label={t(MODALITY_KEYS[MODALITY_VALS.indexOf(modality)])} />}
                  {schedule && <SelectableChip selected={true} onClick={() => {}} label={t(SCHEDULE_KEYS[SCHEDULE_VALS.indexOf(schedule)])} />}
                  {socialLevel && <SelectableChip selected={true} onClick={() => {}} label={t(SOCIAL_KEYS[SOCIAL_VALS.indexOf(socialLevel)])} />}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">{t("opp.previewTasks")}</span>
                {taskType && <SelectableChip selected={true} onClick={() => {}} label={t(TASK_KEYS[TASK_VALS.indexOf(taskType)])} />}
              </div>
              {/* Environment chips in preview */}
              {envChips.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">{t("opp.environmentChipsTitle")}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {envChips.map((ck) => (
                      <span key={ck} className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-secondary/80 text-secondary-foreground border border-border/50">
                        {t(ENV_CHIPS.find((e) => e.key === ck)!.tKey)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">{t("opp.previewSkills")}</span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.length > 0 ? skills.map((s) => (
                    <span key={s} className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">{s}</span>
                  )) : <span className="text-xs text-muted-foreground/60 italic">{t("opp.previewNoSkills")}</span>}
                </div>
              </div>
            </div>
          </div>
          <button onClick={handlePublish}
            className="w-full py-5 rounded-2xl font-bold text-lg bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all cursor-pointer flex items-center justify-center gap-3">
            <Check size={20} /> {t("opp.step4Publish")}
          </button>
        </>
      )}
    </div>
  );

  const rightPanel = (
    <div className="p-8 md:p-10 flex flex-col items-center justify-center min-h-screen gap-8">
      {(step === 1 || step === 2) && (
        <div className="w-full flex flex-col justify-center items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">{t("opp.title")}</span>
          <div className="w-full max-w-sm rounded-3xl border border-border/60 bg-card p-8 shadow-md shadow-primary/5 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-snug">
              {roleTitle || <span className="text-muted-foreground/50 italic font-normal text-xl">{t("opp.titlePlaceholder") || "Título"}</span>}
            </h3>
            <div className="flex items-center justify-center gap-2 flex-wrap mb-5">
              {modality ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">{t(MODALITY_KEYS[MODALITY_VALS.indexOf(modality)])}</span>
              ) : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/50 text-muted-foreground/50 border border-border/30">{t("opp.modalityPlaceholder") || "Modalidad"}</span>}
              {schedule ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border/60">{t(SCHEDULE_KEYS[SCHEDULE_VALS.indexOf(schedule)])}</span>
              ) : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/50 text-muted-foreground/50 border border-border/30">{t("opp.schedulePlaceholder") || "Horario"}</span>}
            </div>
            <hr className="border-border/40 my-5" />
            {/* Environment chips preview */}
            {envChips.length > 0 && (
              <div className="text-left mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 block mb-2">{t("opp.environmentChipsTitle")}</span>
                <div className="flex flex-wrap gap-1.5">
                  {envChips.map((ck) => (
                    <span key={ck} className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-secondary/80 text-secondary-foreground border border-border/50">{t(ENV_CHIPS.find((e) => e.key === ck)!.tKey)}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 block mb-3">{t("opp.previewSkills")}</span>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {skills.length > 0 ? skills.map((s) => (
                  <span key={s} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-card text-foreground border border-border/50 shadow-sm">{s}</span>
                )) : <span className="text-xs text-muted-foreground/40 italic">{t("opp.previewNoSkills")}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="w-full flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">{t("opp.step3OrgLabel")} vs {t("opp.step3RoleLabel")}</span>
          <div className="w-full max-w-sm rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-md shadow-primary/5">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-[11px] font-bold text-muted-foreground uppercase block mb-2 text-center">{t("opp.step3OrgLabel")}</span><RadarViz data={radarDataOrg} height={200} outerRadius={70} fontSize={9} /></div>
              <div><span className="text-[11px] font-bold text-primary uppercase block mb-2 text-center">{t("opp.step3RoleLabel")}</span><RadarViz data={radarData} height={200} outerRadius={70} fontSize={9} /></div>
            </div>
            <hr className="border-border/40 my-4" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {AXIS_CONFIG.map((ax, i) => (
                <div key={ax.key} className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground/70">{t(ax.labelKey)}</span>
                  <span className="font-bold font-mono tabular-nums text-primary">{roleAxes[ax.key]}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="w-full flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">{t("opp.step4QuickRead")}</span>
          <div className="w-full max-w-sm rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-md shadow-primary/5 space-y-5">
            <div className="text-center pb-5 border-b border-border/40">
              <h3 className="text-xl font-bold text-foreground leading-snug">{roleTitle || <span className="text-muted-foreground/50 italic font-normal text-lg">{t("opp.titlePlaceholder") || "Título"}</span>}</h3>
              <p className="text-xs text-muted-foreground/60 mt-2 font-medium">{envDesc()}</p>
              <div className="flex items-center justify-center gap-2 flex-wrap mt-3">
                {modality && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">{t(MODALITY_KEYS[MODALITY_VALS.indexOf(modality)])}</span>}
                {schedule && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border/60">{t(SCHEDULE_KEYS[SCHEDULE_VALS.indexOf(schedule)])}</span>}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block mb-2.5">{t("opp.previewSkills")}</span>
              <div className="flex flex-wrap gap-1.5">
                {skills.length > 0 ? skills.map((s) => (
                  <span key={s} className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-card text-foreground border border-border/50 shadow-sm">{s}</span>
                )) : <span className="text-xs text-muted-foreground/40 italic">{t("opp.previewNoSkills")}</span>}
              </div>
            </div>
            {taskType && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block mb-2">{t("opp.previewTasks")}</span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary/80 text-secondary-foreground border border-border/50">{t(TASK_KEYS[TASK_VALS.indexOf(taskType)])}</span>
              </div>
            )}
            {/* Environment chips in final preview */}
            {envChips.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block mb-2">{t("opp.environmentChipsTitle")}</span>
                <div className="flex flex-wrap gap-1.5">
                  {envChips.map((ck) => (
                    <span key={ck} className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-secondary/80 text-secondary-foreground border border-border/50">{t(ENV_CHIPS.find((e) => e.key === ck)!.tKey)}</span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block mb-2">{t("opp.previewEnvironment")}</span>
              <RadarViz data={radarData} height={220} outerRadius={80} fontSize={10} />
              <hr className="border-border/40 my-3" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {AXIS_CONFIG.map((ax, i) => (
                  <div key={ax.key} className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground/70">{t(ax.labelKey)}</span>
                    <span className="font-bold font-mono tabular-nums text-primary">{roleAxes[ax.key]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return <SplitScreenLayout left={leftPanel} right={rightPanel} />;
}
