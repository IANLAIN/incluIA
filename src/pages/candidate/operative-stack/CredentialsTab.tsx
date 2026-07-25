import { useState } from "react";
import { Github, Linkedin, Globe, Award, Plus, Trash2, ExternalLink, Check } from "lucide-react";
import { CREDENTIAL_TYPES } from "./OperativeStackTypes";
import type { CredentialItem } from "./OperativeStackTypes";

const ICON_MAP: Record<string, React.ReactNode> = {
  github: <Github size={18} />,
  linkedin: <Linkedin size={18} />,
  portfolio: <Globe size={18} />,
  certificate: <Award size={18} />,
};

export function CredentialsTab({
  items,
  onAdd,
  onRemove,
  t,
}: {
  items: CredentialItem[];
  onAdd: (item: CredentialItem) => void;
  onRemove: (id: string) => void;
  t: (key: string) => string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [credType, setCredType] = useState<CredentialItem["type"]>("github");
  const [credLabel, setCredLabel] = useState("");
  const [credUrl, setCredUrl] = useState("");

  const handleSubmit = () => {
    if (!credLabel.trim() || !credUrl.trim()) return;
    const newItem: CredentialItem = {
      id: `cred-${Date.now()}`,
      type: credType,
      label: credLabel.trim(),
      url: credUrl.trim().startsWith("http") ? credUrl.trim() : `https://${credUrl.trim()}`,
    };
    onAdd(newItem);
    setCredLabel("");
    setCredUrl("");
    setShowForm(false);
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-2">{t("opStack.cred.title")}</h3>
      <p className="text-xs text-muted-foreground mb-5">{t("opStack.cred.sub")}</p>

      {/* Existing credentials list */}
      {items.length > 0 && (
        <div className="space-y-2 mb-6">
          {items.map((cred) => (
            <div
              key={cred.id}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border-2 border-border bg-card"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {ICON_MAP[cred.type] || <Globe size={18} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground truncate">{cred.label}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60">
                      {t(CREDENTIAL_TYPES.find((ct) => ct.id === cred.type)?.labelKey ?? cred.type)}
                    </span>
                  </div>
                  <a
                    href={cred.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 mt-0.5 truncate"
                  >
                    {cred.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>
              <button
                onClick={() => onRemove(cred.id)}
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer border-0 bg-transparent transition-colors shrink-0"
                aria-label={`Remove ${cred.label}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && !showForm && (
        <div className="p-8 rounded-3xl border-2 border-dashed border-border bg-card text-center mb-6">
          <Award size={32} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground font-semibold">{t("opStack.cred.empty")}</p>
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <div className="p-5 rounded-2xl border-2 border-primary/30 bg-primary/5">
          <div className="mb-4">
            <label className="text-xs font-bold text-foreground mb-2 block">{t("opStack.cred.typeLabel")}</label>
            <div className="flex flex-wrap gap-2">
              {CREDENTIAL_TYPES.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => setCredType(ct.id)}
                  className={`
                    inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 text-xs font-semibold cursor-pointer transition-all
                    ${credType === ct.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    }
                  `}
                >
                  {ICON_MAP[ct.id]}
                  <span>{t(ct.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs font-bold text-foreground mb-1.5 block">{t("opStack.cred.labelField")}</label>
            <input
              type="text"
              value={credLabel}
              onChange={(e) => setCredLabel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input-background text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
              placeholder={t("opStack.cred.labelPlaceholder")}
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="text-xs font-bold text-foreground mb-1.5 block">{t("opStack.cred.urlField")}</label>
            <input
              type="url"
              value={credUrl}
              onChange={(e) => setCredUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input-background text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
              placeholder={t("opStack.cred.urlPlaceholder")}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!credLabel.trim() || !credUrl.trim()}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer transition-all border-0"
            >
              <Plus size={14} /> {t("opStack.cred.addBtn")}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-3 rounded-xl border-2 border-border bg-card text-muted-foreground font-bold text-sm hover:text-foreground cursor-pointer transition-all"
            >
              {t("back")}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 cursor-pointer transition-all font-semibold text-sm"
        >
          <Plus size={16} /> {t("opStack.cred.addNew")}
        </button>
      )}
    </div>
  );
}
