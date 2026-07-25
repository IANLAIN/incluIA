import { useState, useCallback } from "react";
import { ArrowLeft, Check, Building2, Users, Globe, MapPin } from "lucide-react";
import { Lang } from "@/types";
import { useT, C } from "@/i18n/useT";
import { SelectableCard } from "@/components/common/SelectableCard";
import { SelectableChip } from "@/components/common/SelectableChip";
import { Overlay } from "@/components/common/Overlay";
import { CustomSlider } from "@/components/common/CustomSlider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type WizardStep = 1 | 2 | 3;

const TOTAL_STEPS = 3;

const SIZE_OPTIONS = [
  { key: "1_20", tKey: "orgOnboarding.size_1_20" },
  { key: "21_100", tKey: "orgOnboarding.size_21_100" },
  { key: "101_500", tKey: "orgOnboarding.size_101_500" },
  { key: "500plus", tKey: "orgOnboarding.size_500plus" },
];

const CULTURE_VALUES = [
  "register.org.culture.innovacion",
  "register.org.culture.tradicion",
  "register.org.culture.colaborativo",
  "register.org.culture.autonomo",
  "register.org.culture.inclusivo",
  "register.org.culture.resultados",
] as const;

interface OrganizationRegisterData {
  name: string;
  email: string;
  password: string;
  sector: string;
  size: string;
  country: string;
  city: string;
  cultureValues: string[];
  adaptabilityAxis: number;
}

export function OrganizationRegisterWizard({
  lang,
  onComplete,
  onBack,
}: {
  lang: Lang;
  onComplete: (data: OrganizationRegisterData) => void;
  onBack: () => void;
}) {
  const t = useT(lang);

  const [step, setStep] = useState<WizardStep>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sector, setSector] = useState("");
  const [size, setSize] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [cultureValues, setCultureValues] = useState<string[]>([]);
  const [adaptabilityAxis, setAdaptabilityAxis] = useState(50);

  const sectors = C(lang, "orgOnboarding.sectors") as string[];

  const toggleCulture = useCallback((key: string) => {
    setCultureValues((prev) => prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]);
  }, []);

  const canStep1 = name.trim() && email.trim() && password.length >= 6;
  const canStep2 = sector && size && country.trim() && city.trim();

  const handleFinish = useCallback(() => {
    onComplete({ name, email, password, sector, size, country, city, cultureValues, adaptabilityAxis });
  }, [name, email, password, sector, size, country, city, cultureValues, adaptabilityAxis, onComplete]);

  return (
    <Overlay>
      <div className="w-full max-w-lg rounded-2xl mx-auto bg-card border border-border max-h-[90vh] overflow-y-auto">
        <div className="px-6 md:px-8 py-6">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1.5 flex-1">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div key={i} className="h-2 rounded-full transition-all duration-500"
                  style={{ width: i === step - 1 ? "48px" : "24px", backgroundColor: i <= step - 1 ? "var(--primary)" : "var(--muted)", opacity: i <= step - 1 ? 1 : 0.4 }}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
              {t("orgOnboarding.step")} {step} {t("orgOnboarding.of")} {TOTAL_STEPS}
            </span>
          </div>

          {step > 1 && (
            <button onClick={() => setStep((step - 1) as WizardStep)}
              className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors cursor-pointer bg-transparent border-0">
              <ArrowLeft size={16} /> {t("back")}
            </button>
          )}

          {/* STEP 1 — Basic info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-foreground">{t("register.organization.step1Title")}</h2>
              <p className="text-sm text-muted-foreground">{t("register.organization.step1Sub")}</p>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">{t("register.org.nameLabel")}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input-background text-foreground focus:border-primary focus:outline-none"
                  placeholder={t("orgOnboarding.namePlaceholder")} autoFocus />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">{t("register.email")}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input-background text-foreground focus:border-primary focus:outline-none"
                  placeholder={t("register.email")} />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">{t("register.password")}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input-background text-foreground focus:border-primary focus:outline-none"
                  placeholder="••••••••" />
                <p className="text-xs text-muted-foreground mt-1">{t("register.passwordHint")}</p>
              </div>
              <button onClick={() => setStep(2)} disabled={!canStep1}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer">
                {t("continue")} <span className="ml-2">→</span>
              </button>
            </div>
          )}

          {/* STEP 2 — Organization identity */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-foreground">{t("register.organization.step2Title")}</h2>
              <p className="text-sm text-muted-foreground">{t("register.organization.step2Sub")}</p>

              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">{t("orgOnboarding.sectorLabel")}</label>
                <p className="text-xs text-muted-foreground mb-2">{t("orgOnboarding.sectorHint")}</p>
                <Select value={sector} onValueChange={(val) => setSector(val)}>
                  <SelectTrigger className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input-background text-foreground h-auto text-base">
                    <SelectValue placeholder={t("orgOnboarding.sectorPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>{sectors.map((s: string) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t("orgOnboarding.sizeLabel")}</label>
                <p className="text-xs text-muted-foreground mb-2">{t("orgOnboarding.sizeHint")}</p>
                <div className="grid grid-cols-2 gap-3">
                  {SIZE_OPTIONS.map((opt) => (
                    <SelectableCard key={opt.key} selected={size === opt.key} onClick={() => setSize(opt.key)} className="p-4">
                      <span className="font-semibold text-sm">{t(opt.tKey)}</span>
                    </SelectableCard>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">{t("orgOnboarding.countryLabel")}</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-border bg-input-background text-foreground focus:border-primary focus:outline-none"
                      placeholder={t("orgOnboarding.countryPlaceholder")} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">{t("orgOnboarding.cityLabel")}</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input-background text-foreground focus:border-primary focus:outline-none"
                    placeholder={t("orgOnboarding.cityPlaceholder")} />
                </div>
              </div>

              <button onClick={() => setStep(3)} disabled={!canStep2}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer">
                {t("continue")} <span className="ml-2">→</span>
              </button>
            </div>
          )}

          {/* STEP 3 — Culture + Adaptability */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">{t("register.organization.step3Title")}</h2>
              <p className="text-sm text-muted-foreground">{t("register.organization.step3Sub")}</p>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t("register.org.cultureLabel")}</label>
                <p className="text-xs text-muted-foreground mb-3">{t("register.org.cultureHint")}</p>
                <div className="flex flex-wrap gap-2">
                  {CULTURE_VALUES.map((cv) => (
                    <SelectableChip key={cv} selected={cultureValues.includes(cv)} onClick={() => toggleCulture(cv)} label={t(cv)} />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-bold text-foreground">{t("register.org.adaptabilityLabel")}</span>
                <p className="text-xs text-muted-foreground mb-2">{t("register.org.adaptabilityHint")}</p>
                <CustomSlider value={adaptabilityAxis} onChange={setAdaptabilityAxis}
                  labelLeft={t("register.org.adaptabilityLeft")} labelRight={t("register.org.adaptabilityRight")} />
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl border-2 border-border bg-background space-y-2">
                <div className="flex items-center gap-2 text-sm"><Building2 size={14} className="text-primary" /> <span className="font-semibold">{name || "—"}</span></div>
                <div className="flex items-center gap-2 text-sm"><Users size={14} className="text-primary" /> <span className="font-semibold">{sector || "—"}</span> · {size ? t(SIZE_OPTIONS.find((o) => o.key === size)!.tKey) : "—"}</div>
                <div className="flex items-center gap-2 text-sm"><MapPin size={14} className="text-primary" /> {country && city ? `${country}, ${city}` : "—"}</div>
              </div>

              <button onClick={handleFinish}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 cursor-pointer flex items-center justify-center gap-2">
                <Check size={16} /> {t("register.submit")}
              </button>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}
