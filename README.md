
# CRM PLUS

**CRM PLUS** é uma plataforma inteligente, multicanal e modular para a gestão avançada de imobiliárias, construída em Python/FastAPI, React, Mobile e IA.

## Módulos do Backend
- Leads
- Properties (Imóveis)
- Agents
- Teams
- Agencies
- Calendar (Agenda)
- Feed (Atividades/Notificações)
- Match Plus (Inteligência de correspondência)
- Assistant (Copiloto/Intent Parser)
- Notifications
- Billing (Faturação)
- Reports/Dashboards (Sumários analíticos)

## Instalação (Desenvolvimento)

```bash
git clone https://github.com/tvindima/crm-plus.git
cd crm-plus/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Estrutura
- `backend/app/` → API principal FastAPI com módulos acima
- Cada módulo segue repositórios separados, para escalabilidade e automação
- Documentação inicial nos próprios ficheiros
- Suporte a SQLite para dev; produção pode usar PostgreSQL/MySQL facilmente

## Principais Features
- Gestão, automação e inteligência de leads/propriedades
- Agentes, filas, equipas, agenda, faturação e notificações centralizadas
- API REST, fácil integração com frontend, mobile e automações
- Painel analítico e dashboards embutidos

## Contribuição
Pull requests, issues, forks e automações são bem-vindos.
