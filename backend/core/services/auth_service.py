from api.schemas.auth import LoginFormRequest
from fastapi import HTTPException
from http import HTTPStatus

from core.security.security import verify_password
from core.services.user_service import get_user_by_email
from ..security.token import create_access_token

def login(login_form: LoginFormRequest):
    user = get_user_by_email(login_form.email_or_cpf)
    if(not user or not verify_password(login_form.password, user.hashed_password)):
        raise HTTPException(HTTPStatus.UNAUTHORIZED, detail="Verifique as credenciais de acesso.")
    
    return create_access_token(data={'sub': login_form.email_or_cpf})