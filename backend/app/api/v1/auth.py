import os
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import APIRouter, HTTPException
from fastapi import Depends, Request

from app.schemas.auth import LoginRequest, TokenResponse
from app.security import decode_token, extract_token

router = APIRouter(prefix="/auth", tags=["Auth"])

# Valores de exemplo; em produção, definir SECRET_KEY via env.
SECRET_KEY = os.environ.get("CRMPLUS_AUTH_SECRET", "change_me_crmplus_secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Credenciais demo/staff
STAFF_EMAIL = "tvindima@imoveismais.pt"
STAFF_PASSWORD = "testepassword123"
STAFF_ROLE = "staff"


def _create_token(email: str, role: str) -> TokenResponse:
    expires = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": email,
        "email": email,
        "role": role,
        "exp": expires,
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return TokenResponse(access_token=token, token_type="bearer", expires_at=expires)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    """Autenticação de staff: e-mail e password fixos para testes/FAKE login."""
    if payload.email.lower() != STAFF_EMAIL or payload.password != STAFF_PASSWORD:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return _create_token(payload.email, STAFF_ROLE)


@router.get("/me")
def me(request: Request):
    token = extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Credenciais em falta")
    payload = decode_token(token)
    return {
        "email": payload.get("email"),
        "role": payload.get("role"),
        "valid": True,
        "exp": payload.get("exp"),
    }


@router.post("/verify")
def verify(request: Request):
    token = extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Credenciais em falta")
    payload = decode_token(token)
    return {"valid": True, "email": payload.get("email"), "role": payload.get("role"), "exp": payload.get("exp")}
