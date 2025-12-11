from pydantic import BaseModel, EmailStr
from typing import Optional


class AgencyBase(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class AgencyCreate(AgencyBase):
    pass


class AgencyUpdate(AgencyBase):
    pass


class AgencyOut(AgencyBase):
    id: int

    class Config:
        orm_mode = True
