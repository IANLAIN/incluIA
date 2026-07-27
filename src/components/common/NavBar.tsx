import { useState } from "react";
import {
  BarChart2, Briefcase, Users, Activity, Building2, FileText, Calendar, Sun, Moon, Globe, LogOut, Settings, User, X, Type
} from "lucide-react";
import { Lang, Role, FontKey } from "@/types";
import { useT } from "@/i18n/useT";
import astrisImg from "@/assets/astris.svg";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

export function NavBar({ lang, role, screen, onNav, onLang, onLogout, darkMode, onDarkToggle, font, onFontToggle, userName, userAvatar }: {
  lang: Lang; role: Role; screen: string;
  onNav: (s: string) => void; onLang: () => void; onLogout: () => void;
  darkMode: boolean; onDarkToggle: () => void;
  font: FontKey; onFontToggle: () => void;
  userName?: string; userAvatar?: string;
}) {
  const t = useT(lang);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const CANDIDATE_NAV = [
    { id: "profile", label: t("nav.profile"), Icon: BarChart2 },
    { id: "vacancies", label: t("nav.vacancies"), Icon: Briefcase },
    { id: "mentor-select", label: t("nav.mentor"), Icon: Users },
    { id: "post-hire", label: t("nav.tracking"), Icon: Activity },
  ];
  const ORGANIZATION_NAV = [
    { id: "org-profile", label: t("nav.org"), Icon: Building2 },
    { id: "post-vacancy", label: t("nav.post"), Icon: FileText },
    { id: "candidates", label: t("nav.candidates"), Icon: Users },
    { id: "post-hire", label: t("nav.tracking"), Icon: Activity },
  ];
  const MENTOR_NAV = [
    { id: "dashboard", label: t("nav.dashboard"), Icon: BarChart2 },
    { id: "checkins", label: t("nav.checkins"), Icon: Calendar },
    { id: "organizations", label: t("nav.companies"), Icon: Building2 },
  ];
  const navItems = role === "candidate" ? CANDIDATE_NAV : role === "organization" ? ORGANIZATION_NAV : MENTOR_NAV;
  const ROLE_LABELS: Record<Role, string> = { candidate: t("role.candidate"), organization: t("role.company"), mentor: t("role.mentor") };

  const darkLabel = darkMode
    ? (t("settings.light"))
    : (t("settings.dark"));

  return (
    <header className="sticky top-0 z-40 border-b border-border" style={{ backgroundColor: "var(--background)" }}>
      {/* Enlace oculto de salto para usuarios de teclado */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:font-bold"
      >
        Saltar al contenido principal
      </a>
      <div className="px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => onNav("home")} className="flex items-center gap-2 text-xl font-bold text-foreground tracking-tight cursor-pointer bg-transparent border-0 p-0">
            <img src={astrisImg} alt="Astris Logo" className="w-12 h-12 object-contain" />
            <span>Astris</span>
          </button>

          <nav className="hidden lg:flex items-center gap-2" aria-label="Navegación principal">
            {navItems.map((item) => {
              const active = screen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNav(item.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-0"
                  style={{ backgroundColor: active ? "var(--secondary)" : "transparent", color: active ? "var(--foreground)" : "var(--muted-foreground)" }}
                  aria-current={active ? "page" : undefined}
                >
                  <item.Icon size={14} aria-hidden="true" />{item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Dyslexia font toggle */}
          <button
            onClick={onFontToggle}
            className="flex items-center justify-center p-2 lg:px-3 lg:py-2 rounded-xl text-sm font-semibold cursor-pointer border-2 transition-colors"
            style={{
              borderColor: font !== "inter" ? "var(--primary)" : "var(--border)",
              backgroundColor: font !== "inter" ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "var(--card)",
              color: font !== "inter" ? "var(--primary)" : "var(--muted-foreground)",
            }}
            aria-label={font === "opendyslexic" ? "OpenDyslexic activado" : "Tipografía normal"}
            title={font === "opendyslexic" ? "OpenDyslexic activado" : "Tipografía normal"}
          >
            <Type size={16} aria-hidden="true" />
            <span className="hidden md:inline ml-1.5 text-xs">
              {font === "opendyslexic" ? "Dislexia" : "Aa"}
            </span>
          </button>
          {/* Dark / Light mode toggle */}
          <button
            onClick={onDarkToggle}
            className="flex items-center justify-center p-2 lg:px-3 lg:py-2 rounded-xl text-sm font-semibold cursor-pointer border-2"
            style={{
              borderColor: darkMode ? "rgba(245,196,66,0.55)" : "var(--border)",
              backgroundColor: darkMode ? "rgba(245,196,66,0.12)" : "var(--card)",
              color: darkMode ? "#F5C442" : "var(--muted-foreground)",
            }}
            aria-label={darkLabel}
            title={darkLabel}
          >
            {darkMode
              ? <Sun size={16} aria-hidden="true" />
              : <Moon size={16} aria-hidden="true" />
            }
            <span className="hidden lg:inline ml-2">{darkLabel}</span>
          </button>

          {/* Language */}
          <button
            onClick={onLang}
            className="flex items-center justify-center gap-1.5 p-2 lg:px-3 lg:py-2 rounded-xl text-sm text-muted-foreground cursor-pointer border border-border"
            style={{ backgroundColor: "var(--background)" }}
            aria-label={`Idioma: ${lang.toUpperCase()}. Cambiar idioma`}
          >
            <Globe size={16} aria-hidden="true" /><span className="hidden lg:inline">{lang.toUpperCase()}</span>
          </button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center gap-2 p-2 lg:px-3 lg:py-1.5 rounded-xl border border-border cursor-pointer transition-colors hover:bg-secondary" style={{ backgroundColor: "var(--card)" }}>
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <User size={16} aria-hidden="true" style={{ color: "var(--primary)" }} />
                )}
                <span className="text-xs font-semibold text-foreground hidden sm:inline max-w-[120px] truncate" title={userName || ROLE_LABELS[role]}>
                  {userName || ROLE_LABELS[role]}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}>
              <DropdownMenuLabel>{t("nav.account")}</DropdownMenuLabel>
              <DropdownMenuSeparator style={{ backgroundColor: "var(--border)" }} />
              
              <DropdownMenuItem className="cursor-pointer" onClick={() => onNav("settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t("nav.settings")}</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator style={{ backgroundColor: "var(--border)" }} />
              <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("nav.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="flex lg:hidden items-center justify-center p-2 rounded-xl border border-border bg-transparent text-foreground cursor-pointer"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileMenuOpen ? <X size={20} /> : (
              <div className="space-y-1.5">
                <div className="w-5 h-0.5 bg-foreground rounded-full"></div>
                <div className="w-5 h-0.5 bg-foreground rounded-full"></div>
                <div className="w-5 h-0.5 bg-foreground rounded-full"></div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="lg:hidden border-t border-border px-4 py-4 space-y-2 shadow-lg"
          style={{ backgroundColor: "var(--background)" }}
          role="navigation"
          aria-label="Menú móvil"
        >
          {navItems.map((item) => {
            const active = screen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNav(item.id); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold cursor-pointer border-0"
                style={{ backgroundColor: active ? "var(--secondary)" : "transparent", color: active ? "var(--foreground)" : "var(--muted-foreground)" }}
              >
                <item.Icon size={18} aria-hidden="true" />{item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
