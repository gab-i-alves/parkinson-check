from pydantic import BaseModel
from .users import UserResponse

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse