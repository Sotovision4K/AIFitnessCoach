# Implementation Plan: IRON MIND Frontend

**Branch**: `main` | **Date**: 2026-04-13 | **Spec**: `.github/copilot/spec.md`
**Input**: Project planning description (greenfield — no `spec.md` yet)

## Summary

Build the complete frontend for IRON MIND, an AI-powered fitness coaching
platform. The application is a React 19 + TypeScript SPA built with Vite 6,
styled with Tailwind CSS 4 and shadcn/ui components, authenticated via
AWS Cognito (Hosted UI, PKCE). It comprises a marketing landing page,
OAuth callback handler, multi-step onboarding form, and a workout dashboard.
All styling follows a strict dark theme (`#0a0a0a`) with neon emerald
(`#00ff88`) accent using self-hosted Orbitron, Inter, and JetBrains Mono
fonts.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) on React 19  
**Build Tool**: Vite 6 with `@tailwindcss/vite`  
**Primary Dependencies**: React 19, React Router v7, Tailwind CSS 4, shadcn/ui, Radix UI, Framer Motion, React Hook Form, Zod, AWS Amplify v6, Lucide React  
**Storage**: N/A (frontend only — consumes REST API)  
**Testing**: NEEDS CLARIFICATION (no testing framework specified by user)  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge — latest 2 versions)  
**Project Type**: Single-page web application (frontend only)  
**Performance Goals**: Lighthouse 90+ all categories, lazy-loaded below-the-fold sections, self-hosted fonts with `font-display: swap`  
**Constraints**: No external CDN dependencies at runtime, no CSS-in-JS, components ≤ 150 lines, mobile-first responsive  
**Scale/Scope**: ~10 pages/screens, 6 phases, 5-step onboarding form, 6 landing sections

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Design System Adherence | ✅ PASS | Dark theme `#0a0a0a`, accent `#00ff88`, Orbitron/Inter/JetBrains Mono, `border-radius ≤ 8px`, design tokens defined |
| II | Security First | ✅ PASS | Cognito Hosted UI (no custom login), PKCE auth code flow, no `localStorage` tokens, in-memory token storage |
| III | Code Quality | ✅ PASS | TypeScript strict, named exports, PascalCase components, camelCase hooks/utils, 150-line limit |
| IV | Accessibility | ✅ PASS | Radix UI primitives via shadcn/ui, semantic HTML planned, keyboard navigation via Radix |
| V | Performance | ✅ PASS | Lazy loading, self-hosted fonts, no CDN deps, `React.memo`/`useMemo`/`useCallback` planned |
| — | Boundaries | ✅ PASS | Only approved deps listed; no CSS-in-JS; frontend only; functional components only |
| — | Dependencies | ✅ PASS | All listed packages are in the Approved list; no banned packages |

**GATE RESULT: PASS** — Proceed to Phase 0.

### Post-Design Re-check (after Phase 1)

| # | Principle | Status | Post-Design Evidence |
|---|-----------|--------|---------------------|
| I | Design System | ✅ PASS | `@theme` config mirrors exact tokens; data-model has no style deviations |
| II | Security | ✅ PASS | API contracts use `Bearer <id_token>`; Amplify uses `responseType: 'code'` (PKCE); `AuthState` stores no tokens |
| III | Code Quality | ✅ PASS | All types use explicit interfaces; named exports; file naming follows convention |
| IV | Accessibility | ✅ PASS | shadcn/ui + Radix primitives specified for all interactive components |
| V | Performance | ✅ PASS | Self-hosted WOFF2 fonts with `font-display: swap`; lazy-loaded routes |
| — | Boundaries | ✅ PASS | No API endpoints created; no CSS-in-JS; frontend-only scope maintained |
| — | Dependencies | ✅ PASS | All packages in quickstart.md are on the approved list |

**POST-DESIGN GATE: PASS** — No violations introduced during design.

## Project Structure

### Documentation (this feature)

```text
specs/main/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/              # shadcn/ui primitives (auto-generated)
│   ├── layout/          # Navbar, Footer, GridBackground, Scanline
│   ├── landing/         # Hero, HowItWorks, Benefits, ProgressionChart, CTASection
│   ├── auth/            # AuthCallback, ProtectedRoute, LoginButton
│   ├── onboarding/      # UserInputForm, StepProgress, step components
│   └── dashboard/       # WorkoutPlan, DayView, ExerciseCard, WeekNav
├── hooks/               # useAuth, useScrollPosition, useInView, useMultiStepForm
├── lib/                 # cn utility, auth config (amplifyConfig), api client (fetch wrapper)
├── pages/               # LandingPage, CallbackPage, OnboardingPage, DashboardPage, NotFoundPage
├── types/               # User, WorkoutPlan, Exercise, OnboardingInput, AuthState
├── constants/           # tokens.ts (design tokens), data.ts (static content)
└── providers/           # AuthProvider
```

**Structure Decision**: Single-project SPA structure. This is a frontend-only
application; the backend is a separate service consumed via REST API. The `src/`
tree mirrors the user's architecture spec directly.

## Complexity Tracking

No constitution violations detected — table omitted.
