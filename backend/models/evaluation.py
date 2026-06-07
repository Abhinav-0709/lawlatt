import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON, Boolean, Text
from sqlalchemy.orm import relationship
from backend.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class ModelConfig(Base):
    __tablename__ = "model_configs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    provider = Column(String(50), nullable=False)  # openai, gemini, anthropic, groq, ollama, custom
    model_id = Column(String(255), nullable=False)  # gpt-4o, gemini-1.5-flash, llama3-8b-8192, etc.
    api_key_encrypted = Column(Text, nullable=True)  # Store encrypted or plain if local dev
    base_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    evaluations = relationship("Evaluation", back_populates="model_config")

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    model_config_id = Column(String(36), ForeignKey("model_configs.id"), nullable=False)
    status = Column(String(50), default="PENDING")  # PENDING, RUNNING, COMPLETED, FAILED
    error_message = Column(Text, nullable=True)
    modules = Column(JSON, nullable=False)  # List of module names to run: ["prompt_injection", "jailbreak", ...]
    config = Column(JSON, nullable=True)  # General configuration: {"temperature": 0.0, "max_tokens": 1000}
    
    overall_score = Column(Float, nullable=True)
    grade = Column(String(5), nullable=True)  # A+, A, B, C, D, F
    security_score = Column(Float, nullable=True)
    reliability_score = Column(Float, nullable=True)
    privacy_score = Column(Float, nullable=True)
    bias_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    model_config = relationship("ModelConfig", back_populates="evaluations")
    module_results = relationship("ModuleResult", back_populates="evaluation", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="evaluation", cascade="all, delete-orphan")

class ModuleResult(Base):
    __tablename__ = "module_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    evaluation_id = Column(String(36), ForeignKey("evaluations.id"), nullable=False)
    module_name = Column(String(100), nullable=False)  # prompt_injection, jailbreak, etc.
    score = Column(Float, nullable=False)
    status = Column(String(20), nullable=False)  # PASS, FAIL, WARNING
    confidence = Column(Float, nullable=True)
    severity = Column(String(20), nullable=True)  # low, medium, high, critical
    
    tests_run = Column(Integer, default=0)
    tests_passed = Column(Integer, default=0)
    tests_failed = Column(Integer, default=0)
    
    findings = Column(JSON, nullable=True)  # Detailed list of failed probes, inputs, responses
    raw_output = Column(Text, nullable=True)  # Any debug/trace output
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    evaluation = relationship("Evaluation", back_populates="module_results")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    evaluation_id = Column(String(36), ForeignKey("evaluations.id"), nullable=False)
    overall_score = Column(Float, nullable=False)
    grade = Column(String(5), nullable=False)
    
    security_score = Column(Float, nullable=True)
    reliability_score = Column(Float, nullable=True)
    privacy_score = Column(Float, nullable=True)
    bias_score = Column(Float, nullable=True)
    
    pdf_path = Column(String(500), nullable=True)
    markdown_path = Column(String(500), nullable=True)
    json_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    evaluation = relationship("Report", back_populates="reports", foreign_keys=[evaluation_id])
    # Fix self-referential or relationship mapping issues:
    evaluation = relationship("Evaluation", back_populates="reports")
