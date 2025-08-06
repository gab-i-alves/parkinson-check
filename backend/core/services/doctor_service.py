from http import HTTPStatus
from fastapi import Depends, HTTPException
from api.schemas.users import DoctorSchema
from sqlalchemy.orm import Session

from infra.db.connection import get_session
from core.security.security import get_password_hash
from core.models.users import Doctor, User

from ..enums.user_enum import UserType
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

def bind_patient(doctor_id: int, user: User, session: Session):
    ...