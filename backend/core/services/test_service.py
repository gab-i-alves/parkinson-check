import os
from http import HTTPStatus
from ..utils import ai
import httpx
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from ..enums.test_enum import TestType, TestStatus
from api.schemas.tests import (
    BasicTestReturn,
    DetaildTestsReturn,
    SpiralImageSchema,
    ProcessSpiralSchema,
    ProcessVoiceSchema,
    SpiralTestResult,
    VoiceTestResult,
)

from ..models import SpiralTest, Test, User, VoiceTest
from .user_service import get_user_active_binds

SPIRAL_MODEL_SERVICE_URL = "http://localhost:8001/predict/spiral"
VOICE_MODEL_SERVICE_URL = "http://localhost:8002/predict/voice"

def process_spiral(schema: ProcessSpiralSchema, user: User, session: Session) -> SpiralTestResult:
    model_result = ai.get_spiral_image_models_response(schema.image, SPIRAL_MODEL_SERVICE_URL)

    score = model_result.vote_count.Healthy / model_result.vote_count.Parkinson
    
    spiral_test_db = SpiralTest(
        test_type=TestType.SPIRAL_TEST,
        status=TestStatus.DONE,
        score=score, # TODO: DEFINIR COMO AVALIAR ISSO
        patient_id=user.id,
        draw_duration=schema.draw_duration,
        method=schema.method
    )
    
    session.add(spiral_test_db)
    session.commit()
    return model_result

def process_voice(schema: ProcessVoiceSchema, user: User, session: Session) -> VoiceTestResult:
    model_result = ai.get_voice_model_response(schema.audio_file, VOICE_MODEL_SERVICE_URL)
    
    voice_test_db = VoiceTest(
        test_type=TestType.VOICE_TEST,
        status=TestStatus.DONE,
        score=model_result.score,
        patient_id=user.id,
        record_duration=schema.record_duration
    )
    
    session.add(voice_test_db)
    session.commit()
    return model_result


def process_spiral_as_practice(schema: SpiralImageSchema) -> SpiralTestResult:
    return ai.get_spiral_image_models_response(schema, SPIRAL_MODEL_SERVICE_URL)


def process_voice_as_practice(audio_file: UploadFile) -> VoiceTestResult:
    return ai.get_voice_model_response(audio_file, VOICE_MODEL_SERVICE_URL)

def get_patient_tests(
    session: Session, current_user: User, patient_id: int
) -> list[BasicTestReturn]:
    binds = get_user_active_binds(session, current_user)

    if not binds:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Paciente não encontrado."
        )

    if patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="O médico não tem acesso ao paciente informado.",
        )

    db_tests = (
        session.query(Test)
        .filter(
            Test.patient_id == patient_id,
        )
        .all()
    )

    test_results = []

    for test in db_tests:
        patient_test = BasicTestReturn(
            test_id=test.id,
            test_type=test.test_type,
            execution_date=test.execution_date,
            classification="HEALTHY" if test.score < 0.80 else "PARKINSON",
            # NECESSARIA VALIDAÇÃO TEÓRICA!!!!!!
        )
        test_results.append(patient_test)

    return test_results


def get_patient_detaild_tests(
    session: Session, current_user: User, patient_id: int
) -> DetaildTestsReturn:
    binds = get_user_active_binds(session, current_user)

    if not binds:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Paciente não encontrado."
        )

    if patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="O médico não tem acesso ao paciente informado.",
        )

    voice_tests_db = (
        session.query(VoiceTest)
        .filter(
            VoiceTest.patient_id == patient_id,
        )
        .all()
    )

    spiral_tests_db = (
        session.query(SpiralTest)
        .filter(
            SpiralTest.patient_id == patient_id,
        )
        .all()
    )

    # O FastAPI deve serializar automaticamente para os schemas
    test_results = DetaildTestsReturn(
        voice_tests=voice_tests_db, spiral_tests=spiral_tests_db
    )

    return test_results
