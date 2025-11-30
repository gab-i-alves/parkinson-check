from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, LargeBinary, String, func
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.enums import SpiralMethods, TestType
from core.models.table_registry import table_registry

if TYPE_CHECKING:
    from core.models.users import Doctor, Patient


@table_registry.mapped_as_dataclass
class Test:
    __tablename__ = "test"

    id: Mapped[int] = mapped_column(init=False, primary_key=True, autoincrement=True)
    execution_date: Mapped[datetime] = mapped_column(init=False, default=func.now())
    test_type: Mapped[TestType] = mapped_column(
        "type", PG_ENUM(TestType, name="test_type_enum", create_type=True)
    )
    score: Mapped[float] = mapped_column(nullable=False)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patient.id"))
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctor.id"))

    # Relação com paciente
    patient: Mapped["Patient"] = relationship(
        "Patient", foreign_keys=[patient_id], init=False
    )

    # Relação com médico que conduziu o teste
    doctor: Mapped["Doctor"] = relationship(
        "Doctor", foreign_keys=[doctor_id], init=False
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
    raw_parkinson_probability: Mapped[float | None] = mapped_column(
        nullable=True, default=None, doc="Probabilidade original de Parkinson retornada pelo modelo (0.0-1.0)"
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

    # Campos para armazenar resultados dos modelos
    model_predictions: Mapped[dict | None] = mapped_column(
        JSONB, nullable=True, default=None, doc="Previsões individuais dos 11 modelos em formato JSON"
    )
    avg_parkinson_probability: Mapped[float | None] = mapped_column(
        nullable=True, default=None, doc="Média das probabilidades de Parkinson de todos os modelos (0.0-1.0)"
    )
    majority_vote: Mapped[str | None] = mapped_column(
        String(20), nullable=True, default=None, doc="Decisão por voto majoritário: HEALTHY ou PARKINSON"
    )
    healthy_votes: Mapped[int | None] = mapped_column(
        Integer, nullable=True, default=None, doc="Quantidade de modelos que classificaram como Healthy"
    )
    parkinson_votes: Mapped[int | None] = mapped_column(
        Integer, nullable=True, default=None, doc="Quantidade de modelos que classificaram como Parkinson"
    )

    # Características extraídas da imagem (features usadas pelo modelo de ML)
    feature_area: Mapped[float | None] = mapped_column(
        nullable=True, default=None, doc="Área do contorno principal da espiral (pixels²)"
    )
    feature_perimeter: Mapped[float | None] = mapped_column(
        nullable=True, default=None, doc="Perímetro do contorno principal (pixels)"
    )
    feature_circularity: Mapped[float | None] = mapped_column(
        nullable=True, default=None, doc="Circularidade: 4π×área/perímetro² (0-1, 1=círculo perfeito)"
    )
    feature_aspect_ratio: Mapped[float | None] = mapped_column(
        nullable=True, default=None, doc="Razão de aspecto: largura/altura do bounding box"
    )
    feature_entropy: Mapped[float | None] = mapped_column(
        nullable=True, default=None, doc="Entropia da imagem (medida de complexidade/irregularidade)"
    )
    feature_mean_thickness: Mapped[float | None] = mapped_column(
        nullable=True, default=None, doc="Espessura média do traçado (pixels)"
    )
    feature_std_thickness: Mapped[float | None] = mapped_column(
        nullable=True, default=None, doc="Desvio padrão da espessura do traçado (pixels)"
    )

    __mapper_args__ = {
        "polymorphic_identity": TestType.SPIRAL_TEST,
    }
