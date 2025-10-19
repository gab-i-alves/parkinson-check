from datetime import datetime

from sqlalchemy import ForeignKey, func
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM
from sqlalchemy.orm import Mapped, mapped_column

from core.enums import SpiralMethods, TestStatus, TestType
from core.models.table_registry import table_registry


@table_registry.mapped_as_dataclass
class Test:
    __tablename__ = "test"

    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)
    execution_date: Mapped[datetime] = mapped_column(init=False, default=func.now())
    test_type: Mapped[TestType] = mapped_column(
        "type", PG_ENUM(TestType, name="test_type_enum", create_type=True)
    )
    status: Mapped[TestStatus] = mapped_column(
        "status", PG_ENUM(TestStatus, name="test_status_enum", create_type=True)
    )
    score: Mapped[float] = mapped_column(nullable=False)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patient.id"))

    __mapper_args__ = {
        "polymorphic_identity": "user",
        "polymorphic_on": test_type,
    }


@table_registry.mapped_as_dataclass
class VoiceTest(Test):
    __tablename__ = "voice_test"

    id: Mapped[int] = mapped_column(ForeignKey("test.id"), primary_key=True, init=False)
    record_duration: Mapped[float] = mapped_column(nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": TestType.VOICE_TEST,
    }


@table_registry.mapped_as_dataclass
class SpiralTest(Test):
    __tablename__ = "spiral_test"

    id: Mapped[int] = mapped_column(ForeignKey("test.id"), primary_key=True, init=False)
    draw_duration: Mapped[float] = mapped_column(nullable=False)
    method: Mapped[SpiralMethods] = mapped_column(
        "method", PG_ENUM(SpiralMethods, name="spiral_methods_enum", create_type=True)
    )

    __mapper_args__ = {
        "polymorphic_identity": TestType.SPIRAL_TEST,
    }
