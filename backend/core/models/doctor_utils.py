from datetime import datetime
from sqlalchemy import ForeignKey
from core.enums.doctor_enum import ActivityType, DocumentType
from core.models.table_registry import table_registry
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM

@table_registry.mapped_as_dataclass
class DoctorDocument:
    __tablename__ = "doctor_document"
    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctor.id"), nullable=False)
    document_type: Mapped[DocumentType] = mapped_column(
        PG_ENUM(DocumentType, name="document_type_enum"), nullable=False
    )
    file_name: Mapped[str] = mapped_column(nullable=False)
    file_path: Mapped[str] = mapped_column(nullable=False)
    file_size: Mapped[int] = mapped_column(nullable=False)
    mime_type: Mapped[str] = mapped_column(nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(default_factory=datetime.now, init=False)
    verified: Mapped[bool] = mapped_column(default=False, init=False)
    verified_by_admin_id: Mapped[int | None] = mapped_column(nullable=True, init=False)
    verified_at: Mapped[datetime | None] = mapped_column(nullable=True, init=False)
    
# @table_registry.mapped_as_dataclass
# class DoctorActivityLog:
#     __tablename__ = "doctor_activity_log"
#     id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)
#     doctor_id: Mapped[int] = mapped_column(ForeignKey("doctor.id"), nullable=False, init=False)
#     activity_type: Mapped[ActivityType] = mapped_column(
#         PG_ENUM(ActivityType, name="activity_type_enum"), nullable=False
#     )
#     description: Mapped[str] = mapped_column(nullable=False)
#     # metadata: Mapped[str] = mapped_column(nullable=False)
#     ip_address: Mapped[int] = mapped_column(nullable=False)
#     user_agent: Mapped[str] = mapped_column(nullable=False)
#     created_at: Mapped[datetime] = mapped_column(default_factory=datetime.now, init=False)
    
    