from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import api_router
from infra.db.connection import get_session

app = FastAPI(title="ParkinsonCheck API")

origins = [
    "https://parkinson.gabi-alves.com",  # frontend on railway
    "http://localhost:4200"              # local development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\.gabi-alves\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do ParkinsonCheck!"} 