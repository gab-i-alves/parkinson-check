from datetime import datetime

from pydantic import BaseModel

from core.enums import NotificationType


class NotificationResponse(BaseModel):
    id: int
    message: str
    read: bool
    type: NotificationType
    bind_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class UnreadNotificationCountResponse(BaseModel):
    count: int
