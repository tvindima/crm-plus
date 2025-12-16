import os
from typing import Optional

import jwt
from fastapi import HTTPException, Request, status, Depends
from sqlalchemy.orm import Session

SECRET_KEY = os.environ.get("CRMPLUS_AUTH_SECRET", "change_me_crmplus_secret")
ALGORITHM = "HS256"
STAFF_COOKIE = "crmplus_staff_session"
ALLOWED_ROLES = {"staff", "admin", "coordinator", "agent"}


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


def get_current_user(req: Request, db: Session = Depends(lambda: None)):
    """Dependency para obter utilizador autenticado atual"""
    from app.database import get_db
    from app.users.models import User
    
    if db is None:
        db = next(get_db())
    
    token = extract_token(req)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais em falta")
    
    payload = decode_token(token)
    user_id = payload.get("user_id")
    
    if not user_id:
        # Fallback para sistema antigo (email)
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
        user = db.query(User).filter(User.email == email).first()
    else:
        user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilizador não encontrado")
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Utilizador inativo")
    
    return user


def require_staff(req: Request, db: Session = Depends(lambda: None)):
    """Requer qualquer utilizador autenticado (staff, admin, coordinator, agent)"""
    user = get_current_user(req, db)
    return user


def require_admin(req: Request, db: Session = Depends(lambda: None)):
    """Requer utilizador com role admin"""
    user = get_current_user(req, db)
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permissão insuficiente - Admin necessário")
    return user
