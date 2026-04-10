from .prompt_builder import build_workout_prompt


from app.ports.LLM_port import LlmPort
from app.ports.repo_port import RepositoryPort


class WorkoutGenerator:
    """Class responsible for generating workout plans based on user input and preferences."""

    def __init__(self, llm_client : LlmPort, settings = None, repository: RepositoryPort | None = None):
        self.llm_client = llm_client
        self.settings = settings
        self._repository = repository

    async def generate(self, request):

        prompt = build_workout_prompt(request)

        if request.language != "en":
            prompt = f"Translate the following workout plan into {request.language}:\n\n{prompt}"

        plan = await self.llm_client.generate(prompt)
        
        if self._repository:
            await self._repository.save_workout_plan("myself", plan)
        

        return plan
