from http import HTTPStatus
from typing import Literal

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from api.schemas.users import DoctorListResponse, DoctorSchema, GetDoctorsSchema
from core.models import Bind, Doctor, Patient, User
from core.security.security import get_password_hash

from ..enums import BindEnum, UserType, NotificationType
from . import address_service, user_service, notification_service
from .user_service import get_binded_users


def create_doctor(doctor: DoctorSchema, session: Session):
    if user_service.get_user_by_email(doctor.email, session) is not None:
        raise HTTPException(
            HTTPStatus.CONFLICT, detail="Já existe um usuário com o email informado."
        )

    if user_service.get_user_by_cpf(doctor.cpf, session) is not None:
        raise HTTPException(HTTPStatus.CONFLICT, detail="O CPF informado já está em uso.")

    if get_doctor_by_crm(session, crm=doctor.crm) is not None:
        raise HTTPException(HTTPStatus.CONFLICT, detail="O CRM informado já está em uso.")

    address = address_service.get_similar_address(
        doctor.cep, doctor.number, doctor.complement, session
    )

    if address is None:
        address_service.create_address(
            doctor.cep,
            doctor.street,
            doctor.number,
            doctor.complement,
            doctor.neighborhood,
            doctor.city,
            doctor.state,
            session,
        )
        address = address_service.get_similar_address(
            doctor.cep, doctor.number, doctor.complement, session
        )

    db_doctor = Doctor(
        name=doctor.fullname,
        cpf=doctor.cpf,
        email=doctor.email,
        birthdate=doctor.birthdate,
        user_type=UserType.DOCTOR,
        crm=doctor.crm,
        expertise_area=doctor.specialty,  # NÃO ALTERAR
        status_approval=True,
        hashed_password=get_password_hash(doctor.password),
        address_id=address.id,  # NÃO ALTERAR
    )

    session.add(db_doctor)
    session.commit()
    session.refresh(db_doctor)
    return doctor

def get_doctor_by_crm(session: Session, crm: str) -> Doctor:
    doctor = session.query(Doctor).filter(Doctor.crm == crm).first()

    return doctor


def get_doctors(session: Session, doctor: GetDoctorsSchema) -> list[DoctorListResponse]:
    doctor_query = session.query(Doctor).options(joinedload(Doctor.address))
    filters = doctor.model_dump(exclude_none=True)
    doctor_query = doctor_query.filter_by(**filters)

    doctors = doctor_query.all()

    if not doctors:
        raise HTTPException(
            HTTPStatus.NOT_FOUND,
            detail="Não foram encontrados médicos com os parametros fornecidos",
        )

    doctor_list = []

    for doc in doctors:
        doctor_list.append(
            DoctorListResponse(
                id=doc.id,
                name=doc.name,
                email=doc.email,
                crm="CRM-" + doc.crm,
                specialty=doc.expertise_area,
                location=f"{doc.address.city}, {doc.address.state}",
                role=UserType.DOCTOR,
            )
        )

    return doctor_list


def get_binded_doctors(session: Session, current_user: User) -> list[DoctorListResponse]:
    """
    Com base em um usuário retorna os médicos vinculados a ele.
    Formato de lista (DoctorListResponse)
    """
    binded_doctors = get_binded_users(current_user, session)

    doctor_list = []

    for item in binded_doctors:
        doc = item["user"]
        bind_id = item["bind_id"]
        doctor_list.append(
            DoctorListResponse(
                id=doc.id,
                name=doc.name,
                email=doc.email,
                crm="CRM-" + doc.crm,
                specialty=doc.expertise_area,
                location=f"{doc.address.city}, {doc.address.state}",
                role=UserType.DOCTOR,
                bind_id=bind_id,
            )
        )
    return doctor_list