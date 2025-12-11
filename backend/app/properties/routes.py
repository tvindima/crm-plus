from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import services, schemas
from app.database import get_db

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("/", response_model=list[schemas.PropertyOut])
def list_properties(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_properties(db, skip=skip, limit=limit)


@router.get("/{property_id}", response_model=schemas.PropertyOut)
def get_property(property_id: int, db: Session = Depends(get_db)):
    property = services.get_property(db, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property


@router.post("/", response_model=schemas.PropertyOut, status_code=201)
def create_property(property: schemas.PropertyCreate, db: Session = Depends(get_db)):
    return services.create_property(db, property)


@router.put("/{property_id}", response_model=schemas.PropertyOut)
def update_property(property_id: int, property_update: schemas.PropertyUpdate, db: Session = Depends(get_db)):
    property = services.update_property(db, property_id, property_update)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property


@router.delete("/{property_id}", response_model=schemas.PropertyOut)
def delete_property(property_id: int, db: Session = Depends(get_db)):
    property = services.delete_property(db, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property
