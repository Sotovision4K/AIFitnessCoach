from __future__ import annotations

from typing import Protocol


class EventBusPort(Protocol):
    """Abstraction over the asynchronous event transport.

    Concrete implementations: EventBridge, SQS, Kafka, in-memory (tests).
    """

    async def publish(
        self,
        *,
        detail_type: str,
        detail: dict,
        source: str | None = None,
    ) -> str:
        """Publish a single event. Returns the provider's event id."""
        ...
