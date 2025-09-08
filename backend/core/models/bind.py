from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped
from core.enums import BindEnum
from core.models.table_registry import table_registry
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM

@table_registry.mapped_as_dataclass
class Bind:
    __tablename__ = "bind"
    
    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)
    status: Mapped[BindEnum] = mapped_column(
    "status", PG_ENUM(BindEnum, name="bind_enum", create_type=True))
    
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctor.id"), nullable=False)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patient.id"), nullable=False)