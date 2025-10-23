from http import HTTPStatus

from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from backend.core.security.security import get_password_hash
from core.models import Bind, Doctor, Patient, User

from ..enums.bind_enum import BindEnum


def get_user_by_email(email: str, session: Session) -> User:
    user = session.query(User).filter(User.email == email).first()

    return user


def get_user_by_cpf(cpf: str, session: Session) -> User:
    user = session.query(User).filter(User.cpf == cpf).first()

    return user


def get_user_active_binds(session: Session, user: User) -> list[Bind] | None:
    binds = (
        session.query(Bind)
        .filter(
            or_(Bind.patient_id == user.id, Bind.doctor_id == user.id),
            Bind.status == BindEnum.ACTIVE,
        )
        .all()
    )

    return binds


def get_binded_users(user: User, session: Session) -> list[dict[int, Patient | Doctor]]:
    active_binds = get_user_active_binds(session, user)

    if not active_binds:
        raise HTTPException(
            HTTPStatus.BAD_REQUEST, detail="Usuário sem atrelamentos ativos."
        )

    bind_user_pairs = [
        (bind.id, bind.patient_id if bind.doctor_id == user.id else bind.doctor_id)
        for bind in active_binds
    ]

    user_ids = [pair[1] for pair in bind_user_pairs]

    binded_users = session.query(User).filter(User.id.in_(user_ids)).all()
    users_dict = {u.id: u for u in binded_users}

    result: list[dict[int, Patient | Doctor]] = [
        {"bind_id": bind_id, "user": users_dict[user_id]}
        for bind_id, user_id in bind_user_pairs
    ]
    return result

def set_reset_token(user: User, reset_token: str, token_expiry: str, session: Session): 
     db_user = session.query(User).filter(User.id == user.id).first()



     session.add(db_user)
     session.commit()
     session.refresh(db_user)

     
def get_user_by_reset_token(token: str, session: Session) -> User:
    user = session.query(User).filter(User.reset_token == token).first()

    return user

def update_password(user: User, new_password: str, session: Session):
    db_user = session.query(User).filter(User.id == user.id).first()

    db_user.hashed_password = get_password_hash(new_password)
    db_user.reset_token = None
    db_user.reset_token_expiry = None

    session.add(db_user)
    session.commit()
    session.refresh(db_user)
