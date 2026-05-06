from app.exceptions.base import AppBaseException


class AuthenticationError(AppBaseException):
    """Raised when an inbound credential (e.g. a JWT) cannot be verified.

    The route layer translates this to HTTP 401 via the AppBaseException
    handler registered in app.main.
    """

    def __init__(self, message: str = "Invalid token", details: dict | None = None):
        super().__init__(message=message, status_code=401, details=details)
