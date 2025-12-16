from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class PropertyStatus(str, PyEnum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    SOLD = "sold"


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, nullable=False, unique=True, index=True)
    title = Column(String, nullable=False)
    business_type = Column(String, nullable=True)  # venda/arrendamento
    property_type = Column(String, nullable=True)  # apartamento/moradia/etc
    typology = Column(String, nullable=True)  # T1, T2...
    description = Column(Text, nullable=True)
    observations = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    usable_area = Column(Float, nullable=True)
    land_area = Column(Float, nullable=True)
    location = Column(String, nullable=True)
    municipality = Column(String, nullable=True)
    parish = Column(String, nullable=True)
    condition = Column(String, nullable=True)
    energy_certificate = Column(String, nullable=True)
    status = Column(String, default=PropertyStatus.AVAILABLE.value)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    images = Column(JSONB, nullable=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    # agent = relationship("Agent", back_populates="properties")  # Commented to avoid circular import

