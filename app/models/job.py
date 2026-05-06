from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class WorkoutJob(BaseModel):
    """Tracks the lifecycle of an async workout-generation request.

    Field aliases match the DynamoDB Jobs table attribute names (camelCase).
    Use `model_dump(by_alias=True)` when persisting.
    """

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)

    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="jobId")
    user_id: str = Field(alias="userId")
    status: JobStatus = JobStatus.PENDING
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        alias="createdAt",
    )
    updated_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        alias="updatedAt",
    )
    error: str | None = None
    # Optional: store the resulting plan id once complete so the client can fetch it.
    workout_plan_created_at: str | None = Field(
        default=None, alias="workoutPlanCreatedAt"
    )
