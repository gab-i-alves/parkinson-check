from datetime import datetime, timedelta, timezone
from http import HTTPStatus
import re

from fastapi import Cookie, Depends, HTTPException
from jwt import decode, encode
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from api.schemas.token import TokenResponse
from core.models import Doctor, Patient, User, Admin
from infra.db.connection import get_session
from infra.settings import Settings
    
SETTINGS = Settings()

pwd_context = PasswordHash.recommended()


async def get_current_user(
    access_token: str = Cookie(None),
    session: Session = Depends(get_session),
    verify_type: str | None = None,
):
    CREDENTIAL_EXCEPTION = HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if access_token is None:
        raise CREDENTIAL_EXCEPTION

    token = access_token.split("Bearer ")[1]

    user = get_user_from_token(token, session)

    if verify_type == "Patient":
        if not isinstance(user, Patient):
            raise HTTPException(HTTPStatus.FORBIDDEN, detail="Usuário sem acesso a rota")
    elif verify_type == "Doctor":
        if not isinstance(user, Doctor):
            raise HTTPException(HTTPStatus.FORBIDDEN, detail="Usuário sem acesso a rota")
    elif verify_type == "Admin":
        if not isinstance(user, Admin):
            raise HTTPException(HTTPStatus.FORBIDDEN, detail="Usuário sem acesso a rota")

    return user


def get_doctor_user():
    async def _get_user(
        access_token: str = Cookie(None), session: Session = Depends(get_session)
    ) -> User:
        return await get_current_user(access_token, session, verify_type="Doctor")

    return _get_user


def get_patient_user():
    async def _get_user(
        access_token: str = Cookie(None), session: Session = Depends(get_session)
    ) -> User:
        return await get_current_user(access_token, session, verify_type="Patient")

    return _get_user

def get_admin_user():
    async def _get_user(
        access_token: str = Cookie(None), 
        session: Session = Depends(get_session)
    ) -> User:
        return await get_current_user(access_token, session, verify_type="Admin")

    return _get_user


def get_password_hash(password: str):
    return pwd_context.hash(password)

def anonymizeCPF(cpf: str):
    cpf_num = re.sub(r'[^0-9]', '', cpf)

    if len(cpf_num) != 11:
        return "CPF Inválido"

    cpf_anonymized = f"{cpf_num[:3]}.***.***-{cpf_num[9:]}"
    return cpf_anonymized


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def get_user_from_token(token: str, session: Session):
    from core.services import user_service  # Import local para evitar circular
    
    CREDENTIAL_EXCEPTION = HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode(token, SETTINGS.SECRET_KEY, algorithms=[SETTINGS.ALGORITHM])
        email = payload.get("sub")
        return user_service.get_user_by_email(email, session)

    except Exception:
        raise CREDENTIAL_EXCEPTION


def create_access_token(data: dict) -> TokenResponse:
    expire_minutes = Settings().ACCESS_TOKEN_EXPIRE_MINUTES
    expire = datetime.now(tz=timezone.utc) + timedelta(minutes=expire_minutes)

    data.update({"exp": expire})

    encoded_jwt = encode(data, SETTINGS.SECRET_KEY, algorithm=SETTINGS.ALGORITHM)

    return encoded_jwt


def anonymizeCPF(cpf: str, formated: bool = True):
    import re
    cpf_num = re.sub(r'[^0-9]', '', cpf)
    if formated:
        cpf_anonymized = f"{cpf_num[:3]}.***.***-{cpf_num[9:]}"
    else:
        cpf_anonymized = f"{cpf_num[:3]}******{cpf_num[9:]}"
    return cpf_anonymized
