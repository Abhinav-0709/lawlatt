from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db
from backend.models.evaluation import Evaluation, ModelConfig
from backend.api.schemas.evaluation import EvaluationCreate, EvaluationResponse
from backend.evaluation.engine import EvaluationEngine
from backend.workers.tasks.evaluation_tasks import run_evaluation_task, execute_evaluation_async
from backend.core.config import settings
import redis

router = APIRouter()
engine = EvaluationEngine()

@router.post("/", response_model=EvaluationResponse)
def trigger_evaluation(
    eval_in: EvaluationCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Verify ModelConfig exists
    model_conf = db.query(ModelConfig).filter(ModelConfig.id == eval_in.model_config_id).first()
    if not model_conf:
        raise HTTPException(status_code=404, detail="Model configuration not found")
        
    # Create evaluation job in PENDING status
    eval_job = Evaluation(
        model_config_id=eval_in.model_config_id,
        modules=eval_in.modules,
        config=eval_in.config,
        status="PENDING"
    )
    db.add(eval_job)
    db.commit()
    db.refresh(eval_job)
    
    # Try triggering Celery task
    celery_triggered = False
    try:
        # Check if Redis connection is active before calling Celery
        r = redis.Redis.from_url(settings.REDIS_URL, socket_timeout=1)
        r.ping()
        run_evaluation_task.delay(eval_job.id)
        celery_triggered = True
    except Exception:
        # If redis/celery is offline, fall back to synchronous background thread execution
        pass

    if not celery_triggered:
        # Graceful fallback: Run directly in a FastAPI background task
        # Uses execute_evaluation_async inside the event loop
        background_tasks.add_task(execute_evaluation_async, eval_job.id)
        
    return eval_job

@router.get("/", response_model=List[EvaluationResponse])
def list_evaluations(db: Session = Depends(get_db)):
    return db.query(Evaluation).order_by(Evaluation.created_at.desc()).all()

@router.get("/modules")
def list_available_modules():
    return engine.get_available_modules()

@router.get("/{eval_id}", response_model=EvaluationResponse)
def get_evaluation(eval_id: str, db: Session = Depends(get_db)):
    evaluation = db.query(Evaluation).filter(Evaluation.id == eval_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation job not found")
    return evaluation
