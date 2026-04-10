from functools import lru_cache

from boto3 import resource # type: ignore[import]
from fastapi import Depends

from .config import Settings


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Load and cache settings from environment variables."""
    return Settings()  # type: ignore[call-arg]


def get_dynamodb_resource(settings: Settings = Depends(get_settings)):
    """Return a boto3 DynamoDB resource driven by Settings."""
    return resource(
        "dynamodb",
        endpoint_url=settings.DYNAMODB_ENDPOINT,
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


def get_dynamodb_table(resource=Depends(get_dynamodb_resource), settings: Settings = Depends(get_settings)):
    """Return the DynamoDB Table object for the configured table name."""
    return resource.Table(settings.DYNAMO_TABLE_NAME)