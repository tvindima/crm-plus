# 🔐 Matriz de Permissões RBAC - CRM Plus

**Versão:** 1.0  
**Data:** 16 de dezembro de 2025  
**Sistema:** Autenticação e Gestão de Utilizadores

---

## 📊 ROLES DEFINIDOS

| Role | Descrição | Nível de Acesso |
|------|-----------|-----------------|
| **Admin** | Administrador do sistema | Total (gestão de utilizadores, configurações globais) |
| **Coordinator** | Coordenador de equipa | Gestão de equipa, relatórios, aprovações |
| **Agent** | Agente imobiliário | Gestão de próprias angariações e leads |

---

## 🗂️ MÓDULO: AUTENTICAÇÃO E UTILIZADORES

### Endpoints Backend

| Endpoint | Método | Admin | Coordinator | Agent | Público | Notas |
|----------|--------|-------|-------------|-------|---------|-------|
| `/auth/login` | POST | ✅ | ✅ | ✅ | ✅ | Autenticação pública |
| `/auth/logout` | POST | ✅ | ✅ | ✅ | ❌ | Requer sessão ativa |
| `/auth/me` | GET | ✅ | ✅ | ✅ | ❌ | Ver próprio perfil |
| `/auth/verify` | POST | ✅ | ✅ | ✅ | ❌ | Validar token |
| `/users/` | GET | ✅ | ❌ | ❌ | ❌ | Listar todos os utilizadores |
| `/users/` | POST | ✅ | ❌ | ❌ | ❌ | Criar utilizador |
| `/users/{id}` | GET | ✅ | ❌ | ❌ | ❌ | Ver detalhes de utilizador |
| `/users/{id}` | PUT | ✅ | ❌ | ❌ | ❌ | Editar utilizador |
| `/users/{id}` | DELETE | ✅ | ❌ | ❌ | ❌ | Eliminar utilizador |
| `/users/me` | GET | ✅ | ✅ | ✅ | ❌ | Ver próprio perfil |
| `/users/me/profile` | PUT | ✅ | ✅ | ✅ | ❌ | Editar próprio perfil |
| `/users/me/password` | PUT | ✅ | ✅ | ✅ | ❌ | Alterar própria password |

### Páginas Frontend

| Página | Admin | Coordinator | Agent | Notas |
|--------|-------|-------------|-------|-------|
| `/backoffice/login` | ✅ | ✅ | ✅ | Página pública de login |
| `/backoffice/dashboard` | ✅ | ✅ | ✅ | Dashboard personalizado por role |
| `/backoffice/profile` | ✅ | ✅ | ✅ | Perfil pessoal |
| `/backoffice/users` | ✅ | ❌ | ❌ | Gestão de utilizadores (Admin only) |

### Ações Específicas

| Ação | Admin | Coordinator | Agent | Implementação |
|------|-------|-------------|-------|---------------|
| Ver todos os utilizadores | ✅ | ❌ | ❌ | `require_admin` middleware |
| Criar novo utilizador | ✅ | ❌ | ❌ | `POST /users/` |
| Editar role de outro utilizador | ✅ | ❌ | ❌ | `PUT /users/{id}` |
| Ativar/Desativar utilizador | ✅ | ❌ | ❌ | `PUT /users/{id}` |
| Eliminar utilizador | ✅ | ❌ | ❌ | `DELETE /users/{id}` |
| Editar próprio nome/email/telefone | ✅ | ✅ | ✅ | `PUT /users/me/profile` |
| Editar próprio role | ❌ | ❌ | ❌ | Campo bloqueado em `PUT /users/me/profile` |
| Alterar própria password | ✅ | ✅ | ✅ | `PUT /users/me/password` |
| Resetar password de outro utilizador | ✅ | ❌ | ❌ | *Futuro endpoint* |

---

## 🏠 MÓDULO: ANGARIAÇÕES (PROPERTIES)

### Endpoints Backend

| Endpoint | Método | Admin | Coordinator | Agent | Notas |
|----------|--------|-------|-------------|-------|-------|
| `/properties/` | GET | ✅ | ✅ | ✅* | *Agent: apenas próprias |
| `/properties/` | POST | ✅ | ✅ | ✅ | Criar angariação |
| `/properties/{id}` | GET | ✅ | ✅ | ✅* | *Agent: apenas se `agent_id = user.id` |
| `/properties/{id}` | PUT | ✅ | ✅ | ✅* | *Agent: apenas próprias |
| `/properties/{id}` | DELETE | ✅ | ✅ | ❌ | Coordinator+ pode eliminar |
| `/properties/{id}/upload` | POST | ✅ | ✅ | ✅* | Upload de imagens |
| `/properties/{id}/publish` | PUT | ✅ | ✅ | ❌ | Publicar angariação (Coordinator+) |

### Páginas Frontend

| Página | Admin | Coordinator | Agent | Notas |
|--------|-------|-------------|-------|-------|
| `/backoffice/properties` | ✅ | ✅ | ✅* | *Agent: lista filtrada |
| `/backoffice/properties/new` | ✅ | ✅ | ✅ | Criar angariação |
| `/backoffice/properties/{id}/edit` | ✅ | ✅ | ✅* | *Agent: apenas próprias |

### Regras de Negócio

| Regra | Implementação |
|-------|---------------|
| Agent cria angariação → `agent_id` automaticamente = `user.id` | Backend: `get_current_user()` |
| Agent vê apenas próprias angariações | Frontend: filtro `agent_id = user.id` na listagem |
| Coordinator vê todas da equipa | Backend: filtro `team_id IN (user.teams)` |
| Admin vê todas | Sem filtro |
| Campos `is_published`, `is_featured` editáveis apenas por Coordinator+ | Frontend: campos disabled para Agent |

---

## 📞 MÓDULO: LEADS

### Endpoints Backend

| Endpoint | Método | Admin | Coordinator | Agent | Notas |
|----------|--------|-------|-------------|-------|-------|
| `/leads/` | GET | ✅ | ✅ | ✅* | *Agent: leads atribuídos a ele |
| `/leads/` | POST | ✅ | ✅ | ✅ | Criar lead |
| `/leads/{id}` | GET | ✅ | ✅ | ✅* | *Agent: apenas se assigned |
| `/leads/{id}` | PUT | ✅ | ✅ | ✅* | Atualizar lead |
| `/leads/{id}/assign` | PUT | ✅ | ✅ | ❌ | Atribuir lead a agente (Coordinator+) |
| `/leads/{id}/convert` | POST | ✅ | ✅ | ✅* | Converter lead em cliente |

### Regras de Negócio

| Regra | Implementação |
|-------|---------------|
| Agent vê apenas leads atribuídos | Backend: `assigned_to = user.id` |
| Coordinator atribui leads a agentes da equipa | Frontend: dropdown com agentes da equipa |
| Lead sem `assigned_to` → visível apenas para Coordinator+ | Backend: filtro condicional |

---

## 👥 MÓDULO: EQUIPAS (TEAMS)

### Endpoints Backend

| Endpoint | Método | Admin | Coordinator | Agent | Notas |
|----------|--------|-------|-------------|-------|-------|
| `/teams/` | GET | ✅ | ✅ | ✅* | *Agent: apenas sua equipa |
| `/teams/` | POST | ✅ | ❌ | ❌ | Criar equipa (Admin only) |
| `/teams/{id}` | GET | ✅ | ✅* | ✅* | *Se membro da equipa |
| `/teams/{id}` | PUT | ✅ | ✅* | ❌ | *Coordinator: apenas se líder |
| `/teams/{id}/members` | GET | ✅ | ✅* | ✅* | Ver membros da equipa |
| `/teams/{id}/members` | POST | ✅ | ✅* | ❌ | Adicionar membro (Coordinator+) |

### Regras de Negócio

| Regra | Implementação |
|-------|---------------|
| Coordinator gere apenas equipas que lidera | Backend: `team.leader_id = user.id` |
| Agent vê apenas dados da própria equipa | Backend: `team_id = user.team_id` |

---

## 📊 MÓDULO: RELATÓRIOS (REPORTS)

### Endpoints Backend

| Endpoint | Método | Admin | Coordinator | Agent | Notas |
|----------|--------|-------|-------------|-------|-------|
| `/reports/dashboard` | GET | ✅ | ✅ | ✅* | *Agent: apenas próprias métricas |
| `/reports/sales` | GET | ✅ | ✅ | ❌ | Relatório de vendas (Coordinator+) |
| `/reports/team-performance` | GET | ✅ | ✅* | ❌ | *Coordinator: apenas sua equipa |
| `/reports/export` | POST | ✅ | ✅ | ❌ | Exportar relatórios (Coordinator+) |

### Regras de Negócio

| Regra | Implementação |
|-------|---------------|
| Agent vê apenas KPIs pessoais | Frontend: dashboard personalizado |
| Coordinator vê métricas da equipa | Backend: agregação por `team_id` |
| Admin vê métricas globais | Sem filtro |

---

## ⚙️ MÓDULO: CONFIGURAÇÕES (SETTINGS)

### Endpoints Backend

| Endpoint | Método | Admin | Coordinator | Agent | Notas |
|----------|--------|-------|-------------|-------|-------|
| `/settings/global` | GET | ✅ | ❌ | ❌ | Configurações do sistema |
| `/settings/global` | PUT | ✅ | ❌ | ❌ | Atualizar configurações |
| `/settings/notifications` | GET | ✅ | ✅ | ✅ | Preferências de notificação |
| `/settings/notifications` | PUT | ✅ | ✅ | ✅ | Atualizar notificações pessoais |

---

## 🔔 MÓDULO: NOTIFICAÇÕES

### Regras de Visibilidade

| Tipo de Notificação | Admin | Coordinator | Agent |
|---------------------|-------|-------------|-------|
| Novo lead atribuído | ✅ | ✅ | ✅ |
| Lead convertido | ✅ | ✅ | ✅* |
| Angariação aprovada | ✅ | ✅ | ✅* |
| Novo utilizador criado | ✅ | ❌ | ❌ |
| Relatório mensal disponível | ✅ | ✅ | ❌ |

*Apenas se relacionado ao utilizador*

---

## 📱 MÓDULO: MOBILE APP (FUTURO)

### Funcionalidades por Role

| Funcionalidade | Admin | Coordinator | Agent |
|----------------|-------|-------------|-------|
| Ver angariações | ✅ | ✅ | ✅* |
| Criar angariação | ✅ | ✅ | ✅ |
| Upload fotos (câmera) | ✅ | ✅ | ✅ |
| Ver leads | ✅ | ✅ | ✅* |
| Atribuir leads | ✅ | ✅ | ❌ |
| Ver equipa | ✅ | ✅ | ✅* |
| Notificações push | ✅ | ✅ | ✅ |

---

## 🛡️ IMPLEMENTAÇÃO TÉCNICA

### Backend (FastAPI)

#### Decoradores de Permissão

```python
from app.security import get_current_user, require_admin

# Qualquer utilizador autenticado
@router.get("/profile")
def get_profile(current_user = Depends(get_current_user)):
    return current_user

# Apenas admin
@router.post("/users/")
def create_user(user_data, current_user = Depends(require_admin)):
    # ...
    
# Apenas coordinator ou admin
@router.put("/leads/{id}/assign")
def assign_lead(lead_id, current_user = Depends(require_coordinator_or_admin)):
    # ...
```

#### Filtros Condicionais por Role

```python
def get_properties(db, current_user):
    query = db.query(Property)
    
    if current_user.role == "agent":
        # Agent vê apenas próprias
        query = query.filter(Property.agent_id == current_user.id)
    elif current_user.role == "coordinator":
        # Coordinator vê da equipa
        team_agents = [a.id for a in current_user.team.members]
        query = query.filter(Property.agent_id.in_(team_agents))
    # Admin vê todas (sem filtro)
    
    return query.all()
```

### Frontend (Next.js)

#### Componente de Proteção de Rota

```tsx
// components/RoleGuard.tsx
export function RoleGuard({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode
  allowedRoles: ('admin' | 'coordinator' | 'agent')[] 
}) {
  const { user } = useAuth()
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" />
  }
  
  return <>{children}</>
}

// Uso:
<RoleGuard allowedRoles={['admin']}>
  <UsersPage />
</RoleGuard>
```

#### Menu Dinâmico por Role

```tsx
// components/Sidebar.tsx
const menuItems = [
  { label: 'Dashboard', href: '/dashboard', roles: ['admin', 'coordinator', 'agent'] },
  { label: 'Angariações', href: '/properties', roles: ['admin', 'coordinator', 'agent'] },
  { label: 'Leads', href: '/leads', roles: ['admin', 'coordinator', 'agent'] },
  { label: 'Equipas', href: '/teams', roles: ['admin', 'coordinator'] },
  { label: 'Utilizadores', href: '/users', roles: ['admin'] },
  { label: 'Relatórios', href: '/reports', roles: ['admin', 'coordinator'] },
]

const filteredMenu = menuItems.filter(item => 
  item.roles.includes(user.role)
)
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO RBAC

### Backend
- [x] Middleware `get_current_user()` implementado
- [x] Middleware `require_admin()` implementado
- [ ] Middleware `require_coordinator_or_admin()` a implementar
- [ ] Filtros condicionais em `/properties/` por role
- [ ] Filtros condicionais em `/leads/` por role
- [ ] Validação de ownership em PUT/DELETE (agent só edita próprias)
- [ ] Testes unitários de permissões

### Frontend
- [ ] Componente `RoleGuard` criado
- [ ] Menu dinâmico implementado
- [ ] Páginas protegidas com RoleGuard
- [ ] Campos disabled para roles sem permissão (ex: `is_published` para Agent)
- [ ] Redirect para `/forbidden` em acesso negado

### Database
- [x] Campo `role` em `users` table
- [ ] Campo `team_id` em `users` table
- [ ] Campo `leader_id` em `teams` table
- [ ] Foreign keys para integridade

### Testes
- [ ] Teste: Agent não acede `/users/`
- [ ] Teste: Agent vê apenas próprias angariações
- [ ] Teste: Coordinator atribui lead
- [ ] Teste: Admin pode tudo

---

## 🚀 PRÓXIMAS EXPANSÕES

### Permissões Granulares (Futuro)
- **Permissions-based** além de role-based
- Tabela `permissions` com flags: `can_create_property`, `can_approve_lead`, etc.
- Tabela `role_permissions` (many-to-many)
- Admin custom pode ativar/desativar permissões específicas por utilizador

### Auditoria (Futuro)
- Tabela `audit_log`: quem fez o quê, quando
- Endpoints `/users/{id}/activity` para ver histórico

### Multi-tenancy (Futuro)
- Adicionar `organization_id` a todas as tabelas
- Isolamento total entre organizações
- Subscriptions e planos diferentes por org

---

**Aprovado por:** _____________  
**Data:** _____________  
**Versão:** 1.0
