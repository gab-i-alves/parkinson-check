import os
import subprocess
import tempfile

from fastapi import UploadFile


def convert_webm_to_wav(upload_file: UploadFile) -> str:
    """
    Converte um arquivo WebM (upload do frontend) em WAV (16kHz mono)
    usando ffmpeg. Retorna o caminho para o arquivo WAV temporário.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_webm:
        upload_file.file.seek(0)
        temp_webm.write(upload_file.file.read())
        temp_webm_path = temp_webm.name

    temp_wav_path = temp_webm_path.replace(".webm", ".wav")

    try:
        # command = [
        #     "ffmpeg",
        #     "-y",
        #     "-i",
        #     temp_webm_path,
        #     "-ar",
        #     "16000",
        #     "-ac",
        #     "1",
        #     temp_wav_path,
        # ]
        # result = subprocess.run(
        #     command,
        #     check=True,
        #     capture_output=True,
        #     text=True
        # )
        return temp_wav_path
    except subprocess.CalledProcessError as e:
        print(f"Erro do FFMPEG: {e.stderr}")
        raise RuntimeError(f"Erro ao converter áudio: {e.stderr}")
    finally:
        if os.path.exists(temp_webm_path):
            os.remove(temp_webm_path)
