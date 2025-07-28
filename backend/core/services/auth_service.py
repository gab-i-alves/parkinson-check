from api.schemas.auth import LoginFormRequest
from fastapi import HTTPException
from http import HTTPStatus
from ..security.token import create_access_token

def login(login_form: LoginFormRequest):
    if(login_form.password != "password"):
        raise HTTPException(detail="Verifique as credenciais de acesso.", status_code=HTTPStatus.UNAUTHORIZED)
    
    return create_access_token(data={'sub': login_form.email_or_cpf})