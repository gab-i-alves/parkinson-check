from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.orm import Session

from core.models.users import User
from core.security.security import get_doctor_user, get_patient_user
from core.services.test_service import (
    get_patient_detaild_tests,
    get_patient_tests,
    process_spiral_as_practice,
    process_voice_as_practice,
)
from infra.db.connection import get_session

from ..schemas.tests import (
    BasicTestReturn,
    DetaildTestsReturn,
    SpiralImageSchema,
    SpiralPracticeTestResult,
    VoicePracticeTestResult,
)

router = APIRouter(prefix="/tests", tags=["Tests"])

CurrentPatient = Annotated[User, Depends(get_patient_user())]
CurrentDoctor = Annotated[User, Depends(get_doctor_user())]


@router.post("/spiral/practice", response_model=SpiralPracticeTestResult)
def practice_spiral_test(
    user: CurrentPatient, image: SpiralImageSchema = Depends(SpiralImageSchema.as_form)
):
    return process_spiral_as_practice(image)


@router.post("/voice/practice", response_model=VoicePracticeTestResult)
def practice_voice_test(user: CurrentPatient, audio_file: UploadFile):
    return process_voice_as_practice(audio_file)


# @router.post("/spiral/process")
# def process_spiral_test(
#     user: CurrentPatient, image: SpiralImageSchema = Depends(SpiralImageSchema.as_form)
# ):
#     return process_spiral(image, user)


# @router.post("/voice/process")
# def process_voice_test(user: CurrentPatient, audio_file: UploadFile):
#     return process_voice(audio_file, user)


@router.get("/{patient_id}", response_model=list[BasicTestReturn])
def get_basic_tests_results(
    user: CurrentDoctor, patient_id: int, session: Session = Depends(get_session)
):
    """
    Retorna os resultados de todos os teste de um paciente para o médico.
    O médico que utiliza o endpoint só pode vizualizar os resultados de
    seus pacientes vinculados.
    """
    return get_patient_tests(user, patient_id, session)


@router.get("/detail/{patient_id}", response_model=DetaildTestsReturn)
def get_detailed_tests_results(
    user: CurrentDoctor, patient_id: int, session: Session = Depends(get_session)
):
    """
    Retorna os resultados de todos os teste de um paciente para o médico.
    O médico que utiliza o endpoint só pode vizualizar os resultados de
    seus pacientes vinculados.
    """
    return get_patient_detaild_tests(user, patient_id, session)
