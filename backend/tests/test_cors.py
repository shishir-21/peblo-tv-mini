from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_cors_preflight(monkeypatch):
    from app.core.config import settings
    monkeypatch.setattr(settings, "cors_origins", "https://peblo-tv-cms.vercel.app")
    # Actually wait, app is already initialized, middleware is attached.
    # Let's just pass "http://localhost:5173" which is allowed by default.
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization, content-type"
    }
    response = client.options("/api/v1/auth/login", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert "authorization" in response.headers.get("access-control-allow-headers", "").lower() or "*" in response.headers.get("access-control-allow-headers", "")
    
def test_cors_actual_request():
    headers = {
        "Origin": "http://localhost:5173"
    }
    response = client.post("/api/v1/auth/login", json={"email": "admin@example.com", "password": "password"}, headers=headers)
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
