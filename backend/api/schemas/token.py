from pydantic import BaseModel, EmailStr
from core.enums import UserType, BindEnum
from .users import DoctorSchema


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserType

class DoctorResponse(UserResponse):
    specialty: str
    crm: str
    location: str
    status: str

class PatientDto(BaseModel):
    id: int
    name: str
    email: EmailStr

class DoctorDTO(BaseModel):
    id: int
    name: str
    specialty: str

class BindindRequestResponse(BaseModel):
    id: int
    patient: PatientDto
    status: BindEnum    

class SentBindindRequestResponse(BaseModel):
    id: int
    doctor: DoctorDTO

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse