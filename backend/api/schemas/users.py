from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from core.enums import UserType
class UserSchema(BaseModel):
    
    model_config = ConfigDict(
        populate_by_name=True, # Permite o alias
    )

    fullname: str = Field(..., alias='name')
    birthdate: date = Field(..., alias='birthdate') # NÃO RETIRAR DAQUI
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
    specialty: str = Field(..., alias='expertise_area')
    
class GetDoctorsSchema(BaseModel):
    name: Optional[str] = None
    cpf: Optional[str] = None
    email: Optional[str] = None
    crm: Optional[str] = None
    specialty: Optional[str] = None
    
class DoctorListResponse(UserResponse):
    specialty: str
    crm: str
    location: str
    bind_id: Optional[int] = None

# TODO: ADICIONAR MAIS DADOS PARA O USUÁRIO COMO ALERGIAS, MEDICAMENTOS, ETC...
class PatientSchema(UserSchema):
    birthdate: date = Field(..., alias='birthdate')
    
class PatientListResponse(UserResponse):
    location: str
    bind_id: Optional[int] = None
    

    

