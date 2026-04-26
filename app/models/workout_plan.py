from pydantic import BaseModel, Field


class ExerciseEntry(BaseModel):
    """Represents a single exercise entry in a workout plan."""

    exercise_name: str = Field(alias="exercise")
    sets: int
    reps: int
    rpe: int | None = None
    weight_kg: float | None = None
    suggestion: str | None = None

    model_config = {"populate_by_name": True}


class SessionPlan(BaseModel):
    """Represents a single workout session in a workout plan."""

    label: str
    exercises: list[ExerciseEntry] = Field(default_factory=list)
    day_number: int | None = None


class WorkoutPlan(BaseModel):
    """Represents a workout plan consisting of multiple sessions."""

    name: str | None = None
    description: str | None = None
    sessions: list[SessionPlan] = Field(default_factory=list)
    split_type: str | None = None
    is_active: bool = True
    language: str = "en"
