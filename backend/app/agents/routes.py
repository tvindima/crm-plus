from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import services, schemas
from app.database import get_db

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("/", response_model=list[schemas.AgentOut])
def list_agents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_agents(db, skip=skip, limit=limit)


@router.get("/{agent_id}", response_model=schemas.AgentOut)
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = services.get_agent(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("/", response_model=schemas.AgentOut, status_code=201)
def create_agent(agent: schemas.AgentCreate, db: Session = Depends(get_db)):
    return services.create_agent(db, agent)


@router.put("/{agent_id}", response_model=schemas.AgentOut)
def update_agent(agent_id: int, agent_update: schemas.AgentUpdate, db: Session = Depends(get_db)):
    agent = services.update_agent(db, agent_id, agent_update)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.delete("/{agent_id}", response_model=schemas.AgentOut)
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = services.delete_agent(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent
