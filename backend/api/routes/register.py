from http import HTTPStatus

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.services import doctor_service, patient_service, admin_service 
from infra.db.connection import get_session

from ..schemas.users import AdminSchema, DoctorSchema, PatientSchema, RegisterResponse

router = APIRouter(prefix="/register", tags=["Register"])


@router.post("/patient", status_code=HTTPStatus.CREATED, response_model=RegisterResponse)
def create_patient(patient: PatientSchema, session: Session = Depends(get_session)):
    db_patient = patient_service.create_patient(patient, session)
    return RegisterResponse(
        id=db_patient.id,
        name=db_patient.name,
        email=db_patient.email
    )


@router.post("/doctor", status_code=HTTPStatus.CREATED)
def create_doctor(doctor: DoctorSchema, session: Session = Depends(get_session)):
    import json
    print("\n=== RECEIVED DOCTOR REGISTRATION DATA ===")
    print(json.dumps(doctor.model_dump(), indent=2, default=str))
    print("=========================================\n")
    return doctor_service.create_doctor(doctor, session)

@router.post("/admin", status_code=HTTPStatus.CREATED)
def create_admin(admin: AdminSchema, session: Session = Depends(get_session)):
    return admin_service.create_admin(admin, session)