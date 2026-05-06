import logging
from datetime import datetime, timezone

from app.adapters.dynamodb_adapters import DynamoDBAdapter
from app.adapters.llm_adapter import ClaudeAdapter
from app.config import Settings
from app.dependency import get_llm_client
from app.models.workout_plan import ExerciseEntry, SessionPlan, WorkoutPlan
from app.services.workout_generator import WorkoutGenerator

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Test fixture
# ---------------------------------------------------------------------------
# Hard-coded plan used when STUB_LLM=true (or settings.STUB_LLM). Lets us
# exercise the full worker / DynamoDB / job-status flow locally without
# burning Anthropic tokens on every invocation.
_STUB_PLAN = WorkoutPlan(
    name="Stub Upper/Lower 4-day",
    description="Local-test fixture; does not call the LLM.",
    split_type="upper_lower",
    is_active=True,
    language="en",
    created_at=datetime.now(timezone.utc).isoformat(),
    sessions=[
        SessionPlan(
            label="Upper A",
            day_number=1,
            exercises=[
                ExerciseEntry(
                    exercise="Bench Press",
                    sets=4,
                    reps=6,
                    rpe=8,
                    weight_kg=75.0,
                    suggestion="Primary compound lift. Focus on controlled descent and explosive drive. Progressive overload target: add 2.5kg when 4x6 achieved.",
                ),
                ExerciseEntry(
                    exercise="Incline Dumbbell Press",
                    sets=3,
                    reps=8,
                    rpe=8,
                    weight_kg=32.0,
                    suggestion="Complementary pressing movement. Targets upper chest and front delts.",
                ),
                ExerciseEntry(
                    exercise="Barbell Rows",
                    sets=4,
                    reps=6,
                    rpe=8,
                    weight_kg=85.0,
                    suggestion="Heavy horizontal pull. Maintain neutral spine. Progressive overload priority.",
                ),
                ExerciseEntry(
                    exercise="Pull-ups",
                    sets=3,
                    reps=8,
                    rpe=8,
                    weight_kg=0.0,
                    suggestion="Vertical pull. Add weight belt if bodyweight becomes easy.",
                ),
                ExerciseEntry(
                    exercise="Dumbbell Flyes",
                    sets=3,
                    reps=10,
                    rpe=7,
                    weight_kg=20.0,
                    suggestion="Chest isolation. Stretch and squeeze at peak contraction.",
                ),
                ExerciseEntry(
                    exercise="Face Pulls",
                    sets=3,
                    reps=12,
                    rpe=6,
                    weight_kg=25.0,
                    suggestion="Rear delt and shoulder health. High reps for shoulder stability.",
                ),
                ExerciseEntry(
                    exercise="Hanging Leg Raises",
                    sets=3,
                    reps=12,
                    rpe=7,
                    weight_kg=0.0,
                    suggestion="Core strength. Control the movement, avoid swinging.",
                ),
            ],
        ),
        SessionPlan(
            label="Lower A",
            day_number=2,
            exercises=[
                ExerciseEntry(
                    exercise="Squat",
                    sets=4,
                    reps=6,
                    rpe=8,
                    weight_kg=100.0,
                    suggestion="Primary lower compound. Deep, controlled reps. Progressive overload target: add 2.5kg when 4x6 achieved.",
                ),
                ExerciseEntry(
                    exercise="Front Squat",
                    sets=3,
                    reps=8,
                    rpe=7,
                    weight_kg=70.0,
                    suggestion="Complementary quad-dominant squat variation. Builds quad strength.",
                ),
                ExerciseEntry(
                    exercise="Romanian Deadlift",
                    sets=3,
                    reps=8,
                    rpe=7,
                    weight_kg=110.0,
                    suggestion="Posterior chain emphasis. Hinge at hips, slight knee bend.",
                ),
                ExerciseEntry(
                    exercise="Leg Press",
                    sets=3,
                    reps=10,
                    rpe=7,
                    weight_kg=200.0,
                    suggestion="Secondary quad builder. Full range of motion.",
                ),
                ExerciseEntry(
                    exercise="Leg Curls",
                    sets=3,
                    reps=10,
                    rpe=7,
                    weight_kg=80.0,
                    suggestion="Hamstring isolation. Control the eccentric.",
                ),
                ExerciseEntry(
                    exercise="Cable Crunches",
                    sets=3,
                    reps=12,
                    rpe=7,
                    weight_kg=40.0,
                    suggestion="Core strength with resistance. Squeeze at contraction.",
                ),
                ExerciseEntry(
                    exercise="Running",
                    sets=1,
                    reps=20,
                    rpe=5,
                    weight_kg=0.0,
                    suggestion="Light steady-state cardio. 20 minutes at conversational pace for recovery.",
                ),
            ],
        ),
        SessionPlan(
            label="Upper B",
            day_number=3,
            exercises=[
                ExerciseEntry(
                    exercise="Overhead Press",
                    sets=4,
                    reps=6,
                    rpe=8,
                    weight_kg=55.0,
                    suggestion="Primary compound lift. Full body tension. Progressive overload target: add 2.5kg when 4x6 achieved.",
                ),
                ExerciseEntry(
                    exercise="Dumbbell Shoulder Press",
                    sets=3,
                    reps=8,
                    rpe=8,
                    weight_kg=28.0,
                    suggestion="Unilateral pressing variation. Greater range of motion.",
                ),
                ExerciseEntry(
                    exercise="Deadlift",
                    sets=3,
                    reps=5,
                    rpe=8,
                    weight_kg=120.0,
                    suggestion="Heavy posterior chain pull. Perfect form priority. Progressive overload target.",
                ),
                ExerciseEntry(
                    exercise="Seal Rows",
                    sets=3,
                    reps=8,
                    rpe=8,
                    weight_kg=70.0,
                    suggestion="Horizontal pull variation. Chest-supported for lat isolation.",
                ),
                ExerciseEntry(
                    exercise="Lateral Raises",
                    sets=3,
                    reps=12,
                    rpe=7,
                    weight_kg=14.0,
                    suggestion="Shoulder width development. Controlled tempo.",
                ),
                ExerciseEntry(
                    exercise="Barbell Curls",
                    sets=3,
                    reps=8,
                    rpe=7,
                    weight_kg=40.0,
                    suggestion="Bicep development. Strict form, no momentum.",
                ),
                ExerciseEntry(
                    exercise="Ab Wheel Rollouts",
                    sets=3,
                    reps=10,
                    rpe=8,
                    weight_kg=0.0,
                    suggestion="Advanced core strength. Maintain neutral spine throughout.",
                ),
            ],
        ),
        SessionPlan(
            label="Lower B",
            day_number=4,
            exercises=[
                ExerciseEntry(
                    exercise="Deadlift",
                    sets=3,
                    reps=5,
                    rpe=8,
                    weight_kg=120.0,
                    suggestion="Heavy posterior chain pull. Perfect form priority. Progressive overload target.",
                ),
                ExerciseEntry(
                    exercise="Leg Press",
                    sets=3,
                    reps=8,
                    rpe=8,
                    weight_kg=220.0,
                    suggestion="Secondary quad builder with heavier load. Full range of motion.",
                ),
                ExerciseEntry(
                    exercise="Bulgarian Split Squat",
                    sets=3,
                    reps=8,
                    rpe=7,
                    weight_kg=28.0,
                    suggestion="Unilateral quad and glute work. Improves balance and stability.",
                ),
                ExerciseEntry(
                    exercise="Leg Curls",
                    sets=3,
                    reps=12,
                    rpe=7,
                    weight_kg=75.0,
                    suggestion="Hamstring isolation. Higher reps for muscle pump.",
                ),
                ExerciseEntry(
                    exercise="Calf Raises",
                    sets=3,
                    reps=12,
                    rpe=7,
                    weight_kg=100.0,
                    suggestion="Calf development. Full range of motion, pause at top.",
                ),
                ExerciseEntry(
                    exercise="Decline Sit-ups",
                    sets=3,
                    reps=15,
                    rpe=7,
                    weight_kg=0.0,
                    suggestion="Core strength and definition. Controlled tempo.",
                ),
                ExerciseEntry(
                    exercise="Running",
                    sets=1,
                    reps=25,
                    rpe=6,
                    weight_kg=0.0,
                    suggestion="Moderate steady-state cardio. 25 minutes at moderate intensity for conditioning.",
                ),
            ],
        ),
    ],
)


def _stub_enabled(settings: Settings) -> bool:
    """Stub the LLM when settings.STUB_LLM is truthy or env STUB_LLM=true.

    Avoids burning Anthropic tokens during local/integration testing.
    """
    flag = getattr(settings, "STUB_LLM", None)
    if flag is not None:
        return bool(flag)
    import os

    return os.environ.get("STUB_LLM", "").lower() in ("1", "true", "yes")


async def generate_and_save(
    user_id: str,
    settings: Settings,
    dynamodb,
    llm_client: ClaudeAdapter | None = None,
) -> WorkoutPlan:
    """
    Orchestrates workout generation for a given user:
    1. Fetches the user profile from DynamoDB
    2. Generates a workout plan via the LLM (or returns the stub fixture)
    3. Persists the plan to DynamoDB

    `llm_client` is injected for testability; when None we use the cached
    module-level client (warm-start friendly).
    """
    repo = DynamoDBAdapter(settings, dynamodb)

    user = await repo.get_user_profile(user_id)
    if not user:
        raise ValueError(f"No profile found for user {user_id}")

    if _stub_enabled(settings):
        logger.info("STUB_LLM enabled — skipping LLM call user_id=%s", user_id)
        plan = _STUB_PLAN.model_copy(
            update={"created_at": datetime.now(timezone.utc).isoformat()}
        )
    else:
        if llm_client is None:
            llm_client = get_llm_client()
        plan = await WorkoutGenerator(
            llm_client=llm_client, settings=settings
        ).generate(user)

    await repo.save_workout_plan(user_id, plan)

    return plan


async def get_latest_workout_plan(
    settings: Settings, dynamodb, user_id: str
) -> WorkoutPlan | None:
    repo = DynamoDBAdapter(settings, dynamodb)
    return await repo.get_last_workout(user_id)
