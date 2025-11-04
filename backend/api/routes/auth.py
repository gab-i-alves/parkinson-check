from fastapi import APIRouter, BackgroundTasks, Depends, Response
from sqlalchemy.orm import Session

from core.services import auth_service
from infra.db.connection import get_session
from infra.settings import settings

from ..schemas.auth import ForgotPasswordRequest, LoginFormRequest, ResetPasswordRequest

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(
    response: Response, form: LoginFormRequest, session: Session = Depends(get_session)
):
    token = auth_service.login(form, session)

    print(f"AMBIENTE DETETADO: '{settings.ENVIRONMENT}'")

    if settings.ENVIRONMENT == "production":
        print("A APLICAR CONFIGURAÇÕES DE PRODUÇÃO PARA O COOKIE.")
        # Configurações para produção (Railway)
        response.set_cookie(
            key="access_token",
            value=f"Bearer {token.access_token}",
            httponly=True,
            secure=True,  # Obrigatório para samesite="none"
            samesite="none",  # Permite o envio entre subdomínios
        )
    else:
        print("A APLICAR CONFIGURAÇÕES DE DESENVOLVIMENTO PARA O COOKIE.")
        # Configurações para desenvolvimento (localhost)
        response.set_cookie(
            key="access_token",
            value=f"Bearer {token.access_token}",
            httponly=True,
            secure=False,
            samesite="lax",  # "lax" é suficiente e seguro para localhost
        )

    return token.user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logout successful"}


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    await auth_service.request_password_reset(request.email, background_tasks, session)
    return {"message": "Se o email existir, você receberá instruções para a redefinição"}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, session: Session = Depends(get_session)):
    auth_service.reset_password(request.token, request.new_password, session)
    return {"message": "Senha redefinida com sucesso"}
