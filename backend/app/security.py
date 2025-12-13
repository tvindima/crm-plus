import os
from typing import Optional

import jwt
from fastapi import HTTPException, Request, status

SECRET_KEY = os.environ.get("CRMPLUS_AUTH_SECRET", "change_me_crmplus_secret")
ALGORITHM = "HS256"
STAFF_COOKIE = "crmplus_staff_session"
ALLOWED_ROLES = {"staff", "admin", "leader"}


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirou")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")


def extract_token(req: Request) -> Optional[str]:
    auth = req.headers.get("Authorization")
    if auth and auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip()
    cookie_token = req.cookies.get(STAFF_COOKIE)
    if cookie_token:
        return cookie_token
    return None


def require_staff(req: Request):
    token = extract_token(req)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais em falta")
    payload = decode_token(token)
    role = payload.get("role")
    if role not in ALLOWED_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permissão insuficiente")
    return payload
