from datetime import date
from typing import Optional
import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from core.enums import Gender, UserType


class UserSchema(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,  # Permite o alias
    )

    fullname: str = Field(..., alias="name")
    birthdate: date = Field(..., alias="birthdate")  # NÃO RETIRAR DAQUI
    cpf: str
    email: EmailStr
    password: str
    gender: Gender

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
    gender: Gender


class DoctorSchema(UserSchema):
    crm: str = Field(
        ...,
        min_length=8,
        max_length=10,
        description="CRM no formato NNNNNN/UF",
        examples=["123456/SP", "12345/RJ"]
    )
    specialty: str = Field(..., alias="expertise_area")

    @field_validator('crm')
    @classmethod
    def validate_crm(cls, v: str) -> str:
        """Valida formato CRM brasileiro: NNNNNN/UF"""

        # Remove espaços extras e converte para maiúsculas
        crm = v.strip().upper()

        # Validar formato básico: 5-6 dígitos + barra + 2 letras
        pattern = r'^(\d{5,6})/([A-Z]{2})$'
        match = re.match(pattern, crm)

        if not match:
            raise ValueError(
                'CRM deve estar no formato NNNNNN/UF (ex: 123456/SP ou 12345/RJ)'
            )

        number, state = match.groups()

        # Validar se o estado é válido (todos os estados brasileiros)
        valid_states = {
            'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
            'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
            'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
        }

        if state not in valid_states:
            raise ValueError(f'Estado {state} não é válido para CRM brasileiro')

        return crm


class GetDoctorsSchema(BaseModel):
    name: Optional[str] = None
    cpf: Optional[str] = None
    email: Optional[str] = None
    crm: Optional[str] = None
    specialty: Optional[str] = None


class GetPatientsSchema(BaseModel):
    name: Optional[str] = None
    cpf: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None  # "stable" | "attention" | "critical"


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
    cpf: str
    location: str
    bind_id: Optional[int] = None
    age: int
    status: str  # "stable" | "attention" | "critical"


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


class UserListResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    cpf: str
    user_type: UserType
    is_active: bool
    created_at: str
    location: str  # cidade, estado


class UserFilterSchema(BaseModel):
    search: Optional[str] = None  # busca por nome, email ou CPF
    user_type: Optional[UserType] = None  # filtrar por tipo
    is_active: Optional[bool] = None  # filtrar por status
    limit: int = 50
    offset: int = 0


class UpdateUserSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    # Campos que admin pode editar (sem senha)


class ChangeUserStatusSchema(BaseModel):
    is_active: bool
    reason: Optional[str] = None  # motivo da desativação
