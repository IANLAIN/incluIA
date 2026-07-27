import { useState, useEffect, useCallback, Suspense } from "react";
import { Lang, ModalStep, QuizAnswers, FontKey } from "@/types";
import { getInitialLang, getInitialModalStep } from "@/i18n/useT";
import { QUIZ_AXES } from "@/i18n/content";
import { saveCandidateProfile, getCurrentUser } from "@/services/dataSource";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { NavBar } from "@/components/common/NavBar";
import { LanguageModal } from "@/components/modals/LanguageModal";
import { LoginModal } from "@/components/modals/LoginModal";
import { RegisterModal } from "@/components/modals/RegisterModal";
import { UpdatePasswordModal } from "@/components/modals/UpdatePasswordModal";
import { QuizBlocker } from "@/components/common/QuizBlocker";
import { SuspenseFallback } from "@/components/common/SuspenseFallback";
import { AppLoading } from "@/components/common/AppLoading";
import { parseParams, setScreenParam } from "@/lib/parseParams";
import { CANDIDATE_SCREENS, ORGANIZATION_SCREENS, MENTOR_SCREENS } from "@/lib/constants";
import * as P from "@/lib/pageLoaders";


export default function App() {
  const { i18n } = useTranslation();
  const [modalStep, setModalStep] = useState<ModalStep>(() => getInitialModalStep());
  const [lang, setLang] = useState<Lang>(() => {
    const init = getInitialLang();
    i18n.changeLanguage(init);
    return init;
  });

  const navigate = useNavigate();
  const { screen, publicView } = parseParams();

  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [quizAxis, setQuizAxis] = useState(0);
  const [selectedVacancy, setSelectedVacancy] = useState("V-1042");
  const [selectedCandidate, setSelectedCandidate] = useState("CAND-A7X2");

  const setScreen = useCallback((s: string) => setScreenParam(navigate, s), [navigate]);
  const setPublicView = useCallback((v: string) => {
    const p = new URLSearchParams(window.location.search);
    p.set("view", v);
    navigate(`?${p.toString()}`, { replace: false });
  }, [navigate]);

  const { palette, darkMode, font, fontFamily, rootStyle, setPalette, setDarkMode, setFont } = useTheme();

  const {
    role, pendingRole, loggedIn, authLoading, authError, appReady, authMessage,
    googleAuthUser, requirePasswordUpdate, userName, userAvatar, userVocation,
    userId, quizCompleted, loadedQuizAnswers, setQuizCompleted, setPendingRole,
    setRequirePasswordUpdate, handleCompleteGoogleRegistration,
    handleRegister, handleLogin, handleDemoQuickLogin, handleLogout,
  } = useAuth(setScreen, setModalStep);

  useEffect(() => {
    if (loadedQuizAnswers && Object.keys(loadedQuizAnswers).length > 0) {
      setQuizAnswers(loadedQuizAnswers);
    }
  }, [loadedQuizAnswers]);

  const handleAnswer = (ai: number, qi: number, val: number | number[]) => {
    setQuizAnswers((prev) => ({ ...prev, [ai]: { ...(prev[ai] ?? {}), [qi]: val } }));
  };

  const handleLangSelect = (l: Lang) => {
    setLang(l);
    i18n.changeLanguage(l);
    window.localStorage.setItem("astris_lang", l);
    setModalStep("none");
  };

  const handleNav = (s: string) => {
    if (s === "home" && loggedIn && role) {
      const first = role === "candidate" ? "profile" : role === "organization" ? "candidates" : "dashboard";
      setScreen(first);
      return;
    }
    if (s === "tracking") { setScreen(role === "candidate" ? "post-hire" : "org-post-hire"); return; }
    setScreen(s);
  };

  const handleBackTo = (fallback: string) => {
    window.history.state?.idx > 0 ? navigate(-1) : setScreen(fallback);
  };

  const cycleFont = (current: FontKey): FontKey => current === "inter" ? "opendyslexic" : "inter";

  if (!appReady) return <AppLoading rootStyle={rootStyle as React.CSSProperties} />;
  if (authMessage) return <AppLoading variant="message" message={authMessage} rootStyle={rootStyle as React.CSSProperties} />;

  const currentView = publicView as string;
  const isPublicLogin = ["about", "support", "partners", "landing"].includes(currentView);

  const openAuth = (preRole?: string, step?: string) => {
    setPendingRole((preRole ?? null) as any);
    setModalStep(step === "register" ? "register" : "login");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground" style={{ fontFamily, ...(rootStyle as React.CSSProperties) }}>
      {/* ── Public pages — ALWAYS rendered behind modals when not logged in ── */}
      <Suspense fallback={<SuspenseFallback />}>
        {!loggedIn && isPublicLogin && currentView === "about" && <P.AboutPage lang={lang} onOpenAuth={openAuth} onLang={() => setModalStep("language")} onNavigate={setPublicView} darkMode={darkMode} onDarkToggle={() => setDarkMode((d) => !d)} font={font} onFontToggle={() => setFont(cycleFont(font))} />}
        {!loggedIn && isPublicLogin && currentView === "support" && <P.SupportPage lang={lang} onOpenAuth={openAuth} onLang={() => setModalStep("language")} onNavigate={setPublicView} darkMode={darkMode} onDarkToggle={() => setDarkMode((d) => !d)} font={font} onFontToggle={() => setFont(cycleFont(font))} />}
        {!loggedIn && isPublicLogin && currentView === "partners" && <P.PartnersPage lang={lang} onOpenAuth={openAuth} onLang={() => setModalStep("language")} onNavigate={setPublicView} darkMode={darkMode} onDarkToggle={() => setDarkMode((d) => !d)} font={font} onFontToggle={() => setFont(cycleFont(font))} />}
        {!loggedIn && isPublicLogin && currentView === "landing" && <P.LandingPage lang={lang} onOpenAuth={openAuth} onLang={() => setModalStep("language")} onNavigate={setPublicView} darkMode={darkMode} onDarkToggle={() => setDarkMode((d) => !d)} font={font} onFontToggle={() => setFont(cycleFont(font))} />}
        {!loggedIn && !isPublicLogin && <P.NotFoundPage lang={lang} onGoHome={() => setPublicView("landing")} />}

        {loggedIn && role && (
          <div>
            <NavBar lang={lang} role={role} screen={screen} onNav={handleNav} onLang={() => setModalStep("language")} onLogout={() => handleLogout(setPublicView)} darkMode={darkMode} onDarkToggle={() => setDarkMode((d) => !d)} font={font} onFontToggle={() => setFont(cycleFont(font))} userName={userName} userAvatar={userAvatar} />
            <main id="main-content" tabIndex={-1} style={rootStyle as React.CSSProperties}>
              {role === "candidate" && screen === "onboarding" && <P.CandidateOnboarding lang={lang} palette={palette} darkMode={darkMode} font={font} onPalette={setPalette} onDark={setDarkMode} onFont={setFont} onContinue={() => { setQuizAxis(0); setScreen("quiz"); }} />}
              {role === "candidate" && screen === "quiz" && (
                <P.CandidateQuiz lang={lang} axisIndex={quizAxis} answers={quizAnswers} onAnswer={handleAnswer}
                  onPrev={() => quizAxis > 0 ? setQuizAxis((a) => a - 1) : setScreen("onboarding")}
                  onNext={async () => {
                    if (quizAxis < QUIZ_AXES.length - 1) { setQuizAxis((a) => a + 1); }
                    else {
                      const user = await getCurrentUser();
                      if (user?.id) await saveCandidateProfile(user.id, quizAnswers, palette, font);
                      window.localStorage.setItem("astris_quiz_completed", "true");
                      setQuizCompleted(true);
                      setScreen("profile");
                    }
                  }} />
              )}

              {role === "candidate" && !quizCompleted && !["onboarding", "quiz"].includes(screen) && <QuizBlocker onStart={() => setScreen("onboarding")} />}

              {(!quizCompleted && role === "candidate") ? null : (
                <>
                  {role === "candidate" && screen === "profile" && <P.CandidateProfile lang={lang} answers={quizAnswers} vocation={userVocation} userName={userName} userAvatar={userAvatar} userId={userId} />}
                  {role === "candidate" && screen === "vacancies" && <P.CandidateVacancies lang={lang} onSelect={(id: string) => { setSelectedVacancy(id); setScreen("vacancy-detail"); }} />}
                  {role === "candidate" && screen === "vacancy-detail" && <P.VacancyDetail lang={lang} vacancyId={selectedVacancy} onBack={() => handleBackTo("vacancies")} onStart={() => setScreen("mentor-select")} />}
                  {role === "candidate" && screen === "mentor-select" && <P.MentorSelect lang={lang} onSelect={() => setScreen("accompaniment")} />}
                  {role === "candidate" && screen === "accompaniment" && <P.CandidateAccompaniment lang={lang} />}
                  {role === "candidate" && ["post-hire", "tracking"].includes(screen) && <P.CandidatePostHire lang={lang} />}
                {role === "organization" && screen === "org-onboarding" && (
                  <P.OrganizationOnboarding
                    lang={lang}
                    onComplete={() => setScreen("org-profile")}
                  />
                )}
                {role === "organization" && screen === "org-profile" && <P.OrganizationOrgProfile lang={lang} />}
                {role === "organization" && screen === "post-vacancy" && <P.OrganizationPostVacancy lang={lang} />}
                {role === "organization" && screen === "candidates" && <P.OrganizationCandidates lang={lang} onSelect={(id: string) => { setSelectedCandidate(id); setScreen("candidate-detail"); }} />}
                {role === "organization" && screen === "candidate-detail" && <P.OrganizationCandidateDetail lang={lang} candidateId={selectedCandidate} onBack={() => handleBackTo("candidates")} onStart={() => setScreen("org-post-hire")} />}
                {role === "organization" && ["org-post-hire", "post-hire"].includes(screen) && <P.OrganizationPostHire lang={lang} />}
                  {role === "mentor" && screen === "dashboard" && <P.MentorDashboard lang={lang} />}
                  {role === "mentor" && screen === "checkins" && <P.MentorCheckins lang={lang} />}
                  {role === "mentor" && screen === "organizations" && <P.MentorOrganizations lang={lang} />}
                  {role === "mentor" && !MENTOR_SCREENS.includes(screen as any) && <P.MentorDashboard lang={lang} />}
                  {screen === "settings" && <P.SettingsPage lang={lang} palette={palette} darkMode={darkMode} font={font} onPalette={setPalette} onDark={setDarkMode} onFont={setFont} onLogout={() => handleLogout(setPublicView)} />}
                  {screen !== "settings" &&
                    !(role === "candidate" && CANDIDATE_SCREENS.includes(screen as any)) &&
                    !(role === "organization" && ORGANIZATION_SCREENS.includes(screen as any)) &&
                    !(role === "mentor" && MENTOR_SCREENS.includes(screen as any)) && (
                      <P.NotFoundPage lang={lang} onGoHome={() => handleNav("home")} />
                    )}
                </>
              )}
            </main>
          </div>
        )}
      </Suspense>

      {/* ── Modals — RENDER ON TOP with backdrop blur ── */}
      {modalStep !== "none" && (
        <div
          className="fixed inset-0 z-[200] overflow-y-auto"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget && modalStep !== "language") {
              setModalStep("none");
            }
          }}
        >
          <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
            {modalStep === "language" && <LanguageModal onSelect={handleLangSelect} />}
            {modalStep === "register" && (
              <RegisterModal lang={lang} role={pendingRole} onRegister={handleRegister} onBack={() => setModalStep("none")} error={authError} loading={authLoading} googleAuthUser={googleAuthUser} onCompleteGoogle={handleCompleteGoogleRegistration} />
            )}
            {modalStep === "login" && (
              <LoginModal lang={lang} onLogin={handleLogin} onBack={() => setModalStep("none")} onRegister={() => setModalStep("register")} onDemoQuickLogin={handleDemoQuickLogin} error={authError} loading={authLoading} />
            )}
            {requirePasswordUpdate && <UpdatePasswordModal lang={lang} onComplete={() => setRequirePasswordUpdate(false)} />}
          </div>
        </div>
      )}
    </div>
  );
}
