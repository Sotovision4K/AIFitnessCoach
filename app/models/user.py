from pydantic import BaseModel, Field, field_validator
import uuid
from typing import Optional, Literal
from datetime import datetime


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    age: int
    activity_level: str
    split_type: Literal["full_body", "upper_lower", "push_pull_legs", "bro_split"]
    include_abs: bool
    language: str = "en"
    squat_1rm_kg: int | None = None
    bench_1rm_kg: int | None = None
    deadlift_1rm_kg: int | None = None
    injuries: str | None = None
    
    @field_validator("email")
    def validate_email(cls, value):
        if "@" not in value:
            raise ValueError("Invalid email address")
        return value
