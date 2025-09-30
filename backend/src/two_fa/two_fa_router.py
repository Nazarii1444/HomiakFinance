import io
import base64
import pyotp
import qrcode
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.database import get_db
from src.models import User
from src.dependencies import get_current_user
from src.two_fa.schemas import TwoFASetupResponse, TwoFAVerifyRequest

two_fa_router = APIRouter()


@two_fa_router.post("/setup", response_model=TwoFASetupResponse)
async def setup_2fa(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    secret = pyotp.random_base32()

    user = (await session.execute(select(User).where(User.id_ == current_user.id_))).scalar_one()

    user.twofa_secret = secret
    await session.commit()

    uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user.email,
        issuer_name="HomiakFinance"
    )

    qr = qrcode.make(uri)
    buf = io.BytesIO()
    qr.save(buf, format="PNG")
    qr_base64 = base64.b64encode(buf.getvalue()).decode()

    # OPEN THIS URL IN BROWSER: data:image/png;base64,PASTE_RESPONSE_STRING_HERE
    return TwoFASetupResponse(qr_code_base64=qr_base64, secret=secret)


@two_fa_router.post("/verify")
async def verify_2fa(
    payload: TwoFAVerifyRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = (await session.execute(select(User).where(User.id_ == current_user.id_))).scalar_one()

    if not user.twofa_secret:
        raise HTTPException(status_code=400, detail="2FA not set up")

    totp = pyotp.TOTP(user.twofa_secret)
    if not totp.verify(payload.code):
        raise HTTPException(status_code=401, detail="Invalid 2FA code")

    user.twofa_enabled = True
    await session.commit()

    return {"message": "2FA enabled successfully"}
