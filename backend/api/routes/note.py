from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.models.users import User
from core.security.security import get_current_user, get_doctor_user, get_patient_user
from core.services.note_service import create_note, delete_note, get_notes, update_note
from infra.db.connection import get_session

from ..schemas.note import CreateNoteSchema, NoteResponse, UpdateNoteSchema

router = APIRouter(prefix="/notes", tags=["notes"])

CurrentPatient = Annotated[User, Depends(get_patient_user())]
CurrentDoctor = Annotated[User, Depends(get_doctor_user())]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post("", status_code=HTTPStatus.CREATED, response_model=NoteResponse)
def add_test_note(
    note: CreateNoteSchema, user: CurrentDoctor, session: Session = Depends(get_session)
):
    """
    Adiciona uma nota para um teste ou atrela uma nota a uma pré-existente
    (associated_note_id). O controle de vizualização do paciente é feito
    pela flag "patient_view".
    """
    return create_note(note, session, user)


@router.get("/{test_id}")
def get_test_notes(
    test_id: int, user: CurrentUser, session: Session = Depends(get_session)
):
    """
    Retorna todas as notas para determinado teste, esta endpoint pode ser utizada tanto
    pelo usuário tipo PACIENTE quanto pelo tipo MÉDICO.
    """
    return get_notes(test_id, session, user)


@router.put("/{note_id}", response_model=NoteResponse)
def update_test_note(
    note_id: int,
    note_data: UpdateNoteSchema,
    user: CurrentDoctor,
    session: Session = Depends(get_session),
):
    """
    Endpoint para atualizar os campos de conteúdo e permissão de vizualização da nota
    pelo paciente. Apenas o médico criador da nota pode editá-la.
    """
    return update_note(note_id, note_data, user, session)


@router.delete("/{note_id}")
def delete_test_note(
    note_id: int, user: CurrentDoctor, session: Session = Depends(get_session)
):
    """
    Endpoint para deletar uma nota (e todas as outras atreladas a ela por cascade).
    Apenas o médico criador da nota pode deletá-la.
    """
    return delete_note(note_id, user, session)
