import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "SentinelAI API"
    API_V1_STR: str = "/api/v1"
    
    # Databases
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sentinel.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # API Keys
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
    ANTHROPIC_API_KEY: str | None = os.getenv("ANTHROPIC_API_KEY")
    GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")
    OPENROUTER_API_KEY: str | None = os.getenv("OPENROUTER_API_KEY")

settings = Settings()
