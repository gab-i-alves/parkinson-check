from http import HTTPStatus

from fastapi import HTTPException
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from api.schemas.binding import (
    BindingDoctor,
    BindingPatient,
    BindingRequestResponse,
)
from core.enums.doctor_enum import ActivityType
from core.enums import BindEnum, NotificationType, UserType
from core.models import Bind, Patient, User
from core.models.users import Doctor
from core.services import notification_service, doctor_management_service


def get_pending_bind_requests(user: User, session: Session) -> list[BindingRequestResponse]:
    if user.user_type == UserType.DOCTOR:
        bindings = (
            session.query(Bind)
            .filter(Bind.status == BindEnum.PENDING, Bind.doctor_id == user.id)
            .all()
        )

        patients_ids = {bind.patient_id for bind in bindings}

        patients = session.query(Patient).filter(Patient.id.in_(patients_ids)).all()

        patients_dict = {patient.id: patient for patient in patients}

        response: list[BindingRequestResponse] = [
            BindingRequestResponse(
                id=bind.id,
                user=BindingPatient(
                    id=bind.patient_id,
                    name=patients_dict[bind.patient_id].name,
                    email=patients_dict[bind.patient_id].email,
                ),
                status=bind.status,
                created_by_type=bind.created_by_type,
            )
            for bind in bindings
            if bind.patient_id in patients_dict
        ]
        return response
    else:
        bindings = (
            session.query(Bind)
            .filter(Bind.status == BindEnum.PENDING, Bind.patient_id == user.id)
            .all()
        )

        doctors_ids = {bind.doctor_id for bind in bindings}

        doctors = session.query(Doctor).filter(Doctor.id.in_(doctors_ids)).all()

        doctors_dict = {doctor.id: doctor for doctor in doctors}

        response: list[BindingRequestResponse] = [
            BindingRequestResponse(
                id=bind.id,
                user=BindingDoctor(
                    id=bind.doctor_id,
                    name=doctors_dict[bind.doctor_id].name,
                    specialty=doctors_dict[bind.doctor_id].expertise_area,
                ),
                status=bind.status,
                created_by_type=bind.created_by_type,
            )
            for bind in bindings
            if bind.doctor_id in doctors_dict
        ]
        return response


def send_bind_request(user: User, session: Session, user_to_bind: int) -> Bind:
    if user.id == user_to_bind:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST, detail="Não é possível vincular-se a si mesmo."
        )

    active_or_pending_bind = (
        session.query(Bind)
        .filter(
            or_(
                and_(Bind.doctor_id == user_to_bind, Bind.patient_id == user.id),
                and_(Bind.doctor_id == user.id, Bind.patient_id == user_to_bind),
            ),
            Bind.status.in_([BindEnum.PENDING, BindEnum.ACTIVE]),
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
            or_(
                and_(Bind.doctor_id == user_to_bind, Bind.patient_id == user.id),
                and_(Bind.doctor_id == user.id, Bind.patient_id == user_to_bind),
            ),
            Bind.status.in_([BindEnum.REJECTED, BindEnum.REVERSED]),
        )
        .first()
    )

    if inactive_bind:
        inactive_bind.status = BindEnum.PENDING
        db_bind = inactive_bind
    else:
        target_user = session.query(User).filter(User.id == user_to_bind).first()
        if not target_user:
            raise HTTPException(
                HTTPStatus.NOT_FOUND, detail="O usuário do ID informado não existe."
            )

        if user.user_type == target_user.user_type:
            raise HTTPException(
                HTTPStatus.BAD_REQUEST,
                detail="Médicos só podem vincular pacientes e vice-versa.",
            )

        if user.user_type == UserType.DOCTOR:
            db_bind = Bind(
                doctor_id=user.id, patient_id=user_to_bind, status=BindEnum.PENDING, created_by_type=UserType.DOCTOR
            )
        else:
            db_bind = Bind(
                doctor_id=user_to_bind, patient_id=user.id, status=BindEnum.PENDING, created_by_type=UserType.PATIENT
            )

    session.add(db_bind)
    session.flush()

    if user.user_type == UserType.DOCTOR:
        user_type = "médico"
    else:
        user_type = "paciente"

    notification_service.create_notification(
        session=session,
        user_id=user_to_bind,
        message=f"O {user_type} {user.name} enviou uma solicitação de vínculo.",
        type=NotificationType.BIND_REQUEST,
        bind_id=db_bind.id,
    )

    session.commit()
    return db_bind


def accept_bind_request(user: User, session: Session, bind_id: int) -> Bind:
    bind_to_accept = session.query(Bind).filter_by(id=bind_id).first()

    if not bind_to_accept:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Requisição não encontrada."
        )

    if user.id not in [bind_to_accept.doctor_id, bind_to_accept.patient_id]:
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Ação não permitida.")

    # Validar que o usuário NÃO foi quem criou a solicitação
    if user.user_type == bind_to_accept.created_by_type:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="Você não pode aceitar uma solicitação criada por você."
        )

    if bind_to_accept.status != BindEnum.PENDING:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST,
            detail="Apenas solicitações pendentes podem ser aceitas.",
        )

    bind_to_accept.status = BindEnum.ACTIVE

    if user.user_type == UserType.DOCTOR:
        user_type = "médico"
        user_to_alert = bind_to_accept.patient_id
    else:
        user_type = "paciente"
        user_to_alert = bind_to_accept.doctor_id

    notification_service.create_notification(
        session=session,
        user_id=user_to_alert,
        message=f"O {user_type} {user.name} aceitou sua solicitação de vínculo.",
        type=NotificationType.BIND_ACCEPTED,
        bind_id=bind_to_accept.id,
    )
    session.add(bind_to_accept)
    session.commit()
    session.refresh(bind_to_accept)
    
    doctor_management_service.log_activity(bind_to_accept.doctor_id, ActivityType.PATIENT_BOUND, "Médico foi vinculado ao paciente " + bind_to_accept.patient_id, session)

    return bind_to_accept


def reject_bind_request(user: User, session: Session, bind_id: int):
    bind_to_reject = session.query(Bind).filter_by(id=bind_id).first()

    if not bind_to_reject:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Requisição não encontrada."
        )

    if user.id not in [bind_to_reject.doctor_id, bind_to_reject.patient_id]:
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Ação não permitida.")

    # Validar que o usuário NÃO foi quem criou a solicitação
    if user.user_type == bind_to_reject.created_by_type:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="Você não pode rejeitar uma solicitação criada por você."
        )

    if bind_to_reject.status != BindEnum.PENDING:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST,
            detail="Apenas solicitações pendentes podem ser rejeitadas.",
        )

    bind_to_reject.status = BindEnum.REJECTED

    if user.user_type == UserType.DOCTOR:
        user_type = "médico"
        user_to_alert = bind_to_reject.patient_id
    else:
        user_type = "paciente"
        user_to_alert = bind_to_reject.doctor_id

    notification_service.create_notification(
        session=session,
        user_id=user_to_alert,
        message=f"O {user_type} {user.name} rejeitou sua solicitação de vínculo.",
        type=NotificationType.BIND_REJECTED,
        bind_id=bind_to_reject.id,
    )

    session.add(bind_to_reject)
    session.commit()
    session.refresh(bind_to_reject)

    return bind_to_reject


def unbind_users(user: User, session: Session, bind_id: int):
    bind_to_reverse = session.query(Bind).filter_by(id=bind_id).first()

    if not bind_to_reverse:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail="Vínculo não encontrado."
        )

    if bind_to_reverse.patient_id != user.id and bind_to_reverse.doctor_id != user.id:
        raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Ação não permitida.")

    if bind_to_reverse.status != BindEnum.ACTIVE:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST, detail="Apenas vínculos ativos podem ser desfeitos."
        )

    bind_to_reverse.status = BindEnum.REVERSED

    if user.user_type == UserType.DOCTOR:
        user_type = "médico"
        user_to_alert = bind_to_reverse.patient_id
    else:
        user_type = "paciente"
        user_to_alert = bind_to_reverse.doctor_id

    notification_service.create_notification(
        session=session,
        user_id=user_to_alert,
        message=f"O {user_type} {user.name} desfez o vinculo ativo.",
        type=NotificationType.BIND_REVERSED,
        bind_id=bind_to_reverse.id,
    )
    session.add(bind_to_reverse)
    session.commit()
    
    doctor_management_service.log_activity(bind_to_reverse.doctor_id, ActivityType.PATIENT_UNBOUND, "Médico foi desvinculado do paciente " + bind_to_reverse.patient_id, session)
