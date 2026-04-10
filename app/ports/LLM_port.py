from typing import Protocol

from app.models.workout_plan import WorkoutPlan

class LlmPort(Protocol):

    async def generate(self, prompt: str) -> WorkoutPlan:
        """Generates a workout plan based on the provided user data."""
        pass

    def _parse_response(self, response: str) -> WorkoutPlan:
        """Parses the response from the LLM and converts it into a structured format."""
        pass