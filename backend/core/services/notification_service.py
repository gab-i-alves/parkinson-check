from http import HTTPStatus

from fastapi import HTTPException
from sqlalchemy.orm import Session

from core.enums import NotificationType
from core.models import Notification, User


def create_notification(
    session: Session, user_id: int, message: str, type: NotificationType, bind_id: int
):
    db_notification = Notification(
        user_id=user_id, message=message, type=type, bind_id=bind_id, read=False
    )

    session.add(db_notification)


def get_all_user_notifications(user: User, session: Session):
    notifications = (
        session.query(Notification).filter(Notification.user_id == user.id).all()
    )

    return notifications


def get_unread_notifications_count(user: User, session: Session):
    count = (
        session.query(Notification)
        .filter(Notification.user_id == user.id, Notification.read.is_(False))
        .count()
    )

    return count


def mark_notification_as_read(user: User, session: Session, notification_id: int):
    notification = (
        session.query(Notification)
        .filter(Notification.user_id == user.id, Notification.id == notification_id)
        .first()
    )

    if not notification:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="Notificação não encontrada.")

    notification.read = True

    session.add(notification)
    session.commit()


def mark_all_notifications_as_read(user: User, session: Session):
    notifications = (
        session.query(Notification)
        .filter(Notification.user_id == user.id, Notification.read.is_(False))
        .all()
    )

    if len(notifications) == 0:
        raise HTTPException(
            HTTPStatus.NOT_FOUND, detail="Usuário sem notificações não lidas."
        )

    for notification in notifications:
        notification.read = True

    session.add_all(notifications)
    session.commit()
