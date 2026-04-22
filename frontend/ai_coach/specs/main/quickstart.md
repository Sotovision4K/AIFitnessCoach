# Quickstart: IRON MIND Frontend

**Date**: 2026-04-13  
**Plan**: `specs/main/plan.md`

---

## Prerequisites

- **Node.js** >= 20 LTS
- **npm** >= 10 (or pnpm >= 9)
- AWS Cognito User Pool configured with Hosted UI and PKCE enabled
- Backend API running (or mock server) at the URL specified by
  `VITE_API_BASE_URL`

---

## 1. Scaffold the Project

```bash
npm create vite@latest ai-coach -- --template react-ts
cd ai-coach
```

## 2. Install Dependencies

```bash
# Core
npm install react-router

# Styling
npm install tailwindcss @tailwindcss/vite

# UI primitives (shadcn/ui init)
npx shadcn@latest init

# Animation
npm install framer-motion

# Forms & validation
npm install react-hook-form @hookform/resolvers zod

# Auth
npm install aws-amplify

# Icons
npm install lucide-react
```

## 3. Configure Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

## 4. Configure Tailwind CSS 4

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

## 5. Self-Host Fonts

Download WOFF2 files and place in `public/fonts/`:

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

Declare in CSS:

```css
/* src/fonts.css (imported in index.css) */
@font-face {
  font-family: 'Orbitron';
  src: url('/fonts/orbitron-900.woff2') format('woff2');
  font-weight: 900;
  font-display: swap;
}
/* ... repeat for each weight/family */
```

## 6. Configure AWS Amplify

Create `src/lib/amplifyConfig.ts`:

```typescript
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

## 7. Environment Variables

Create `.env.local`:

```env
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_DOMAIN=ironmind.auth.us-east-1.amazoncognito.com
VITE_REDIRECT_SIGN_IN=http://localhost:5173/callback
VITE_REDIRECT_SIGN_OUT=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000
```

## 8. Run Development Server

```bash
npm run dev
```

Open `http://localhost:5173`.

## 9. Verify Setup

- [ ] Page loads with dark background (`#0a0a0a`)
- [ ] Fonts render correctly (Orbitron headings, Inter body)
- [ ] Tailwind utility classes work (`text-primary` → green text)
- [ ] React Router navigates between `/` and `/callback`
- [ ] No console errors
