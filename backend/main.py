from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.user import router as user_router

app = FastAPI(title="ParkinsonCheck API")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(user_router)

@app.get("/api")
def read_root():
    return {"message": "Bem-vindo à API do ParkinsonCheck!"} 