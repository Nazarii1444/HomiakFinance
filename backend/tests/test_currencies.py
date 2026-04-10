"""
API tests – /api/currencies + /health
Tests: 47-50
"""
import pytest
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
class TestCurrenciesAPI:

    async def test_get_all_rates_returns_dict(self, client, seed_currency):            # 47
        r = await client.get("/api/currencies")
        assert r.status_code == 200
        body = r.json()
        assert isinstance(body, dict)
        assert "USD" in body      # seeded via default
        assert body["USD"] == 1.0

    async def test_get_rate_by_valid_code(self, client, seed_currency):                # 48
        r = await client.get("/api/currencies/UAH")
        assert r.status_code == 200
        assert float(r.json()) == pytest.approx(41.5, rel=1e-3)

    async def test_get_rate_usd_always_returns_1(self, client):                        # 49
        r = await client.get("/api/currencies/USD")
        assert r.status_code == 200
        assert float(r.json()) == 1.0

    async def test_get_rate_unknown_code_returns_404(self, client, seed_currency):     # 50
        r = await client.get("/api/currencies/XYZ")
        assert r.status_code == 404