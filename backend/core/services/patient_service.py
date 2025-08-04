from http import HTTPStatus
from fastapi import HTTPException
from api.schemas.users import PatientSchema
from sqlalchemy.orm import Session
from core.security.security import get_password_hash
from core.models.users import Patient
from ..enums.user_enum import UserType
from . import user_service
from . import adress_service

def create_patient(patient: PatientSchema, session: Session):
    
    if user_service.get_user_by_email(patient.email) is not None:
        raise HTTPException(HTTPStatus.CONFLICT, detail="Usuário já existente")
    
    adress = adress_service.get_similar_adress(patient.cep, patient.number, patient.complement)

    if adress is None:
        adress_service.create_adress(patient.cep, patient.street, patient.number, patient.complement, patient.neighborhood, patient.city, patient.state, session)
        adress = adress_service.get_similar_adress(patient.cep, patient.number, patient.complement)



    db_patient = Patient(
        name=patient.fullName,
        cpf=patient.cpf,
        email=patient.email,
        hashed_password=get_password_hash(patient.password),
        birthdate=patient.birthDate,
        user_type=UserType.PATIENT,
        adress_id=adress.id
    )
    
    session.add(db_patient)
    session.commit()
    session.refresh(db_patient)
    return patient