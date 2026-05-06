"""AWS Lambda worker that consumes WorkoutGenerationRequested events.

EventBridge -> this Lambda -> generate_and_save() -> update job status.

Deploy this as a separate Lambda function (different from the API Lambda).
Wire an EventBridge rule with:
    Source = "ai-coach.api"
    DetailType = "WorkoutGenerationRequested"
to this function as the target. Configure a DLQ on the rule for poison events.

Event shape (from EventBridge):
{
  "version": "0",
  "id": "...",
  "detail-type": "WorkoutGenerationRequested",
  "source": "ai-coach.api",
  "detail": {"jobId": "...", "userId": "...", "requestedAt": "..."}
}
"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

import aioboto3  # type: ignore[import]

from app.adapters.dynamodb_adapters import DynamoDBAdapter
from app.config import Settings
from app.models.job import JobStatus
from app.services.workout_service import generate_and_save

logger = logging.getLogger(__name__)


async def _process(detail: dict, settings: Settings) -> None:
    job_id = detail["jobId"]
    user_id = detail["userId"]

    if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
        session = aioboto3.Session(
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )
    else:
        session = aioboto3.Session()

    db_kwargs: dict = {"region_name": settings.AWS_REGION}
    if settings.DYNAMODB_ENDPOINT:
        db_kwargs["endpoint_url"] = settings.DYNAMODB_ENDPOINT

    async with session.resource("dynamodb", **db_kwargs) as dynamodb:
        repo = DynamoDBAdapter(settings, dynamodb)

        # Mark RUNNING (best-effort; if this fails we still try to generate)
        try:
            await repo.update_job_status(user_id, job_id, JobStatus.RUNNING)
        except Exception as e:  # noqa: BLE001
            logger.warning("Could not mark job RUNNING: %s", e)

        try:
            await generate_and_save(user_id, settings, dynamodb)
            await repo.update_job_status(
                user_id,
                job_id,
                JobStatus.COMPLETED,
                workout_plan_created_at=datetime.now(timezone.utc).date().isoformat(),
            )
            logger.info("job_completed job_id=%s user_id=%s", job_id, user_id)
        except Exception as e:
            # logger.exception captures the traceback automatically.
            logger.exception("job_failed job_id=%s user_id=%s", job_id, user_id)
            await repo.update_job_status(
                user_id,
                job_id,
                JobStatus.FAILED,
                error="Workout generation failed. Please try again.",
            )
            # Re-raise so EventBridge retries / sends to DLQ on repeated failure.
            raise


def handler(event: dict, context) -> dict:
    """Lambda entrypoint."""
    settings = Settings()  # type: ignore[call-arg]
    detail = event.get("detail") or {}

    if not detail.get("jobId") or not detail.get("userId"):
        logger.error(
            "event_malformed missing_fields detail_keys=%s", list(detail.keys())
        )
        # Don't raise — let EventBridge drop it (no point retrying a bad shape)
        return {"status": "ignored", "reason": "malformed"}

    asyncio.run(_process(detail, settings))
    return {"status": "ok", "jobId": detail["jobId"]}
