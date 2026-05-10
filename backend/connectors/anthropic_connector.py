import logging
from backend.connectors.base import ModelConnector

logger = logging.getLogger(__name__)

class AnthropicConnector(ModelConnector):
    def __init__(self, model_id: str = "claude-3-5-sonnet-20240620", api_key: str | None = None):
        self.model_id = model_id
        self.api_key = api_key
        logger.warning("Anthropic SDK has been removed from this system configuration.")

    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        # Return empty response as requested when SDK is not present or api key is missing
        return ""

    async def health_check(self) -> bool:
        return False
