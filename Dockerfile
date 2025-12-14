FROM python:3.11-slim

WORKDIR /app

# Copiar todo o repositório (inclui backend e test.db)
COPY . .

# Instalar dependências do backend
WORKDIR /app/backend
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && mkdir -p media \
    && echo "=== Verifying test.db ===" \
    && ls -lh test.db \
    && sqlite3 test.db "SELECT COUNT(*) FROM properties;" || echo "No properties table yet" \
    && echo "=== test.db ready ==="

# Railway define PORT dinamicamente
EXPOSE 8000

# Run database init then start server
CMD python init_db.py && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
