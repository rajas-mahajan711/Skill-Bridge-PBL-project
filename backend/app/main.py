"""
SkillBridge - Member 4 Backend API (FastAPI)
Scope: Faculty / T&P & Recruiter / Company Workstream
Implements:
- Batch-level skill distribution & skill gap analytics
- Multi-parameter filtering (department, batch, role, skill)
- Student readiness & evidence verification dossier
- Job description creation & NLP requirement parsing integration
- Candidate ranking & explainable match scoring engine
- Role-based authorization & privacy sanitization
"""

from typing import Optional, List, Dict, Any
from backend.app.routers.faculty import handle_faculty_request
from backend.app.routers.recruiter import handle_recruiter_request
from backend.app.core.auth import AuthException

class SkillBridgeApp:
    """
    Unified Application Dispatcher matching FastAPI ASGI conventions.
    Can be mounted into a FastAPI instance or run via ASGI/HTTP server.
    """
    def __init__(self):
        self.title = "SkillBridge Faculty & Recruiter API"
        self.version = "1.0.0"

    def dispatch(
        self,
        path: str,
        method: str = "GET",
        query_params: Optional[Dict[str, str]] = None,
        body: Optional[Dict[str, Any]] = None,
        user_role: Optional[str] = None
    ) -> Dict[str, Any]:
        """Routes requests to the appropriate role-protected router."""
        params = query_params or {}

        # 1. Health check & meta
        if path == "/api/health" or path == "/health":
            return {
                "status": "healthy",
                "app": "SkillBridge",
                "member_scope": "Member 4 - Faculty/T&P & Recruiter Workstream",
                "version": self.version
            }

        # 2. Faculty / T&P Routes
        if path.startswith("/api/v1/faculty"):
            role = user_role or "faculty_tp"
            try:
                return handle_faculty_request(
                    path=path,
                    method=method,
                    query_params=params,
                    body=body,
                    user_role=role
                )
            except AuthException as ae:
                return {"status": "error", "message": ae.message, "code": ae.status_code}

        # 3. Recruiter / Company Routes
        if path.startswith("/api/v1/recruiter"):
            role = user_role or "recruiter"
            try:
                return handle_recruiter_request(
                    path=path,
                    method=method,
                    query_params=params,
                    body=body,
                    user_role=role
                )
            except AuthException as ae:
                return {"status": "error", "message": ae.message, "code": ae.status_code}

        return {"status": "error", "message": f"Path '{path}' not found", "code": 404}

app = SkillBridgeApp()
