from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.enums import BindEnum, UserType
from core.models.table_registry import table_registry

if TYPE_CHECKING:
    from . import Address, Notification


@table_registry.mapped_as_dataclass
class User:
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(nullable=False)
    cpf: Mapped[str] = mapped_column(unique=True, nullable=False)
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    birthdate: Mapped[date] = mapped_column(nullable=False)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    user_type: Mapped[UserType] = mapped_column(
        "type", PG_ENUM(UserType, name="user_type_enum", create_type=True), nullable=False
    )
    address_id: Mapped[int] = mapped_column(ForeignKey("address.id"))
    address: Mapped["Address"] = relationship(init=False, back_populates="users")
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), init=False, nullable=False, server_default="CURRENT_TIMESTAMP"
    )
    reset_token: Mapped[str | None] = mapped_column(init=False, nullable=True, default=None)
    reset_token_expiry: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True), init=False, nullable=True, default=None
    )

    notifications: Mapped[list["Notification"]] = relationship(
        init=False, back_populates="user", cascade="all, delete-orphan"
    )

    __mapper_args__ = {
        "polymorphic_identity": "user",
        "polymorphic_on": user_type,
    }


@table_registry.mapped_as_dataclass
class Doctor(User):
    __tablename__ = "doctor"

    id: Mapped[int] = mapped_column(ForeignKey("user.id"), primary_key=True, init=False)
    crm: Mapped[str] = mapped_column(nullable=False)
    expertise_area: Mapped[str] = mapped_column(nullable=False)
    status_approval: Mapped[bool] = mapped_column(nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": UserType.DOCTOR,
    }


@table_registry.mapped_as_dataclass
class Patient(User):
    __tablename__ = "patient"

    id: Mapped[int] = mapped_column(ForeignKey("user.id"), primary_key=True, init=False)
    share_data_for_statistics: Mapped[bool] = mapped_column(
        nullable=False, default=True, server_default="true",
        doc="Se o paciente permite que seus dados sejam usados em estatísticas agregadas"
    )

    __mapper_args__ = {
        "polymorphic_identity": UserType.PATIENT,
    }


@table_registry.mapped_as_dataclass
class Bind:
    __tablename__ = "bind"

    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctor.id"), nullable=False)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patient.id"), nullable=False)
    status: Mapped[BindEnum] = mapped_column(
        "status", PG_ENUM(BindEnum, name="bind_enum", create_type=True)
    )
    created_by_type: Mapped[UserType] = mapped_column(
        PG_ENUM(UserType, name="user_type_enum", create_type=False),
        nullable=False
    )


@table_registry.mapped_as_dataclass
class Admin(User):
    __tablename__ = "admin"

    id: Mapped[int] = mapped_column(ForeignKey("user.id"), primary_key=True, init=False)
    is_superuser: Mapped[bool] = mapped_column(default=True, nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": UserType.ADMIN,
    }
