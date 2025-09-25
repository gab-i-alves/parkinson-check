import httpx
import os
import subprocess
import tempfile
from fastapi import HTTPException, UploadFile
from api.schemas.tests import SpiralImageSchema, SpiralPracticeTestResult, BasicTestReturn, VoicePracticeTestResult, DetaildTestsReturn
from sqlalchemy.orm import Session
from .user_service import get_user_active_binds
from ..models import User
from http import HTTPStatus
from ..models import Test, VoiceTest, SpiralTest
from utils.converter import convert_webm_to_wav

MODEL_SERVICE_URL = "http://spiral-classifier:8001/predict/spiral"
MODEL_SERVICE_URL = "http://voice-classifier:8002/predict/voice"

def process_spiral_as_practice(schema: SpiralImageSchema) -> SpiralPracticeTestResult:
    files = {'image': (schema.image_filename, schema.image_content, schema.image_content_type)}
    
    try:
        with httpx.Client() as client:
            response = client.post(MODEL_SERVICE_URL, files=files, timeout=30.0)
            response.raise_for_status()
            
        return response.json()

    except httpx.HTTPStatusError as e:
        error_detail = e.response.json().get("detail", e.response.text)
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Erro no serviço de análise de imagem: {error_detail}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
            detail=f"Não foi possível comunicar com o serviço de análise de imagem: {e}"
        )

def process_voice_as_practice(audio_file: UploadFile) -> VoicePracticeTestResult:
    """
    Processa um arquivo de voz recebido do frontend:
    - Converte .webm -> .wav
    - Envia o WAV para o microserviço de análise (voice-classifier)
    - Retorna o resultado
    """
    wav_path = ""
    try:
        wav_path = convert_webm_to_wav(audio_file)

        with open(wav_path, "rb") as f:
            files = {"audio": ("audio.wav", f, "audio/wav")}
            with httpx.Client() as client:
                response = client.post(MODEL_SERVICE_URL, files=files, timeout=30.0)
                response.raise_for_status()

        return response.json()

    except httpx.HTTPStatusError as e:
        error_detail = e.response.json().get("detail", e.response.text)
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Erro no serviço de análise de voz: {error_detail}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Não foi possível comunicar com o serviço de análise de voz: {e}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no processamento do áudio: {e}")
    finally:
        if wav_path and os.path.exists(wav_path):
            os.remove(wav_path)

def get_patient_tests(session: Session, current_user: User, patient_id: int) -> list[BasicTestReturn]:
    binds = get_user_active_binds(current_user, session)
    
    if not binds:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Paciente não encontrado.")
    
    if patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="O médico não tem acesso ao paciente informado.")
    
    db_tests = session.query(Test).filter(
        Test.patient_id==patient_id,
    ).all()
    
    test_results = []
    
    for test in db_tests:
        patient_test = BasicTestReturn(
            test_id=test.id,
            test_type=test.test_type,
            execution_date=test.execution_date,
            classification="HEALTHY" if test.score < 0.80 else "PARKINSON" #NECESSARIA VALIDAÇÃO TEÓRICA!!!!!!
        )
        test_results.append(patient_test)
    
    return test_results
    
def get_patient_detaild_tests(session: Session, current_user: User, patient_id: int) -> DetaildTestsReturn:
    binds = get_user_active_binds(current_user, session)
    
    if not binds:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Paciente não encontrado.")
    
    if patient_id not in [bind.patient_id for bind in binds]:
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="O médico não tem acesso ao paciente informado.")
    
    
    voice_tests_db = session.query(VoiceTest).filter(
        VoiceTest.patient_id==patient_id,
    ).all()
    
    spiral_tests_db = session.query(SpiralTest).filter(
        SpiralTest.patient_id==patient_id,
    ).all()
    
    #O FastAPI deve serializar automaticamente para os schemas
    test_results = DetaildTestsReturn(
        voice_tests=voice_tests_db,
        spiral_tests=spiral_tests_db
    )
    
    return test_results