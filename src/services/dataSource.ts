/**
 * Hybrid Data Source — Strict Demo Interception Layer
 *
 * Architecture:
 *   - If the current user is a DEMO user (candidato@astris.org, organizacion@astris.org,
 *     mentor@astris.org), ALL data flows through demoData.ts — NO Supabase calls.
 *   - If the current user is a REAL user (registered via the platform), ALL data flows
 *     through Supabase.
 *
 * Detection:
 *   - Demo users have IDs starting with "demo-" (set at login time).
 *   - The function isDemoMode() reads the active user's ID from localStorage
 *     and returns true if it matches the demo pattern.
 *
 * CRITICAL: Demo data and real user data are STRICTLY ISOLATED. There is NO overlap.
 *   - getCurrentUser() checks demo flag FIRST, then localStorage local user, then Supabase.
 *   - localStorage keys for demo vs real are distinct: "astris_demo_user" vs "astris_local_user".
 *   - logoutUser() clears ALL localStorage keys to prevent cross-contamination.
 *
 * This file is the ONLY import point for pages. No page should import from
 * supabase.ts or demoData.ts directly (except for type re-exports).
 */

import {
  DEMO_USERS,
  VACANCIES_FALLBACK,
  MENTORS_FALLBACK,
  CANDIDATE_RADAR_FINAL,
  ORGANIZATION_CANDIDATES_DATA,
  MENTOR_PROCESSES,
  MENTOR_ORGANIZATIONS,
} from "./demoData";

import {
  DemoUser,
  CandidateDashboardStats,
} from "./supabase";

// Supabase-backed functions (real backend only)
import {
  loginUser as supabaseLoginUser,
  registerUser as supabaseRegisterUser,
  logoutUser as supabaseLogoutUser,
  getCurrentUser as supabaseGetCurrentUser,
  signInWithGoogle as supabaseSignInWithGoogle,
  resetPasswordForEmail as supabaseResetPasswordForEmail,
  updatePassword as supabaseUpdatePassword,
  uploadAvatar as supabaseUploadAvatar,
  updateProfile as supabaseUpdateProfile,
  deleteAccount as supabaseDeleteAccount,
  saveCandidateProfile as supabaseSaveCandidateProfile,
  getCandidateQuizAnswers as supabaseGetCandidateQuizAnswers,
  getCandidateDashboardStats as supabaseGetCandidateDashboardStats,
  getMatchesForCandidate as supabaseGetMatchesForCandidate,
  getMatchesForOrganization as supabaseGetMatchesForOrganization,
  getMentors as supabaseGetMentors,
  getOrganizationProfile as supabaseGetOrganizationProfile,
  saveOrganizationProfile as supabaseSaveOrganizationProfile,
  saveCheckin as supabaseSaveCheckin,
  getCheckins as supabaseGetCheckins,
} from "./supabase";

// ─── Demo Session Detection ───────────────────────────────────────────

const DEMO_IDS = ["demo-cand", "demo-comp", "demo-ment"];
const DEMO_EMAILS = [
  "candidato@astris.org",
  "organizacion@astris.org",
  "mentor@astris.org",
];

/** Returns true if the given user ID belongs to a demo profile */
export function isDemoUserId(userId: string): boolean {
  return DEMO_IDS.includes(userId);
}

/** Alias for backward compatibility */
export const isDemoUserUser = isDemoUserId;

/** Returns true if the given email is a known demo account */
export function isDemoEmail(email: string): boolean {
  return DEMO_EMAILS.includes(email.toLowerCase());
}

/**
 * Reads the current session from localStorage and determines if
 * the active user is a demo user.
 */
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const demoEmail = window.localStorage.getItem("astris_demo_user");
  if (demoEmail && DEMO_EMAILS.includes(demoEmail)) return true;
  return false;
}

/** Returns the current demo user ID if in demo mode, or null */
export function getDemoUserId(): string | null {
  if (typeof window === "undefined") return null;
  const demoEmail = window.localStorage.getItem("astris_demo_user");
  if (!demoEmail) return null;
  const user = DEMO_USERS[demoEmail];
  return user?.id ?? null;
}

/** Returns the current demo user email if in demo mode, or null */
export function getDemoUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("astris_demo_user");
}

// ─── Re-export types ──────────────────────────────────────────────────

export type { DemoUser, CandidateDashboardStats } from "./supabase";

// ─── Auth Functions (with demo interception) ──────────────────────────

/**
 * Login: if the email is a demo email, authenticate locally and return
 * demo user data. Otherwise, delegate to Supabase.
 */
export async function loginUser(email: string, password: string): Promise<{ user: { id: string; email: string } }> {
  if (isDemoEmail(email)) {
    const demoUser = DEMO_USERS[email];
    if (!demoUser || password !== demoUser.password) {
      throw new Error("Credenciales inválidas.");
    }
    window.localStorage.setItem("astris_demo_user", email);
    // Ensure no local user data leaks into demo session
    window.localStorage.removeItem("astris_local_user");
    return { user: { id: demoUser.id, email: demoUser.email } };
  }
  return supabaseLoginUser(email, password);
}

/**
 * Register: demo accounts cannot be created via registration — only the 3
 * hardcoded demo accounts exist. If the email matches a demo pattern, reject.
 * Otherwise, delegate to Supabase.
 */
export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: "candidate" | "organization" | "mentor",
  vocation = ""
): Promise<{ id: string; email: string }> {
  if (isDemoEmail(email)) {
    throw new Error("No puedes registrarte con un correo de demostración.");
  }
  return supabaseRegisterUser(email, password, name, role, vocation);
}

/**
 * Logout: clear ALL local session data to prevent cross-contamination.
 * No session state persists between users.
 */
export async function logoutUser(): Promise<void> {
  await supabaseLogoutUser();
  // --- COMPLETE STATE CLEANUP ---
  // Remove demo session
  window.localStorage.removeItem("astris_demo_user");
  // Remove local registered user
  window.localStorage.removeItem("astris_local_user");
  // Remove quiz/data artifacts
  window.localStorage.removeItem("astris_quiz_completed");
  window.localStorage.removeItem("astris_quiz_answers");
  window.localStorage.removeItem("astris_theme");
  window.localStorage.removeItem("astris_font");
  // Remove any checkin cache
  ["demo-cand", "demo-comp", "demo-ment"].forEach((id) => {
    window.localStorage.removeItem(`astris_checkins_${id}`);
  });
}

/**
 * getCurrentUser: STRICT isolation — three mutually exclusive paths:
 * 1. If "astris_demo_user" exists → return demo user (never returns real user data)
 * 2. If "astris_local_user" exists → return local registered user
 * 3. Otherwise → delegate to Supabase
 */
export async function getCurrentUser(): Promise<DemoUser | null> {
  // Path 1: Demo user (highest priority)
  if (isDemoMode()) {
    const demoEmail = getDemoUserEmail();
    if (demoEmail && DEMO_USERS[demoEmail]) {
      const u = DEMO_USERS[demoEmail];
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as "candidate" | "organization" | "mentor",
        avatarUrl: u.avatarUrl || "",
        vocation: u.vocation,
        completedOnboarding: u.completedOnboarding,
        profile: u.profile,
      };
    }
    // Demo flag set but no matching user → clean up
    window.localStorage.removeItem("astris_demo_user");
    return null;
  }

  // Path 2: Local registered user (non-demo, stored in localStorage)
  const localUserJson = typeof window !== "undefined"
    ? window.localStorage.getItem("astris_local_user")
    : null;
  if (localUserJson) {
    try {
      const u = JSON.parse(localUserJson);
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as "candidate" | "organization" | "mentor",
        avatarUrl: u.avatarUrl || "",
        vocation: u.vocation || "",
        completedOnboarding: !!u.completedOnboarding,
      };
    } catch {
      window.localStorage.removeItem("astris_local_user");
    }
  }

  // Path 3: Real Supabase backend user
  return supabaseGetCurrentUser();
}

export async function signInWithGoogle(role?: string, intent?: "login" | "register"): Promise<void> {
  return supabaseSignInWithGoogle(role, intent);
}

export async function resetPasswordForEmail(email: string): Promise<void> {
  return supabaseResetPasswordForEmail(email);
}

export async function updatePassword(newPassword: string): Promise<void> {
  return supabaseUpdatePassword(newPassword);
}

/**
 * Upload an avatar image for a real user (non-demo).
 * Returns the public URL of the uploaded file after
 * saving it to Supabase Storage and updating users_profiles.
 *
 * Demo users silently no-op (return empty string).
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (isDemoUserId(userId)) {
    return "";
  }
  return supabaseUploadAvatar(userId, file);
}

export async function updateProfile(userId: string, name: string, avatarUrl = "", vocation = ""): Promise<void> {
  if (isDemoUserId(userId)) {
    // Demo profiles cannot be modified
    return;
  }
  // Update local user if exists
  const localUserJson = window.localStorage.getItem("astris_local_user");
  if (localUserJson) {
    try {
      const u = JSON.parse(localUserJson);
      u.name = name;
      u.avatarUrl = avatarUrl;
      u.vocation = vocation;
      window.localStorage.setItem("astris_local_user", JSON.stringify(u));
    } catch { /* ignore */ }
  }
  return supabaseUpdateProfile(userId, name, avatarUrl, vocation);
}

export async function deleteAccount(): Promise<void> {
  const luid = window.localStorage.getItem("astris_local_user");
  if (luid) {
    await logoutUser();
    return;
  }
  // Only real backend users can delete accounts
  await supabaseDeleteAccount();
}

// ─── Candidate Functions ──────────────────────────────────────────────

export async function saveCandidateProfile(
  userId: string,
  quizAnswers: any,
  theme: string,
  font: string
): Promise<void> {
  if (isDemoUserId(userId) || userId.startsWith("user-")) {
    // Demo or local registered user: persist to localStorage
    try {
      window.localStorage.setItem("astris_quiz_answers", JSON.stringify(quizAnswers));
      window.localStorage.setItem("astris_theme", theme);
      window.localStorage.setItem("astris_font", font);
      window.localStorage.setItem("astris_quiz_completed", "true");
      // Update local user as completed onboarding
      const localUserJson = window.localStorage.getItem("astris_local_user");
      if (localUserJson) {
        const u = JSON.parse(localUserJson);
        u.completedOnboarding = true;
        window.localStorage.setItem("astris_local_user", JSON.stringify(u));
      }
    } catch { /* ignore */ }
    return;
  }
  return supabaseSaveCandidateProfile(userId, quizAnswers, theme, font);
}

export async function getCandidateQuizAnswers(userId: string): Promise<any | null> {
  if (isDemoUserId(userId)) {
    try {
      const stored = window.localStorage.getItem("astris_quiz_answers");
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return null;
  }
  return supabaseGetCandidateQuizAnswers(userId);
}

export async function getCandidateDashboardStats(userId: string): Promise<CandidateDashboardStats> {
  if (isDemoUserId(userId)) {
    return { vacancies: 3, matches: 12, accompanimentActive: true };
  }
  return supabaseGetCandidateDashboardStats(userId);
}

export async function getMatchesForCandidate(candidateId: string): Promise<any[]> {
  if (isDemoUserId(candidateId)) {
    return VACANCIES_FALLBACK.map((v, i) => ({
      jobId: v.id,
      matchPercentage: v.match - i * 4,
      title: v.title,
      company: v.organization,
      sector: v.sector,
      modality: v.modality,
      type: v.type,
      adjustments: v.adjustments,
      desc: v.desc,
      organizationDesc: v.organizationDesc,
    })).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }
  return supabaseGetMatchesForCandidate(candidateId);
}

// ─── Organization Functions ───────────────────────────────────────────

export async function getMatchesForOrganization(companyId: string): Promise<any[]> {
  if (isDemoUserId(companyId)) {
    return ORGANIZATION_CANDIDATES_DATA.map((c) => ({
      candidateId: c.id,
      matchPercentage: c.match,
      strengths: c.strengths,
      radar: c.radar,
      env: c.env,
    })).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }
  return supabaseGetMatchesForOrganization(companyId);
}

export async function getOrganizationProfile(userId: string): Promise<any | null> {
  if (isDemoUserId(userId)) {
    return DEMO_USERS["organizacion@astris.org"]?.profile || null;
  }
  return supabaseGetOrganizationProfile(userId);
}

export async function saveOrganizationProfile(userId: string, data: any): Promise<{ error: string | null }> {
  if (isDemoUserId(userId)) {
    return { error: null };
  }
  return supabaseSaveOrganizationProfile(userId, data);
}

// ─── Mentor Functions ─────────────────────────────────────────────────

export async function getMentors(): Promise<any[]> {
  if (isDemoMode()) {
    return MENTORS_FALLBACK;
  }
  return supabaseGetMentors();
}

// ─── Checkin Functions ────────────────────────────────────────────────

export async function saveCheckin(userId: string, role: string, note: string): Promise<void> {
  if (isDemoUserId(userId)) {
    try {
      const key = `astris_checkins_${userId}`;
      const existing = JSON.parse(window.localStorage.getItem(key) || "[]");
      existing.unshift({ date: new Date().toISOString(), note, role });
      window.localStorage.setItem(key, JSON.stringify(existing));
    } catch { /* ignore */ }
    return;
  }
  return supabaseSaveCheckin(userId, role, note);
}

export async function getCheckins(userId: string): Promise<any[]> {
  if (isDemoUserId(userId)) {
    try {
      const key = `astris_checkins_${userId}`;
      return JSON.parse(window.localStorage.getItem(key) || "[]");
    } catch { return []; }
  }
  return supabaseGetCheckins(userId);
}
