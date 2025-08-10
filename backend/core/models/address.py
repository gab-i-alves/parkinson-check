from typing import TYPE_CHECKING
from sqlalchemy.orm import mapped_column, Mapped, relationship
from core.models.table_registry import table_registry

if TYPE_CHECKING:
    from . import User

@table_registry.mapped_as_dataclass
class Address:
    __tablename__ = "address"
    
    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)
    cep: Mapped[str] = mapped_column(nullable=False)
    street: Mapped[str] = mapped_column(nullable=False)
    number: Mapped[str] = mapped_column(nullable=False)
    complement: Mapped[str | None] = mapped_column(nullable=True)
    neighborhood: Mapped[str] = mapped_column(nullable=False)
    city: Mapped[str] = mapped_column(nullable=False)
    state: Mapped[str] = mapped_column(nullable=False)
    users: Mapped[list["User"]] = relationship(init=False, back_populates="address")