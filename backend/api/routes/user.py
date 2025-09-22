from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from infra.db.connection import get_session
from core.models import User
from core.security.security import get_current_user, get_patient_user, get_doctor_user
from api.schemas.users import UserResponse, DoctorListResponse, GetDoctorsSchema, PatientListResponse
from core.services import doctor_service, patient_service
from core.enums import BindEnum

router = APIRouter(prefix="/users", tags=["Users"])

CurrentPatient = Annotated[User, Depends(get_patient_user())]
CurrentDoctor = Annotated[User, Depends(get_doctor_user())]

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

@router.get("/doctors", response_model=list[DoctorListResponse])
def get_doctors(
    user: CurrentPatient,
    parameters: GetDoctorsSchema = Depends(),
    session: Session = Depends(get_session)
):
    doctors = doctor_service.get_doctors(session, parameters)
    return doctors



@router.get("/linked_doctors", response_model=list[DoctorListResponse] | None)
def get_binded_doctors(
   user: CurrentPatient, session: Session = Depends(get_session)
):
    """
    Endpoint para o paciente obter a lista de seus médicos vinculados (status ACTIVE).
    """
    doctors_with_binds = doctor_service.get_binded_doctors(session, user)
    return doctors_with_binds

@router.get("/linked_patients", response_model=list[PatientListResponse] | None)
def get_binded_patients(
    user: CurrentDoctor, session: Session = Depends(get_session)
):
    """
    Endpoint para o médico obter a lista de seus pacientes vinculados (status ACTIVE).
    """
    patients_with_binds = patient_service.get_binded_patients(user, session)
    return patients_with_binds

    