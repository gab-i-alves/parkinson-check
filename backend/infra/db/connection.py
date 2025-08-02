from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from ..settings import Settings

engine = create_engine(Settings().DATABASE_URL)

@contextmanager
def get_session():
    with Session(engine) as session:
        yield session
        
def get_dependency_session():
    with get_session() as session:
        try:
            yield session
        finally:
            session.close() 