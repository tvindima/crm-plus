from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CalendarEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    agent_id: Optional[int] = None


class CalendarEventCreate(CalendarEventBase):
    pass


class CalendarEventUpdate(CalendarEventBase):
    pass


class CalendarEventOut(CalendarEventBase):
    id: int

    class Config:
        orm_mode = True
