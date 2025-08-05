from core.models.users import Address
from infra.db.connection import get_session
from sqlalchemy.orm import Session
from fastapi import HTTPException
from http import HTTPStatus

def get_similar_address(cep: str, number: str, complement: str):
    with get_session() as session:
        return session.query(Address).filter(Address.cep == cep and Address.number == number and Address.complement == complement).first()
    
def create_address(cep: str, street: str, number: str, complement: str | None , neighborhood: str, city: str, state: str, session: Session):
        if get_similar_address(cep, number, complement) is not None:
            raise HTTPException(HTTPStatus.CONFLICT, detail="Endereço já existente")

        db_address = Address(
            cep=cep,
            street=street,
            number=number,
            complement=complement,
            neighborhood=neighborhood,
            city=city,
            state=state
        )
    
        session.add(db_address)
        session.commit()
        session.refresh(db_address)
        return True