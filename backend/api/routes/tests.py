from typing import Annotated
from fastapi import APIRouter, Depends, Form, UploadFile

from core.models.users import User
from core.security.security import get_patient_user
from core.services.spiral_test_service import process_spiral_as_practice
from core.services.voice_test_service import process_voice_as_practice

from ..schemas.tests import SpiralImageSchema, SpiralPracticeTestResult, VoicePracticeTestResult


router = APIRouter(prefix="/tests", tags=["Tests"])

CurrentPatient = Annotated[User, Depends(get_patient_user())]

@router.post("/spiral/practice", response_model=SpiralPracticeTestResult)
def practice_spiral_test(
    user: CurrentPatient,
    image: SpiralImageSchema = Depends(SpiralImageSchema.as_form)
    ):
    
    return process_spiral_as_practice(image)

@router.post("/voice/practice", response_model=VoicePracticeTestResult)
def practice_voice_test(
    user: CurrentPatient,
    audio_file: UploadFile
    ):
    
    return process_voice_as_practice(audio_file)