from boto3.dynamodb.conditions import Key # type: ignore[import]
from decimal import Decimal
from datetime import datetime, timedelta

from app.models.user import User
from app.models.workout_plan import WorkoutPlan
from app.config import Settings
from logging import getLogger

logger = getLogger(__name__)


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
        except Exception as e:
            logger.error("Failed to save user profile: %s", e)
            raise

    async def get_last_week_workout(self):
        last_week_monday = (datetime.now() - timedelta(days=datetime.now().weekday() + 7)).date().isoformat()
        table = await self._dynamodb.Table(self._settings.DYNAMO_TABLE_NAME)
        response = await table.query(
            KeyConditionExpression=Key("created_at").gte(last_week_monday)
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
    