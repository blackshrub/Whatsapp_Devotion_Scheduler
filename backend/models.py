from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class ScheduleCreate(BaseModel):
    phone: str = "120363291513749102@g.us"
    message_html: str
    message_md: Optional[str] = ""
    image_base64: Optional[str] = None
    image_filename: Optional[str] = None
    send_at: datetime

class Schedule(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    message_html: str
    message_md: str
    image_base64: Optional[str] = None
    image_filename: Optional[str] = None
    send_at: datetime
    status: str = "scheduled"  # scheduled, sending, sent, failed, canceled
    sent_at: Optional[datetime] = None
    gateway_response: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ScheduleUpdate(BaseModel):
    phone: Optional[str] = None
    message_html: Optional[str] = None
    message_md: Optional[str] = None
    image_path: Optional[str] = None
    send_at: Optional[datetime] = None
    status: Optional[str] = None

class BulkScheduleCreate(BaseModel):
    schedules: List[ScheduleCreate]
