from fastapi import APIRouter

from .routes import auth, binding, register, tests, user

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(register.router)
api_router.include_router(binding.router)
api_router.include_router(user.router)
api_router.include_router(tests.router)
