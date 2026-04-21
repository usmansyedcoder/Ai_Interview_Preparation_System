# D:\TNC\TNC_Apprenticeship02\ai-interview-system\backend\app\services\interview_agent.py
from typing import List, Dict, Optional
from app.services.openai_service import OpenAIService
import json

class InterviewAgent:
    def __init__(self, job_title: str, job_requirements: Dict, resume_data: Dict):
        self.job_title = job_title
        self.job_requirements = job_requirements
        self.resume_data = resume_data
        self.openai_service = OpenAIService()
        self.questions = []
        self.current_question_index = 0
        self.user_responses = []
        self.max_questions = 5
        
    async def start_interview(self) -> str:
        """Start the interview by generating dynamic questions"""
        print(f"Starting interview for {self.job_title}")
        
        # Generate dynamic questions based on job and resume
        self.questions = await self.openai_service.generate_interview_questions(
            self.job_title,
            self.job_requirements.get('description', ''),
            self.resume_data,
            self.max_questions
        )
        
        if not self.questions:
            # Fallback questions if generation fails
            self.questions = [
                {
                    "question": f"Can you tell me about your experience relevant to the {self.job_title} position?",
                    "type": "behavioral",
                    "expected_keywords": ["experience", "skills", "projects"],
                    "context": "Assess overall fit"
                },
                {
                    "question": "What are your greatest technical strengths and how have you applied them?",
                    "type": "technical",
                    "expected_keywords": ["technology", "project", "implemented"],
                    "context": "Evaluate technical skills"
                }
            ]
        
        self.current_question_index = 0
        first_question = self.questions[0]
        
        return f"Hello! I'm your AI interviewer for the {self.job_title} position. Let's begin.\n\n{first_question['question']}"
    
    async def get_next_question(self, user_answer: str = None) -> str:
        """Get next question and evaluate previous answer"""
        if user_answer:
            # Evaluate the previous answer
            current_q = self.questions[self.current_question_index - 1] if self.current_question_index > 0 else None
            
            if current_q:
                evaluation = await self.openai_service.evaluate_answer(
                    current_q['question'],
                    user_answer,
                    current_q.get('expected_keywords', []),
                    current_q.get('context', '')
                )
                
                # Store response with evaluation
                self.user_responses.append({
                    'question': current_q['question'],
                    'question_type': current_q.get('type', 'general'),
                    'answer': user_answer,
                    'evaluation': evaluation,
                    'timestamp': None  # Could add datetime
                })
        
        # Move to next question
        self.current_question_index += 1
        
        # Check if interview is complete
        if self.current_question_index >= len(self.questions):
            return "INTERVIEW_COMPLETE"
        
        # Return next question
        next_q = self.questions[self.current_question_index]
        return next_q['question']
    
    async def evaluate_interview(self) -> Dict:
        """Evaluate the entire interview performance using AI"""
        print("Evaluating complete interview...")
        
        if not self.user_responses:
            return {
                "overall_score": 60,
                "technical_score": 60,
                "communication_score": 60,
                "confidence_score": 60,
                "strengths": ["Completed the interview"],
                "weaknesses": ["No responses recorded"],
                "detailed_feedback": "Unable to evaluate due to missing responses.",
                "recommendation": "Needs Review",
                "skills_to_improve": ["Interview preparation"]
            }
        
        try:
            # Get AI-powered final evaluation
            final_evaluation = await self.openai_service.generate_final_evaluation(
                self.user_responses,
                self.job_title,
                self.resume_data
            )
            
            return final_evaluation
        except Exception as e:
            print(f"Error in final evaluation: {str(e)}")
            
            # Calculate basic statistics as fallback
            scores = [r.get('evaluation', {}).get('score', 60) for r in self.user_responses if r.get('evaluation')]
            avg_score = sum(scores) / len(scores) if scores else 65
            
            # Simple evaluation based on answer quality
            long_answers = sum(1 for r in self.user_responses if len(r.get('answer', '')) > 100)
            
            return {
                "overall_score": avg_score,
                "technical_score": avg_score - 5,
                "communication_score": avg_score + 5,
                "confidence_score": avg_score,
                "strengths": [
                    "Answered all questions",
                    "Showed interest in the role",
                    "Completed the interview process"
                ] if long_answers > 0 else ["Completed all questions"],
                "weaknesses": [
                    "Could provide more detailed answers",
                    "Consider using more specific examples"
                ] if long_answers < len(self.user_responses) else ["Continue developing technical depth"],
                "detailed_feedback": f"You completed the interview for {self.job_title}. Your responses show {'good understanding' if avg_score > 70 else 'basic familiarity'} of the topics. {'Consider providing more detailed technical examples' if avg_score < 70 else 'Keep building on your strengths'}.",
                "recommendation": "Consider for next round" if avg_score > 70 else "Further review needed",
                "skills_to_improve": ["Technical depth", "Specific examples"] if avg_score < 75 else ["Advanced concepts"]
            }