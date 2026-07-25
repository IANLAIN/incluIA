import { useState, useEffect } from "react";
import { Role, QuizAnswers } from "@/types";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  getCandidateQuizAnswers,
  isDemoUserId,
} from "@/services/dataSource";
import { handleDemoLogin, handleDemoRegister } from "@/services/demoAuth";

export function useAuth(setScreen: (s: string) => void, setModalStep: (s: any) => void) {
  const [role, setRole] = useState<Role | null>(null);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [appReady, setAppReady] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [googleAuthUser, setGoogleAuthUser] = useState<any>(null);
  const [requirePasswordUpdate, setRequirePasswordUpdate] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [userVocation, setUserVocation] = useState<string>("");
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [loadedQuizAnswers, setLoadedQuizAnswers] = useState<QuizAnswers>({});
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const stored = window.localStorage.getItem("astris_quiz_completed");
    if (stored === "true") setQuizCompleted(true);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          if ((user as any).needsRegistration) {
            setAuthMessage("No tienes cuenta, redireccionando a registro...");
            setAppReady(true);
            setTimeout(() => {
              setAuthMessage(null);
              setGoogleAuthUser(user);
              setPendingRole(user.role);
              setModalStep("register");
            }, 3000);
            return;
          }

          setRole(user.role);
          setUserName(user.name);
          setUserAvatar((user as any).avatarUrl || "");
          setUserVocation((user as any).vocation || "");
          setLoggedIn(true);
          setUserId(user.id);
          setModalStep("none");

          const demo = isDemoUserId(user.id);

          if (user.role === "candidate") {
            const savedAnswers = await getCandidateQuizAnswers(user.id);
            if (savedAnswers && Object.keys(savedAnswers).length > 0) {
              setLoadedQuizAnswers(savedAnswers);
              try { window.localStorage.setItem("astris_quiz_answers", JSON.stringify(savedAnswers)); } catch { /* ignore */ }
            }
          }

          if (user.role === "candidate") {
            if (demo) {
              setQuizCompleted(true);
              window.localStorage.setItem("astris_quiz_completed", "true");
              setScreen("profile");
            } else if (!quizCompleted) {
              setScreen("onboarding");
            } else {
              setScreen("vacancies");
            }
          } else if (user.role === "organization") {
            setScreen(demo ? "candidates" : "org-profile");
          } else if (user.role === "mentor") {
            setScreen(demo ? "dashboard" : "dashboard");
          }
        }
      } catch {
        // No active session
      } finally {
        setAppReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setScreen, setModalStep]);

  const handleCompleteGoogleRegistration = () => {
    if (googleAuthUser) {
      setRole(googleAuthUser.role);
      setUserName(googleAuthUser.name);
      setUserAvatar(googleAuthUser.avatarUrl || "");
      setUserVocation(googleAuthUser.vocation || "");
      setLoggedIn(true);
      setModalStep("none");
      if (googleAuthUser.role === "candidate" && !quizCompleted) {
        setScreen("onboarding");
      } else {
        const first = googleAuthUser.role === "candidate"
          ? "vacancies"
          : googleAuthUser.role === "organization" ? "org-profile" : "dashboard";
        setScreen(first);
      }
      setGoogleAuthUser(null);
    }
  };

  const handleRegister = async (email: string, password: string, name: string, selectedRole: Role, vocation: string) => {
    // Try local registration (non-demo) first
    const handled = handleDemoRegister(email, password, name, selectedRole, vocation, setRole, setUserName, setUserVocation, setLoggedIn, setModalStep, setQuizCompleted, setScreen);
    if (handled) return;

    // Otherwise delegate to dataSource -> supabase
    setAuthLoading(true);
    setAuthError(null);
    try {
      await registerUser(email, password, name, selectedRole, vocation);
      setAuthMessage("Registro exitoso. Revisa tu correo para confirmar tu cuenta.");
      setTimeout(() => {
        setAuthMessage(null);
        setModalStep("login");
      }, 4000);
    } catch (err: any) {
      setAuthError(err.message ?? "Registration failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (email?: string, password?: string) => {
    // Demo mode: always try local demo accounts first
    if (email && password) {
      const handled = handleDemoLogin(email, password, setRole, setUserName, setUserVocation, setQuizCompleted, setLoggedIn, setModalStep, setScreen);
      if (handled) {
        // CRITICAL: set userId and load quiz answers for demo users (handleDemoLogin does NOT set userId)
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
          if (user.role === "candidate") {
            const savedAnswers = await getCandidateQuizAnswers(user.id);
            if (savedAnswers && Object.keys(savedAnswers).length > 0) {
              setLoadedQuizAnswers(savedAnswers);
              try { window.localStorage.setItem("astris_quiz_answers", JSON.stringify(savedAnswers)); } catch { /* ignore */ }
            }
          }
        }
        return;
      }
    }

    if (!email || !password) {
      setAuthError("Por favor ingresa tu correo electrónico y contraseña.");
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    try {
      // Delegate to dataSource — it handles both local (non-demo) and supabase login
      await loginUser(email, password);
      const user = await getCurrentUser();
      if (!user) {
        setAuthError("Credenciales inválidas. Verifica tu correo y contraseña.");
        return;
      }
      const resolvedRole = user?.role ?? "candidate";
      setRole(resolvedRole);
      setUserName(user?.name ?? "");
      setUserAvatar((user as any)?.avatarUrl ?? "");
      setUserVocation((user as any)?.vocation ?? "");
      setUserId(user?.id ?? "");
      setLoggedIn(true);
      setModalStep("none");

      if (resolvedRole === "candidate" && user?.id) {
        const savedAnswers = await getCandidateQuizAnswers(user.id);
        if (savedAnswers && Object.keys(savedAnswers).length > 0) {
          setLoadedQuizAnswers(savedAnswers);
          try { window.localStorage.setItem("astris_quiz_answers", JSON.stringify(savedAnswers)); } catch { /* ignore */ }
        }
      }

      if (resolvedRole === "candidate" && !quizCompleted) {
        setScreen("onboarding");
      } else {
        setScreen(resolvedRole === "candidate" ? "vacancies" : resolvedRole === "organization" ? "candidates" : "dashboard");
      }
    } catch (err: any) {
      setAuthError(err.message ?? "Login failed. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  /** Demo quick-login: directly log in as a demo user by role */
  const handleDemoQuickLogin = async (demoEmail: string) => {
    const handled = handleDemoLogin(demoEmail, "Demo2026", setRole, setUserName, setUserVocation, setQuizCompleted, setLoggedIn, setModalStep, setScreen);
    if (handled) {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
      }
    }
    return handled;
  };

  const handleLogout = async (setPublicView: (s: any) => void) => {
    try { await logoutUser(); } catch { /* ignore */ }
    // Complete state reset — prevents cross-contamination between sessions
    setLoggedIn(false);
    setRole(null);
    setPendingRole(null);
    setUserName("");
    setUserAvatar("");
    setUserVocation("");
    setUserId("");
    setQuizCompleted(false);
    setLoadedQuizAnswers({});
    setAuthError(null);
    setAuthMessage(null);
    setGoogleAuthUser(null);
    setScreen("home");
    setPublicView("landing");
    setModalStep("none");
  };

  return {
    role, pendingRole, loggedIn, authLoading, authError, appReady, authMessage, googleAuthUser, requirePasswordUpdate, userName, userAvatar, userVocation, userId, quizCompleted, loadedQuizAnswers,
    setQuizCompleted, setPendingRole, setRequirePasswordUpdate, handleCompleteGoogleRegistration, handleRegister, handleLogin, handleDemoQuickLogin, handleLogout
  };
}
