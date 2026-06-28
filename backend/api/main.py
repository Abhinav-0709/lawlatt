from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.core.database import Base, engine
from backend.api.routers import models, evaluations, reports

# 1. Initialize Database Tables
Base.metadata.create_all(bind=engine)

# 2. Setup FastAPI Application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API Engine for Lawlatt Security and Safety Evaluator",
    version="1.0.0"
)

# 3. Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local-first setup, allow all, or configure to localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Bind Routers
app.include_router(models.router, prefix=f"{settings.API_V1_STR}/models", tags=["Models"])
app.include_router(evaluations.router, prefix=f"{settings.API_V1_STR}/evaluations", tags=["Evaluations"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docs": "/docs"
    }
