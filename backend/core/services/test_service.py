import httpx
from fastapi import HTTPException
from api.schemas.tests import SpiralImageSchema, SpiralPracticeTestResult, PatientTestResult
from sqlalchemy.orm import Session
from .user_service import get_user_active_binds
from ..models import User
from http import HTTPStatus
from ..models import Test
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
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
            detail=f"Não foi possível comunicar com o serviço de análise de imagem: {e}"
        )

def process_voice_as_practice():
    ...

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