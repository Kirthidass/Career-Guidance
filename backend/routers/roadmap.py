from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from shared_ai import shared_ai_engine
from database import save_roadmap, get_user_roadmaps, get_latest_roadmap, update_roadmap_progress
from models import RoadmapRequest, RoadmapResponse

router = APIRouter(prefix="/roadmap", tags=["roadmap"])

class ProgressUpdate(BaseModel):
    roadmap_id: str
    progress: int
    completed_weeks: List[int]

@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapRequest):
    """Generate a new learning roadmap."""
    try:
        roadmap_json = shared_ai_engine.generate_roadmap(request.skills, request.goal)
        
        # Store in AI memory
        if request.user_id not in shared_ai_engine.user_data:
            shared_ai_engine.user_data[request.user_id] = {}
        shared_ai_engine.user_data[request.user_id]["roadmap"] = roadmap_json
        shared_ai_engine.user_data[request.user_id]["roadmap_goal"] = request.goal
        
        # Save to database
        save_roadmap(request.user_id, request.goal, roadmap_json)
        return {"roadmap": roadmap_json}
    except Exception as e:
        print(f"Error in generate_roadmap endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}")
async def get_roadmaps(user_id: str):
    """Get all roadmaps for a user."""
    try:
        roadmaps = get_user_roadmaps(user_id)
        return {"roadmaps": roadmaps}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest/{user_id}")
async def get_user_latest_roadmap(user_id: str):
    """Get user's most recent roadmap."""
    try:
        roadmap = get_latest_roadmap(user_id)
        
        # Also load into AI memory for chat context
        if roadmap and user_id:
            if user_id not in shared_ai_engine.user_data:
                shared_ai_engine.user_data[user_id] = {}
            shared_ai_engine.user_data[user_id]["roadmap"] = roadmap.get("roadmap_json", {})
            shared_ai_engine.user_data[user_id]["roadmap_goal"] = roadmap.get("title", "")
        
        return {"roadmap": roadmap}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/progress")
async def update_progress(update: ProgressUpdate):
    """Update roadmap progress."""
    try:
        result = update_roadmap_progress(
            update.roadmap_id,
            update.progress,
            update.completed_weeks
        )
        if result:
            return {"success": True, "message": "Progress updated"}
        raise HTTPException(status_code=500, detail="Failed to update progress")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))
