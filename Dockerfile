FROM python:3.11-slim

WORKDIR /app

# Copiar todo o repositório (inclui backend e test.db)
COPY . .

# Instalar dependências do backend
WORKDIR /app/backend
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && mkdir -p media \
    && ls -lh test.db

# Railway define PORT dinamicamente
EXPOSE 8000

# Verificar se test.db existe antes de iniciar
CMD sh -c "ls -lh test.db && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
