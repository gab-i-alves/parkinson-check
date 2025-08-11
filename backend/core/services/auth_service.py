from api.schemas.auth import LoginFormRequest
from fastapi import HTTPException
from http import HTTPStatus
from sqlalchemy.orm import Session
from core.security.security import verify_password
from core.services.user_service import get_user_by_email
from ..security.security import create_access_token
from api.schemas.token import TokenResponse, UserResponse

def login(login_form: LoginFormRequest, session: Session):
    user = get_user_by_email(login_form.email, session)
    if(not user or not verify_password(login_form.password, user.hashed_password)):
        raise HTTPException(HTTPStatus.UNAUTHORIZED, detail="Verifique as credenciais de acesso.")
    
    token_data = create_access_token(data={'sub': login_form.email})

    user_response = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.user_type
    )
    
    return TokenResponse(
        access_token=token_data,
        user=user_response
    )