from pydantic import BaseModel, EmailStr


class LoginFormRequest(BaseModel):
    email: EmailStr
    password: str
