import { useState } from "react";
import { ChevronDown, Check, Building2, BookOpen, HeartHandshake, ShieldCheck, Save, MapPin } from "lucide-react";
import { Lang } from "@/types";
import { useT, C } from "@/i18n/useT";
import { DEMO_USERS } from "@/services/demoData";

const SECTION_ICONS: Record<string, any> = {
  general: Building2,
  cultura: BookOpen,
  prestaciones: HeartHandshake,
  politicas: ShieldCheck,
};


export function OrganizationOrgProfile({ lang }: { lang: Lang }) {
  const t = useT(lang);
  const [open, setOpen] = useState<Record<string, boolean>>({ general: true });
  const toggle = (k: string) => setOpen((p) => ({ ...p, [k]: !p[k] }));
  
  // Filter out the "entorno" section — physical environment belongs to vacancy, not organization
  const sectionTitles = (C(lang, "orgSections") as string[]).filter((_, i) => {
    const ids = C(lang, "orgSectionIds") as string[];
    return ids[i] !== "entorno";
  });
  const sectionIds = (C(lang, "orgSectionIds") as string[]).filter((id) => id !== "entorno");
  const SECTIONS = sectionTitles.map((title, i) => ({ 
    id: sectionIds[i], 
    title,
    Icon: SECTION_ICONS[sectionIds[i]] || Building2
  }));
  
  const PRESTACIONES: string[] = ["Audífonos con cancelación de ruido", "Teclados especializados", "Pantallas anti-reflejo", "Rampas y ascensores", "Salas de descanso sensorial", "Modalidad remota e híbrida disponible"];
  const POLITICAS: string[] = ["Pausas activas programadas", "Flexibilidad de horario"];

  // Load Vibra Latina demo data
  const demoProfile: any = DEMO_USERS["organizacion@astris.org"]?.profile;
  const [formData, setFormData] = useState<Record<string, any>>({
    organization_name: demoProfile?.organization_name || "Vibra Latina",
    industry: demoProfile?.industry || "Audiovisual / Producción",
    organization_size: demoProfile?.organization_size || "10-50 empleados",
    country: demoProfile?.country || "Estados Unidos",
    city: demoProfile?.city || "Austin, TX",
    philosophy: demoProfile?.philosophy || "",
    accommodations: demoProfile?.accommodations || PRESTACIONES.slice(0, 3),
    policies: demoProfile?.policies || POLITICAS,
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (field: string, val: string) => setFormData(p => ({ ...p, [field]: val }));

  const toggleArray = (field: "accommodations" | "policies", item: string) => {
    setFormData(p => ({
      ...p,
      [field]: p[field].includes(item) ? p[field].filter((x: string) => x !== item) : [...p[field], item]
    }));
  };

  const handleSave = () => {
    setSaving(true);
    setMessage("");
    setTimeout(() => {
      setSaving(false);
      setMessage(t("comp.org.saveSuccess"));
      setTimeout(() => setMessage(""), 3000);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col pb-20 bg-background">
      {/* Premium Header / Banner */}
      <div className="w-full h-48 md:h-64 relative bg-primary/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)", backgroundSize: "24px 24px", opacity: 0.5 }} />
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-24 relative z-10 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-card border-4 border-background shadow-xl flex items-center justify-center shrink-0 overflow-hidden">
            <Building2 size={60} className="text-primary/50" />
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {formData.organization_name}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5"><Building2 size={16} /> {formData.industry}</span>
              <span className="flex items-center gap-1.5"><MapPin size={16} /> {formData.city}, {formData.country}</span>
            </div>
          </div>
          <div className="pb-2 w-full md:w-auto">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Guardando...</span>
              ) : (
                <><Save size={20} /> {t("save")}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        <div className="mb-2">
          <h2 className="text-xl font-bold text-foreground">{t("comp.org.title")}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{t("comp.org.sub")}</p>
        </div>

        {SECTIONS.map((s) => (
          <div key={s.id} className="rounded-3xl border border-border overflow-hidden bg-card shadow-sm transition-all duration-300">
            <button 
              onClick={() => toggle(s.id)} 
              className="w-full flex items-center justify-between px-6 py-5 md:px-8 md:py-6 text-left cursor-pointer hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${open[s.id] ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  <s.Icon size={20} />
                </div>
                <span className="font-bold text-lg text-foreground">{s.title}</span>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${open[s.id] ? "bg-primary/10 text-primary rotate-180" : "bg-transparent text-muted-foreground"}`}>
                <ChevronDown size={20} />
              </div>
            </button>
            
            <div 
              className="transition-all duration-300 ease-in-out"
              style={{ maxHeight: open[s.id] ? "2000px" : "0", opacity: open[s.id] ? 1 : 0, overflow: "hidden" }}
            >
              <div className="px-6 pb-6 pt-2 md:px-8 md:pb-8">
                <div className="w-full h-[1px] bg-border mb-6" />
                
                {s.id === "general" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: "Nombre de la organización", field: "organization_name" },
                      { label: "Sector de actividad", field: "industry" },
                      { label: "Tamaño de la organización", field: "organization_size" },
                      { label: "País", field: "country" },
                      { label: "Ciudad", field: "city" }
                    ].map((f) => (
                      <div key={f.field}>
                        <label htmlFor={`org-${f.field}`} className="block text-sm font-bold text-foreground mb-2 ml-1">{f.label}</label>
                        <input
                          id={`org-${f.field}`}
                          name={f.field}
                          type="text"
                          value={(formData as any)[f.field]}
                          onChange={(e) => handleChange(f.field, e.target.value)}
                          className="w-full px-5 py-3.5 rounded-2xl border-2 border-border bg-background text-foreground text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                          placeholder={f.label}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {s.id === "cultura" && (
                  <div>
                    <label htmlFor="org-philosophy" className="block text-sm font-bold text-foreground mb-2 ml-1">Cultura de la organización</label>
                    <textarea
                      id="org-philosophy"
                      name="philosophy"
                      value={formData.philosophy}
                      onChange={(e) => handleChange("philosophy", e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-background text-foreground text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all min-h-[140px] resize-y"
                      placeholder="Describe la filosofía y cultura de tu organización..."
                    />
                  </div>
                )}
                
                {s.id === "prestaciones" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PRESTACIONES.map((p) => {
                      const offered = formData.accommodations.includes(p);
                      return (
                        <button 
                          key={p} 
                          onClick={() => toggleArray("accommodations", p)} 
                          className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer text-left transition-all ${offered ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"}`}
                        >
                          <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${offered ? "border-primary bg-primary" : "border-muted-foreground bg-transparent"}`} aria-hidden="true">
                            {offered && <Check size={14} className="text-primary-foreground" />}
                          </div>
                          <span className={`text-sm font-semibold ${offered ? "text-foreground" : "text-muted-foreground"}`}>{p}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                
                {s.id === "politicas" && (
                  <div className="flex flex-col gap-4">
                    {POLITICAS.map((pol) => {
                      const active = formData.policies.includes(pol);
                      return (
                        <div 
                          key={pol} 
                          className="flex items-center justify-between p-5 rounded-2xl border-2 border-border bg-background cursor-pointer hover:border-primary/40 transition-colors" 
                          onClick={() => toggleArray("policies", pol)}
                        >
                          <span className="text-base font-bold text-foreground">{pol}</span>
                          <div className={`w-14 h-7 rounded-full relative transition-colors ${active ? "bg-primary" : "bg-muted"}`} aria-hidden="true">
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${active ? "left-[calc(100%-24px)]" : "left-1"}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-end gap-4 mt-6">
          {message && (
            <div className="px-4 py-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-sm flex items-center gap-2">
              <Check size={16} /> {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
