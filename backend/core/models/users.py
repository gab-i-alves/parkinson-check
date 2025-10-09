from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.enums import BindEnum, UserType
from core.models.table_registry import table_registry

if TYPE_CHECKING:
    from . import Address


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

    __mapper_args__ = {
        "polymorphic_identity": UserType.PATIENT,
    }


@table_registry.mapped_as_dataclass
class Bind:
    __tablename__ = "bind"

    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)
    status: Mapped[BindEnum] = mapped_column(
        "status", PG_ENUM(BindEnum, name="bind_enum", create_type=True)
    )

    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctor.id"), nullable=False)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patient.id"), nullable=False)
    # medic: Mapped["Doctor"] = relationship("Doctor")
    # patient: Mapped["Patient"] = relationship("Patient")
