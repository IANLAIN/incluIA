import { useState } from "react";
import { Lang, Role } from "@/types";
import { useT } from "@/i18n/useT";
import { GoogleAuthStep } from "./register/GoogleAuthStep";
import { RoleSelectStep } from "./register/RoleSelectStep";
import { CandidateRegisterWizard } from "@/pages/register/CandidateRegisterWizard";
import { OrganizationRegisterWizard } from "@/pages/register/OrganizationRegisterWizard";
import { MentorRegisterWizard } from "@/pages/register/MentorRegisterWizard";

const ROLE_ICON_MAP = { candidate: "User", organization: "Building2", mentor: "Users" } as const;

export function RegisterModal({
  lang,
  role,
  onRegister,
  onBack,
  error,
  loading,
  googleAuthUser,
  onCompleteGoogle,
}: {
  lang: Lang;
  role: Role | null;
  onRegister: (email: string, password: string, name: string, selectedRole: Role, vocation: string) => void;
  onBack: () => void;
  error?: string | null;
  loading?: boolean;
  googleAuthUser?: { name: string; role: Role } | null;
  onCompleteGoogle?: () => void;
}) {
  const t = useT(lang);

  const [step, setStep] = useState<"select_role" | "wizard">(
    googleAuthUser ? "wizard" : role ? "wizard" : "select_role"
  );
  const [selectedRole, setSelectedRole] = useState<Role | null>(googleAuthUser?.role ?? role ?? null);

  const handleRoleSelect = (r: Role) => {
    setSelectedRole(r);
    setStep("wizard");
  };

  const handleWizardComplete = (data: any) => {
    if (!selectedRole) return;
    // Map wizard data to the generic register callback
    onRegister(
      data.email,
      data.password,
      data.name,
      selectedRole,
      data.sector || data.specialties?.join(", ") || data.workModality || ""
    );
  };

  // Google auth step (still uses credential step for Google)
  if (googleAuthUser && onCompleteGoogle && selectedRole) {
    return (
      <GoogleAuthStep
        selectedRole={selectedRole}
        Icon={() => null}
        t={t}
        onCompleteGoogle={onCompleteGoogle}
      />
    );
  }

  // Role selection step
  if (step === "select_role") {
    return (
      <RoleSelectStep
        onBack={onBack}
        handleRoleSelect={handleRoleSelect}
        t={t}
      />
    );
  }

  // Per-role wizard
  if (selectedRole === "candidate") {
    return (
      <CandidateRegisterWizard
        lang={lang}
        onComplete={handleWizardComplete}
        onBack={() => {
          if (role) onBack();
          else { setStep("select_role"); setSelectedRole(null); }
        }}
      />
    );
  }

  if (selectedRole === "organization") {
    return (
      <OrganizationRegisterWizard
        lang={lang}
        onComplete={handleWizardComplete}
        onBack={() => {
          if (role) onBack();
          else { setStep("select_role"); setSelectedRole(null); }
        }}
      />
    );
  }

  if (selectedRole === "mentor") {
    return (
      <MentorRegisterWizard
        lang={lang}
        onComplete={handleWizardComplete}
        onBack={() => {
          if (role) onBack();
          else { setStep("select_role"); setSelectedRole(null); }
        }}
      />
    );
  }

  return null;
}
