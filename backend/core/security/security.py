from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from typing import Literal
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from jwt import decode, encode
from api.schemas.token import TokenResponse
from core.services import user_service
from infra.settings import Settings
from sqlalchemy.orm import Session
from core.models import Patient, Doctor, User
from infra.db.connection import get_session

SETTINGS = Settings()

pwd_context = PasswordHash.recommended()
    
async def get_current_user(cred: HTTPAuthorizationCredentials = Depends(HTTPBearer()), session: Session = Depends(get_session), verify_type: str|None = None):
    user = get_user_from_token(cred.credentials, session)
    
    if verify_type == "Patient":
        if not isinstance(user, Patient):
            raise HTTPException(HTTPStatus.FORBIDDEN, detail="Usuário sem acesso a rota")
    elif verify_type == "Doctor":
        if not isinstance(user, Doctor):
            raise HTTPException(HTTPStatus.FORBIDDEN, detail="Usuário sem acesso a rota")
        
    return user

def get_doctor_user():
    async def _get_user(
        cred: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
        session: Session = Depends(get_session)
    ) -> User:
        return await get_current_user(cred, session, verify_type="Doctor")
    return _get_user

def get_patient_user():
    async def _get_user(
        cred: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
        session: Session = Depends(get_session)
    ) -> User:
        return await get_current_user(cred, session, verify_type="Patient")
    return _get_user


def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_user_from_token(token: str, session: Session):
    CREDENTIAL_EXCEPTION = HTTPException(  
        status_code=HTTPStatus.UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    
    try:
        payload = decode(token, SETTINGS.SECRET_KEY, algorithms=[SETTINGS.ALGORITHM])
        email = payload.get('sub')
        return user_service.get_user_by_email(email, session)
        
    except Exception:
        raise CREDENTIAL_EXCEPTION
    
def create_access_token(data: dict) -> TokenResponse:
    expire = datetime.now(tz=timezone.utc) + timedelta(minutes=Settings().ACCESS_TOKEN_EXPIRE_MINUTES)

    
    data.update({'exp': expire})
    
    encode_jwt = encode(
        data, SETTINGS.SECRET_KEY, algorithm=SETTINGS.ALGORITHM
    )
    
    return TokenResponse(access_token=encode_jwt, token_type="Bearer")