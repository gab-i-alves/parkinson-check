from http import HTTPStatus

from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from core.models import Bind, Doctor, Patient, User

from ..enums.bind_enum import BindEnum


def get_user_by_email(email: str, session: Session) -> User:
    user = session.query(User).filter(User.email == email).first()

    return user


def get_user_by_cpf(cpf: str, session: Session) -> User:
    user = session.query(User).filter(User.cpf == cpf).first()

    return user


def get_user_active_binds(user: User, session: Session) -> list[Bind] | None:
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
    active_binds = get_user_active_binds(user, session)

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
