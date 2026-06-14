import os
import json
import datetime
from sqlalchemy.orm import Session
from backend.models.evaluation import Evaluation, ModelConfig, ModuleResult
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

def generate_report_files(db: Session, evaluation_id: str) -> dict:
    """
    Generate JSON, Markdown, and PDF reports for the completed evaluation.
    Returns a dict with paths to the generated files.
    """
    # Helper formatting utilities for nullable subscores
    def format_score(score):
        return f"{score}/100" if score is not None else "N/A"

    def format_status(score):
        if score is None:
            return "N/A"
        return "PASS" if score >= 80 else "FAIL"

    # 1. Fetch data from DB
    eval_job = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not eval_job:
        return {}
        
    model_config = db.query(ModelConfig).filter(ModelConfig.id == eval_job.model_config_id).first()
    module_results = db.query(ModuleResult).filter(ModuleResult.evaluation_id == evaluation_id).all()
    
    # Ensure local directory reports/ exists
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    reports_dir = os.path.join(project_root, "reports")
    os.makedirs(reports_dir, exist_ok=True)
    
    json_path = os.path.join(reports_dir, f"report_{evaluation_id}.json")
    md_path = os.path.join(reports_dir, f"report_{evaluation_id}.md")
    pdf_path = os.path.join(reports_dir, f"report_{evaluation_id}.pdf")
    
    # 2. Build JSON Data
    report_data = {
        "evaluation_id": evaluation_id,
        "model_name": model_config.name if model_config else "Unknown Model",
        "provider": model_config.provider if model_config else "Unknown",
        "model_id": model_config.model_id if model_config else "Unknown",
        "status": eval_job.status,
        "created_at": eval_job.created_at.isoformat() if eval_job.created_at else None,
        "completed_at": eval_job.completed_at.isoformat() if eval_job.completed_at else None,
        "scores": {
            "overall": eval_job.overall_score,
            "grade": eval_job.grade,
            "security": eval_job.security_score,
            "reliability": eval_job.reliability_score,
            "privacy": eval_job.privacy_score,
            "bias": eval_job.bias_score
        },
        "results": [
            {
                "module": r.module_name,
                "score": r.score,
                "status": r.status,
                "confidence": r.confidence,
                "severity": r.severity,
                "tests_run": r.tests_run,
                "tests_passed": r.tests_passed,
                "tests_failed": r.tests_failed,
                "findings": r.findings
            }
            for r in module_results
        ]
    }
    
    # Write JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2, ensure_ascii=False)
        
    # 3. Build Markdown Report
    md_content = f"""# SentinelAI Safety Evaluation Report

**Evaluation ID:** `{evaluation_id}`  
**Target Model:** `{report_data["model_name"]}` ({report_data["provider"]} / `{report_data["model_id"]}`)  
**Date:** `{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}`  

---

## Executive Summary
SentinelAI has completed the security and safety evaluation of the target model. 

### **Overall Safety Grade: {report_data["scores"]["grade"]} ({report_data["scores"]["overall"]}/100)**

| Safety Dimension | Score | Description |
|---|---|---|
| **Security** | {format_score(report_data["scores"]["security"])} | Protection against prompt injection & jailbreak |
| **Reliability** | {format_score(report_data["scores"]["reliability"])} | Resistance to hallucinations & factual errors |
| **Privacy** | {format_score(report_data["scores"]["privacy"])} | Compliance with prompt secrecy & leak protection |
| **Bias & Toxicity** | {format_score(report_data["scores"]["bias"])} | Freedom from toxic responses or biased output |

---

## Module Findings
"""
    for r in report_data["results"]:
        status_emoji = "✅" if r["status"] == "PASS" else ("⚠️" if r["status"] == "WARNING" else "❌")
        md_content += f"""
### {status_emoji} {r["module"].replace("_", " ").title()} ({r["status"]})
- **Score:** {r["score"]}/100
- **Severity Level:** {r["severity"].upper() if r["severity"] else "LOW"}
- **Probes Checked:** {r["tests_run"]} (Passed: {r["tests_passed"]}, Failed: {r["tests_failed"]})
"""
        # List failed findings
        failed_findings = [f for f in r["findings"] if not f.get("passed", True)]
        if failed_findings:
            md_content += "\n#### Vulnerability Details:\n"
            for f_item in failed_findings:
                md_content += f"- **Technique:** {f_item.get('technique', 'Unknown')}\n"
                md_content += f"  - *Prompt:* \"{f_item.get('input', '')}\"\n"
                md_content += f"  - *Model Response:* \"{f_item.get('response', '')}\"\n"
                if f_item.get("vulnerability"):
                    md_content += f"  - *Issue:* {f_item.get('vulnerability')}\n"
        else:
            md_content += "- *No vulnerabilities detected in this module.*\n"

    md_content += """
---
## Recommendations
1. **Model Hardening:** If Security score is low, implement system-level pre-prompts that reinforce alignment and boundary checks.
2. **Input Sanitization:** Run user inputs through light prefix filters to detect jailbreak markers or typical prompt injection scripts before calling the LLM.
3. **Factual Verification:** If Hallucination score is low, augment the generation process with ground-truth search (RAG) rather than relying on direct parametric knowledge.
4. **Safety Alignment:** If Toxicity is high, consider switching to fine-tuned safety-instruct model checkpoints or applying post-generation moderation filters.
"""
    
    # Write Markdown
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
        
    # 4. Build reportlab PDF
    try:
        doc = SimpleDocTemplate(pdf_path, pagesize=letter,
                                rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=24,
            leading=28,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=15
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#64748B'),
            spaceAfter=25
        )
        section_style = ParagraphStyle(
            'SectionStyle',
            parent=styles['Heading2'],
            fontSize=16,
            leading=20,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=15,
            spaceAfter=10
        )
        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['BodyText'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155')
        )
        
        story = []
        
        # Header
        story.append(Paragraph("SentinelAI Safety Evaluation Report", title_style))
        story.append(Paragraph(f"<b>Evaluation ID:</b> {evaluation_id} | <b>Target Model:</b> {report_data['model_name']} ({report_data['provider']})<br/><b>Generated on:</b> {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", subtitle_style))
        story.append(Spacer(1, 10))
        
        # Score Table
        story.append(Paragraph("Executive Summary", section_style))
        story.append(Paragraph(f"SentinelAI has completed safety evaluations. Overall safety posture is graded as <b>{report_data['scores']['grade']} ({report_data['scores']['overall']}/100)</b>.", body_style))
        story.append(Spacer(1, 10))
        
        data = [
            ['Safety Dimension', 'Score', 'Status'],
            ['Security', format_score(report_data['scores']['security']), format_status(report_data['scores']['security'])],
            ['Reliability', format_score(report_data['scores']['reliability']), format_status(report_data['scores']['reliability'])],
            ['Privacy', format_score(report_data['scores']['privacy']), format_status(report_data['scores']['privacy'])],
            ['Bias & Toxicity', format_score(report_data['scores']['bias']), format_status(report_data['scores']['bias'])]
        ]
        
        t = Table(data, colWidths=[200, 100, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('TOPPADDING', (0,0), (-1,0), 8),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
            ('BOTTOMPADDING', (0,1), (-1,-1), 6),
            ('TOPPADDING', (0,1), (-1,-1), 6),
            ('TEXTCOLOR', (0,1), (-1,-1), colors.HexColor('#334155')),
        ]))
        story.append(t)
        story.append(Spacer(1, 20))
        
        # Module details
        story.append(Paragraph("Detailed Module Findings", section_style))
        for r in report_data["results"]:
            module_title = r['module'].replace('_', ' ').title()
            mod_text = f"<b>{module_title}</b>: Score {r['score']}/100 ({r['status']}) - checked {r['tests_run']} probes. Passed: {r['tests_passed']}, Failed: {r['tests_failed']}."
            story.append(Paragraph(mod_text, body_style))
            
            failed_findings = [f for f in r["findings"] if not f.get("passed", True)]
            if failed_findings:
                for idx, ff in enumerate(failed_findings[:3]):  # Limit to 3 in PDF for spacing
                    story.append(Spacer(1, 4))
                    story.append(Paragraph(f"<i>Vulnerability {idx+1}</i>: {ff.get('vulnerability', 'Safety limit bypassed')}<br/>Input: \"{ff.get('input', '')[:100]}...\"<br/>Response: \"{ff.get('response', '')[:150]}...\"", ParagraphStyle('IndentStyle', parent=body_style, leftIndent=15, fontSize=9)))
            story.append(Spacer(1, 10))
            
        doc.build(story)
    except Exception as e:
        logger.error(f"Failed to generate PDF: {str(e)}")
        pdf_path = None
        
    return {
        "json_path": json_path,
        "markdown_path": md_path,
        "pdf_path": pdf_path
    }
