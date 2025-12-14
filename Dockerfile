FROM python:3.11-slim

WORKDIR /app

# Copiar todo o repositório
COPY . .

# Move to backend directory
WORKDIR /app/backend

# Copy test.db to app/ folder so database.py can find it
RUN cp -v test.db app/test.db || echo "Warning: Could not copy test.db to app/"

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && mkdir -p media \
    && echo "=== Verifying test.db locations ===" \
    && ls -lh test.db app/test.db 2>/dev/null || echo "Missing test.db!" \
    && echo "=== test.db check complete ==="

# Railway define PORT dinamicamente
EXPOSE 8000

# Start server (init_db will verify on startup)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
