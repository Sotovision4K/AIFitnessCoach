from __future__ import annotations


from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Deployment environment: "dev" | "staging" | "prod"
    ENV: str = "dev"

    #Anthropic API configuration
    # Renamed from `temp` to avoid colliding with the Windows `TEMP` env var
    # (pydantic-settings is case-insensitive by default).
    TEMPERATURE: float = 0.4
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
    JOBS_TABLE_NAME: str = "workout_jobs"
    # Static credentials. Leave UNSET on Lambda so boto3 uses the execution
    # role's credential chain. Only set these for local dev or non-AWS envs.
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    DYNAMODB_ENDPOINT: str | None = None  # None = real AWS; set to http://dynamodb-local:8000 for local dev

    # EventBridge configuration (async workout-generation pipeline)
    EVENT_BUS_NAME: str = "default"
    EVENT_SOURCE: str = "ai-coach.api"
    EVENT_DETAIL_TYPE_GENERATE: str = "WorkoutGenerationRequested"

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
    
