from fastapi import Form
from pydantic import BaseModel, EmailStr

class LoginFormRequest(BaseModel):
    email: str
    password: str
    
    class Config:
        arbitrary_types_allowed = True
        
    @classmethod
    def as_form(
        cls,
        email: str = Form(...),
        password: str = Form(...)
    ):
        return cls(
            email=email,
            password=password
        )
        
        
        
