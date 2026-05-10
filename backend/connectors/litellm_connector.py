import logging
import litellm
from backend.connectors.base import ModelConnector

logger = logging.getLogger(__name__)
litellm.telemetry = False

class LiteLLMConnector(ModelConnector):
    def __init__(self, model_id: str, api_key: str | None = None, base_url: str | None = None):
        self.model_id = model_id
        self.api_key = api_key
        self.base_url = base_url

    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        # If openrouter, we need key, check if optional key is present or in env
        # Let's verify we have a key for providers that require authentication
        # For simplicity, if we don't have a key and it is custom, let's let LiteLLM try or return empty if key required.
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = await litellm.acompletion(
                model=self.model_id,
                messages=messages,
                api_key=self.api_key,
                api_base=self.base_url,
                temperature=0.0
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"LiteLLM error for model {self.model_id}: {e}")
            return ""

    async def health_check(self) -> bool:
        try:
            await litellm.acompletion(
                model=self.model_id,
                messages=[{"role": "user", "content": "ping"}],
                api_key=self.api_key,
                api_base=self.base_url,
                max_tokens=5
            )
            return True
        except Exception:
            return False
