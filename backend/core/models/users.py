from datetime import date
from sqlalchemy import ForeignKey, String, Integer, Date
from sqlalchemy.orm import mapped_column, Mapped, relationship
from core.enums.user_enum import UserType
from core.models.table_registry import table_registry
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM

@table_registry.mapped_as_dataclass
class User:
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(nullable=False)
    cpf: Mapped[str] = mapped_column(unique=True, nullable=False)
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    birthdate: Mapped[date] = mapped_column(Date, nullable=False)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    user_type: Mapped[UserType] = mapped_column("type", Integer, nullable=False)
    adress_id: Mapped[int] = mapped_column(ForeignKey("adress.id"))

    __mapper_args__ = {
        "polymorphic_identity": "user",
        "polymorphic_on": user_type,
    }

@table_registry.mapped_as_dataclass
class Adress:
    __tablename__ = "adress"
    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)
    cep: Mapped[str] = mapped_column(String(8), nullable=False)
    street: Mapped[str] = mapped_column(String(100), nullable=False)
    number: Mapped[str] = mapped_column(String(10), nullable=False) # String para aceitar "s/n"
    complement: Mapped[str | None] = mapped_column(String(50), nullable=True)
    neighborhood: Mapped[str] = mapped_column(String(50), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(20), nullable=False)


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