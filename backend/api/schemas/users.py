from datetime import date
from pydantic import BaseModel

class UserSchema(BaseModel):
    name: str
    cpf: str
    email: str
    password: str
    
class DoctorSchema(UserSchema):
    crm: str
    expertise_area: str
    
class PatientSchema(UserSchema):
    birthdate: date
    