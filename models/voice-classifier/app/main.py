import tempfile
import shutil
import os
import traceback
from fastapi import FastAPI, UploadFile, HTTPException, File
from .predictor import predict_audio

app = FastAPI()


@app.post("/predict/voice")
async def predict_voice_endpoint(audio: UploadFile = File(...)):
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            shutil.copyfileobj(audio.file, tmp)
            tmp_path = tmp.name

        result = predict_audio(tmp_path)

        return result

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Erro interno no servidor: {str(e)}"
        )

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.get("/")
def read_root():
    return {"message": "Voice Classifier is running"}
