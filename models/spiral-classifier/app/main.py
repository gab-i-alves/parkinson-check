import tempfile
import shutil
import os
import traceback
from fastapi import FastAPI, UploadFile, HTTPException, File
from .predictor import predict_all_models

app = FastAPI()


@app.post("/predict/spiral")
async def predict_spiral(image: UploadFile = File(...)):
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            shutil.copyfileobj(image.file, tmp)
            tmp_path = tmp.name

        results, vote_count, majority = predict_all_models(tmp_path)

        return {
            "model_results": results,
            "vote_count": dict(vote_count),
            "majority_decision": majority,
        }

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
    return {"message": "Spiral Classifier is running"}
