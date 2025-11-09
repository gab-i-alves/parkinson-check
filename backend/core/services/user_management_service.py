from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException
from http import HTTPStatus
from typing import Optional, Tuple, List
from core.services.patient_service import create_patient
from core.security.security import get_password_hash
from core.services import address_service
from core.enums.user_enum import UserType
from core.models import User, Patient, Doctor # Adicionar Doctor
from api.schemas.users import UserFilterSchema, UpdateUserSchema, ChangeUserStatusSchema, PatientSchema
from core.services.user_service import get_user_by_email # Importar helper

def get_all_users(
    filters: UserFilterSchema, 
    session: Session
) -> Tuple[List[User], int]: # Alterado para User genérico
    """
    Lista todos os usuários (pacientes e médicos) com filtros.
    Retorna (lista_usuarios, total_count)
    """
    # Query base em User para pegar todos os tipos
    query = session.query(User).join(User.address) # Join com Address

    # Aplicar filtro de busca
    if filters.search:
        search_term = f"%{filters.search}%"
        query = query.filter(
            or_(
                User.name.ilike(search_term),
                User.email.ilike(search_term),
                User.cpf.like(search_term)
            )
        )

    # Aplicar filtro de status
    if filters.is_active is not None:
        query = query.filter(User.is_active == filters.is_active)
    
    # Aplicar filtro de tipo
    if filters.user_type is not None:
        query = query.filter(User.user_type == filters.user_type)
    else:
        query = query.filter(User.user_type != UserType.ADMIN)
        

    total_count = query.count()
    

    # Paginação
    users = query.limit(filters.limit).offset(filters.offset).all()

    return users, total_count

def get_user_by_id(user_id: int, session: Session) -> User:
    """Busca usuário por ID para edição."""
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="Usuário não encontrado")
    return user

def update_user(
    user_id: int, 
    update_data: UpdateUserSchema, 
    session: Session
) -> User:
    """
    Atualiza dados do usuário.
    Admin pode editar: nome, email (com validação de duplicidade)
    """
    user = get_user_by_id(user_id, session)

    # Validar email duplicado se estiver mudando
    if update_data.email and update_data.email != user.email:
        existing = get_user_by_email(update_data.email, session)
        if existing:
            raise HTTPException(
                HTTPStatus.CONFLICT,
                detail="Email já está em uso"
            )
        user.email = update_data.email

    if update_data.name:
        user.name = update_data.name

    session.commit()
    session.refresh(user)
    return user

def change_user_status(
    user_id: int, 
    status_data: ChangeUserStatusSchema, 
    session: Session
) -> User:
    """Ativa ou desativa usuário."""
    user = get_user_by_id(user_id, session)

    # TODO: Registrar motivo em tabela de auditoria (opcional)
    if not status_data.is_active and status_data.reason:
        # Log do motivo da desativação
        print(f"Desativando usuário {user_id} pelo motivo: {status_data.reason}")
        pass

    user.is_active = status_data.is_active
    session.commit()
    session.refresh(user)
    return user

def create_user_by_admin(user_data: PatientSchema, session: Session)-> Patient:
    return create_patient(user_data, session, False)
