from sqlalchemy.orm import Session
from .models import CalendarEvent
from .schemas import CalendarEventCreate, CalendarEventUpdate


def get_events(db: Session, skip: int = 0, limit: int = 100):
    return db.query(CalendarEvent).offset(skip).limit(limit).all()


def get_event(db: Session, event_id: int):
    return db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()


def create_event(db: Session, event: CalendarEventCreate):
    db_event = CalendarEvent(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def update_event(db: Session, event_id: int, event_update: CalendarEventUpdate):
    db_event = get_event(db, event_id)
    if not db_event:
        return None
    for key, value in event_update.model_dump(exclude_unset=True).items():
        setattr(db_event, key, value)
    db.commit()
    db.refresh(db_event)
    return db_event


def delete_event(db: Session, event_id: int):
    db_event = get_event(db, event_id)
    if db_event:
        db.delete(db_event)
        db.commit()
    return db_event
