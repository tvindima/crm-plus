from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from .models import PropertyStatus


class PropertyBase(BaseModel):
    reference: str = Field(..., description="Referência única do imóvel")
    title: str = Field(..., description="Título/curto da propriedade")
    business_type: Optional[str] = Field(None, description="Venda/Arrendamento")
    property_type: Optional[str] = None
    typology: Optional[str] = None
    description: Optional[str] = None
    observations: Optional[str] = None
    price: float
    usable_area: Optional[float] = None
    land_area: Optional[float] = None
    location: Optional[str] = None
    municipality: Optional[str] = None
    parish: Optional[str] = None
    condition: Optional[str] = None
    energy_certificate: Optional[str] = None
    images: Optional[List[str]] = None


class PropertyCreate(PropertyBase):
    status: PropertyStatus = PropertyStatus.AVAILABLE
    agent_id: Optional[int] = None


class PropertyUpdate(BaseModel):
    reference: Optional[str] = None
    title: Optional[str] = None
    business_type: Optional[str] = None
    property_type: Optional[str] = None
    typology: Optional[str] = None
    description: Optional[str] = None
    observations: Optional[str] = None
    price: Optional[float] = None
    usable_area: Optional[float] = None
    land_area: Optional[float] = None
    location: Optional[str] = None
    municipality: Optional[str] = None
    parish: Optional[str] = None
    condition: Optional[str] = None
    energy_certificate: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[PropertyStatus] = None
    agent_id: Optional[int] = None


class PropertyOut(PropertyBase):
    id: int
    status: PropertyStatus
    agent_id: Optional[int]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
