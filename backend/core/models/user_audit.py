from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import TIMESTAMP, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from core.models.table_registry import table_registry

if TYPE_CHECKING:
    from . import User, Admin


@table_registry.mapped_as_dataclass
class UserStatusAudit:
    """
    Registra histórico de mudanças de status (ativo/inativo) dos usuários.
    Mantém auditoria completa de quem alterou, quando e por quê.
    """
    __tablename__ = "user_status_audit"

    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    changed_by_admin_id: Mapped[int] = mapped_column(ForeignKey("admin.id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(nullable=False)
    reason: Mapped[str | None] = mapped_column(default=None, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), init=False, nullable=False, server_default="CURRENT_TIMESTAMP"
    )
