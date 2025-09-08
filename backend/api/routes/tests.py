from typing import Annotated
from fastapi import APIRouter, Depends

from core.models.users import User
from core.security.security import get_patient_user
from core.services.tests_service import process_spiral_as_practice, process_voice_as_practice

from ..schemas.tests import SpiralImageSchema, PracticeTestResult, VoiceAudioSchema


router = APIRouter(prefix="/tests", tags=["Tests"])

CurrentPatient = Annotated[User, Depends(get_patient_user())]

@router.post("/spiral/practice", response_model=PracticeTestResult)
def practice_spiral_test(
    user: CurrentPatient,
    image: SpiralImageSchema = Depends(SpiralImageSchema.as_form)
    ):
    
    return process_spiral_as_practice(image)

@router.post("/voice/practice", response_model=PracticeTestResult)
def practice_spiral_test(
    user: CurrentPatient,
    voice: VoiceAudioSchema = Depends(VoiceAudioSchema.as_form)
    ):
    
    return process_voice_as_practice(voice)