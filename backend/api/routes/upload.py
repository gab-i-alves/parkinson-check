from typing import Annotated
from fastapi import File, UploadFile, Form, APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.models.users import User, Doctor
from core.security.security import get_doctor_user
from infra.db.connection import get_session
from core.services import file_service
from core.models.doctor_utils import DoctorDocument
from core.enums.doctor_enum import DocumentType, DoctorStatus

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


@router.post("/register-doctor-document")
async def upload_registration_doctor_document(
    doctor_id: int = Form(...),
    document_type: DocumentType = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """
    Public endpoint for uploading doctor documents during registration (before approval).
    Only allows uploads for doctors in PENDING status.
    """
    # Validate that the doctor exists and is in PENDING status
    doctor = session.query(Doctor).filter(Doctor.id == doctor_id).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    if doctor.status != DoctorStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Document uploads are only allowed for pending doctor registrations"
        )

    # Save the file using the same service
    file_info = file_service.save_uploaded_file(file, doctor_id, document_type.value)

    # Create document record
    document = DoctorDocument(
        doctor_id=doctor_id,
        document_type=document_type,
        **file_info
    )
    session.add(document)
    session.commit()

    return {"message": "Documento de registro enviado com sucesso", "document_id": document.id}
