import re
from typing import List, Dict
import hashlib
from datetime import datetime

def extract_text_from_pdf(pdf_content: bytes) -> str:
    """Extract text from PDF content"""
    try:
        import PyPDF2
        from io import BytesIO
        
        pdf_file = BytesIO(pdf_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        return text
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def validate_cnic(cnic: str) -> bool:
    """Validate Pakistani CNIC format (12345-1234567-1)"""
    pattern = r'^\d{5}-\d{7}-\d{1}$'
    return bool(re.match(pattern, cnic))

def validate_phone(phone: str) -> bool:
    """Validate Pakistani phone number"""
    pattern = r'^\+92\d{10}$|^03\d{9}$'
    return bool(re.match(pattern, phone))

def generate_session_id(user_id: str, job_title: str) -> str:
    """Generate unique session ID"""
    timestamp = datetime.now().isoformat()
    raw = f"{user_id}_{job_title}_{timestamp}"
    return hashlib.md5(raw.encode()).hexdigest()[:16]

def calculate_match_percentage(resume_skills: List[str], job_requirements: List[str]) -> float:
    """Calculate match percentage between resume skills and job requirements"""
    if not job_requirements:
        return 100.0
    
    resume_skills_lower = [skill.lower() for skill in resume_skills]
    job_requirements_lower = [req.lower() for req in job_requirements]
    
    matched = sum(1 for req in job_requirements_lower if req in resume_skills_lower)
    return (matched / len(job_requirements_lower)) * 100

def format_feedback_for_display(feedback: Dict) -> Dict:
    """Format feedback for frontend display"""
    return {
        "summary": feedback.get('detailed_feedback', ''),
        "scores": {
            "technical": feedback.get('technical_score', 0),
            "communication": feedback.get('communication_score', 0),
            "confidence": feedback.get('confidence_score', 0),
            "overall": feedback.get('overall_score', 0)
        },
        "eligibility": {
            "level": feedback.get('eligibility_level', 'Not Assessed'),
            "score": feedback.get('eligibility_score', 0),
            "recommendation": feedback.get('recommendation', '')
        },
        "action_items": feedback.get('suggested_actions', []),
        "strengths": feedback.get('strengths', []),
        "weaknesses": feedback.get('areas_for_improvement', [])
    }