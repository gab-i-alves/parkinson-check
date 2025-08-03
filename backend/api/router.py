from fastapi import APIRouter
from . import auth, register, user

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(register.router)
api_router.include_router(user.router)