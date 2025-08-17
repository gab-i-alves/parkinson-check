from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from infra.db.connection import get_session
from core.models import User, Doctor
from core.security.security import get_current_user
from api.schemas.token import UserResponse, DoctorResponse
from core.services import doctor_service, address_service
from core.enums.user_enum import UserType
from core.enums.link_enum import LinkEnum

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
def get_doctors(session: Session = Depends(get_session), name: str | None = None, cpf: str | None = None, email: str | None = None, crm: str | None = None, specialty: str | None = None):

    doctors = doctor_service.get_doctors(session, name, cpf, email, crm, specialty)

    return [format_doctors(doctor) for doctor in doctors]
    

def format_doctors(doctor):
    location = doctor.address

    return DoctorResponse(
        id=doctor.id,
        name=doctor.name,
        email=doctor.email,
        crm="CRM-" + doctor.crm,
        specialty=doctor.expertise_area,
        location=location.city + ", " + location.state,
        role=UserType.DOCTOR,
        status=LinkEnum.UNLINKED
    )
    