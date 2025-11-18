from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException
from http import HTTPStatus
from typing import Optional, Tuple, List, Union
from core.services.patient_service import create_patient
from core.services.doctor_service import create_doctor
from core.security.security import get_password_hash
from core.services import address_service
from core.enums.user_enum import UserType
from core.enums.doctor_enum import DoctorStatus
from core.models import User, Patient, Doctor, UserStatusAudit, Admin
from api.schemas.users import (
    UserFilterSchema,
    UpdateUserSchema,
    ChangeUserStatusSchema,
    PatientSchema,
    DoctorSchema,
    AdminSchema,
    CreateUserByAdminSchema
)
from core.services.user_service import get_user_by_email, get_user_by_cpf

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
    Atualiza dados do usuário (nome, email, dados pessoais e endereço).

    Args:
        user_id: ID do usuário a ser atualizado
        update_data: Dados a serem atualizados (todos opcionais)
        session: Sessão do banco de dados

    Returns:
        Usuário atualizado
    """
    user = get_user_by_id(user_id, session)

    # Atualizar dados pessoais
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

    if update_data.birthdate:
        user.birthdate = update_data.birthdate

    if update_data.gender:
        user.gender = update_data.gender

    # Atualizar endereço se algum campo foi fornecido
    address_fields_provided = any([
        update_data.cep,
        update_data.street,
        update_data.number,
        update_data.neighborhood,
        update_data.city,
        update_data.state
    ])

    if address_fields_provided:
        # Obter endereço atual do usuário
        current_address = user.address

        # Usar dados fornecidos ou manter os atuais
        new_cep = update_data.cep if update_data.cep else current_address.cep
        new_street = update_data.street if update_data.street else current_address.street
        new_number = update_data.number if update_data.number else current_address.number
        new_complement = update_data.complement if update_data.complement is not None else current_address.complement
        new_neighborhood = update_data.neighborhood if update_data.neighborhood else current_address.neighborhood
        new_city = update_data.city if update_data.city else current_address.city
        new_state = update_data.state if update_data.state else current_address.state

        # Buscar endereço similar
        similar_address = address_service.get_similar_address(
            new_cep, new_number, new_complement, session
        )

        if similar_address:
            # Usar endereço existente
            user.address_id = similar_address.id
        else:
            # Criar novo endereço
            address_service.create_address(
                new_cep,
                new_street,
                new_number,
                new_complement,
                new_neighborhood,
                new_city,
                new_state,
                session,
            )
            new_address = address_service.get_similar_address(
                new_cep, new_number, new_complement, session
            )
            user.address_id = new_address.id  # type: ignore

    session.commit()
    session.refresh(user)
    return user

def change_user_status(
    user_id: int,
    status_data: ChangeUserStatusSchema,
    current_admin: User,
    session: Session
) -> User:
    """
    Ativa ou desativa usuário e registra a mudança em auditoria.

    Args:
        user_id: ID do usuário a ter status alterado
        status_data: Dados da mudança (novo status e motivo opcional)
        current_admin: Administrador que está fazendo a alteração
        session: Sessão do banco de dados

    Returns:
        Usuário atualizado
    """
    user = get_user_by_id(user_id, session)

    # Criar registro de auditoria
    audit_record = UserStatusAudit(
        user_id=user_id,
        changed_by_admin_id=current_admin.id,
        is_active=status_data.is_active,
        reason=status_data.reason if status_data.reason else None
    )

    session.add(audit_record)

    # Atualizar status do usuário
    user.is_active = status_data.is_active
    session.commit()
    session.refresh(user)

    return user

def create_user_by_admin(user_data: CreateUserByAdminSchema, session: Session) -> Union[Patient, Doctor, Admin]:
    """
    Cria usuário de qualquer tipo (Paciente, Médico ou Administrador) pelo admin.

    Args:
        user_data: Dados do usuário a ser criado
        session: Sessão do banco de dados

    Returns:
        Usuário criado (Patient, Doctor ou Admin)

    Raises:
        HTTPException: Se email ou CPF já existir
    """
    # Validações comuns
    if get_user_by_email(user_data.email, session):
        raise HTTPException(
            HTTPStatus.CONFLICT,
            detail="Já existe um usuário com o email informado."
        )

    if get_user_by_cpf(user_data.cpf, session):
        raise HTTPException(
            HTTPStatus.CONFLICT,
            detail="O CPF informado já está em uso."
        )

    # Criar usuário conforme o tipo
    if user_data.user_type == UserType.PATIENT:
        # Converter para PatientSchema
        patient_data = PatientSchema(
            fullname=user_data.name,
            email=user_data.email,
            cpf=user_data.cpf,
            password=user_data.password,
            birthdate=user_data.birthdate,
            gender=user_data.gender,
            cep=user_data.cep,
            street=user_data.street,
            number=user_data.number,
            complement=user_data.complement,
            neighborhood=user_data.neighborhood,
            city=user_data.city,
            state=user_data.state
        )
        return create_patient(patient_data, session, requires_admin_approval=False)

    elif user_data.user_type == UserType.DOCTOR:
        # Converter para DoctorSchema
        doctor_data = DoctorSchema(
            fullname=user_data.name,
            email=user_data.email,
            cpf=user_data.cpf,
            password=user_data.password,
            birthdate=user_data.birthdate,
            gender=user_data.gender,
            cep=user_data.cep,
            street=user_data.street,
            number=user_data.number,
            complement=user_data.complement,
            neighborhood=user_data.neighborhood,
            city=user_data.city,
            state=user_data.state,
            crm=user_data.crm,  # type: ignore
            specialty=user_data.expertise_area  # type: ignore
        )
        # Admin cria médico já aprovado
        doctor = create_doctor(doctor_data, session)
        # Aprovar automaticamente se criado por admin
        doctor.status = DoctorStatus.APPROVED
        session.commit()
        session.refresh(doctor)
        return doctor

    elif user_data.user_type == UserType.ADMIN:
        # Buscar ou criar endereço
        address = address_service.get_similar_address(
            user_data.cep, user_data.number, user_data.complement, session
        )

        if address is None:
            address_service.create_address(
                user_data.cep,
                user_data.street,
                user_data.number,
                user_data.complement,
                user_data.neighborhood,
                user_data.city,
                user_data.state,
                session,
            )
            address = address_service.get_similar_address(
                user_data.cep, user_data.number, user_data.complement, session
            )

        # Criar admin
        db_admin = Admin(
            name=user_data.name,
            cpf=user_data.cpf,
            email=user_data.email,
            birthdate=user_data.birthdate,
            user_type=UserType.ADMIN,
            hashed_password=get_password_hash(user_data.password),
            address_id=address.id,  # type: ignore
            gender=user_data.gender,
            is_superuser=user_data.is_superuser if user_data.is_superuser else False
        )

        session.add(db_admin)
        session.commit()
        session.refresh(db_admin)
        return db_admin

    else:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST,
            detail=f"Tipo de usuário inválido: {user_data.user_type}"
        )
