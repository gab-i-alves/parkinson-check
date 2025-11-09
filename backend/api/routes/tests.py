from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from core.models.users import User
from core.security.security import get_doctor_user, get_patient_user
from core.services.test_service import (
    get_my_spiral_image,
    get_my_test_detail,
    get_my_tests_statistics,
    get_my_tests_timeline,
    get_my_voice_audio,
    get_patient_detaild_tests,
    get_patient_test_statistics,
    get_patient_test_timeline,
    get_patient_tests,
    get_spiral_image,
    get_test_detail,
    get_voice_audio,
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


@router.get("/my-tests/statistics", response_model=PatientTestStatistics)
def get_my_statistics(
    user: CurrentPatient, session: Session = Depends(get_session)
):
    """
    Retorna estatísticas agregadas dos testes do próprio paciente.
    Inclui tendência, scores médios, melhores/piores resultados, etc.

    Requer autenticação de paciente.
    """
    return get_my_tests_statistics(session, user)


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


@router.get("/my-tests/{test_id}/spiral-image")
def get_my_test_spiral_image(
    user: CurrentPatient, test_id: int, session: Session = Depends(get_session)
):
    """
    Retorna a imagem de um teste de espiral do próprio paciente.

    O paciente só pode visualizar imagens de seus próprios testes.
    Retorna a imagem como arquivo binário.

    Requer autenticação de paciente.
    """
    image_data, filename, content_type = get_my_spiral_image(session, user, test_id)

    return Response(
        content=image_data,
        media_type=content_type,
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


@router.get("/my-tests/{test_id}/voice-audio")
def get_my_test_voice_audio(
    user: CurrentPatient, test_id: int, session: Session = Depends(get_session)
):
    """
    Retorna o áudio de um teste de voz do próprio paciente.

    O paciente só pode visualizar áudios de seus próprios testes.
    Retorna o áudio como arquivo binário.

    Requer autenticação de paciente.
    """
    audio_data, filename, content_type = get_my_voice_audio(session, user, test_id)

    return Response(
        content=audio_data,
        media_type=content_type,
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


# Endpoints para recuperar mídias (imagens e áudios) dos testes


@router.get("/test/{test_id}/spiral-image")
def get_test_spiral_image(
    user: CurrentDoctor, test_id: int, session: Session = Depends(get_session)
):
    """
    Retorna a imagem de um teste de espiral.

    O médico só pode visualizar imagens de testes de seus pacientes vinculados.
    Retorna a imagem como arquivo binário.

    Requer autenticação de médico.
    """
    image_data, filename, content_type = get_spiral_image(session, user, test_id)

    return Response(
        content=image_data,
        media_type=content_type,
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


@router.get("/test/{test_id}/voice-audio")
def get_test_voice_audio(
    user: CurrentDoctor, test_id: int, session: Session = Depends(get_session)
):
    """
    Retorna o áudio de um teste de voz.

    O médico só pode visualizar áudios de testes de seus pacientes vinculados.
    Retorna o áudio como arquivo binário.

    Requer autenticação de médico.
    """
    audio_data, filename, content_type = get_voice_audio(session, user, test_id)

    return Response(
        content=audio_data,
        media_type=content_type,
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )
