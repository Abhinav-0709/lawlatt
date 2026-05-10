from abc import ABC, abstractmethod

class ModelConnector(ABC):
    @abstractmethod
    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        """Generate response from the model for a given prompt and optional system prompt."""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Verify if the API credentials and model configuration are working."""
        pass
