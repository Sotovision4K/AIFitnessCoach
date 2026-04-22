# Research: IRON MIND Frontend

**Date**: 2026-04-13  
**Plan**: `specs/main/plan.md`

---

## R-001: Testing Framework

**Context**: No testing framework was specified in the project description.

**Decision**: Vitest + React Testing Library + Playwright

**Rationale**:
- **Vitest** is the native test runner for Vite projects — zero additional
  bundler configuration, uses the same Vite transform pipeline, and supports
  TypeScript out of the box.
- **React Testing Library** (`@testing-library/react`) encourages testing
  components the way users interact with them (accessibility-first queries),
  which aligns with Constitution Principle IV (Accessibility).
- **Playwright** for E2E tests of critical flows (auth callback, onboarding
  form submission, protected route redirect).

**Alternatives Considered**:
- Jest: Requires separate TS/JSX transform setup; slower cold starts than
  Vitest; increasingly supplanted in Vite ecosystems.
- Cypress: Heavier E2E runner; Playwright's multi-browser support and
  speed are preferable for a CI-first project.

---

## R-002: AWS Amplify v6 — Cognito Hosted UI with PKCE

**Context**: Auth must use Cognito Hosted UI redirect (no custom login form)
with Authorization Code Flow + PKCE per Constitution Principle II.

**Decision**: Use `aws-amplify/auth` v6 `signInWithRedirect()` API.

**Rationale**:
- Amplify v6 is tree-shakeable and modular — import only `signInWithRedirect`,
  `signOut`, `getCurrentUser`, `fetchAuthSession` from `aws-amplify/auth`.
- `signInWithRedirect` triggers the Cognito Hosted UI OAuth flow with PKCE
  automatically when configured with `responseType: 'code'`.
- Tokens are managed in-memory by default in Amplify v6 (no `localStorage`
  unless explicitly configured), satisfying the security constraint.
- Token refresh is handled by `fetchAuthSession()` which silently refreshes
  using the refresh token stored in a secure httpOnly cookie (when using
  Cognito Hosted UI flow).

**Key Configuration**:
```typescript
// lib/amplifyConfig.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_COGNITO_DOMAIN,
          scopes: ['openid', 'profile', 'email'],
          redirectSignIn: [import.meta.env.VITE_REDIRECT_SIGN_IN],
          redirectSignOut: [import.meta.env.VITE_REDIRECT_SIGN_OUT],
          responseType: 'code',
        },
      },
    },
  },
});
```

**Alternatives Considered**:
- Manual PKCE implementation with native `fetch`: Unnecessary complexity
  when Amplify v6 handles it correctly and is an approved dependency.
- `amazon-cognito-identity-js`: Lower-level, not tree-shakeable, unmaintained
  in favor of Amplify v6.

---

## R-003: Tailwind CSS 4 Configuration

**Context**: Tailwind CSS 4 uses a new CSS-first configuration model
(no `tailwind.config.js`). Design tokens must map to Tailwind's `@theme`
directive.

**Decision**: Use `@theme` in the main CSS file to define custom tokens.

**Rationale**:
- Tailwind CSS 4 replaces `tailwind.config.js` with CSS `@theme` blocks.
- Custom colors, fonts, and spacing from `constants/tokens.ts` should be
  mirrored as CSS custom properties via `@theme` for use in utility classes.
- The `@tailwindcss/vite` plugin handles compilation.

**Key Configuration**:
```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-primary: #00ff88;
  --color-primary-dim: #00cc6a;
  --color-primary-glow: rgba(0, 255, 136, 0.15);
  --color-bg-dark: #0a0a0a;
  --color-bg-card: #111111;
  --color-bg-card-hover: #161616;
  --color-border: #1a1a1a;
  --color-border-accent: #222222;
  --color-text-primary: #f0f0f0;
  --color-text-secondary: #888888;
  --color-text-dim: #555555;
  --color-warning: #ffaa00;
  --color-danger: #ff4444;

  --font-heading: 'Orbitron', sans-serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --spacing-section: 100px;
  --container-max: 1200px;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

**Alternatives Considered**:
- Keeping a JS config file: Not idiomatic for Tailwind 4; increases build
  complexity.
- CSS-in-JS tokens: Banned by constitution.

---

## R-004: Self-Hosted Font Loading

**Context**: Constitution Principle V mandates self-hosted fonts with
`font-display: swap`. Three font families: Orbitron, Inter, JetBrains Mono.

**Decision**: Download WOFF2 files, place in `public/fonts/`, declare via
`@font-face` in CSS.

**Rationale**:
- WOFF2 is the most compressed web font format with >97% browser support.
- `font-display: swap` ensures text is visible during font load.
- No external CDN calls at runtime — all fonts served from the same origin.

**Font Files Required**:
```
public/fonts/
├── orbitron-700.woff2
├── orbitron-800.woff2
├── orbitron-900.woff2
├── inter-400.woff2
├── inter-500.woff2
├── jetbrains-mono-400.woff2
└── jetbrains-mono-700.woff2
```

**Alternatives Considered**:
- Google Fonts CDN: Violates "no external CDN" rule.
- `@fontsource/*` packages: Adds npm dependencies; direct WOFF2 is simpler
  and avoids an extra build step.

---

## R-005: Framer Motion — Scroll-triggered Animations

**Context**: Landing page sections use scroll-reveal and staggered animations.
The ProgressionChart animates bar heights on viewport entry.

**Decision**: Use Framer Motion's `useInView` / `whileInView` for scroll
triggers; define shared animation variants.

**Rationale**:
- Framer Motion is an approved dependency and provides `whileInView` out of
  the box — no need for a separate Intersection Observer wrapper.
- Shared variants (`scrollReveal`, `staggerContainer`) ensure consistency
  across all sections.
- The bar chart animation uses `animate` with `transition.delay` for stagger
  (100ms × index).

**Alternatives Considered**:
- Raw Intersection Observer + CSS transitions: More code, less declarative,
  harder to maintain stagger logic.
- GSAP: Not in the approved dependency list.

---

## R-006: React Router v7 — Route Configuration

**Context**: 5 routes needed: `/`, `/callback`, `/onboarding`, `/dashboard`,
`*` (404). Two routes are protected.

**Decision**: Use `createBrowserRouter` with a layout route wrapping protected
pages.

**Rationale**:
- React Router v7 supports nested layouts via `<Outlet>`.
- A `ProtectedLayout` wrapper checks auth state and redirects to `/` if
  unauthenticated.
- Lazy-loading route components aligns with Constitution Principle V
  (performance).

**Route Tree**:
```
/                → LandingPage        (public)
/callback        → CallbackPage       (public)
/onboarding      → ProtectedRoute → OnboardingPage
/dashboard       → ProtectedRoute → DashboardPage
*                → NotFoundPage       (public)
```

**Alternatives Considered**:
- File-based routing (TanStack Router): Not in approved dependencies.
- Single route file with inline guards: Less maintainable as routes grow.

---

## R-007: shadcn/ui Initialization

**Context**: shadcn/ui copies component source code into the project
(`src/components/ui/`). Constitution allows shadcn/ui and its Radix
dependencies.

**Decision**: Initialize with `npx shadcn@latest init` targeting
`src/components/ui/`.

**Components to Install** (based on spec requirements):
- `button` — CTA buttons, form buttons
- `input` — form text inputs
- `select` — dropdowns (gender, split type)
- `slider` — days-per-week stepper
- `checkbox` — equipment checklist
- `label` — form labels
- `card` — benefit cards, exercise cards
- `dialog` — mobile nav (optional)
- `badge` — status indicators

**Alternatives Considered**:
- Building primitives from scratch: Violates the spirit of "use Radix UI
  primitives via shadcn/ui" per Constitution Principle IV; wastes time.

---

## R-008: API Client Pattern

**Context**: Constitution bans `axios`; native `fetch` required. The frontend
consumes 5 REST endpoints.

**Decision**: Create a thin `fetch` wrapper in `lib/api.ts` that attaches
the Authorization header from the current Amplify session.

**Rationale**:
- A single `api` function that calls `fetchAuthSession()` to get the current
  ID token, attaches it as `Authorization: Bearer <token>`, and handles
  JSON parsing / error normalization.
- No external dependency needed.
- Type-safe with generics: `api.get<WorkoutPlan>('/api/v1/workout/latest')`.

**Alternatives Considered**:
- Axios: Banned.
- Raw `fetch` calls scattered through components: Duplicates auth-header
  logic; violates DRY.
