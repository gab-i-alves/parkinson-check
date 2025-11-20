from datetime import date, datetime
from typing import Optional
import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from core.enums.doctor_enum import DoctorStatus
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
    status: Optional[DoctorStatus] = None
    reason: Optional[str] = None
    approved_by: Optional[str] = None
    approval_date: Optional[datetime] = None


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
    """Schema para atualização de dados do usuário pelo administrador"""
    # Dados pessoais
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    birthdate: Optional[date] = None
    gender: Optional[Gender] = None

    # Endereço
    cep: Optional[str] = Field(None, pattern=r'^\d{8}$')
    street: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None


class ChangeUserStatusSchema(BaseModel):
    is_active: bool
    reason: Optional[str] = None  # motivo da desativação


class ChangeDoctorStatusSchema(BaseModel):
    status: str  # DoctorStatus enum value
    reason: Optional[str] = None


class UpdateDoctorDetailsSchema(BaseModel):
    """Schema para atualização de detalhes específicos do médico"""
    expertise_area: Optional[str] = None
    crm: Optional[str] = Field(None, min_length=8, max_length=10)

    @field_validator('crm')
    @classmethod
    def validate_crm(cls, v: Optional[str]) -> Optional[str]:
        """Valida formato CRM brasileiro: NNNNNN/UF"""
        if v is None:
            return v

        crm = v.strip().upper()
        pattern = r'^(\d{5,6})/([A-Z]{2})$'
        match = re.match(pattern, crm)

        if not match:
            raise ValueError('CRM deve estar no formato NNNNNN/UF (ex: 123456/SP)')

        number, state = match.groups()
        valid_states = {
            'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
            'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
            'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
        }

        if state not in valid_states:
            raise ValueError(f'Estado {state} não é válido para CRM brasileiro')

        return crm


class CreateUserByAdminSchema(BaseModel):
    """
    Schema para criação de usuários pelo administrador.
    Suporta criação de Pacientes, Médicos e Administradores.
    """
    user_type: UserType

    # Campos comuns a todos os tipos
    name: str = Field(..., alias="fullname", min_length=3)
    email: EmailStr
    cpf: str = Field(..., pattern=r'^\d{11}$')
    password: str = Field(..., min_length=6)
    birthdate: date
    gender: Gender

    # Endereço
    cep: str = Field(..., pattern=r'^\d{8}$')
    street: str
    number: str
    complement: Optional[str] = None
    neighborhood: str
    city: str
    state: str

    # Campos específicos de médico (obrigatórios se user_type == DOCTOR)
    crm: Optional[str] = Field(None, min_length=8, max_length=10)
    expertise_area: Optional[str] = Field(None, alias="specialty")

    # Campo específico de admin
    is_superuser: Optional[bool] = False

    model_config = ConfigDict(
        populate_by_name=True,
    )

    @field_validator('crm')
    @classmethod
    def validate_crm_for_doctor(cls, v: Optional[str], info) -> Optional[str]:
        """Valida CRM se for médico"""
        # Acessar user_type dos dados sendo validados
        data = info.data
        user_type = data.get('user_type')

        if user_type == UserType.DOCTOR:
            if not v:
                raise ValueError('CRM é obrigatório para médicos')

            # Validar formato CRM
            crm = v.strip().upper()
            pattern = r'^(\d{5,6})/([A-Z]{2})$'
            match = re.match(pattern, crm)

            if not match:
                raise ValueError('CRM deve estar no formato NNNNNN/UF (ex: 123456/SP)')

            number, state = match.groups()
            valid_states = {
                'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
                'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
                'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
            }

            if state not in valid_states:
                raise ValueError(f'Estado {state} não é válido para CRM brasileiro')

            return crm

        return v

    @field_validator('expertise_area')
    @classmethod
    def validate_expertise_for_doctor(cls, v: Optional[str], info) -> Optional[str]:
        """Valida área de especialidade se for médico"""
        data = info.data
        user_type = data.get('user_type')

        if user_type == UserType.DOCTOR and not v:
            raise ValueError('Área de especialidade é obrigatória para médicos')

        return v
