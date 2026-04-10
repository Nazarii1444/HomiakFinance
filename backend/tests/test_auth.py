"""
API tests – /api/auth
Tests: 1-13

Real status codes from exceptions.py:
  - duplicate email/username  → 400
  - invalid credentials       → 400
  - weak password (pydantic)  → 422
  - weak password (our check) → 400
"""
import pytest
from unittest.mock import patch, MagicMock


def _mock_pwned(found: bool = False):
    """Mock requests.get so tests never hit the real pwnedpasswords API."""
    mock_resp = MagicMock()
    mock_resp.text = "ABCDE:5\nFGHIJ:3" if not found else ""
    return mock_resp


@pytest.mark.asyncio
class TestSignup:

    async def test_signup_success(self, client):                        # 1
        with patch("requests.get", return_value=_mock_pwned()):
            r = await client.post("/api/auth/signup", json={
                "username": "newuser1",
                "email": "newuser1@example.com",
                "password": "StrongPass1!",
            })
        assert r.status_code == 200
        body = r.json()
        assert "access_token" in body
        assert "refresh_token" in body

    async def test_signup_duplicate_email(self, client, test_user):     # 2
        with patch("requests.get", return_value=_mock_pwned()):
            r = await client.post("/api/auth/signup", json={
                "username": "another",
                "email": "test@example.com",        # already exists → 400
                "password": "StrongPass1!",
            })
        assert r.status_code == 400
        assert "Email" in r.json()["detail"]

    async def test_signup_duplicate_username(self, client, test_user):  # 3
        with patch("requests.get", return_value=_mock_pwned()):
            r = await client.post("/api/auth/signup", json={
                "username": "testuser",             # already exists → 400
                "email": "unique99@example.com",
                "password": "StrongPass1!",
            })
        assert r.status_code == 400
        assert "Username" in r.json()["detail"]

    async def test_signup_weak_password_pydantic(self, client):         # 4
        """Pydantic rejects too-short password before business logic → 422."""
        r = await client.post("/api/auth/signup", json={
            "username": "weakpwduser",
            "email": "weak@example.com",
            "password": "123",
        })
        assert r.status_code == 422

    async def test_signup_weak_password_no_special_char(self, client):  # 5
        """Passes Pydantic length but fails check_password_strength → 400."""
        with patch("requests.get", return_value=_mock_pwned()):
            r = await client.post("/api/auth/signup", json={
                "username": "weakuser2",
                "email": "weak2@example.com",
                "password": "Abcdefgh1",            # missing special char
            })
        assert r.status_code == 400

    async def test_signup_invalid_email_format(self, client):           # 6
        r = await client.post("/api/auth/signup", json={
            "username": "bademail",
            "email": "not-an-email",
            "password": "StrongPass1!",
        })
        assert r.status_code == 422


@pytest.mark.asyncio
class TestLogin:

    async def test_login_success(self, client, test_user):              # 7
        r = await client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "StrongPass1!",
        })
        assert r.status_code == 200
        body = r.json()
        assert "access_token" in body
        assert "refresh_token" in body

    async def test_login_wrong_password(self, client, test_user):       # 8
        """invalid_credentials_exception → 400 (not 401)"""
        r = await client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "WrongPassword!",
        })
        assert r.status_code == 400

    async def test_login_nonexistent_email(self, client):               # 9
        """invalid_credentials_exception → 400"""
        r = await client.post("/api/auth/login", json={
            "email": "nobody@nowhere.com",
            "password": "StrongPass1!",
        })
        assert r.status_code == 400

    async def test_login_email_case_insensitive(self, client, test_user):  # 10
        r = await client.post("/api/auth/login", json={
            "email": "TEST@EXAMPLE.COM",
            "password": "StrongPass1!",
        })
        assert r.status_code == 200

    async def test_protected_without_token(self, client):               # 11
        r = await client.get("/api/users/me")
        assert r.status_code == 401

    async def test_protected_with_invalid_token(self, client):          # 12
        r = await client.get("/api/users/me",
                              headers={"Authorization": "Bearer totally.invalid.token"})
        assert r.status_code == 401

    async def test_protected_with_valid_token(self, client, auth_headers):  # 13
        r = await client.get("/api/users/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == "test@example.com"