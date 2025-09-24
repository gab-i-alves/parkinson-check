from datetime import date, datetime
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import mapped_column, Mapped, relationship
from core.enums import TestStatus, TestType, SpiralMethods
from core.models.table_registry import table_registry
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM

@table_registry.mapped_as_dataclass
class Test:
    __tablename__ = "test"
    
    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)
    execution_date: Mapped[datetime] = mapped_column(init=False, server_default=func.now())
    test_type: Mapped[TestType] = mapped_column(
        "type", PG_ENUM(TestType, name="test_type_enum", create_type=True)
    )
    status: Mapped[TestStatus] = mapped_column(
        "status", PG_ENUM(TestStatus, name="test_status_enum", create_type=True)
    )
    score: Mapped[int] = mapped_column(nullable=False)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patient.id"))

    __mapper_args__ = {
        "polymorphic_identity": "user",
        "polymorphic_on": test_type,
    }

class VoiceTest(Test):
    __tablename__ = "voice_test"
    
    id: Mapped[int] = mapped_column(ForeignKey("test.id"), primary_key=True, init=False)
    record_duration: Mapped[float] = mapped_column(nullable=False)
    
    __mapper_args__ = {
        "polymorphic_identity": TestType.VOICE_TEST,
    }
    
class SpiralTest(Test):
    __tablename__ = "spiral_test"
    
    id: Mapped[int] = mapped_column(ForeignKey("test.id"), primary_key=True, init=False)
    draw_duration: Mapped[float] = mapped_column(nullable=False)
    method: Mapped[SpiralMethods] = mapped_column(
        "status", PG_ENUM(SpiralMethods, name="test_status_enum", create_type=True)
    )
    
    __mapper_args__ = {
        "polymorphic_identity": TestType.SPIRAL_TEST,
    }