from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from core.services import auth_service
from infra.db.connection import get_session
from infra.settings import settings

from ..schemas.auth import LoginFormRequest

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
