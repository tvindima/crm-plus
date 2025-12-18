# Import all models to ensure they are registered with SQLAlchemy Base
# Ordem de importação importa para evitar circular references
from app.properties.models import Property
from app.agents.models import Agent
from app.leads.models import Lead  # Lead precisa vir depois de Agent
from app.calendar.models import Task  # Task precisa vir depois de Lead, Property e Agent
from app.models.visit import Visit  # Visit precisa vir depois de Property, Lead e Agent

__all__ = ["Agent", "Property", "Lead", "Task", "Visit"]
