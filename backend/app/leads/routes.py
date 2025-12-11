from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import services, schemas
from app.database import get_db

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("/", response_model=list[schemas.LeadOut])
def list_leads(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_leads(db, skip=skip, limit=limit)


@router.get("/{lead_id}", response_model=schemas.LeadOut)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = services.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.post("/", response_model=schemas.LeadOut, status_code=201)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    return services.create_lead(db, lead)


@router.put("/{lead_id}", response_model=schemas.LeadOut)
def update_lead(lead_id: int, lead_update: schemas.LeadUpdate, db: Session = Depends(get_db)):
    lead = services.update_lead(db, lead_id, lead_update)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.delete("/{lead_id}", response_model=schemas.LeadOut)
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = services.delete_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead
