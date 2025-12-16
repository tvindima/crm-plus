from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from .models import TaskType, TaskStatus, TaskPriority


# Schemas para o novo sistema de tarefas
class TaskBase(BaseModel):
    """Schema base para tarefas"""
    title: str
    description: Optional[str] = None
    task_type: TaskType
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: datetime
    lead_id: Optional[int] = None
    property_id: Optional[int] = None


class TaskCreate(TaskBase):
    """Schema para criação de tarefa"""
    assigned_agent_id: int  # Obrigatório na criação


class TaskUpdate(BaseModel):
    """Schema para atualização de tarefa"""
    title: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[TaskType] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    lead_id: Optional[int] = None
    property_id: Optional[int] = None
    assigned_agent_id: Optional[int] = None


class TaskComplete(BaseModel):
    """Schema para marcar tarefa como concluída"""
    notes: Optional[str] = None  # Notas ao concluir


class TaskOut(TaskBase):
    """Schema de saída para tarefa"""
    id: int
    status: TaskStatus
    completed_at: Optional[datetime] = None
    assigned_agent_id: int
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    # Informações relacionadas (opcional)
    lead: Optional[dict] = None
    property: Optional[dict] = None
    assigned_agent: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)


class TaskStats(BaseModel):
    """Estatísticas de tarefas"""
    total: int
    pending: int
    in_progress: int
    completed: int
    overdue: int
    today: int
    this_week: int


# Schemas antigos (manter compatibilidade)
class CalendarEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    agent_id: Optional[int] = None


class CalendarEventCreate(CalendarEventBase):
    pass


class CalendarEventUpdate(CalendarEventBase):
    pass


class CalendarEventOut(CalendarEventBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
