from typing import Protocol
from app.models.workout_plan import WorkoutPlan
from app.models.user import User
from app.models.job import WorkoutJob


class RepositoryPort(Protocol):
    async def save_workout_plan(self, user_id: str, plan: WorkoutPlan) -> None:
        ...

    async def get_user_profile(self, user_id: str) -> User | None:
        ...

    async def save_user_profile(self, user_id: str, user: User) -> None:
        ...

    async def create_job(self, job: WorkoutJob) -> None:
        ...

    async def get_job(self, user_id: str, job_id: str) -> WorkoutJob | None:
        ...

    async def update_job_status(
        self, user_id, job_id, status, *, error=None, workout_plan_created_at=None
    ) -> None:
        ...

    async def get_last_workout(self, user_id: str) -> WorkoutPlan | None:
        ...

    async def get_last_week_workout(self, user_id: str) -> list[dict]:
        ...
