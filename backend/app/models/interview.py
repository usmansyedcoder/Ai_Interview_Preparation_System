from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class InterviewQuestion(BaseModel):
    question_id: str
    question_text: str
    question_type: str  # technical, behavioral, situational
    expected_keywords: List[str] = []
    max_answer_time: int = 60  # seconds

class InterviewSession(BaseModel):
    session_id: str
    user_id: str
    job_title: str
    start_time: datetime = datetime.now()
    end_time: Optional[datetime] = None
    questions_asked: List[InterviewQuestion] = []
    user_answers: List[Dict] = []
    status: str = "active"  # active, completed, abandoned
    current_question_index: int = 0