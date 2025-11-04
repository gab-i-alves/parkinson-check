from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from core.enums import UserType


class UserSchema(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,  # Permite o alias
    )

    fullname: str = Field(..., alias="name")
    birthdate: date = Field(..., alias="birthdate")  # NÃO RETIRAR DAQUI
    cpf: str
    email: EmailStr
    password: str

    cep: str
    street: str
    number: str
    complement: str | None = None
    neighborhood: str
    city: str
    state: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserType


class DoctorSchema(UserSchema):
    crm: str
    specialty: str = Field(..., alias="expertise_area")


class GetDoctorsSchema(BaseModel):
    name: Optional[str] = None
    cpf: Optional[str] = None
    email: Optional[str] = None
    crm: Optional[str] = None
    specialty: Optional[str] = None


class DoctorListResponse(UserResponse):
    expertise_area: Optional[str] = None
    specialty: str
    crm: str
    location: str
    bind_id: Optional[int] = None


# TODO: ADICIONAR MAIS DADOS PARA O USUÁRIO COMO ALERGIAS, MEDICAMENTOS, ETC...
class PatientSchema(UserSchema):
    birthdate: date = Field(..., alias="birthdate")


class PatientListResponse(UserResponse):
    location: str
    bind_id: Optional[int] = None

class PatientDashboardResponse(BaseModel):
    id: int
    name: str
    cpf: str
    email: EmailStr
    age: int
    status: str  # "stable" | "attention" | "critical"
    last_test_date: Optional[str] = None
    last_test_type: Optional[str] = None  # "spiral" | "voice"
    tests_count: int
    bind_id: int


class AddressResponse(BaseModel):
    street: str
    number: str
    complement: Optional[str] = None
    neighborhood: str
    city: str
    state: str
    cep: str


class PatientFullProfileResponse(BaseModel):
    """Schema completo do perfil do paciente para visualização detalhada"""
    id: int
    name: str
    cpf: str
    email: EmailStr
    birthdate: date
    age: int
    address: AddressResponse
    status: str  # "stable" | "attention" | "critical"
    bind_id: int
    created_at: Optional[str] = None  # Data de criação do vínculo

class AdminSchema(UserSchema):
    is_superuser: bool = True

class AdminResponse(UserResponse):
    is_superuser: bool