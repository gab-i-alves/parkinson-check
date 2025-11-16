from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from fastapi import Depends, HTTPException
from http import HTTPStatus
from backend.core.models.doctor_utils import DoctorActivityLog
from core.security.security import get_current_user
from core.enums.doctor_enum import ActivityType, DoctorStatus

from api.schemas.users import DoctorListResponse, GetDoctorsSchema
from core.models import  Doctor, User
from ..enums import UserType

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
                crm=doc.crm,
                specialty=doc.expertise_area,
                location=f"{doc.address.city}, {doc.address.state}",
                role=UserType.DOCTOR,
                gender=doc.gender,
                status=doc.status,
                reason=doc.rejection_reason,
                approved_by_admin=doc.approved_by_admin_id,
                approval_date=doc.approval_date,
            )
        )

    return doctor_list

def get_pending_doctors(session: Session) -> list[DoctorListResponse]:
    doctor_query = session.query(Doctor).options(joinedload(Doctor.address))
    doctor_query = doctor_query.filter_by(Doctor.status == DoctorStatus.PENDING)

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
                crm=doc.crm,
                specialty=doc.expertise_area,
                location=f"{doc.address.city}, {doc.address.state}",
                role=UserType.DOCTOR,
                gender=doc.gender,
                status=doc.status,
            )
        )

    return doctor_list

def approve_doctor(doctor_id: int, session: Session, current_admin: User = Depends(get_current_user)) -> Doctor:
    doctor = session.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="Médico não encontrado")
    
    if doctor.status == DoctorStatus.APPROVED:
        raise HTTPException(HTTPStatus.CONFLICT, detail="O médico já foi aprovado")
        
    doctor.status = DoctorStatus.APPROVED
    doctor.approved_by_admin_id = current_admin.id
    doctor.approval_date = datetime.now()
    
    return doctor

def reject_doctor(doctor_id: int, session: Session, reason: str, current_admin: User = Depends(get_current_user)) -> Doctor:
    doctor = session.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="Médico não encontrado")
    
    if doctor.status == DoctorStatus.REJECTED:
        raise HTTPException(HTTPStatus.CONFLICT, detail="O médico já foi rejeitado, motivo:" + doctor.rejection_reason)
        
    doctor.status = DoctorStatus.REJECTED
    doctor.rejection_reason = reason
    doctor.approved_by_admin_id = current_admin.id
    doctor.approval_date = datetime.now()
    
    return doctor

def change_doctor_status(doctor_id: int, session: Session, new_status: DoctorStatus, reason: str, current_admin: User = Depends(get_current_user)) -> Doctor:
    doctor = session.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="Médico não encontrado")
    
        
    doctor.status = new_status
    doctor.rejection_reason = reason
    doctor.approved_by_admin_id = current_admin.id
    doctor.approval_date = datetime.now()
    
    return doctor