from core.models.users import User
from sqlalchemy.orm import Session

def get_user_by_email(email: str, session: Session) -> User:
    user = session.query(User).filter(User.email == email).first()
    
    return user

def get_user_by_cpf(cpf: str, session: Session) -> User:
    user = session.query(User).filter(User.cpf == cpf).first()
    
    return user
