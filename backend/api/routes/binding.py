from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.enums import BindEnum
from core.models.users import User
from core.security.security import get_current_user, get_doctor_user, get_patient_user
from core.services import doctor_service, patient_service
from infra.db.connection import get_session

from ..schemas.binding import (
    Bind,
    BindindRequestResponse,
    BindingDoctor,
    BindingPatient,
    ReceivedBindingRequestResponse,
    RequestBinding,
    SentBindindRequestResponse,
    SentBindingRequestByDoctorResponse,
)

router = APIRouter(prefix="/bindings", tags=["Bindings"])

CurrentPatient = Annotated[User, Depends(get_patient_user())]
CurrentDoctor = Annotated[User, Depends(get_doctor_user())]

"""Patient"""


@router.get("/requests/sent", response_model=list[SentBindindRequestResponse])
def get_sent_binding_requests(
    user: CurrentPatient, session: Session = Depends(get_session)
):
    bindings = doctor_service.get_sent_binding_requests(user, session)

    return [format_sent_bindings(binding) for binding in bindings]


@router.post("/request", response_model=Bind)
def request_binding(
    request: RequestBinding, user: User = Depends(get_current_user), session: Session = Depends(get_session)
):
    """
    Endpoint genérico para solicitar vínculo. Funciona tanto para médicos quanto pacientes.
    - Paciente envia doctor_id
    - Médico envia patient_id
    """
    return patient_service.create_bind_request(request, user, session)


@router.get("/requests/received", response_model=list[ReceivedBindingRequestResponse])
def get_received_binding_requests(
    user: CurrentPatient, session: Session = Depends(get_session)
):
    """
    Endpoint para paciente ver solicitações de vínculo RECEBIDAS de médicos (pendentes).
    """
    bindings = patient_service.get_pending_requests_from_doctors(user, session)

    return [format_received_bindings(binding) for binding in bindings]


@router.post("/{binding_id}/accept-by-patient", response_model=Bind)
def accept_bind_request_by_patient(
    binding_id: int, user: CurrentPatient, session: Session = Depends(get_session)
):
    """
    Endpoint para paciente aceitar uma solicitação de vínculo de um médico.
    """
    return patient_service.accept_doctor_request(user, binding_id, session)


@router.post("/{binding_id}/reject-by-patient", response_model=Bind)
def reject_bind_request_by_patient(
    binding_id: int, user: CurrentPatient, session: Session = Depends(get_session)
):
    """
    Endpoint para paciente rejeitar uma solicitação de vínculo de um médico.
    """
    return patient_service.reject_doctor_request(user, binding_id, session)


"""Doctor"""


@router.get("/requests", response_model=list[BindindRequestResponse])
def get_pending_binding_requests(
    user: CurrentDoctor, session: Session = Depends(get_session)
):
    bindings = doctor_service.get_pending_binding_requests(user, session)

    return [format_bindings(binding) for binding in bindings]


@router.post("/{binding_id}/accept", response_model=Bind)
def accept_bind_request(
    binding_id: int, user: CurrentDoctor, session: Session = Depends(get_session)
):
    return doctor_service.activate_or_reject_binding_request(
        user, binding_id, session, new_status=BindEnum.ACTIVE
    )


@router.post("/{binding_id}/reject", response_model=Bind)
def reject_bind_request(
    binding_id: int, user: CurrentDoctor, session: Session = Depends(get_session)
):
    return doctor_service.activate_or_reject_binding_request(
        user, binding_id, session, new_status=BindEnum.REJECTED
    )


@router.get("/requests/sent-by-doctor", response_model=list[SentBindingRequestByDoctorResponse])
def get_sent_binding_requests_by_doctor(
    user: CurrentDoctor, session: Session = Depends(get_session)
):
    """
    Endpoint para médico ver solicitações de vínculo ENVIADAS para pacientes (pendentes).
    """
    bindings = doctor_service.get_sent_requests_to_patients(user, session)

    return [format_sent_bindings_by_doctor(binding) for binding in bindings]


@router.delete("/{binding_id}", status_code=HTTPStatus.NO_CONTENT)
def unlink_binding_request(
    binding_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)
):
    """
    Endpoint genérico para desvincular. Funciona tanto para médicos quanto pacientes.
    - Paciente pode desvincular-se de médico
    - Médico pode desvincular-se de paciente
    """
    from core.enums import UserType

    if current_user.user_type == UserType.PATIENT:
        patient_service.unlink_binding(binding_id, current_user, session)
    elif current_user.user_type == UserType.DOCTOR:
        doctor_service.unlink_patient(binding_id, current_user, session)
    else:
        raise HTTPException(HTTPStatus.FORBIDDEN, detail="Tipo de usuário inválido.")


def format_bindings(bind_with_patient):
    patient = BindingPatient(
        id=bind_with_patient.Patient.id,
        name=bind_with_patient.Patient.name,
        email=bind_with_patient.Patient.email,
    )

    return BindindRequestResponse(
        id=bind_with_patient.Bind.id, patient=patient, status=bind_with_patient.Bind.status
    )


def format_sent_bindings(bind_with_doctor):
    doctor = BindingDoctor(
        id=bind_with_doctor.Doctor.id,
        name=bind_with_doctor.Doctor.name,
        specialty=bind_with_doctor.Doctor.expertise_area,
    )

    return SentBindindRequestResponse(id=bind_with_doctor.Bind.id, doctor=doctor)


def format_received_bindings(bind_with_doctor):
    """Formata solicitação recebida pelo paciente (enviada por médico)"""
    doctor = BindingDoctor(
        id=bind_with_doctor.Doctor.id,
        name=bind_with_doctor.Doctor.name,
        specialty=bind_with_doctor.Doctor.expertise_area,
    )

    return ReceivedBindingRequestResponse(
        id=bind_with_doctor.Bind.id,
        doctor=doctor,
        status=bind_with_doctor.Bind.status
    )


def format_sent_bindings_by_doctor(bind_with_patient):
    """Formata solicitação enviada pelo médico para paciente"""
    patient = BindingPatient(
        id=bind_with_patient.Patient.id,
        name=bind_with_patient.Patient.name,
        email=bind_with_patient.Patient.email,
    )

    return SentBindingRequestByDoctorResponse(
        id=bind_with_patient.Bind.id,
        patient=patient
    )
