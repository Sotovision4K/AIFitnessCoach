"""Pydantic response schemas for API endpoints."""

from __future__ import annotations

from pydantic import BaseModel


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


class ErrorResponse(BaseModel):
    """Standard error response."""

    error: str
    message: str
