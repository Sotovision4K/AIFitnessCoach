# Tasks: IRON MIND Frontend

**Input**: Design documents from `/specs/main/`
**Prerequisites**: plan.md (required), spec.md (via .github/copilot/spec.md), research.md, data-model.md, contracts/

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project scaffolding, dependency installation, configuration

- [X] T001 Scaffold Vite + React 19 + TypeScript project, install all approved dependencies per quickstart.md
- [X] T002 Configure vite.config.ts with @tailwindcss/vite plugin and @ path alias
- [X] T003 [P] Create src/index.css with Tailwind @import, @theme tokens, and @font-face declarations per research.md R-003/R-004
- [X] T004 [P] Create src/constants/tokens.ts with design token object per plan.md
- [X] T005 [P] Create all TypeScript type definitions in src/types/ (user.ts, onboarding.ts, workout.ts, auth.ts, enums.ts, landing.ts) per data-model.md
- [X] T006 [P] Create .env.local with placeholder Cognito/API environment variables per quickstart.md
- [X] T007 [P] Download and place self-hosted WOFF2 font files in public/fonts/ per research.md R-004
- [X] T008 Create src/lib/cn.ts utility (clsx + tailwind-merge) for shadcn/ui
- [X] T009 Initialize shadcn/ui and install required components (button, input, select, slider, checkbox, label, card, badge) per research.md R-007

**Checkpoint**: Project builds with `npm run dev`, dark background renders, fonts load, Tailwind utilities work.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before page/feature work

**⚠️ CRITICAL**: No page-level work can begin until this phase is complete

- [X] T010 Create src/lib/amplifyConfig.ts with AWS Amplify v6 Cognito configuration per research.md R-002
- [X] T011 Create src/lib/api.ts — typed fetch wrapper with auth header injection per research.md R-008 and contracts/api.md
- [X] T012 Create src/hooks/useAuth.ts — auth state hook using Amplify getCurrentUser/fetchAuthSession
- [X] T013 Create src/providers/AuthProvider.tsx — React context provider wrapping useAuth, exposes AuthState + login/logout actions
- [X] T014 Create src/components/layout/GridBackground.tsx per .github/copilot/spec.md (fixed, grid lines, pointer-events: none)
- [X] T015 [P] Create src/components/layout/Scanline.tsx per .github/copilot/spec.md (fixed, repeating gradient)
- [X] T016 Create src/components/layout/Navbar.tsx per .github/copilot/spec.md (fixed, scroll behavior, mobile hamburger, CTA button)
- [X] T017 [P] Create src/components/layout/Footer.tsx per .github/copilot/spec.md (flex row, links, mobile responsive)
- [X] T018 Create src/components/auth/ProtectedRoute.tsx per .github/copilot/spec.md (checks useAuth, loading spinner, redirect)
- [X] T019 Create src/pages/NotFoundPage.tsx — 404 page with dark theme styling
- [X] T020 Create src/App.tsx with React Router v7 createBrowserRouter per research.md R-006 (all 5 routes, lazy-loaded pages, ProtectedRoute wrapper, AuthProvider, layout with GridBackground/Scanline/Navbar/Footer)
- [X] T021 Update src/main.tsx to import amplifyConfig and render App

**Checkpoint**: App renders with Navbar + Footer + GridBackground + Scanline. Navigation works between routes. Protected routes redirect to /.

---

## Phase 3: Landing Page (Priority: P1) 🎯 MVP

**Goal**: Complete marketing landing page with all 6 sections and scroll animations

### Implementation

- [X] T022 Create src/constants/data.ts — static content for Hero stats, HowItWorks steps (with terminal content), Benefits cards, ProgressionChart bars per .github/copilot/spec.md
- [X] T023 Create src/components/landing/Hero.tsx per .github/copilot/spec.md (tagline with blink cursor, h1 gradient, description, CTA buttons, stats row)
- [X] T024 Create src/components/landing/HowItWorks.tsx per .github/copilot/spec.md (3-step grid with terminal visuals, responsive breakpoints at 1024px/768px)
- [X] T025 Create src/components/landing/Benefits.tsx per .github/copilot/spec.md (6-card grid, hover accent line, responsive 3→2→1 columns)
- [X] T026 Create src/components/landing/ProgressionChart.tsx per .github/copilot/spec.md (8 animated bars, scroll-triggered staggered animation via Framer Motion)
- [X] T027 Create src/components/landing/CTASection.tsx per .github/copilot/spec.md (radial gradient overlay, heading with gradient span, login button triggers Cognito)
- [X] T028 Create src/components/auth/LoginButton.tsx per .github/copilot/spec.md (variant primary/outline, triggers signInWithRedirect via Amplify)
- [X] T029 Create src/pages/LandingPage.tsx — assembles Hero, HowItWorks, Benefits, ProgressionChart, CTASection with Framer Motion scroll reveal wrappers

**Checkpoint**: Landing page renders all sections. Scroll animations trigger on viewport entry. CTA buttons trigger Cognito redirect. Responsive at 1024px/768px breakpoints.

---

## Phase 4: Authentication (Priority: P1)

**Goal**: Complete OAuth callback handling and auth state management

### Implementation

- [X] T030 Create src/components/auth/AuthCallback.tsx per .github/copilot/spec.md (handles /callback, exchanges code via Amplify Hub listener, redirects to /onboarding or /dashboard based on hasCompletedOnboarding, loading state, error display)
- [X] T031 Create src/pages/CallbackPage.tsx — renders AuthCallback component
- [X] T032 Wire LoginButton and CTASection onLogin prop to signInWithRedirect in LandingPage and Navbar

**Checkpoint**: Login button redirects to Cognito. Callback page exchanges code and redirects. Protected routes enforce auth. Logout works.

---

## Phase 5: Onboarding Form (Priority: P2)

**Goal**: Multi-step onboarding form with Zod validation and API submission

### Implementation

- [X] T033 Create src/components/onboarding/StepProgress.tsx per .github/copilot/spec.md (5 numbered circles, connecting line, active/inactive states, step labels)
- [X] T034 Create src/components/onboarding/PersonalInfoStep.tsx — Step 1: age, gender, height, weight inputs with personalInfoSchema Zod validation
- [X] T035 Create src/components/onboarding/FitnessProfileStep.tsx — Step 2: selectable cards for level/goal, slider for days, segmented control for duration with fitnessProfileSchema Zod validation
- [X] T036 Create src/components/onboarding/EquipmentStep.tsx — Step 3: checkbox grid for equipment, tag input for injuries with equipmentSchema Zod validation
- [X] T037 Create src/components/onboarding/PreferencesStep.tsx — Step 4: split type cards, cardio toggle, preferred cardio input with preferencesSchema Zod validation
- [X] T038 Create src/components/onboarding/ReviewStep.tsx — Step 5: terminal-style summary, edit buttons per section, submit button
- [X] T039 Create src/hooks/useMultiStepForm.ts — manages step navigation, collects per-step data, validates via Zod, submits combined OnboardingInput to PUT /api/v1/profile/input
- [X] T040 Create src/pages/OnboardingPage.tsx — assembles StepProgress + step components using useMultiStepForm, handles submit success → redirect to /dashboard

**Checkpoint**: 5-step form navigates correctly. Each step validates with Zod. Review step shows all data. Submit calls API. Redirects to dashboard on success.

---

## Phase 6: Dashboard (Priority: P3)

**Goal**: Workout plan display with day-by-day breakdown and progressive overload indicators

### Implementation

- [X] T041 Create src/components/dashboard/WeekNav.tsx — week number display with prev/next navigation
- [X] T042 Create src/components/dashboard/ExerciseCard.tsx — displays exercise name, sets, reps, weight, RPE, notes, progressive overload arrows (↑ with weight diff from previousWeightKg)
- [X] T043 Create src/components/dashboard/DayView.tsx — day label header, list of ExerciseCard components for one WorkoutDay
- [X] T044 Create src/components/dashboard/WorkoutPlanView.tsx — fetches GET /api/v1/workout/latest via api client, shows generating/ready/error states, renders DayView for each day
- [X] T045 Create src/components/dashboard/GenerateButton.tsx — triggers POST /api/v1/workout/generate, polls for completion (3s interval, 60 max), shows status
- [X] T046 Create src/pages/DashboardPage.tsx — assembles WeekNav + WorkoutPlanView + GenerateButton, handles first-time user (no plan yet) vs returning user

**Checkpoint**: Dashboard fetches and displays workout plan. Exercise cards show progressive overload. Generate button triggers plan creation and polls. Loading/error states display correctly.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality improvements

- [X] T047 [P] Add loading skeleton components for LandingPage, DashboardPage, OnboardingPage async states
- [X] T048 [P] Create ErrorBoundary component wrapping App with fallback UI
- [X] T049 [P] Add SEO meta tags to index.html (title, description, Open Graph)
- [X] T050 Verify all components are under 150 lines — refactor any that exceed
- [X] T051 Verify accessibility: keyboard navigation, aria-labels, semantic HTML, WCAG AA contrast on all interactive elements
- [X] T052 Run quickstart.md verification checklist (dark bg, fonts, Tailwind classes, routing, no console errors)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1 completion — BLOCKS all feature work
- **Phase 3 (Landing)**: Depends on Phase 2
- **Phase 4 (Auth)**: Depends on Phase 2, co-dependent with LoginButton from Phase 3
- **Phase 5 (Onboarding)**: Depends on Phase 2 + Phase 4 (auth must work for protected routes)
- **Phase 6 (Dashboard)**: Depends on Phase 2 + Phase 4
- **Phase 7 (Polish)**: Depends on all prior phases

### Parallel Opportunities

- T003, T004, T005, T006, T007 can all run in parallel (Phase 1)
- T015, T017 can run in parallel with other Phase 2 tasks
- Phase 3 and Phase 4 can overlap once Phase 2 is complete
- Phase 5 and Phase 6 can overlap once Phase 4 is complete
- All T047, T048, T049 can run in parallel (Phase 7)
