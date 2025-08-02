from datetime import date
from sqlalchemy import ForeignKey
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
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    cep: Mapped[str] = mapped_column(nullable=False)
    street: Mapped[str] = mapped_column(nullable=False)
    number: Mapped[int] = mapped_column(nullable=False)
    complement: Mapped[str] = mapped_column()
    neighborhood: Mapped[str] = mapped_column(nullable=False)
    city: Mapped[str] = mapped_column(nullable=False)
    state: Mapped[str] = mapped_column(nullable=False)

    type: Mapped[UserType] = mapped_column(PG_ENUM(UserType, name='user_type_enum', create_type=True)) 

    __mapper_args__ = {
        "polymorphic_identity": "user",
        "polymorphic_on": type,
    }

@table_registry.mapped_as_dataclass
class Doctor(User):
    __tablename__ = "doctor"
    id: Mapped[int] = mapped_column(ForeignKey("user.id"), primary_key=True)
    crm: Mapped[str] = mapped_column(nullable=False)
    expertise_area: Mapped[str] = mapped_column(nullable=False)
    status_approval: Mapped[bool] = mapped_column(nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "doctor",
    }

# @table_registry.mapped_as_dataclass
# class Patient(User):
#     __tablename__ = "patient"
#     id: Mapped[int] = mapped_column(ForeignKey("user.id"), primary_key=True)
#     birthdate: Mapped[date] = mapped_column(nullable=False)

#     __mapper_args__ = {
#         "polymorphic_identity": "patient",
#     }