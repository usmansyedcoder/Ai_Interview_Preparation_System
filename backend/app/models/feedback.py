from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class InterviewFeedback(BaseModel):
    user_name: str
    job_title: str
    resume_score: float
    interview_score: float
    eligibility_score: float
    eligibility_level: str  # Highly Eligible, Eligible, Partially Eligible, Not Eligible
    recommendation: str
    strengths: List[str]
    areas_for_improvement: List[str]
    skill_gaps: List[str]
    detailed_feedback: str
    suggested_actions: List[str]
    interview_transcript: List[dict]
    generated_at: datetime = datetime.now()
    
class PerformanceMetrics(BaseModel):
    communication_clarity: float
    technical_accuracy: float
    confidence_level: float
    relevance_of_answers: float
    overall_score: float