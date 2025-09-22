import httpx
from fastapi import HTTPException
from api.schemas.tests import SpiralImageSchema, SpiralPracticeTestResult

MODEL_SERVICE_URL = "http://spiral-classifier:8001/predict/spiral"

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
            status_code=503, # Service Unavailable
            detail=f"Não foi possível comunicar com o serviço de análise de imagem: {e}"
        )
