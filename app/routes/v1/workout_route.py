
from __future__ import annotations

import logging
import uuid
from datetime import date, datetime

from fastapi import APIRouter, Depends

logger = logging.getLogger(__name__)

from app.config import Settings
from app.dependency import get_settings, get_current_user, get_dynamodb_resource, CurrentUser
from app.models.workout_plan import WorkoutPlan
from app.schemas.response import ExerciseResponse, WorkoutDayResponse, WorkoutPlanClientResponse
from app.services.workout_service import generate_and_save, get_latest_workout_plan

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


@router.post("/generate", status_code=201)
async def gen_workout(
    settings: Settings = Depends(get_settings),
    current_user: CurrentUser = Depends(get_current_user),
    dynamodb=Depends(get_dynamodb_resource),
):
    logger.info("Workout generation requested for user %s", current_user.user_id)
    plan = await generate_and_save(current_user.user_id, settings, dynamodb)
    logger.info("Workout generation completed")
    client_plan = _to_client_response(plan)
    return client_plan.model_dump(by_alias=True)


@router.get("/latest", status_code=200, response_model=WorkoutPlanClientResponse, response_model_by_alias=True)
async def get_latest_workout(
    settings: Settings = Depends(get_settings),
    current_user: CurrentUser = Depends(get_current_user),
    dynamodb=Depends(get_dynamodb_resource),
):
    try:
        logger.info("Fetching latest workout for user %s", current_user.user_id)
        plan = await get_latest_workout_plan(settings, dynamodb, current_user.user_id)
        if not plan:
            return {"message": "No workout plan found"}
        client_plan = _to_client_response(plan)
    except Exception as e:
        logger.error("Error fetching latest workout for user %s: %s", current_user.user_id, e)
        return {"message": "Error fetching latest workout"}
    return client_plan