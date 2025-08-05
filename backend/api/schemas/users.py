from datetime import date
from pydantic import BaseModel, Field, ConfigDict, EmailStr

class UserSchema(BaseModel):
    
    model_config = ConfigDict(
        populate_by_name=True, # Permite o alias
    )

    fullName: str = Field(..., alias='name')
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
    
class DoctorSchema(UserSchema):
    crm: str
    specialty: str = Field(..., alias='expertise_area')
    
class PatientSchema(UserSchema):
    birthDate: date = Field(..., alias='birthdate')
    