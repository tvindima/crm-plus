from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class LeadStatus(str, PyEnum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    LOST = "lost"


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=True)
    origin = Column(String, nullable=True)
    status = Column(Enum(LeadStatus), default=LeadStatus.NEW)
    assigned_agent_id = Column(Integer, ForeignKey("agents.id"))
    created_at = Column(Date)
    updated_at = Column(Date)
    assigned_agent = relationship("Agent", back_populates="leads")
