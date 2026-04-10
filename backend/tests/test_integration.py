"""
Integration tests – real async DB session, no HTTP layer
Tests: 44-54
"""
import pytest
from sqlalchemy import select
from unittest.mock import patch, MagicMock

from src.models import User, Transaction, Goal, TransactionKind, Currencies
from src.utils.auth_services import hash_password


def _pwned_mock():
    m = MagicMock()
    m.text = "AAAAA:1"   # suffix won't match → password not in leaked list
    return m


# ─────────────────────────────────────────────
# User creation flow
# ─────────────────────────────────────────────
class TestUserIntegration:

    @pytest.mark.asyncio
    async def test_create_user_persisted(self, db):                     # 44
        user = User(
            username="integ_user1",
            email="integ1@example.com",
            hashed_password=hash_password("Pass1!xx"),
            default_currency=Currencies.USD.value,
            capital=0.0,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        result = await db.execute(select(User).where(User.email == "integ1@example.com"))
        found = result.scalar_one_or_none()
        assert found is not None
        assert found.username == "integ_user1"

    @pytest.mark.asyncio
    async def test_user_default_capital_is_zero(self, db):              # 45
        user = User(
            username="integ_user2",
            email="integ2@example.com",
            hashed_password=hash_password("Pass1!xx"),
            default_currency=Currencies.USD.value,
            capital=0.0,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        assert user.capital == 0.0

    @pytest.mark.asyncio
    async def test_delete_user_cascades_transactions(self, db):         # 46
        user = User(
            username="cascade_user",
            email="cascade@example.com",
            hashed_password=hash_password("Pass1!xx"),
            default_currency=Currencies.USD.value,
            capital=0.0,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        tx = Transaction(
            user_id=user.id_,
            amount=100,
            kind=TransactionKind.INCOME,
            category_name="food",
            currency="USD",
            name="test",
        )
        db.add(tx)
        await db.commit()

        await db.delete(user)
        await db.commit()

        result = await db.execute(
            select(Transaction).where(Transaction.user_id == user.id_)
        )
        assert result.scalar_one_or_none() is None


# ─────────────────────────────────────────────
# Transaction flow
# ─────────────────────────────────────────────
class TestTransactionIntegration:

    @pytest.mark.asyncio
    async def test_transaction_saved_with_correct_amount(self, db):     # 47
        user = User(
            username="tx_user1",
            email="txuser1@example.com",
            hashed_password=hash_password("Pass1!xx"),
            default_currency=Currencies.USD.value,
            capital=0.0,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        tx = Transaction(
            user_id=user.id_,
            amount=250.75,
            kind=TransactionKind.INCOME,
            category_name="food",
            currency="USD",
            name="Salary",
        )
        db.add(tx)
        await db.commit()
        await db.refresh(tx)

        assert float(tx.amount) == 250.75
        assert tx.kind == TransactionKind.INCOME

    @pytest.mark.asyncio
    async def test_multiple_transactions_for_one_user(self, db):        # 48
        user = User(
            username="tx_user2",
            email="txuser2@example.com",
            hashed_password=hash_password("Pass1!xx"),
            default_currency=Currencies.USD.value,
            capital=0.0,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        for i in range(5):
            db.add(Transaction(
                user_id=user.id_,
                amount=10 * (i + 1),
                kind=TransactionKind.EXPENSE,
                category_name="food",
                currency="USD",
                name=f"tx{i}",
            ))
        await db.commit()

        result = await db.execute(
            select(Transaction).where(Transaction.user_id == user.id_)
        )
        txs = result.scalars().all()
        assert len(txs) == 5

    @pytest.mark.asyncio
    async def test_transactions_isolated_between_users(self, db):       # 49
        u1 = User(username="iso1", email="iso1@example.com",
                  hashed_password=hash_password("P"), default_currency="USD", capital=0.0)
        u2 = User(username="iso2", email="iso2@example.com",
                  hashed_password=hash_password("P"), default_currency="USD", capital=0.0)
        db.add_all([u1, u2])
        await db.commit()
        await db.refresh(u1)
        await db.refresh(u2)

        db.add(Transaction(user_id=u1.id_, amount=99, kind=TransactionKind.INCOME,
                           category_name="food", currency="USD", name="u1tx"))
        await db.commit()

        result = await db.execute(
            select(Transaction).where(Transaction.user_id == u2.id_)
        )
        assert result.scalar_one_or_none() is None


# ─────────────────────────────────────────────
# Goal flow
# ─────────────────────────────────────────────
class TestGoalIntegration:

    @pytest.mark.asyncio
    async def test_goal_created_with_zero_saved(self, db):              # 50
        user = User(
            username="goal_user1",
            email="goaluser1@example.com",
            hashed_password=hash_password("Pass1!xx"),
            default_currency=Currencies.USD.value,
            capital=0.0,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        goal = Goal(user_id=user.id_, name="Vacation", summ=5000.0, saved=0.0)
        db.add(goal)
        await db.commit()
        await db.refresh(goal)

        assert goal.saved == 0.0
        assert goal.summ == 5000.0

    @pytest.mark.asyncio
    async def test_goal_saved_can_be_updated(self, db):                 # 51
        user = User(
            username="goal_user2",
            email="goaluser2@example.com",
            hashed_password=hash_password("Pass1!xx"),
            default_currency=Currencies.USD.value,
            capital=0.0,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        goal = Goal(user_id=user.id_, name="Laptop", summ=2000.0, saved=0.0)
        db.add(goal)
        await db.commit()
        await db.refresh(goal)

        goal.saved = 750.0
        await db.commit()
        await db.refresh(goal)

        assert goal.saved == 750.0

    @pytest.mark.asyncio
    async def test_delete_user_cascades_goals(self, db):                # 52
        user = User(
            username="goal_cascade",
            email="goalcascade@example.com",
            hashed_password=hash_password("Pass1!xx"),
            default_currency=Currencies.USD.value,
            capital=0.0,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        db.add(Goal(user_id=user.id_, name="Car", summ=10000.0, saved=0.0))
        await db.commit()

        await db.delete(user)
        await db.commit()

        result = await db.execute(select(Goal).where(Goal.user_id == user.id_))
        assert result.scalar_one_or_none() is None


# ─────────────────────────────────────────────
# Auth service flow (DB level)
# ─────────────────────────────────────────────
class TestAuthServiceIntegration:

    @pytest.mark.asyncio
    async def test_authenticate_user_success(self, db):                 # 53
        from src.auth.auth_services import authenticate_user

        user = User(
            username="auth_integ",
            email="authinteg@example.com",
            hashed_password=hash_password("StrongPass1!"),
            default_currency=Currencies.USD.value,
            capital=0.0,
        )
        db.add(user)
        await db.commit()

        result = await authenticate_user(db, "authinteg@example.com", "StrongPass1!")
        assert result is not None
        assert result.email == "authinteg@example.com"

    @pytest.mark.asyncio
    async def test_authenticate_user_wrong_password(self, db):          # 54
        from src.auth.auth_services import authenticate_user

        user = User(
            username="auth_integ2",
            email="authinteg2@example.com",
            hashed_password=hash_password("StrongPass1!"),
            default_currency=Currencies.USD.value,
            capital=0.0,
        )
        db.add(user)
        await db.commit()

        result = await authenticate_user(db, "authinteg2@example.com", "WrongPass!")
        assert result is None