"""
API tests – /api/transactions
Tests: 14-28
"""
import pytest

VALID_TX = {
    "name": "Salary",
    "amount": 1000.00,
    "kind": 1,            # INCOME = 1
    "category_name": "food",
    "currency": "USD",
}

VALID_EXPENSE = {
    "name": "Coffee",
    "amount": 5.50,
    "kind": 0,            # EXPENSE = 0
    "category_name": "food",
    "currency": "USD",
}


async def _create_tx(client, headers, payload=None):
    payload = payload or VALID_TX
    return await client.post("/api/transactions", json=payload, headers=headers)


@pytest.mark.asyncio
class TestTransactionCreate:

    async def test_create_income_returns_201(self, client, auth_headers, test_user):    # 14
        r = await _create_tx(client, auth_headers)
        assert r.status_code == 201
        body = r.json()
        assert float(body["amount"]) == 1000.0
        assert "new_capital" in body

    async def test_create_expense_returns_201(self, client, auth_headers, test_user):   # 15
        await _create_tx(client, auth_headers, VALID_TX)       # income first
        r = await _create_tx(client, auth_headers, VALID_EXPENSE)
        assert r.status_code == 201
        # kind is returned as int (0) by SQLite enum
        assert r.json()["kind"] in (0, "TransactionKind.EXPENSE", "EXPENSE")

    async def test_create_requires_auth(self, client):                                  # 16
        r = await client.post("/api/transactions", json=VALID_TX)
        assert r.status_code == 401

    async def test_create_missing_amount(self, client, auth_headers):                   # 17
        bad = {k: v for k, v in VALID_TX.items() if k != "amount"}
        r = await client.post("/api/transactions", json=bad, headers=auth_headers)
        assert r.status_code == 422

    async def test_create_invalid_kind(self, client, auth_headers):                     # 18
        bad = {**VALID_TX, "kind": 99}
        r = await client.post("/api/transactions", json=bad, headers=auth_headers)
        assert r.status_code in (422, 400)


@pytest.mark.asyncio
class TestTransactionRead:

    async def test_list_returns_200(self, client, auth_headers, test_user):             # 19
        r = await client.get("/api/transactions", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    async def test_list_pagination_limit(self, client, auth_headers, test_user):        # 20
        for _ in range(3):
            await _create_tx(client, auth_headers)
        r = await client.get("/api/transactions?limit=2&offset=0", headers=auth_headers)
        assert r.status_code == 200
        assert len(r.json()) <= 2

    async def test_get_by_id_success(self, client, auth_headers, test_user):            # 21
        create_r = await _create_tx(client, auth_headers)
        tx_id = create_r.json()["id_"]
        r = await client.get(f"/api/transactions/{tx_id}", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["id_"] == tx_id

    async def test_get_by_id_not_found(self, client, auth_headers, test_user):          # 22
        r = await client.get("/api/transactions/999999", headers=auth_headers)
        assert r.status_code == 404

    async def test_cannot_see_other_users_transaction(self, client,
                                                       auth_headers, auth_headers2,
                                                       test_user, test_user2):          # 23
        create_r = await _create_tx(client, auth_headers)
        tx_id = create_r.json()["id_"]
        r = await client.get(f"/api/transactions/{tx_id}", headers=auth_headers2)
        assert r.status_code == 404


@pytest.mark.asyncio
class TestTransactionUpdate:

    async def test_update_name(self, client, auth_headers, test_user):                  # 24
        create_r = await _create_tx(client, auth_headers)
        tx_id = create_r.json()["id_"]
        r = await client.patch(f"/api/transactions/{tx_id}",
                                json={"name": "Updated name"},
                                headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["name"] == "Updated name"

    async def test_update_forbidden_for_other_user(self, client, auth_headers,
                                                    auth_headers2, test_user,
                                                    test_user2):                        # 25
        create_r = await _create_tx(client, auth_headers)
        tx_id = create_r.json()["id_"]
        r = await client.patch(f"/api/transactions/{tx_id}",
                                json={"name": "Hacked"},
                                headers=auth_headers2)
        assert r.status_code == 403

    async def test_update_invalid_kind(self, client, auth_headers, test_user):          # 26
        create_r = await _create_tx(client, auth_headers)
        tx_id = create_r.json()["id_"]
        r = await client.patch(f"/api/transactions/{tx_id}",
                                json={"kind": 99},
                                headers=auth_headers)
        assert r.status_code == 422


@pytest.mark.asyncio
class TestTransactionDelete:

    async def test_delete_success(self, client, auth_headers, test_user):               # 27
        create_r = await _create_tx(client, auth_headers)
        tx_id = create_r.json()["id_"]
        r = await client.delete(f"/api/transactions/{tx_id}", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["id_"] == tx_id

    async def test_delete_not_found(self, client, auth_headers, test_user):             # 28
        r = await client.delete("/api/transactions/999999", headers=auth_headers)
        assert r.status_code == 404