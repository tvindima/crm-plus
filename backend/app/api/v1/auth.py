from datetime import UTC, datetime, timedelta
import secrets

from fastapi import APIRouter, HTTPException

from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    """Placeholder login that validates email domain before issuing a short-lived demo token."""
    if "@" not in payload.email:
        raise HTTPException(status_code=400, detail="Email inválido")

    if payload.password != "changeme":
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token = secrets.token_hex(24)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_at=datetime.now(UTC) + timedelta(minutes=30),
    )
