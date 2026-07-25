import { useState, useCallback, useRef, KeyboardEvent } from "react";
import { ArrowLeft, Check, X, Briefcase, Monitor, Headphones, Clock, Sparkles } from "lucide-react";
import { Lang, Role } from "@/types";
import { useT } from "@/i18n/useT";
import { SelectableCard } from "@/components/common/SelectableCard";
import { SelectableChip } from "@/components/common/SelectableChip";
import { CustomSlider } from "@/components/common/CustomSlider";
import { Overlay } from "@/components/common/Overlay";

type WizardStep = 1 | 2 | 3 | 4;

const TOTAL_STEPS = 4;

const WORK_MODALITY_KEYS = ["modality.remote", "modality.hybrid", "modality.in_person"] as const;
const WORK_MODALITY_VALS = ["remote", "hybrid", "in_person"] as const;

const ENV_KEYS = [
  "register.cand.env.silence",
  "register.cand.env.low_noise",
  "register.cand.env.moderate",
  "register.cand.env.dynamic",
] as const;

const ENV_VALS = ["silence", "low_noise", "moderate", "dynamic"] as const;

const PREFERRED_ADJUSTMENTS = [
  "register.cand.adj.flexible_hours",
  "register.cand.adj.async_comm",
  "register.cand.adj.written_instructions",
  "register.cand.adj.quiet_space",
  "register.cand.adj.noise_canceling",
  "register.cand.adj.visual_tasks",
  "register.cand.adj.mentor_support",
] as const;

interface CandidateRegisterData {
  name: string;
  email: string;
  password: string;
  workModality: string;
  environmentPreference: string;
  communicationAxis: number;
  focusAxis: number;
  adjustments: string[];
  skills: string[];
}

export function CandidateRegisterWizard({
  lang,
  onComplete,
  onBack,
}: {
  lang: Lang;
  onComplete: (data: CandidateRegisterData) => void;
  onBack: () => void;
}) {
  const t = useT(lang);
  const skillInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<WizardStep>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workModality, setWorkModality] = useState<string | null>(null);
  const [environmentPreference, setEnvironmentPreference] = useState<string | null>(null);
  const [communicationAxis, setCommunicationAxis] = useState(50);
  const [focusAxis, setFocusAxis] = useState(50);
  const [adjustments, setAdjustments] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = useCallback((name: string) => {
    const trimmed = name.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  }, [skills]);

  const removeSkill = useCallback((name: string) => setSkills((prev) => prev.filter((s) => s !== name)), []);

  const handleSkillKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput);
    }
  }, [addSkill, skillInput]);

  const toggleAdjustment = useCallback((key: string) => {
    setAdjustments((prev) => prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]);
  }, []);

  const canStep1 = name.trim() && email.trim() && password.length >= 6;
  const canStep3 = communicationAxis >= 0 && focusAxis >= 0;
  const canStep4 = workModality !== null;

  const stepLabel = `${t("orgOnboarding.step")} ${step} ${t("orgOnboarding.of")} ${TOTAL_STEPS}`;

  const handleFinish = useCallback(() => {
    onComplete({
      name, email, password,
      workModality: workModality || "",
      environmentPreference: environmentPreference || "",
      communicationAxis,
      focusAxis,
      adjustments,
      skills,
    });
  }, [name, email, password, workModality, environmentPreference, communicationAxis, focusAxis, adjustments, skills, onComplete]);

  const progressBar = (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex gap-1.5 flex-1">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className="h-2 rounded-full transition-all duration-500"
            style={{ width: i === step - 1 ? "48px" : "24px", backgroundColor: i <= step - 1 ? "var(--primary)" : "var(--muted)", opacity: i <= step - 1 ? 1 : 0.4 }}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">{stepLabel}</span>
    </div>
  );

  return (
    <Overlay>
      <div className="w-full max-w-lg rounded-2xl mx-auto bg-card border border-border max-h-[90vh] overflow-y-auto">
        <div className="px-6 md:px-8 py-6">
          {progressBar}

          {(step as number) > 1 && (
            <button onClick={() => setStep((step - 1) as WizardStep)}
              className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors cursor-pointer bg-transparent border-0">
              <ArrowLeft size={16} /> {t("back")}
            </button>
          )}

          {/* STEP 1 — Basic info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-foreground">{t("register.candidate.step1Title")}</h2>
              <p className="text-sm text-muted-foreground">{t("register.candidate.step1Sub")}</p>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">{t("register.name")}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input-background text-foreground focus:border-primary focus:outline-none"
                  placeholder={t("register.name")} autoFocus />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">{t("register.email")}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input-background text-foreground focus:border-primary focus:outline-none"
                  placeholder={t("register.email")} />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">{t("register.password")}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input-background text-foreground focus:border-primary focus:outline-none"
                  placeholder="••••••••" />
                <p className="text-xs text-muted-foreground mt-1">{t("register.passwordHint")}</p>
              </div>
              <button onClick={() => setStep(2)} disabled={!canStep1}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer">
                {t("continue")} <span className="ml-2">→</span>
              </button>
            </div>
          )}

          {/* STEP 2 — Work environment & preferences */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">{t("register.candidate.step2Title")}</h2>
              <p className="text-sm text-muted-foreground">{t("register.candidate.step2Sub")}</p>

              {/* Work modality */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t("register.candidate.modalityLabel")}</label>
                <p className="text-xs text-muted-foreground mb-3">{t("register.candidate.modalityHint")}</p>
                <div className="grid grid-cols-3 gap-3">
                  {WORK_MODALITY_KEYS.map((mk, i) => (
                    <SelectableCard key={mk} selected={workModality === WORK_MODALITY_VALS[i]} onClick={() => setWorkModality(WORK_MODALITY_VALS[i])} className="p-4 flex-col text-center gap-2">
                      <span className="font-semibold text-sm">{t(mk)}</span>
                    </SelectableCard>
                  ))}
                </div>
              </div>

              {/* Environment preference */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t("register.candidate.envLabel")}</label>
                <p className="text-xs text-muted-foreground mb-3">{t("register.candidate.envHint")}</p>
                <div className="grid grid-cols-2 gap-3">
                  {ENV_KEYS.map((ek, i) => (
                    <SelectableCard key={ek} selected={environmentPreference === ENV_VALS[i]} onClick={() => setEnvironmentPreference(ENV_VALS[i])} className="p-4">
                      <span className="font-semibold text-sm">{t(ek)}</span>
                    </SelectableCard>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(3)}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 cursor-pointer">
                {t("continue")} <span className="ml-2">→</span>
              </button>
            </div>
          )}

          {/* STEP 3 — Operational axes (sliders) + Adjustments */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">{t("register.candidate.step3Title")}</h2>
              <p className="text-sm text-muted-foreground">{t("register.candidate.step3Sub")}</p>

              <div>
                <span className="text-sm font-bold text-foreground">{t("register.candidate.axis1Label")}</span>
                <p className="text-xs text-muted-foreground mb-2">{t("register.candidate.axis1Hint")}</p>
                <CustomSlider value={communicationAxis} onChange={setCommunicationAxis}
                  labelLeft={t("register.candidate.axis1Left")} labelRight={t("register.candidate.axis1Right")} />
              </div>

              <div>
                <span className="text-sm font-bold text-foreground">{t("register.candidate.axis2Label")}</span>
                <p className="text-xs text-muted-foreground mb-2">{t("register.candidate.axis2Hint")}</p>
                <CustomSlider value={focusAxis} onChange={setFocusAxis}
                  labelLeft={t("register.candidate.axis2Left")} labelRight={t("register.candidate.axis2Right")} />
              </div>

              {/* Adjustments catalog */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t("register.candidate.adjustmentsLabel")}</label>
                <p className="text-xs text-muted-foreground mb-3">{t("register.candidate.adjustmentsHint")}</p>
                <div className="flex flex-wrap gap-2">
                  {PREFERRED_ADJUSTMENTS.map((aj) => (
                    <SelectableChip key={aj} selected={adjustments.includes(aj)} onClick={() => toggleAdjustment(aj)} label={t(aj)} />
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(4)} disabled={!canStep3}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer">
                {t("continue")} <span className="ml-2">→</span>
              </button>
            </div>
          )}

          {/* STEP 4 — Skills + Summary */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-foreground">{t("register.candidate.step4Title")}</h2>
              <p className="text-sm text-muted-foreground">{t("register.candidate.step4Sub")}</p>

              {/* Skills */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">{t("register.candidate.skillsLabel")}</label>
                <p className="text-xs text-muted-foreground mb-2">{t("register.candidate.skillsHint")}</p>
                <input ref={skillInputRef} type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input-background text-foreground focus:border-primary focus:outline-none"
                  placeholder={t("register.candidate.skillsPlaceholder")} />
                <div className="flex flex-wrap gap-2 mt-3">
                  {skills.map((sk) => (
                    <span key={sk} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      {sk}
                      <button onClick={() => removeSkill(sk)} className="p-0.5 rounded-full hover:bg-primary/20 cursor-pointer border-0 bg-transparent">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Summary preview */}
              <div className="p-4 rounded-xl border-2 border-border bg-background space-y-2">
                <div className="flex items-center gap-2 text-sm"><Briefcase size={14} className="text-primary" /> <span className="font-semibold">{t("register.candidate.summaryModality")}:</span> {workModality ? t(WORK_MODALITY_KEYS[WORK_MODALITY_VALS.indexOf(workModality as any)]) : "—"}</div>
                <div className="flex items-center gap-2 text-sm"><Monitor size={14} className="text-primary" /> <span className="font-semibold">{t("register.candidate.summaryEnv")}:</span> {environmentPreference ? t(ENV_KEYS[ENV_VALS.indexOf(environmentPreference as any)]) : "—"}</div>
                <div className="flex items-center gap-2 text-sm"><Headphones size={14} className="text-primary" /> <span className="font-semibold">{t("register.candidate.summaryAdjustments")}:</span> {adjustments.length}</div>
                <div className="flex items-center gap-2 text-sm"><Sparkles size={14} className="text-primary" /> <span className="font-semibold">{t("register.candidate.summarySkills")}:</span> {skills.length}</div>
              </div>

              <button onClick={handleFinish} disabled={!canStep4}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer flex items-center justify-center gap-2">
                <Check size={16} /> {t("register.submit")}
              </button>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}
