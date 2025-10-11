from api.schemas.note import NoteSchema, NoteResponse
from sqlalchemy.orm import Session
from fastapi import HTTPException
from http import HTTPStatus
from core.models import User, Note, Test
from core.services import patient_service

def create_note(note: NoteSchema, session: Session, user: User) -> NoteResponse:
    if note.content is None:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST,
            detail="O conteúdo da nota não pode estar vazio."
        )
        
    test: Test | None = session.query(Test).filter(Test.id == note.test_id).first()
    
    if not test:
        raise HTTPException(
            HTTPStatus.NOT_FOUND,
            detail="Teste não encontrado."
        )
        
    patients = patient_service.get_binded_patients(session, user)
    if test.patient_id not in [patient.id for patient in patients]:
        raise HTTPException(
            HTTPStatus.FORBIDDEN,
            detail="Paciente não atrelado ao médico."
        )
        
    note_db = Note(content=note.content, associated_note_id=note.associated_note_id)
    
    Session.add(note_db)
    Session.commit()
    Session.refresh(note_db)
    
    return note_db
    
def get_notes(test_id: int, session: Session, user: User):
    ...
    
    
def update_note():
    ...

def delete_note():
    ...
    
