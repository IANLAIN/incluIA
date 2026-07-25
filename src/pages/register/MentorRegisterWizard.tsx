import { useState, useCallback } from "react";
import { ArrowLeft, Check, Users, BookOpen, Clock, Video } from "lucide-react";
import { Lang } from "@/types";
import { useT } from "@/i18n/useT";
import { SelectableCard } from "@/components/common/SelectableCard";
import { SelectableChip } from "@/components/common/SelectableChip";
import { CustomSlider } from "@/components/common/CustomSlider";
import { Overlay } from "@/components/common/Overlay";

type WizardStep = 1 | 2 | 3;

const TOTAL_STEPS = 3;

const SPECIALTY_KEYS = [
  "register.mentor.spec.inclusion",
  "register.mentor.spec.executive",
  "register.mentor.spec.adaptive",
  "register.mentor.spec.sensory",
  "register.mentor.spec.transition",
  "register.mentor.spec.coaching",
] as const;

const MODALITY_KEYS = ["register.mentor.mod.virtual", "register.mentor.mod.in_person", "register.mentor.mod.both"] as const;
const MODALITY_VALS = ["virtual", "in_person", "both"] as const;

interface MentorRegisterData {
  name: string;
  email: string;
  password: string;
  specialties: string[];
  experienceYears: number;
  modality: string;
  approachAxis: number;
}

export function MentorRegisterWizard({
  lang,
  onComplete,
  onBack,
}: {
  lang: Lang;
  onComplete: (data: MentorRegisterData) => void;
  onBack: () => void;
}) {
  const t = useT(lang);

  const [step, setStep] = useState<WizardStep>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState(3);
  const [modality, setModality] = useState<string | null>(null);
  const [approachAxis, setApproachAxis] = useState(50);

  const toggleSpecialty = useCallback((key: string) => {
    setSpecialties((prev) => prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]);
  }, []);

  const canStep1 = name.trim() && email.trim() && password.length >= 6;
  const canStep2 = specialties.length > 0 && modality !== null;

  const handleFinish = useCallback(() => {
    onComplete({ name, email, password, specialties, experienceYears, modality: modality || "", approachAxis });
  }, [name, email, password, specialties, experienceYears, modality, approachAxis, onComplete]);

  return (
    <Overlay>
      <div className="w-full max-w-lg rounded-2xl mx-auto bg-card border border-border max-h-[90vh] overflow-y-auto">
        <div className="px-6 md:px-8 py-6">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1.5 flex-1">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div key={i} className="h-2 rounded-full transition-all duration-500"
                  style={{ width: i === step - 1 ? "48px" : "24px", backgroundColor: i <= step - 1 ? "var(--primary)" : "var(--muted)", opacity: i <= step - 1 ? 1 : 0.4 }}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
              {t("orgOnboarding.step")} {step} {t("orgOnboarding.of")} {TOTAL_STEPS}
            </span>
          </div>

          {step > 1 && (
            <button onClick={() => setStep((step - 1) as WizardStep)}
              className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors cursor-pointer bg-transparent border-0">
              <ArrowLeft size={16} /> {t("back")}
            </button>
          )}

          {/* STEP 1 — Basic info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-foreground">{t("register.mentor.step1Title")}</h2>
              <p className="text-sm text-muted-foreground">{t("register.mentor.step1Sub")}</p>
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

          {/* STEP 2 — Specialties & modality */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">{t("register.mentor.step2Title")}</h2>
              <p className="text-sm text-muted-foreground">{t("register.mentor.step2Sub")}</p>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t("register.mentor.specialtiesLabel")}</label>
                <p className="text-xs text-muted-foreground mb-3">{t("register.mentor.specialtiesHint")}</p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTY_KEYS.map((sk) => (
                    <SelectableChip key={sk} selected={specialties.includes(sk)} onClick={() => toggleSpecialty(sk)} label={t(sk)} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t("register.mentor.modalityLabel")}</label>
                <p className="text-xs text-muted-foreground mb-3">{t("register.mentor.modalityHint")}</p>
                <div className="grid grid-cols-3 gap-3">
                  {MODALITY_KEYS.map((mk, i) => (
                    <SelectableCard key={mk} selected={modality === MODALITY_VALS[i]} onClick={() => setModality(MODALITY_VALS[i])} className="p-4 flex-col text-center gap-2">
                      <span className="font-semibold text-sm">{t(mk)}</span>
                    </SelectableCard>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(3)} disabled={!canStep2}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer">
                {t("continue")} <span className="ml-2">→</span>
              </button>
            </div>
          )}

          {/* STEP 3 — Experience + Approach */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">{t("register.mentor.step3Title")}</h2>
              <p className="text-sm text-muted-foreground">{t("register.mentor.step3Sub")}</p>

              <div>
                <span className="text-sm font-bold text-foreground">{t("register.mentor.experienceLabel")}</span>
                <p className="text-xs text-muted-foreground mb-2">{t("register.mentor.experienceHint")}</p>
                <CustomSlider value={experienceYears} onChange={setExperienceYears} min={0} max={20} step={1}
                  labelLeft={t("register.mentor.experienceLow")} labelRight={t("register.mentor.experienceHigh")} />
              </div>

              <div>
                <span className="text-sm font-bold text-foreground">{t("register.mentor.approachLabel")}</span>
                <p className="text-xs text-muted-foreground mb-2">{t("register.mentor.approachHint")}</p>
                <CustomSlider value={approachAxis} onChange={setApproachAxis}
                  labelLeft={t("register.mentor.approachLeft")} labelRight={t("register.mentor.approachRight")} />
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl border-2 border-border bg-background space-y-2">
                <div className="flex items-center gap-2 text-sm"><Users size={14} className="text-primary" /> <span className="font-semibold">{name || "—"}</span></div>
                <div className="flex items-center gap-2 text-sm"><BookOpen size={14} className="text-primary" /> <span className="font-semibold">{specialties.length}</span> {t("register.mentor.specialtiesLabel")}</div>
                <div className="flex items-center gap-2 text-sm"><Clock size={14} className="text-primary" /> <span className="font-semibold">{experienceYears}</span> {t("register.mentor.experienceSuffix")}</div>
                <div className="flex items-center gap-2 text-sm"><Video size={14} className="text-primary" /> {modality ? t(MODALITY_KEYS[MODALITY_VALS.indexOf(modality as any)]) : "—"}</div>
              </div>

              <button onClick={handleFinish}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 cursor-pointer flex items-center justify-center gap-2">
                <Check size={16} /> {t("register.submit")}
              </button>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}
