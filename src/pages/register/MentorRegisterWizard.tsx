import { useState, useCallback, KeyboardEvent } from "react";
import { ChevronLeft, Users, BookOpen } from "lucide-react";
import { Lang } from "@/types";
import { useT, C } from "@/i18n/useT";
import { PasswordInput } from "@/components/ui/PasswordInput";

interface MentorRegisterData {
  name: string;
  email: string;
  password: string;
  specialties: string;
}

const SPECIALTIES = [
  "register.mentor.spec.inclusion",
  "register.mentor.spec.executive",
  "register.mentor.spec.adaptive",
  "register.mentor.spec.sensory",
  "register.mentor.spec.transition",
  "register.mentor.spec.coaching",
];

const STEPS = ["name", "email", "password", "spec"] as const;
type Step = (typeof STEPS)[number];

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
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];
  const totalSteps = STEPS.length;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);

  const goNext = () => { if (stepIdx < totalSteps - 1) setStepIdx((i) => i + 1); };
  const goPrev = () => { if (stepIdx > 0) setStepIdx((i) => i - 1); else onBack(); };

  const canContinue = () => {
    if (step === "name") return name.trim().length > 0;
    if (step === "email") return email.includes("@") && email.trim().length > 0;
    if (step === "password") return password.length >= 6;
    if (step === "spec") return specialties.length > 0;
    return false;
  };

  const progressPct = ((stepIdx + 1) / totalSteps) * 100;
  const inputClass = "w-full px-5 py-4 rounded-2xl border-2 border-border bg-input-background text-foreground text-base focus:border-primary focus:outline-none transition-colors shadow-sm";

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && canContinue() && stepIdx < totalSteps - 1) goNext();
  };

  const toggleSpecialty = (specKey: string) => {
    setSpecialties((prev) =>
      prev.includes(specKey) ? prev.filter((s) => s !== specKey) : [...prev, specKey]
    );
  };

  return (
    <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl overflow-hidden anim-modal">
      <div className="h-1.5 w-full bg-muted/40">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="px-7 md:px-9 py-8">
        <div className="flex items-center justify-between mb-7">
          <button onClick={goPrev} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-0 p-1 transition-colors">
            <ChevronLeft size={16} /> {t("back")}
          </button>
          <span className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">{stepIdx + 1}/{totalSteps}</span>
        </div>

        {step === "name" && (
          <div className="anim-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5"><Users size={24} className="text-primary" /></div>
            <h2 className="text-2xl font-bold text-foreground text-center mb-2">{t("register.nameStep")}</h2>
            <p className="text-sm text-muted-foreground text-center mb-7">{t("register.mentor.step1Sub")}</p>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} className={inputClass} autoFocus placeholder={t("register.name")} />
            <button onClick={goNext} disabled={!canContinue()} className="w-full mt-6 py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20">{t("continue")}</button>
          </div>
        )}

        {step === "email" && (
          <div className="anim-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5"><Users size={24} className="text-primary" /></div>
            <h2 className="text-2xl font-bold text-foreground text-center mb-2">{t("register.emailStep")}</h2>
            <p className="text-sm text-muted-foreground text-center mb-7">{t("register.emailStep")}</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} className={inputClass} autoFocus placeholder="nombre@correo.com" />
            <button onClick={goNext} disabled={!canContinue()} className="w-full mt-6 py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20">{t("continue")}</button>
          </div>
        )}

        {step === "password" && (
          <div className="anim-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5"><Users size={24} className="text-primary" /></div>
            <h2 className="text-2xl font-bold text-foreground text-center mb-2">{t("register.passwordStep")}</h2>
            <p className="text-sm text-muted-foreground text-center mb-7">{t("register.passwordHint")}</p>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} className={inputClass} placeholder="••••••••" />
            <button onClick={goNext} disabled={!canContinue()} className="w-full mt-6 py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20">{t("continue")}</button>
          </div>
        )}

        {step === "spec" && (
          <div className="anim-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5"><BookOpen size={24} className="text-primary" /></div>
            <h2 className="text-2xl font-bold text-foreground text-center mb-2">{t("register.mentor.areasStep")}</h2>
            <p className="text-sm text-muted-foreground text-center mb-7">{t("register.mentor.areasHint")}</p>
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto custom-scrollbar mb-6">
              {SPECIALTIES.map((specKey) => {
                const isSelected = specialties.includes(specKey);
                return (
                  <button
                    key={specKey}
                    onClick={() => toggleSpecialty(specKey)}
                    className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border-2 cursor-pointer text-left transition-all text-sm font-semibold ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "bg-primary border-primary" : "border-muted-foreground/50"
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    {t(specKey)}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onComplete({ name: name.trim(), email: email.trim(), password, specialties: specialties.join(", ") })}
              disabled={!canContinue()}
              className="w-full mt-6 py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20">{t("register.submit")}</button>
          </div>
        )}
      </div>
    </div>
  );
}
