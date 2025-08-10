from http import HTTPStatus
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from infra.db.connection import get_session

from ..schemas.users import DoctorSchema, PatientSchema
from core.services import doctor_service, patient_service
router = APIRouter(prefix="/register", tags=["Register"])

@router.post("/patient", status_code=HTTPStatus.CREATED)
def create_patient(patient: PatientSchema, session: Session = Depends(get_session)):
    return patient_service.create_patient(patient, session)

@router.post("/doctor", status_code=HTTPStatus.CREATED)
def create_doctor(doctor: DoctorSchema, session: Session = Depends(get_session)):
    return doctor_service.create_doctor(doctor, session)