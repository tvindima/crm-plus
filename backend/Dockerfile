FROM python:3.11-slim

WORKDIR /app

# Copiar requirements e instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
	&& pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY app ./app
COPY scripts ./scripts
COPY alembic ./alembic
COPY alembic.ini ./
COPY fix_property_status.py ./

# Variável de ambiente para porta
ENV PORT=8000

# Comando de inicialização: apply migrations + start server
CMD alembic upgrade head && \
    python fix_property_status.py && \
    uvicorn app.main:app --host 0.0.0.0 --port $PORT
