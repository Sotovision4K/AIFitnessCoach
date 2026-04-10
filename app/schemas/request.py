
from typing import Self

from pydantic import BaseModel, ConfigDict, field_validator, model_validator
from enum import Enum
import re

_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"you\s+are\s+(now\s+)?a",
    r"system\s*:",
    r"<\s*/?\s*system\s*>",
    r"act\s+as\s+(if\s+)?(you|a)",
    r"pretend\s+(you|to\s+be)",
    r"forget\s+(all\s+)?(your\s+)?instructions",
    r"do\s+not\s+follow",
    r"new\s+instructions",
    r"override\s+(your|the)\s+",
]

_INJECTION_RE = re.compile(
    "|".join(_INJECTION_PATTERNS), re.IGNORECASE
)


def _check_prompt_injection(value: str, field_name: str) -> str:
    """Strip or reject input that resembles prompt manipulation."""
    if _INJECTION_RE.search(value):
        msg = f"{field_name} contains disallowed content"
        raise ValueError(msg)
    return value.strip()

class ActivityLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class SplitType(str, Enum):
    FULL_BODY = "full_body"
    UPPER_LOWER = "upper_lower"
    PUSH_PULL_LEGS = "push_pull_legs"
    BRO_SPLIT = "bro_split"

class Language(str, Enum):
    EN = "en"
    ES = "es"
    FR = "fr"
    DE = "de"
    IT = "it"
    PT = "pt"


class WorkoutGenerateRequest(BaseModel):
    """Request schema for POST /api/v1/workout/generate."""

    model_config = ConfigDict(extra="forbid")
    weight_kg: int | None = None
    height_cm: int
    age: int
    activity_level: ActivityLevel
    goals: str
    squat_1rm_kg: int | None = None
    bench_1rm_kg: int | None = None
    deadlift_1rm_kg: int | None = None
    injuries: str | None = None
    gym_days_per_week: int
    split_type: SplitType
    include_cardio: bool = True
    include_abs: bool = True
    language: Language = Language.EN

    @field_validator("height_cm")
    @classmethod
    def validate_height(cls, v: int) -> int:
        if not 100 <= v <= 250:
            msg = "height_cm must be between 100 and 250"
            raise ValueError(msg)
        return v

    @field_validator("age")
    @classmethod
    def validate_age(cls, v: int) -> int:
        if not 14 <= v <= 100:
            msg = "age must be between 14 and 100"
            raise ValueError(msg)
        return v

    @field_validator("goals")
    @classmethod
    def validate_goals(cls, v: str) -> str:
        v = _check_prompt_injection(v, "goals")
        if not 1 <= len(v) <= 500:
            msg = "goals must be between 1 and 500 characters"
            raise ValueError(msg)
        return v

    @field_validator("injuries")
    @classmethod
    def validate_injuries(cls, v: str | None) -> str | None:
        if v is None:
            return None
        v = _check_prompt_injection(v, "injuries")
        if len(v) > 300:
            msg = "injuries must be 300 characters or fewer"
            raise ValueError(msg)
        return v if v else None

    @field_validator("squat_1rm_kg")
    @classmethod
    def validate_squat(cls, v: int | None) -> int | None:
        if v is not None and not 0 <= v <= 500:
            msg = "squat_1rm_kg must be between 0 and 500"
            raise ValueError(msg)
        return v

    @field_validator("bench_1rm_kg")
    @classmethod
    def validate_bench(cls, v: int | None) -> int | None:
        if v is not None and not 0 <= v <= 300:
            msg = "bench_1rm_kg must be between 0 and 300"
            raise ValueError(msg)
        return v

    @field_validator("deadlift_1rm_kg")
    @classmethod
    def validate_deadlift(cls, v: int | None) -> int | None:
        if v is not None and not 0 <= v <= 500:
            msg = "deadlift_1rm_kg must be between 0 and 500"
            raise ValueError(msg)
        return v

    @field_validator("gym_days_per_week")
    @classmethod
    def validate_gym_days(cls, v: int) -> int:
        if not 2 <= v <= 7:
            msg = "gym_days_per_week must be between 2 and 7"
            raise ValueError(msg)
        return v

    @model_validator(mode="after")
    def validate_split_days_compatibility(self) -> Self:
        """Cap gym days if they exceed the max for a given split."""
        if (
            self.split_type == SplitType.UPPER_LOWER
            and self.gym_days_per_week > 6
        ):
            self.gym_days_per_week = 6
        return self

    @model_validator(mode="after")
    def validate_beginner_1rm(self) -> Self:
        """If beginner, clear any provided 1RM values (they're ignored)."""
        if self.activity_level == ActivityLevel.BEGINNER:
            self.squat_1rm_kg = None
            self.bench_1rm_kg = None
            self.deadlift_1rm_kg = None
        return self
