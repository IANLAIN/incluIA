import { useState, useEffect, useMemo } from "react";
import { User, Briefcase, CheckCircle, HeartHandshake, Loader2, MessageSquare, Target, Eye, SlidersHorizontal, Sparkles } from "lucide-react";
import { Lang, QuizAnswers } from "@/types";
import { useT, computeRadar } from "@/i18n/useT";
import { getCurrentUser, getCandidateDashboardStats } from "@/services/dataSource";
import type { CandidateDashboardStats } from "@/services/dataSource";
import { CANDIDATE_RADAR_FINAL, CANDIDATE_ADJUSTMENTS } from "@/services/demoData";
import { RadarViz } from "@/components/common/RadarViz";
import { QUIZ_AXES } from "@/i18n/content";
import { getAffirmationKey, AFFIRMATION_AXIS_LABELS, AFFIRMATION_ICONS } from "@/lib/affirmations";
// ── Icons ──
const ICON_MAP = { MessageSquare, Target, Eye, SlidersHorizontal, Sparkles } as const;
type IconName = keyof typeof ICON_MAP;

function AxisIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name as IconName] || Sparkles;
  return <Icon size={18} className={className} />;
}

export function CandidateProfile({
  lang,
  answers,
  userName,
  userAvatar,
  vocation,
  userId,
}: {
  lang: Lang;
  answers: QuizAnswers;
  userName?: string;
  userAvatar?: string;
  vocation?: string;
  userId?: string;
}) {
  const t = useT(lang);

  const [isDemoUser, setIsDemo] = useState(false);
  const [stats, setStats] = useState<CandidateDashboardStats>({ vacancies: 0, matches: 0, accompanimentActive: false });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setIsDemo(
        u?.id === "demo-cand" || u?.id === "demo-comp" || u?.id === "demo-ment"
      );
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    getCandidateDashboardStats(userId).then((s) => {
      setStats(s);
      setStatsLoading(false);
    }).catch(() => setStatsLoading(false));
  }, [userId]);

  const hasQuizAnswers = Object.keys(answers).length > 0;
  const radarData = useMemo(() => {
    const raw = hasQuizAnswers ? computeRadar(answers) : isDemoUser ? CANDIDATE_RADAR_FINAL : computeRadar(answers);
    return raw.map((d: { axis: string; value: number }) => ({ ...d }));
  }, [answers, hasQuizAnswers, isDemoUser]);

  const firstName = userName ? userName.split(" ")[0] : t("role.candidate");

  // Affirmations
  const affirmations = useMemo(() => {
    return radarData.map((d: { value: number }, i: number) => {
      const key = getAffirmationKey(i as 0 | 1 | 2 | 3, d.value);
      return {
        text: t(key),
        labelKey: AFFIRMATION_AXIS_LABELS[i],
        iconName: AFFIRMATION_ICONS[i],
        value: d.value,
      };
    });
  }, [radarData, t]);

  // Adjustments
  const adjustments: string[] = useMemo(() => {
    const axis = QUIZ_AXES[3];
    const active: string[] = [];
    if (answers[3]) {
      Object.entries(answers[3]).forEach(([qi, ans]) => {
        const qIdx = Number(qi);
        if (Array.isArray(ans) && qIdx < axis.questions.length) {
          ans.forEach((oi: number) => {
            const oText = axis.questions[qIdx].opts[lang]?.[oi] ?? axis.questions[qIdx].opts.es[oi];
            if (oText && oi !== axis.questions[qIdx].opts.es.length - 1) {
              active.push(oText);
            }
          });
        }
      });
    }
    if (active.length === 0 && isDemoUser) return CANDIDATE_ADJUSTMENTS;
    return active.length > 0 ? active : [t("profile.flexible_hours"), t("profile.async_comm"), t("profile.quiet_environment")];
  }, [answers, lang, t, isDemoUser]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 lg:px-12 py-8 border-b border-border bg-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-4 border-background shadow-sm shrink-0 bg-secondary flex items-center justify-center">
              {userAvatar ? (
                <img src={userAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {t("dash.welcome")} <span className="text-primary">{firstName}</span>
              </h1>
              {vocation && <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">{vocation}</p>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          <div className="rounded-xl border border-border bg-background p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary text-primary-foreground shrink-0"><Briefcase size={20} /></div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-muted-foreground truncate">{t("dash.suggested")}</div>
              {statsLoading ? <Loader2 size={20} className="mt-2 text-muted-foreground animate-spin" /> : <div className="text-2xl font-bold text-foreground mt-1">{stats.vacancies}</div>}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(245,196,66,0.15)", color: "#F5C442" }}><CheckCircle size={20} /></div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-muted-foreground truncate">{t("dash.matches")}</div>
              {statsLoading ? <Loader2 size={20} className="mt-2 text-muted-foreground animate-spin" /> : <div className="text-2xl font-bold text-foreground mt-1">{stats.matches}</div>}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#10B981" }}><HeartHandshake size={20} /></div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-muted-foreground truncate">{t("dash.mentor")}</div>
              {statsLoading ? <Loader2 size={20} className="mt-2 text-muted-foreground animate-spin" /> : <div className="text-lg font-bold mt-1 text-emerald-500 truncate">{stats.accompanimentActive ? t("dash.active") : t("dash.inactive")}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 px-4 lg:px-12 py-10 max-w-[1400px] w-full mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          {/* Radar */}
          <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0">
            <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4 text-center">{t("profile.cognitive_profile")}</h2>
              <div className="flex justify-center items-center w-full overflow-hidden">
                <RadarViz data={radarData} height={280} outerRadius={85} fontSize={10} />
              </div>
            </div>
            <div className="mt-6 rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-bold text-foreground mb-4">{t("profile.adjustments")}</h2>
              <div className="flex flex-wrap gap-2">
                {adjustments.length > 0 ? adjustments.map((adj, idx) => (
                  <span key={idx} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">{adj}</span>
                )) : <span className="text-sm text-muted-foreground">—</span>}
              </div>
            </div>
          </div>

          {/* Affirmations */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">{t("profile.affirmationTitle")}</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-5">{t("profile.affirmationSub")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {affirmations.map((a, i) => (
                <div key={i} className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                      <AxisIcon name={a.iconName} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{t(a.labelKey)}</span>
                    <span className="ml-auto text-xs font-bold font-mono tabular-nums text-primary">{a.value}%</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
