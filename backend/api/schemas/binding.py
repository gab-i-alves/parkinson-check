from pydantic import BaseModel, EmailStr

from core.enums.bind_enum import BindEnum
from core.enums.user_enum import UserType


class RequestBinding(BaseModel):
    user_id: int


class Bind(BaseModel):
    id: int
    status: BindEnum
    doctor_id: int
    patient_id: int

    model_config = {"from_attributes": True}


class BindingPatient(BaseModel):
    id: int
    name: str
    email: EmailStr


class BindingDoctor(BaseModel):
    id: int
    name: str
    specialty: str


class BindingRequestResponse(BaseModel):
    id: int
    user: BindingPatient | BindingDoctor
    status: BindEnum
    created_by_type: UserType | None = None
