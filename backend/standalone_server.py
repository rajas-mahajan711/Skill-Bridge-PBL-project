"""
SkillBridge Standalone Server
Zero-dependency HTTP server implementing full REST API contracts & static UI serving.
Compatible with standard Python 3.8+ without external package requirements.
"""

import sys
import os
import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler

# Add root directory to python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.app.main import app as skillbridge_app

FRONTEND_DIR = os.path.join(parent_dir, "frontend")

class SkillBridgeHTTPHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Role")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)
        # flatten query dict
        flat_query = {k: v[0] for k, v in query.items()}

        # 1. API Route
        if path.startswith("/api/"):
            user_role = self.headers.get("X-User-Role")
            response = skillbridge_app.dispatch(
                path=path,
                method="GET",
                query_params=flat_query,
                body=None,
                user_role=user_role
            )
            
            # Special CSV export handling
            if response.get("content_type") == "text/csv":
                csv_bytes = response.get("csv_content", "").encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/csv; charset=utf-8")
                self.send_header("Content-Disposition", f"attachment; filename=\"{response.get('filename')}\"")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(csv_bytes)
                return

            status_code = response.get("code", 200) if response.get("status") == "error" else 200
            self.send_response(status_code)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response, indent=2).encode("utf-8"))
            return

        # 2. Serve Static Frontend
        self._serve_static_file(path)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)
        flat_query = {k: v[0] for k, v in query.items()}

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b"{}"
        
        try:
            body = json.loads(post_data.decode("utf-8")) if post_data else {}
        except json.JSONDecodeError:
            body = {}

        if path.startswith("/api/"):
            user_role = self.headers.get("X-User-Role")
            response = skillbridge_app.dispatch(
                path=path,
                method="POST",
                query_params=flat_query,
                body=body,
                user_role=user_role
            )
            status_code = response.get("code", 200) if response.get("status") == "error" else 200
            self.send_response(status_code)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response, indent=2).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

    def _serve_static_file(self, path):
        if path == "/" or path == "":
            file_path = os.path.join(FRONTEND_DIR, "index.html")
            content_type = "text/html; charset=utf-8"
        else:
            safe_path = path.lstrip("/").replace("/", os.sep)
            file_path = os.path.join(FRONTEND_DIR, safe_path)
            if not os.path.exists(file_path):
                file_path = os.path.join(FRONTEND_DIR, "index.html")
                content_type = "text/html; charset=utf-8"
            else:
                if file_path.endswith(".js"):
                    content_type = "application/javascript"
                elif file_path.endswith(".css"):
                    content_type = "text/css"
                elif file_path.endswith(".json"):
                    content_type = "application/json"
                elif file_path.endswith(".png"):
                    content_type = "image/png"
                elif file_path.endswith(".svg"):
                    content_type = "image/svg+xml"
                else:
                    content_type = "text/plain"

        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(f"Not Found: {str(e)}".encode("utf-8"))

def run_server(port: int = 8000):
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, SkillBridgeHTTPHandler)
    print(f"SkillBridge Server running at http://127.0.0.1:{port}/")
    print(f"Serving API and Frontend from {FRONTEND_DIR}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down gracefully.")
        httpd.server_close()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)
