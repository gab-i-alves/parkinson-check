import os
from http import HTTPStatus
from ..utils import ai
import httpx
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from ..enums.test_enum import TestType, TestStatus
from api.schemas.tests import (
    BasicTestReturn,
    ClinicalProcessSpiralSchema,
    ClinicalProcessVoiceSchema,
    ClinicalSpiralTestResult,
    ClinicalVoiceTestResult,
    DetaildTestsReturn,
    ProcessSpiralSchema,
    ProcessVoiceSchema,
    SpiralImageSchema,
    SpiralTestResult,
    VoiceTestResult,
)

from ..models import SpiralTest, Test, User, VoiceTest
from .user_service import get_user_active_binds

SPIRAL_MODEL_SERVICE_URL = "http://spiral-classifier:8001/predict/spiral"
VOICE_MODEL_SERVICE_URL = "http://voice-classifier:8002/predict/voice"

def process_spiral(
    schema: ProcessSpiralSchema, user: User, session: Session
) -> tuple[SpiralTestResult, int]:
    """
    Processa teste de espiral e salva no banco de dados.

    Returns:
        tuple: (SpiralTestResult, test_id)
    """
    model_result = ai.get_spiral_image_models_response(
        schema.image, SPIRAL_MODEL_SERVICE_URL
    )

    score = model_result.vote_count.Healthy / model_result.vote_count.Parkinson

    spiral_test_db = SpiralTest(
        test_type=TestType.SPIRAL_TEST,
        status=TestStatus.DONE,
        score=score,  # TODO: DEFINIR COMO AVALIAR ISSO
        patient_id=user.id,
        draw_duration=schema.draw_duration,
        method=schema.method,
    )

    session.add(spiral_test_db)
    session.commit()
    session.refresh(spiral_test_db)  # Garante que temos o ID gerado

    return model_result, spiral_test_db.id

def process_voice(
    schema: ProcessVoiceSchema, user: User, session: Session
) -> tuple[VoiceTestResult, int]:
    """
    Processa teste de voz e salva no banco de dados.

    Returns:
        tuple: (VoiceTestResult, test_id)
    """
    model_result = ai.get_voice_model_response(
        schema.audio_file, VOICE_MODEL_SERVICE_URL
    )

    voice_test_db = VoiceTest(
        test_type=TestType.VOICE_TEST,
        status=TestStatus.DONE,
        score=model_result.score,
        patient_id=user.id,
        record_duration=schema.record_duration,
    )

    session.add(voice_test_db)
    session.commit()
    session.refresh(voice_test_db)  # Garante que temos o ID gerado

    return model_result, voice_test_db.id


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


# Funções para testes clínicos (iniciados pelo médico)


def process_clinical_spiral(
    schema: ClinicalProcessSpiralSchema, doctor: User, session: Session
) -> ClinicalSpiralTestResult:
    """
    Processa teste de espiral clínico iniciado pelo médico.

    Valida se o médico tem vínculo ativo com o paciente antes de processar.

    Args:
        schema: Dados do teste incluindo patient_id
        doctor: Médico logado que está conduzindo o teste
        session: Sessão do banco de dados

    Returns:
        ClinicalSpiralTestResult com informações detalhadas do teste

    Raises:
        HTTPException: Se médico não tem vínculo com paciente
    """
    # Valida se o médico tem acesso ao paciente
    binds = get_user_active_binds(session, doctor)

    if not binds:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Você não possui pacientes vinculados.",
        )

    if schema.patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="Você não tem acesso a este paciente.",
        )

    # Busca o paciente
    patient = session.query(User).filter(User.id == schema.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Paciente não encontrado."
        )

    # Cria schema de processamento normal com os dados do paciente
    process_schema = ProcessSpiralSchema(
        image=schema.image, draw_duration=schema.draw_duration, method=schema.method
    )

    # Processa o teste usando a função existente
    model_result, test_id = process_spiral(process_schema, patient, session)

    # Busca o teste criado para pegar execution_date
    test_db = session.query(SpiralTest).filter(SpiralTest.id == test_id).first()

    # Retorna resultado detalhado para o médico
    return ClinicalSpiralTestResult(
        test_id=test_id,
        patient_id=schema.patient_id,
        majority_decision=model_result.majority_decision,
        vote_count=model_result.vote_count,
        model_results=model_result.model_results,
        score=test_db.score,
        execution_date=test_db.execution_date,
    )


def process_clinical_voice(
    schema: ClinicalProcessVoiceSchema, doctor: User, session: Session
) -> ClinicalVoiceTestResult:
    """
    Processa teste de voz clínico iniciado pelo médico.

    Valida se o médico tem vínculo ativo com o paciente antes de processar.

    Args:
        schema: Dados do teste incluindo patient_id
        doctor: Médico logado que está conduzindo o teste
        session: Sessão do banco de dados

    Returns:
        ClinicalVoiceTestResult com informações detalhadas do teste

    Raises:
        HTTPException: Se médico não tem vínculo com paciente
    """
    # Valida se o médico tem acesso ao paciente
    binds = get_user_active_binds(session, doctor)

    if not binds:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail="Você não possui pacientes vinculados.",
        )

    if schema.patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="Você não tem acesso a este paciente.",
        )

    # Busca o paciente
    patient = session.query(User).filter(User.id == schema.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Paciente não encontrado."
        )

    # Cria schema de processamento normal com os dados do paciente
    process_schema = ProcessVoiceSchema(
        record_duration=schema.record_duration, audio_file=schema.audio_file
    )

    # Processa o teste usando a função existente
    model_result, test_id = process_voice(process_schema, patient, session)

    # Busca o teste criado para pegar execution_date
    test_db = session.query(VoiceTest).filter(VoiceTest.id == test_id).first()

    # Retorna resultado detalhado para o médico
    return ClinicalVoiceTestResult(
        test_id=test_id,
        patient_id=schema.patient_id,
        score=model_result.score,
        analysis=model_result.analysis,
        execution_date=test_db.execution_date,
    )
