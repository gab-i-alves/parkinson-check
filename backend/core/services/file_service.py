from http import HTTPStatus
import os
import uuid
from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse
from core.models.doctor_utils import DoctorDocument
from sqlalchemy.orm import Session
from infra.settings import Settings # Assumindo que usa Pydantic Settings

settings = Settings()

def save_uploaded_file(
    file: UploadFile, 
    doctor_id: int, 
    document_type: str
) -> dict:
    if file.content_type not in settings.ALLOWED_MIME_TYPES:
        raise HTTPException(400, detail="Tipo de arquivo não permitido")

    file.file.seek(0, 2)  
    file_size = file.file.tell()
    file.file.seek(0)  
    max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024

    if file_size > max_size:
        raise HTTPException(400, detail=f"Arquivo muito grande (limite: {settings.MAX_FILE_SIZE_MB}MB)")

    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{doctor_id}_{document_type}_{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    return {
        "file_name": file.filename,
        "file_path": file_path, 
        "file_size": file_size,
        "mime_type": file.content_type
    }
    
def get_doctor_document(
    doctor_id: int, 
    file_id: int, 
    session: Session
) -> list[FileResponse] :
    file_info = get_doctor_document_info(doctor_id, file_id, session)
    
    if not os.path.exists(file_info.file_path):
        raise HTTPException(
            HTTPStatus.NOT_FOUND,
            detail="Não foi encontrado o arquivo especificado",
        )
        
    return FileResponse(
        path=file_info.file_path,
        filename=file_info.file_name,
        media_type=file_info.mime_type
    )

def get_doctor_documents_info(
    doctor_id: int, 
    session: Session
) -> list[DoctorDocument] :
    
    files = session.query(DoctorDocument).filter(DoctorDocument.doctor_id == doctor_id).all()

    # Return empty list instead of raising 404 when no documents found
    return files

def get_doctor_document_info(
    doctor_id: int, 
    file_id: int, 
    session: Session
) -> list[DoctorDocument] :
    return session.query(DoctorDocument).filter(DoctorDocument.doctor_id == doctor_id, DoctorDocument.id == file_id).first()