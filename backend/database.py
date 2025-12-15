import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============ RESUME FUNCTIONS ============

def save_resume_analysis(user_id: str, role: str, data: dict, resume_content: str = None, ats_score: int = 0):
    """Save resume analysis results to Supabase."""
    try:
        insert_data = {
            "user_id": user_id,
            "target_role": role,
            "analysis_json": data,
            "ats_score": ats_score
        }
        if resume_content:
            insert_data["resume_content"] = resume_content
            
        response = supabase.table("resumes").insert(insert_data).execute()
        return response
    except Exception as e:
        print(f"Error saving resume analysis: {e}")
        return None

def get_user_resume_history(user_id: str) -> List[Dict]:
    """Get all resume analyses for a user (history)."""
    try:
        response = supabase.table("resumes")\
            .select("id, target_role, ats_score, analysis_json, created_at")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching resume history: {e}")
        return []

def get_resume_by_id(resume_id: str) -> Optional[Dict]:
    """Get a specific resume analysis by ID."""
    try:
        response = supabase.table("resumes")\
            .select("*")\
            .eq("id", resume_id)\
            .single()\
            .execute()
        return response.data if response.data else None
    except Exception as e:
        print(f"Error fetching resume: {e}")
        return None

def get_user_resume_content(user_id: str) -> Optional[Dict]:
    """Get the most recent resume content for RAG context."""
    try:
        response = supabase.table("resumes")\
            .select("resume_content, target_role")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error fetching resume content: {e}")
        return None

# ============ ROADMAP FUNCTIONS ============

def save_roadmap(user_id: str, title: str, data: dict, resume_id: str = None):
    """Save generated roadmap to Supabase."""
    try:
        insert_data = {
            "user_id": user_id,
            "title": title,
            "roadmap_json": data,
            "progress": 0,
            "completed_weeks": []
        }
        response = supabase.table("roadmaps").insert(insert_data).execute()
        return response
    except Exception as e:
        print(f"Error saving roadmap: {e}")
        return None

def get_user_roadmaps(user_id: str) -> List[Dict]:
    """Retrieve all roadmaps for a user."""
    try:
        response = supabase.table("roadmaps")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching roadmaps: {e}")
        return []

def get_latest_roadmap(user_id: str) -> Optional[Dict]:
    """Get user's most recent roadmap."""
    try:
        response = supabase.table("roadmaps")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error fetching latest roadmap: {e}")
        return None

def update_roadmap_progress(roadmap_id: str, progress: int, completed_weeks: List[int]):
    """Update roadmap progress."""
    try:
        response = supabase.table("roadmaps")\
            .update({
                "progress": progress,
                "completed_weeks": completed_weeks,
                "updated_at": "now()"
            })\
            .eq("id", roadmap_id)\
            .execute()
        return response
    except Exception as e:
        print(f"Error updating roadmap progress: {e}")
        return None

# ============ CHAT FUNCTIONS ============

def save_chat_message(user_id: str, role: str, content: str):
    """Save a chat message to conversation history."""
    try:
        response = supabase.table("chat_messages").insert({
            "user_id": user_id,
            "role": role,
            "content": content
        }).execute()
        return response
    except Exception as e:
        print(f"Error saving chat message: {e}")
        return None

def get_chat_history(user_id: str, limit: int = 10) -> List[Dict]:
    """Get recent chat history for context."""
    try:
        response = supabase.table("chat_messages")\
            .select("role, content")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return list(reversed(response.data)) if response.data else []
    except Exception as e:
        print(f"Error fetching chat history: {e}")
        return []

# ============ LEGACY COMPATIBILITY ============

def get_user_analyses(user_id: str) -> List[Dict]:
    """Alias for get_user_resume_history."""
    return get_user_resume_history(user_id)
