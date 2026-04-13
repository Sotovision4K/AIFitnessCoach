
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
        logger.info("Calling Anthropic model=%s", self.anthropic_api_model)
        response = self.client.messages.create(
            model=self.anthropic_api_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            system="You are an expert fitness coach. Generate a workout plan based on the user's profile and preferences. Be concise but thorough in your suggestions.",
        )
        logger.info("Anthropic response: usage=%s, stop_reason=%s", response.usage, response.stop_reason)

        text_block = next(
            (block for block in response.content if isinstance(block, TextBlock)),
            None,
        )

        if text_block is None:
            logger.error("No TextBlock in LLM response")
            raise LLMerror("Failed to generate workout plan: No response from LLM")
    
        try:
            workout_plan = self._parse_response(text_block.text)
            return workout_plan
        except Exception as e:
            logger.error("Failed to parse LLM response: %s", e)
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
            return loads(text)
        except json.JSONDecodeError as e:
            raise LLMerror(f"Failed to parse workout plan JSON: {str(e)}. Raw response: {response}")

