from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.schemas.users import (
    DoctorListResponse,
    GetDoctorsSchema,
    GetPatientsSchema,
    PatientDashboardResponse,
    PatientFullProfileResponse,
    PatientListResponse,
    UserResponse,
)
from core.models import User
from core.security.security import get_current_user, get_doctor_user, get_patient_user
from core.services import doctor_service, patient_service
from infra.db.connection import get_session

router = APIRouter(prefix="/users", tags=["Users"])

CurrentPatient = Annotated[User, Depends(get_patient_user())]
CurrentDoctor = Annotated[User, Depends(get_doctor_user())]


@router.get("/me", response_model=UserResponse)
def get_user_me(
    current_user: User = Depends(get_current_user), session: Session = Depends(get_session)
):
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.user_type,
    )


@router.get("/doctors", response_model=list[DoctorListResponse])
def get_doctors(
    user: CurrentPatient,
    parameters: GetDoctorsSchema = Depends(),
    session: Session = Depends(get_session),
):
    doctors = doctor_service.get_doctors(session, parameters)
    return doctors


@router.get("/patients", response_model=list[PatientListResponse])
def get_patients(
    user: CurrentDoctor,
    parameters: GetPatientsSchema = Depends(),
    session: Session = Depends(get_session),
):
    """
    Endpoint para o médico buscar pacientes disponíveis no sistema.
    Retorna todos os pacientes exceto os já vinculados ao médico atual.
    """
    patients = patient_service.get_patients(session, user, parameters)
    return patients


@router.get("/linked_doctors", response_model=list[DoctorListResponse] | None)
def get_binded_doctors(user: CurrentPatient, session: Session = Depends(get_session)):
    """
    Endpoint para o paciente obter a lista de seus médicos vinculados (status ACTIVE).
    """
    doctors_with_binds = doctor_service.get_binded_doctors(session, user)
    return doctors_with_binds


@router.get("/linked_patients", response_model=list[PatientListResponse] | None)
def get_binded_patients(user: CurrentDoctor, session: Session = Depends(get_session)):
    """
    Endpoint para o médico obter a lista de seus pacientes vinculados (status ACTIVE).
    """
    patients_with_binds = patient_service.get_binded_patients(session, user)
    return patients_with_binds


@router.get("/linked_patients/dashboard", response_model=list[PatientDashboardResponse])
def get_patients_dashboard(user: CurrentDoctor, session: Session = Depends(get_session)):
    """
    Endpoint para o médico obter dados completos dos pacientes vinculados para o dashboard.
    Inclui idade, status calculado, informações de testes, etc.
    """
    dashboard_data = patient_service.get_patients_dashboard_data(session, user)
    return dashboard_data


@router.get("/patient/{patient_id}/profile", response_model=PatientFullProfileResponse)
def get_patient_full_profile(
    user: CurrentDoctor, patient_id: int, session: Session = Depends(get_session)
):
    """
    Endpoint para o médico obter perfil completo de um paciente vinculado.
    Inclui dados pessoais, endereço, idade, status, etc.
    """
    return patient_service.get_patient_full_profile(session, user, patient_id)
