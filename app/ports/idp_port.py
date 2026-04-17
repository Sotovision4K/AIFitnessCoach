
from typing import Protocol, Annotated

from jwt import PyJWK



class IDPPort(Protocol):
    """Interface for Identity Provider (IdP) interactions."""


    
    def verify_token(self, token: str) -> Annotated[dict, {"sub": str, "email": str, "claims": dict}]:
        """Verify the JWT token and return the claims."""
        pass

    def get_public_key(self, token: str) -> PyJWK:
        pass

