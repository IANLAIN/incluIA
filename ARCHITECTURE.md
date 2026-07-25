# Astris Architecture

## Overview

Astris is a React + Vite + TypeScript SPA that connects diverse talent with inclusive organizations through matching based on work styles, environmental needs, and reasonable accommodations — not on diagnoses.

It uses React Router DOM v7 with search params for navigation, React.lazy() + Suspense for mandatory code splitting, i18next for 4 languages, and a fully offline demo data system with no backend dependency. The UI follows a **parametrized, wizard-driven, split-screen** paradigm — no infinite scroll, no free-text descriptions for profiles.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Language | TypeScript (strict: true) |
| Build | Vite |
| Routing | React Router DOM (search params) |
| Styles | Tailwind CSS |
| UI primitives | Radix UI |
| Icons | Lucide React |
| i18n | i18next + react-i18next + LanguageDetector |
| Backend | Demo offline (no backend) |
| Demo data | src/services/demoData.ts |
| Charts | Recharts |
| Animations | Framer Motion |
| Bundle Analysis | Vite rollupOptions.manualChunks |

---

## UI Architecture

### Wizard Pattern (Step-by-Step)

Multi-step flows (organization onboarding, opportunity publishing, user registration) use a **Wizard pattern**. Each step renders one focused block of controls at a time, with sequential navigation through a progress bar (dots + step counter) and a "Back" button.

**Why wizards are used instead of long single-page forms:**
- Reduces cognitive load — users focus on one decision at a time
- Prevents form abandonment — clear progress indication
- Mobile-friendly — no long vertical pages
- Enables live preview on the right panel (see Split-Screen below)

**Files implementing the Wizard pattern:**
- `src/pages/register/CandidateRegisterWizard.tsx` (4-step registration wizard)
- `src/pages/register/OrganizationRegisterWizard.tsx` (3-step registration wizard)
- `src/pages/register/MentorRegisterWizard.tsx` (3-step registration wizard)
- `src/pages/organization/OrganizationOnboarding.tsx`
- `src/pages/organization/OrganizationPostVacancy.tsx`
- `src/pages/candidate/CandidateOnboarding.tsx` (onboarding wizard)
- `src/pages/candidate/quiz/` (quiz wizard, 4-step)

### Split-Screen Layout (60/40)

The `SplitScreenLayout` component enforces a 60/40 visual division:

- **Left (60%)**: Form controls — white background (`bg-white`)
- **Right (40%)**: Live preview — peach brand background (`bg-[#FDECE8]`), sticky panel

The right panel updates in real time as the user interacts with controls on the left, providing immediate visual feedback. This pattern is used for both the Organization Onboarding and the Opportunity Publishing wizard.

**How state management works in SplitScreen:**
- The wizard component holds all form state in local `useState` (ephemeral per session, not lifted to App.tsx)
- Changes in left-panel controls trigger `onChange` callbacks that update the state
- The right preview panel reads the same state to render live previews
- This avoids unnecessary root re-renders and keeps state scoped to the wizard

**File**: `src/components/common/SplitScreenLayout.tsx`

### Parametrized Inputs (No Free Text)

All profile and opportunity fields use **parametrized selection components** instead of free-text areas. This is the core of the **Principio de Parametrización Universal** — no `<textarea>` or free-text `<input>` is used for descriptions, profiles, missions, or skills.

| Component | Purpose | Used In |
|-----------|---------|---------|
| `SelectableCard` | Single selection among visual cards | Org size, modality, schedule, social level, task type |
| `SelectableChip` | Multiple selection chips with check marks | Adjustments catalog, skill tags, preferences |
| `CustomSlider` | Continuous range slider with floating tooltip | 4 operational axes (Processing, Environmental Tolerance, Execution, Reasonable Adjustments), role alignment |
| Radix UI `Select` | Dropdown menus | Sector selection, country, dropdown-based fields |
| `RadarViz` | Native SVG radar chart | Profile visualization, role comparison (not Recharts) |

**Files:**
- `src/components/common/SelectableCard.tsx`
- `src/components/common/SelectableChip.tsx`
- `src/components/common/CustomSlider.tsx`
- `src/components/common/RadarViz.tsx`

### Managing Complex State Without Free Text

Astris handles complex selections (4 axes, skill levels, adjustment catalogs) through these mechanisms:

1. **4 Operational Axes (Quiz)**: 4 axes × 4 questions with 5-point Likert scale answers. Each answer is a `CustomSlider` value from 1–5. No free-text descriptions of "how I work" — the radar profile is computed numerically.

2. **Skill Selection**: Skills are presented as `SelectableChip` arrays from a predefined catalog. Candidates select which skills apply — no free-text "other skills" field.

3. **Adjustments / Accommodations**: A predefined catalog of adjustments (quiet environment, flexible hours, async communication, etc.) presented as `SelectableChip` options. No free-text "describe your needs."

4. **Organization Profile**: Org size, sector, modality, and values are all parametrized via `SelectableCard` and Radix `Select`. No mission/vision free-text.

5. **Vacancy Posting**: Role alignment axes are set via `CustomSlider`, modality/schedule/contract type via `SelectableCard`. No job description textarea.

---

## Folder Structure

```
src/
  App.tsx                    # Root: conditional routing by screen + role, modals, theme, Suspense
  main.tsx                   # Entry point: BrowserRouter + render + style/i18n imports
  vite-env.d.ts              # Vite types

  assets/                    # Images (.png, .webp) — no embedded text, < 200 KB

  components/
    common/                  # Shared components: NavBar, MatchBadge, RadarViz,
                             #   SplitScreenLayout, SelectableCard, SelectableChip,
                             #   CustomSlider, CollaboratorCarousel, AnimatedBar, Overlay
    modals/                  # LanguageModal, LoginModal, RegisterModal, UpdatePasswordModal
    register/                # Sub-steps for the registration flow (RoleSelectStep, CredentialsStep, GoogleAuthStep)
    ui/                      # Radix UI wrappers shadcn-style: button, dialog, card, form, etc.

  hooks/
    useAuth.ts               # Authentication: session, role, quizCompleted, demo users, CRUD auth
    useCanGoBack.ts          # Detect navigable history (window.history.state.idx)
    useTheme.ts              # Palette, dark mode, font — persisted in localStorage

  i18n/
    i18n.ts                  # i18next configuration (LanguageDetector, resources)
    useT.ts                  # useT() hook, helpers: C(), computeRadar(), getPaletteName(), getInitialLang()
    content.ts               # Static data NOT translated via i18n: QUIZ_AXES (4 axes × 4 questions), PALETTES (4 palettes)
    es.json                  # Spanish translations (base)
    en.json                  # English translations
    pt.json                  # Portuguese translations
    fr.json                  # French translations

  lib/
    affirmations.ts           # Utility: maps radar axis values to first-person affirmation i18n keys
    constants.ts              # Screen definitions, nav items, role routing
    pageLoaders.ts            # Centralized React.lazy() imports for all pages
    parseParams.ts            # URL search-param parsing utilities

  mock/                      # Demo data re-export
    index.ts                 # Re-exports everything from @/services/demoData

  services/
    demoData.ts              # ALL demo data: users, vacancies, mentors, organizations
    supabase.ts              # Demo API: auth, matching, profiles, checkins

  pages/                    # Páginas organizadas por rol
    public/                 # LandingPage, AboutPage, SupportPage, PartnersPage
      PublicPageShell       # Shared layout for public pages
    register/               # Per-role registration wizards: CandidateRegisterWizard (4 steps),
                            #   OrganizationRegisterWizard (3 steps), MentorRegisterWizard (3 steps)
    candidate/              # CandidateOnboarding, CandidateQuiz, CandidateProfile,
                            #   CandidateVacancies, VacancyDetail, MentorSelect,
                            #   CandidateAccompaniment, CandidatePostHire
    organization/           # OrganizationOnboarding (wizard), OrganizationOrgProfile,
                            #   OrganizationPostVacancy (wizard, includes physical environment chips),
                            #   OrganizationCandidates, OrganizationCandidateDetail, OrganizationPostHire
    mentor/                 # MentorDashboard, MentorCheckins, MentorOrganizations
    shared/                 # NotFoundPage, SettingsPage

  styles/
    index.css                # Entry point: imports all CSS
    globals.css              # Resets and base styles
    tailwind.css             # Tailwind v4 directives (@import "tailwindcss")
    theme.css                # Theme CSS variables (--primary, --background, etc.)
    fonts.css                # @font-face for Atkinson Hyperlegible, Lexend, Inter

  types/
    index.ts                 # Lang, Role, PaletteKey, FontKey, QuizAnswers, VacancyItem, MentorItem, etc.
```

---

## Routing System

- **BrowserRouter** in `main.tsx`
- **Search param navigation**: `?screen=...&view=...`

### Key Functions

| Function | Location | Behavior |
|----------|----------|---------|
| parseParams() | src/App.tsx | Reads window.location.search on each render, returns { screen, publicView } |
| setScreen(s) | App.tsx (useCallback) | navigate("?screen=" + s, { replace: false }) — creates a real history entry |
| setPublicView(v) | App.tsx (useCallback) | navigate("?view=" + v) — for public pages |
| handleBackTo(fallback) | App.tsx | If history exists -> navigate(-1); otherwise -> setScreen(fallback) |
| useCanGoBack() | src/hooks/useCanGoBack.ts | Returns window.history.state?.idx > 0 |

### Screen Map by Role

| Role | Screens |
|------|---------|
| candidate | onboarding, quiz, profile, vacancies, vacancy-detail, mentor-select, accompaniment, post-hire, tracking |
| organization | **org-onboarding** (wizard), org-profile, **post-vacancy** (wizard), candidates, candidate-detail, comp-post-hire, post-hire |
| mentor | dashboard, checkins, organizations |

### Mandatory Quiz Block

- `quizCompleted` is persisted in localStorage as `astris_quiz_completed` (boolean)
- Initial load: useEffect in useAuth() reads it from storage
- While quizCompleted === false, the candidate can ONLY see onboarding and quiz
- Any other screen shows a blocker: "Perfil incompleto" with a button to go to characterization
- The blocker renders directly in App.tsx

---

## Code Splitting — Mandatory

Every page MUST be loaded with React.lazy() + Suspense. No static page imports allowed.

### Correct pattern for named exports

```tsx
const CandidateProfile = lazy(() =>
  import("@/pages/candidate/CandidateProfile").then(m => ({ default: m.CandidateProfile }))
);
```

### Fallback

All lazy pages render within:

```tsx
<Suspense fallback={
  <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
    <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
      style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}>
    </div>
  </div>
}>
```

### Build chunk splitting (vite.config.ts)

```ts
manualChunks(id: string) {
  if (id.includes('node_modules')) {
    if (id.includes('motion'))     return 'vendor-framer';
    if (id.includes('recharts'))   return 'vendor-recharts';
    if (id.includes('lucide-react')) return 'vendor-lucide';
    if (id.includes('@radix-ui'))  return 'vendor-radix';
    return 'vendor-core';
  }
}
```

Each page chunk should be < 10 KB (wizard pages ~15-24 KB due to complexity). Vendor chunks are separated by library to maximize caching.

---

## Translation System (i18n)

### Architecture

| File | Purpose |
|------|---------|
| src/i18n/i18n.ts | Initializes i18next with LanguageDetector and resources from 4 JSON files |
| src/i18n/useT.ts | useT() hook, helpers: C() (nested object access), computeRadar(), getPaletteName(), getInitialLang(), getInitialModalStep() |
| src/i18n/content.ts | Static data NOT translated via i18n: QUIZ_AXES (questions with stems/opts in 4 languages), PALETTES (colors) |
| src/i18n/{es,en,pt,fr}.json | Flat translations with semantic keys |

### Rules

1. **User-visible text** MUST be in the JSON files, not hardcoded
2. **Semantic keys**: `scope.key` (e.g., modality.remote, vacancy.full_time, common.loading)
3. **Data with nested language structure** (questions, palettes) go in content.ts with `{ es, en, pt, fr }` objects
4. **Programmatic access to arrays/objects**: C(lang, "accompStages") returns the translated object
5. **Language persisted** in localStorage["astris_lang"]
6. All dashboards (candidate, organization, mentor) must use t() for every user-visible string

### Adding new translations

1. Add "key": "value" in src/i18n/es.json
2. Translate in en.json, pt.json, fr.json
3. Use t("key") in TSX

---

## State Management — No Global Store

| State | Location | Persistence |
|-------|----------|-------------|
| Authentication / role | useAuth() hook | localStorage for demo |
| Theme (palette, dark, font) | useTheme() hook | localStorage["astris_palette"], localStorage["astris_dark"], localStorage["astris_font"] |
| Navigation (screen, view) | URL search params | URL (shareable, navigable with browser back button) |
| Quiz answers / axis | useState in App.tsx | Not persisted |
| Quiz completed | useAuth().quizCompleted | localStorage["astris_quiz_completed"] |
| Translations | i18next context | Cookie / localStorage via LanguageDetector |
| Selected vacancy | useState in App.tsx | Not persisted |
| Selected candidate | useState in App.tsx | Not persisted |
| **Wizard form data** (steps, axes, skills) | **useState in page component** | Not persisted (ephemeral per session) |

No Context API or global store (Redux, Zustand, Jotai). Hooks and local state are used directly from App.tsx and page components, passing values as props.

---

## Authentication

### Demo mode (no backend)

| Role | Email | Password | ID |
|------|-------|----------|-----|
| Candidate | candidato@astris.org | Demo2026 | demo-cand |
| Organization | organizacion@astris.org | Demo2026 | demo-comp |
| Mentor | mentor@astris.org | Demo2026 | demo-ment |

### Flow

1. App.tsx -> useAuth(setScreen, setModalStep) executes on mount
2. getCurrentUser(): checks localStorage["astris_demo_user"] -> if matches demo, returns mock data
3. If no demo, returns null
4. If demo session exists: returns { id, email, name, role, avatarUrl, vocation, completedOnboarding, profile }
5. Based on role, redirects to the initial screen

---

## Demo Data System

All demo content lives in `src/services/demoData.ts`:

| Data | Description |
|------|-------------|
| DEMO_USERS | Demo user credentials and profiles |
| VACANCIES_FALLBACK | Vacancies: Vibra Latina (Full Stack, Designer) and Closer To The Stars (Sys Admin) |
| MENTORS_FALLBACK | 4 available mentors |
| CANDIDATE_RADAR_FINAL | Bryan Gonzalez radar profile |
| CANDIDATE_ADJUSTMENTS | Candidate adjustments for display |
| ORGANIZATION_CANDIDATES_DATA | Organization candidates with matches |
| MENTOR_PROCESSES | Active mentor processes |
| MENTOR_ORGANIZATIONS | Organizations linked to mentor |

No internet connection or environment variables needed. Everything works offline.

---

## Architecture Principles

| Principle | Implementation |
|-----------|---------------|
| Code Splitting | React.lazy() on every page in App.tsx. Chunks < 10 KB per page. Separate vendor chunks. |
| DRY | Repeated logic to hooks (useAuth, useTheme). API calls to services (supabase.ts). Repeated JSX to common components (SplitScreenLayout, SelectableCard, SelectableChip, CustomSlider, RadarViz). |
| Modularity | 1 file = 1 component/hook/service. Folders by role (public, candidate, organization, mentor) and type (common, ui, modals, hooks, services). |
| One file, one responsibility | No files > 150 lines. Functions < 40 lines. Components < 100 lines of JSX. |
| Parametrización Universal | No free-text fields in profiles. All selections via SelectableCard, SelectableChip, CustomSlider, or Radix Select. |
| Wizard UX | Multi-step flows use step-by-step wizards with live preview, not infinite scroll. |
| No spaghetti code | Clear separation: logic (hooks), data (services), presentation (components), config (i18n), types (types/). |
| No static page imports | Every page imported with React.lazy(). Static imports of pages prohibited. |
| No junk files | Before commit: remove .bak, .old, temp scripts, orphan files. |
| No personal data | Never commit tokens, API keys, personal emails in code. Use .env (included in .gitignore). |
| No console.log | Remove debugging logs before commit. |
| No commented code | No commented blocks. If unused, remove. |
| Accessibility | ARIA labels, roles, forms with label, sufficient contrast in palettes, dyslexia font (OpenDyslexic). |
| Responsive | Tailwind breakpoints sm, md, lg. Collapsible radar on mobile. Mobile menu with toggle. |

---

## Key Technical Decisions

1. **Search params instead of nested routes**: avoids complex React Router hierarchies, navigation state is the URL itself, supports natural back button navigation.
2. **i18n with flat JSON**: simple, no namespaces, one file per language. Structured data (questions, palettes) goes in content.ts with `{ es, en, pt, fr }` format.
3. **Demo mode without backend**: full offline development without external dependency. All data lives in src/services/demoData.ts. Demo credentials verified in useAuth.handleLogin().
4. **Recharts (RadarChart)**: lightweight, sufficient for 4-axis radar profile.
5. **localStorage for quizCompleted**: avoids external calls on each render to verify quiz status.
6. **RadarViz (SVG native)**: custom SVG radar chart component used instead of Recharts RadarChart for organization/role comparison views, providing better control over labels and animation.
7. **Radix UI + Tailwind**: headless accessible components with utility styles. No heavy component libraries.
8. **Vite manualChunks**: strategic vendor separation for maximum HTTP caching.
9. **Parametrized Wizard UX**: All multi-step flows (org onboarding, post vacancy) use the Wizard + SplitScreen pattern, replacing old single-page "gray form" layouts. This ensures visual consistency and forces parametrized input.
10. **Wizard form state scoped locally**: Each wizard page keeps form state in local `useState` (not lifted to App.tsx), preventing unnecessary root re-renders and keeping state management contained.
11. **Roles**: Only 3 user roles — Candidate, Organization, Mentor. No Admin role.

---

## Performance Considerations

- All pages are lazy-loaded: the user only downloads what they visit
- Vendors are cached independently: if only page code changes, vendors are not re-downloaded
- img assets manually optimized (< 200 KB, .webp when possible)
- No global re-renders: each page receives only the props it needs
- No Context API: avoids unnecessary re-renders in the component tree
- No Supabase dependency: removes ~30KB from the bundle, reduces load times
- Wizard pages keep form state in local useState (not lifted to App.tsx), preventing unnecessary root re-renders
