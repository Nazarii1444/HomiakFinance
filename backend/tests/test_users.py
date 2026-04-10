"""
API tests – /api/users
Tests: 13-20
"""
import pytest


@pytest.mark.asyncio
class TestUsersAPI:

    async def test_get_me_returns_correct_user(self, client, auth_headers, test_user):  # 13
        r = await client.get("/api/users/me", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == test_user.email
        assert data["username"] == test_user.username

    async def test_get_user_by_own_id(self, client, auth_headers, test_user):           # 14
        r = await client.get(f"/api/users/{test_user.id_}", headers=auth_headers)
        assert r.status_code == 200

    async def test_get_other_user_by_id_returns_404(self, client, auth_headers,
                                                     test_user2):                        # 15
        r = await client.get(f"/api/users/{test_user2.id_}", headers=auth_headers)
        assert r.status_code == 404

    async def test_update_username(self, client, auth_headers):                          # 16
        r = await client.patch("/api/users/me",
                                json={"username": "updatedname"},
                                headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["username"] == "updatedname"

    async def test_update_duplicate_username_returns_409(self, client,
                                                          auth_headers, test_user2):     # 17
        r = await client.patch("/api/users/me",
                                json={"username": test_user2.username},
                                headers=auth_headers)
        assert r.status_code == 409

    async def test_update_invalid_currency_returns_422(self, client, auth_headers):     # 18
        r = await client.patch("/api/users/me",
                                json={"default_currency": "XYZ"},
                                headers=auth_headers)
        assert r.status_code == 422

    async def test_update_valid_currency(self, client, auth_headers):                   # 19
        r = await client.patch("/api/users/me",
                                json={"default_currency": "EUR"},
                                headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["default_currency"] == "EUR"

    async def test_delete_me(self, client, db):                                          # 20
        """Creates a throw-away user, deletes via API, confirms 204."""
        from src.models import User, Currencies
        from src.utils.auth_services import hash_password

        tmp = User(
            username="todelete",
            email="todelete@example.com",
            hashed_password=hash_password("StrongPass1!"),
            default_currency=Currencies.USD.value,
            capital=0.0,
        )
        db.add(tmp)
        await db.commit()
        await db.refresh(tmp)

        login = await client.post("/api/auth/login", json={
            "email": "todelete@example.com",
            "password": "StrongPass1!",
        })
        token = login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        r = await client.delete("/api/users/me", headers=headers)
        assert r.status_code == 204