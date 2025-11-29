from http import HTTPStatus
from fastapi import UploadFile, HTTPException
from fastapi.responses import Response
from core.models.doctor_utils import DoctorDocument
from sqlalchemy.orm import Session

# Configurações de upload
MAX_FILE_SIZE_MB = 10
ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg"
]


def save_uploaded_file(
    file: UploadFile,
    doctor_id: int,
    document_type: str
) -> dict:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(400, detail="Tipo de arquivo não permitido")

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    max_size = MAX_FILE_SIZE_MB * 1024 * 1024

    if file_size > max_size:
        raise HTTPException(400, detail=f"Arquivo muito grande (limite: {MAX_FILE_SIZE_MB}MB)")

    file_content = file.file.read()

    return {
        "file_name": file.filename,
        "file_data": file_content,
        "file_size": file_size,
        "mime_type": file.content_type
    }


def get_doctor_document(
    doctor_id: int,
    file_id: int,
    session: Session
) -> Response:
    file_info = get_doctor_document_info(doctor_id, file_id, session)

    if not file_info:
        raise HTTPException(
            HTTPStatus.NOT_FOUND,
            detail="Documento não encontrado no banco de dados",
        )

    return Response(
        content=file_info.file_data,
        media_type=file_info.mime_type,
        headers={"Content-Disposition": f'attachment; filename="{file_info.file_name}"'}
    )


def get_doctor_documents_info(
    doctor_id: int,
    session: Session
) -> list[DoctorDocument]:

    files = session.query(DoctorDocument).filter(DoctorDocument.doctor_id == doctor_id).all()

    # Return empty list instead of raising 404 when no documents found
    return files


def get_doctor_document_info(
    doctor_id: int,
    file_id: int,
    session: Session
) -> DoctorDocument | None:
    return session.query(DoctorDocument).filter(DoctorDocument.doctor_id == doctor_id, DoctorDocument.id == file_id).first()