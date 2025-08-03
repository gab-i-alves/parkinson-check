from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import api_router
from infra.db.connection import get_session

app = FastAPI(title="ParkinsonCheck API")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(api_router)

try:
    db = get_session()
    print("Banco de dados conectado")
except Exception as e:
    print(f"Erro ao conectar com o DB {e}")

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do ParkinsonCheck!"} 