from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.enums import BindEnum
from core.models.users import User
from core.security.security import get_doctor_user, get_patient_user, get_current_user
from core.services import doctor_service, patient_service, bind_service
from infra.db.connection import get_session

from ..schemas.binding import (
    Bind,
    BindingRequestResponse,
    RequestBinding,
)

router = APIRouter(prefix="/bindings", tags=["Bindings"])

CurrentPatient = Annotated[User, Depends(get_patient_user())]
CurrentDoctor = Annotated[User, Depends(get_doctor_user())]
CurrentUser = Annotated[User, Depends(get_current_user)]

@router.get("/requests", response_model=list[BindingRequestResponse])
def get_pending_binding_requests(
    user: CurrentUser, session: Session = Depends(get_session)
):
    return bind_service.get_pending_bind_requests(user, session)


@router.post("/request", response_model=Bind)
def request_binding(
    request: RequestBinding, user: CurrentUser, session: Session = Depends(get_session)
):
    return bind_service.send_bind_request(user, session, request.user_id)


@router.post("/{binding_id}/accept", response_model=Bind)
def accept_bind_request(
    binding_id: int, user: CurrentUser, session: Session = Depends(get_session)
):
    return bind_service.accept_bind_request(
        user, session, binding_id
    )


@router.post("/{binding_id}/reject", response_model=Bind)
def reject_bind_request(
    binding_id: int, user: CurrentUser, session: Session = Depends(get_session)
):
    return bind_service.reject_bind_request(
        user, session, binding_id
    )


@router.delete("/{binding_id}", status_code=HTTPStatus.NO_CONTENT)
def unlink_binding_request(
    binding_id: int, current_user: CurrentUser, session: Session = Depends(get_session)
):
    return bind_service.unbind_users(current_user, session, binding_id)
