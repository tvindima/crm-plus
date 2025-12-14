from celery import Celery
import os

celery_app = Celery(
    "tasks",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0")
)

@celery_app.task
def processamento_ia(payload):
    # Implementa lógica da IA aqui...
    return {"ok": True}
