from boto3.dynamodb.conditions import Key  # type: ignore[import]
from decimal import Decimal
from datetime import datetime, timedelta, timezone
import logging

from app.models.user import User
from app.models.workout_plan import WorkoutPlan
from app.models.job import WorkoutJob, JobStatus
from app.config import Settings

logger = logging.getLogger(__name__)


def _floats_to_decimal(obj):
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, dict):
        return {k: _floats_to_decimal(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_floats_to_decimal(v) for v in obj]
    return obj


def _decimals_to_float(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, dict):
        return {k: _decimals_to_float(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_decimals_to_float(v) for v in obj]
    return obj


class DynamoDBAdapter:
    def __init__(self, settings: Settings, dynamodb):
        self._settings = settings
        self._dynamodb = dynamodb

    async def save_workout_plan(self, user_id: str, workout_plan: WorkoutPlan):
        table = await self._dynamodb.Table(self._settings.DYNAMO_TABLE_NAME)
        today_without_time = datetime.now().date().isoformat()
        await table.put_item(
            Item={
                "userId": user_id,
                "workout_plan": _floats_to_decimal(workout_plan.model_dump()),
                "created_at": today_without_time,
            }
        )
        return {"message": "Workout plan saved successfully!"}

    async def get_user_profile(self, user_id: str) -> User | None:
        table = await self._dynamodb.Table(self._settings.USERS_TABLE_NAME)
        response = await table.get_item(Key={"userId": user_id})
        item = response.get("Item")
        if item:
            return User.model_validate(item)
        return None

    async def save_user_profile(self, user_id: str, user: User):
        try:

            item = _floats_to_decimal(user.model_dump(by_alias=True))
            table = await self._dynamodb.Table(self._settings.USERS_TABLE_NAME)

            name_map = {f"#{k}": k for k in item.keys()}
            value_map = {f":{k}": v for k, v in item.items()}
            update_expr = "SET " + ", ".join(f"#{k}=:{k}" for k in item.keys())

            await table.update_item(
                Key={"userId": user_id},
                UpdateExpression=update_expr,
                ExpressionAttributeNames=name_map,
                ExpressionAttributeValues=value_map,
                ReturnValues="UPDATED_NEW",
            )
            return {"message": "User profile saved successfully!"}
        except Exception:
            logger.exception("save_user_profile_failed user_id=%s", user_id)
            raise

    async def get_last_week_workout(self, user_id: str) -> list[dict]:
        """Return this user's workouts created since last Monday.

        SECURITY: Always scope by user_id. Never query DynamoDB cross-tenant
        on a global secondary key alone.
        """
        last_week_monday = (
            (datetime.now() - timedelta(days=datetime.now().weekday() + 7))
            .date()
            .isoformat()
        )
        table = await self._dynamodb.Table(self._settings.DYNAMO_TABLE_NAME)
        response = await table.query(
            KeyConditionExpression=Key("userId").eq(user_id)
            & Key("created_at").gte(last_week_monday),
        )
        return response.get("Items", [])

    async def get_last_workout(self, user_id: str) -> WorkoutPlan | None:
        table = await self._dynamodb.Table(self._settings.DYNAMO_TABLE_NAME)
        response = await table.query(
            KeyConditionExpression=Key("userId").eq(user_id),
            ScanIndexForward=False,  # descending by sort key → most recent first
            Limit=1,
        )
        items = response.get("Items", [])
        if not items:
            return None
        raw_plan = _decimals_to_float(items[0].get("workout_plan", {}))
        return WorkoutPlan.model_validate(raw_plan)

    # ------------------------------------------------------------------
    # Workout-job lifecycle (async generation pipeline)
    # ------------------------------------------------------------------

    async def create_job(self, job: WorkoutJob) -> None:
        """Insert a PENDING job. Idempotent on jobId via condition expression."""
        table = await self._dynamodb.Table(self._settings.JOBS_TABLE_NAME)
        await table.put_item(
            Item=_floats_to_decimal(job.model_dump()),
            ConditionExpression="attribute_not_exists(job_id)",
        )

    async def get_job(self, user_id: str, job_id: str) -> WorkoutJob | None:
        table = await self._dynamodb.Table(self._settings.JOBS_TABLE_NAME)
        response = await table.get_item(Key={"user_id": user_id, "job_id": job_id})
        item = response.get("Item")
        if not item:
            return None
        return WorkoutJob.model_validate(_decimals_to_float(item))

    async def update_job_status(
        self,
        user_id: str,
        job_id: str,
        status: JobStatus,
        error: str | None = None,
        workout_plan_created_at: str | None = None,
    ) -> None:
        table = await self._dynamodb.Table(self._settings.JOBS_TABLE_NAME)
        now = datetime.now(timezone.utc).isoformat()

        update_parts = ["#s = :s", "#u = :u"]
        names: dict = {"#s": "status", "#u": "updated_at"}
        values: dict = {":s": status.value, ":u": now}

        if error is not None:
            update_parts.append("#e = :e")
            names["#e"] = "error"
            values[":e"] = error[:500]  # cap stored error length
        if workout_plan_created_at is not None:
            update_parts.append("#w = :w")
            names["#w"] = "workout_plan_created_at"
            values[":w"] = workout_plan_created_at

        await table.update_item(
            Key={"user_id": user_id, "job_id": job_id},
            UpdateExpression="SET " + ", ".join(update_parts),
            ExpressionAttributeNames=names,
            ExpressionAttributeValues=values,
        )
