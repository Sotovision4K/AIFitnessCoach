import logging

from .prompt_builder import build_workout_prompt
from app.models.user import User
from app.ports.LLM_port import LlmPort
from app.ports.repo_port import RepositoryPort

logger = logging.getLogger(__name__)


class WorkoutGenerator:
    """Class responsible for generating workout plans based on user input and preferences."""

    def __init__(self, llm_client : LlmPort, settings = None, repository: RepositoryPort | None = None):
        self.llm_client = llm_client
        self.settings = settings
        self._repository = repository

    async def generate(self, request: User):
        prompt = build_workout_prompt(request)

        plan = await self.llm_client.generate(prompt)
        logger.info("LLM returned plan")

        if self._repository:
            await self._repository.save_workout_plan(request.userId, plan)
            logger.info("Plan saved to repository")

        return plan
