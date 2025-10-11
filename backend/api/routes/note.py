from typing import Annotated
from fastapi import APIRouter, Depends

from infra.db.connection import get_session
from ..schemas.note import NoteSchema, NoteResponse
from core.models.users import User
from core.security.security import get_doctor_user, get_patient_user
from core.services.note_service import create_note, get_notes, update_note
from sqlalchemy.orm import Session
from http import HTTPStatus

router = APIRouter(prefix="/notes", tags=["notes"])

CurrentPatient = Annotated[User, Depends(get_patient_user())]
CurrentDoctor = Annotated[User, Depends(get_doctor_user())]


@router.post("", status_code=HTTPStatus.CREATED, response_model=NoteResponse)
def add_test_note(
    note: NoteSchema,
    user: CurrentDoctor,
    session: Session = Depends(get_session)
):
    return create_note(note, session, user)

@router.get("/{test_id}")
def get_test_notes(
    test_id: int,
    user: CurrentDoctor,
    session: Session = Depends(get_session)
):
    return get_notes(test_id, session, user)

@router.put("/{note_id}", response_model=NoteResponse)
def update_test_note(
    note_id: int,
    note_data: NoteSchema,
    user: CurrentDoctor,
    session: Session = Depends(get_session)
):
    """
    Atualiza uma nota existente.
    Apenas o médico que criou a nota pode atualizá-la.
    """
    return update_note(note_id, note_data, session, user)

@router.delete("/{note_id}")
def delete_test_note(
    note_id: int,
    user: CurrentDoctor,
    session: Session = Depends(get_session)
):
    ...
