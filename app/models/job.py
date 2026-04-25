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
    """Tracks the lifecycle of an async workout-generation request."""

    model_config = ConfigDict(use_enum_values=True)

    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    status: JobStatus = JobStatus.PENDING
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    updated_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    error: str | None = None
    # Optional: store the resulting plan id once complete so the client can fetch it.
    workout_plan_created_at: str | None = None
