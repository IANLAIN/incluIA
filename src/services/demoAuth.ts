/**
 * Demo Auth Compatibility Layer
 *
 * Thin wrapper over dataSource.ts for backward compatibility.
 * Deprecated — new code should import directly from @/services/dataSource.
 */

import { Role } from "@/types";
import {
  loginUser as dsLoginUser,
  registerUser as dsRegisterUser,
  isDemoEmail,
} from "./dataSource";

/**
 * Handles demo user registration for LOCAL non-demo users.
 * Demo accounts themselves cannot be registered.
 */
export function handleDemoRegister(
  email: string,
  password: string,
  name: string,
  selectedRole: Role,
  vocation: string,
  setRole: (r: Role) => void,
  setUserName: (n: string) => void,
  setUserVocation: (v: string) => void,
  setLoggedIn: (v: boolean) => void,
  setModalStep: (s: string) => void,
  setQuizCompleted: (v: boolean) => void,
  setScreen: (s: string) => void
): boolean {
  // Reject demo emails for registration
  if (isDemoEmail(email)) return false;

  const userId = `user-${Date.now()}`;
  const localUser = {
    id: userId,
    email,
    name,
    role: selectedRole,
    password,
    avatarUrl: "",
    vocation,
    completedOnboarding: false,
  };
  window.localStorage.setItem("astris_local_user", JSON.stringify(localUser));
  window.localStorage.removeItem("astris_demo_user");
  window.localStorage.removeItem("astris_quiz_completed");

  setRole(selectedRole);
  setUserName(name);
  setUserVocation(vocation);
  setLoggedIn(true);
  setModalStep("none");
  setQuizCompleted(false);

  if (selectedRole === "candidate") {
    setScreen("onboarding");
  } else if (selectedRole === "organization") {
    setScreen("org-onboarding");
  } else {
    setScreen("dashboard");
  }

  return true;
}

/**
 * Handles demo user login for the 3 hardcoded demo accounts.
 * Delegates the actual auth to dataSource.ts loginUser which
 * intercepts demo emails.
 */
export function handleDemoLogin(
  email: string,
  password: string,
  setRole: (r: Role) => void,
  setUserName: (n: string) => void,
  setUserVocation: (v: string) => void,
  setQuizCompleted: (v: boolean) => void,
  setLoggedIn: (v: boolean) => void,
  setModalStep: (s: string) => void,
  setScreen: (s: string) => void
): boolean {
  // Only handle demo emails
  if (!isDemoEmail(email)) return false;
  if (password !== "Demo2026") return false;

  // Map demo email to profile data for the callback setters
  const profiles: Record<string, { role: Role; name: string; vocation: string; screen: string; quizDone: boolean }> = {
    "candidato@astris.org": {
      role: "candidate",
      name: "Bryan Gonzalez",
      vocation: "Ingeniero de Sistemas y Computación",
      screen: "profile",
      quizDone: true,
    },
    "organizacion@astris.org": {
      role: "organization",
      name: "Vibra Latina",
      vocation: "",
      screen: "candidates",
      quizDone: false,
    },
    "mentor@astris.org": {
      role: "mentor",
      name: "Elena Vargas",
      vocation: "Especialista en Inclusión Laboral y Coaching Neurodivergente",
      screen: "dashboard",
      quizDone: false,
    },
  };

  const profile = profiles[email];
  if (!profile) return false;

  // Persist session
  window.localStorage.setItem("astris_demo_user", email);
  window.localStorage.removeItem("astris_local_user");

  if (profile.quizDone) {
    window.localStorage.setItem("astris_quiz_completed", "true");
  }

  setRole(profile.role);
  setUserName(profile.name);
  setUserVocation(profile.vocation);
  setQuizCompleted(profile.quizDone);
  setLoggedIn(true);
  setModalStep("none");
  setScreen(profile.screen);

  return true;
}
