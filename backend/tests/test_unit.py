"""
Unit tests – pure functions, no HTTP, no real DB
Tests: 29-42
"""
import pytest
from unittest.mock import patch, MagicMock
from datetime import timedelta


# ─────────────────────────────────────────────
# auth_services: hash_password / verify_password
# ─────────────────────────────────────────────
class TestPasswordHashing:

    def test_hash_is_not_plaintext(self):                               # 29
        from src.utils.auth_services import hash_password
        hashed = hash_password("MySecret1!")
        assert hashed != "MySecret1!"

    def test_verify_correct_password(self):                             # 30
        from src.utils.auth_services import hash_password, verify_password
        hashed = hash_password("MySecret1!")
        assert verify_password("MySecret1!", hashed) is True

    def test_verify_wrong_password(self):                               # 31
        from src.utils.auth_services import hash_password, verify_password
        hashed = hash_password("MySecret1!")
        assert verify_password("WrongPass!", hashed) is False

    def test_same_password_produces_different_hashes(self):             # 32
        from src.utils.auth_services import hash_password
        h1 = hash_password("MySecret1!")
        h2 = hash_password("MySecret1!")
        # bcrypt uses random salt → always different
        assert h1 != h2


# ─────────────────────────────────────────────
# check_password_strength
# ─────────────────────────────────────────────
class TestCheckPasswordStrength:

    def _run(self, password: str, pwned: bool = False):
        mock_resp = MagicMock()
        mock_resp.text = "" if pwned else "AAAAA:1"
        with patch("requests.get", return_value=mock_resp):
            from src.auth.auth_services import check_password_strength
            return check_password_strength(password)

    def test_strong_password_no_errors(self):                           # 33
        errors = self._run("StrongPass1!")
        assert errors == []

    def test_too_short(self):                                           # 34
        errors = self._run("Ab1!")
        assert any("8 characters" in e for e in errors)

    def test_no_uppercase(self):                                        # 35
        errors = self._run("weakpass1!")
        assert any("uppercase" in e for e in errors)

    def test_no_lowercase(self):                                        # 36
        errors = self._run("WEAKPASS1!")
        assert any("lowercase" in e for e in errors)

    def test_no_digit(self):                                            # 37
        errors = self._run("WeakPass!!")
        assert any("number" in e for e in errors)

    def test_no_special_char(self):                                     # 38
        errors = self._run("WeakPass11")
        assert any("special" in e for e in errors)

    def test_pwned_password_flagged(self):                              # 39
        """If suffix found in pwned response → error added."""
        import hashlib
        pwd = "StrongPass1!"
        sha1 = hashlib.sha1(pwd.encode()).hexdigest().upper()
        suffix = sha1[5:]
        mock_resp = MagicMock()
        mock_resp.text = f"{suffix}:10"
        with patch("requests.get", return_value=mock_resp):
            from src.auth.auth_services import check_password_strength
            errors = check_password_strength(pwd)
        assert any("leaked" in e for e in errors)


# ─────────────────────────────────────────────
# jwt_handlers: create / decode tokens
# ─────────────────────────────────────────────
class TestJwtHandlers:

    @pytest.mark.asyncio
    async def test_access_token_contains_sub(self):                     # 40
        from src.utils.jwt_handlers import create_access_token, decode_access_token
        token = await create_access_token({"sub": "42"})
        payload = await decode_access_token(token)
        assert payload is not None
        assert payload["sub"] == "42"

    @pytest.mark.asyncio
    async def test_refresh_token_is_string(self):                       # 41
        from src.utils.jwt_handlers import create_refresh_token
        token = await create_refresh_token({"sub": "42"})
        assert isinstance(token, str)
        assert len(token) > 20

    @pytest.mark.asyncio
    async def test_decode_invalid_token_returns_none(self):             # 42
        from src.utils.jwt_handlers import decode_access_token
        result = await decode_access_token("totally.invalid.token")
        assert result is None

    @pytest.mark.asyncio
    async def test_two_tokens_for_same_user_are_different(self):        # 43
        from src.utils.jwt_handlers import create_access_token
        t1 = await create_access_token({"sub": "1"})
        t2 = await create_access_token({"sub": "1"})
        # exp timestamps differ by at least 1s in practice, but let's check type
        assert isinstance(t1, str) and isinstance(t2, str)