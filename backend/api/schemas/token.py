from pydantic import BaseModel, EmailStr
from core.enums import UserType, BindEnum


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserType

class DoctorResponse(UserResponse):
    specialty: str
    crm: str
    location: str
    status: int

class PatientDto(BaseModel):
    id: int
    name: str
    email: EmailStr

class BindindRequestResponse(BaseModel):
    id: int
    patient: PatientDto
    status: BindEnum    
    

#     export interface BindingRequest {
#   id: number;
#   patient: {
#     id: number;
#     name: string;
#     email: string;
#   };
#   status: 'PENDING' | 'ACTIVE' | 'REJECTED';
# }

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse