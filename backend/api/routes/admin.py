from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.services import file_service
from core.models.doctor_utils import DoctorDocument
from core.services import doctor_management_service
from core.enums.doctor_enum import DoctorStatus
from core.enums.user_enum import UserType
from core.security.security import anonymizeCPF, get_admin_user, get_current_user
from infra.db.connection import get_session
from core.models import User, Doctor, Patient 
from core.services import user_management_service
from api.schemas.users import (
    DoctorListResponse,
    GetDoctorsSchema,
    UserListResponse,
    UserFilterSchema,
    UpdateUserSchema,
    ChangeUserStatusSchema,
    PatientSchema, 
    UserResponse 
)
from http import HTTPStatus 

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard")
async def get_dashboard_stats(
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_admin_user())
):
    # Retornar estatísticas do dashboard
    total_users = session.query(User).filter(User.user_type != UserType.ADMIN).count()
    total_doctors = session.query(Doctor).count()
    total_patients = session.query(Patient).count()
    pending_doctors = session.query(Doctor).filter(
        Doctor.status == DoctorStatus.PENDING
    ).count()

    return {
        "total_users": total_users,
        "total_doctors": total_doctors,
        "total_patients": total_patients,
        "pending_doctors": pending_doctors
    }
    
@router.get("/users", response_model=list)
async def list_users(
    filters: UserFilterSchema = Depends(),
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_admin_user())
):
    """Lista todos os usuários com filtros e paginação."""
    users, total = user_management_service.get_all_users(filters, session)

    # Mapear para response
    users_response = [
        UserListResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            cpf=anonymizeCPF(user.cpf),
            user_type=user.user_type,
            is_active=user.is_active,
            created_at=user.created_at.isoformat(),
            location=f"{user.address.city}, {user.address.state}" if user.address else "Não definido"
        )
        for user in users
    ]

    return users_response

@router.get("/users/{user_id}", response_model=User) 
async def get_user_detail(
    user_id: int,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_admin_user())
):
    """Retorna detalhes completos de um usuário."""
    user = user_management_service.get_user_by_id(user_id, session)
    
    user.cpf = anonymizeCPF(user.cpf, False)
    
    return user

@router.post("/users", status_code=HTTPStatus.CREATED)
async def create_user(
    user_data: PatientSchema, # Assumindo criação de Paciente
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_admin_user())
):
    """Admin cria novo usuário."""
    return user_management_service.create_user_by_admin(user_data, session)

@router.put("/users/{user_id}", response_model=User)
async def update_user_by_admin(
    user_id: int,
    update_data: UpdateUserSchema,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_admin_user())
):
    """Admin edita dados do usuário."""
    return user_management_service.update_user(user_id, update_data, session)

@router.patch("/users/{user_id}/status", response_model=User)
async def change_status(
    user_id: int,
    status_data: ChangeUserStatusSchema,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_admin_user())
):
    """Ativa ou desativa usuário."""
    return user_management_service.change_user_status(user_id, status_data, session)

@router.get("/doctors", response_model=list[DoctorListResponse])
async def list_doctors(
    parameters: GetDoctorsSchema = Depends(),
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_admin_user())
):
    doctors = doctor_management_service.get_doctors(session, parameters)

    return doctors

@router.get("/doctors/pending", response_model=list[DoctorListResponse])
async def list_pending_doctors(
        session: Session = Depends(get_session),
):
    doctors = doctor_management_service.get_pending_doctors(session)
    return doctors

@router.get("/doctors/{doctor_id}", response_model=Doctor)
async def search_doctor(
        doctor_id: int,
        session: Session = Depends(get_session),
):
    doctors = doctor_management_service.get_doctor_by_id(doctor_id, session)
    return doctors

@router.get("/doctors/{doctor_id}/documents/{file_id}")
async def search_doctor_documents(
        doctor_id: int,
        file_id: int,
        session: Session = Depends(get_session),
):
    document = file_service.get_doctor_document(doctor_id, file_id, session)
    return document

@router.get("/doctors/{doctor_id}/documents-info", response_model=list[DoctorDocument])
async def search_doctor_documents_info(
        doctor_id: int,
        session: Session = Depends(get_session),
):
    documents = file_service.get_doctor_documents_info(doctor_id, session)
    return documents

@router.post("/doctors/{doctor_id}/approve", response_model=Doctor)
async def approve_doctor(
        doctor_id: int,
        session: Session = Depends(get_session),
        current_admin: User = Depends(get_current_user)
):
    doctor = doctor_management_service.approve_doctor(doctor_id, session, current_admin)
    return doctor

@router.post("/doctors/{doctor_id}/reject", response_model=Doctor)
async def reject_doctor(
        doctor_id: int,
        reason: str,
        session: Session = Depends(get_session),
        current_admin: User = Depends(get_current_user)
):
    doctor = doctor_management_service.reject_doctor(doctor_id, session, current_admin, reason)
    return doctor


@router.patch("/doctors/{doctor_id}/status", response_model=Doctor)
async def change_doctor_status(
    doctor_id: int,
    new_status: DoctorStatus,
    reason: str,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_user)
    
):
    
    return doctor_management_service.change_doctor_status(doctor_id, session, current_admin, new_status, reason)

