"""Pydantic response schemas for API endpoints."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ExerciseEntryResponse(BaseModel):
    """A single exercise in a session."""

    exercise: str
    reps: int
    sets: int
    rpe: int
    weight_kg: int
    suggestion: str


class TrainingSessionResponse(BaseModel):
    """A single day's workout."""

    label: str
    day_number: int
    exercises: list[ExerciseEntryResponse]


class WorkoutPlanResponse(BaseModel):
    """Full workout plan response."""

    plan_id: str
    iso_week: str
    split_type: str
    language: str
    sessions: list[TrainingSessionResponse]


class WorkoutPlanHistoryItem(BaseModel):
    """Single plan in history list."""

    plan_id: str
    iso_week: str
    split_type: str
    language: str
    created_at: str
    sessions: list[TrainingSessionResponse]


class PlanHistoryResponse(BaseModel):
    """Paginated plan history response."""

    plans: list[WorkoutPlanHistoryItem]
    next_cursor: str | None = None


class ProfileResponse(BaseModel):
    """Response after profile upsert."""

    message: str
    user_id: str


# --- Frontend-aligned workout response (matches frontend/ai_coach/src/types/workout.ts) ---


class ExerciseResponse(BaseModel):
    id: str
    name: str
    sets: int
    reps: int
    weight_kg: float | None = Field(serialization_alias="weightKg", default=None)
    rpe: int | None = None
    notes: str | None = None
    previous_weight_kg: float | None = Field(
        serialization_alias="previousWeightKg", default=None
    )

    model_config = {"populate_by_name": True}


class WorkoutDayResponse(BaseModel):
    day_number: int = Field(serialization_alias="dayNumber")
    label: str
    exercises: list[ExerciseResponse]

    model_config = {"populate_by_name": True}


class WorkoutPlanClientResponse(BaseModel):
    id: str
    week_number: int = Field(serialization_alias="weekNumber")
    status: str = "ready"
    created_at: str = Field(serialization_alias="createdAt")
    days: list[WorkoutDayResponse]

    model_config = {"populate_by_name": True}


class ErrorResponse(BaseModel):
    """Standard error response."""

    error: str
    message: str
