from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.orm import Session

from core.models.users import User
from core.security.security import get_doctor_user, get_patient_user
from core.services.test_service import (
    get_my_test_detail,
    get_my_tests_timeline,
    get_patient_detaild_tests,
    get_patient_test_statistics,
    get_patient_test_timeline,
    get_patient_tests,
    get_test_detail,
    process_clinical_spiral,
    process_clinical_voice,
    process_spiral,
    process_spiral_as_practice,
    process_voice,
    process_voice_as_practice,
)
from infra.db.connection import get_session

from ..schemas.tests import (
    BasicTestReturn,
    ClinicalProcessSpiralSchema,
    ClinicalProcessVoiceSchema,
    ClinicalSpiralTestResult,
    ClinicalVoiceTestResult,
    DetaildTestsReturn,
    PatientTestStatistics,
    PatientTestTimeline,
    ProcessSpiralSchema,
    ProcessVoiceSchema,
    SpiralImageSchema,
    SpiralTestResult,
    VoiceTestResult,
)

router = APIRouter(prefix="/tests", tags=["Tests"])

CurrentPatient = Annotated[User, Depends(get_patient_user())]
CurrentDoctor = Annotated[User, Depends(get_doctor_user())]


@router.post("/spiral/process")
def process_spiral_test(
    user: CurrentPatient,
    session: Session = Depends(get_session),
    schema: ProcessSpiralSchema = Depends(ProcessSpiralSchema.as_form),
):
    """
    Processa teste de espiral do paciente (salva no banco).
    Retorna apenas o resultado do modelo de ML.
    """
    model_result, _ = process_spiral(schema, user, session)
    return model_result


@router.post("/voice/process")
def process_voice_test(
    user: CurrentPatient,
    session: Session = Depends(get_session),
    schema: ProcessVoiceSchema = Depends(ProcessVoiceSchema.as_form),
):
    """
    Processa teste de voz do paciente (salva no banco).
    Retorna apenas o resultado do modelo de ML.
    """
    model_result, _ = process_voice(schema, user, session)
    return model_result


@router.post("/spiral/practice", response_model=SpiralTestResult)
def practice_spiral_test(
    user: CurrentPatient, image: SpiralImageSchema = Depends(SpiralImageSchema.as_form)
):
    """
    Teste de prática de espiral (não salva no banco de dados).
    Retorna apenas o resultado do modelo de ML.
    """
    return process_spiral_as_practice(image)


@router.post("/voice/practice", response_model=VoiceTestResult)
def practice_voice_test(user: CurrentPatient, audio_file: UploadFile):
    """
    Teste de prática de voz (não salva no banco de dados).
    Retorna apenas o resultado do modelo de ML.
    """
    return process_voice_as_practice(audio_file)


# Endpoints para testes clínicos (iniciados pelo médico)


@router.post("/clinical/spiral/process", response_model=ClinicalSpiralTestResult)
def process_clinical_spiral_test(
    user: CurrentDoctor,
    session: Session = Depends(get_session),
    schema: ClinicalProcessSpiralSchema = Depends(ClinicalProcessSpiralSchema.as_form),
):
    """
    Processa teste de espiral clínico iniciado pelo médico.

    O médico deve fornecer o patient_id do paciente vinculado que realizará o teste.
    O teste é salvo no banco de dados e retorna informações detalhadas incluindo test_id.

    Requer autenticação de médico.
    """
    return process_clinical_spiral(schema, user, session)


@router.post("/clinical/voice/process", response_model=ClinicalVoiceTestResult)
def process_clinical_voice_test(
    user: CurrentDoctor,
    session: Session = Depends(get_session),
    schema: ClinicalProcessVoiceSchema = Depends(ClinicalProcessVoiceSchema.as_form),
):
    """
    Processa teste de voz clínico iniciado pelo médico.

    O médico deve fornecer o patient_id do paciente vinculado que realizará o teste.
    O teste é salvo no banco de dados e retorna informações detalhadas incluindo test_id.

    Requer autenticação de médico.
    """
    return process_clinical_voice(schema, user, session)


@router.get("/{patient_id}", response_model=list[BasicTestReturn])
def get_basic_tests_results(
    user: CurrentDoctor, patient_id: int, session: Session = Depends(get_session)
):
    """
    Retorna os resultados de todos os teste de um paciente para o médico.
    O médico que utiliza o endpoint só pode vizualizar os resultados de
    seus pacientes vinculados.
    """
    return get_patient_tests(session, user, patient_id)


@router.get("/detail/{patient_id}", response_model=DetaildTestsReturn)
def get_detailed_tests_results(
    user: CurrentDoctor, patient_id: int, session: Session = Depends(get_session)
):
    """
    Retorna os resultados de todos os teste de um paciente para o médico.
    O médico que utiliza o endpoint só pode vizualizar os resultados de
    seus pacientes vinculados.
    """
    return get_patient_detaild_tests(session, user, patient_id)


@router.get("/patient/{patient_id}/statistics", response_model=PatientTestStatistics)
def get_patient_statistics(
    user: CurrentDoctor, patient_id: int, session: Session = Depends(get_session)
):
    """
    Retorna estatísticas agregadas dos testes de um paciente.
    Inclui tendência, scores médios, melhores/piores resultados, etc.
    """
    return get_patient_test_statistics(session, user, patient_id)


@router.get("/patient/{patient_id}/timeline", response_model=PatientTestTimeline)
def get_patient_timeline(
    user: CurrentDoctor, patient_id: int, session: Session = Depends(get_session)
):
    """
    Retorna timeline completa de testes de um paciente ordenada cronologicamente.
    Útil para visualizações e gráficos de progressão.
    """
    return get_patient_test_timeline(session, user, patient_id)


@router.get("/test/{test_id}")
def get_test_details(
    user: CurrentDoctor, test_id: int, session: Session = Depends(get_session)
):
    """
    Retorna os detalhes completos de um teste individual.
    Inclui informações do teste, paciente e classificação.

    O médico só pode visualizar testes de seus pacientes vinculados.
    Retorna SpiralTestDetail ou VoiceTestDetail dependendo do tipo do teste.
    """
    return get_test_detail(session, user, test_id)


# Endpoints para pacientes visualizarem seus próprios testes


@router.get("/my-tests/timeline", response_model=PatientTestTimeline)
def get_my_timeline(user: CurrentPatient, session: Session = Depends(get_session)):
    """
    Retorna timeline completa de testes do próprio paciente ordenada cronologicamente.
    Útil para visualizações e gráficos de progressão do paciente.

    Requer autenticação de paciente.
    """
    return get_my_tests_timeline(session, user)


@router.get("/my-tests/{test_id}")
def get_my_test_details(
    user: CurrentPatient, test_id: int, session: Session = Depends(get_session)
):
    """
    Retorna os detalhes completos de um teste do próprio paciente.
    Inclui informações do teste e classificação.

    O paciente só pode visualizar seus próprios testes.
    Retorna SpiralTestDetail ou VoiceTestDetail dependendo do tipo do teste.

    Requer autenticação de paciente.
    """
    return get_my_test_detail(session, user, test_id)
