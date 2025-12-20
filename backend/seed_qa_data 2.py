"""
Seed Data Generator para QA Testing
Cria dados fake realistas para testar Mobile App

Uso:
    python seed_qa_data.py --reset  # Limpa e cria dados novos
    python seed_qa_data.py          # Apenas adiciona dados
"""
import os
import sys
from datetime import datetime, timedelta
import random

# Adicionar path do backend para imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.database import SessionLocal
from app.properties.models import Property
from app.leads.models import Lead, LeadStatus
from app.calendar.models import Visit, VisitStatus, Task, TaskStatus
from app.agents.models import Agent
from app.users.models import User, UserRole

# =====================================================
# DADOS FAKE REALISTAS
# =====================================================

PROPERTY_ADDRESSES = [
    "Av. da Liberdade, 123, Lisboa",
    "Rua de Santa Catarina, 456, Porto",
    "Rua das Flores, 78, Coimbra",
    "Av. Beira-Mar, 910, Faro",
    "Praça do Comércio, 11, Lisboa",
    "Rua do Almada, 222, Porto",
    "Av. João II, 333, Lisboa",
    "Rua de Cedofeita, 444, Porto",
]

PROPERTY_TITLES = [
    "Apartamento T2 Moderno com Varanda",
    "Moradia T3 com Piscina e Jardim",
    "Apartamento T1 Renovado no Centro",
    "Moradia T4 de Luxo Vista Mar",
    "Estúdio com Terraço Privativo",
    "Apartamento T3 Duplex com Garagem",
    "Moradia Geminada T2 em Condomínio Fechado",
    "Penthouse T4 com Vista Panorâmica",
]

LEAD_NAMES = [
    "João Silva", "Maria Santos", "Pedro Costa", "Ana Rodrigues",
    "Carlos Ferreira", "Sofia Almeida", "Miguel Oliveira", "Beatriz Pereira",
    "Rui Martins", "Catarina Sousa", "Tiago Fernandes", "Inês Carvalho",
]

LEAD_SOURCES = ["Website", "Facebook", "Instagram", "Referência", "Google Ads", "Telefone"]

VISIT_NOTES_TEMPLATES = [
    "Cliente muito interessado. Quer agendar 2ª visita.",
    "Preocupado com o preço. Pediu desconto.",
    "Gostou bastante da localização e acabamentos.",
    "Quer ver mais opções antes de decidir.",
    "Pronto para avançar. A aguardar aprovação de crédito.",
]

TASK_TITLES_TEMPLATES = [
    "Enviar proposta formal ao cliente",
    "Verificar documentação da propriedade",
    "Agendar visita de follow-up",
    "Preparar comparativo de mercado",
    "Contactar cliente para feedback",
]


# =====================================================
# FUNÇÕES SEED
# =====================================================

def create_test_agent(db: SessionLocal) -> Agent:
    """Cria agente de teste (ou usa existente)"""
    # Verificar se já existe agent com email teste
    test_user = db.query(User).filter(User.email == "agente.teste@crmplus.com").first()
    
    if test_user and test_user.agent_id:
        agent = db.query(Agent).filter(Agent.id == test_user.agent_id).first()
        print(f"✅ Agente de teste já existe: {agent.name} (ID: {agent.id})")
        return agent
    
    # Criar novo agente
    agent = Agent(
        name="Agente Teste QA",
        email="agente.teste@crmplus.com",
        phone="+351 912 345 678",
        bio="Agente imobiliário de teste para QA",
        commission_rate=3.0,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    
    # Criar user associado
    import bcrypt
    hashed_password = bcrypt.hashpw("teste123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    user = User(
        email="agente.teste@crmplus.com",
        hashed_password=hashed_password,
        full_name="Agente Teste QA",
        role=UserRole.AGENT.value,
        agent_id=agent.id,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    
    print(f"✅ Agente criado: {agent.name} (ID: {agent.id})")
    print(f"   📧 Login: agente.teste@crmplus.com / teste123")
    
    return agent


def seed_properties(db: SessionLocal, agent: Agent, count: int = 10):
    """Cria propriedades fake"""
    print(f"\n🏠 A criar {count} propriedades...")
    
    properties = []
    for i in range(count):
        prop = Property(
            reference=f"REF-QA-{1000 + i}",
            title=random.choice(PROPERTY_TITLES),
            description=f"Propriedade de teste QA número {i+1}. Excelente oportunidade de investimento.",
            address=random.choice(PROPERTY_ADDRESSES),
            location=random.choice(["Lisboa", "Porto", "Coimbra", "Faro"]),
            price=random.randint(150000, 800000),
            bedrooms=random.randint(1, 5),
            bathrooms=random.randint(1, 4),
            area=random.randint(50, 300),
            property_type=random.choice(["Apartamento", "Moradia", "Estúdio"]),
            status=random.choice(["available", "reserved", "sold"]),
            agent_id=agent.id,
            is_published=True,
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 90))
        )
        db.add(prop)
        properties.append(prop)
    
    db.commit()
    print(f"✅ {len(properties)} propriedades criadas")
    
    return properties


def seed_leads(db: SessionLocal, agent: Agent, properties: list, count: int = 15):
    """Cria leads fake"""
    print(f"\n👥 A criar {count} leads...")
    
    leads = []
    statuses = [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED, 
                LeadStatus.VISIT_SCHEDULED, LeadStatus.NEGOTIATING]
    
    for i in range(count):
        # Algumas leads com property_id, outras sem
        property_id = random.choice(properties).id if random.random() > 0.3 else None
        
        lead = Lead(
            name=random.choice(LEAD_NAMES),
            email=f"lead{i+1}@example.com",
            phone=f"+351 9{random.randint(10000000, 99999999)}",
            source=random.choice(LEAD_SOURCES),
            notes=f"Lead de teste QA número {i+1}. Interessado em propriedades na zona.",
            property_id=property_id,
            assigned_agent_id=agent.id,
            status=random.choice(statuses).value,
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60))
        )
        db.add(lead)
        leads.append(lead)
    
    db.commit()
    print(f"✅ {len(leads)} leads criados")
    
    return leads


def seed_visits(db: SessionLocal, agent: Agent, properties: list, leads: list, count: int = 20):
    """Cria visitas fake (passadas, hoje, futuras)"""
    print(f"\n📅 A criar {count} visitas...")
    
    visits = []
    now = datetime.utcnow()
    
    for i in range(count):
        # Mix de visitas passadas, hoje e futuras
        if i < count // 3:
            # Passadas (últimos 30 dias)
            scheduled_date = now - timedelta(days=random.randint(1, 30), hours=random.randint(9, 18))
            status = random.choice([VisitStatus.COMPLETED, VisitStatus.CANCELLED])
        elif i < 2 * count // 3:
            # Hoje ou próximos 2 dias
            scheduled_date = now + timedelta(hours=random.randint(1, 48))
            status = VisitStatus.SCHEDULED
        else:
            # Futuras (próximos 30 dias)
            scheduled_date = now + timedelta(days=random.randint(3, 30), hours=random.randint(9, 18))
            status = VisitStatus.SCHEDULED
        
        # Selecionar property e lead aleatórios
        property = random.choice(properties)
        lead = random.choice([l for l in leads if l.property_id == property.id] or leads)
        
        visit = Visit(
            property_id=property.id,
            lead_id=lead.id,
            agent_id=agent.id,
            scheduled_date=scheduled_date,
            scheduled_at=scheduled_date,  # Compatibilidade
            duration=random.choice([30, 45, 60, 90]),
            notes=random.choice(VISIT_NOTES_TEMPLATES),
            status=status.value,
            created_at=now - timedelta(days=random.randint(1, 60))
        )
        
        # Se concluída, adicionar check-in/check-out
        if status == VisitStatus.COMPLETED:
            visit.check_in_time = scheduled_date
            visit.check_out_time = scheduled_date + timedelta(minutes=visit.duration)
            visit.client_showed_up = random.choice([True, False])
        
        db.add(visit)
        visits.append(visit)
    
    db.commit()
    print(f"✅ {len(visits)} visitas criadas")
    
    return visits


def seed_tasks(db: SessionLocal, agent: Agent, properties: list, leads: list, count: int = 15):
    """Cria tasks fake"""
    print(f"\n✅ A criar {count} tarefas...")
    
    tasks = []
    now = datetime.utcnow()
    priorities = ["baixa", "média", "alta"]
    statuses = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]
    
    for i in range(count):
        # Mix de tasks vencidas, hoje, futuras
        if i < count // 3:
            due_date = now - timedelta(days=random.randint(1, 7))  # Vencidas
            status = random.choice([TaskStatus.PENDING, TaskStatus.COMPLETED])
        elif i < 2 * count // 3:
            due_date = now + timedelta(hours=random.randint(1, 24))  # Hoje
            status = random.choice([TaskStatus.PENDING, TaskStatus.IN_PROGRESS])
        else:
            due_date = now + timedelta(days=random.randint(1, 14))  # Futuras
            status = TaskStatus.PENDING
        
        task = Task(
            title=random.choice(TASK_TITLES_TEMPLATES),
            description=f"Tarefa de teste QA número {i+1}",
            due_date=due_date,
            agent_id=agent.id,
            property_id=random.choice(properties).id if random.random() > 0.5 else None,
            lead_id=random.choice(leads).id if random.random() > 0.5 else None,
            status=status.value,
            priority=random.choice(priorities),
            created_at=now - timedelta(days=random.randint(1, 30))
        )
        
        db.add(task)
        tasks.append(task)
    
    db.commit()
    print(f"✅ {len(tasks)} tarefas criadas")
    
    return tasks


# =====================================================
# MAIN
# =====================================================

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Seed QA data')
    parser.add_argument('--reset', action='store_true', help='Limpar dados antigos antes de criar novos')
    parser.add_argument('--properties', type=int, default=10, help='Número de propriedades (default: 10)')
    parser.add_argument('--leads', type=int, default=15, help='Número de leads (default: 15)')
    parser.add_argument('--visits', type=int, default=20, help='Número de visitas (default: 20)')
    parser.add_argument('--tasks', type=int, default=15, help='Número de tarefas (default: 15)')
    
    args = parser.parse_args()
    
    db = SessionLocal()
    
    try:
        print("=" * 60)
        print("🌱 SEED QA DATA GENERATOR")
        print("=" * 60)
        
        # Reset se solicitado
        if args.reset:
            print("\n🗑️  A limpar dados antigos...")
            db.query(Task).filter(Task.title.like('%teste QA%')).delete(synchronize_session=False)
            db.query(Visit).filter(Visit.notes.like('%teste QA%')).delete(synchronize_session=False)
            db.query(Lead).filter(Lead.email.like('lead%@example.com')).delete(synchronize_session=False)
            db.query(Property).filter(Property.reference.like('REF-QA-%')).delete(synchronize_session=False)
            
            # Não deletar agente (pode ter dados reais associados)
            
            db.commit()
            print("✅ Dados antigos removidos")
        
        # Criar/obter agente de teste
        agent = create_test_agent(db)
        
        # Seed data
        properties = seed_properties(db, agent, args.properties)
        leads = seed_leads(db, agent, properties, args.leads)
        visits = seed_visits(db, agent, properties, leads, args.visits)
        tasks = seed_tasks(db, agent, properties, leads, args.tasks)
        
        print("\n" + "=" * 60)
        print("✅ SEED COMPLETO!")
        print("=" * 60)
        print(f"📊 Resumo:")
        print(f"   🏠 Propriedades: {len(properties)}")
        print(f"   👥 Leads: {len(leads)}")
        print(f"   📅 Visitas: {len(visits)}")
        print(f"   ✅ Tarefas: {len(tasks)}")
        print(f"\n🔑 Login Agente Teste:")
        print(f"   Email: agente.teste@crmplus.com")
        print(f"   Password: teste123")
        print("=" * 60)
    
    except Exception as e:
        print(f"\n❌ Erro ao criar seed data: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    
    finally:
        db.close()


if __name__ == "__main__":
    main()
