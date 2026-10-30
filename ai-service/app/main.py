"""
SkillBridge AI/ML Microservice
FastAPI application providing skill scoring, gap analysis, role matching,
and learning recommendations.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.analysis import router as analysis_router

app = FastAPI(
    title="SkillBridge AI Skill Intelligence Service",
    description="Microservice providing evidence-backed skill scoring, confidence indicators, role matching, and gap analysis.",
    version="1.0.0",
)

# CORS middleware for communication from Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Internal service, can be restricted via environment variables
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "SkillBridge AI/ML Microservice",
        "version": "1.0.0",
        "engine": "Deterministic rule-based baseline",
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "message": "SkillBridge AI Skill Intelligence Service is operational.",
        "docs_url": "/docs",
    }


# Include analysis router
app.include_router(analysis_router)
