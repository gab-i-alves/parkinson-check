from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.enums import BindEnum
from infra.db.connection import get_session
from ..schemas.binding import Bind, RequestBinding
from core.services import doctor_service, patient_service
from ..schemas.token import BindindRequestResponse, PatientDto, SentBindindRequestResponse, DoctorDTO
from core.security.security import get_doctor_user, get_patient_user
from core.models.users import User

router = APIRouter(prefix="/bindings", tags=["Bindings"])

CurrentPatient = Annotated[User, Depends(get_patient_user())]
CurrentDoctor = Annotated[User, Depends(get_doctor_user())]

"""Patient"""
@router.get("/requests/sent", response_model=list[SentBindindRequestResponse])
def get_binding_requests(user: CurrentPatient, session: Session = Depends(get_session)):

    bindings = doctor_service.get_sent_binding_requests(user, session)

    return [format_sent_bindings(binding) for binding in bindings]

@router.post("/request", response_model=Bind)
def request_binding(request: RequestBinding, user: CurrentPatient, session: Session = Depends(get_session)):
    return patient_service.create_bind_request(request, user, session)

"""Doctor"""
@router.get("/requests", response_model=list[BindindRequestResponse])
def get_binding_requests(user: CurrentDoctor, session: Session = Depends(get_session)):

    bindings = doctor_service.get_pending_binding_requests(user, session)

    return [format_bindings(binding) for binding in bindings]

@router.post("/{binding_id}/accept", response_model=Bind)
def accept_bind_request(binding_id: int, user: CurrentDoctor, session: Session = Depends(get_session)):
    return doctor_service.activate_or_reject_binding_request(user, binding_id, session, new_status=BindEnum.ACTIVE)

@router.post("/{binding_id}/reject", response_model=Bind)
def accept_bind_request(binding_id: int, user: CurrentDoctor, session: Session = Depends(get_session)):
    return doctor_service.activate_or_reject_binding_request(user, binding_id, session, new_status=BindEnum.REJECTED)
 
def format_bindings(bind_with_patient):
    patient = PatientDto(
        id = bind_with_patient.Patient.id,
        name = bind_with_patient.Patient.name,
        email = bind_with_patient.Patient.email
    )

    return BindindRequestResponse(
        id=bind_with_patient.Bind.id,
        patient=patient,
        status= bind_with_patient.Bind.status
    )

def format_sent_bindings(bind_with_doctor):
    doctor = DoctorDTO(
        id = bind_with_doctor.Doctor.id,
        name = bind_with_doctor.Doctor.name,
        specialty= bind_with_doctor.Doctor.expertise_area
    )

    return SentBindindRequestResponse(
        id=bind_with_doctor.Bind.id,
        doctor=doctor
    )

