from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import services, schemas
from app.database import get_db

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/", response_model=list[schemas.CalendarEventOut])
def list_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_events(db, skip=skip, limit=limit)


@router.get("/{event_id}", response_model=schemas.CalendarEventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = services.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/", response_model=schemas.CalendarEventOut, status_code=201)
def create_event(event: schemas.CalendarEventCreate, db: Session = Depends(get_db)):
    return services.create_event(db, event)


@router.put("/{event_id}", response_model=schemas.CalendarEventOut)
def update_event(event_id: int, event_update: schemas.CalendarEventUpdate, db: Session = Depends(get_db)):
    event = services.update_event(db, event_id, event_update)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.delete("/{event_id}", response_model=schemas.CalendarEventOut)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = services.delete_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
