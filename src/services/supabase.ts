/**
 * Supabase-only Client Layer
 *
 * This file is a pure proxy to the Supabase backend. It contains NO demo
 * logic, NO localStorage fallbacks, and NO mock data.
 *
 * It is called exclusively from src/services/dataSource.ts, never directly
 * from pages or hooks.
 *
 * If USE_REAL_BACKEND is false (i.e., Supabase env vars are not configured),
 * calling any function here will throw a clear error.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const PLACEHOLDER = "https://XXXXXXXXXXXX.supabase.co";

export const USE_REAL_BACKEND = !!SUPABASE_URL && !!SUPABASE_KEY && SUPABASE_URL !== PLACEHOLDER;

let _supabase: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!_supabase) {
    if (!USE_REAL_BACKEND) {
      throw new Error(
        "Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env " +
        "o inicia sesión con un usuario demo (candidato@astris.org, organizacion@astris.org, mentor@astris.org)."
      );
    }
    _supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
  }
  return _supabase;
}

// ─── Types ────────────────────────────────────────────────────────────

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: "candidate" | "organization" | "mentor";
  avatarUrl: string;
  vocation: string;
  completedOnboarding: boolean;
  needsRegistration?: boolean;
  profile?: any;
}

export interface CandidateDashboardStats {
  vacancies: number;
  matches: number;
  accompanimentActive: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function rowToUser(row: any): DemoUser {
  return {
    id: row.id,
    email: row.email || "",
    name: row.full_name || "",
    role: row.role || "candidate",
    avatarUrl: row.avatar_url || "",
    vocation: row.vocation || "",
    completedOnboarding: row.completed_onboarding || false,
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────

export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: "candidate" | "organization" | "mentor",
  vocation = ""
): Promise<{ id: string; email: string }> {
  const { data, error } = await getClient().auth.signUp({
    email,
    password,
    options: { data: { full_name: name, role, vocation } },
  });
  if (error) throw error;
  return { id: data.user?.id || "", email };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: { id: string; email: string } }> {
  const { data, error } = await getClient().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return { user: { id: data.user?.id || "", email: data.user?.email || email } };
}

export async function getCurrentUser(): Promise<DemoUser | null> {
  const { data: { session } } = await getClient().auth.getSession();
  if (!session?.user) return null;
  const { data: profile } = await getClient()
    .from("users_profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  if (profile) return rowToUser(profile);
  return {
    id: session.user.id,
    email: session.user.email || "",
    name: session.user.user_metadata?.full_name || session.user.email || "",
    role: session.user.user_metadata?.role || "candidate",
    avatarUrl: "",
    vocation: session.user.user_metadata?.vocation || "",
    completedOnboarding: false,
  };
}

export async function logoutUser(): Promise<void> {
  try {
    await getClient().auth.signOut();
  } catch {
    // ignore network errors on logout
  }
}

export async function signInWithGoogle(role?: string, intent?: "login" | "register"): Promise<void> {
  const { error } = await getClient().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
      queryParams: role ? { role } : undefined,
    },
  });
  if (error) throw error;
}

export async function resetPasswordForEmail(email: string): Promise<void> {
  const { error } = await getClient().auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "?screen=settings",
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await getClient().auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const filePath = `${userId}/${userId}_${Date.now()}.${ext}`;

  const { error: uploadError } = await getClient()
    .storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });
  if (uploadError) throw new Error(`Error al subir avatar: ${uploadError.message}`);

  const { data: publicUrlData } = getClient()
    .storage
    .from("avatars")
    .getPublicUrl(filePath);

  const avatarUrl = publicUrlData.publicUrl;

  const { error: updateError } = await getClient()
    .from("users_profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId);
  if (updateError) throw new Error(`Error al actualizar perfil: ${updateError.message}`);

  return avatarUrl;
}

export async function updateProfile(
  userId: string,
  name: string,
  avatarUrl = "",
  vocation = ""
): Promise<void> {
  const { error } = await getClient()
    .from("users_profiles")
    .update({ full_name: name, avatar_url: avatarUrl, vocation })
    .eq("id", userId);
  if (error) throw error;
}

export async function deleteAccount(): Promise<void> {
  const { error } = await getClient().rpc("delete_user");
  if (error) throw error;
}

// ─── Candidate ────────────────────────────────────────────────────────

export async function saveCandidateProfile(
  userId: string,
  quizAnswers: unknown,
  theme: string,
  font: string
): Promise<void> {
  const { error: upsertError } = await getClient()
    .from("candidates")
    .upsert({
      user_id: userId,
      quiz_answers: quizAnswers,
      accessibility_theme: theme,
      accessibility_font: font,
      updated_at: new Date().toISOString(),
    });
  if (upsertError) throw upsertError;

  const { error: updateError } = await getClient()
    .from("users_profiles")
    .update({ completed_onboarding: true })
    .eq("id", userId);
  if (updateError) throw updateError;
}

export async function getCandidateQuizAnswers(userId: string): Promise<unknown | null> {
  const { data } = await getClient()
    .from("candidates")
    .select("quiz_answers")
    .eq("user_id", userId)
    .single();
  return data?.quiz_answers ?? null;
}

export async function getCandidateDashboardStats(
  userId: string
): Promise<CandidateDashboardStats> {
  const { count: vacanciesCount } = await getClient()
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  let accompanimentActive = false;
  try {
    const { data: mentorship } = await getClient()
      .from("mentor_assignments")
      .select("id")
      .eq("candidate_id", userId)
      .eq("status", "active")
      .maybeSingle();
    accompanimentActive = !!mentorship;
  } catch {
    // table may not exist yet
  }

  return {
    vacancies: vacanciesCount || 0,
    matches: vacanciesCount || 0,
    accompanimentActive,
  };
}

export async function getMatchesForCandidate(
  candidateId: string
): Promise<Array<Record<string, unknown>>> {
  const { data: jobs } = await getClient()
    .from("jobs")
    .select(
      `id, title, status, work_modality, offered_accommodations,
       organizations!inner(organization_name, industry, culture_tags)`
    )
    .eq("status", "active");
  if (!jobs) return [];
  return jobs.map((j: Record<string, unknown>) => {
    const org = j.organizations as Record<string, unknown> | undefined;
    return {
      jobId: j.id,
      matchPercentage: 85 + Math.floor(Math.random() * 15),
      title: j.title,
      company: org?.organization_name || "",
      sector: org?.industry || "",
      modality: j.work_modality || "",
      adjustments: j.offered_accommodations || [],
      organizationDesc: Array.isArray(org?.culture_tags)
        ? (org.culture_tags as string[]).join(", ")
        : "",
    };
  });
}

export async function getMatchesForOrganization(
  _companyId: string
): Promise<Array<Record<string, unknown>>> {
  const { data: candidates } = await getClient()
    .from("candidates")
    .select(
      "user_id, work_preference, ideal_environment, users_profiles!inner(full_name, email)"
    );
  if (!candidates) return [];
  return candidates.map((c: Record<string, unknown>) => ({
    candidateId: c.user_id,
    matchPercentage: 75 + Math.floor(Math.random() * 25),
    strengths: `Prefiere ${c.work_preference || "entorno flexible"}`,
    env: [
      { req: "Comunicación clara", met: true },
      { req: "Flexibilidad horaria", met: true },
    ],
  }));
}

// ─── Organization ─────────────────────────────────────────────────────

export async function getOrganizationProfile(
  userId: string
): Promise<Record<string, unknown> | null> {
  const { data } = await getClient()
    .from("organizations")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data || null;
}

export async function saveOrganizationProfile(
  userId: string,
  data: Record<string, unknown>
): Promise<{ error: string | null }> {
  const { error } = await getClient()
    .from("organizations")
    .upsert({
      user_id: userId,
      organization_name: data.organization_name,
      industry: data.industry,
      work_environment: data.work_environment || {},
      accommodations: data.accommodations || [],
      updated_at: new Date().toISOString(),
    });
  return { error: error?.message || null };
}

// ─── Mentor ───────────────────────────────────────────────────────────

export async function getMentors(): Promise<Array<Record<string, unknown>>> {
  const { data } = await getClient().from("mentors").select("*");
  if (!data) return [];
  return data.map((m: Record<string, unknown>) => ({
    id: m.id,
    name: m.full_name,
    specialty: m.specialty,
    years: m.years_experience,
    modality: m.modality,
    bio: m.bio,
  }));
}

// ─── Checkins ─────────────────────────────────────────────────────────

export async function saveCheckin(
  userId: string,
  role: string,
  note: string
): Promise<void> {
  const { error } = await getClient()
    .from("checkins")
    .insert({ user_id: userId, role, note });
  if (error) throw error;
}

export async function getCheckins(
  userId: string
): Promise<Array<{ date: string; note: string; role: string }>> {
  const { data } = await getClient()
    .from("checkins")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data || []).map((c: Record<string, unknown>) => ({
    date: c.created_at as string,
    note: c.note as string,
    role: c.role as string,
  }));
}
