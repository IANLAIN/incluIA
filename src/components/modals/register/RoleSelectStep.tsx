import { ChevronLeft, ArrowRight, User, Building2, Users } from "lucide-react";
import { Role } from "@/types";

const ROLE_ROUTES: { role: Role; icon: typeof User; tKey: string; tSubKey: string }[] = [
  { role: "candidate", icon: User, tKey: "role.candidate", tSubKey: "role.candidate.sub" },
  { role: "organization", icon: Building2, tKey: "role.company", tSubKey: "role.company.sub" },
  { role: "mentor", icon: Users, tKey: "role.mentor", tSubKey: "role.mentor.sub" },
];

export function RoleSelectStep({
  onBack,
  handleRoleSelect,
  t,
}: {
  onBack: () => void;
  handleRoleSelect: (r: Role) => void;
  t: (k: string) => string;
}) {
  return (
    <div className="w-[95%] sm:w-full max-w-lg rounded-2xl mx-auto bg-card border border-border anim-modal">
      <div className="px-4 md:px-8 py-7 border-b border-border relative">
        <button
          onClick={onBack}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground bg-transparent border-0 cursor-pointer"
          aria-label={t("register.back")}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <h2 className="text-xl font-bold text-foreground text-center px-12 md:px-16">
          {t("register.roleQuestion")}
        </h2>
      </div>

      <div className="p-4 md:p-8 flex flex-col gap-4">
        {ROLE_ROUTES.map(({ role: r, icon: RoleIcon, tKey, tSubKey }) => (
          <button
            key={r}
            onClick={() => handleRoleSelect(r)}
            className="flex items-center gap-5 p-5 rounded-2xl border-2 border-border bg-background cursor-pointer text-left hover:border-primary group"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
              <RoleIcon size={24} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground">{t(tKey)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(tSubKey)}</p>
            </div>
            <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary shrink-0" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
