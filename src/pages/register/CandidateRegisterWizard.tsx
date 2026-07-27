import { useState, useCallback, KeyboardEvent } from "react";
import { ChevronLeft, User, Briefcase } from "lucide-react";
import { Lang } from "@/types";
import { useT } from "@/i18n/useT";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { RegisterOperativeStack } from "./RegisterOperativeStack";
import {
  BASE_INTERFACE_ITEMS,
  WORK_DYNAMICS_ITEMS,
} from "@/pages/candidate/operative-stack/OperativeStackTypes";
import type { OperativeStackData } from "./RegisterOperativeStack";

interface CandidateRegisterData {
  name: string;
  email: string;
  password: string;
  vocation: string;
  stackData: OperativeStackData;
}

const STEPS = ["name", "email", "password", "vocation", "stack"] as const;
type Step = (typeof STEPS)[number];

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
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];
  const totalSteps = STEPS.length;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vocation, setVocation] = useState("");

  // Operative Stack state
  const [stackData, setStackData] = useState<OperativeStackData>({
    baseItems: BASE_INTERFACE_ITEMS.map((i) => ({ ...i })),
    skills: [],
    dynamics: WORK_DYNAMICS_ITEMS.map((i) => ({ ...i })),
    credentials: [],
  });

  const goNext = () => {
    if (stepIdx < totalSteps - 1) setStepIdx((i) => i + 1);
  };
  const goPrev = () => {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
    else onBack();
  };

  const canContinue = () => {
    if (step === "name") return name.trim().length > 0;
    if (step === "email") return email.trim().length > 0 && email.includes("@");
    if (step === "password") return password.length >= 6;
    if (step === "vocation") return true;
    if (step === "stack") return true; // all optional, user can skip content
    return false;
  };

  const progressPct = ((stepIdx + 1) / totalSteps) * 100;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && canContinue() && step !== "stack") {
      if (stepIdx < totalSteps - 1) goNext();
    }
  };

  const inputClass = "w-full px-5 py-4 rounded-2xl border-2 border-border bg-input-background text-foreground text-base focus:border-primary focus:outline-none transition-colors shadow-sm";

  return (
    <div className="w-full max-w-2xl rounded-3xl bg-card border border-border shadow-2xl anim-modal flex flex-col" style={{ maxHeight: "90vh" }}>
      {/* Progress bar */}
      <div className="shrink-0 h-1.5 w-full bg-muted/40">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="shrink-0 px-7 md:px-9 pt-8">
        {/* Step indicator + back */}
        <div className="flex items-center justify-between mb-7">
          <button onClick={goPrev} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-0 p-1 transition-colors">
            <ChevronLeft size={16} /> {t("back")}
          </button>
          <span className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">{stepIdx + 1}/{totalSteps}</span>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-7 md:px-9 pb-8">
        {/* ── Step 0: Name ── */}
        {step === "name" && (
          <div className="anim-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <User size={24} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground text-center mb-2">{t("register.nameStep")}</h2>
            <p className="text-sm text-muted-foreground text-center mb-7">{t("register.candidate.step1Sub")}</p>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown}
              className={inputClass} autoFocus placeholder={t("register.name")} />
            <button onClick={goNext} disabled={!canContinue()}
              className="w-full mt-6 py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20">
              {t("continue")}
            </button>
          </div>
        )}

        {/* ── Step 1: Email ── */}
        {step === "email" && (
          <div className="anim-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <User size={24} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground text-center mb-2">{t("register.emailStep")}</h2>
            <p className="text-sm text-muted-foreground text-center mb-7">{t("register.emailStep")}</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown}
              className={inputClass} autoFocus placeholder="nombre@correo.com" />
            <button onClick={goNext} disabled={!canContinue()}
              className="w-full mt-6 py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20">
              {t("continue")}
            </button>
          </div>
        )}

        {/* ── Step 2: Password ── */}
        {step === "password" && (
          <div className="anim-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <User size={24} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground text-center mb-2">{t("register.passwordStep")}</h2>
            <p className="text-sm text-muted-foreground text-center mb-7">{t("register.passwordHint")}</p>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown}
              className={inputClass} placeholder="••••••••" />
            <button onClick={goNext} disabled={!canContinue()}
              className="w-full mt-6 py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20">
              {t("continue")}
            </button>
          </div>
        )}

        {/* ── Step 3: Vocation ── */}
        {step === "vocation" && (
          <div className="anim-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Briefcase size={24} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground text-center mb-2">{t("register.vocationStep")}</h2>
            <p className="text-sm text-muted-foreground text-center mb-7">{t("register.vocationPlaceholder")}</p>
            <input type="text" value={vocation} onChange={(e) => setVocation(e.target.value)} onKeyDown={handleKeyDown}
              className={inputClass} autoFocus placeholder={t("register.vocationPlaceholder")} />
            <button onClick={goNext}
              className="w-full mt-6 py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20">
              {t("continue")}
            </button>
          </div>
        )}

        {/* ── Step 4: Operative Stack (4 tabs: Base → Tools → Dynamics → Credentials) ── */}
        {step === "stack" && (
          <div className="anim-slide-up">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("register.candidate.stackStepTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("register.candidate.stackStepSub")}</p>
            </div>

            {/* OperativeStack component — 4 reusable tabs */}
            <RegisterOperativeStack
              t={t}
              data={stackData}
              onChange={setStackData}
            />

            {/* Submit — user can complete with or without data */}
            <button
              onClick={() =>
                onComplete({
                  name: name.trim(),
                  email: email.trim(),
                  password,
                  vocation: vocation.trim(),
                  stackData,
                })
              }
              className="w-full mt-6 py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20"
            >
              {t("register.submit")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
