from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from core.services import file_service, email_service
from core.services import doctor_management_service
from core.enums.doctor_enum import DoctorStatus
from core.enums.user_enum import UserType
from core.security.security import get_admin_user, get_current_user
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
    ChangeDoctorStatusSchema,
    DoctorDocumentResponse,
    PatientSchema,
    UserResponse,
    CreateUserByAdminSchema,
    UpdateDoctorDetailsSchema
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
            cpf=user.cpf,
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

    return user

@router.post("/users", status_code=HTTPStatus.CREATED)
async def create_user(
    user_data: CreateUserByAdminSchema,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_admin_user())
):
    """
    Admin cria novo usuário (Paciente, Médico ou Administrador).

    O tipo de usuário é determinado pelo campo user_type.
    Campos específicos (como CRM para médicos) são validados automaticamente.
    """
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
    """Ativa ou desativa usuário e registra em auditoria."""
    return user_management_service.change_user_status(user_id, status_data, current_admin, session)

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

@router.get("/doctors/{doctor_id}")
async def search_doctor(
        doctor_id: int,
        session: Session = Depends(get_session),
):
    doctor = doctor_management_service.get_doctor_by_id(doctor_id, session)

    return {
        "id": doctor.id,
        "name": doctor.name,
        "email": doctor.email,
        "crm": doctor.crm,
        "specialty": doctor.expertise_area,
        "location": f"{doctor.address.city}, {doctor.address.state}" if doctor.address else "Não informado",
        "status": doctor.status.value,
        "cpf": doctor.cpf,
        "reason": doctor.rejection_reason,
        "approved_by": None,
        "approval_date": doctor.approval_date.isoformat() if doctor.approval_date else None
    }

@router.get("/doctors/{doctor_id}/documents/{file_id}")
async def search_doctor_documents(
        doctor_id: int,
        file_id: int,
        session: Session = Depends(get_session),
):
    document = file_service.get_doctor_document(doctor_id, file_id, session)
    return document

@router.get("/doctors/{doctor_id}/documents-info", response_model=list[DoctorDocumentResponse])
async def search_doctor_documents_info(
        doctor_id: int,
        session: Session = Depends(get_session),
):
    documents = file_service.get_doctor_documents_info(doctor_id, session)
    return documents

@router.post("/doctors/{doctor_id}/approve", response_model=Doctor)
async def approve_doctor(
        doctor_id: int,
        background_tasks: BackgroundTasks,
        session: Session = Depends(get_session),
        current_admin: User = Depends(get_current_user)
):
    doctor = doctor_management_service.approve_doctor(doctor_id, session, current_admin)

    # Enviar email de aprovação
    await email_service.send_doctor_approval_email_background(
        background_tasks,
        doctor.email,
        doctor.name
    )

    return doctor

@router.post("/doctors/{doctor_id}/reject", response_model=Doctor)
async def reject_doctor(
        doctor_id: int,
        reason: str,
        background_tasks: BackgroundTasks,
        session: Session = Depends(get_session),
        current_admin: User = Depends(get_current_user)
):
    doctor = doctor_management_service.reject_doctor(doctor_id, session, reason, current_admin)

    # Enviar email de rejeição
    await email_service.send_doctor_rejection_email_background(
        background_tasks,
        doctor.email,
        doctor.name,
        reason
    )

    return doctor


@router.patch("/doctors/{doctor_id}/status", response_model=Doctor)
async def change_doctor_status(
    doctor_id: int,
    status_data: ChangeDoctorStatusSchema,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_user)
):
    doctor = doctor_management_service.change_doctor_status(
        doctor_id,
        session,
        current_admin,
        status_data.status,
        status_data.reason or ""
    )

    # Enviar email de mudança de status
    await email_service.send_doctor_status_change_email_background(
        background_tasks,
        doctor.email,
        doctor.name,
        status_data.status.value,
        status_data.reason if status_data.reason else None
    )

    return doctor

@router.patch("/doctors/{doctor_id}/details")
async def update_doctor_details(
    doctor_id: int,
    details: UpdateDoctorDetailsSchema,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_user)
):
    """Admin atualiza detalhes completos do médico (dados pessoais, credenciais e endereço)."""
    from fastapi import HTTPException
    from core.models import Address

    doctor = session.get(Doctor, doctor_id)
    if not doctor:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="Médico não encontrado")

    # Atualizar dados básicos do médico
    if details.name is not None:
        doctor.name = details.name

    if details.email is not None:
        doctor.email = details.email

    if details.birthdate is not None:
        doctor.birthdate = details.birthdate

    if details.gender is not None:
        doctor.gender = details.gender

    # Atualizar credenciais médicas
    if details.expertise_area is not None:
        doctor.expertise_area = details.expertise_area

    if details.crm is not None:
        doctor.crm = details.crm

    # Atualizar endereço (se algum campo de endereço foi fornecido)
    address_fields = ['cep', 'street', 'number', 'complement', 'neighborhood', 'city', 'state']
    has_address_update = any(getattr(details, field) is not None for field in address_fields)

    if has_address_update:
        if not doctor.address:
            # Se o médico não tem endereço, criar um novo
            doctor.address = Address(
                cep=details.cep or '',
                street=details.street or '',
                number=details.number or '',
                complement=details.complement,
                neighborhood=details.neighborhood or '',
                city=details.city or '',
                state=details.state or ''
            )
            session.add(doctor.address)
        else:
            # Atualizar endereço existente
            if details.cep is not None:
                doctor.address.cep = details.cep
            if details.street is not None:
                doctor.address.street = details.street
            if details.number is not None:
                doctor.address.number = details.number
            if details.complement is not None:
                doctor.address.complement = details.complement
            if details.neighborhood is not None:
                doctor.address.neighborhood = details.neighborhood
            if details.city is not None:
                doctor.address.city = details.city
            if details.state is not None:
                doctor.address.state = details.state

    session.commit()
    session.refresh(doctor)
    return doctor

