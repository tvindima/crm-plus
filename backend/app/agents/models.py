from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    phone = Column(String, nullable=True)
    team_id = Column(Integer, nullable=True)
    agency_id = Column(Integer, nullable=True)
    leads = relationship("Lead", back_populates="assigned_agent")
    properties = relationship("Property", back_populates="agent")
