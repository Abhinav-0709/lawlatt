import os
import logging
import google.generativeai as genai
from backend.connectors.base import ModelConnector

logger = logging.getLogger(__name__)

class GeminiConnector(ModelConnector):
    def __init__(self, model_id: str = "gemini-1.5-flash", api_key: str | None = None):
        self.model_id = model_id
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Error configuring Gemini: {e}")

    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        if not self.api_key:
            logger.warning("Gemini API key not found. Returning empty response.")
            return ""
            
        try:
            config = {}
            if system_prompt:
                model = genai.GenerativeModel(
                    model_name=self.model_id,
                    system_instruction=system_prompt
                )
            else:
                model = genai.GenerativeModel(model_name=self.model_id)

            response = await model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(temperature=0.0)
            )
            return response.text or ""
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            return ""

    async def health_check(self) -> bool:
        if not self.api_key:
            return False
        try:
            model = genai.GenerativeModel(model_name=self.model_id)
            await model.generate_content_async("ping", generation_config=genai.types.GenerationConfig(max_output_tokens=5))
            return True
        except Exception:
            return False
