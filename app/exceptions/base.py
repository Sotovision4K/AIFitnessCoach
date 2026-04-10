class AppBaseException(Exception):
    """Base class for all exceptions in the AI Coach LLM API."""
    
    def __init__(self, message: str, status_code: int = 500, details: dict | None = None):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)
        
    
    def to_dict(self):
        """Convert the exception to a dictionary for JSON responses."""
        error_response = {
            "error": self.__class__.__name__,
            "status_code": self.status_code,
            "message": self.message,
        }
        if self.details:
            error_response["details"] = self.details
        return error_response