import secrets
from datetime import datetime, timedelta, timezone
from http import HTTPStatus

from fastapi import BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from api.schemas.auth import LoginFormRequest
from api.schemas.token import TokenResponse, UserResponse
from core.security.security import verify_password
from core.services.email_service import (
    send_password_reset_email_background,
)
from core.services.user_service import (
    get_user_by_email,
    get_user_by_reset_token,
    set_reset_token,
    update_password,
)

from ..security.security import create_access_token


def login(login_form: LoginFormRequest, session: Session):
    user = get_user_by_email(login_form.email, session)
    if not user or not verify_password(login_form.password, user.hashed_password):
        raise HTTPException(
            HTTPStatus.UNAUTHORIZED, detail="Verifique as credenciais de acesso."
        )

    if not user.is_active:
        raise HTTPException(
            HTTPStatus.FORBIDDEN,
            detail="Sua conta não está ativa, verifique o email ou entre em contato com o suporte"
        )

    token_data = create_access_token(data={"sub": login_form.email})

    user_response = UserResponse(
        id=user.id, name=user.name, email=user.email, role=user.user_type, gender=user.gender
    )

    return TokenResponse(access_token=token_data, user=user_response)


async def request_password_reset(
    email: str, background_tasks: BackgroundTasks, session: Session
):
    user = get_user_by_email(email, session)
    if user:
        reset_token = secrets.token_urlsafe(32)
        token_expiry = datetime.now(tz=timezone.utc) + timedelta(days=1)
        set_reset_token(user, reset_token, token_expiry, session)
        await send_password_reset_email_background(background_tasks, email, reset_token)


def reset_password(token: str, new_password: str, session: Session):
    user = get_user_by_reset_token(token, session)

    if not user:
        raise HTTPException(
            HTTPStatus.NOT_FOUND, detail="O token de redefinição não existe"
        )

    # Ensure both datetimes are timezone-aware for comparison
    expiry = user.reset_token_expiry
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)

    if expiry < datetime.now(tz=timezone.utc):
        raise HTTPException(
            HTTPStatus.FORBIDDEN, detail="O token de redefinição expirou, tente novamente"
        )

    update_password(user, new_password, session)
