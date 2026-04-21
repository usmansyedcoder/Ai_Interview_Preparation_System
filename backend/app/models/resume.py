from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class Skill(BaseModel):
    name: str
    level: Optional[str] = None  # Beginner, Intermediate, Advanced, Expert

class Education(BaseModel):
    degree: str
    institution: str
    year: str
    score: Optional[str] = None

class Experience(BaseModel):
    title: str
    company: str
    duration: str
    responsibilities: List[str]

class Project(BaseModel):
    name: str
    technologies: List[str]
    description: str

class ResumeData(BaseModel):
    name: str
    email: str
    phone: str
    skills: List[Skill]
    education: List[Education]
    experience: List[Experience]
    projects: List[Project]
    certifications: List[str]
    languages: List[str]

class ResumeAnalysis(BaseModel):
    resume_data: ResumeData
    job_title: str
    overall_score: float  # 0-100
    skill_match_percentage: float
    experience_match: float
    education_match: float
    weak_points: List[str]
    strong_points: List[str]
    suggestions: List[str]
    missing_keywords: List[str]
    analyzed_at: datetime = datetime.now()