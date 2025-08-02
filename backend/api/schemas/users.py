from datetime import date
from pydantic import BaseModel

class UserSchema(BaseModel):
    fullName: str
    cpf: str
    birthDate: date
    cep: str
    street: str
    number: int
    complement: str
    neighborhood: str
    city: str
    state: str
    email: str
    password: str
    
class DoctorSchema(UserSchema):
    crm: str
    expertise_area: str
    
# class PatientSchema(UserSchema):
#     birthdate: date
    