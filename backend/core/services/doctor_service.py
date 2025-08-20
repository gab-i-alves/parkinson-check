from http import HTTPStatus
from typing import Literal, Optional, List, Tuple
from fastapi import HTTPException
from api.schemas.users import DoctorSchema
from sqlalchemy.orm import Session, joinedload

from core.security.security import get_password_hash
from core.models import Doctor, User, Bind, Patient

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

# USAR APENAS PARA MEDICOS
def get_pending_binding_requests(user: User, session: Session) -> list[tuple[Bind, Patient]] | None:
    bindings_with_patients = session.query(Bind, Patient).filter(
        Bind.doctor_id == user.id, 
        Bind.status == BindEnum.PENDING
    ).join(Patient, Bind.patient_id == Patient.id).all()

    return bindings_with_patients

# USAR APENAS PARA PACIENTES
def get_sent_binding_requests(user: User, session: Session) -> list[tuple[Bind, Doctor]] | None:
    bindings_with_doctors = session.query(Bind, Doctor).filter(Bind.patient_id == user.id, Bind.status == BindEnum.PENDING).join(Doctor, Bind.doctor_id == Doctor.id).all()
    
    return bindings_with_doctors

def get_doctors(session: Session, current_user: User, name: Optional[str] = None, cpf: Optional[str] = None, email: Optional[str] = None, crm: Optional[str] = None, expertise_area: Optional[str] = None) -> list:
    
    doctor_query = session.query(Doctor).options(joinedload(Doctor.address))

    if name:
        doctor_query = doctor_query.filter(Doctor.name.ilike(f'%{name}%'))
    if cpf:
        doctor_query = doctor_query.filter(Doctor.cpf == cpf)
    if email:
        doctor_query = doctor_query.filter(Doctor.email == email)
    if crm:
        doctor_query = doctor_query.filter(Doctor.crm == crm)
    if expertise_area:
        doctor_query = doctor_query.filter(Doctor.expertise_area.ilike(f'%{expertise_area}%'))

    doctors = doctor_query.all()
    
    if not doctors:
        return []

    doctor_ids = [d.id for d in doctors]

    binds = session.query(Bind).filter(
        Bind.doctor_id.in_(doctor_ids),
        Bind.patient_id == current_user.id
    ).order_by(Bind.id.desc()).all()

    bind_map = {}
    for bind in binds:
        if bind.doctor_id not in bind_map:
            bind_map[bind.doctor_id] = bind

    result = []
    for doctor in doctors:
        bind_status = bind_map.get(doctor.id)
        result.append((doctor, bind_status))

    return result

def get_linked_doctors(session: Session, current_user: User) -> List[Tuple[Doctor, Bind]]:
    """
    Busca os médicos e os seus vínculos ATIVOS para um determinado paciente.
    Retorna uma lista de tuplas (Doctor, Bind).
    """
    linked_doctors_with_binds = session.query(Doctor, Bind).filter(
        Bind.patient_id == current_user.id,
        Bind.status == BindEnum.ACTIVE
    ).join(Doctor, Bind.doctor_id == Doctor.id).all() 
    
    return linked_doctors_with_binds

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