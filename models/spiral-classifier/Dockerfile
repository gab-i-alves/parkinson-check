# Usar a versão do Python compatível com os modelos
FROM python:3.13-slim

# Instalar as dependências do sistema necessárias
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]