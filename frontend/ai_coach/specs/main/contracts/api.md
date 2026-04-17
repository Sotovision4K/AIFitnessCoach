# API Contracts: IRON MIND Frontend

**Date**: 2026-04-13  
**Plan**: `specs/main/plan.md`

These contracts document the REST API endpoints the frontend consumes.
The frontend does NOT implement these endpoints — it calls them with
`Authorization: Bearer <id_token>` headers.

---

## Base URL

```
VITE_API_BASE_URL (environment variable)
```

All endpoints are prefixed with `/api/v1`.

---

## Authentication

All protected endpoints require:

```
Authorization: Bearer <cognito_id_token>
```

The ID token is obtained from `fetchAuthSession()` via AWS Amplify.

---

## Endpoints

### GET /api/v1/health

**Auth Required**: No

**Response** `200`:
```json
{
  "status": "ok",
  "timestamp": "2026-04-13T12:00:00Z"
}
```

---

### GET /api/v1/profile

**Auth Required**: Yes

**Response** `200`:
```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2026-04-13T10:00:00Z",
  "hasCompletedOnboarding": true
}
```

**Response** `401`:
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Frontend Type**: `UserProfile`

---

### PUT /api/v1/profile/input

**Auth Required**: Yes

**Request Body**:
```json
{
  "personalInfo": {
    "age": 28,
    "gender": "male",
    "heightCm": 180,
    "weightKg": 82
  },
  "fitnessProfile": {
    "fitnessLevel": "intermediate",
    "goal": "muscle_gain",
    "daysPerWeek": 4,
    "sessionDurationMin": 60
  },
  "equipment": {
    "equipment": ["barbell", "dumbbells", "cables", "pull_up_bar"],
    "injuries": ["lower_back"]
  },
  "preferences": {
    "splitType": "upper_lower",
    "cardioIncluded": true,
    "preferredCardio": "incline_walk"
  }
}
```

**Response** `200`:
```json
{
  "success": true,
  "message": "Input saved successfully"
}
```

**Response** `400`:
```json
{
  "error": "ValidationError",
  "message": "Invalid input",
  "details": [
    { "field": "personalInfo.age", "message": "Must be between 16 and 80" }
  ]
}
```

**Frontend Type (request)**: `OnboardingInput`

---

### GET /api/v1/workout/latest

**Auth Required**: Yes

**Response** `200`:
```json
{
  "id": "plan_xyz789",
  "weekNumber": 3,
  "status": "ready",
  "createdAt": "2026-04-13T08:00:00Z",
  "days": [
    {
      "dayNumber": 1,
      "label": "Upper Body A",
      "exercises": [
        {
          "id": "ex_001",
          "name": "Bench Press",
          "sets": 4,
          "reps": "8-10",
          "weightKg": 80,
          "rpe": 8,
          "notes": "Focus on controlled eccentric",
          "previousWeightKg": 77.5
        }
      ]
    }
  ]
}
```

**Response** `200` (generating):
```json
{
  "id": "plan_xyz790",
  "weekNumber": 4,
  "status": "generating",
  "createdAt": "2026-04-13T12:00:00Z",
  "days": []
}
```

**Response** `404`:
```json
{
  "error": "NotFound",
  "message": "No workout plan found. Complete onboarding first."
}
```

**Frontend Type**: `WorkoutPlan`

---

### GET /api/v1/workout/:planId

**Auth Required**: Yes

**Path Parameters**:
- `planId`: string (e.g. `plan_xyz789`)

**Response** `200`: Same shape as `GET /api/v1/workout/latest`.

**Response** `404`:
```json
{
  "error": "NotFound",
  "message": "Plan not found"
}
```

**Frontend Type**: `WorkoutPlan`

---

### POST /api/v1/workout/generate

**Auth Required**: Yes

**Request Body**: None (uses saved profile input)

**Response** `202`:
```json
{
  "planId": "plan_xyz790",
  "status": "generating",
  "message": "Plan generation started"
}
```

**Response** `409`:
```json
{
  "error": "Conflict",
  "message": "A plan is already being generated"
}
```

**Frontend Behavior**: After receiving `202`, poll `GET /api/v1/workout/latest`
until `status` changes from `"generating"` to `"ready"` or `"error"`.
Polling interval: 3 seconds. Max attempts: 60 (3 minutes).

---

## Error Response Shape

All error responses follow:

```typescript
interface ApiError {
  error: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}
```

## HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| `200` | Success |
| `202` | Accepted (async processing started) |
| `400` | Validation error |
| `401` | Unauthorized (missing/invalid token) |
| `404` | Resource not found |
| `409` | Conflict (duplicate operation) |
| `500` | Internal server error |
