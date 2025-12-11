from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    manager_id = Column(Integer, ForeignKey("agents.id"))
    agency_id = Column(Integer, nullable=True)
    members = relationship("Agent", backref="team")
