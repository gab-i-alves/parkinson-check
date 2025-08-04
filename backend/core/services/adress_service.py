from core.models.users import Adress
from infra.db.connection import get_session
from sqlalchemy.orm import Session
from fastapi import HTTPException
from http import HTTPStatus

def get_similar_adress(cep: str, number: str, complement: str):
    with get_session() as session:
        return session.query(Adress).filter(Adress.cep == cep and Adress.number == number and Adress.complement == complement).first()
    
def create_adress(cep: str, street: str, number: str, complement: str | None , neighborhood: str, city: str, state: str, session: Session):
        if get_similar_adress(cep, number, complement) is not None:
            raise HTTPException(HTTPStatus.CONFLICT, detail="Endereço já existente")

        db_adress = Adress(
            cep=cep,
            street=street,
            number=number,
            complement=complement,
            neighborhood=neighborhood,
            city=city,
            state=state
        )
    
        session.add(db_adress)
        session.commit()
        session.refresh(db_adress)
        return True