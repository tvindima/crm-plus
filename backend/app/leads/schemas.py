from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import date
from .models import LeadStatus


class LeadBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    origin: Optional[str] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(LeadBase):
    status: Optional[LeadStatus] = None
    assigned_agent_id: Optional[int] = None


class LeadOut(LeadBase):
    id: int
    status: LeadStatus
    assigned_agent_id: Optional[int]
    created_at: Optional[date]
    updated_at: Optional[date]

    model_config = ConfigDict(from_attributes=True)
