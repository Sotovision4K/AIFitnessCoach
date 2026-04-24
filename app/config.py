from __future__ import annotations


from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    #Anthropic API configuration
    temp : float = 0.4
    MAX_TOKENS : int = 4096
    ANTHROPIC_API_KEY: str 
    ANTHROPIC_API_MODEL : str 

    # Logging configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


    #dynamodb configuration
    AWS_REGION: str = "us-east-1"
    DYNAMO_TABLE_NAME: str = "workout_plans"
    USERS_TABLE_NAME: str = "user_table"
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    DYNAMODB_ENDPOINT: str | None = None  # None = real AWS; set to http://dynamodb-local:8000 for local dev

    log_level : str = "INFO"

    # CORS configuration — comma-separated list of allowed origins
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Cognito configuration
    COGNITO_USER_POOL_ID: str
    COGNITO_CLIENT_ID: str 
    COGNITO_REGION: str
    COGNITO_JWKS_URL: str

    @property
    def cognito_issuer(self) -> str:
        return f"https://cognito-idp.{self.COGNITO_REGION}.amazonaws.com/{self.COGNITO_USER_POOL_ID}"

    @property
    def jwks_url(self) -> str:
        return self.COGNITO_JWKS_URL
    
