from boto3.dynamodb.conditions import Key # type: ignore[import]

from app.models.workout_plan import WorkoutPlan
from app.config import Settings
from app.dependency import get_session, get_settings

from datetime import datetime, timedelta


class DynamoDBAdapter:

    def __init__(self, settings: Settings):
        self._settings = settings
        self._session = get_session()

    def _resource(self):
        """Return an async context manager for the DynamoDB resource."""
        return self._session.resource(
            "dynamodb",
            endpoint_url=self._settings.DYNAMODB_ENDPOINT,
            region_name=self._settings.AWS_REGION,
            aws_access_key_id=self._settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=self._settings.AWS_SECRET_ACCESS_KEY,
        )

    async def save_workout_plan(self, user_id: str, workout_plan: WorkoutPlan):
        async with self._resource() as dynamodb:
            table = await dynamodb.Table(self._settings.DYNAMO_TABLE_NAME)
            await table.put_item(
                Item={
                    "user_id": user_id,
                    "workout_plan": workout_plan.model_dump(),
                }
            )
        return {"message": "Workout plan saved successfully!"}

    async def get_last_week_workout(self):
        last_week_monday = (datetime.now() - timedelta(days=datetime.now().weekday() + 7)).isoformat()
        async with self._resource() as dynamodb:
            table = await dynamodb.Table(self._settings.DYNAMO_TABLE_NAME)
            response = await table.query(
                KeyConditionExpression=Key("created_at").gte(last_week_monday)
            )
        return response.get("Items", [])