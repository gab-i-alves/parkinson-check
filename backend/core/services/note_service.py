from http import HTTPStatus

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from api.schemas.note import NoteResponse, NoteSchema, UpdateNoteSchema
from core.enums.doctor_enum import ActivityType
from core.models import Note, Test, User
from core.services import doctor_service, patient_service, doctor_management_service

from ..enums.user_enum import UserType


def create_note(note: NoteSchema, session: Session, user: User) -> NoteResponse:
    if note.content is None or len(note.content.strip()) < 10:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST,
            detail="O conteúdo da nota deve ter no mínimo 10 caracteres.",
        )

    if len(note.content) > 5000:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST,
            detail="O conteúdo da nota não pode exceder 5000 caracteres.",
        )

    test: Test | None = session.query(Test).filter(Test.id == note.test_id).first()

    if not test:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="Teste não encontrado.")

    patients = patient_service.get_binded_patients(session, user)
    if test.patient_id not in [patient.id for patient in patients]:
        raise HTTPException(HTTPStatus.FORBIDDEN, detail="Paciente não atrelado ao médico.")

    note_db = Note(
        content=note.content,
        test_id=note.test_id,
        parent_note_id=note.parent_note_id,
        doctor_id=user.id,
        patient_view=note.patient_view,
        category=note.category,
    )

    session.add(note_db)
    session.commit()
    session.refresh(note_db)

    # Carregar o relacionamento doctor antes de retornar
    note_with_doctor = (
        session.query(Note)
        .options(joinedload(Note.doctor))
        .filter(Note.id == note_db.id)
        .first()
    )
    
    doctor_management_service.log_activity(note_with_doctor.doctor_id, ActivityType.NOTE_ADDED, "Médico adicionou a nota" + note_with_doctor.id + " ao teste " + note_with_doctor.test_id, session)

    return note_with_doctor


def get_notes(test_id: int, session: Session, user: User) -> list[NoteResponse]:
    if user.user_type == UserType.PATIENT:
        doctors = doctor_service.get_binded_doctors(session, user)

        doctors_ids = [doctor.id for doctor in doctors]
        notes = (
            session.query(Note)
            .options(joinedload(Note.doctor))
            .filter(
                Note.test_id == test_id,
                Note.patient_view == True,
                Note.doctor_id.in_(doctors_ids),
            )
            .order_by(Note.created_at.desc())
            .all()
        )

        return [NoteResponse.model_validate(note) for note in notes]

    elif user.user_type == UserType.DOCTOR:
        # Verificar se o teste existe e pegar o patient_id
        test: Test | None = session.query(Test).filter(Test.id == test_id).first()

        if not test:
            raise HTTPException(HTTPStatus.NOT_FOUND, detail="Teste não encontrado.")

        # Verificar se o médico tem acesso ao paciente
        patients = patient_service.get_binded_patients(session, user)
        if test.patient_id not in [patient.id for patient in patients]:
            raise HTTPException(
                HTTPStatus.FORBIDDEN, detail="Acesso negado ao teste deste paciente."
            )

        # Buscar todas as notas de TODOS os médicos para este teste
        notes = (
            session.query(Note)
            .options(joinedload(Note.doctor))
            .filter(Note.test_id == test_id)
            .order_by(Note.created_at.desc())
            .all()
        )

        return [NoteResponse.model_validate(note) for note in notes]


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
    db_note.category = note_data.category

    session.add(db_note)
    session.commit()
    session.refresh(db_note)

    # Carregar o relacionamento doctor antes de retornar
    note_with_doctor = (
        session.query(Note)
        .options(joinedload(Note.doctor))
        .filter(Note.id == note_id)
        .first()
    )
    
    doctor_management_service.log_activity(note_with_doctor.doctor_id, ActivityType.NOTE_UPDATED, "Médico atualizou a nota" + note_with_doctor.id + ", do teste " + note_with_doctor.test_id, session)

    return note_with_doctor


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
    
    doctor_management_service.log_activity(user.id, ActivityType.NOTE_DELETED, "Médico deletou a nota" + note_id, session)
    
