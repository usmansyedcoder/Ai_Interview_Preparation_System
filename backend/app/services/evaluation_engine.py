from typing import Dict, List, Any
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class EvaluationEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
    
    async def evaluate_answer(self, question: str, answer: str, expected_keywords: List[str]) -> Dict:
        """Evaluate a single answer"""
        # Calculate relevance score
        relevance_score = await self._calculate_relevance(question, answer)
        
        # Check for keywords
        keyword_score = await self._check_keywords(answer, expected_keywords)
        
        # Calculate clarity (using length and structure)
        clarity_score = self._calculate_clarity(answer)
        
        # Calculate confidence indicators
        confidence_score = self._calculate_confidence(answer)
        
        overall_score = (relevance_score * 0.4 + 
                        keyword_score * 0.3 + 
                        clarity_score * 0.15 + 
                        confidence_score * 0.15) * 100
        
        return {
            "overall_score": overall_score,
            "relevance_score": relevance_score * 100,
            "keyword_match_score": keyword_score * 100,
            "clarity_score": clarity_score * 100,
            "confidence_score": confidence_score * 100,
            "feedback": await self._generate_feedback(overall_score, keyword_score, clarity_score)
        }
    
    async def _calculate_relevance(self, question: str, answer: str) -> float:
        """Calculate semantic relevance between question and answer"""
        try:
            # Simple keyword overlap for now (can be enhanced with embeddings)
            question_words = set(question.lower().split())
            answer_words = set(answer.lower().split())
            
            if not question_words:
                return 0.5
            
            overlap = len(question_words.intersection(answer_words))
            relevance = overlap / len(question_words)
            return min(relevance, 1.0)
        except:
            return 0.5
    
    async def _check_keywords(self, answer: str, expected_keywords: List[str]) -> float:
        """Check if expected keywords are present in answer"""
        if not expected_keywords:
            return 1.0
        
        answer_lower = answer.lower()
        found_keywords = 0
        
        for keyword in expected_keywords:
            if keyword.lower() in answer_lower:
                found_keywords += 1
        
        return found_keywords / len(expected_keywords)
    
    def _calculate_clarity(self, answer: str) -> float:
        """Calculate clarity based on sentence structure and length"""
        sentences = answer.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
        
        # Ideal sentence length is between 10-25 words
        if 10 <= avg_sentence_length <= 25:
            clarity = 1.0
        elif avg_sentence_length < 5:
            clarity = 0.5
        elif avg_sentence_length > 40:
            clarity = 0.6
        else:
            clarity = 0.8
        
        # Penalize very short answers
        if len(answer.split()) < 10:
            clarity *= 0.7
        
        return clarity
    
    def _calculate_confidence(self, answer: str) -> float:
        """Calculate confidence based on language patterns"""
        confidence_indicators = [
            'i believe', 'i think', 'i am confident', 'definitely', 'certainly',
            'absolutely', 'sure', 'of course'
        ]
        
        uncertainty_indicators = [
            'maybe', 'perhaps', 'i guess', 'not sure', 'might be', 'could be',
            'i think', 'probably', 'sort of', 'kind of'
        ]
        
        answer_lower = answer.lower()
        confidence_count = sum(1 for word in confidence_indicators if word in answer_lower)
        uncertainty_count = sum(1 for word in uncertainty_indicators if word in answer_lower)
        
        if confidence_count == 0 and uncertainty_count == 0:
            return 0.7  # Neutral
        
        total = confidence_count + uncertainty_count
        if total == 0:
            return 0.7
        
        score = confidence_count / total
        return score
    
    async def _generate_feedback(self, overall_score: float, keyword_score: float, clarity_score: float) -> str:
        """Generate feedback based on scores"""
        if overall_score >= 80:
            return "Excellent answer! Great job covering the key points clearly."
        elif overall_score >= 60:
            feedback = "Good answer. "
            if keyword_score < 0.5:
                feedback += "Consider including more specific technical terms. "
            if clarity_score < 0.7:
                feedback += "Try to structure your answer more clearly. "
            return feedback
        elif overall_score >= 40:
            feedback = "Fair answer. "
            if keyword_score < 0.3:
                feedback += "Missing important keywords. "
            if clarity_score < 0.6:
                feedback += "Work on making your answers more structured. "
            return feedback
        else:
            return "Needs improvement. Focus on understanding the core concepts and practicing your responses."