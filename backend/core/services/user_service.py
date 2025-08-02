from core.models.users import User
from infra.db.connection import get_session

def get_user_by_email(email: str):
    with get_session() as session:
        return session.query(User).filter(User.email == email).first()