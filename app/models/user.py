from pydantic import BaseModel, Field, field_validator
import uuid
from typing import Optional, Literal
from enum import Enum
from datetime import datetime

class Goal(str, Enum):
    MUSCLE_GAIN = "muscle_gain"
    FAT_LOSS = "fat_loss"
    ENDURANCE = "endurance"
    STRENGTH = "strength"

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class FitnessLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class GymAccessType(str, Enum):
    FULL_GYM = "full_gym"
    HOME_GYM = "home_gym"
    NO_EQUIPMENT = "no_equipment"

class SplitType(str, Enum):
    FULL_BODY = "full_body"
    UPPER_LOWER = "upper_lower"
    PUSH_PULL_LEGS = "push_pull_legs"
    BRO_SPLIT = "bro_split"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str | None = Field(default=None, max_length=100)
    email: str | None = Field(default=None, max_length=100)

    # personalInfo
    age: int
    gender: Gender
    height_cm: float = Field(alias="heightCm")
    weight_kg: float = Field(alias="weightKg")

    # fitnessProfile
    fitness_level: FitnessLevel = Field(alias="fitnessLevel")
    goal: Goal
    days_per_week: int = Field(alias="daysPerWeek")
    session_duration_min: int = Field(alias="sessionDurationMin")

    # equipment
    gym_access_type: GymAccessType = Field(alias="gymAccessType")
    equipment: list[str] = Field(default_factory=list)
    include_abs: bool = Field(alias="includeAbs")
    injuries: list[str] = Field(default_factory=list)

    # preferences
    split_type: SplitType = Field(alias="splitType")
    cardio_included: bool = Field(alias="cardioIncluded")
    preferred_cardio: str = Field(alias="preferredCardio", default="")
    additional_comments: str = Field(alias="additionalComments", default="")

    language: str = "en"
    squat_1rm_kg: int | None = Field(alias="squatKg", default=None)
    bench_1rm_kg: int | None = Field(alias="benchKg", default=None)
    deadlift_1rm_kg: int | None = Field(alias="deadliftKg", default=None)
    

    @field_validator("email")
    def validate_email(cls, value):
        if value is not None and "@" not in value:
            raise ValueError("Invalid email address")


    @field_validator("additional_comments")
    def validate_additional_comments(cls, value):
        max_length = 500
        if len(value) > max_length:
            raise ValueError(f"Additional comments must not exceed {max_length} characters")
        return value.strip()
