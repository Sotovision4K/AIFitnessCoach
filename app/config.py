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
    DYNAMODB_ENDPOINT: str = "http://localhost:8000"
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = "local"
    AWS_SECRET_ACCESS_KEY: str = "local"
    DYNAMO_TABLE_NAME: str = "WorkoutPlans"

    log_level : str = "INFO"

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
    
