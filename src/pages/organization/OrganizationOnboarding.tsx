import { useState, useRef, useCallback, useMemo } from "react";
import { Building2, Upload, X, MapPin, Globe, Check, Sparkles, ArrowLeft, RotateCcw, ChevronDown } from "lucide-react";
import { Lang } from "@/types";
import { useT, C } from "@/i18n/useT";
import { SplitScreenLayout } from "@/components/common/SplitScreenLayout";
import { SelectableCard } from "@/components/common/SelectableCard";
import { SelectableChip } from "@/components/common/SelectableChip";
import { CustomSlider } from "@/components/common/CustomSlider";
import { RadarViz } from "@/components/common/RadarViz";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ──
export type OrgOnboardingData = {
  logo: string | null;
  name: string;
  sector: string;
  subSector: string;
  size: string;
  workModel: string;
  nature: string;
  country: string;
  city: string;
  cultureValues: string[];
};

export type AxisValues = {
  axis1: number; // Procesamiento — async(0) ↔ sync(100)
  axis2: number; // Ejecución — strict(0) ↔ autonomy(100)
  axis3: number; // Entorno — quiet(0) ↔ dynamic(100)
  axis4: number; // Flexibilidad — standardized(0) ↔ personalized(100)
};

export type WizardStep = "welcome" | 1 | 2 | 3 | 4 | 5;

const TOTAL_STEPS = 5;

const SIZE_OPTIONS = [
  { key: "1_20", tKey: "orgOnboarding.size_1_20", display: "[ 1 — 20 ]" },
  { key: "21_100", tKey: "orgOnboarding.size_21_100", display: "[ 21 — 100 ]" },
  { key: "101_500", tKey: "orgOnboarding.size_101_500", display: "[ 101 — 500 ]" },
  { key: "500plus", tKey: "orgOnboarding.size_500plus", display: "[ 500+ ]" },
];

const WORK_MODELS = [
  { key: "remote_first", tKey: "orgOnboarding.workModel.remote", tSub: "orgOnboarding.workModel.remoteSub" },
  { key: "hybrid_flexible", tKey: "orgOnboarding.workModel.hybrid", tSub: "orgOnboarding.workModel.hybridSub" },
  { key: "in_person", tKey: "orgOnboarding.workModel.inPerson", tSub: "orgOnboarding.workModel.inPersonSub" },
];

const NATURE_OPTIONS = [
  { key: "private", tKey: "orgOnboarding.nature.private", subSectors: ["Tecnología / Software", "Finanzas / Seguros", "Manufactura / Industria", "Comercio / Retail", "Medios / Comunicación", "Energía / Sostenibilidad"] },
  { key: "public", tKey: "orgOnboarding.nature.public", subSectors: ["Gobierno / Sector público", "Salud / Biotecnología", "Educación / Formación"] },
  { key: "academia", tKey: "orgOnboarding.nature.academia", subSectors: ["Universidades / Institutos", "Centros de investigación", "Laboratorios"] },
  { key: "third_sector", tKey: "orgOnboarding.nature.thirdSector", subSectors: ["ONG / Sin fines de lucro", "Fundaciones", "Cooperativas"] },
];

const ADJUSTMENT_ITEMS = [
  "orgOnboarding.adjustment_flexible_hours",
  "orgOnboarding.adjustment_cameras_off",
  "orgOnboarding.adjustment_silence_zones",
  "orgOnboarding.adjustment_software_licenses",
  "orgOnboarding.adjustment_written_comm",
  "orgOnboarding.adjustment_no_meeting_days",
] as const;

const CULTURE_VALUES = [
  "register.org.culture.innovacion",
  "register.org.culture.tradicion",
  "register.org.culture.colaborativo",
  "register.org.culture.autonomo",
  "register.org.culture.inclusivo",
  "register.org.culture.resultados",
] as const;

const AXIS_CONFIG = [
  { key: "axis1", tLabel: "orgOnboarding.axis1Label", tQ: "orgOnboarding.axis1Question", tHint: "orgOnboarding.axis1Hint", tLeft: "orgOnboarding.axis1Left", tRight: "orgOnboarding.axis1Right" },
  { key: "axis2", tLabel: "orgOnboarding.axis2Label", tQ: "orgOnboarding.axis2Question", tHint: "orgOnboarding.axis2Hint", tLeft: "orgOnboarding.axis2Left", tRight: "orgOnboarding.axis2Right" },
  { key: "axis3", tLabel: "orgOnboarding.axis3Label", tQ: "orgOnboarding.axis3Question", tHint: "orgOnboarding.axis3Hint", tLeft: "orgOnboarding.axis3Left", tRight: "orgOnboarding.axis3Right" },
  { key: "axis4", tLabel: "orgOnboarding.axis4Label", tQ: "orgOnboarding.axis4Question", tHint: "orgOnboarding.axis4Hint", tLeft: "orgOnboarding.axis4Left", tRight: "orgOnboarding.axis4Right" },
] as const;

const RADAR_AXIS_KEYS = ["about.radarAxes.processing", "about.radarAxes.execution", "about.radarAxes.environment", "about.radarAxes.adjustments"];

export function OrganizationOnboarding({
  lang,
  onComplete,
}: {
  lang: Lang;
  onComplete?: (data: OrgOnboardingData & { axes: AxisValues; adjustments: string[] }) => void;
}) {
  const t = useT(lang);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<WizardStep>("welcome");

  const [form, setForm] = useState<OrgOnboardingData>({
    logo: null, name: "", sector: "", subSector: "", size: "", workModel: "", nature: "",
    country: "", city: "", cultureValues: [],
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [axes, setAxes] = useState<AxisValues>({ axis1: 50, axis2: 50, axis3: 50, axis4: 50 });
  const [adjustments, setAdjustments] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);
  const [expandedNature, setExpandedNature] = useState<string | null>(null);

  const sectors = C(lang, "orgOnboarding.sectors") as string[];

  const radarData = useMemo(() => {
    const shortAxes = RADAR_AXIS_KEYS.map((k) => t(k));
    return [
      { axis: shortAxes[0], value: axes.axis1 },
      { axis: shortAxes[1], value: axes.axis2 },
      { axis: shortAxes[2], value: axes.axis3 },
      { axis: shortAxes[3], value: axes.axis4 },
    ];
  }, [axes, lang, t]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoPreview(dataUrl);
      setForm((prev) => ({ ...prev, logo: dataUrl }));
    };
    reader.readAsDataURL(file);
  }, []);

  const clearLogo = useCallback(() => {
    setLogoPreview(null);
    setForm((prev) => ({ ...prev, logo: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const setField = useCallback(<K extends keyof OrgOnboardingData>(key: K, val: OrgOnboardingData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const setAxis = useCallback((key: keyof AxisValues, val: number) => {
    setAxes((prev) => ({ ...prev, [key]: val }));
  }, []);

  const toggleAdjustment = useCallback((adjKey: string) => {
    setAdjustments((prev) => prev.includes(adjKey) ? prev.filter((a) => a !== adjKey) : [...prev, adjKey]);
  }, []);

  const toggleCulture = useCallback((key: string) => {
    setForm((prev) => ({
      ...prev,
      cultureValues: prev.cultureValues.includes(key)
        ? prev.cultureValues.filter((a) => a !== key)
        : [...prev.cultureValues, key],
    }));
  }, []);

  const canProceedStep1 = form.name.trim() && form.nature && form.size && form.country.trim() && form.city.trim();
  const canProceedStep3 = adjustments.length > 0;
  const canProceedStep4 = !!form.workModel;

  const stepLabel = (s: number) => `${t("orgOnboarding.step")} ${s} ${t("orgOnboarding.of")} ${TOTAL_STEPS}`;

  const summaryText = useMemo(() => {
    const axis2val = axes.axis2 <= 33 ? "estructurado" : axes.axis2 <= 66 ? "balanceado" : "autónomo";
    const axis1val = axes.axis1 <= 33 ? "asíncrono" : axes.axis1 <= 66 ? "mixto" : "síncrono";
    return t("orgOnboarding.step4Summary", { axis2: axis2val, axis1: axis1val });
  }, [axes, t]);

  const progressBar = (currentStep: number) => (
    <div className="flex items-center gap-3 mb-8">
      <div className="flex gap-1.5 flex-1">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className="h-2 rounded-full transition-all duration-500"
            style={{ width: i === currentStep - 1 ? "48px" : "24px", backgroundColor: i <= currentStep - 1 ? "var(--primary)" : "var(--muted)", opacity: i <= currentStep - 1 ? 1 : 0.4 }}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">{stepLabel(currentStep)}</span>
    </div>
  );

  const backButton = (currentStep: number) => (
    <button onClick={() => setStep((currentStep - 1) as WizardStep)}
      className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors cursor-pointer bg-transparent border-0">
      <ArrowLeft size={16} /> {t("back")}
    </button>
  );

  // ═══════════════════════════════ WELCOME ═══════════════════════════════
  if (step === "welcome") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#FDECE8] via-white to-[#F5F0EB] dark:from-[#1E1412] dark:via-[#0F0F0F] dark:to-[#1A1412] px-6">
        <div className="max-w-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <Building2 size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-5">{t("orgOnboarding.welcomeTitle")}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg mx-auto">{t("orgOnboarding.welcomeSub")}</p>
          <button onClick={() => setStep(1)}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all cursor-pointer">
            {t("orgOnboarding.welcomeCTA")} <Building2 size={18} />
          </button>
        </div>
      </div>
    );
  }

  const currentStep = step as number;

  const leftPanel = (
    <div className="max-w-lg mx-auto w-full">
      {progressBar(currentStep)}
      {currentStep > 1 && backButton(currentStep)}

      {/* STEP 1 — IDENTIDAD + ESCALA + NATURALEZA */}
      {currentStep === 1 && (
        <>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("orgOnboarding.step1Title")}</h2>
          <p className="text-muted-foreground text-sm mb-8">{t("orgOnboarding.step1Sub")}</p>

          {/* Logo */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-2">{t("orgOnboarding.logoLabel")}</label>
            <p className="text-xs text-muted-foreground mb-3">{t("orgOnboarding.logoHint")}</p>
            {logoPreview ? (
              <div className="relative inline-block">
                <div className="w-28 h-28 rounded-2xl border-2 border-border overflow-hidden bg-card">
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                </div>
                <button onClick={clearLogo} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md cursor-pointer border-0"><X size={14} /></button>
                <button onClick={() => fileInputRef.current?.click()} className="ml-3 mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer bg-transparent border-0">{t("orgOnboarding.logoReplace")}</button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="w-28 h-28 rounded-2xl border-2 border-dashed border-border bg-card flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                <Upload size={22} className="text-muted-foreground" />
                <span className="text-[11px] font-semibold text-muted-foreground">{t("orgOnboarding.logoUpload")}</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>

          {/* Name */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-foreground mb-1.5">{t("orgOnboarding.nameLabel")}</label>
            <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-input-background text-foreground text-base focus:border-primary focus:outline-none transition-colors"
              placeholder={t("orgOnboarding.namePlaceholder")} autoFocus />
          </div>

          {/* Size — 4 cards with bracket format */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-foreground mb-2">{t("orgOnboarding.sizeLabel")}</label>
            <div className="grid grid-cols-2 gap-3">
              {SIZE_OPTIONS.map((opt) => (
                <SelectableCard key={opt.key} selected={form.size === opt.key} onClick={() => setField("size", opt.key)} className="p-4">
                  <span className="font-bold text-lg font-mono tracking-tight">{opt.display}</span>
                </SelectableCard>
              ))}
            </div>
          </div>

          {/* Nature — 4 large expandable cards */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-foreground mb-2">{t("orgOnboarding.natureLabel")}</label>
            <div className="grid grid-cols-1 gap-2">
              {NATURE_OPTIONS.map((nat) => {
                const isSelected = form.nature === nat.key;
                const isExpanded = expandedNature === nat.key;
                return (
                  <div key={nat.key} className="rounded-2xl border-2 overflow-hidden transition-all"
                    style={{ borderColor: isSelected ? "var(--primary)" : "var(--border)" }}>
                    <button onClick={() => { setField("nature", nat.key); setField("sector", ""); setExpandedNature(isExpanded ? null : nat.key); }}
                      className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer bg-transparent border-0 hover:bg-secondary/20 transition-colors">
                      <span className="font-bold text-base text-foreground">{t(nat.tKey)}</span>
                      <ChevronDown size={18} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-4 pt-1 border-t border-border/50">
                        <div className="flex flex-wrap gap-2 mt-2">
                          {nat.subSectors.map((ss) => (
                            <SelectableChip key={ss} selected={form.sector === ss} onClick={() => setField("sector", ss)} label={ss} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2"><MapPin size={14} className="text-muted-foreground" />{t("orgOnboarding.locationLabel")}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" value={form.country} onChange={(e) => setField("country", e.target.value)}
                    className="w-full pl-9 pr-4 py-3.5 rounded-xl border-2 border-border bg-input-background text-foreground text-base focus:border-primary focus:outline-none transition-colors"
                    placeholder={t("orgOnboarding.countryPlaceholder")} />
                </div>
              </div>
              <div>
                <input type="text" value={form.city} onChange={(e) => setField("city", e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-input-background text-foreground text-base focus:border-primary focus:outline-none transition-colors"
                  placeholder={t("orgOnboarding.cityPlaceholder")} />
              </div>
            </div>
          </div>

          <button onClick={() => setStep(2)} disabled={!canProceedStep1}
            className="w-full py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer">
            {t("orgOnboarding.next")} <span className="ml-2">→</span>
          </button>
        </>
      )}

      {/* STEP 2 — MODELO DE TRABAJO GLOBAL */}
      {currentStep === 2 && (
        <>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("orgOnboarding.step2Title")}</h2>
          <p className="text-muted-foreground text-sm mb-8">{t("orgOnboarding.step2Sub")}</p>
          <div className="flex flex-col gap-4">
            {WORK_MODELS.map((wm) => (
              <SelectableCard key={wm.key} selected={form.workModel === wm.key} onClick={() => setField("workModel", wm.key)} icon={<Building2 size={20} />}>
                <span className="font-bold text-lg text-foreground">{t(wm.tKey)}</span>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t(wm.tSub)}</p>
              </SelectableCard>
            ))}
          </div>
          <button onClick={() => setStep(3)}
            className="w-full py-4 mt-8 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer">
            {t("orgOnboarding.next")} <span className="ml-2">→</span>
          </button>
        </>
      )}

      {/* STEP 3 — CULTURA + AJUSTES */}
      {currentStep === 3 && (
        <>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("register.organization.step3Title")}</h2>
          <p className="text-muted-foreground text-sm mb-6">{t("register.organization.step3Sub")}</p>

          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-2">{t("register.org.cultureLabel")}</label>
            <p className="text-xs text-muted-foreground mb-3">{t("register.org.cultureHint")}</p>
            <div className="flex flex-wrap gap-2">
              {CULTURE_VALUES.map((cv) => (
                <SelectableChip key={cv} selected={form.cultureValues.includes(cv)} onClick={() => toggleCulture(cv)} label={t(cv)} />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-2">{t("orgOnboarding.step3Title")}</label>
            <p className="text-xs text-muted-foreground mb-3">{t("orgOnboarding.step3Hint")}</p>
            <div className="flex flex-wrap gap-2">
              {ADJUSTMENT_ITEMS.map((adjKey) => (
                <SelectableChip key={adjKey} selected={adjustments.includes(adjKey)} onClick={() => toggleAdjustment(adjKey)} label={t(adjKey)} />
              ))}
            </div>
          </div>

          <button onClick={() => setStep(4)} disabled={!canProceedStep3}
            className="w-full py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer">
            {t("orgOnboarding.next")} <span className="ml-2">→</span>
          </button>
        </>
      )}

      {/* STEP 4 — MATRIZ ORGANIZACIONAL (4 sliders + RADAR) */}
      {currentStep === 4 && (
        <>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("orgOnboarding.step2Title")}</h2>
          <p className="text-muted-foreground text-sm mb-8">{t("orgOnboarding.step2Sub")}</p>
          <div className="space-y-6">
            {AXIS_CONFIG.map((ax) => {
              const val = axes[ax.key];
              return (
                <div key={ax.key}>
                  <span className="text-sm font-bold text-foreground">{t(ax.tLabel)}</span>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{t(ax.tQ)}</p>
                  <CustomSlider value={val} onChange={(v) => setAxis(ax.key, v)}
                    labelLeft={t(ax.tLeft)} labelRight={t(ax.tRight)} />
                  <p className="text-[11px] text-muted-foreground/60 italic mt-1">{t(ax.tHint)}</p>
                </div>
              );
            })}
          </div>
          <button onClick={() => setStep(5)}
            className="w-full py-4 mt-8 rounded-2xl font-bold text-base bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer">
            {t("orgOnboarding.next")} <span className="ml-2">→</span>
          </button>
        </>
      )}

      {/* STEP 5 — CONSOLIDACIÓN */}
      {currentStep === 5 && (
        <>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("orgOnboarding.step4Title")}</h2>
          <p className="text-muted-foreground text-sm mb-8">{t("orgOnboarding.step4Sub")}</p>

          {!generated ? (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border-2 border-border bg-card">
                <h3 className="text-sm font-bold text-foreground mb-3">{t("orgOnboarding.step4AdjustmentsLabel")}</h3>
                {adjustments.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {adjustments.map((adjKey) => (
                      <span key={adjKey} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        <Check size={10} />{t(adjKey)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("orgOnboarding.step4EmptyAdjustments")}</p>
                )}
              </div>
              <button onClick={() => setGenerated(true)}
                className="w-full py-5 rounded-2xl font-bold text-lg bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all cursor-pointer flex items-center justify-center gap-3">
                <Sparkles size={20} /> {t("orgOnboarding.step4Generate")}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border-2 border-primary/30 bg-primary/5">
                <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2"><Check size={16} /> {t("orgOnboarding.step4Generated")}</h3>
                <p className="text-sm text-foreground leading-relaxed">{summaryText}</p>
              </div>
              <button onClick={() => onComplete?.({ ...form, axes, adjustments })}
                className="w-full py-5 rounded-2xl font-bold text-lg bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 transition-all cursor-pointer">
                {t("orgOnboarding.finish")} <span className="ml-2">→</span>
              </button>
              <button onClick={() => setGenerated(false)}
                className="w-full py-3 rounded-2xl font-bold text-sm border-2 border-border bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center gap-2">
                <RotateCcw size={14} /> {t("orgOnboarding.step4BackToStart")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ── Right panel — Live preview ──
  const rightPanel = (
    <div className="p-8 md:p-10 flex flex-col items-center justify-center min-h-screen gap-8">
      {currentStep === 1 && (
        <div className="w-full flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">{t("orgOnboarding.previewTitle")}</span>
          <div className="w-full max-w-sm rounded-3xl border border-border/60 bg-card p-8 shadow-md shadow-primary/5 text-center">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center overflow-hidden bg-muted/50">
              {logoPreview ? <img src={logoPreview} alt="" className="w-full h-full object-cover" /> : <Building2 size={32} className="text-muted-foreground/50" />}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">{form.name || <span className="text-muted-foreground/50 font-normal">{t("orgOnboarding.previewDefaultName")}</span>}</h3>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60 mt-1">
              <MapPin size={12} /> <span>{form.country && form.city ? `${form.country}, ${form.city}` : t("orgOnboarding.previewDefaultLocation")}</span>
            </div>
            {form.size && <div className="mt-3 inline-flex px-4 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">{SIZE_OPTIONS.find((o) => o.key === form.size)!.display}</div>}
            {form.nature && <div className="mt-2 text-xs text-muted-foreground font-semibold">{t(NATURE_OPTIONS.find((n) => n.key === form.nature)!.tKey)}</div>}
          </div>
          <p className="text-xs text-muted-foreground/50 text-center mt-4">{t("orgOnboarding.previewSub")}</p>
        </div>
      )}

      {(currentStep === 2 || currentStep === 3 || currentStep === 4 || currentStep === 5) && (
        <div className="w-full flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">{t("orgOnboarding.step4RadarLabel")}</span>
          <div className="w-full max-w-sm rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-md shadow-primary/5">
            <RadarViz data={radarData} height={320} outerRadius={110} fontSize={12} />
            <hr className="border-border/40 my-5" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {AXIS_CONFIG.map((ax, i) => (
                <div key={ax.key} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground/70 font-semibold">{t(ax.tLabel)}</span>
                  <span className="font-bold font-mono tabular-nums text-primary">{axes[ax.key]}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Work model badge */}
          {form.workModel && (
            <div className="w-full max-w-sm mt-4">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-secondary text-secondary-foreground border border-border/60">
                {t(WORK_MODELS.find((wm) => wm.key === form.workModel)!.tKey)}
              </span>
            </div>
          )}

          {currentStep === 5 && adjustments.length > 0 && (
            <div className="w-full max-w-sm mt-5">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 block mb-3">{t("orgOnboarding.step4AdjustmentsLabel")}</span>
              <div className="flex flex-wrap gap-2">
                {adjustments.map((adjKey) => (
                  <span key={adjKey} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-secondary/60 text-secondary-foreground border border-border/50">
                    <Check size={9} />{t(adjKey)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return <SplitScreenLayout left={leftPanel} right={rightPanel} />;
}
