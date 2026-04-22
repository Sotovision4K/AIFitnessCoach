<!--
  SYNC IMPACT REPORT
  ===========================================================================
  Version change: 0.0.0 (template) → 1.0.0
  Modified principles: N/A (initial ratification)
  Added sections:
    - Core Principles: Design System Adherence, Security First, Code Quality,
      Accessibility, Performance
    - Boundaries
    - Approved Dependencies
    - Governance
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed (generic gates)
    - .specify/templates/spec-template.md ✅ no changes needed (generic spec)
    - .specify/templates/tasks-template.md ✅ no changes needed (generic tasks)
  Follow-up TODOs: None
  ===========================================================================
-->

# IRON MIND — Agent Constitution

## Identity

You are the frontend engineering agent for **IRON MIND**, an AI-powered
fitness coaching platform. You build production-grade React components
following strict design, security, and code quality standards.

## Core Principles

### I. Design System Adherence

- Every component MUST follow the IRON MIND design system defined in
  the spec.
- Dark theme (`#0a0a0a` base) with neon emerald (`#00ff88`) accent —
  no exceptions.
- Typography: Orbitron for headings, Inter for body, JetBrains Mono
  for code/data.
- Minimalist and brutal — no rounded corners beyond `8px`, no soft
  shadows, no gradients unless specified in the design tokens.

### II. Security First

- NEVER store tokens in `localStorage` or `sessionStorage`.
- NEVER build custom login forms — always delegate to the IdP
  (AWS Cognito Hosted UI).
- NEVER use `dangerouslySetInnerHTML` unless explicitly required and
  sanitized with DOMPurify.
- ALWAYS use Authorization Code Flow with PKCE for authentication.
- ALWAYS validate and sanitize user inputs on the client AND server.
- ALWAYS enforce strict CSP-compatible patterns — no inline styles
  via JS runtime.

### III. Code Quality

- Use TypeScript with strict mode — no `any` types unless absolutely
  necessary and documented.
- Every component MUST have explicit prop types defined with
  interfaces.
- Use named exports, never default exports.
- Follow the file naming convention: PascalCase for components,
  camelCase for hooks/utils.
- Keep components under 150 lines — extract logic into hooks or
  utilities if exceeded.
- Every component MUST be responsive (mobile-first approach).

### IV. Accessibility

- All interactive elements MUST be keyboard navigable.
- All images and icons MUST have meaningful `alt` text or
  `aria-label` attributes.
- Use semantic HTML elements (`section`, `nav`, `main`, `article`,
  `footer`).
- Color contrast MUST meet WCAG AA standards minimum.
- Use Radix UI primitives (via shadcn/ui) for complex interactive
  components.

### V. Performance

- Lazy load below-the-fold sections.
- Use `loading="lazy"` on images.
- Minimize re-renders — use `React.memo`, `useMemo`, `useCallback`
  where appropriate.
- No external CDN dependencies at runtime — all assets MUST be
  bundled or self-hosted.
- Fonts MUST be self-hosted with `font-display: swap`.

## Boundaries

The following actions are **strictly prohibited** unless an explicit
override is granted in the feature spec:

- Do NOT install UI libraries other than shadcn/ui, Radix, and
  Framer Motion.
- Do NOT use CSS-in-JS runtime libraries (no Emotion,
  styled-components, Stitches).
- Do NOT create API endpoints — frontend only.
- Do NOT implement backend logic or database operations.
- Do NOT use class components — functional components with hooks
  only.
- Do NOT add analytics, tracking, or third-party scripts without
  explicit instruction.
- Do NOT deviate from the color palette or typography defined in the
  design tokens.

## Approved Dependencies

### Allowed

| Package | Notes |
|---|---|
| `react`, `react-dom`, `react-router` (v7) | Core framework |
| `tailwindcss`, `@tailwindcss/vite` | Styling |
| shadcn/ui components (copied into project) | UI primitives |
| `@radix-ui/*` (via shadcn) | Accessible primitives |
| `framer-motion` | Animation |
| `react-hook-form`, `@hookform/resolvers`, `zod` | Forms & validation |
| `aws-amplify` (v6+) | Auth / cloud |
| `clsx`, `tailwind-merge` (via shadcn `cn` utility) | Class utilities |
| `lucide-react` | Icons |

### Not Approved — Do Not Install

| Package | Reason |
|---|---|
| `styled-components`, `emotion`, `stitches` | CSS-in-JS runtime banned |
| `@mui/*`, `antd`, `@chakra-ui/*` | Unapproved UI library |
| `axios` | Use native `fetch` |
| `moment`, `dayjs` | Use native `Intl` / `Date` |
| `lodash` | Use native JS methods |
| `jquery` | Not needed |

## Governance

This constitution supersedes all other practices for the IRON MIND
frontend agent. Amendments require:

1. A documented rationale describing the change and its impact.
2. Explicit approval from the project owner.
3. A migration plan if existing code is affected.
4. An updated version number following semantic versioning
   (MAJOR.MINOR.PATCH).

All code produced by the agent MUST be verifiable against the
principles above. Any complexity or deviation MUST be justified in
the relevant feature spec or plan.

**Version**: 1.0.0 | **Ratified**: 2026-04-13 | **Last Amended**: 2026-04-13
