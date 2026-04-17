
from app.dependency import Settings
from jose import jwt
from jose.exceptions import JWTClaimsError
from jwt import PyJWKClient, PyJWK, exceptions
from fastapi import HTTPException, status


class CognitoAdapter:
    """Adapter to handle interactions with AWS Cognito for user authentication."""
    def __init__(self, settings : Settings):
        self.settings = settings
        self.jwks_client = PyJWKClient(
                        uri=self.settings.jwks_url, 
                        cache_keys=True, 
                        lifespan=300
                    )
    

    def get_public_key(self, token: str) -> PyJWK:
        """Fetch the public key from Cognito JWKS endpoint based on the token's kid."""
        try:
            signing_key : PyJWK  = self.jwks_client.get_signing_key_from_jwt(token)
            return signing_key.key
        except exceptions.PyJWKClientError as e:
            
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from e
        


    def verify_token(self, token: str) -> dict:
        """Verify the JWT token with Cognito and return the claims."""
        public_key = self.get_public_key(token)
        try:
            # Decode the JWT token
            claims = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                audience=self.settings.COGNITO_CLIENT_ID,
                issuer=self.settings.cognito_issuer,
                options={"verify_exp": True, "verify_aud": True, "verify_iss": True}, 
                # require=["sub", "email"]  # Ensure required claims are present
            )
            sub = claims.get("sub")
            email = claims.get("email")
            return {"sub": sub, "email": email, "claims": claims}
        except JWTClaimsError as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token claims") from e
        except exceptions.ExpiredSignatureError as e:
            # Handle token verification errors
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired") from e

        except exceptions.InvalidTokenError as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from e
