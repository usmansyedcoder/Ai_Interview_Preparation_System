# D:\TNC\TNC_Apprenticeship02\ai-interview-system\backend\app\services\resume_analyzer.py
from typing import Dict, List, Optional
from app.models.resume import ResumeData, Skill, Education, Experience, Project, ResumeAnalysis
from app.services.openai_service import OpenAIService
import json

class ResumeAnalyzer:
    def __init__(self):
        self.openai_service = OpenAIService()

    async def extract_resume_data(self, resume_text: str) -> ResumeData:
        """Extract structured data using AI"""
        try:
            print("Extracting resume data with AI...")
            extracted_data = await self.openai_service.extract_resume_data(resume_text)
            
            # Convert to ResumeData model
            skills = [Skill(**skill) for skill in extracted_data.get('skills', [])]
            education = [Education(**edu) for edu in extracted_data.get('education', [])]
            experience = [Experience(**exp) for exp in extracted_data.get('experience', [])]
            projects = [Project(**proj) for proj in extracted_data.get('projects', [])]
            
            return ResumeData(
                name=extracted_data.get('name', 'Unknown'),
                email=extracted_data.get('email', ''),
                phone=extracted_data.get('phone', ''),
                skills=skills,
                education=education,
                experience=experience,
                projects=projects,
                certifications=extracted_data.get('certifications', []),
                languages=extracted_data.get('languages', [])
            )
        except Exception as e:
            print(f"Error extracting resume data: {str(e)}")
            # Return basic data structure on error
            return ResumeData(
                name="User",
                email="",
                phone="",
                skills=[],
                education=[],
                experience=[],
                projects=[],
                certifications=[],
                languages=["English"]
            )

    async def analyze_resume_for_job(self, resume_data: ResumeData, job_title: str, job_description: str = "") -> ResumeAnalysis:
        """Analyze resume against job requirements using AI"""
        try:
            print(f"Analyzing resume for job: {job_title}")
            
            # Convert resume data to dict
            resume_dict = resume_data.dict()
            
            # Get AI analysis
            analysis = await self.openai_service.analyze_resume_for_job(
                resume_dict, 
                job_title, 
                job_description
            )
            
            return ResumeAnalysis(
                resume_data=resume_data,
                job_title=job_title,
                overall_score=analysis.get('overall_score', 70),
                skill_match_percentage=analysis.get('skill_match_percentage', 65),
                experience_match=analysis.get('experience_match', 70),
                education_match=analysis.get('education_match', 75),
                weak_points=analysis.get('weak_points', ['Unable to fully analyze']),
                strong_points=analysis.get('strong_points', ['Resume submitted for review']),
                suggestions=analysis.get('suggestions', ['Review job requirements carefully']),
                missing_keywords=analysis.get('missing_keywords', [])
            )
        except Exception as e:
            print(f"Error analyzing resume: {str(e)}")
            # Return default analysis on error
            return ResumeAnalysis(
                resume_data=resume_data,
                job_title=job_title,
                overall_score=70,
                skill_match_percentage=65,
                experience_match=70,
                education_match=75,
                weak_points=["Analysis temporarily unavailable"],
                strong_points=["Resume received"],
                suggestions=["Please try again"],
                missing_keywords=[]
            )