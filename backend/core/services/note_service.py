from http import HTTPStatus

from fastapi import HTTPException
from sqlalchemy.orm import Session

from api.schemas.note import NoteResponse, NoteSchema, UpdateNoteSchema
from core.models import Note, Test, User
from core.services import doctor_service, patient_service

from ..enums.user_enum import UserType


def create_note(note: NoteSchema, session: Session, user: User) -> NoteResponse:
    if note.content is None:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST, detail="O conteúdo da nota não pode estar vazio."
        )

    test: Test | None = session.query(Test).filter(Test.id == note.test_id).first()

    if not test:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="Teste não encontrado.")

    patients = patient_service.get_binded_patients(session, user)
    if test.patient_id not in [patient.id for patient in patients]:
        raise HTTPException(HTTPStatus.FORBIDDEN, detail="Paciente não atrelado ao médico.")

    note_db = Note(
        content=note.content,
        associated_note_id=note.associated_note_id,
        doctor_id=user.id,
        patient_view=note.patient_view,
    )

    Session.add(note_db)
    Session.commit()
    Session.refresh(note_db)

    return note_db


def get_notes(test_id: int, session: Session, user: User) -> list[NoteResponse]:
    if user.user_type == UserType.PATIENT:
        doctors = doctor_service.get_binded_doctors(session, user)

        doctors_ids = [doctor.id for doctor in doctors]
        notes = (
            session.query(Note)
            .filter(
                Note.test_id == test_id,
                Note.patient_view is True,
                Note.doctor_id.in_(doctors_ids),
            )
            .all()
        )

        return notes

    elif user.user_type == UserType.DOCTOR:
        notes = (
            session.query(Note)
            .filter(Note.doctor_id == user.id, Note.test_id == test_id)
            .all()
        )

        return notes


def update_note(
    note_id: int, note_data: UpdateNoteSchema, user: User, session: Session
) -> NoteResponse:
    db_note = session.query(Note).filter(Note.id == note_id).first()

    if not db_note:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="Nota não encontrada.")

    if db_note.doctor_id != user.id:
        raise HTTPException(
            HTTPStatus.FORBIDDEN, detail="Apenas o criador da nota pode editá-la"
        )

    db_note.content = note_data.content
    db_note.patient_view = note_data.patient_view

    session.add(db_note)
    session.commit()
    session.refresh(db_note)

    return db_note


def delete_note(note_id: int, user: User, session: Session):
    db_note = session.query(Note).filter(Note.id == note_id).first()

    if not db_note:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="Nota não encontrada.")

    if db_note.doctor_id != user.id:
        raise HTTPException(
            HTTPStatus.FORBIDDEN, detail="Apenas o criador da nota pode deletá-la"
        )

    session.delete(db_note)
    session.commit()
