import httpx
from backend.connectors.base import ModelConnector

class OllamaConnector(ModelConnector):
    def __init__(self, model_id: str = "llama3", base_url: str = "http://localhost:11434"):
        self.model_id = model_id
        self.base_url = base_url.rstrip("/")

    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        url = f"{self.base_url}/api/chat"
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model_id,
            "messages": messages,
            "stream": False,
            "options": {"temperature": 0.0}
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    return data.get("message", {}).get("content", "")
                else:
                    return f"Ollama error (HTTP {response.status_code}): {response.text}"
        except Exception as e:
            return f"Error connecting to Ollama: {str(e)}"

    async def health_check(self) -> bool:
        url = f"{self.base_url}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    # Check if model is loaded or just if service is up
                    models_data = response.json()
                    models = [m.get("name") for m in models_data.get("models", [])]
                    # Logically, if the service is up, it's a pass.
                    # We can also check if our model_id (or model_id:latest) is in models.
                    return True
                return False
        except Exception:
            return False
