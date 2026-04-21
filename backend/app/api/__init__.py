from .resume_routes import router as resume_router
from .interview_routes import router as interview_router
from .dashboard_routes import router as dashboard_router

__all__ = ['resume_router', 'interview_router', 'dashboard_routes']