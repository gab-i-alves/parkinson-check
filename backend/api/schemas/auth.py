from pydantic import BaseModel, EmailStr, Field


class LoginFormRequest(BaseModel):
    model_config = {"populate_by_name": True}

    email: EmailStr
    password: str
    remember_me: bool = Field(default=False, alias="remember")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
