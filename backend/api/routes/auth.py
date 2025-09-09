from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from infra.db.connection import get_session
from ..schemas.auth import LoginFormRequest
from core.services import auth_service

router = APIRouter(prefix='/auth', tags=['Auth'])

@router.post('/login')
def login(response: Response, form: LoginFormRequest, session: Session = Depends(get_session)):
    token = auth_service.login(form, session)
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token.access_token}",
        httponly=True,
        secure=False, # true para https
        samesite="strict"
    )
    return token.user

@router.post('/logout')
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logout successful"}