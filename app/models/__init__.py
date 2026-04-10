import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class WorkoutPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator("name")
    def validate_name(cls, value):
        if not value.strip():
            raise ValueError("Name cannot be empty")
        return value