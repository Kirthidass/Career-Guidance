import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from shared_ai import shared_ai_engine
from database import save_resume_analysis, get_user_resume_history, get_resume_by_id, save_roadmap
from models import ResumeAnalysisResponse
from typing import List

router = APIRouter(prefix="/resume", tags=["resume"])

@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    target_role: str = Form(...),
    user_id: str = Form(...)
):
    """Analyze a resume, save to history, and generate roadmap."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # Run AI Analysis - this also generates roadmap and stores in user_data
        analysis_result = shared_ai_engine.analyze_resume(tmp_path, target_role, user_id)
        
        # Extract resume content and roadmap for DB storage
        resume_content = analysis_result.get("resume_content", "")
        roadmap = analysis_result.get("roadmap", {})
        
        # Save resume analysis to Supabase (this creates history)
        save_resume_analysis(
            user_id=user_id,
            role=target_role,
            data={
                "ats_score": analysis_result.get("ats_score", 0),
                "skills_you_have": analysis_result.get("skills_you_have", []),
                "skills_you_need": analysis_result.get("skills_you_need", [])
            },
            resume_content=resume_content,
            ats_score=analysis_result.get("ats_score", 0)
        )
        
        # Also save the auto-generated roadmap
        if roadmap:
            save_roadmap(user_id, target_role, roadmap)
        
        return {
            "ats_score": analysis_result.get("ats_score", 0),
            "skills_you_have": analysis_result.get("skills_you_have", []),
            "skills_you_need": analysis_result.get("skills_you_need", []),
            "roadmap_generated": bool(roadmap)
        }
    except Exception as e:
        print(f"Error in analyze_resume endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.remove(tmp_path)

@router.get("/history/{user_id}")
async def get_resume_history(user_id: str):
    """Get all resume analyses for a user (history)."""
    try:
        history = get_user_resume_history(user_id)
        return {"history": history}
    except Exception as e:
        print(f"Error fetching resume history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/detail/{resume_id}")
async def get_resume_detail(resume_id: str):
    """Get a specific resume analysis by ID."""
    try:
        resume = get_resume_by_id(resume_id)
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        return resume
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching resume detail: {e}")
        raise HTTPException(status_code=500, detail=str(e))
