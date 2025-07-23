from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from ..settings import Settings


engine = create_engine(Settings().DATABASE_URI)

@contextmanager
def get_session():
    with Session(engine) as session:
        yield session