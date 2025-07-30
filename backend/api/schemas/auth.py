from fastapi import Form
from pydantic import BaseModel, EmailStr

class LoginFormRequest(BaseModel):
    email_or_cpf: str
    password: str
    
    class Config:
        arbitrary_types_allowed = True
        
    @classmethod
    def as_form(
        cls,
        email_or_cpf: str = Form(...),
        password: str = Form(...)
    ):
        return cls(
            email_or_cpf=email_or_cpf,
            password=password
        )
        
        
        
