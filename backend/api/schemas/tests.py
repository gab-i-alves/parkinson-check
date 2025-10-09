from datetime import date
from typing import Dict, Literal, Optional

from fastapi import File, UploadFile
from pydantic import BaseModel, Field

from core.enums import SpiralMethods, TestStatus, TestType


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


class ModelPrediction(BaseModel):
    prediction: str
    probabilities: Optional[Dict[str, float]] = None


class SpiralTestVoteCount(BaseModel):
    Healthy: int
    Parkinson: int


class SpiralPracticeTestResult(BaseModel):
    majority_decision: str
    vote_count: SpiralTestVoteCount
    model_results: Dict[str, ModelPrediction]


class VoicePracticeTestResult(BaseModel):
    score: float = Field(..., example=0.92)
    analysis: str = Field(..., example="A análise da sua voz indica A, B e C.")


# Schema não detalhado resultado do teste
class BasicTestReturn(BaseModel):
    test_id: int
    test_type: TestStatus
    execution_date: date
    classification: Literal["HEALTHY", "PARKINSON"]


# Schemas detalhados, com base nos atributos dos modelos persistentes


class BaseTest(BaseModel):
    id: int
    test_type: TestType
    execution_date: date
    status: TestStatus
    score: float
    patient_id: int

    model_config = {"from_attributes": True}


class VoiceTest(BaseTest):
    record_duration: float


class SpiralTest(BaseTest):
    draw_duration: float
    method: SpiralMethods


class DetaildTestsReturn(BaseModel):
    voice_tests: list[VoiceTest]
    spiral_tests: list[SpiralTest]
