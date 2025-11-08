from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.enums.notification_enum import NotificationType
from core.models.table_registry import table_registry

if TYPE_CHECKING:
    from .users import User


@table_registry.mapped_as_dataclass
class Notification:
    __tablename__ = "notification"

    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)

    # ID do usuário que VAI RECEBER a notificação
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)

    message: Mapped[str] = mapped_column(String(255), nullable=False)

    type: Mapped[NotificationType] = mapped_column(
        PG_ENUM(NotificationType, name="notification_type_enum", create_type=True),
        nullable=False,
    )

    # ID da entidade relacionada (ex: o ID do Bind) para criar links
    bind_id: Mapped[int | None] = mapped_column(nullable=True, default=None)

    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(init=False, server_default=func.now())

    # Relacionamento para que o User possa acessar suas notificações
    user: Mapped["User"] = relationship(init=False, back_populates="notifications")
