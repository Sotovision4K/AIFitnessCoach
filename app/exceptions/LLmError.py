

from app.exceptions.base import AppBaseException


class LLMerror(AppBaseException):
    """Base exception for all LLM-related errors."""
    pass