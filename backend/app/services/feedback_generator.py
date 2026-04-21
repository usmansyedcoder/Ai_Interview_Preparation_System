from app.models.feedback import InterviewFeedback
import openai
from app.config import config
from typing import Dict  # ← add this line


openai.api_key = config.OPENAI_API_KEY

class FeedbackGenerator:
    @staticmethod
    async def generate_comprehensive_report(
        resume_analysis, interview_evaluation: Dict, job_title: str
    ) -> InterviewFeedback:
        prompt = f"""
        Generate comprehensive feedback report for {job_title}:
        Resume score: {resume_analysis.overall_score}
        Interview score: {interview_evaluation.get('overall_score', 0)}
        
        Resume analysis: {resume_analysis.model_dump_json()}
        Interview eval: {interview_evaluation}
        
        Return ONLY valid JSON for InterviewFeedback model.
        Make it personalized, actionable, and realistic.
        """
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5
        )
        
        feedback_dict = json.loads(response.choices[0].message.content)
        return InterviewFeedback(**feedback_dict)