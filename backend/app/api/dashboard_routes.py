from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# Mock data storage (replace with database in production)
user_sessions = {}
user_performance = {}

@router.get("/stats/{user_id}")
async def get_user_stats(user_id: str):
    """Get user performance statistics"""
    if user_id not in user_performance:
        # Return default stats for new user
        return {
            "total_interviews": 0,
            "average_score": 0,
            "best_score": 0,
            "total_questions_answered": 0,
            "skills_progress": {},
            "recent_scores": []
        }
    
    return user_performance[user_id]

@router.get("/history/{user_id}")
async def get_interview_history(user_id: str, limit: int = 10):
    """Get user's interview history"""
    sessions = []
    
    for session_id, session in user_sessions.items():
        if session.get('user_id') == user_id:
            sessions.append({
                "session_id": session_id,
                "job_title": session.get('job_title'),
                "date": session.get('date'),
                "score": session.get('score'),
                "feedback": session.get('feedback_summary')
            })
    
    # Sort by date descending and limit
    sessions.sort(key=lambda x: x['date'], reverse=True)
    return sessions[:limit]

@router.get("/skill-analysis/{user_id}")
async def get_skill_analysis(user_id: str):
    """Get detailed skill analysis"""
    # Mock skill analysis data
    return {
        "strong_skills": ["Python", "Communication", "Problem Solving"],
        "weak_skills": ["System Design", "Database Optimization", "Cloud Architecture"],
        "recommended_focus": ["System Design", "Algorithms"],
        "skill_scores": {
            "Python": 85,
            "JavaScript": 70,
            "Communication": 82,
            "Problem Solving": 78,
            "System Design": 55,
            "Databases": 65
        }
    }

@router.post("/track-progress")
async def track_progress(user_id: str, session_data: Dict):
    """Track user progress after interview"""
    if user_id not in user_performance:
        user_performance[user_id] = {
            "total_interviews": 0,
            "average_score": 0,
            "best_score": 0,
            "total_questions_answered": 0,
            "skills_progress": {},
            "recent_scores": []
        }
    
    stats = user_performance[user_id]
    current_score = session_data.get('overall_score', 0)
    
    # Update stats
    stats['total_interviews'] += 1
    stats['total_questions_answered'] += session_data.get('questions_count', 0)
    stats['recent_scores'].append({
        "date": datetime.now().isoformat(),
        "score": current_score,
        "job_title": session_data.get('job_title')
    })
    
    # Keep only last 10 scores
    if len(stats['recent_scores']) > 10:
        stats['recent_scores'] = stats['recent_scores'][-10:]
    
    # Update average
    total_score = sum(s['score'] for s in stats['recent_scores'])
    stats['average_score'] = total_score / len(stats['recent_scores'])
    
    # Update best score
    if current_score > stats['best_score']:
        stats['best_score'] = current_score
    
    # Update skills progress
    for skill, score in session_data.get('skill_scores', {}).items():
        if skill not in stats['skills_progress']:
            stats['skills_progress'][skill] = []
        stats['skills_progress'][skill].append(score)
    
    # Store session
    user_sessions[session_data.get('session_id')] = {
        "user_id": user_id,
        "job_title": session_data.get('job_title'),
        "date": datetime.now().isoformat(),
        "score": current_score,
        "feedback_summary": session_data.get('feedback_summary', '')
    }
    
    return {"success": True, "message": "Progress tracked successfully"}