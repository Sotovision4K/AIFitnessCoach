
from __future__ import annotations

import logging
import uuid
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, status

logger = logging.getLogger(__name__)

from app.adapters.dynamodb_adapters import DynamoDBAdapter
from app.config import Settings
from app.dependency import (
    get_current_user,
    get_dynamodb_resource,
    get_event_bus,
    get_settings,
    CurrentUser,
)
from app.models.job import JobStatus, WorkoutJob
from app.models.workout_plan import WorkoutPlan
from app.ports.event_bus_port import EventBusPort
from app.schemas.response import ExerciseResponse, WorkoutDayResponse, WorkoutPlanClientResponse
from app.services.workout_service import get_latest_workout_plan

router = APIRouter()


def _to_client_response(plan: WorkoutPlan) -> WorkoutPlanClientResponse:
    """Map the internal WorkoutPlan model to the frontend-aligned response schema."""
    today = date.today()
    days = [
        WorkoutDayResponse(
            day_number=session.day_number or idx + 1,
            label=session.label,
            exercises=[
                ExerciseResponse(
                    id=str(uuid.uuid4()),
                    name=ex.exercise_name,
                    sets=ex.sets,
                    reps=ex.reps,
                    weight_kg=ex.weight_kg,
                    rpe=ex.rpe,
                    notes=ex.suggestion,
                )
                for ex in session.exercises
            ],
        )
        for idx, session in enumerate(plan.sessions)
    ]
    return WorkoutPlanClientResponse(
        id=str(uuid.uuid4()),
        week_number=today.isocalendar().week,
        created_at=today.isoformat(),
        days=days,
    )


@router.post("/generate", status_code=202)
async def request_workout_generation(
    settings: Settings = Depends(get_settings),
    current_user: CurrentUser = Depends(get_current_user),
    dynamodb=Depends(get_dynamodb_resource),
    event_bus: EventBusPort = Depends(get_event_bus),
):
    """Enqueue a workout-generation job.

    Flow:
      1. Insert a PENDING job row (so the client has something to poll).
      2. Publish a `WorkoutGenerationRequested` event to EventBridge.
      3. Return 202 + jobId. The Lambda worker picks up the event and runs
         the actual LLM generation asynchronously.
    """
    repo = DynamoDBAdapter(settings, dynamodb)
    job = WorkoutJob(user_id=current_user.user_id)

    await repo.create_job(job)
    logger.info(
        "Created workout job job_id=%s user_id=%s",
        job.job_id,
        current_user.user_id,
    )

    try:
        await event_bus.publish(
            detail_type=settings.EVENT_DETAIL_TYPE_GENERATE,
            detail={
                "jobId": job.job_id,
                "userId": current_user.user_id,
                "requestedAt": job.created_at,
            },
        )
    except Exception:
        # Best-effort mark the job as failed so the client doesn't poll forever.
        await repo.update_job_status(
            current_user.user_id,
            job.job_id,
            JobStatus.FAILED,
            error="Failed to enqueue generation event",
        )
        raise

    return {
        "jobId": job.job_id,
        "status": job.status,
        "statusUrl": f"/api/v1/workout/jobs/{job.job_id}",
    }


@router.get("/jobs/{job_id}", status_code=200)
async def get_job(
    job_id: str,
    settings: Settings = Depends(get_settings),
    current_user: CurrentUser = Depends(get_current_user),
    dynamodb=Depends(get_dynamodb_resource),
):
    repo = DynamoDBAdapter(settings, dynamodb)
    job = await repo.get_job(current_user.user_id, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    return job.model_dump()


@router.get("/latest", status_code=200, response_model=WorkoutPlanClientResponse, response_model_by_alias=True)
async def get_latest_workout(
    settings: Settings = Depends(get_settings),
    current_user: CurrentUser = Depends(get_current_user),
    dynamodb=Depends(get_dynamodb_resource),
):
    plan = await get_latest_workout_plan(settings, dynamodb, current_user.user_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No workout plan found",
        )
    return _to_client_response(plan)