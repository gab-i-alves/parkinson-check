from http import HTTPStatus
from fastapi import APIRouter, Depends

from infra.db.connection import get_dependency_session
from .schemas.users import DoctorSchema, PatientSchema
from core.services import doctor_service, patient_service
router = APIRouter(prefix="/register", tags=["Register"])

@router.post("/patient", status_code=HTTPStatus.CREATED)
def create_patient(patient: PatientSchema, session = Depends(get_dependency_session)):
    return patient_service.create_patient(patient, session)
    
    
@router.post("/doctor", status_code=HTTPStatus.CREATED)
def create_doctor(doctor: DoctorSchema, session = Depends(get_dependency_session)):
    return doctor_service.create_doctor(doctor, session)