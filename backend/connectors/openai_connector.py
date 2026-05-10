import os
import logging
from openai import AsyncOpenAI
from backend.connectors.base import ModelConnector

logger = logging.getLogger(__name__)

class OpenAIConnector(ModelConnector):
    def __init__(self, model_id: str = "gpt-4o", api_key: str | None = None, base_url: str | None = None):
        self.model_id = model_id
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.base_url = base_url
        
        self.client = None
        if self.api_key:
            try:
                self.client = AsyncOpenAI(
                    api_key=self.api_key,
                    base_url=self.base_url
                )
            except Exception as e:
                logger.error(f"Error creating OpenAI client: {e}")

    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        if not self.api_key or not self.client:
            logger.warning("OpenAI API key not found. Returning empty response.")
            return ""

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model_id,
                messages=messages,
                temperature=0.0
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"OpenAI generation error: {e}")
            return ""

    async def health_check(self) -> bool:
        if not self.api_key or not self.client:
            return False
        try:
            await self.client.chat.completions.create(
                model=self.model_id,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=5
            )
            return True
        except Exception:
            return False
