from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from infra.db.connection import get_session

from core.services import doctor_service

from ..schemas.binding import RequestBinding
from core.security.security import get_current_user
from core.models.users import User

router = APIRouter(prefix="/bindings", tags=["Bindings"])

CurrentUser = Annotated[User, Depends(get_current_user)]

@router.post("/request")
def request_binding(doctor_id: RequestBinding, user: CurrentUser, session: Session = Depends(get_session)):
    print(user)
    return doctor_service.bind_patient(doctor_id, user, session)
