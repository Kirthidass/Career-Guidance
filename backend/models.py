from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ResumeAnalysisResponse(BaseModel):
    ats_score: int
    skills_you_have: List[str]
    skills_you_need: List[str]

class RoadmapRequest(BaseModel):
    skills: List[str]
    goal: str
    user_id: str

class RoadmapResponse(BaseModel):
    roadmap: Dict[str, Any]

class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    response: str
    context_used: bool
    roadmap_updated: bool = False

