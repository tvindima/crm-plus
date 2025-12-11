from sqlalchemy import Column, Integer, String, Float, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class PropertyStatus(str, Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    SOLD = "sold"


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    area = Column(Float, nullable=True)
    location = Column(String, nullable=True)
    status = Column(Enum(PropertyStatus), default=PropertyStatus.AVAILABLE)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    created_at = Column(Date)
    updated_at = Column(Date)
    agent = relationship("Agent", back_populates="properties")
