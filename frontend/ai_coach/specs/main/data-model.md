# Data Model: IRON MIND Frontend

**Date**: 2026-04-13  
**Plan**: `specs/main/plan.md`

---

## Overview

These are the **frontend TypeScript types** that represent data flowing through
the application. They mirror the shapes returned by / sent to the REST API.
The frontend does NOT own a database — these are interface contracts for
in-memory state and API communication.

---

## Core Entities

### UserProfile

Represents the authenticated user's profile returned from the API.

```typescript
// types/user.ts
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;           // ISO 8601
  hasCompletedOnboarding: boolean;
}
```

**Relationships**: One-to-one with `OnboardingInput`. One-to-many with
`WorkoutPlan`.

---

### OnboardingInput

The full user fitness input collected during the onboarding form. Composed
of 4 sub-schemas validated per step.

```typescript
// types/onboarding.ts
export interface PersonalInfo {
  age: number;                 // 16–80
  gender: 'male' | 'female' | 'other';
  heightCm: number;           // 120–230
  weightKg: number;           // 35–200
}

export interface FitnessProfile {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goal: 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance';
  daysPerWeek: number;        // 2–6
  sessionDurationMin: 30 | 45 | 60 | 75 | 90;
}

export interface EquipmentAndLimitations {
  equipment: string[];         // min 1 item
  injuries?: string[];
}

export interface Preferences {
  splitType: 'upper_lower' | 'push_pull_legs' | 'full_body' | 'bro_split';
  cardioIncluded: boolean;
  preferredCardio?: string;
}

export interface OnboardingInput {
  personalInfo: PersonalInfo;
  fitnessProfile: FitnessProfile;
  equipment: EquipmentAndLimitations;
  preferences: Preferences;
}
```

**Validation**: Each sub-interface has a corresponding Zod schema (see
component spec). Validation runs per-step in the multi-step form.

**State Transitions**:
```
Draft (in-progress form) → Submitted (POST to API) → Confirmed (API returns profile)
```

---

### WorkoutPlan

The AI-generated workout plan returned by the API.

```typescript
// types/workout.ts
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number | string;       // e.g. 12 or "8-12"
  weightKg: number | null;     // null for bodyweight
  rpe: number | null;          // 1–10 Rating of Perceived Exertion
  notes?: string;
  previousWeightKg?: number;   // for progressive overload comparison
}

export interface WorkoutDay {
  dayNumber: number;           // 1-based
  label: string;               // e.g. "Push Day", "Upper Body A"
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  weekNumber: number;
  status: 'generating' | 'ready' | 'error';
  createdAt: string;           // ISO 8601
  days: WorkoutDay[];
}
```

**Relationships**: Belongs to `UserProfile`. Contains ordered `WorkoutDay`
entries, each containing ordered `Exercise` entries.

**State Transitions**:
```
Generating (POST /generate) → Ready (plan populated) → Viewed (dashboard display)
                            → Error (generation failed)
```

---

### AuthState

In-memory authentication state managed by `AuthProvider`.

```typescript
// types/auth.ts
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
}
```

**Notes**:
- Tokens are NOT stored in this type — they live inside Amplify's internal
  memory store.
- `fetchAuthSession()` is called to get tokens on-demand for API calls.
- `isLoading` is `true` during initial session check and during
  callback token exchange.

---

## Enum / Constant Types

```typescript
// types/enums.ts
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type FitnessGoal = 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance';
export type SplitType = 'upper_lower' | 'push_pull_legs' | 'full_body' | 'bro_split';
export type SessionDuration = 30 | 45 | 60 | 75 | 90;
export type PlanStatus = 'generating' | 'ready' | 'error';
```

---

## Static Data Types

```typescript
// types/landing.ts
export interface StatItem {
  value: string;
  label: string;
}

export interface BenefitCard {
  icon: string;
  title: string;
  description: string;
}

export interface StepData {
  number: number;
  title: string;
  description: string;
  details: string[];
  terminalContent: string[];
}

export interface ProgressionBar {
  week: string;
  weightKg: string;
  heightPx: number;
}
```

---

## Relationship Diagram

```
UserProfile (1) ──── (1) OnboardingInput
     │
     └──── (N) WorkoutPlan
                    │
                    └──── (N) WorkoutDay
                                  │
                                  └──── (N) Exercise
```

---

## Validation Rules Summary

| Field | Rule | Source |
|-------|------|--------|
| `age` | 16–80 | `personalInfoSchema` |
| `gender` | `male` \| `female` \| `other` | `personalInfoSchema` |
| `heightCm` | 120–230 | `personalInfoSchema` |
| `weightKg` | 35–200 | `personalInfoSchema` |
| `fitnessLevel` | 3 enum values | `fitnessProfileSchema` |
| `goal` | 4 enum values | `fitnessProfileSchema` |
| `daysPerWeek` | 2–6 | `fitnessProfileSchema` |
| `sessionDurationMin` | 30 \| 45 \| 60 \| 75 \| 90 | `fitnessProfileSchema` |
| `equipment` | min 1 item | `equipmentSchema` |
| `injuries` | optional array | `equipmentSchema` |
| `splitType` | 4 enum values | `preferencesSchema` |
| `cardioIncluded` | boolean | `preferencesSchema` |
| `preferredCardio` | optional string | `preferencesSchema` |
