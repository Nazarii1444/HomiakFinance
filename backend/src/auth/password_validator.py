from pathlib import Path

COMMON_PASSWORDS_1 = set(
    Path("./auth/500-worst-passwords.txt").read_text(encoding="utf-8").splitlines()
)
COMMON_PASSWORDS_2 = set(
    Path("./auth/Pwdb_top-1000.txt").read_text(encoding="utf-8").splitlines()
)

def validate_password(password: str) -> bool:
    """
    True = strong password
    False = weak password
    """
    return password.lower() not in COMMON_PASSWORDS_1 and password.lower() not in COMMON_PASSWORDS_2
