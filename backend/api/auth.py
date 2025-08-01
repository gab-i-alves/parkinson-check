from fastapi import APIRouter, Depends

from .schemas.token import TokenResponse
from .schemas.auth import LoginFormRequest
from core.services import auth_service

router = APIRouter(tags=['Auth'])

@router.post('/login', response_model=TokenResponse)
def login(form: LoginFormRequest = Depends()):
    return auth_service.login(form)