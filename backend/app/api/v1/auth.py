import os
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import APIRouter, HTTPException, Response
from fastapi import Depends, Request

from app.schemas.auth import LoginRequest, TokenResponse
from app.security import decode_token, extract_token

router = APIRouter(prefix="/auth", tags=["Auth"])

# Valores de exemplo; em produção, definir SECRET_KEY via env.
SECRET_KEY = os.environ.get("CRMPLUS_AUTH_SECRET", "change_me_crmplus_secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Credenciais de utilizadores autorizados
AUTHORIZED_USERS = {
    "tvindima@imoveismais.pt": {
        "password": "testepassword123",
        "role": "staff",
        "name": "Tiago Vindima"
    },
    "faturacao@imoveismais.pt": {
        "password": "123456",
        "role": "admin",
        "name": "Gestor de Loja"
    }
}


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
def login(payload: LoginRequest, response: Response) -> TokenResponse:
    """Autenticação de utilizadores autorizados."""
    email = payload.email.lower()
    
    # Verificar se utilizador existe
    if email not in AUTHORIZED_USERS:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    user = AUTHORIZED_USERS[email]
    
    # Verificar password
    if payload.password != user["password"]:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    token = _create_token(payload.email, user["role"])
    # Define cookie httpOnly para o front consumir via middleware
    response.set_cookie(
        key="crmplus_staff_session",
        value=token.access_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )
    return token


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
