from typing import Annotated
from fastapi import File, UploadFile, Form, APIRouter, Depends
from sqlalchemy.orm import Session
from core.models.users import User
from core.security.security import get_doctor_user
from infra.db.connection import get_session
from core.services import file_service
from core.models.doctor_utils import DoctorDocument
from core.enums.doctor_enum import DocumentType

router = APIRouter(prefix="/upload", tags=["Uploads"])

CurrentDoctor = Annotated[User, Depends(get_doctor_user())]

@router.post("/doctor-document")
async def upload_doctor_document(
    user: CurrentDoctor, 
    document_type: DocumentType = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    file_info = file_service.save_uploaded_file(file, user.id, document_type.value)

    document = DoctorDocument(
        doctor_id=user.id,
        document_type=document_type,
        **file_info
    )
    session.add(document)
    session.commit()
    
    return {"message": "Documento enviado com sucesso - ", "document_id": document.id}
