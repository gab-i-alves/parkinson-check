from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, LargeBinary, String, func
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.enums import SpiralMethods, TestStatus, TestType
from core.models.table_registry import table_registry

if TYPE_CHECKING:
    from core.models.users import Patient


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

    # Relação com paciente
    patient: Mapped["Patient"] = relationship(
        "Patient", foreign_keys=[patient_id], init=False
    )

    __mapper_args__ = {
        "polymorphic_identity": "user",
        "polymorphic_on": test_type,
    }


@table_registry.mapped_as_dataclass
class VoiceTest(Test):
    __tablename__ = "voice_test"

    id: Mapped[int] = mapped_column(ForeignKey("test.id"), primary_key=True, init=False)
    record_duration: Mapped[float] = mapped_column(nullable=False)

    # Campos para armazenar o áudio
    voice_audio_data: Mapped[bytes | None] = mapped_column(
        LargeBinary, nullable=True, default=None, doc="Áudio da voz em bytes"
    )
    voice_audio_filename: Mapped[str | None] = mapped_column(
        String, nullable=True, default=None, doc="Nome original do arquivo de áudio"
    )
    voice_audio_content_type: Mapped[str | None] = mapped_column(
        String, nullable=True, default=None, doc="Content-Type do arquivo (ex: audio/webm)"
    )

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

    # Campos para armazenar a imagem
    spiral_image_data: Mapped[bytes | None] = mapped_column(
        LargeBinary, nullable=True, default=None, doc="Imagem da espiral em bytes"
    )
    spiral_image_filename: Mapped[str | None] = mapped_column(
        String, nullable=True, default=None, doc="Nome original do arquivo de imagem"
    )
    spiral_image_content_type: Mapped[str | None] = mapped_column(
        String, nullable=True, default=None, doc="Content-Type do arquivo (ex: image/png)"
    )

    __mapper_args__ = {
        "polymorphic_identity": TestType.SPIRAL_TEST,
    }
