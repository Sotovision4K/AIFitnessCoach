

from typing import Protocol


class RepositoryPort(Protocol):

    async def save_workout_plan(self, user_id: str, workout_plan: str):
        """Saves the generated workout plan for a user."""
        pass

    async def get_last_week_workout(self):
        """Retrieves workout plans generated in the last week."""
        pass