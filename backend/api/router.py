from fastapi import APIRouter

from .routes import auth, binding, register, tests, user, note, notification, statistics, doctor_dashboard

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(register.router)
api_router.include_router(binding.router)
api_router.include_router(user.router)
api_router.include_router(tests.router)
api_router.include_router(note.router)
api_router.include_router(notification.router)
api_router.include_router(statistics.router)
api_router.include_router(doctor_dashboard.router)
