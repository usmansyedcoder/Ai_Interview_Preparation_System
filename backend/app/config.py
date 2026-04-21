# D:\TNC\TNC_Apprenticeship02\ai-interview-system\backend\app\config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "interview_system")
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
    
    # AI Settings
    MAX_TOKENS = int(os.getenv("MAX_TOKENS", 2000))
    TEMPERATURE = float(os.getenv("TEMPERATURE", 0.7))
    
    # Interview settings
    MAX_INTERVIEW_QUESTIONS = 10
    DEFAULT_INTERVIEW_DURATION = 30  # minutes
    
    # Resume analysis settings
    REQUIRED_SKILLS_WEIGHT = 0.4
    EXPERIENCE_WEIGHT = 0.3
    EDUCATION_WEIGHT = 0.2
    PROJECTS_WEIGHT = 0.1

config = Config()