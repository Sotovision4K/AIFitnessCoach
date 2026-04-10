from boto3 import resource # type: ignore[import]
from boto3.dynamodb.conditions import Key, Attr # type: ignore[import]

from app.dependency import get_dynamodb_resource, get_dynamodb_table
from app.models.workout_plan import WorkoutPlan

from app.config import Settings

from datetime import datetime, timedelta

class DynamoDBAdapter:

    def __init__(
        self,
        settings: Settings
    ):
        self.dynamodb = get_dynamodb_resource(settings)
        self.table = get_dynamodb_table(resource=self.dynamodb, settings=settings)
    
    async def save_workout_plan(self, user_id: str, workout_plan: WorkoutPlan):

        await self.table.put_item(
            Item={
                "user_id": user_id,
                "workout_plan": workout_plan.dict()
            }
        )
        return {"message": "Workout plan saved successfully!"}

    async def get_last_week_workout(self):

        last_week_monday = (datetime.now() - timedelta(days=datetime.now().weekday() + 7)).isoformat()
        table = self.table
        response = await table.query(
            KeyConditionExpression=Key("created_at").gte(last_week_monday)
        )
        items = response.get("Items", [])
        return items