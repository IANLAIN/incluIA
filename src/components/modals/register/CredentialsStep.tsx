import { useState, useCallback } from "react";
import { ChevronLeft, AlertCircle, Check, Plus, Pencil, Trash2 } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { signInWithGoogle } from "@/services/dataSource";
import { Role } from "@/types";

const REG_STEPS = ["name","email","password","vocation"] as const;
type RegStep = (typeof REG_STEPS)[number];
const REG_STEP_LABELS = ["register.name", "register.email", "register.password", "register.vocation"];

export function CredentialsStep({
  handleBack,
  Icon,
  t,
  error,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  vocation,
  setVocation,
  onRegister,
  selectedRole,
  loading,
}: any) {
  const [step, setStep] = useState<RegStep>("name");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");

  const stepIdx = REG_STEPS.indexOf(step);
  const totalSteps = REG_STEPS.length;
  const progressPct = ((stepIdx + 1) / totalSteps) * 100;

  const goNext = useCallback(() => {
    const idx = REG_STEPS.indexOf(step);
    if (idx < totalSteps - 1) setStep(REG_STEPS[idx + 1]);
  }, [step]);

  const goPrev = useCallback(() => {
    const idx = REG_STEPS.indexOf(step);
    if (idx > 0) setStep(REG_STEPS[idx - 1]);
    else handleBack();
  }, [step, handleBack]);

  const handleVocationToggle = (val: string) => {
    const current = vocation ? vocation.split(", ") : [];
    if (current.includes(val)) {
      const next = current.filter((v: string) => v !== val);
      setVocation(next.join(", "));
    } else {
      setVocation([...current, val].join(", "));
    }
  };

  const handleCustomAdd = () => {
    const current = vocation ? vocation.split(", ") : [];
    const custom = "Nuevo";
    if (!current.includes(custom)) {
      setVocation([...current, custom].join(", "));
      setEditIdx(current.length);
      setEditVal(custom);
    }
  };

  const handleRemoveVocation = (val: string) => {
    const current = vocation ? vocation.split(", ") : [];
    setVocation(current.filter((v: string) => v !== val).join(", "));
    setEditIdx(null);
  };

  const handleEditSave = (oldVal: string) => {
    const current = vocation ? vocation.split(", ") : [];
    const idx = current.indexOf(oldVal);
    if (idx !== -1 && editVal.trim()) {
      current[idx] = editVal.trim();
      setVocation(current.join(", "));
    }
    setEditIdx(null);
    setEditVal("");
  };

  const options: string[] = t("register.vocationOptions", { returnObjects: true }) as string[] || [];

  return (
    <div className="w-full max-w-md rounded-2xl mx-auto bg-card border border-border flex flex-col anim-modal" style={{ maxHeight: "85vh" }}>
        {/* Header */}
        <div className="px-5 md:px-8 py-4 border-b border-border shrink-0">
          <button
            onClick={goPrev}
            className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer mb-3 hover:text-foreground"
          >
            <ChevronLeft size={15} aria-hidden="true" />{t("register.back")}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary text-primary-foreground shrink-0">
              <Icon size={16} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-foreground truncate">{t("register.title")}</h2>
              <p className="text-xs text-muted-foreground">
                {t("register.stepCounter", { current: stepIdx + 1, total: totalSteps })}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Body */}
        <div className="px-5 md:px-8 py-5 overflow-y-auto flex-1 custom-scrollbar">
          <div role="alert" aria-live="assertive" aria-atomic="true">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 mb-4">
                <AlertCircle size={15} aria-hidden="true" className="shrink-0" />{error}
              </div>
            )}
          </div>

          {/* ── NAME STEP ── */}
          {step === "name" && (
            <div className="flex flex-col gap-4">
              <p className="text-base font-bold text-foreground">{t("register.nameStep")}</p>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" && name.trim()) goNext(); }}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-input-background text-foreground text-base focus:border-primary focus:outline-none transition-colors"
                placeholder="Jane Doe"
                autoFocus
              />
              <button
                onClick={() => goNext()}
                disabled={!name.trim()}
                className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm bg-primary text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-all"
              >
                {t("continue")}
              </button>
            </div>
          )}

          {/* ── EMAIL STEP ── */}
          {step === "email" && (
            <div className="flex flex-col gap-4">
              <p className="text-base font-bold text-foreground">{t("register.emailStep")}</p>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" && email.trim()) goNext(); }}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-input-background text-foreground text-base focus:border-primary focus:outline-none transition-colors"
                placeholder="nombre@correo.com"
                autoFocus
              />
              <button
                onClick={() => goNext()}
                disabled={!email.trim()}
                className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm bg-primary text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-all"
              >
                {t("continue")}
              </button>
            </div>
          )}

          {/* ── PASSWORD STEP ── */}
          {step === "password" && (
            <div className="flex flex-col gap-4">
              <p className="text-base font-bold text-foreground">{t("register.passwordStep")}</p>
              <PasswordInput
                id="register-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" && password.length >= 6) goNext(); }}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-input-background text-foreground text-base focus:border-primary focus:outline-none transition-colors"
                placeholder="••••••••"
                autoFocus
              />
              <p className="text-xs text-muted-foreground -mt-2">Mínimo 6 caracteres</p>
              <button
                onClick={() => goNext()}
                disabled={password.length < 6}
                className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm bg-primary text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-all"
              >
                {t("continue")}
              </button>
            </div>
          )}

          {/* ── VOCATION STEP ── */}
          {step === "vocation" && (
            <div className="flex flex-col gap-3">
              <p className="text-base font-bold text-foreground">{t("register.vocationStep")}</p>

              {/* Selectable cards */}
              <div className="grid grid-cols-2 gap-2">
                {options.map((opt: string, idx: number) => {
                  const isSelected = vocation?.split(", ").includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        if (editIdx !== null && editIdx !== idx) {
                          handleEditSave(options[editIdx]);
                        }
                        handleVocationToggle(opt);
                      }}
                      className={`relative flex items-center gap-2 px-3 py-3 rounded-xl border-2 cursor-pointer text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                      }`}>
                        {isSelected && <Check size={12} className="text-primary-foreground" />}
                      </div>
                      <span className="text-sm font-semibold leading-tight">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom/editable entries */}
              {vocation && vocation.split(", ").filter((v: string) => !options.includes(v)).length > 0 && (
                <div className="flex flex-col gap-2 mt-1">
                  {vocation.split(", ").filter((v: string) => !options.includes(v)).map((customVal: string, i: number) => {
                    const isEditing = editIdx !== null && editIdx === (options.length + i);
                    return (
                      <div key={customVal + i} className="flex items-center gap-2">
                        {isEditing ? (
                          <div className="flex-1 flex gap-2">
                            <input
                              value={editVal}
                              onChange={(e) => setEditVal(e.target.value)}
                              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") handleEditSave(customVal); if (e.key === "Escape") { setEditIdx(null); setEditVal(""); }}}
                              className="flex-1 px-3 py-2 rounded-lg border-2 border-primary bg-background text-sm focus:outline-none"
                              autoFocus
                              placeholder={t("register.editPlaceholder")}
                            />
                            <button onClick={() => handleEditSave(customVal)} className="p-2 rounded-lg bg-primary text-primary-foreground border-0 cursor-pointer">
                              <Check size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-primary/50 bg-primary/5">
                              <span className="text-sm font-semibold flex-1">{customVal}</span>
                              <button onClick={() => { setEditIdx(options.length + i); setEditVal(customVal); }} className="p-1 rounded-md hover:bg-secondary text-muted-foreground border-0 cursor-pointer">
                                <Pencil size={13} />
                              </button>
                            </div>
                            <button onClick={() => handleRemoveVocation(customVal)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 border-0 cursor-pointer">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add custom button */}
              <button
                onClick={handleCustomAdd}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40 cursor-pointer transition-all text-sm font-semibold"
              >
                <Plus size={16} />{t("register.addCustom")}
              </button>

              {/* Submit */}
              <button
                onClick={() => onRegister(email, password, name, selectedRole!, vocation)}
                disabled={loading || !email || !password || !selectedRole || !vocation}
                className="w-full py-3.5 mt-3 rounded-xl font-bold text-sm bg-primary text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
              >
                {loading ? "..." : t("register.submit")}
              </button>

              {/* Google divider */}
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-border" aria-hidden="true" />
                <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs font-bold uppercase tracking-wider">{t("register.or")}</span>
                <div className="flex-grow border-t border-border" aria-hidden="true" />
              </div>

              <button
                onClick={async () => { try { await signInWithGoogle(selectedRole!, "register"); } catch {} }}
                disabled={loading || !selectedRole}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 border-2 border-border bg-card text-foreground hover:bg-secondary hover:border-primary/30 disabled:opacity-60 cursor-pointer transition-colors"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t("register.google")}
              </button>
            </div>
          )}
        </div>
      </div>
  );
}
