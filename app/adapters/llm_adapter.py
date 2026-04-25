
import json
import logging

from anthropic import Anthropic
from anthropic.types import TextBlock

logger = logging.getLogger(__name__)

from app.exceptions.LLmError import LLMerror
from app.exceptions.base import AppBaseException
from app.models.workout_plan import WorkoutPlan

from json import loads
import re

class ClaudeAdapter():

    def __init__(self, anthropic_api_key: str, anthropic_api_model: str, max_tokens: int, temperature: float):
        self.client = Anthropic(api_key=anthropic_api_key)
        self.anthropic_api_model = anthropic_api_model
        self.max_tokens = max_tokens
        self.temperature = temperature
    
    async def generate(self, prompt: str) -> WorkoutPlan:
        response = self.client.messages.create(
            model=self.anthropic_api_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            system="You are an expert fitness coach. Generate a workout plan based on the user's profile and preferences. Be concise but thorough in your suggestions.",
        )
        # Token usage is operationally valuable (cost-per-request tracking).
        usage = response.usage
        logger.info(
            "llm_call model=%s input_tokens=%s output_tokens=%s stop=%s",
            self.anthropic_api_model,
            getattr(usage, "input_tokens", "?"),
            getattr(usage, "output_tokens", "?"),
            response.stop_reason,
        )

        text_block = next(
            (block for block in response.content if isinstance(block, TextBlock)),
            None,
        )

        if text_block is None:
            logger.error("llm_no_text_block stop=%s", response.stop_reason)
            raise LLMerror("Failed to generate workout plan: No response from LLM")

        try:
            return self._parse_response(text_block.text)
        except LLMerror:
            # Already logged inside _parse_response.
            raise
        except Exception:
            logger.exception("llm_parse_unexpected_error")
            raise LLMerror("Failed to parse workout plan")

    
    def _parse_response(self, response: str) -> WorkoutPlan:
        """
        Handles all possible formats Claude might return:
        - ```json { ... } ```
        - ``` { ... } ```
        - { ... }
        - Random text before/after JSON
        """
        text = response.strip()

        match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
        if match:
            text = match.group(1)
        
        else:
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                text = match.group(0)

        # Parse
        try:
            return WorkoutPlan.model_validate(loads(text))
        except json.JSONDecodeError as e:
            # Do NOT log or include the raw response: it contains the model's
            # echo of the user's profile (PII) and any prompt-injected payload.
            logger.error(
                "Failed to parse workout plan JSON: %s (response_len=%d)",
                e,
                len(response),
            )
            logger.debug("Raw LLM response (debug only): %s", response)
            raise LLMerror("Failed to parse workout plan JSON") from e

