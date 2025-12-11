from pydantic import BaseModel
from typing import Optional
from datetime import date
from .models import PropertyStatus


class PropertyBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    area: Optional[float] = None
    location: Optional[str] = None


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(PropertyBase):
    status: Optional[PropertyStatus] = None
    agent_id: Optional[int] = None


class PropertyOut(PropertyBase):
    id: int
    status: PropertyStatus
    agent_id: Optional[int]
    created_at: Optional[date]
    updated_at: Optional[date]

    class Config:
        orm_mode = True
