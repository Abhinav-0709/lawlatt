from backend.connectors.base import ModelConnector
from backend.connectors.openai_connector import OpenAIConnector
from backend.connectors.gemini_connector import GeminiConnector
from backend.connectors.anthropic_connector import AnthropicConnector
from backend.connectors.groq_connector import GroqConnector
from backend.connectors.ollama_connector import OllamaConnector
from backend.connectors.litellm_connector import LiteLLMConnector

def get_connector(provider: str, model_id: str, api_key: str | None = None, base_url: str | None = None) -> ModelConnector:
    provider = provider.lower()
    
    if provider == "openai":
        return OpenAIConnector(model_id=model_id, api_key=api_key, base_url=base_url)
    elif provider == "gemini":
        return GeminiConnector(model_id=model_id, api_key=api_key)
    elif provider == "anthropic":
        return AnthropicConnector(model_id=model_id, api_key=api_key)
    elif provider == "groq":
        return GroqConnector(model_id=model_id, api_key=api_key)
    elif provider == "ollama":
        return OllamaConnector(model_id=model_id, base_url=base_url or "http://localhost:11434")
    else:
        # Fallback to LiteLLM for openrouter, custom, or unknown
        # If openrouter, model_id is like "openrouter/meta-llama/llama-3-70b-instruct"
        # base_url is "https://openrouter.ai/api/v1"
        return LiteLLMConnector(model_id=model_id, api_key=api_key, base_url=base_url)
