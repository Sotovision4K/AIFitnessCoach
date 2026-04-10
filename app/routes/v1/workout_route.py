
from __future__ import annotations

from fastapi import APIRouter, Depends
from anthropic import Anthropic

from app.adapters.llm_adapter import ClaudeAdapter
from app.config import Settings
from app.dependency import get_settings
from app.schemas.request import WorkoutGenerateRequest
from app.services.workout_generator import WorkoutGenerator
from json import loads

from app.adapters.dynamodb_adapters import DynamoDBAdapter
router = APIRouter()

def _get_repository(settings: Settings = Depends(get_settings))-> DynamoDBAdapter:
    return DynamoDBAdapter(settings)

@router.post("/generate", status_code=201)
async def gen_workout(
    request: WorkoutGenerateRequest,
    settings: Settings = Depends(get_settings),
):
    llm_client = ClaudeAdapter(
        anthropic_api_key=settings.ANTHROPIC_API_KEY,
        anthropic_api_model=settings.ANTHROPIC_API_MODEL,
        max_tokens=settings.MAX_TOKENS,
        temperature=settings.temp,
    )
    workout_generator = WorkoutGenerator(llm_client=llm_client, settings=settings)
    plan = await workout_generator.generate(request)

    return {"message": "Workout generated successfully!", "workout_plan": plan}