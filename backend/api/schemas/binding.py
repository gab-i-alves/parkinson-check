from pydantic import BaseModel, EmailStr
from core.enums.bind_enum import BindEnum


class RequestBinding(BaseModel):
    doctor_id: int
    
class Bind(BaseModel):
    id: int
    status: BindEnum
    doctor_id: int
    patient_id: int
    
    model_config = {'from_attributes': True}
    
class BindingPatient(BaseModel):
    id: int
    name: str
    email: EmailStr

class BindingDoctor(BaseModel):
    id: int
    name: str
    specialty: str

class BindindRequestResponse(BaseModel):
    id: int
    patient: BindingPatient
    status: BindEnum    

class SentBindindRequestResponse(BaseModel):
    id: int
    doctor: BindingDoctor