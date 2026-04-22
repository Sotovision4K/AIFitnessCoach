import logging

from app.adapters.dynamodb_adapters import DynamoDBAdapter
from app.adapters.llm_adapter import ClaudeAdapter
from app.config import Settings
from app.models.workout_plan import WorkoutPlan
from app.services.workout_generator import WorkoutGenerator

logger = logging.getLogger(__name__)


async def generate_and_save(user_id: str, settings: Settings, dynamodb) -> WorkoutPlan:
    """
    Orchestrates workout generation for a given user:
    1. Fetches the user profile from DynamoDB
    2. Generates a workout plan via the LLM
    3. Persists the plan to DynamoDB
    Callable from the API route or directly from a Lambda.
    """
    repo = DynamoDBAdapter(settings, dynamodb)

    user = await repo.get_user_profile(user_id)
    if not user:
        raise ValueError(f"No profile found for user {user_id}")

    llm_client = ClaudeAdapter(
        anthropic_api_key=settings.ANTHROPIC_API_KEY,
        anthropic_api_model=settings.ANTHROPIC_API_MODEL,
        max_tokens=settings.MAX_TOKENS,
        temperature=settings.temp,
    )

    plan = await WorkoutGenerator(llm_client=llm_client, settings=settings).generate(user)
    await repo.save_workout_plan(user_id, plan)

    logger.info("Workout plan generated and saved for user %s", user_id)
    return plan

async def get_latest_workout_plan(settings: Settings, dynamodb, user_id: str) -> WorkoutPlan | None:
    repo = DynamoDBAdapter(settings, dynamodb)
    return await repo.get_last_workout(user_id)
