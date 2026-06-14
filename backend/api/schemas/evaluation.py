from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# --- Model Configurations ---
class ModelConfigBase(BaseModel):
    name: str = Field(..., example="Groq Llama 3 8B")
    provider: str = Field(..., example="groq")  # openai, gemini, anthropic, groq, ollama
    model_id: str = Field(..., example="llama3-8b-8192")
    base_url: Optional[str] = Field(None, example="http://localhost:11434")

class ModelConfigCreate(ModelConfigBase):
    api_key: Optional[str] = Field(None, example="gsk_...")

class ModelConfigResponse(ModelConfigBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Evaluations ---
class EvaluationCreate(BaseModel):
    model_config_id: str
    modules: List[str] = Field(default_factory=list, example=["prompt_injection", "jailbreak", "hallucination", "prompt_leakage", "toxicity"])
    config: Optional[Dict[str, Any]] = Field(None, example={"temperature": 0.0})

class ModuleResultResponse(BaseModel):
    id: str
    module_name: str
    score: float
    status: str
    confidence: Optional[float]
    severity: Optional[str]
    tests_run: int
    tests_passed: int
    tests_failed: int
    findings: Optional[List[Dict[str, Any]]]
    created_at: datetime

    class Config:
        from_attributes = True

class EvaluationResponse(BaseModel):
    id: str
    model_config_id: str
    status: str
    error_message: Optional[str]
    modules: List[str]
    config: Optional[Dict[str, Any]]
    
    overall_score: Optional[float]
    grade: Optional[str]
    security_score: Optional[float]
    reliability_score: Optional[float]
    privacy_score: Optional[float]
    bias_score: Optional[float]
    
    created_at: datetime
    completed_at: Optional[datetime]
    
    model_config_info: Optional[ModelConfigResponse] = Field(None, alias="model_config")
    module_results: List[ModuleResultResponse] = []

    class Config:
        from_attributes = True

# --- Reports ---
class ReportResponse(BaseModel):
    id: str
    evaluation_id: str
    overall_score: float
    grade: str
    security_score: Optional[float]
    reliability_score: Optional[float]
    privacy_score: Optional[float]
    bias_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Test connection request ---
class TestConnectionRequest(BaseModel):
    provider: str
    model_id: str
    api_key: Optional[str] = None
    base_url: Optional[str] = None
