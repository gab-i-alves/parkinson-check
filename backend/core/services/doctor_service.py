from http import HTTPStatus
from typing import Literal
from fastapi import HTTPException
from api.schemas.users import DoctorSchema
from sqlalchemy.orm import Session

from core.security.security import get_password_hash
from core.models import Doctor, User, Bind

from ..enums import UserType, BindEnum
from . import user_service, address_service


def create_doctor(doctor: DoctorSchema, session: Session):
    
    if user_service.get_user_by_email(doctor.email, session) is not None:
        raise HTTPException(HTTPStatus.CONFLICT, detail="Usuário já existente")

    address = address_service.get_similar_address(doctor.cep, doctor.number, doctor.complement, session)

    if address is None:
        address_service.create_address(doctor.cep, doctor.street, doctor.number, doctor.complement, doctor.neighborhood, doctor.city, doctor.state, session)
        address = address_service.get_similar_address(doctor.cep, doctor.number, doctor.complement, session)

    db_doctor = Doctor(
        name=doctor.fullName, # NÃO ALTERAR
        cpf=doctor.cpf,
        email=doctor.email,
        birthdate=doctor.birthDate,  # NÃO ALTERAR
        user_type=UserType.DOCTOR,
        crm=doctor.crm,
        expertise_area=doctor.specialty,  # NÃO ALTERAR
        status_approval=True,
        hashed_password=get_password_hash(doctor.password),
        address_id=address.id  # NÃO ALTERAR
    )
    
    session.add(db_doctor)
    session.commit()
    session.refresh(db_doctor)
    return doctor

def get_pending_binding_requests(user: User, session: Session) -> list[Bind] | None:
    bindings = session.query(Bind).filter(Bind.doctor_id == user.id).all()
    
    if not bindings:
        bindings = None
    
    return bindings

def activate_or_reject_binding_request(
    user: User, binding_id: int, session: Session, new_status: Literal[BindEnum.ACTIVE, BindEnum.REJECTED]
    ) -> Bind:
    bind_to_reject = session.query(Bind).filter_by(id=binding_id, doctor_id=user.id).first()  
    
    if not bind_to_reject:
        return HTTPException(HTTPStatus.NOT_FOUND, detail = "Solicitação não encontrada")
      
    bind_to_reject.status = new_status
    
    session.add(bind_to_reject)
    session.commit()
    session.refresh(bind_to_reject)
    
    return bind_to_reject