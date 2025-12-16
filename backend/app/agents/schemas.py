from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional


class AgentBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class AgentCreate(AgentBase):
    team_id: Optional[int] = None
    agency_id: Optional[int] = None


class AgentUpdate(AgentBase):
    team_id: Optional[int] = None
    agency_id: Optional[int] = None


class AgentOut(AgentBase):
    id: int
    team_id: Optional[int]
    agency_id: Optional[int]
    avatar_url: Optional[str]

    model_config = ConfigDict(from_attributes=True)
