from http import HTTPStatus
from fastapi import HTTPException, UploadFile
import httpx
from pydantic import BaseModel
import os
from api.schemas.tests import SpiralImageSchema, SpiralTestResult, VoiceTestResult
from .converter import convert_webm_to_wav


def get_spiral_image_models_response(schema: SpiralImageSchema, service_url: str) -> SpiralTestResult: 
    files = {
        "image": (schema.image_filename, schema.image_content, schema.image_content_type)
    }

    try:
        with httpx.Client() as client:
            response = client.post(service_url, files=files, timeout=30.0)
            response.raise_for_status()

        return SpiralTestResult(**response.json())

    except httpx.HTTPStatusError as e:
        error_detail = e.response.json().get("detail", e.response.text)
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Erro no serviço de análise de imagem: {error_detail}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
            detail=f"Não foi possível comunicar com o serviço de análise de imagem: {e}",
        )
    
def get_voice_model_response(audio_file: UploadFile, service_url: str) -> VoiceTestResult:
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
                response = client.post(service_url, files=files, timeout=30.0)
                response.raise_for_status()
        
        return VoiceTestResult(**response.json())

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