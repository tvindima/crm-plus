from datetime import datetime, timezone
from sqlalchemy.orm import Session
from .models import Property, PropertyStatus
from .schemas import PropertyCreate, PropertyUpdate
from .agent_assignment import get_agent_id_from_reference


def get_properties(db: Session, skip: int = 0, limit: int = 100, search: str | None = None, status: str | None = None):
    query = db.query(Property)
    if search:
        like = f"%{search}%"
        query = query.filter(Property.title.ilike(like) | Property.reference.ilike(like) | Property.location.ilike(like))
    if status and status in {s.value for s in PropertyStatus}:
        query = query.filter(Property.status == PropertyStatus(status))
    return query.offset(skip).limit(limit).all()


def get_property(db: Session, property_id: int):
    return db.query(Property).filter(Property.id == property_id).first()


def create_property(db: Session, property: PropertyCreate):
    payload = property.model_dump()
    if not payload.get("title"):
        payload["title"] = payload.get("reference")
    if not payload.get("location"):
        muni = payload.get("municipality") or ""
        parish = payload.get("parish") or ""
        location = ", ".join([p for p in [muni, parish] if p])
        payload["location"] = location or None
    
    # 🔥 AUTO-ATRIBUIÇÃO: Definir agent_id baseado no prefixo da referência
    if payload.get("reference") and not payload.get("agent_id"):
        auto_agent_id = get_agent_id_from_reference(payload["reference"])
        if auto_agent_id:
            payload["agent_id"] = auto_agent_id
    
    payload["created_at"] = datetime.now(timezone.utc)
    db_property = Property(**payload)
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property


def update_property(db: Session, property_id: int, property_update: PropertyUpdate):
    db_property = get_property(db, property_id)
    if not db_property:
        return None
    
    update_data = property_update.model_dump(exclude_unset=True)
    
    # 🔥 AUTO-ATRIBUIÇÃO: Se a referência mudou, recalcular agent_id
    if "reference" in update_data and update_data["reference"]:
        auto_agent_id = get_agent_id_from_reference(update_data["reference"])
        if auto_agent_id and "agent_id" not in update_data:
            update_data["agent_id"] = auto_agent_id
    
    for key, value in update_data.items():
        setattr(db_property, key, value)
    
    db_property.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_property)
    return db_property


def delete_property(db: Session, property_id: int):
    db_property = get_property(db, property_id)
    if db_property:
        db.delete(db_property)
        db.commit()
    return db_property
