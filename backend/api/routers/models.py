from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db
from backend.models.evaluation import ModelConfig
from backend.api.schemas.evaluation import ModelConfigCreate, ModelConfigResponse, TestConnectionRequest
from backend.connectors import get_connector

router = APIRouter()

@router.post("/", response_model=ModelConfigResponse)
def create_model_config(config_in: ModelConfigCreate, db: Session = Depends(get_db)):
    model_conf = ModelConfig(
        name=config_in.name,
        provider=config_in.provider,
        model_id=config_in.model_id,
        api_key_encrypted=config_in.api_key,  # Store directly for local use
        base_url=config_in.base_url
    )
    db.add(model_conf)
    db.commit()
    db.refresh(model_conf)
    return model_conf

@router.get("/", response_model=List[ModelConfigResponse])
def list_model_configs(db: Session = Depends(get_db)):
    return db.query(ModelConfig).filter(ModelConfig.is_active == True).all()

@router.delete("/{config_id}")
def delete_model_config(config_id: str, db: Session = Depends(get_db)):
    model_conf = db.query(ModelConfig).filter(ModelConfig.id == config_id).first()
    if not model_conf:
        raise HTTPException(status_code=404, detail="Model configuration not found")
    model_conf.is_active = False
    db.commit()
    return {"message": "Model configuration deactivated successfully"}

@router.post("/test")
async def test_model_connection(req: TestConnectionRequest):
    """Dynamic connection validation for the dashboard."""
    try:
        connector = get_connector(
            provider=req.provider,
            model_id=req.model_id,
            api_key=req.api_key,
            base_url=req.base_url
        )
        is_healthy = await connector.health_check()
        if is_healthy:
            return {"status": "success", "message": f"Successfully connected to {req.provider}."}
        else:
            return {"status": "failed", "message": "Health check returned false. Invalid model credentials or offline endpoint."}
    except Exception as e:
        return {"status": "failed", "message": f"Connection failed: {str(e)}"}
