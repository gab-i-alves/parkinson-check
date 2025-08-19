from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from infra.db.connection import get_session
from core.models import User
from core.security.security import get_current_user
from api.schemas.token import UserResponse, DoctorResponse
from core.services import doctor_service
from core.enums import UserType, BindEnum


router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_user_me(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.user_type
    )

@router.get("/doctors", response_model=list[DoctorResponse])
def get_doctors(
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user),
    name: str | None = None, 
    cpf: str | None = None, 
    email: str | None = None, 
    crm: str | None = None, 
    specialty: str | None = None
):

    doctors = doctor_service.get_doctors(session, current_user, name, cpf, email, crm, specialty)

    return [format_doctors(doctor) for doctor in doctors]

@router.get("/linked_doctors", response_model=list[DoctorResponse])
def get_linked_doctors(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):

    doctors = doctor_service.get_linked_doctors(session, current_user)

    return [format_doctors(doctor) for doctor in doctors]
    

def format_doctors(doctor_bind_tuple):
    doctor_obj = doctor_bind_tuple[0]
    bind_obj = doctor_bind_tuple[1]

    location = doctor_obj.address
    
    status_str = "unlinked"
    if bind_obj is not None:
        if bind_obj.status == BindEnum.PENDING:
            status_str = "pending"
        elif bind_obj.status == BindEnum.ACTIVE:
            status_str = "linked"

    return DoctorResponse(
        id=doctor_obj.id,
        name=doctor_obj.name,
        email=doctor_obj.email,
        crm="CRM-" + doctor_obj.crm,
        specialty=doctor_obj.expertise_area,
        location=f"{location.city}, {location.state}",
        role=UserType.DOCTOR,
        status=status_str
    )

    