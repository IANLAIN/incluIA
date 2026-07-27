import { useState } from "react";
import { ChevronLeft, AlertCircle, UserPlus } from "lucide-react";
import { Lang } from "@/types";
import { useT } from "@/i18n/useT";
import { signInWithGoogle, resetPasswordForEmail } from "@/services/dataSource";
import { PasswordInput } from "../ui/PasswordInput";

export function LoginModal({ lang, onLogin, onBack, onRegister, onDemoQuickLogin, error, loading }: {
  lang: Lang;
  onLogin: (email?: string, password?: string) => void;
  onBack: () => void;
  onRegister?: () => void;
  onDemoQuickLogin?: (demoEmail: string) => void;
  error?: string | null;
  loading?: boolean;
}) {
  const t = useT(lang);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [resetSent, setResetSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const displayError = localError || error;
  const isBusy = localLoading || loading;

  const handleLoginSubmit = () => {
    setLocalError(null);
    
    if (!email && !password) {
      setLocalError(t("login.emailError") + " " + t("login.passwordError"));
      return;
    }
    if (!email) {
      setLocalError(t("login.emailError"));
      return;
    }
    if (!password) {
      setLocalError(t("login.passwordError"));
      return;
    }
    
    onLogin(email, password);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isBusy) {
      if (mode === "login") handleLoginSubmit();
      else handleReset();
    }
  };

  const handleReset = async () => {
    setLocalError(null);
    if (!email) {
      setLocalError(t("login.emailError"));
      return;
    }
    setLocalLoading(true);
    try {
      await resetPasswordForEmail(email);
      setResetSent(true);
    } catch (e: any) {
      setLocalError(e.message ?? "Error sending reset link.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl mx-auto bg-card border border-border flex flex-col anim-modal" style={{ maxHeight: "85vh" }}>
      <div className="px-4 md:px-8 py-7 border-b border-border shrink-0">
        <button onClick={() => {
          if (mode === "forgot") { setMode("login"); setResetSent(false); setLocalError(null); }
          else onBack();
        }} className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer mb-4">
          <ChevronLeft size={15} aria-hidden="true" />{mode === "forgot" ? (t("login.backLogin")) : t("login.back")}
        </button>
        <div className="text-xl font-bold text-foreground">{mode === "forgot" ? (t("login.forgotTitle")) : t("login.title")}</div>
      </div>
      <div className="p-4 md:p-8 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
        <div role="alert" aria-live="assertive" aria-atomic="true">
          {displayError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#FEF2F2", color: "#C0392B" }}>
              <AlertCircle size={15} aria-hidden="true" />{displayError}
            </div>
          )}
        </div>
        {resetSent && mode === "forgot" && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#F0FDF4", color: "#166534" }}>
            <AlertCircle size={15} aria-hidden="true" />
            {t("login.recoverySent")}
          </div>
        )}
        <div>
          <label htmlFor="login-email" className="block text-sm font-semibold text-foreground mb-2">{t("login.email")}</label>
          <input id="login-email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} className="w-full px-4 py-3 rounded-xl border-2 border-border text-foreground text-base" style={{ backgroundColor: "var(--input-background)" }} placeholder="nombre@correo.com" />
        </div>
        {mode === "login" && (
          <div>
            <label htmlFor="login-password" className="block text-sm font-semibold text-foreground mb-2">{t("login.pass")}</label>
            <PasswordInput id="login-password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} className="w-full px-4 py-3 rounded-xl border-2 border-border text-foreground text-base mb-2" style={{ backgroundColor: "var(--input-background)" }} placeholder="••••••••" />
            <div className="flex justify-end">
              <button onClick={() => { setMode("forgot"); setLocalError(null); }} className="text-sm text-primary font-medium cursor-pointer hover:underline">
                {t("login.forgot")}
              </button>
            </div>
          </div>
        )}
        
        {mode === "login" ? (
          <>
            <button onClick={handleLoginSubmit} disabled={isBusy || !email || !password} className="w-full py-4 rounded-xl font-bold text-base cursor-pointer" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", opacity: (isBusy || !email || !password) ? 0.6 : 1 }}>
              {isBusy ? "..." : t("login.submit")}
            </button>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm font-medium">o</span>
              <div className="flex-grow border-t border-border"></div>
            </div>
            <button
              onClick={async () => { try { await signInWithGoogle(undefined, 'login'); } catch {} }}
              disabled={isBusy}
              className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 border-2 border-border cursor-pointer hover:bg-secondary transition-colors"
              style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </button>

            {onRegister && (
              <div className="text-center mt-2 pt-4 border-t border-border">
                <button
                  onClick={onRegister}
                  className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 cursor-pointer transition-all hover:opacity-90"
                  style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
                >
                  <UserPlus size={18} />
                  {t("auth.new")}
                </button>
              </div>
            )}
          </>
        ) : (
          <button onClick={handleReset} disabled={isBusy || resetSent} className="w-full py-4 rounded-xl font-bold text-base cursor-pointer" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", opacity: (isBusy || resetSent) ? 0.6 : 1 }}>
            {isBusy ? "..." : (t("login.sendLink"))}
          </button>
        )}

        {onDemoQuickLogin && (
          <div className="mt-4 pt-5 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
              {t("login.demoTitle")}
            </p>
            <div className="flex flex-col gap-2">
              {[
                { key: "candidato@astris.org", label: t("login.demoCandidate") },
                { key: "organizacion@astris.org", label: t("login.demoOrganization") },
                { key: "mentor@astris.org", label: t("login.demoMentor") },
              ].map((demo) => (
                <button
                  key={demo.key}
                  onClick={() => onDemoQuickLogin(demo.key)}
                  className="w-full py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:scale-[1.01] border-2 border-border hover:border-primary/50 hover:bg-primary/5"
                  style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
