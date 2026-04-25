import logging

from app.adapters.dynamodb_adapters import DynamoDBAdapter
from app.adapters.llm_adapter import ClaudeAdapter
from app.config import Settings
from app.dependency import get_llm_client
from app.models.workout_plan import WorkoutPlan
from app.services.workout_generator import WorkoutGenerator

logger = logging.getLogger(__name__)


async def generate_and_save(
    user_id: str,
    settings: Settings,
    dynamodb,
    llm_client: ClaudeAdapter | None = None,
) -> WorkoutPlan:
    """
    Orchestrates workout generation for a given user:
    1. Fetches the user profile from DynamoDB
    2. Generates a workout plan via the LLM
    3. Persists the plan to DynamoDB

    `llm_client` is injected for testability; when None we use the cached
    module-level client (warm-start friendly).
    """
    repo = DynamoDBAdapter(settings, dynamodb)

    user = await repo.get_user_profile(user_id)
    if not user:
        raise ValueError(f"No profile found for user {user_id}")

    if llm_client is None:
        llm_client = get_llm_client()

    plan = await WorkoutGenerator(llm_client=llm_client, settings=settings).generate(user)
    await repo.save_workout_plan(user_id, plan)

    return plan

async def get_latest_workout_plan(settings: Settings, dynamodb, user_id: str) -> WorkoutPlan | None:
    repo = DynamoDBAdapter(settings, dynamodb)
    return await repo.get_last_workout(user_id)
