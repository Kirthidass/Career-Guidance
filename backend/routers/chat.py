from fastapi import APIRouter, HTTPException
from shared_ai import shared_ai_engine
from database import save_chat_message, get_chat_history, get_user_resume_content, save_roadmap, get_latest_roadmap
from models import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    try:
        # Get user's resume context from database
        resume_context = get_user_resume_content(request.user_id)
        
        # If we have resume context, load it into AI memory
        if resume_context and request.user_id not in shared_ai_engine.user_data:
            # Initialize user data from database
            shared_ai_engine.user_data[request.user_id] = {
                "resume_text": resume_context.get("resume_content", ""),
                "target_role": resume_context.get("target_role", ""),
                "sector": shared_ai_engine._detect_sector(
                    resume_context.get("resume_content", ""),
                    resume_context.get("target_role", "")
                ),
                "skills_have": [],
                "skills_need": [],
                "roadmap": {},
                "roadmap_goal": resume_context.get("target_role", "")
            }
            # Also try to load latest roadmap from DB
            db_roadmap = get_latest_roadmap(request.user_id)
            if db_roadmap:
                shared_ai_engine.user_data[request.user_id]["roadmap"] = db_roadmap.get("roadmap_json", {})
                shared_ai_engine.user_data[request.user_id]["roadmap_goal"] = db_roadmap.get("title", "")
        
        # Get chat history for context
        chat_history = get_chat_history(request.user_id, limit=10)
        
        # Get current roadmap state before chat
        old_roadmap = shared_ai_engine.user_data.get(request.user_id, {}).get("roadmap", {})
        old_roadmap_str = str(old_roadmap)
        
        # Save user message
        save_chat_message(request.user_id, "user", request.message)
        
        # Generate AI response with context
        response = shared_ai_engine.chat_with_context(
            user_id=request.user_id,
            message=request.message,
            resume_context=resume_context,
            chat_history=chat_history
        )
        
        # Check if roadmap was modified during chat
        new_roadmap = shared_ai_engine.user_data.get(request.user_id, {}).get("roadmap", {})
        roadmap_modified = str(new_roadmap) != old_roadmap_str and new_roadmap
        
        # If roadmap was modified, save to database
        if roadmap_modified:
            goal = shared_ai_engine.user_data.get(request.user_id, {}).get("roadmap_goal", "Learning Path")
            save_roadmap(request.user_id, goal, new_roadmap)
        
        # Save AI response
        save_chat_message(request.user_id, "assistant", response)
        
        return {
            "response": response,
            "context_used": resume_context is not None,
            "roadmap_updated": roadmap_modified
        }
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}")
async def get_history(user_id: str):
    try:
        history = get_chat_history(user_id, limit=50)
        return {"messages": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/roadmap/{user_id}")
async def get_user_roadmap_from_session(user_id: str):
    """Get the current roadmap from AI session (includes chat modifications)"""
    try:
        # First check AI memory for latest roadmap
        session_roadmap = shared_ai_engine.user_data.get(user_id, {}).get("roadmap", {})
        goal = shared_ai_engine.user_data.get(user_id, {}).get("roadmap_goal", "Learning Path")
        
        if session_roadmap:
            return {
                "roadmap": session_roadmap,
                "goal": goal,
                "source": "session"
            }
        
        # Fall back to database
        db_roadmap = get_latest_roadmap(user_id)
        if db_roadmap:
            # Also load into AI memory for future chat
            if user_id not in shared_ai_engine.user_data:
                shared_ai_engine.user_data[user_id] = {}
            shared_ai_engine.user_data[user_id]["roadmap"] = db_roadmap.get("roadmap_json", {})
            shared_ai_engine.user_data[user_id]["roadmap_goal"] = db_roadmap.get("title", "")
            
            return {
                "roadmap": db_roadmap.get("roadmap_json", {}),
                "goal": db_roadmap.get("title", "Learning Path"),
                "source": "database",
                "id": db_roadmap.get("id"),
                "progress": db_roadmap.get("progress", 0),
                "completed_weeks": db_roadmap.get("completed_weeks", [])
            }
        
        return {"roadmap": {}, "goal": "", "source": "none"}
    except Exception as e:
        print(f"Error fetching roadmap: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/load-context/{user_id}")
async def load_user_context(user_id: str):
    """Load user context from database into AI memory"""
    try:
        # Load resume
        resume_context = get_user_resume_content(user_id)
        
        # Load roadmap
        db_roadmap = get_latest_roadmap(user_id)
        
        if resume_context or db_roadmap:
            shared_ai_engine.user_data[user_id] = {
                "resume_text": resume_context.get("resume_content", "") if resume_context else "",
                "target_role": resume_context.get("target_role", "") if resume_context else (db_roadmap.get("title", "") if db_roadmap else ""),
                "sector": shared_ai_engine._detect_sector(
                    resume_context.get("resume_content", "") if resume_context else "",
                    resume_context.get("target_role", "") if resume_context else ""
                ) if resume_context else "general",
                "skills_have": [],
                "skills_need": [],
                "roadmap": db_roadmap.get("roadmap_json", {}) if db_roadmap else {},
                "roadmap_goal": db_roadmap.get("title", "") if db_roadmap else ""
            }
            return {
                "success": True,
                "loaded": {
                    "resume": bool(resume_context),
                    "roadmap": bool(db_roadmap)
                }
            }
        return {"success": False, "message": "No context found for user"}
    except Exception as e:
        print(f"Error loading context: {e}")
        raise HTTPException(status_code=500, detail=str(e))
