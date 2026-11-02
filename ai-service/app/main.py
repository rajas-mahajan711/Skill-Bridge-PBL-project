"""
SkillBridge AI/ML Microservice (FastAPI + Python)
Person 3 Contract Interface
"""
import os
import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

# Attempt FastAPI import if dependencies installed, else provide resilient fallback server
try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from app.schemas.skill_schemas import HealthResponse
    from app.api.skills import router as skills_router

    app = FastAPI(
        title="SkillBridge AI Microservice",
        description="Stateless intelligence service for skill extraction, scoring, role matching, and gap analysis",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", response_model=HealthResponse)
    def health_check():
        return {
            "status": "healthy",
            "service": "skillbridge-ai",
            "version": "1.0.0",
            "mode": "live"
        }

    # Register skills extraction router
    app.include_router(skills_router)

except ImportError:
    # Native Python lightweight server for local test verification
    from app.core.extractor import extract_skills

    class SimpleAIHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == '/health':
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {
                    "status": "healthy",
                    "service": "skillbridge-ai-fallback",
                    "version": "1.0.0",
                    "mode": "live"
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
            elif self.path == '/api/v1/roles':
                from app.core.roles import get_benchmark_roles
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "roles": get_benchmark_roles()}).encode('utf-8'))
            else:
                self.send_response(404)
                self.end_headers()

        def do_POST(self):
            if self.path == '/api/v1/skills/extract':
                content_len = int(self.headers.get('Content-Length', 0))
                post_body = self.rfile.read(content_len) if content_len > 0 else b'{}'
                try:
                    payload = json.loads(post_body.decode('utf-8'))
                except Exception:
                    payload = {}
                text = payload.get('text', '')
                source = payload.get('source', 'text')
                results = extract_skills(text, source)
                skills_data = [
                    {
                        "name": r.name,
                        "confidence": r.confidence,
                        "evidence_snippet": r.evidence_snippet or None
                    }
                    for r in results
                ]
                response = {
                    "skills": skills_data,
                    "extracted_count": len(skills_data)
                }
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
            elif self.path == '/api/v1/skills/score':
                content_len = int(self.headers.get('Content-Length', 0))
                post_body = self.rfile.read(content_len) if content_len > 0 else b'{}'
                try:
                    payload = json.loads(post_body.decode('utf-8'))
                except Exception:
                    payload = {}
                try:
                    from app.core.scorer import score_skills
                    from app.schemas.skill_schemas import SkillEvidenceItem
                    items_raw = payload.get('evidence_items', [])
                    weights = payload.get('source_weights', None)
                    items = [SkillEvidenceItem(**it) for it in items_raw]
                    res = score_skills(items, weights)
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(res.model_dump()).encode('utf-8'))
                except Exception as err:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"detail": str(err)}).encode('utf-8'))
            elif self.path == '/api/v1/matches/rank':
                content_len = int(self.headers.get('Content-Length', 0))
                post_body = self.rfile.read(content_len) if content_len > 0 else b'{}'
                try:
                    payload = json.loads(post_body.decode('utf-8'))
                except Exception:
                    payload = {}
                try:
                    from app.core.matcher import match_role
                    student_skills = payload.get('student_skills', [])
                    role_requirements = payload.get('role_requirements', [])
                    res = match_role(student_skills, role_requirements)
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(res.model_dump()).encode('utf-8'))
                except Exception as err:
                    self.send_response(422)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"detail": str(err)}).encode('utf-8'))
            elif self.path == '/api/v1/gaps/analyze':
                content_len = int(self.headers.get('Content-Length', 0))
                post_body = self.rfile.read(content_len) if content_len > 0 else b'{}'
                try:
                    payload = json.loads(post_body.decode('utf-8'))
                except Exception:
                    payload = {}
                try:
                    from app.core.gap_analyzer import analyze_gaps
                    student_skills = payload.get('student_skills', [])
                    role_requirements = payload.get('role_requirements', [])
                    target_proficiency = payload.get('target_proficiency', 80.0)
                    res = analyze_gaps(student_skills, role_requirements, target_proficiency)
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(res.model_dump()).encode('utf-8'))
                except Exception as err:
                    self.send_response(422)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"detail": str(err)}).encode('utf-8'))
            else:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {"status": "ok", "message": "Stateless mock inference completed"}
                self.wfile.write(json.dumps(response).encode('utf-8'))

    def run_fallback(port=8000):
        server = HTTPServer(('0.0.0.0', port), SimpleAIHandler)
        print(f"SkillBridge AI Microservice (Native fallback) listening on port {port}")
        server.serve_forever()

if __name__ == "__main__":
    try:
        import uvicorn
        uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
    except ImportError:
        run_fallback(8000)
