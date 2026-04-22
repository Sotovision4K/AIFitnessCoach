# IRON MIND — Component Specification

## Global Styles

### Background Effects

#### GridBackground

- Fixed position, covers full viewport
- CSS grid lines using `linear-gradient`
- Color: `var(--primary)` at `0.03` opacity
- Grid size: 60px × 60px
- `pointer-events: none`, `z-index: 0`

#### Scanline

- Fixed position, covers full viewport
- Repeating linear gradient creating horizontal scan lines
- 2px transparent, 2px `rgba(0, 255, 136, 0.008)`
- `pointer-events: none`, `z-index: 0`

---

## Layout Components

### Navbar

```
│ [⚡ IRON MIND] [How It Works] [Benefits] [CTA] │
```

- Fixed position, `top: 0`, full width, `z-index: 1000`
- Background: `rgba(10, 10, 10, 0.85)` with `backdrop-filter: blur(20px)`
- Border bottom: `1px solid #1a1a1a`
- On scroll > 50px: reduce padding, darken border
- Logo: Orbitron 900, `1.3rem`, `#00ff88`, `letter-spacing: 3px`
- Logo icon: 32×32 box, 2px border `#00ff88`, `border-radius: 6px`, contains ⚡
- Nav links: Inter 500, `0.85rem`, `#888`, uppercase, `letter-spacing: 1px`
- CTA button: bg `#00ff88`, color `#0a0a0a`, Orbitron 700, `0.75rem`
- Mobile: hamburger menu (3 lines, 24px wide, 2px height)
- Mobile nav: full-width dropdown, `rgba(10,10,10,0.98)`, column layout

### Footer

```
┌──────────────────────────────────────────────────────────┐
│ © 2026 IRON MIND — AI Fitness Protocol [Privacy] [Terms] [Contact] │
└──────────────────────────────────────────────────────────┘
```

- Padding: `40px 0`
- Border top: `1px solid #1a1a1a`
- Flex row, `space-between`
- Left: JetBrains Mono `0.8rem`, `#555`
- Right: links, `#555`, hover `#00ff88`
- Mobile: `flex-col`, centered, gap `16px`

---

## Landing Page Sections

### Hero Section

#### Elements

1. **Tag line**:
   - JetBrains Mono, `0.8rem`, `#00ff88`
   - `tracking-[0.2em]`, uppercase
   - Prefix: `>` with CSS blink animation (1s infinite)
   - Text: "AI-Powered Coaching Protocol"

2. **Heading h1**:
   - Orbitron 900, `clamp(2.5rem, 6vw, 4.5rem)`, `line-height: 1.1`
   - Line 1: "Your Coach" — gradient text (`emerald-400` to `cyan-400`)
   - Line 2: "Never Sleeps." — color `#555`

3. **Description**:
   - Inter 400, `1.15rem`, `#888`, `max-w-560px`, `line-height: 1.8`

4. **CTA buttons**:
   - Primary: bg `#00ff88`, text `#0a0a0a`, Orbitron 700, `0.75rem`, tracking `2px`
     - Hover: `box-shadow 0 0 30px rgba(0,255,136,0.3)`, `translateY(-2px)`
   - Outline: border `1px #00ff88`, text `#00ff88`, same font
     - Hover: bg `rgba(0,255,136,0.1)`

5. **Stats row** (3 items):
   - `margin-top: 80px`, `padding-top: 40px`, `border-top 1px #1a1a1a`
   - Flex row, gap: `48px`
   - Number: Orbitron 800, `2rem`, `#00ff88`
   - Label: Inter, `0.8rem`, `#555`, uppercase, tracking `2px`
   - Items: `["100%", "Personalized"]`, `["∞", "Auto Progression"]`, `["24/7", "Always Adapting"]`

### HowItWorks Section

- Props: none
- Section: `padding 100px 0`

#### Header

- Tag: JetBrains Mono, `0.75rem`, `#00ff88`, tracking `4px` — `"// protocol.init()"`
- Title: Orbitron 800, `clamp(1.8rem, 4vw, 2.5rem)` — "Three Steps. Zero Guesswork."
  - "Zero Guesswork." in gradient
- Subtitle: Inter, `1.05rem`, `#888`, `max-w-600px`, centered

#### Steps (3 items)

Each step is a grid: `grid-cols-[80px_1fr_1fr]`, gap `48px`

**Step 1: INPUT YOUR NUMBERS**

- Number: Orbitron 900, `2.5rem`, `#00ff88` (active), `text-shadow` glow
- Title: Orbitron 700, `1.1rem`, tracking `1px`
- Description: Inter, `0.95rem`, `#888`, `line-height 1.8`
- Detail list: `0.8rem`, `#555`
- Terminal visual: bg `#111`, border `1px #222`, `border-radius 8px`, padding `24px`
  - Label: `"// user_input.json"`, `0.65rem`, `#555`
  - JSON lines: key in `#555`, values in `#00ff88`, strings in `#ffaa00`

**Step 2: AI GENERATES YOUR PLAN**

- Same structure as Step 1
- Terminal shows workout plan tree structure
  - `├` and `└` characters for tree view

**Step 3: AUTO PROGRESSIVE OVERLOAD**

- Same structure
- Terminal shows diff-style progression
  - Arrow dividers: `"────────── ▼ ──────────"` in `#555`
  - Increased values in `#00ff88` with `↑` arrows

#### Responsive

- `1024px`: `grid-cols-[60px_1fr]`, visual spans full width below
- `768px`: single column, number inline with title

### Benefits Section

- Props: none
- Grid: 3 columns, gap `2px`

#### Cards (6 total)

- Background: `#111111`, hover: `#161616`
- Padding: `48px 36px`
- Top accent line: gradient emerald-to-cyan, `scaleX(0)` → `scaleX(1)` on hover
- Icon: `1.5rem` emoji, `mb-20px`
- Title: Orbitron 700, `0.85rem`, tracking `1px`
- Description: Inter, `0.9rem`, `#888`, `line-height 1.7`

Cards data:

```typescript
[
  { icon: "🧠", title: "AI-PERSONALIZED", description: "..." },
  { icon: "📈", title: "AUTO PROGRESSION", description: "..." },
  { icon: "⚡", title: "ZERO PLANNING", description: "..." },
  { icon: "🔄", title: "WEEKLY REFRESH", description: "..." },
  { icon: "🎯", title: "GOAL-DRIVEN", description: "..." },
  { icon: "🛡️", title: "INJURY-AWARE", description: "..." },
]
```

#### Responsive

- `1024px`: 2 columns
- `768px`: 1 column

### ProgressionChart Section

- Props: none

#### Layout

- Bar chart container: bg `#111`, border `1px #222`, `border-radius 8px`, padding `60px 40px`
- 8 vertical bars, flex row, `items-end`, gap `24px`, centered
- Each bar: width `60px`, gradient emerald-to-cyan, `border-radius 4px 4px 0 0`
- Heights increase progressively: `120`, `145`, `155`, `175`, `200`, `215`, `235`, `260px`
- Labels below: Orbitron `0.65rem`, `#555` — "WK 1" through "WK 8"
- Values above: JetBrains Mono `0.75rem`, `#00ff88` — "70kg" through "82.5kg"
- Animate bars on scroll intersection (height from 0 to target, staggered `100ms`)
- Footer text: centered, JetBrains Mono `0.75rem`, `#555`

#### Responsive

- `768px`: bar width `36px`, padding `40px 20px`, gap `12px`

### CTASection

- Props: `onLogin: () => void`

#### Layout

- Container: border `1px #222`, padding `80px 40px`, `text-center`
- Radial gradient overlay: `rgba(0,255,136,0.15)` at center
- Tag: `"// ready.execute()"`
- Heading: Orbitron 800, `clamp(1.5rem, 3vw, 2.2rem)` — "Stop Guessing. Start Growing."
  - "Start Growing." in gradient
- Subtitle: Inter, `1rem`, `#888`
- Button: Primary CTA, triggers Cognito login
- Subtext: JetBrains Mono `0.7rem`, `#555` — "Powered by AWS Cognito"

```typescript
interface LoginButtonProps {
  variant: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

- Triggers Cognito Hosted UI redirect via AWS Amplify
- Uses Authorization Code Flow with PKCE

---

## Auth Components

### AuthCallback

- Handles `/callback` route
- Exchanges authorization code for tokens via Amplify
- Redirects to `/onboarding` (first-time) or `/dashboard` (returning)
- Shows loading state during token exchange
- Handles errors with user-friendly message

### ProtectedRoute

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}
```

- Checks auth state via `useAuth` hook
- Shows loading spinner while checking
- Redirects to `/` if not authenticated

---

## Onboarding Form

### UserInputForm (Multi-step)

5 steps with progress indicator.

#### Progress Indicator

- Horizontal bar with 5 numbered circles
- Active: `#00ff88` fill, inactive: `#222` border
- Connecting line between circles
- Step labels below each circle

#### Step 1: Personal Info

```typescript
const personalInfoSchema = z.object({
  age: z.number().min(16).max(80),
  gender: z.enum(['male', 'female', 'other']),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(35).max(200),
});
```

#### Step 2: Fitness Profile

```typescript
const fitnessProfileSchema = z.object({
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  goal: z.enum(['muscle_gain', 'fat_loss', 'strength', 'endurance']),
  daysPerWeek: z.number().min(2).max(6),
  sessionDurationMin: z.enum([30, 45, 60, 75, 90]),
});
```

- Level: 3 selectable cards (Beginner / Intermediate / Advanced)
- Goal: 4 selectable cards with icons
- Days: slider or number stepper
- Duration: segmented control

#### Step 3: Equipment & Injuries

```typescript
const equipmentSchema = z.object({
  equipment: z.array(z.string()).min(1),
  injuries: z.array(z.string()).optional(),
});
```

- Equipment: checkbox grid (barbell, dumbbells, cables, machines, etc.)
- Injuries: multi-select or tag input

#### Step 4: Preferences

```typescript
const preferencesSchema = z.object({
  splitType: z.enum(['upper_lower', 'push_pull_legs', 'full_body', 'bro_split']),
  cardioIncluded: z.boolean(),
  preferredCardio: z.string().optional(),
});
```

#### Step 5: Review

- Summary of all inputs in terminal-style display
- Edit buttons per section
- Final submit button: "Generate My Plan →"

#### Form Styling

- All inputs: bg `#111`, border `1px #222`, text `#f0f0f0`
- Focus: `border-color #00ff88`, `box-shadow 0 0 0 2px rgba(0,255,136,0.1)`
- Labels: Inter 500, `0.85rem`, `#888`, uppercase, tracking `1px`
- Error messages: `#ff4444`, `0.8rem`
- Buttons: consistent with landing page CTA style

---

## Animation Specs (Framer Motion)

### Scroll Reveal (reusable)

```typescript
const scrollReveal = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};
```

### Bar Chart Animation

- On viewport entry, animate each bar height from 0 to target
- Stagger: `100ms` per bar
- Duration: `0.5s`
- Ease: `easeOut`
