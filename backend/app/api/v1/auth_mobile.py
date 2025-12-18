"""
Endpoints de autenticação para Mobile App
Login com refresh token e renovação de tokens
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional

from app.database import get_db
from app.users.models import User
from app.users.refresh_token import RefreshToken
from app.security import create_access_token, SECRET_KEY, ALGORITHM
import jwt
import bcrypt

router = APIRouter(prefix="/auth", tags=["Authentication - Mobile"])


# Schemas
class MobileLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenPairResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_at: datetime


class RefreshRequest(BaseModel):
    refresh_token: str


# =====================================================
# ENDPOINTS
# =====================================================

@router.post("/mobile/login", response_model=TokenPairResponse)
def mobile_login(
    login_data: MobileLoginRequest,
    user_agent: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Login para mobile app - retorna access_token + refresh_token
    Requisitos:
    - User deve ter agent_id (ser agente, não apenas admin)
    - Tokens:  access_token (24h), refresh_token (7 dias)
    - JWT inclui agent_id no payload
    """
    # Buscar user por email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Email ou password inválidos")
    
    # Verificar password (assumindo bcrypt)
    if not bcrypt.checkpw(login_data.password.encode('utf-8'), user.hashed_password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Email ou password inválidos")
    
    # Verificar se user está ativo
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Conta inativa")
    
    # Verificar se user tem agent_id (mobile app é só para agentes)
    if not user.agent_id:
        raise HTTPException(
            status_code=403,
            detail="Esta app é exclusiva para agentes imobiliários. Contacte o administrador."
        )
    
    # Criar access token (24h) com agent_id
    access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role,
        agent_id=user.agent_id
    )
    
    # Criar refresh token (7 dias)
    refresh_token_str = RefreshToken.generate_token()
    refresh_token_obj = RefreshToken(
        token=refresh_token_str,
        user_id=user.id,
        device_info=user_agent,
        expires_at=RefreshToken.create_expiry(days=7)
    )
    db.add(refresh_token_obj)
    db.commit()
    
    return TokenPairResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        expires_at=datetime.utcnow() + timedelta(hours=24)
    )


@router.post("/refresh", response_model=TokenPairResponse)
def refresh_access_token(
    refresh_data: RefreshRequest,
    user_agent: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Renova access token usando refresh token
    Implementa token rotation (refresh token antigo é revogado)
    """
    # Buscar refresh token no database
    refresh_token_obj = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_data.refresh_token
    ).first()
    
    if not refresh_token_obj:
        raise HTTPException(status_code=401, detail="Refresh token inválido")
    
    # Validar se token ainda é válido
    if not refresh_token_obj.is_valid():
        raise HTTPException(status_code=401, detail="Refresh token expirado ou revogado")
    
    # Buscar user
    user = db.query(User).filter(User.id == refresh_token_obj.user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Utilizador inválido ou inativo")
    
    # Verificar se ainda tem agent_id
    if not user.agent_id:
        raise HTTPException(status_code=403, detail="Acesso restrito a agentes")
    
    # TOKEN ROTATION: Revogar refresh token antigo
    refresh_token_obj.revoke()
    
    # Criar novo access token (24h)
    new_access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role,
        agent_id=user.agent_id
    )
    
    # Criar novo refresh token (7 dias)
    new_refresh_token_str = RefreshToken.generate_token()
    new_refresh_token_obj = RefreshToken(
        token=new_refresh_token_str,
        user_id=user.id,
        device_info=user_agent,
        expires_at=RefreshToken.create_expiry(days=7)
    )
    db.add(new_refresh_token_obj)
    db.commit()
    
    return TokenPairResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token_str,
        expires_at=datetime.utcnow() + timedelta(hours=24)
    )


@router.post("/logout")
def logout(
    refresh_data: RefreshRequest,
    db: Session = Depends(get_db)
):
    """
    Logout - revoga refresh token
    Frontend deve eliminar access_token local
    """
    refresh_token_obj = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_data.refresh_token
    ).first()
    
    if refresh_token_obj:
        refresh_token_obj.revoke()
        db.commit()
    
    return {"message": "Logout efetuado com sucesso"}
