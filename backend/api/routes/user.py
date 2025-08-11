from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from infra.db.connection import get_session
from core.models import User
from core.security.security import get_current_user
from api.schemas.token import UserResponse

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_user_me(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.user_type
    )