from http import HTTPStatus
from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from api.schemas.users import AdminResponse, AdminSchema
from core.enums.user_enum import UserType
from core.models.users import Admin
from core.security.security import get_password_hash
from core.services import address_service, user_service


def create_admin(admin: AdminSchema, session: Session):
    if user_service.get_user_by_email(admin.email, session) is not None:
        raise HTTPException(
            HTTPStatus.CONFLICT, detail="Já existe um usuário com o email informado."
        )

    if user_service.get_user_by_cpf(admin.cpf, session) is not None:
        raise HTTPException(HTTPStatus.CONFLICT, detail="O CPF informado já está em uso.")

    address = address_service.get_similar_address(
        admin.cep, admin.number, admin.complement, session
    )

    if address is None:
        address_service.create_address(
            admin.cep,
            admin.street,
            admin.number,
            admin.complement,
            admin.neighborhood,
            admin.city,
            admin.state,
            session,
        )
        address = address_service.get_similar_address(
            admin.cep, admin.number, admin.complement, session
        )

    db_admin = Admin(
        name=admin.fullname,
        cpf=admin.cpf,
        email=admin.email,
        hashed_password=get_password_hash(admin.password),
        birthdate=admin.birthdate,
        gender=admin.gender,
        user_type=UserType.ADMIN,
        address_id=address.id,
        is_superuser=True,
    )

    session.add(db_admin)
    session.commit()
    session.refresh(db_admin)
    return admin

def get_all_admins(session: Session) -> list[AdminResponse]:
    admin_query = session.query(Admin).options(joinedload(admin_query.address))

    admins = admin_query.all()

    if not admins:
        raise HTTPException(
            HTTPStatus.NOT_FOUND,
            detail="Não foram encontrados administradores",
        )

    admin_list = []

    for adm in admins:
        admin_list.append(
            AdminResponse(
                id=adm.id,
                name=adm.name,
                email=adm.email,
                role=UserType.ADMIN,
                is_superuser=adm.is_superuser
            )
        )

    return admin_list

def update_admin_status(admin_id: int, is_active: bool, session: Session)-> AdminResponse:
    db_admin = session.query(Admin).filter(Admin.id == admin_id).first()

    if not db_admin:
        raise HTTPException(HTTPStatus.NOT_FOUND, detail="Nota não encontrada.")
    

    db_admin.is_superuser = is_active

    session.add(db_admin)
    session.commit()
    session.refresh(db_admin)
    
    admin = (
        session.query(Admin)
        .filter(Admin.id == db_admin.id)
        .first()
    )

    return admin
