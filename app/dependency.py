from functools import lru_cache


from aioboto3 import Session  # type : ignore[import]
from fastapi import Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.ports.idp_port import IDPPort
from app.ports.event_bus_port import EventBusPort
from .config import Settings
from app.adapters.cognito_adapter import CognitoAdapter
from app.adapters.eventbridge_adapter import EventBridgeAdapter
from app.adapters.llm_adapter import ClaudeAdapter


security = HTTPBearer()  # Initialize the security scheme once


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Load and cache settings from environment variables."""
    return Settings()  # type: ignore[call-arg]


@lru_cache(
    maxsize=1
)  # this is cheap to cache, we do not cache the resource since it holds HTTP connections
def get_session() -> Session:
    """Return a reusable aioboto3 session.

    When AWS_ACCESS_KEY_ID/SECRET are not set we let boto3 resolve credentials
    via its default chain (env vars, ~/.aws/credentials, EC2/ECS/Lambda role).
    On Lambda this means the function's execution role is used automatically.
    """
    settings = get_settings()
    if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
        return Session(
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )
    return Session()


async def get_dynamodb_resource(
    settings: Settings = Depends(get_settings), session: Session = Depends(get_session)
):
    kwargs: dict = {"region_name": settings.AWS_REGION}
    if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
        kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
        kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY
    if settings.DYNAMODB_ENDPOINT:
        kwargs["endpoint_url"] = settings.DYNAMODB_ENDPOINT
    async with session.resource("dynamodb", **kwargs) as dynamodb:
        yield dynamodb


def auth_provider(settings: Settings = Depends(get_settings)) -> IDPPort:
    """Return a cached IDP provider instance. Singleton via lru_cache."""
    return _build_auth_provider()


@lru_cache(maxsize=1)
def _build_auth_provider() -> IDPPort:
    return CognitoAdapter(get_settings())


def get_event_bus(
    settings: Settings = Depends(get_settings),
    session: Session = Depends(get_session),
) -> EventBusPort:
    """Return an EventBridge-backed event bus."""
    return EventBridgeAdapter(settings, session)


@lru_cache(maxsize=1)
def get_llm_client() -> ClaudeAdapter:
    """Cached Anthropic client.

    The underlying `Anthropic` SDK keeps an HTTPS connection pool. Caching the
    adapter at module scope lets warm Lambda invocations reuse those sockets
    instead of re-handshaking on every request.
    """
    settings = get_settings()
    return ClaudeAdapter(
        anthropic_api_key=settings.ANTHROPIC_API_KEY,
        anthropic_api_model=settings.ANTHROPIC_API_MODEL,
        max_tokens=settings.MAX_TOKENS,
        temperature=settings.TEMPERATURE,
    )


class CurrentUser:
    """Dependency to get the current authenticated user."""

    def __init__(self, claims: dict):
        self.user_id = claims.get("sub", "")  # Assuming 'sub' claim contains user ID
        self.email = claims.get("email", "")
        self.claims = claims

    def __repr__(self):
        return f"CurrentUser(user_id={self.user_id}, email={self.email})"


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_provider: IDPPort = Depends(auth_provider),
) -> CurrentUser:
    """Verify the bearer token and stash user_id on request.state for the
    access-log middleware."""
    token = credentials.credentials
    claims = auth_provider.verify_token(token)
    user = CurrentUser(claims)
    request.state.user_id = user.user_id
    return user
