FROM python:3.13-slim

RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    libgl1 \
    libglib2.0-0

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]