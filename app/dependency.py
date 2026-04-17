from functools import lru_cache


from aioboto3 import Session
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.ports.idp_port import IDPPort
from .config import Settings
from app.adapters.cognito_adapter import CognitoAdapter


security = HTTPBearer()  # Initialize the security scheme once
_auth_provider: IDPPort | None = None  # Global variable to hold the authentication provider instance
@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Load and cache settings from environment variables."""
    return Settings()  # type: ignore[call-arg]


def get_session() -> Session:
    """Return a reusable aioboto3 session."""
    return Session()


def get_dynamodb_resource(settings: Settings = Depends(get_settings), session: Session = Depends(get_session)):
    """Return an aioboto3 DynamoDB resource context manager."""
    return session.resource(
        "dynamodb",
        endpoint_url=settings.DYNAMODB_ENDPOINT,
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )

def auth_provider(settings: Settings = Depends(get_settings)) -> IDPPort:
    """Return an instance of the authentication provider."""
    global _auth_provider
    if _auth_provider is None:
        _auth_provider = CognitoAdapter(settings)

    return _auth_provider

class CurrentUser:
    """Dependency to get the current authenticated user."""
    def __init__(self, claims : dict):
        self.user_id = claims.get("sub", "")  # Assuming 'sub' claim contains user ID
        self.email = claims.get("email", "") 
        self.claims  = claims
    
    def __repr__(self):
        return f"CurrentUser(user_id={self.user_id}, email={self.email})"

async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        auth_provider: IDPPort = Depends(auth_provider)
)-> CurrentUser:
    """Placeholder for user authentication logic."""
    token = credentials.credentials
    claims = auth_provider.verify_token(token)
    return CurrentUser(claims)