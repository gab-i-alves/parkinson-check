import httpx
import os
import subprocess
import tempfile
from fastapi import HTTPException, UploadFile
from api.schemas.tests import SpiralImageSchema, SpiralPracticeTestResult, PatientTestResult, VoicePracticeTestResult
from sqlalchemy.orm import Session
from .user_service import get_user_active_binds
from ..models import User
from http import HTTPStatus
from ..models import Test

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

def get_patient_tests(session: Session, current_user: User, patient_id: int) -> list[PatientTestResult]:
    binds = get_user_active_binds(current_user, session)
    
    if not binds:
        return HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Paciente não encontrado.")
    
    if patient_id not in [bind.patient_id for bind in binds]:
        return HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="O médico não tem acesso ao paciente informado.")
    
    db_tests = session.query(Test).filter(
        Test.patient_id==patient_id,
    )
    
    test_results = []
    
    for test in db_tests:
        patient_test = PatientTestResult(
            test_id=test.id,
            test_type=test.test_type,
            execution_date=test.execution_date,
            classification="HEALTHY" if test.score < 0.80 else "PARKINSON" #NECESSARIA VALIDAÇÃO TEÓRICA!!!!!!
        )
        test_results.append(patient_test)
    
    return test_results
    
def get_patient_detaild_tests():
    ...
    
def convert_webm_to_wav(upload_file: UploadFile) -> str:
    """
    Converte um arquivo WebM (upload do frontend) em WAV (16kHz mono)
    usando ffmpeg. Retorna o caminho para o arquivo WAV temporário.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_webm:
        upload_file.file.seek(0)
        temp_webm.write(upload_file.file.read())
        temp_webm_path = temp_webm.name

    temp_wav_path = temp_webm_path.replace(".webm", ".wav")

    try:
        command = [
            "ffmpeg",
            "-y", 
            "-i", temp_webm_path,
            "-ar", "16000",
            "-ac", "1",   
            temp_wav_path,
        ]
        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True 
        )
        return temp_wav_path
    except subprocess.CalledProcessError as e:
        print(f"Erro do FFMPEG: {e.stderr}")
        raise RuntimeError(f"Erro ao converter áudio: {e.stderr}")
    finally:
        if os.path.exists(temp_webm_path):
            os.remove(temp_webm_path)