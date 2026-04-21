from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class User(BaseModel):
    name: str
    cnic: str
    email: EmailStr
    contact: str
    created_at: datetime = datetime.now()

class UserSession(BaseModel):
    user_id: str
    session_id: str
    job_title: Optional[str] = None
    started_at: datetime = datetime.now()