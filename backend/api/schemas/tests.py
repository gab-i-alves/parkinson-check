from datetime import datetime
from typing import Dict, Literal, Optional

from fastapi import File, Form, UploadFile
from pydantic import BaseModel, ConfigDict, Field

from core.enums import SpiralMethods, TestType


class SpiralImageSchema(BaseModel):
    image_content: bytes
    image_filename: str
    image_content_type: str

    @classmethod
    def as_form(cls, image: UploadFile = File(...)):
        return cls(
            image_content=image.file.read(),
            image_filename=image.filename,
            image_content_type=image.content_type,
        )


class ProcessSpiralSchema(BaseModel):
    image: SpiralImageSchema
    draw_duration: float
    method: SpiralMethods

    @classmethod
    def as_form(
        cls,
        draw_duration: float = Form(...),
        method: int = Form(...),
        image: UploadFile = File(...),
    ):
        return cls(
            image=SpiralImageSchema(
                image_content=image.file.read(),
                image_filename=image.filename,
                image_content_type=image.content_type,
            ),
            draw_duration=draw_duration,
            method=SpiralMethods(method),
        )


class ModelPrediction(BaseModel):
    prediction: str
    probabilities: Optional[Dict[str, float]] = None


class SpiralTestVoteCount(BaseModel):
    Healthy: int
    Parkinson: int


class SpiralTestResult(BaseModel):
    majority_decision: str
    vote_count: SpiralTestVoteCount
    model_results: Dict[str, ModelPrediction]


class VoiceTestResult(BaseModel):
    score: float = Field(..., example=0.92)
    analysis: str = Field(..., example="A análise da sua voz indica A, B e C.")


# Schema não detalhado resultado do teste
class BasicTestReturn(BaseModel):
    test_id: int
    test_type: TestType
    execution_date: datetime
    classification: Literal["HEALTHY", "PARKINSON"]


# Schemas detalhados, com base nos atributos dos modelos persistentes


class BaseTest(BaseModel):
    id: int
    test_type: TestType
    execution_date: datetime
    score: float
    patient_id: int

    model_config = {"from_attributes": True}


class VoiceTestReturn(BaseTest):
    record_duration: float
    raw_parkinson_probability: Optional[float] = None


class ProcessVoiceSchema(BaseModel):
    record_duration: float
    audio_file: UploadFile

    @classmethod
    def as_form(
        cls, record_duration: float = Form(...), audio_file: UploadFile = File(...)
    ):
        return cls(record_duration=record_duration, audio_file=audio_file)


class SpiralTestReturn(BaseTest):
    draw_duration: float
    method: SpiralMethods
    model_predictions: Optional[Dict[str, ModelPrediction]] = None
    avg_parkinson_probability: Optional[float] = None
    majority_vote: Optional[str] = None
    healthy_votes: Optional[int] = None
    parkinson_votes: Optional[int] = None


class DetaildTestsReturn(BaseModel):
    voice_tests: list[VoiceTestReturn]
    spiral_tests: list[SpiralTestReturn]


# Schemas para detalhes de um teste individual


class PatientInfo(BaseModel):
    """Informações básicas do paciente"""

    id: int
    name: str

    model_config = {"from_attributes": True}


class VoiceTestDetail(VoiceTestReturn):
    """Detalhes completos de um teste de voz individual"""

    patient: PatientInfo
    classification: Literal["HEALTHY", "PARKINSON"]

    model_config = {"from_attributes": True}


class SpiralTestDetail(SpiralTestReturn):
    """Detalhes completos de um teste de espiral individual"""

    patient: PatientInfo
    classification: Literal["HEALTHY", "PARKINSON"]

    model_config = {"from_attributes": True}


# Schemas para testes clínicos (iniciados pelo médico)


class ClinicalProcessSpiralSchema(BaseModel):
    """Schema para processar teste de espiral clínico iniciado pelo médico"""

    patient_id: int = Field(..., description="ID do paciente que realizará o teste")
    image: SpiralImageSchema
    draw_duration: float
    method: SpiralMethods

    @classmethod
    def as_form(
        cls,
        patient_id: int = Form(...),
        draw_duration: float = Form(...),
        method: int = Form(...),
        image: UploadFile = File(...),
    ):
        return cls(
            patient_id=patient_id,
            image=SpiralImageSchema(
                image_content=image.file.read(),
                image_filename=image.filename,
                image_content_type=image.content_type,
            ),
            draw_duration=draw_duration,
            method=SpiralMethods(method),
        )


class ClinicalProcessVoiceSchema(BaseModel):
    """Schema para processar teste de voz clínico iniciado pelo médico"""

    patient_id: int = Field(..., description="ID do paciente que realizará o teste")
    record_duration: float
    audio_file: UploadFile

    @classmethod
    def as_form(
        cls,
        patient_id: int = Form(...),
        record_duration: float = Form(...),
        audio_file: UploadFile = File(...),
    ):
        return cls(
            patient_id=patient_id, record_duration=record_duration, audio_file=audio_file
        )


class ClinicalSpiralTestResult(BaseModel):
    """
    Resultado detalhado do teste de espiral clínico.
    Inclui informações adicionais para o médico.
    """

    test_id: int = Field(..., description="ID do teste salvo no banco de dados")
    patient_id: int = Field(..., description="ID do paciente que realizou o teste")
    majority_decision: str
    vote_count: SpiralTestVoteCount
    model_results: Dict[str, ModelPrediction]
    score: float = Field(..., description="Score calculado do teste")
    execution_date: datetime = Field(..., description="Data e hora de execução do teste")


class ClinicalVoiceTestResult(BaseModel):
    """
    Resultado detalhado do teste de voz clínico.
    Inclui informações adicionais para o médico.
    """

    test_id: int = Field(..., description="ID do teste salvo no banco de dados")
    patient_id: int = Field(..., description="ID do paciente que realizou o teste")
    score: float = Field(..., example=0.92)
    analysis: str = Field(..., example="A análise da voz indica A, B e C.")
    execution_date: datetime = Field(..., description="Data e hora de execução do teste")


# Schemas para perfil e estatísticas do paciente


class PatientTestStatistics(BaseModel):
    """Estatísticas agregadas dos testes de um paciente"""

    total_tests: int = Field(..., description="Total de testes realizados")
    total_spiral_tests: int = Field(..., description="Total de testes de espiral")
    total_voice_tests: int = Field(..., description="Total de testes de voz")
    avg_spiral_score: Optional[float] = Field(
        None, description="Score médio de testes de espiral"
    )
    avg_voice_score: Optional[float] = Field(
        None, description="Score médio de testes de voz"
    )
    last_test_date: Optional[datetime] = Field(None, description="Data do último teste")
    days_since_last_test: Optional[int] = Field(
        None, description="Dias desde o último teste"
    )
    first_test_date: Optional[datetime] = Field(None, description="Data do primeiro teste")
    trend: Literal["improving", "stable", "worsening"] = Field(
        ..., description="Tendência geral"
    )
    trend_percentage: float = Field(..., description="Percentual de mudança na tendência")
    best_spiral_score: Optional[float] = Field(
        None, description="Melhor score em teste de espiral"
    )
    worst_spiral_score: Optional[float] = Field(
        None, description="Pior score em teste de espiral"
    )
    best_voice_score: Optional[float] = Field(
        None, description="Melhor score em teste de voz"
    )
    worst_voice_score: Optional[float] = Field(
        None, description="Pior score em teste de voz"
    )
    healthy_classification_count: int = Field(
        ..., description="Testes classificados como HEALTHY"
    )
    parkinson_classification_count: int = Field(
        ..., description="Testes classificados como PARKINSON"
    )
    avg_test_interval_days: Optional[float] = Field(
        None, description="Intervalo médio entre testes em dias"
    )


class TimelineTestItem(BaseModel):
    """Item individual de teste para timeline"""

    model_config = ConfigDict(use_enum_values=False)

    test_id: int
    test_type: TestType
    execution_date: datetime
    score: float
    classification: Literal["HEALTHY", "PARKINSON"]
    # Campos específicos de espiral
    draw_duration: Optional[float] = None
    method: Optional[SpiralMethods] = None
    majority_decision: Optional[str] = None
    # Campos específicos de voz
    record_duration: Optional[float] = None
    analysis: Optional[str] = None


class PatientTestTimeline(BaseModel):
    """Timeline completa de testes de um paciente"""

    tests: list[TimelineTestItem] = Field(
        ..., description="Lista de testes ordenados cronologicamente"
    )
    total_count: int = Field(..., description="Total de testes")
