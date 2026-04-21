# D:\TNC\TNC_Apprenticeship02\ai-interview-system\backend\app\services\openai_service.py
import openai
from openai import OpenAI
from app.config import config
import json
import re
from typing import Dict, List, Any

# Initialize OpenAI client
client = OpenAI(api_key=config.OPENAI_API_KEY)

class OpenAIService:
    @staticmethod
    async def generate_completion(prompt: str, system_prompt: str = None, temperature: float = None) -> str:
        """Generate completion using OpenAI"""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            response = client.chat.completions.create(
                model=config.OPENAI_MODEL,
                messages=messages,
                temperature=temperature or config.TEMPERATURE,
                max_tokens=config.MAX_TOKENS
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            raise e
    
    @staticmethod
    async def extract_resume_data(resume_text: str) -> Dict:
        """Extract structured data from resume text"""
        system_prompt = """You are a professional resume parser. Extract structured information from the resume text.
        Return ONLY valid JSON with the following structure:
        {
            "name": "Full name",
            "email": "Email address",
            "phone": "Phone number",
            "skills": [{"name": "Skill name", "level": "Beginner/Intermediate/Advanced/Expert"}],
            "education": [{"degree": "Degree name", "institution": "University name", "year": "Year", "score": "GPA/Percentage"}],
            "experience": [{"title": "Job title", "company": "Company name", "duration": "Time period", "responsibilities": ["Responsibility 1", "Responsibility 2"]}],
            "projects": [{"name": "Project name", "technologies": ["Tech1", "Tech2"], "description": "Project description"}],
            "certifications": ["Cert1", "Cert2"],
            "languages": ["Language1", "Language2"]
        }
        If information is missing, use empty strings or empty lists."""
        
        prompt = f"Extract structured information from this resume:\n\n{resume_text[:8000]}"  # Limit length
        
        response = await OpenAIService.generate_completion(prompt, system_prompt, temperature=0.1)
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        else:
            raise ValueError("Failed to extract JSON from response")
    
    @staticmethod
    async def analyze_resume_for_job(resume_data: Dict, job_title: str, job_description: str) -> Dict:
        """Analyze resume against job requirements"""
        system_prompt = """You are an expert HR analyst. Analyze the resume against the job requirements.
        Return ONLY valid JSON with this structure:
        {
            "overall_score": 0-100,
            "skill_match_percentage": 0-100,
            "experience_match": 0-100,
            "education_match": 0-100,
            "weak_points": ["Weakness 1", "Weakness 2"],
            "strong_points": ["Strength 1", "Strength 2"],
            "suggestions": ["Suggestion 1", "Suggestion 2"],
            "missing_keywords": ["Missing keyword 1", "Missing keyword 2"]
        }
        Be realistic and detailed in your analysis."""
        
        prompt = f"""
        Job Title: {job_title}
        Job Description: {job_description if job_description else 'Not provided'}
        
        Resume Data:
        {json.dumps(resume_data, indent=2)}
        
        Analyze the match between this resume and the job requirements. Provide detailed scores and feedback.
        """
        
        response = await OpenAIService.generate_completion(prompt, system_prompt, temperature=0.3)
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        else:
            # Return default analysis if parsing fails
            return {
                "overall_score": 70,
                "skill_match_percentage": 65,
                "experience_match": 70,
                "education_match": 75,
                "weak_points": ["Unable to analyze completely"],
                "strong_points": ["Resume submitted"],
                "suggestions": ["Please ensure resume is properly formatted"],
                "missing_keywords": ["Unable to determine"]
            }
    
    @staticmethod
    async def generate_interview_questions(job_title: str, job_description: str, resume_data: Dict, question_count: int = 5) -> List[Dict]:
        """Generate dynamic interview questions based on job and resume"""
        system_prompt = """You are an expert technical interviewer. Generate relevant interview questions based on the job requirements and candidate's resume.
        Return ONLY valid JSON as a list of questions with this structure:
        [
            {
                "question": "Question text",
                "type": "technical/behavioral/situational",
                "expected_keywords": ["keyword1", "keyword2"],
                "context": "Why this question is asked"
            }
        ]
        Questions should be challenging but fair, mixing technical and behavioral aspects."""
        
        prompt = f"""
        Job Title: {job_title}
        Job Description: {job_description if job_description else 'Not provided'}
        
        Candidate's Resume:
        - Skills: {resume_data.get('skills', [])}
        - Experience: {resume_data.get('experience', [])}
        - Education: {resume_data.get('education', [])}
        - Projects: {resume_data.get('projects', [])}
        
        Generate {question_count} unique, personalized interview questions that:
        1. Test relevant technical skills mentioned in the job
        2. Explore gaps in the candidate's resume
        3. Assess behavioral competencies for this role
        4. Are specific to this job title and industry
        
        Make questions dynamic and unpredictable based on the candidate's background.
        """
        
        response = await OpenAIService.generate_completion(prompt, system_prompt, temperature=0.8)
        
        # Extract JSON from response
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        else:
            # Fallback questions
            return [
                {
                    "question": f"Tell me about your experience with technologies relevant to the {job_title} position.",
                    "type": "technical",
                    "expected_keywords": ["experience", "project", "skill"],
                    "context": "Assess technical background"
                },
                {
                    "question": "Describe a challenging problem you solved in your previous role.",
                    "type": "behavioral",
                    "expected_keywords": ["challenge", "solution", "learned"],
                    "context": "Evaluate problem-solving skills"
                }
            ]
    
    @staticmethod
    async def evaluate_answer(question: str, answer: str, expected_keywords: List[str], context: str) -> Dict:
        """Evaluate a single answer using AI"""
        system_prompt = """You are an expert interviewer evaluating candidate responses.
        Return ONLY valid JSON with this structure:
        {
            "score": 0-100,
            "relevance": 0-100,
            "clarity": 0-100,
            "technical_accuracy": 0-100,
            "confidence": 0-100,
            "feedback": "Detailed feedback on the answer",
            "strengths": ["Strength 1", "Strength 2"],
            "improvements": ["Improvement 1", "Improvement 2"]
        }"""
        
        prompt = f"""
        Question: {question}
        Context: {context}
        Expected Keywords: {', '.join(expected_keywords)}
        
        Candidate's Answer: {answer}
        
        Evaluate this answer based on:
        1. Relevance to the question
        2. Clarity and structure
        3. Technical accuracy (if technical question)
        4. Demonstrated confidence
        5. Use of relevant keywords and concepts
        
        Provide a fair, detailed evaluation.
        """
        
        response = await OpenAIService.generate_completion(prompt, system_prompt, temperature=0.3)
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        else:
            # Basic fallback evaluation
            word_count = len(answer.split())
            score = min(85, max(40, word_count / 10))
            return {
                "score": score,
                "relevance": score - 5,
                "clarity": score,
                "technical_accuracy": score - 10,
                "confidence": score,
                "feedback": "Answer evaluated. " + ("Good length and content." if word_count > 50 else "Consider providing more detailed answers."),
                "strengths": ["Answered the question"],
                "improvements": ["Provide more specific examples" if word_count < 50 else "Continue building on your answers"]
            }
    
    @staticmethod
    async def generate_final_evaluation(responses: List[Dict], job_title: str, resume_data: Dict) -> Dict:
        """Generate comprehensive final evaluation"""
        system_prompt = """You are an expert hiring manager. Provide a comprehensive evaluation of the candidate's interview performance.
        Return ONLY valid JSON with this structure:
        {
            "overall_score": 0-100,
            "technical_score": 0-100,
            "communication_score": 0-100,
            "problem_solving_score": 0-100,
            "cultural_fit_score": 0-100,
            "strengths": ["Strength 1", "Strength 2", "Strength 3"],
            "weaknesses": ["Weakness 1", "Weakness 2"],
            "detailed_feedback": "Comprehensive feedback paragraph",
            "recommendation": "Hire/Strong Hire/Consider/Not Recommended",
            "skills_to_improve": ["Skill 1", "Skill 2"],
            "next_steps": ["Suggestion 1", "Suggestion 2"]
        }"""
        
        # Format responses for prompt
        responses_text = "\n".join([
            f"Q: {r['question']}\nA: {r['answer']}\nScore: {r.get('evaluation', {}).get('score', 0)}"
            for r in responses
        ])
        
        prompt = f"""
        Job Title: {job_title}
        Candidate Background: {json.dumps(resume_data, indent=2)}
        
        Interview Q&A:
        {responses_text}
        
        Provide a final evaluation of this candidate's suitability for the role.
        Be specific about strengths, areas for improvement, and hiring recommendation.
        """
        
        response = await OpenAIService.generate_completion(prompt, system_prompt, temperature=0.3)
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        else:
            # Fallback evaluation
            avg_score = sum(r.get('evaluation', {}).get('score', 60) for r in responses) / len(responses) if responses else 65
            return {
                "overall_score": avg_score,
                "technical_score": avg_score - 5,
                "communication_score": avg_score + 5,
                "problem_solving_score": avg_score,
                "cultural_fit_score": avg_score + 3,
                "strengths": ["Completed all questions", "Showed interest in role"],
                "weaknesses": ["Could provide more detailed answers"],
                "detailed_feedback": f"The candidate completed the interview for {job_title}. Based on their responses, they show potential but may need additional preparation.",
                "recommendation": "Consider" if avg_score > 65 else "Not Recommended",
                "skills_to_improve": ["Technical depth", "Specific examples"],
                "next_steps": ["Review feedback", "Practice interview questions"]
            }
        