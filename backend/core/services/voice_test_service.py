import os
import subprocess
import tempfile
import httpx
from fastapi import HTTPException, UploadFile
from api.schemas.tests import VoicePracticeTestResult

MODEL_SERVICE_URL = "http://voice-classifier:8002/predict/voice"


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