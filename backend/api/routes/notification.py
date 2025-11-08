from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.models import User
from core.security.security import get_current_user
from core.services.notification_service import (
    get_all_user_notifications,
    get_unread_notifications_count,
    mark_all_notifications_as_read,
    mark_notification_as_read,
)
from infra.db.connection import get_session

from ..schemas.notification import NotificationResponse, UnreadNotificationCountResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=list[NotificationResponse])
def get_user_notifications(user: CurrentUser, session: Session = Depends(get_session)):
    """(Critério 3) Rota para o centro de notificações."""
    notifications = get_all_user_notifications(user=user, session=session)
    return notifications


@router.get("/unread", response_model=UnreadNotificationCountResponse)
def get_my_unread_notifications_count(
    user: CurrentUser, session: Session = Depends(get_session)
):
    """(Critério 1 e 2) Rota para o alerta de notificação."""
    count = get_unread_notifications_count(user=user, session=session)
    return UnreadNotificationCountResponse(count=count)


@router.post("/{notification_id}/read", status_code=HTTPStatus.NO_CONTENT)
def mark_as_read(
    notification_id: int, user: CurrentUser, session: Session = Depends(get_session)
):
    """(Critério 3) Marca uma notificação como lida."""
    mark_notification_as_read(user=user, session=session, notification_id=notification_id)


@router.post("/read-all", status_code=HTTPStatus.NO_CONTENT)
def mark_all_as_read(user: CurrentUser, session: Session = Depends(get_session)):
    """(Critério 3) Marca todas as notificações como lidas."""
    mark_all_notifications_as_read(user=user, session=session)
