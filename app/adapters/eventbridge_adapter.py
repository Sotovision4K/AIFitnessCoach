from __future__ import annotations

import json
import logging

from app.config import Settings
from app.exceptions.base import AppBaseException

logger = logging.getLogger(__name__)


class EventPublishError(AppBaseException):
    status_code = 502
    error_code = "event_publish_failed"


class EventBridgeAdapter:
    """EventBridge implementation of EventBusPort.

    Uses an aioboto3 session passed in by the caller so we share connection
    pools with the rest of the app.
    """

    def __init__(self, settings: Settings, session):
        self._settings = settings
        self._session = session

    async def publish(
        self,
        *,
        detail_type: str,
        detail: dict,
        source: str | None = None,
    ) -> str:
        kwargs: dict = {"region_name": self._settings.AWS_REGION}
        if self._settings.AWS_ACCESS_KEY_ID:
            kwargs["aws_access_key_id"] = self._settings.AWS_ACCESS_KEY_ID
            kwargs["aws_secret_access_key"] = self._settings.AWS_SECRET_ACCESS_KEY

        async with self._session.client("events", **kwargs) as events:
            response = await events.put_events(
                Entries=[
                    {
                        "Source": source or self._settings.EVENT_SOURCE,
                        "DetailType": detail_type,
                        "Detail": json.dumps(detail, default=str),
                        "EventBusName": self._settings.EVENT_BUS_NAME,
                    }
                ]
            )

        failed = response.get("FailedEntryCount", 0)
        if failed:
            entry = (response.get("Entries") or [{}])[0]
            logger.error(
                "eventbridge_publish_failed code=%s message=%s",
                entry.get("ErrorCode"),
                entry.get("ErrorMessage"),
            )
            raise EventPublishError("Failed to enqueue event")

        return (response.get("Entries") or [{}])[0].get("EventId", "")
