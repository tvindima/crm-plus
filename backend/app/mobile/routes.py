"""
Rotas API para aplicação móvel - Agentes Editores
Endpoints otimizados para app mobile com permissões completas de agente
"""
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, func
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.security import get_current_user
from app.users.models import User, UserRole

# Importar modelos e schemas
from app.properties.models import Property, PropertyStatus
from app.properties import schemas as property_schemas
from app.agents.models import Agent
from app.agents import schemas as agent_schemas
from app.leads.models import Lead, LeadStatus
from app.leads import schemas as lead_schemas
from app.calendar.models import Task, TaskStatus
from app.calendar import schemas as task_schemas
from app.core.storage import storage

router = APIRouter(prefix="/mobile", tags=["Mobile App"])


# =====================================================
# AUTHENTICATION & PROFILE
# =====================================================

@router.get("/auth/me", response_model=dict)
def get_mobile_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obter perfil completo do agente para app mobile
    Inclui informações do usuário e dados do agente associado
    """
    agent_data = None
    if current_user.agent_id:
        agent = db.query(Agent).filter(Agent.id == current_user.agent_id).first()
        if agent:
            agent_data = {
                "id": agent.id,
                "name": agent.name,
                "email": agent.email,
                "phone": agent.phone,
                "photo": agent.photo,
                "avatar_url": agent.avatar_url,
                "license_ami": agent.license_ami,
                "whatsapp": agent.whatsapp,
            }
    
    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role,
            "avatar_url": current_user.avatar_url,
            "phone": current_user.phone,
            "is_active": current_user.is_active,
        },
        "agent": agent_data,
        "permissions": {
            "can_create_property": True,
            "can_edit_property": True,
            "can_delete_property": current_user.role in [UserRole.ADMIN.value, UserRole.COORDINATOR.value],
            "can_manage_leads": True,
            "can_manage_tasks": True,
            "can_upload_photos": True,
            "can_update_status": True,
        }
    }


# =====================================================
# PROPERTIES - CRUD COMPLETO
# =====================================================

@router.get("/properties", response_model=List[property_schemas.PropertyOut])
def list_mobile_properties(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    business_type: Optional[str] = None,
    property_type: Optional[str] = None,
    search: Optional[str] = None,
    my_properties: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Listar propriedades para app mobile
    - Suporta filtros por status, tipo, busca
    - Opção de mostrar apenas propriedades do agente (my_properties=true)
    """
    query = db.query(Property)
    
    # Filtrar apenas propriedades do agente atual
    if my_properties and current_user.agent_id:
        query = query.filter(Property.agent_id == current_user.agent_id)
    
    # Filtros
    if status:
        query = query.filter(Property.status == status)
    if business_type:
        query = query.filter(Property.business_type == business_type)
    if property_type:
        query = query.filter(Property.property_type == property_type)
    
    # Busca por texto
    if search:
        query = query.filter(
            or_(
                Property.reference.ilike(f"%{search}%"),
                Property.location.ilike(f"%{search}%"),
                Property.municipality.ilike(f"%{search}%"),
                Property.description.ilike(f"%{search}%"),
            )
        )
    
    # Ordenar por mais recentes
    query = query.order_by(desc(Property.created_at))
    
    return query.offset(skip).limit(limit).all()


@router.get("/properties/{property_id}", response_model=property_schemas.PropertyOut)
def get_mobile_property(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter detalhes de uma propriedade"""
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Propriedade não encontrada")
    return property


@router.post("/properties", response_model=property_schemas.PropertyOut, status_code=201)
def create_mobile_property(
    property: property_schemas.PropertyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Criar nova propriedade via app mobile
    Atribui automaticamente ao agente atual
    """
    # Atribuir ao agente do usuário atual
    property_data = property.dict()
    if current_user.agent_id:
        property_data['agent_id'] = current_user.agent_id
    
    new_property = Property(**property_data)
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    
    return new_property


@router.put("/properties/{property_id}", response_model=property_schemas.PropertyOut)
def update_mobile_property(
    property_id: int,
    property_update: property_schemas.PropertyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atualizar propriedade via app mobile
    Agentes só podem editar suas próprias propriedades
    Admin/Coordenador podem editar qualquer uma
    """
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Propriedade não encontrada")
    
    # Verificar permissões
    if current_user.role == UserRole.AGENT.value:
        if property.agent_id != current_user.agent_id:
            raise HTTPException(
                status_code=403, 
                detail="Você só pode editar suas próprias propriedades"
            )
    
    # Atualizar campos
    for field, value in property_update.dict(exclude_unset=True).items():
        setattr(property, field, value)
    
    property.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(property)
    
    return property


@router.patch("/properties/{property_id}/status")
def update_property_status_mobile(
    property_id: int,
    status: PropertyStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar rapidamente o status de uma propriedade"""
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Propriedade não encontrada")
    
    # Verificar permissões
    if current_user.role == UserRole.AGENT.value:
        if property.agent_id != current_user.agent_id:
            raise HTTPException(status_code=403, detail="Sem permissão")
    
    property.status = status.value
    property.updated_at = datetime.utcnow()
    db.commit()
    
    return {"success": True, "status": property.status}


@router.post("/properties/{property_id}/photos/upload")
async def upload_property_photo_mobile(
    property_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload de foto de propriedade via app mobile
    Otimizado para uploads mobile com validação de tamanho
    """
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Propriedade não encontrada")
    
    # Verificar permissões
    if current_user.role == UserRole.AGENT.value:
        if property.agent_id != current_user.agent_id:
            raise HTTPException(status_code=403, detail="Sem permissão")
    
    # Validar tipo de arquivo
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=415, detail="Apenas imagens são permitidas")
    
    # Validar tamanho (máx 10MB para mobile)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Imagem muito grande (máx 10MB)")
    
    try:
        # Upload para storage (Cloudinary)
        file_key = f"properties/{property_id}/{file.filename}"
        url = storage.upload_file(content, file_key, content_type=file.content_type)
        
        # Adicionar URL às fotos da propriedade
        if property.photos:
            photos_list = property.photos.split(',') if isinstance(property.photos, str) else []
            photos_list.append(url)
            property.photos = ','.join(photos_list)
        else:
            property.photos = url
        
        property.updated_at = datetime.utcnow()
        db.commit()
        
        return {
            "success": True,
            "url": url,
            "property_id": property_id,
            "total_photos": len(property.photos.split(',')) if property.photos else 1
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no upload: {str(e)}")


# =====================================================
# LEADS - GESTÃO COMPLETA
# =====================================================

@router.get("/leads", response_model=List[lead_schemas.LeadOut])
def list_mobile_leads(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    my_leads: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Listar leads para app mobile
    Por padrão mostra apenas leads do agente (my_leads=true)
    """
    query = db.query(Lead)
    
    # Filtrar leads do agente atual
    if my_leads and current_user.agent_id:
        query = query.filter(Lead.assigned_agent_id == current_user.agent_id)
    
    # Filtro por status
    if status:
        query = query.filter(Lead.status == status)
    
    # Ordenar por mais recentes/urgentes
    query = query.order_by(desc(Lead.created_at))
    
    return query.offset(skip).limit(limit).all()


@router.get("/leads/{lead_id}", response_model=lead_schemas.LeadOut)
def get_mobile_lead(
    lead_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter detalhes de um lead"""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    
    # Verificar se o lead pertence ao agente
    if current_user.role == UserRole.AGENT.value:
        if lead.assigned_agent_id != current_user.agent_id:
            raise HTTPException(status_code=403, detail="Sem permissão")
    
    return lead


@router.patch("/leads/{lead_id}/status")
def update_lead_status_mobile(
    lead_id: int,
    status: LeadStatus,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar status de um lead"""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    
    # Verificar permissões
    if current_user.role == UserRole.AGENT.value:
        if lead.assigned_agent_id != current_user.agent_id:
            raise HTTPException(status_code=403, detail="Sem permissão")
    
    lead.status = status.value
    if notes:
        lead.notes = notes
    lead.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"success": True, "status": lead.status}


@router.post("/leads/{lead_id}/contact")
def register_lead_contact_mobile(
    lead_id: int,
    contact_type: str = Query(..., description="Tipo: call, email, whatsapp, visit"),
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Registrar contacto com lead
    Útil para histórico de interações
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    
    # Verificar permissões
    if current_user.role == UserRole.AGENT.value:
        if lead.assigned_agent_id != current_user.agent_id:
            raise HTTPException(status_code=403, detail="Sem permissão")
    
    # Registrar última interação
    lead.last_contact_date = datetime.utcnow()
    if notes:
        current_notes = lead.notes or ""
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        lead.notes = f"{current_notes}\n[{timestamp}] {contact_type.upper()}: {notes}"
    
    lead.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "success": True,
        "lead_id": lead_id,
        "contact_type": contact_type,
        "last_contact": lead.last_contact_date
    }


# =====================================================
# TASKS - GESTÃO DE TAREFAS
# =====================================================

@router.get("/tasks", response_model=List[task_schemas.TaskOut])
def list_mobile_tasks(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    my_tasks: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Listar tarefas para app mobile
    Por padrão mostra apenas tarefas do agente
    """
    query = db.query(Task)
    
    # Filtrar tarefas do agente atual
    if my_tasks and current_user.agent_id:
        query = query.filter(Task.agent_id == current_user.agent_id)
    
    # Filtro por status
    if status:
        query = query.filter(Task.status == status)
    
    # Ordenar por data de vencimento
    query = query.order_by(Task.due_date.asc())
    
    return query.offset(skip).limit(limit).all()


@router.get("/tasks/today")
def get_tasks_today_mobile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter tarefas de hoje - widget para app mobile"""
    if not current_user.agent_id:
        return {"tasks": [], "count": 0}
    
    today = datetime.utcnow().date()
    
    tasks = db.query(Task).filter(
        and_(
            Task.agent_id == current_user.agent_id,
            func.date(Task.due_date) == today,
            Task.status != TaskStatus.COMPLETED.value
        )
    ).order_by(Task.due_date).all()
    
    return {
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "due_date": t.due_date,
                "status": t.status,
                "priority": t.priority,
            }
            for t in tasks
        ],
        "count": len(tasks),
        "date": today.isoformat()
    }


@router.post("/tasks", response_model=task_schemas.TaskOut, status_code=201)
def create_mobile_task(
    task: task_schemas.TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Criar nova tarefa via app mobile"""
    task_data = task.dict()
    
    # Atribuir ao agente atual se não especificado
    if not task_data.get('agent_id') and current_user.agent_id:
        task_data['agent_id'] = current_user.agent_id
    
    new_task = Task(**task_data)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    return new_task


@router.patch("/tasks/{task_id}/status")
def update_task_status_mobile(
    task_id: int,
    status: TaskStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar status de tarefa"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    
    # Verificar permissões
    if current_user.role == UserRole.AGENT.value:
        if task.agent_id != current_user.agent_id:
            raise HTTPException(status_code=403, detail="Sem permissão")
    
    task.status = status.value
    if status == TaskStatus.COMPLETED:
        task.completed_at = datetime.utcnow()
    
    task.updated_at = datetime.utcnow()
    db.commit()
    
    return {"success": True, "status": task.status}


# =====================================================
# DASHBOARD & STATS
# =====================================================

@router.get("/dashboard/stats")
def get_mobile_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Estatísticas do dashboard para app mobile
    Dados resumidos do agente
    """
    if not current_user.agent_id:
        return {
            "properties": 0,
            "leads": 0,
            "tasks_pending": 0,
            "tasks_today": 0,
        }
    
    # Total de propriedades do agente
    properties_count = db.query(Property).filter(
        Property.agent_id == current_user.agent_id
    ).count()
    
    # Total de leads ativos
    leads_count = db.query(Lead).filter(
        and_(
            Lead.assigned_agent_id == current_user.agent_id,
            Lead.status.in_([LeadStatus.NEW.value, LeadStatus.CONTACTED.value, LeadStatus.QUALIFIED.value])
        )
    ).count()
    
    # Tarefas pendentes
    tasks_pending = db.query(Task).filter(
        and_(
            Task.agent_id == current_user.agent_id,
            Task.status != TaskStatus.COMPLETED.value
        )
    ).count()
    
    # Tarefas de hoje
    today = datetime.utcnow().date()
    tasks_today = db.query(Task).filter(
        and_(
            Task.agent_id == current_user.agent_id,
            func.date(Task.due_date) == today,
            Task.status != TaskStatus.COMPLETED.value
        )
    ).count()
    
    return {
        "properties": properties_count,
        "leads": leads_count,
        "tasks_pending": tasks_pending,
        "tasks_today": tasks_today,
        "agent_id": current_user.agent_id,
    }


@router.get("/dashboard/recent-activity")
def get_mobile_recent_activity(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atividade recente do agente
    Últimas propriedades, leads e tarefas
    """
    if not current_user.agent_id:
        return {"recent_properties": [], "recent_leads": [], "recent_tasks": []}
    
    # Últimas propriedades
    recent_properties = db.query(Property).filter(
        Property.agent_id == current_user.agent_id
    ).order_by(desc(Property.created_at)).limit(5).all()
    
    # Últimos leads
    recent_leads = db.query(Lead).filter(
        Lead.assigned_agent_id == current_user.agent_id
    ).order_by(desc(Lead.created_at)).limit(5).all()
    
    # Últimas tarefas
    recent_tasks = db.query(Task).filter(
        Task.agent_id == current_user.agent_id
    ).order_by(desc(Task.created_at)).limit(5).all()
    
    return {
        "recent_properties": [
            {
                "id": p.id,
                "reference": p.reference,
                "location": p.location,
                "price": p.price,
                "status": p.status,
                "created_at": p.created_at,
            }
            for p in recent_properties
        ],
        "recent_leads": [
            {
                "id": l.id,
                "name": l.name,
                "email": l.email,
                "phone": l.phone,
                "status": l.status,
                "created_at": l.created_at,
            }
            for l in recent_leads
        ],
        "recent_tasks": [
            {
                "id": t.id,
                "title": t.title,
                "due_date": t.due_date,
                "status": t.status,
                "priority": t.priority,
            }
            for t in recent_tasks
        ]
    }
