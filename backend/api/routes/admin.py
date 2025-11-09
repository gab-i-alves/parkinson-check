from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.enums.user_enum import UserType
from core.security.security import anonymizeCPF, get_admin_user
from infra.db.connection import get_session
from core.models import User, Doctor, Patient 
from core.services import user_management_service
from api.schemas.users import (
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
        Doctor.status_approval == False
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

@router.get("/users/{user_id}", response_model=UserResponse) # Usar response genérico
async def get_user_detail(
    user_id: int,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_admin_user())
):
    """Retorna detalhes completos de um usuário."""
    user = user_management_service.get_user_by_id(user_id, session)
    # Retornar response completo
    return user

@router.post("/users", status_code=HTTPStatus.CREATED)
async def create_user(
    user_data: PatientSchema, # Assumindo criação de Paciente
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_admin_user())
):
    """Admin cria novo usuário."""
    return user_management_service.create_user_by_admin(user_data, session)

@router.put("/users/{user_id}", response_model=UserResponse)
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