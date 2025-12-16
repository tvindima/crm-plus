# 🔐 Checklist QA - Sistema de Autenticação e Gestão de Utilizadores

**Data:** 16 de dezembro de 2025  
**Módulo:** Authentication & User Management  
**Status:** ⏳ Aguardando migração Railway

---

## 📋 PRÉ-REQUISITOS

### Backend (Railway PostgreSQL)
- [ ] Executar migração SQL: `POST /debug/create-users-table`
- [ ] Verificar tabela `users` criada com 11 colunas
- [ ] Confirmar 3 utilizadores admin seedados
- [ ] Validar triggers `update_updated_at_column`
- [ ] Testar índices (email, role, is_active)

### Backend (Dependências)
- [ ] `passlib[bcrypt]` instalado em requirements.txt
- [ ] Imports de `app.users` funcionando
- [ ] Router `/users/` registado em main.py

### Frontend (Vercel)
- [ ] Deploy de novas páginas: `/backoffice/profile`, `/backoffice/users`
- [ ] Deploy de API proxies: `/api/users/*`
- [ ] Cache limpa (`.next` removida)

---

## 🧪 TESTES FUNCIONAIS

### 1. Autenticação (Login/Logout)

#### 1.1 Login com utilizador admin
**Endpoint:** `POST /auth/login`
**Dados:**
```json
{
  "email": "tvindima@imoveismais.pt",
  "password": "testepassword123"
}
```

**Validações:**
- [ ] Status 200 OK
- [ ] Token JWT retornado
- [ ] Cookie `crmplus_staff_session` setado (httpOnly, secure)
- [ ] Token contém: `user_id`, `email`, `role: admin`
- [ ] Expiração em 60 minutos

#### 1.2 Login com credenciais inválidas
**Dados:**
```json
{
  "email": "tvindima@imoveismais.pt",
  "password": "senha_errada"
}
```

**Validações:**
- [ ] Status 401 Unauthorized
- [ ] Mensagem: "Credenciais inválidas"
- [ ] Sem token retornado

#### 1.3 Login com utilizador inativo
**Pré-requisito:** Desativar um utilizador
**Validações:**
- [ ] Status 401/403
- [ ] Mensagem: "Utilizador inativo" ou similar

#### 1.4 Verificar sessão
**Endpoint:** `GET /auth/me`
**Headers:** `Authorization: Bearer {token}`

**Validações:**
- [ ] Status 200 OK
- [ ] Retorna: `id`, `email`, `role`, `name`, `is_active`, `avatar_url`
- [ ] Campo `valid: true`

#### 1.5 Logout
**Endpoint:** `POST /auth/logout`

**Validações:**
- [ ] Status 200 OK
- [ ] Cookie `crmplus_staff_session` removido
- [ ] Requisições subsequentes sem token retornam 401

---

### 2. Gestão de Perfil (Próprio Utilizador)

#### 2.1 Obter perfil pessoal
**Endpoint:** `GET /users/me`
**Headers:** `Authorization: Bearer {token}`

**Validações:**
- [ ] Status 200 OK
- [ ] Retorna todos os campos do utilizador
- [ ] Role corresponde ao utilizador autenticado

#### 2.2 Atualizar perfil pessoal
**Endpoint:** `PUT /users/me/profile`
**Dados:**
```json
{
  "full_name": "Tiago Vindima Atualizado",
  "phone": "+351 912 345 678",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Validações:**
- [ ] Status 200 OK
- [ ] Campos atualizados corretamente
- [ ] Campos `role` e `is_active` NÃO podem ser alterados pelo próprio utilizador
- [ ] `updated_at` atualizado automaticamente

#### 2.3 Alterar password
**Endpoint:** `PUT /users/me/password`
**Dados:**
```json
{
  "current_password": "testepassword123",
  "new_password": "nova_password_segura_456"
}
```

**Validações:**
- [ ] Status 200 OK
- [ ] Mensagem: "Password updated successfully"
- [ ] Login subsequente com password antiga FALHA
- [ ] Login com nova password SUCEDE

#### 2.4 Alterar password com senha atual errada
**Dados:**
```json
{
  "current_password": "senha_errada",
  "new_password": "nova_password_456"
}
```

**Validações:**
- [ ] Status 400 Bad Request
- [ ] Mensagem: "Current password is incorrect"
- [ ] Password NÃO é alterada

#### 2.5 Alterar password muito curta
**Dados:**
```json
{
  "current_password": "testepassword123",
  "new_password": "123"
}
```

**Validações:**
- [ ] Status 422 Unprocessable Entity
- [ ] Validação Pydantic: min_length=6

---

### 3. Gestão de Utilizadores (Admin Only)

#### 3.1 Listar todos os utilizadores
**Endpoint:** `GET /users/`
**Headers:** `Authorization: Bearer {admin_token}`

**Validações:**
- [ ] Status 200 OK
- [ ] Retorna array de utilizadores
- [ ] Inclui todos os roles (admin, coordinator, agent)
- [ ] Passwords NÃO são retornadas

#### 3.2 Filtrar por role
**Endpoint:** `GET /users/?role=admin`

**Validações:**
- [ ] Retorna apenas admins
- [ ] Filtro `role=coordinator` retorna apenas coordenadores
- [ ] Filtro `role=agent` retorna apenas agentes

#### 3.3 Filtrar por status
**Endpoint:** `GET /users/?is_active=true`

**Validações:**
- [ ] Retorna apenas utilizadores ativos
- [ ] `is_active=false` retorna apenas inativos

#### 3.4 Criar novo utilizador (Admin)
**Endpoint:** `POST /users/`
**Dados:**
```json
{
  "email": "novo.agente@imoveismais.pt",
  "full_name": "João Silva",
  "password": "password123",
  "phone": "+351 911 111 111",
  "role": "agent"
}
```

**Validações:**
- [ ] Status 201 Created
- [ ] Utilizador criado com password hashed
- [ ] `is_active` default = true
- [ ] Email único (duplicado retorna 400)

#### 3.5 Atualizar utilizador existente
**Endpoint:** `PUT /users/{id}`
**Dados:**
```json
{
  "full_name": "João Silva Atualizado",
  "role": "coordinator",
  "is_active": false
}
```

**Validações:**
- [ ] Status 200 OK
- [ ] Campos atualizados
- [ ] Admin pode alterar `role` e `is_active` de outros utilizadores

#### 3.6 Eliminar utilizador
**Endpoint:** `DELETE /users/{id}`

**Validações:**
- [ ] Status 200 OK
- [ ] Utilizador removido da DB
- [ ] Login com esse utilizador FALHA após eliminação

#### 3.7 Acesso negado para não-admin
**Usuário:** Agente (role=agent)
**Endpoint:** `POST /users/` (criar utilizador)

**Validações:**
- [ ] Status 403 Forbidden
- [ ] Mensagem: "Permissão insuficiente" ou similar

---

### 4. Frontend - Página de Perfil

**URL:** `https://crm-plus-backoffice.vercel.app/backoffice/profile`

#### 4.1 Visualização de perfil
**Validações:**
- [ ] Avatar exibido (ou placeholder se não houver)
- [ ] Nome completo visível
- [ ] Badge de role com cor correta:
  - Admin → vermelho
  - Coordinator → azul
  - Agent → verde
- [ ] Email e telefone exibidos
- [ ] Status "Conta ativa" ou "Conta inativa"

#### 4.2 Edição de perfil
**Ações:** Clicar "Editar Perfil"

**Validações:**
- [ ] Formulário com campos: nome, email, telefone
- [ ] Campos `role` e `is_active` NÃO editáveis
- [ ] Botão "Guardar" funcional
- [ ] Botão "Cancelar" reverte alterações
- [ ] Mensagem de sucesso após guardar
- [ ] Dados atualizados refletem na UI

#### 4.3 Alteração de password
**Ações:** Clicar "Alterar Password"

**Validações:**
- [ ] Formulário com: password atual, nova password, confirmar password
- [ ] Validação: nova password ≥ 6 caracteres
- [ ] Validação: nova password == confirmar password
- [ ] Erro se password atual incorreta
- [ ] Sucesso exibe mensagem verde
- [ ] Formulário limpo após sucesso

---

### 5. Frontend - Gestão de Utilizadores (Admin)

**URL:** `https://crm-plus-backoffice.vercel.app/backoffice/users`

#### 5.1 Listagem de utilizadores
**Validações:**
- [ ] Tabela com colunas: Utilizador, Email, Telefone, Role, Status, Ações
- [ ] Avatar ou placeholder para cada utilizador
- [ ] Badge de role com cores corretas
- [ ] Badge de status (Ativo/Inativo)
- [ ] Botão "Criar Utilizador" visível

#### 5.2 Filtros e pesquisa
**Validações:**
- [ ] Campo de pesquisa filtra por nome e email
- [ ] Dropdown "Todos os roles" filtra por admin/coordinator/agent
- [ ] Dropdown "Todos os status" filtra por ativo/inativo
- [ ] Filtros combinados funcionam corretamente
- [ ] Mensagem "Nenhum utilizador encontrado" quando vazio

#### 5.3 Criar novo utilizador
**Ações:** Clicar "Criar Utilizador"

**Validações:**
- [ ] Modal aberto com formulário
- [ ] Campos: Nome, Email, Password, Telefone, Role, Ativo (checkbox)
- [ ] Validação: email válido
- [ ] Validação: password ≥ 6 caracteres
- [ ] Dropdown de role com 3 opções
- [ ] Botão "Criar" envia dados
- [ ] Mensagem de sucesso
- [ ] Modal fecha e lista atualiza
- [ ] Email duplicado exibe erro

#### 5.4 Editar utilizador existente
**Ações:** Clicar ícone "Editar" (lápis)

**Validações:**
- [ ] Modal aberto com dados pré-preenchidos
- [ ] Campo password opcional (vazio mantém atual)
- [ ] Admin pode alterar role de outro utilizador
- [ ] Admin pode desativar outro utilizador
- [ ] Botão "Atualizar" funcional
- [ ] Lista atualiza após edição

#### 5.5 Ativar/Desativar utilizador
**Ações:** Clicar ícone Power/PowerOff

**Validações:**
- [ ] Utilizador ativo → ícone laranja (desativar)
- [ ] Utilizador inativo → ícone verde (ativar)
- [ ] Confirmação visual do toggle
- [ ] Badge de status atualiza imediatamente
- [ ] Mensagem de sucesso

#### 5.6 Eliminar utilizador
**Ações:** Clicar ícone "Lixo" (vermelho)

**Validações:**
- [ ] Alerta de confirmação exibido
- [ ] Utilizador removido da lista após confirmação
- [ ] Mensagem de sucesso
- [ ] Cancelar não remove o utilizador

#### 5.7 Acesso negado para não-admin
**Usuário:** Agente ou Coordenador
**Ação:** Aceder `/backoffice/users`

**Validações:**
- [ ] Página não acessível (redirect ou 403)
- [ ] Menu não exibe link "Utilizadores" para não-admins

---

## 🔒 TESTES DE SEGURANÇA

### 6.1 Hashing de Passwords
**Validações:**
- [ ] Passwords NUNCA armazenadas em plain text na DB
- [ ] Bcrypt usado para hashing (verificar `hashed_password` começa com `$2b$`)
- [ ] Salt único para cada password

### 6.2 Proteção de Endpoints
**Validações:**
- [ ] Todos os endpoints `/users/*` requerem autenticação
- [ ] Token JWT expirado retorna 401
- [ ] Token inválido retorna 401
- [ ] Requisições sem token retornam 401

### 6.3 RBAC (Role-Based Access Control)
**Validações:**
- [ ] Agente NÃO pode criar utilizadores
- [ ] Agente NÃO pode editar outros utilizadores
- [ ] Agente NÃO pode alterar próprio `role`
- [ ] Coordenador NÃO pode criar utilizadores (se regra aplicar)
- [ ] Admin pode fazer tudo

### 6.4 Cookies Seguros
**Validações:**
- [ ] Cookie `httpOnly: true` (não acessível via JavaScript)
- [ ] Cookie `secure: true` (apenas HTTPS)
- [ ] Cookie `sameSite: none` (para CORS)
- [ ] Cookie expira após 60 minutos

### 6.5 SQL Injection Prevention
**Teste:** Tentar login com: `email: "admin' OR '1'='1"`

**Validações:**
- [ ] SQLAlchemy previne SQL injection
- [ ] Queries parametrizadas usadas em todos os endpoints

---

## 📊 TESTES DE PERFORMANCE

### 7.1 Listagem de utilizadores (escala)
**Cenário:** 1000+ utilizadores na DB

**Validações:**
- [ ] Resposta < 500ms
- [ ] Paginação funcional (`skip`, `limit`)
- [ ] Índices aceleram consultas por `email`, `role`, `is_active`

### 7.2 Hashing de password
**Validações:**
- [ ] Criação de utilizador < 200ms (bcrypt é lento, mas aceitável)
- [ ] Login < 300ms

---

## 🌐 TESTES DE INTEGRAÇÃO

### 8.1 Fluxo completo: Criação → Login → Edição → Logout
1. Admin cria novo agente via `/backoffice/users`
2. Agente faz login via `/backoffice/login`
3. Agente edita próprio perfil via `/backoffice/profile`
4. Agente altera password
5. Agente faz logout
6. Agente faz login com nova password

**Validações:**
- [ ] Todos os passos funcionam sem erro
- [ ] Dados persistem corretamente

### 8.2 Fluxo: Desativação → Login negado
1. Admin desativa agente via `/backoffice/users`
2. Agente tenta fazer login

**Validações:**
- [ ] Login falha com mensagem apropriada
- [ ] Token não é gerado

---

## 🐛 TESTES DE EDGE CASES

### 9.1 Email com case insensitive
**Teste:** Criar user com `TEST@example.com`, depois tentar `test@example.com`

**Validações:**
- [ ] Emails normalizados para lowercase
- [ ] Duplicatas detectadas independentemente do case

### 9.2 Campos vazios/nulos
**Teste:** Criar user com `phone: null`, `avatar_url: null`

**Validações:**
- [ ] Campos opcionais aceitam null
- [ ] Frontend exibe "-" ou placeholder

### 9.3 Relacionamento Agent ↔ User
**Teste:** Criar user com `agent_id: 99999` (inexistente)

**Validações:**
- [ ] Foreign key constraint previne
- [ ] Ou aceita null se agente não existe

### 9.4 Trigger updated_at
**Teste:** Atualizar user e verificar `updated_at`

**Validações:**
- [ ] `updated_at` muda em cada UPDATE
- [ ] Timestamp correto (UTC)

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

**Módulo APROVADO se:**
1. ✅ **100% dos testes funcionais passam** (seções 1-5)
2. ✅ **100% dos testes de segurança passam** (seção 6)
3. ✅ **Performance aceitável** (seção 7)
4. ✅ **Fluxos de integração completos** (seção 8)
5. ✅ **Zero vulnerabilidades críticas** identificadas
6. ✅ **UI responsiva e sem bugs visuais**

---

## 📝 NOTAS PARA QA TEAM

- **Ambiente de teste:** Railway (production) + Vercel (production)
- **Credenciais de teste:**
  - Admin: `tvindima@imoveismais.pt` / `testepassword123`
  - Admin2: `faturacao@imoveismais.pt` / `123456`
- **Ferramentas:**
  - Postman/Insomnia para testes de API
  - Browser DevTools para verificar cookies
  - PostgreSQL client para inspeção direta da DB
- **Logs:**
  - Railway logs: `railway logs --service backend`
  - Vercel logs: Dashboard Vercel
- **Rollback:** Se bugs críticos, reverter deploy e usar AUTHORIZED_USERS temporariamente

---

## 🚀 PRÓXIMOS PASSOS APÓS QA

1. ✅ Executar migração Railway: `POST /debug/create-users-table`
2. ✅ Deploy frontend (Vercel auto-deploy on push)
3. ✅ Executar todos os testes desta checklist
4. ✅ Documentar bugs encontrados
5. ✅ Fix de bugs críticos
6. ✅ Re-teste após fixes
7. ✅ Sign-off de QA
8. ✅ Merge para `main` e tag `v1.1.0-auth`
9. ✅ Comunicar ao time: "Módulo de Auth pronto para produção"

---

**Responsável QA:** _____________  
**Data de conclusão:** _____________  
**Aprovado por:** _____________
