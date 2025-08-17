from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.enums import BindEnum
from infra.db.connection import get_session
from ..schemas.binding import Bind
from core.services import doctor_service, patient_service
from ..schemas.binding import RequestBinding
from core.security.security import get_doctor_user, get_patient_user
from core.models.users import User

router = APIRouter(prefix="/bindings", tags=["Bindings"])

CurrentPatient = Annotated[User, Depends(get_patient_user())]
CurrentDoctor = Annotated[User, Depends(get_doctor_user())]

"""Patient"""
@router.post("/request", response_model=Bind)
def request_binding(request: RequestBinding, user: CurrentPatient, session: Session = Depends(get_session)):
    return patient_service.create_bind_request(request, user, session)

"""Doctor"""
@router.get("/requests", response_model=list[Bind])
def get_binding_requests(user: CurrentDoctor, session: Session = Depends(get_session)):
    return doctor_service.get_pending_binding_requests(user, session)

@router.post("/{binding_id}/accept", response_model=Bind)
def accept_bind_request(binding_id: int, user: CurrentDoctor, session: Session = Depends(get_session)):
    return doctor_service.activate_or_reject_binding_request(user, binding_id, session, new_status=BindEnum.ACTIVE)

@router.post("/{binding_id}/reject", response_model=Bind)
def accept_bind_request(binding_id: int, user: CurrentDoctor, session: Session = Depends(get_session)):
    return doctor_service.activate_or_reject_binding_request(user, binding_id, session, new_status=BindEnum.REJECTED)

