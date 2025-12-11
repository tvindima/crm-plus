from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FeedItemBase(BaseModel):
    type: str
    message: str
    created_at: datetime
    user_id: Optional[int] = None


class FeedItemCreate(FeedItemBase):
    pass


class FeedItemUpdate(FeedItemBase):
    pass


class FeedItemOut(FeedItemBase):
    id: int

    class Config:
        orm_mode = True
