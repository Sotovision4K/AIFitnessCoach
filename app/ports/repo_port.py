

from typing import Protocol
from app.models.workout_plan import WorkoutPlan

class RepositoryPort(Protocol):

    async def save_workout_plan(self, user_id: str, workout_plan: WorkoutPlan):
        """Saves the generated workout plan for a user."""
        pass

    async def get_last_week_workout(self):
        """Retrieves workout plans generated in the last week."""
        pass