from sqlalchemy import or_
from core.models import User, Bind, Doctor, Patient
from sqlalchemy.orm import Session
from ..enums.user_enum import UserType
from fastapi import HTTPException
from http import HTTPStatus
from ..enums.bind_enum import BindEnum

def get_user_by_email(email: str, session: Session) -> User:
    user = session.query(User).filter(User.email == email).first()
    
    return user

def get_user_by_cpf(cpf: str, session: Session) -> User:
    user = session.query(User).filter(User.cpf == cpf).first()
    
    return user

def get_user_active_binds(user: User, session: Session) -> list[Bind] | None:
    binds = session.query(Bind).filter(
        or_(
            Bind.patient_id == user.id,
            Bind.doctor_id == user.id
        ),
        Bind.status == BindEnum.ACTIVE
    ).all()
    
    return binds

def get_binded_users(user: User, session: Session) -> list[Patient | Doctor]:
    active_binds = get_user_active_binds(user, session)
    
    if not active_binds:
        raise HTTPException(HTTPStatus.BAD_REQUEST, detail="Usuário sem atrelamentos ativos.")
     
    users_ids = [
        bind.patient_id if bind.doctor_id == user.id else bind.doctor_id
        for bind in active_binds
    ]   
        
    binded_users = session.query(User).filter(User.id.in_(users_ids)).all()
    
    return binded_users


