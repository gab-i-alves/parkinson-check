from http import HTTPStatus

from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from api.schemas.binding import RequestBinding
from api.schemas.users import PatientListResponse, PatientSchema
from core.models import Bind, Doctor, Patient, User
from core.security.security import get_password_hash
from core.services import address_service, user_service
from core.services.user_service import get_binded_users

from ..enums import BindEnum, UserType


def create_patient(patient: PatientSchema, session: Session):
    if user_service.get_user_by_email(patient.email, session) is not None:
        raise HTTPException(
            HTTPStatus.CONFLICT, detail="Já existe um usuário com o email informado."
        )

    if user_service.get_user_by_cpf(patient.cpf, session) is not None:
        raise HTTPException(HTTPStatus.CONFLICT, detail="O CPF informado já está em uso.")

    address = address_service.get_similar_address(
        patient.cep, patient.number, patient.complement, session
    )

    if address is None:
        address_service.create_address(
            patient.cep,
            patient.street,
            patient.number,
            patient.complement,
            patient.neighborhood,
            patient.city,
            patient.state,
            session,
        )
        address = address_service.get_similar_address(
            patient.cep, patient.number, patient.complement, session
        )

    db_patient = Patient(
        name=patient.fullname,
        cpf=patient.cpf,
        email=patient.email,
        hashed_password=get_password_hash(patient.password),
        birthdate=patient.birthdate,
        user_type=UserType.PATIENT,
        address_id=address.id,
    )

    session.add(db_patient)
    session.commit()
    session.refresh(db_patient)
    return patient


def create_bind_request(request: RequestBinding, user: User, session: Session) -> Bind:
    active_or_pending_bind = (
        session.query(Bind)
        .filter(
            Bind.doctor_id == request.doctor_id,
            Bind.patient_id == user.id,
            or_(Bind.status == BindEnum.PENDING, Bind.status == BindEnum.ACTIVE),
        )
        .first()
    )

    if active_or_pending_bind:
        raise HTTPException(
            HTTPStatus.CONFLICT, detail="Uma solicitação já está ativa ou pendente."
        )

    inactive_bind = (
        session.query(Bind)
        .filter(
            Bind.doctor_id == request.doctor_id,
            Bind.patient_id == user.id,
            or_(Bind.status == BindEnum.REJECTED, Bind.status == BindEnum.REVERSED),
        )
        .first()
    )

    if inactive_bind:
        inactive_bind.status = BindEnum.PENDING
        db_bind = inactive_bind
    else:
        doctor = session.query(Doctor).filter(Doctor.id == request.doctor_id).first()
        if not doctor:
            raise HTTPException(
                HTTPStatus.NOT_FOUND, detail="O médico do ID informado não existe."
            )

        db_bind = Bind(
            doctor_id=request.doctor_id, patient_id=user.id, status=BindEnum.PENDING
        )

    session.add(db_bind)
    session.commit()
    session.refresh(db_bind)
    return db_bind


def unlink_binding(binding_id: int, user: User, session: Session) -> Bind:
    """
    Altera o status de um link para REVERSED, desvinculando o paciente.
    """

    bind_to_unlink = session.query(Bind).filter_by(id=binding_id).first()

    if not bind_to_unlink:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Vínculo não encontrado."
        )

    if bind_to_unlink.patient_id != user.id:
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Ação não permitida.")

    bind_to_unlink.status = BindEnum.REVERSED
    session.add(bind_to_unlink)
    session.commit()
    session.refresh(bind_to_unlink)

    return bind_to_unlink


def get_binded_patients(session: Session, current_user: User) -> list[PatientListResponse]:
    """
    Com base em um usuário retorna os pacientes vinculados a ele.
    Formato de lista (PatientListResponse)
    """
    binded_patients = get_binded_users(current_user, session)

    patient_list = []

    for item in binded_patients:
        patient = item["user"]
        bind_id = item["bind_id"]
        patient_list.append(
            PatientListResponse(
                id=patient.id,
                name=patient.name,
                email=patient.email,
                location=f"{patient.address.city}, {patient.address.state}",
                role=UserType.PATIENT,
                bind_id=bind_id,
            )
        )
    return patient_list
