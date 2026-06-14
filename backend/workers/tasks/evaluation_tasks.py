import asyncio
import datetime
import logging
from backend.workers.celery_app import celery_app
from backend.core.database import SessionLocal
from backend.models.evaluation import Evaluation, ModelConfig, ModuleResult, Report
from backend.connectors import get_connector
from backend.evaluation.engine import EvaluationEngine
from backend.reports.generator import generate_report_files

logger = logging.getLogger(__name__)

async def execute_evaluation_async(evaluation_id: str):
    db = SessionLocal()
    try:
        # 1. Fetch Evaluation job
        eval_job = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
        if not eval_job:
            logger.error(f"Evaluation job {evaluation_id} not found.")
            return
        
        # 2. Update status to RUNNING
        eval_job.status = "RUNNING"
        db.commit()
        
        # 3. Get Model Connector configuration
        model_config = db.query(ModelConfig).filter(ModelConfig.id == eval_job.model_config_id).first()
        if not model_config:
            eval_job.status = "FAILED"
            eval_job.error_message = "Associated model configuration not found."
            db.commit()
            return
            
        connector = get_connector(
            provider=model_config.provider,
            model_id=model_config.model_id,
            api_key=model_config.api_key_encrypted,  # Treat as plain for now
            base_url=model_config.base_url
        )
        
        # 4. Initialize Evaluation Engine
        engine = EvaluationEngine()
        
        # Define progress updater helper
        async def progress_callback(module_name: str, status: str, progress: float):
            logger.info(f"Job {evaluation_id} - Module {module_name} status: {status} ({progress:.1%})")
            
        # 5. Execute Evaluation
        modules_to_run = eval_job.modules or []
        eval_results = await engine.run_evaluation(
            model=connector,
            module_names=modules_to_run,
            progress_callback=progress_callback
        )
        
        # 6. Save individual module results
        for res in eval_results["results"]:
            mod_res = ModuleResult(
                evaluation_id=evaluation_id,
                module_name=res["module"],
                score=res["score"],
                status=res["status"],
                confidence=res.get("confidence"),
                severity=res.get("severity"),
                tests_run=res.get("tests_run", 0),
                tests_passed=res.get("tests_passed", 0),
                tests_failed=res.get("tests_failed", 0),
                findings=res.get("findings"),
                raw_output=res.get("raw_output")
            )
            db.add(mod_res)
            
        # 7. Update Evaluation summary scores
        summary = eval_results["summary"]
        eval_job.overall_score = summary["overall_score"]
        eval_job.grade = summary["grade"]
        eval_job.security_score = summary["security_score"]
        eval_job.reliability_score = summary["reliability_score"]
        eval_job.privacy_score = summary["privacy_score"]
        eval_job.bias_score = summary["bias_score"]
        
        eval_job.status = "COMPLETED"
        eval_job.completed_at = datetime.datetime.utcnow()
        db.commit()
        
        # 8. Generate Reports
        # Generate JSON, Markdown, and PDF reports on filesystem
        report_data = generate_report_files(db, evaluation_id)
        if report_data:
            report_obj = Report(
                evaluation_id=evaluation_id,
                overall_score=summary["overall_score"],
                grade=summary["grade"],
                security_score=summary["security_score"],
                reliability_score=summary["reliability_score"],
                privacy_score=summary["privacy_score"],
                bias_score=summary["bias_score"],
                pdf_path=report_data.get("pdf_path"),
                markdown_path=report_data.get("markdown_path"),
                json_path=report_data.get("json_path")
            )
            db.add(report_obj)
            db.commit()
            
    except Exception as e:
        logger.exception(f"Error running evaluation task {evaluation_id}")
        # Mark evaluation as failed in database
        db.rollback()
        eval_job = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
        if eval_job:
            eval_job.status = "FAILED"
            eval_job.error_message = str(e)
            eval_job.completed_at = datetime.datetime.utcnow()
            db.commit()
    finally:
        db.close()

@celery_app.task(name="backend.workers.tasks.evaluation_tasks.run_evaluation_task")
def run_evaluation_task(evaluation_id: str):
    """Celery task wrapper that runs the async evaluation loop."""
    asyncio.run(execute_evaluation_async(evaluation_id))
