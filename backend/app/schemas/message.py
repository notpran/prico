from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MessageBase(BaseModel):
    text: str
    project_id: str

class MessageCreate(MessageBase):
    timestamp: Optional[datetime] = None

class Message(MessageBase):
    id: Optional[str] = None
    user_id: str
    timestamp: datetime

    class Config:
        orm_mode = True