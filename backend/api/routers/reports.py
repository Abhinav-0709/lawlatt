import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db
from backend.models.evaluation import Report
from backend.api.schemas.evaluation import ReportResponse

router = APIRouter()

@router.get("/", response_model=List[ReportResponse])
def list_reports(db: Session = Depends(get_db)):
    return db.query(Report).order_by(Report.created_at.desc()).all()

@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first() or \
             db.query(Report).filter(Report.evaluation_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.get("/{report_id}/download/{file_format}")
def download_report(report_id: str, file_format: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first() or \
             db.query(Report).filter(Report.evaluation_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    file_format = file_format.lower()
    
    if file_format == "pdf":
        file_path = report.pdf_path
        media_type = "application/pdf"
        filename = f"lawlatt_report_{report.evaluation_id}.pdf"
    elif file_format == "markdown" or file_format == "md":
        file_path = report.markdown_path
        media_type = "text/markdown"
        filename = f"lawlatt_report_{report.evaluation_id}.md"
    elif file_format == "json":
        file_path = report.json_path
        media_type = "application/json"
        filename = f"lawlatt_report_{report.evaluation_id}.json"
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Supported formats: pdf, markdown, json")
        
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"The requested {file_format} report file was not found on disk.")
        
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename
    )
