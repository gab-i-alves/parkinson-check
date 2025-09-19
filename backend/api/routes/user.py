from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from infra.db.connection import get_session
from core.models import User
from core.security.security import get_current_user, get_patient_user
from api.schemas.users import UserResponse, DoctorResponse, GetDoctorsSchema
from core.services import doctor_service
from core.enums import BindEnum

router = APIRouter(prefix="/users", tags=["Users"])

CurrentPatient = Annotated[User, Depends(get_patient_user())]

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
    user: CurrentPatient,
    parameters: GetDoctorsSchema = Depends(),
    session: Session = Depends(get_session)
):
    doctors = doctor_service.get_doctors(session, user, parameters)
    return doctors


@router.get("/linked_doctors", response_model=list[DoctorResponse] | None)
def get_binded_doctors(
   user: CurrentPatient, session: Session = Depends(get_session)
):
    """
    Endpoint para o paciente obter a lista de seus médicos vinculados (status ACTIVE).
    """
    doctors_with_binds = doctor_service.get_binded_doctors(session, user)
    
    return doctors_with_binds

    