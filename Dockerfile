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

# Run migrations via psql if PostgreSQL, then seed and start server
CMD if [ -n "$DATABASE_URL" ]; then \
        echo "[INIT] Running PostgreSQL migrations..."; \
        python -c "import os; url=os.environ['DATABASE_URL']; print(url)" | grep -q postgres && \
        (apt-get update -qq && apt-get install -y -qq postgresql-client > /dev/null 2>&1 || true) && \
        PGPASSWORD=$(python -c "from urllib.parse import urlparse; import os; u=urlparse(os.environ['DATABASE_URL']); print(u.password)") \
        psql "$(python -c "import os; print(os.environ['DATABASE_URL'].replace('postgres://', 'postgresql://'))")" -f migrate_schema.sql || echo "[WARN] Migration failed"; \
    fi && \
    python seed_postgres.py && \
    uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
