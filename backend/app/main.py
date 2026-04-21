# D:\TNC\TNC_Apprenticeship02\ai-interview-system\backend\app\main.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, List
import PyPDF2
import io
import uvicorn
import uuid
from datetime import datetime
import random
import json
import re
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Interview System", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store interview sessions in memory
interview_sessions = {}

# ============== HELPER FUNCTIONS ==============

def generate_dynamic_questions(job_title: str, job_description: str, resume_data: Dict) -> List[Dict]:
    """Generate dynamic questions based on job and resume"""
    
    # Extract skills from resume
    resume_skills = [skill.get('name', '').lower() for skill in resume_data.get('skills', [])]
    resume_projects = [proj.get('name', '') for proj in resume_data.get('projects', [])]
    resume_experience = resume_data.get('experience', [])
    
    # Extract years of experience
    years_exp = 0
    for exp in resume_experience:
        duration = exp.get('duration', '')
        numbers = re.findall(r'\d+', duration)
        if numbers:
            years_exp += int(numbers[0])
    
    questions = []
    
    # Generate technical questions based on resume skills
    if resume_skills:
        selected_skills = random.sample(resume_skills, min(2, len(resume_skills)))
        for skill in selected_skills:
            questions.append({
                "question": f"Your resume shows expertise in {skill.capitalize()}. Can you walk me through a complex problem you solved using {skill.capitalize()}? What was your approach and what were the results?",
                "type": "technical",
                "expected_keywords": [skill, "problem", "solution", "implemented"],
                "context": f"Testing depth of knowledge in {skill}"
            })
    
    # Generate questions about missing skills
    missing_skills_list = ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Redis', 'MongoDB', 'GraphQL', 'TypeScript']
    missing_skills = random.sample(missing_skills_list, min(2, len(missing_skills_list)))
    for missing_skill in missing_skills:
        questions.append({
            "question": f"The {job_title} role often requires {missing_skill}. Do you have experience with this technology? If not, how would you go about learning it quickly for this position?",
            "type": "technical",
            "expected_keywords": ["learn", "adapt", "resource", "practice"],
            "context": f"Assessing adaptability and learning capability for {missing_skill}"
        })
    
    # Generate questions about projects
    if resume_projects:
        selected_project = random.choice(resume_projects)
        questions.append({
            "question": f"I see you worked on '{selected_project}'. What was the biggest technical challenge you faced, and how did you overcome it? What would you do differently if you were to rebuild it today?",
            "type": "technical",
            "expected_keywords": ["challenge", "solution", "learned", "improve"],
            "context": "Evaluating problem-solving and reflection"
        })
    
    # Job-specific technical question
    tech_areas = ['scalability', 'security', 'performance', 'maintainability', 'testing']
    selected_area = random.choice(tech_areas)
    questions.append({
        "question": f"For the {job_title} position, how would you ensure {selected_area} in your code? Can you provide specific examples from your past experience?",
        "type": "technical",
        "expected_keywords": [selected_area, "example", "practice", "implement"],
        "context": f"Testing knowledge of {selected_area} best practices"
    })
    
    # Behavioral question
    questions.append({
        "question": "Describe a situation where you had to work with a difficult team member or stakeholder. How did you handle it and what was the outcome?",
        "type": "behavioral",
        "expected_keywords": ["communicate", "resolve", "understand", "collaborate"],
        "context": "Assessing interpersonal and conflict resolution skills"
    })
    
    # Situational question based on job
    random_tech = random.choice(['API', 'database', 'frontend', 'backend', 'mobile'])
    questions.append({
        "question": f"Imagine you're asked to build a new {random_tech} feature from scratch for our system. Walk me through your development process from requirements to deployment.",
        "type": "situational",
        "expected_keywords": ["requirements", "design", "implement", "test", "deploy"],
        "context": "Evaluating full development lifecycle understanding"
    })
    
    # Experience-based question
    if years_exp > 0:
        questions.append({
            "question": f"With {years_exp} years of experience, you've likely seen different approaches to software development. What's one practice you strongly believe in and why?",
            "type": "behavioral",
            "expected_keywords": ["practice", "believe", "experience", "result"],
            "context": "Understanding their software development philosophy"
        })
    
    # Randomize question order
    random.shuffle(questions)
    
    # Return top 6-8 questions
    return questions[:random.randint(6, 8)]

# ============== API ENDPOINTS ==============

@app.get("/")
async def root():
    return {
        "message": "AI Interview System API", 
        "status": "running", 
        "version": "2.0.0",
        "features": [
            "AI-powered resume analysis",
            "Dynamic question generation",
            "Intelligent answer evaluation",
            "Comprehensive reporting"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    job_title: str = Form(...),
    job_description: Optional[str] = Form(None)
):
    """Upload and analyze resume with dynamic scoring"""
    try:
        print(f"=== Resume Upload Request ===")
        print(f"File: {file.filename}")
        print(f"Job Title: {job_title}")
        
        # Read PDF file
        contents = await file.read()
        pdf_file = io.BytesIO(contents)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Extract text from PDF
        resume_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                resume_text += text
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
        print(f"Extracted {len(resume_text)} characters")
        
        # Extract information from resume
        resume_lower = resume_text.lower()
        common_skills = ["python", "javascript", "react", "node.js", "java", "c++", "sql", 
                        "mongodb", "aws", "docker", "git", "html", "css", "typescript", "angular"]
        
        found_skills = []
        for skill in common_skills:
            if skill in resume_lower:
                found_skills.append({"name": skill, "level": "Intermediate"})
        
        # Extract project names
        project_pattern = r'project[s]?\s*:?\s*([^\n\.]+)'
        projects_found = re.findall(project_pattern, resume_lower, re.IGNORECASE)
        projects = [{"name": proj.strip(), "technologies": [], "description": ""} for proj in projects_found[:3]]
        
        # Extract years of experience
        exp_pattern = r'(\d+)\s*(?:\+?\s*)?years?'
        exp_match = re.search(exp_pattern, resume_lower)
        years_exp = int(exp_match.group(1)) if exp_match else 0
        
        word_count = len(resume_text.split())
        
        # Calculate scores
        base_score = min(95, 65 + (word_count // 100))
        skill_score = min(90, 60 + (len(found_skills) * 5))
        exp_score = min(85, 55 + (years_exp * 5))
        
        overall_score = (base_score + skill_score + exp_score) / 3
        
        # Prepare response
        response = {
            "success": True,
            "analysis": {
                "overall_score": round(overall_score, 1),
                "skill_match_percentage": round(skill_score, 1),
                "experience_match": round(exp_score, 1),
                "education_match": 75.0,
                "weak_points": [],
                "strong_points": [],
                "suggestions": [],
                "missing_keywords": []
            },
            "resume_data": {
                "name": "Candidate",
                "email": "candidate@example.com",
                "phone": "+92 XXX XXXXXXX",
                "skills": found_skills if found_skills else [{"name": "Python", "level": "Intermediate"}],
                "education": [
                    {"degree": "Bachelor's in Computer Science", "institution": "University", "year": "2023"}
                ],
                "experience": [],
                "projects": projects,
                "certifications": [],
                "languages": ["English", "Urdu"],
                "years_of_experience": years_exp,
                "resume_text_preview": resume_text[:500]
            }
        }
        
        # Add dynamic feedback
        if len(found_skills) < 3:
            response["analysis"]["weak_points"].append("Limited technical skills mentioned")
            response["analysis"]["suggestions"].append("Add more technical skills relevant to the job")
        else:
            response["analysis"]["strong_points"].append(f"Good technical foundation with {len(found_skills)} skills")
        
        if years_exp == 0:
            response["analysis"]["weak_points"].append("No clear years of experience mentioned")
        else:
            response["analysis"]["strong_points"].append(f"{years_exp} years of experience")
        
        # Identify missing keywords from job title
        job_keywords = job_title.lower().split()
        for keyword in job_keywords:
            if keyword not in resume_lower and len(keyword) > 3:
                response["analysis"]["missing_keywords"].append(keyword)
        
        print(f"Analysis complete! Score: {overall_score}")
        
        return response
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

@app.post("/api/interview/start")
async def start_interview(request: Dict):
    """Start a new interview session with dynamic questions"""
    try:
        print(f"=== Starting Interview Session ===")
        job_title = request.get('job_title', 'the position')
        job_description = request.get('job_description', '')
        resume_data = request.get('resume_data', {})
        
        # Generate dynamic questions
        questions = generate_dynamic_questions(job_title, job_description, resume_data)
        
        session_id = str(uuid.uuid4())
        
        # Store session
        interview_sessions[session_id] = {
            "job_title": job_title,
            "job_description": job_description,
            "resume_data": resume_data,
            "questions": questions,
            "current_question": 0,
            "answers": [],
            "started_at": datetime.now().isoformat()
        }
        
        # Create personalized intro
        resume_skills = [s.get('name') for s in resume_data.get('skills', [])]
        intro = f"Hello! I'm your AI interviewer for the {job_title} position. "
        if resume_skills:
            intro += f"I see you have experience with {', '.join(resume_skills[:3])}. "
        intro += f"\n\nLet's begin with the first question.\n\n{questions[0]['question']}"
        
        print(f"Session created: {session_id}")
        print(f"Generated {len(questions)} dynamic questions")
        
        return {
            "session_id": session_id,
            "question": intro,
            "total_questions": len(questions),
            "success": True
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")

@app.post("/api/interview/answer")
async def submit_answer(request: Dict):
    """Submit answer and get next question"""
    try:
        session_id = request.get('session_id')
        answer = request.get('answer', '')
        
        session = interview_sessions.get(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Interview session not found")
        
        questions = session['questions']
        current_q_index = session['current_question']
        
        if current_q_index >= len(questions):
            return {"interview_complete": True, "evaluation": {}}
        
        current_question = questions[current_q_index]
        
        # Evaluate answer
        word_count = len(answer.split())
        expected_keywords = current_question.get('expected_keywords', [])
        found_keywords = [kw for kw in expected_keywords if kw.lower() in answer.lower()]
        keyword_score = len(found_keywords) / len(expected_keywords) if expected_keywords else 0.7
        
        if word_count > 100:
            length_score = 0.9
            feedback = "Excellent detailed answer!"
        elif word_count > 50:
            length_score = 0.7
            feedback = "Good answer. Consider adding more specific examples."
        elif word_count > 20:
            length_score = 0.5
            feedback = "Fair answer. Could you provide more details?"
        else:
            length_score = 0.3
            feedback = "Your answer is quite brief. Please elaborate more."
        
        overall_score = (length_score * 0.6 + keyword_score * 0.4) * 100
        
        # Store answer
        session['answers'].append({
            "question": current_question['question'],
            "answer": answer,
            "evaluation": {
                "score": round(overall_score, 1),
                "feedback": feedback,
                "word_count": word_count
            },
            "timestamp": datetime.now().isoformat()
        })
        
        # Move to next question
        session['current_question'] += 1
        
        # Check if complete
        if session['current_question'] >= len(questions):
            total_score = sum(a['evaluation']['score'] for a in session['answers'])
            avg_score = total_score / len(session['answers']) if session['answers'] else 70
            
            evaluation = {
                "overall_score": round(avg_score, 1),
                "technical_score": round(avg_score - 5, 1),
                "communication_score": round(avg_score + 5, 1),
                "detailed_feedback": f"You completed the interview for {session['job_title']}. Your overall score is {round(avg_score, 1)}/100.",
                "recommendation": "Consider for next round" if avg_score > 65 else "Further review needed",
                "total_questions": len(session['answers'])
            }
            
            return {
                "interview_complete": True,
                "evaluation": evaluation
            }
        
        # Return next question
        next_question = questions[session['current_question']]
        
        return {
            "interview_complete": False,
            "question": next_question['question'],
            "current_progress": f"Question {session['current_question'] + 1} of {len(questions)}",
            "feedback": feedback
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process answer: {str(e)}")

@app.get("/api/interview/evaluate/{session_id}")
async def get_evaluation(session_id: str):
    """Get interview evaluation"""
    session = interview_sessions.get(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    answers = session.get('answers', [])
    if answers:
        total_score = sum(a['evaluation']['score'] for a in answers)
        avg_score = total_score / len(answers)
    else:
        avg_score = 0
    
    return {
        "session_id": session_id,
        "job_title": session['job_title'],
        "overall_score": round(avg_score, 1),
        "total_questions": len(answers),
        "completed": session['current_question'] >= len(session.get('questions', [])),
        "answers": answers
    }

@app.get("/api/test")
async def test():
    return {
        "message": "API is working!",
        "endpoints": [
            "GET /",
            "GET /health",
            "POST /api/resume/upload",
            "POST /api/interview/start",
            "POST /api/interview/answer",
            "GET /api/interview/evaluate/{session_id}"
        ]
    }

# ============== MAIN ==============

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🤖 AI INTERVIEW SYSTEM - BACKEND")
    print("="*60)
    print(f"📡 Server: http://localhost:8000")
    print(f"📝 Health check: http://localhost:8000/health")
    print(f"📤 Upload: POST http://localhost:8000/api/resume/upload")
    print(f"🎯 Interview: POST http://localhost:8000/api/interview/start")
    print(f"💬 Answer: POST http://localhost:8000/api/interview/answer")
    print("="*60)
    print("✨ Features:")
    print("   • Dynamic question generation based on resume")
    print("   • Intelligent answer evaluation")
    print("   • Personalized interview experience")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="127.0.0.1", port=8000)

    # Add to your main.py backend file

@app.get("/api/dashboard/stats/{user_id}")
async def get_user_stats(user_id: str):
    """Get real user statistics from database"""
    # In production, fetch from database
    # For now, return calculated stats from interview sessions
    user_sessions = [s for s in interview_sessions.values() if s.get('user_id') == user_id]
    
    if not user_sessions:
        return {
            "totalInterviews": 0,
            "averageScore": 0,
            "bestScore": 0,
            "worstScore": 0,
            "totalQuestions": 0,
            "averageResponseTime": 0,
            "improvementRate": 0
        }
    
    scores = []
    total_questions = 0
    
    for session in user_sessions:
        if session.get('answers'):
            avg_score = sum(a['evaluation']['score'] for a in session['answers']) / len(session['answers'])
            scores.append(avg_score)
            total_questions += len(session['answers'])
    
    if scores:
        avg_score = sum(scores) / len(scores)
        best_score = max(scores)
        worst_score = min(scores)
        
        # Calculate improvement rate (compare first 3 vs last 3)
        improvement = 0
        if len(scores) >= 6:
            first_half = sum(scores[:3]) / 3
            second_half = sum(scores[-3:]) / 3
            improvement = ((second_half - first_half) / first_half) * 100
    else:
        avg_score = best_score = worst_score = improvement = 0
    
    return {
        "totalInterviews": len(user_sessions),
        "averageScore": round(avg_score, 1),
        "bestScore": round(best_score, 1),
        "worstScore": round(worst_score, 1),
        "totalQuestions": total_questions,
        "averageResponseTime": 45,  # Calculate from timestamps
        "improvementRate": round(improvement, 1)
    }

@app.get("/api/dashboard/history/{user_id}")
async def get_interview_history(user_id: str, limit: int = 10):
    """Get user's interview history"""
    user_sessions = [s for s in interview_sessions.values() if s.get('user_id') == user_id]
    
    history = []
    for session in user_sessions:
        answers = session.get('answers', [])
        if answers:
            avg_score = sum(a['evaluation']['score'] for a in answers) / len(answers)
        else:
            avg_score = 0
            
        history.append({
            "session_id": session.get('session_id'),
            "job_title": session.get('job_title'),
            "date": session.get('started_at'),
            "score": round(avg_score, 1),
            "feedback": "Completed interview"
        })
    
    # Sort by date descending
    history.sort(key=lambda x: x['date'], reverse=True)
    return history[:limit]

@app.get("/api/dashboard/skill-analysis/{user_id}")
async def get_skill_analysis(user_id: str):
    """Analyze user's skills based on interview performance"""
    user_sessions = [s for s in interview_sessions.values() if s.get('user_id') == user_id]
    
    # Aggregate skill scores from all interviews
    skill_scores = {}
    
    for session in user_sessions:
        resume_data = session.get('resume_data', {})
        skills = resume_data.get('skills', [])
        
        for skill in skills:
            skill_name = skill.get('name')
            if skill_name not in skill_scores:
                skill_scores[skill_name] = []
            # Add scores from interview answers related to this skill
            for answer in session.get('answers', []):
                if skill_name.lower() in answer.get('answer', '').lower():
                    skill_scores[skill_name].append(answer['evaluation']['score'])
    
    # Calculate average scores
    avg_scores = {skill: sum(scores)/len(scores) for skill, scores in skill_scores.items() if scores}
    
    # Categorize skills
    strong_skills = [skill for skill, score in avg_scores.items() if score >= 75]
    weak_skills = [skill for skill, score in avg_scores.items() if score < 60]
    
    return {
        "strong_skills": strong_skills[:5],
        "weak_skills": weak_skills[:5],
        "recommended_focus": weak_skills[:3],
        "skill_scores": avg_scores
    }