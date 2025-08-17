from pydantic import BaseModel, EmailStr
from core.enums.user_enum import UserType

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

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse