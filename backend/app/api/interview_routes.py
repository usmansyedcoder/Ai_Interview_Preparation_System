from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
from app.services.interview_agent import InterviewAgent
import uuid

router = APIRouter(prefix="/api/interview", tags=["interview"])

# Store active interviews (use Redis/DB in production)
active_interviews = {}

class StartInterviewRequest(BaseModel):
    job_title: str
    job_requirements: Dict
    resume_data: Dict

class AnswerRequest(BaseModel):
    session_id: str
    answer: str

@router.post("/start")
async def start_interview(request: StartInterviewRequest):
    """Start a new interview session"""
    session_id = str(uuid.uuid4())
    
    # Create interview agent
    agent = InterviewAgent(
        job_title=request.job_title,
        job_requirements=request.job_requirements,
        resume_data=request.resume_data
    )
    
    # Start interview
    first_question = await agent.start_interview()
    
    # Store session
    active_interviews[session_id] = {
        "agent": agent,
        "job_title": request.job_title,
        "status": "active"
    }
    
    return {
        "session_id": session_id,
        "question": first_question
    }

@router.post("/answer")
async def submit_answer(request: AnswerRequest):
    """Submit answer and get next question"""
    session = active_interviews.get(request.session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    agent = session["agent"]
    
    # Get next question
    next_question = await agent.get_next_question(request.answer)
    
    if next_question == "INTERVIEW_COMPLETE":
        # Evaluate interview
        evaluation = await agent.evaluate_interview()
        
        return {
            "interview_complete": True,
            "evaluation": evaluation
        }
    
    return {
        "interview_complete": False,
        "question": next_question
    }

@router.get("/evaluate/{session_id}")
async def evaluate_interview(session_id: str):
    """Get interview evaluation"""
    session = active_interviews.get(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    agent = session["agent"]
    evaluation = await agent.evaluate_interview()
    
    return evaluation