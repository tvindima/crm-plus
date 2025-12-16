FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
	&& pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY scripts ./scripts
COPY fix_property_status.py ./
ENV PORT=8000
CMD python fix_property_status.py && uvicorn app.main:app --host 0.0.0.0 --port 8000
