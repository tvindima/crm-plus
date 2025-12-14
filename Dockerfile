FROM python:3.11-slim

WORKDIR /app

# Copiar todo o repositório (inclui backend e test.db)
COPY . .

# Instalar dependências do backend
WORKDIR /app/backend
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && mkdir -p media

# Railway/Vercel definen PORT
EXPOSE 8000

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
