from http import HTTPStatus
from fastapi import HTTPException
from api.schemas.users import PatientSchema
from sqlalchemy.orm import Session
from core.security.security import get_password_hash
from core.models.users import Patient
from ..enums.user_enum import UserType
from . import user_service

def create_patient(patient: PatientSchema, session: Session):
    
    if user_service.get_user_by_email(patient.email) is not None:
        raise HTTPException(HTTPStatus.CONFLICT, detail="Usuário já existente")
    
    db_patient = Patient(
        name=patient.fullName,
        cpf=patient.cpf,
        email=patient.email,
        hashed_password=get_password_hash(patient.password),
        birthdate=patient.birthDate,
        user_type=UserType.PATIENT,
        cep=patient.cep,
        street=patient.street,
        number=patient.number,
        complement=patient.complement,
        neighborhood=patient.neighborhood,
        city=patient.city,
        state=patient.state
    )
    
    session.add(db_patient)
    session.commit()
    session.refresh(db_patient)
    return patient