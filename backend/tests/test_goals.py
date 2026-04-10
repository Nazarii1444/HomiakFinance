"""
API tests – /api/goals
Tests: 36-46
"""
import pytest

VALID_GOAL = {"name": "New Laptop", "summ": 2000.0, "saved": 0.0}


async def _create_goal(client, headers, payload=None):
    payload = payload or VALID_GOAL
    return await client.post("/api/goals", json=payload, headers=headers)


@pytest.mark.asyncio
class TestGoalCreate:

    async def test_create_goal_returns_201(self, client, auth_headers, test_user):     # 36
        r = await _create_goal(client, auth_headers)
        assert r.status_code == 201
        body = r.json()
        assert body["name"] == "New Laptop"
        assert body["summ"] == 2000.0

    async def test_create_goal_requires_auth(self, client):                            # 37
        r = await client.post("/api/goals", json=VALID_GOAL)
        assert r.status_code == 401

    async def test_create_goal_missing_name(self, client, auth_headers):               # 38
        r = await client.post("/api/goals",
                               json={"summ": 500.0, "saved": 0.0},
                               headers=auth_headers)
        assert r.status_code == 422


@pytest.mark.asyncio
class TestGoalRead:

    async def test_list_goals(self, client, auth_headers, test_user):                  # 39
        await _create_goal(client, auth_headers)
        r = await client.get("/api/goals", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) >= 1

    async def test_get_goal_by_id(self, client, auth_headers, test_user):              # 40
        create_r = await _create_goal(client, auth_headers)
        goal_id = create_r.json()["id_"]
        r = await client.get(f"/api/goals/{goal_id}", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["id_"] == goal_id

    async def test_get_goal_not_found(self, client, auth_headers, test_user):          # 41
        r = await client.get("/api/goals/999999", headers=auth_headers)
        assert r.status_code == 404

    async def test_cannot_see_other_users_goal(self, client, auth_headers,
                                                auth_headers2, test_user,
                                                test_user2):                            # 42
        create_r = await _create_goal(client, auth_headers)
        goal_id = create_r.json()["id_"]
        r = await client.get(f"/api/goals/{goal_id}", headers=auth_headers2)
        assert r.status_code == 404

    async def test_list_goals_pagination(self, client, auth_headers, test_user):       # 43
        for i in range(5):
            await _create_goal(client, auth_headers, {**VALID_GOAL, "name": f"Goal {i}"})
        r = await client.get("/api/goals?limit=2&offset=0", headers=auth_headers)
        assert r.status_code == 200
        assert len(r.json()) <= 2


@pytest.mark.asyncio
class TestGoalUpdate:

    async def test_update_goal_name(self, client, auth_headers, test_user):            # 44
        create_r = await _create_goal(client, auth_headers)
        goal_id = create_r.json()["id_"]
        r = await client.patch(f"/api/goals/{goal_id}",
                                json={"name": "Vacation"},
                                headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["name"] == "Vacation"

    async def test_update_goal_saved_amount(self, client, auth_headers, test_user):    # 45
        create_r = await _create_goal(client, auth_headers)
        goal_id = create_r.json()["id_"]
        r = await client.patch(f"/api/goals/{goal_id}",
                                json={"saved": 500.0},
                                headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["saved"] == 500.0


@pytest.mark.asyncio
class TestGoalDelete:

    async def test_delete_goal(self, client, auth_headers, test_user):                 # 46
        create_r = await _create_goal(client, auth_headers)
        goal_id = create_r.json()["id_"]
        r = await client.delete(f"/api/goals/{goal_id}", headers=auth_headers)
        assert r.status_code == 204
        # confirm gone
        get_r = await client.get(f"/api/goals/{goal_id}", headers=auth_headers)
        assert get_r.status_code == 404