from http import HTTPStatus
from typing import Literal
from fastapi import HTTPException
from api.schemas.users import DoctorSchema
from sqlalchemy.orm import Session

from core.security.security import get_password_hash
from core.models import Doctor, User, Bind

from ..enums import UserType, BindEnum
from . import user_service


def create_doctor(doctor: DoctorSchema, session: Session):
    
    if user_service.get_user_by_email(doctor.email, session) is not None:
        raise HTTPException(HTTPStatus.CONFLICT, detail="Usuário já existente")

    db_doctor = Doctor(
        name=doctor.name,
        cpf=doctor.cpf,
        email=doctor.email,
        user_type=UserType.DOCTOR,
        crm=doctor.crm,
        expertise_area=doctor.expertise_area,
        status_approval=True,
        hashed_password=get_password_hash(doctor.password),
        
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