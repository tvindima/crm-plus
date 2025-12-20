FROM python:3.11-slim

WORKDIR /app/backend

# Copy backend files
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY backend/scripts ./scripts
COPY backend/fix_property_status.py ./
COPY backend/clean_old_media_urls.py ./
COPY backend/alembic ./alembic
COPY backend/alembic.ini ./

# Create media directory
RUN mkdir -p media

# Railway define PORT dinamicamente
ENV PORT=8000
EXPOSE 8000

# Run migrations, fix property status and start server
CMD alembic upgrade head && python fix_property_status.py && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
