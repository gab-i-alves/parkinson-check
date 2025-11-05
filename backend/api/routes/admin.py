from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.enums.user_enum import UserType
from core.security.security import get_admin_user
from infra.db.connection import get_session
from core.models import User, Doctor, Patient 

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard")
async def get_dashboard_stats(
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_admin_user())
):
    # Retornar estatísticas do dashboard
    total_users = session.query(User).filter(User.user_type != UserType.ADMIN).count()
    total_doctors = session.query(Doctor).count()
    total_patients = session.query(Patient).count()
    pending_doctors = session.query(Doctor).filter(
        Doctor.status_approval == False
    ).count()

    return {
        "total_users": total_users,
        "total_doctors": total_doctors,
        "total_patients": total_patients,
        "pending_doctors": pending_doctors
    }