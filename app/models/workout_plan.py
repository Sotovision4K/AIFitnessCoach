from pydantic import BaseModel, Field


class ExerciseEntry(BaseModel):
    """Represents a single exercise entry in a workout plan."""
    exercise_name: str
    sets: int
    reps: int
    weight_kg: float | None = None
    suggestions: str | None = None
    comments: str | None = None


class SessionPlan(BaseModel):
    """Represents a single workout session in a workout plan."""
    label: str
    exercises: list[ExerciseEntry] = Field(default_factory=list)
    day_number: int | None = None

class WorkoutPlan(BaseModel):
    """Represents a workout plan consisting of multiple sessions."""
    name: str
    description: str | None = None
    sessions: list[SessionPlan] = Field(default_factory=list)
    split_type: str | None = None
    is_active: bool = True
    language: str = "en"

    