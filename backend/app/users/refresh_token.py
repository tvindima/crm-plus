"""
Model e lógica para Refresh Tokens
Permite sessões persistentes de 7 dias com token rotation
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import secrets

from app.database import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_info = Column(String, nullable=True)  # User-Agent para audit trail
    expires_at = Column(DateTime, nullable=False, index=True)
    is_revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamento
    user = relationship("User", back_populates="refresh_tokens")

    @staticmethod
    def generate_token() -> str:
        """Gera token seguro de 64 caracteres"""
        return secrets.token_urlsafe(48)

    @staticmethod
    def create_expiry(days: int = 7) -> datetime:
        """Cria data de expiração (default 7 dias)"""
        return datetime.utcnow() + timedelta(days=days)

    def is_valid(self) -> bool:
        """Verifica se token ainda é válido"""
        if self.is_revoked:
            return False
        if datetime.utcnow() > self.expires_at:
            return False
        return True

    def revoke(self):
        """Revoga o token (token rotation)"""
        self.is_revoked = True
        self.updated_at = datetime.utcnow()
