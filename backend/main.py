from fastapi import FastAPI

app = FastAPI(title="ParkinsonCheck API")

@app.get("/api")
def read_root():
    return {"message": "Bem-vindo à API do ParkinsonCheck!"} 