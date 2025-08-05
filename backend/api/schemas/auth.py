from pydantic import BaseModel, EmailStr

class LoginFormRequest(BaseModel):
    email: str
    password: str
        
        
