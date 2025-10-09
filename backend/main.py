from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.router import api_router
from infra.settings import settings

app = FastAPI(title="ParkinsonCheck API")

origins = [
    "https://parkinson.gabi-alves.com",
]

if settings.ENVIRONMENT != "production":
    origins.append("http://localhost:4200")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do ParkinsonCheck!"}
