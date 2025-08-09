from http import HTTPStatus
from fastapi import HTTPException
from api.schemas.users import PatientSchema
from sqlalchemy.orm import Session
from core.security.security import get_password_hash
from core.models.users import Patient
from ..enums import UserType, BindEnum
from core.services import user_service, address_service
from core.models import User, Bind

def create_patient(patient: PatientSchema, session: Session):
    
    if user_service.get_user_by_email(patient.email, session) is not None:
        raise HTTPException(HTTPStatus.CONFLICT, detail="Já existe um usuário com o email informado.")
    
    if user_service.get_user_by_cpf(patient.cpf, session) is not None:
        raise HTTPException(HTTPStatus.CONFLICT, detail="O CPF informado já está em uso.")
        
    
    address = address_service.get_similar_address(patient.cep, patient.number, patient.complement, session)

    if address is None:
        address_service.create_address(patient.cep, patient.street, patient.number, patient.complement, patient.neighborhood, patient.city, patient.state, session)
        address = address_service.get_similar_address(patient.cep, patient.number, patient.complement, session)



    db_patient = Patient(
        name=patient.fullName,
        cpf=patient.cpf,
        email=patient.email,
        hashed_password=get_password_hash(patient.password),
        birthdate=patient.birthDate,
        user_type=UserType.PATIENT,
        address_id=address.id
    )
    
    session.add(db_patient)
    session.commit()
    session.refresh(db_patient)
    return patient

def create_bind_request(doctor_id: int, user: User, session: Session):  
    db_bind = Bind(
        doctor_id=doctor_id,
        patient=user.id,
        status=BindEnum.PENDING
    )
    
    session.add(db_bind)
    session.commit()
    session.refresh()
    return db_bind