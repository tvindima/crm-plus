# 🚀 Guia de Deploy - Sistema de Autenticação v1.1.0

**Data:** 16 de dezembro de 2025  
**Módulo:** Authentication & User Management  
**Ambiente:** Railway + Vercel

---

## 📦 PRÉ-REQUISITOS

### Dependências
- ✅ `passlib[bcrypt]` em `requirements.txt`
- ✅ Python 3.10+
- ✅ PostgreSQL 14+
- ✅ Node.js 18+

### Verificações
```bash
# Backend
cd backend
pip freeze | grep passlib  # Deve mostrar: passlib==1.7.4

# Frontend
cd frontend/backoffice
grep -r "api/users" app/api/  # Deve listar 4 arquivos
```

---

## 🎯 DEPLOYMENT RAILWAY (BACKEND)

### Passo 1: Verificar Build
```bash
# Railway auto-detecta requirements.txt e instala
# Verificar se passlib[bcrypt] está incluído
cat backend/requirements.txt | grep passlib
```

### Passo 2: Executar Migração SQL

**Opção A: Via endpoint debug (Recomendado)**
```bash
curl -X POST https://crm-plus-production.up.railway.app/debug/create-users-table
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Users table created and seeded!",
  "columns": [
    "id:integer",
    "email:character varying",
    "hashed_password:character varying",
    "full_name:character varying",
    "role:character varying",
    "is_active:boolean",
    "avatar_url:character varying",
    "phone:character varying",
    "agent_id:integer",
    "created_at:timestamp without time zone",
    "updated_at:timestamp without time zone"
  ],
  "users_count": 3
}
```

**Opção B: Via psql direto**
```bash
# 1. Obter DATABASE_URL do Railway
railway variables | grep DATABASE_URL

# 2. Conectar e executar SQL
psql $DATABASE_URL < backend/migrate_add_users.sql

# 3. Verificar
psql $DATABASE_URL -c "SELECT email, role FROM users;"
```

**Resultado esperado:**
```
           email            | role  
---------------------------+-------
 tvindima@imoveismais.pt   | admin
 faturacao@imoveismais.pt  | admin
 leiria@imoveismais.pt     | admin
(3 rows)
```

### Passo 3: Validar Endpoints

**Teste 1: Login**
```bash
curl -X POST https://crm-plus-production.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tvindima@imoveismais.pt",
    "password": "testepassword123"
  }'
```

**Resposta esperada:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_at": "2025-12-16T..."
}
```

**Teste 2: Perfil do utilizador**
```bash
# Usar token do teste anterior
TOKEN="eyJ..."

curl -X GET https://crm-plus-production.up.railway.app/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada:**
```json
{
  "id": 1,
  "email": "tvindima@imoveismais.pt",
  "role": "admin",
  "name": "Tiago Vindima",
  "is_active": true,
  "avatar_url": null,
  "valid": true
}
```

**Teste 3: Listar utilizadores**
```bash
curl -X GET https://crm-plus-production.up.railway.app/users/ \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada:**
```json
[
  {
    "id": 1,
    "email": "tvindima@imoveismais.pt",
    "full_name": "Tiago Vindima",
    "role": "admin",
    "is_active": true,
    ...
  },
  ...
]
```

### Passo 4: Rollback (se necessário)

**Reverter migração:**
```bash
psql $DATABASE_URL -c "DROP TABLE IF EXISTS users CASCADE;"
```

**Usar sistema antigo temporariamente:**
- Código antigo está comentado em `auth.py`
- Descomentar `AUTHORIZED_USERS` se necessário

---

## 🌐 DEPLOYMENT VERCEL (FRONTEND)

### Passo 1: Verificar Build Local
```bash
cd frontend/backoffice

# Limpar cache
rm -rf .next

# Build local
npm run build
```

**Verificar erros TypeScript:**
- Deve compilar sem erros
- Avisos são aceitáveis

### Passo 2: Deploy Automático (Vercel)

**Vercel auto-deploys ao push para `main`:**
```bash
git add .
git commit -m "feat: authentication and user management system"
git push origin main
```

**Verificar deploy:**
1. Aceder [Vercel Dashboard](https://vercel.com/dashboard)
2. Projeto: `crm-plus-backoffice`
3. Ver logs do deployment
4. Status: ✅ "Ready"

### Passo 3: Validar Páginas

**Página de Perfil:**
```
https://crm-plus-backoffice.vercel.app/backoffice/profile
```

**Checks:**
- [ ] Página carrega sem erro 500
- [ ] Redirect para `/login` se não autenticado
- [ ] Após login, mostra perfil do utilizador

**Página de Utilizadores:**
```
https://crm-plus-backoffice.vercel.app/backoffice/users
```

**Checks:**
- [ ] Admin vê a página
- [ ] Lista de utilizadores carregada
- [ ] Botão "Criar Utilizador" visível
- [ ] Filtros funcionam

### Passo 4: Testar API Proxies

**Teste no browser console:**
```javascript
// Em https://crm-plus-backoffice.vercel.app/backoffice/dashboard
fetch('/api/users/me')
  .then(r => r.json())
  .then(console.log)
```

**Resposta esperada:**
```json
{
  "id": 1,
  "email": "tvindima@imoveismais.pt",
  "role": "admin",
  ...
}
```

---

## 🧪 TESTES END-TO-END

### Fluxo 1: Login e Edição de Perfil

1. **Login:**
   - Aceder `https://crm-plus-backoffice.vercel.app/backoffice/login`
   - Email: `tvindima@imoveismais.pt`
   - Password: `testepassword123`
   - ✅ Redirect para `/dashboard`

2. **Ver Perfil:**
   - Clicar menu → "Perfil" (ou aceder `/profile`)
   - ✅ Ver nome, email, badge de admin

3. **Editar Perfil:**
   - Clicar "Editar Perfil"
   - Alterar telefone para `+351 912 345 678`
   - Clicar "Guardar"
   - ✅ Mensagem de sucesso
   - ✅ Telefone atualizado visível

4. **Alterar Password:**
   - Clicar "Alterar Password"
   - Password atual: `testepassword123`
   - Nova password: `nova_password_123`
   - Confirmar: `nova_password_123`
   - Clicar "Alterar Password"
   - ✅ Mensagem de sucesso

5. **Logout e Re-login:**
   - Fazer logout
   - Fazer login com nova password `nova_password_123`
   - ✅ Login sucede

6. **Reverter Password (para próximos testes):**
   - Alterar password de volta para `testepassword123`

### Fluxo 2: Gestão de Utilizadores (Admin)

1. **Aceder Gestão:**
   - Menu → "Utilizadores" (ou `/users`)
   - ✅ Lista de 3 admins exibida

2. **Criar Novo Agente:**
   - Clicar "Criar Utilizador"
   - Preencher:
     - Nome: `João Teste`
     - Email: `joao.teste@imoveismais.pt`
     - Password: `password123`
     - Telefone: `+351 911 222 333`
     - Role: `Agent`
     - Ativo: ✅
   - Clicar "Criar"
   - ✅ Agente criado
   - ✅ Aparece na lista

3. **Editar Agente:**
   - Clicar ícone lápis do João
   - Alterar role para `Coordinator`
   - Clicar "Atualizar"
   - ✅ Badge muda de verde para azul

4. **Desativar Agente:**
   - Clicar ícone Power (laranja)
   - ✅ Badge muda para "Inativo"

5. **Testar Login Bloqueado:**
   - Fazer logout
   - Tentar login com `joao.teste@imoveismais.pt` / `password123`
   - ✅ Erro: "Credenciais inválidas" ou "Utilizador inativo"

6. **Reativar e Limpar:**
   - Fazer login como admin novamente
   - Reativar João (ícone verde)
   - Eliminar João (ícone lixo)
   - ✅ João removido da lista

### Fluxo 3: Restrições de Acesso (Agent)

1. **Criar Agente de Teste:**
   - Como admin, criar:
     - Email: `agent.teste@imoveismais.pt`
     - Password: `test123`
     - Role: `Agent`

2. **Login como Agent:**
   - Logout do admin
   - Login com `agent.teste@imoveismais.pt` / `test123`
   - ✅ Acesso ao dashboard

3. **Tentar Aceder `/users`:**
   - Digitar URL: `https://crm-plus-backoffice.vercel.app/backoffice/users`
   - ✅ Redirect para `/forbidden` ou `/dashboard`
   - ✅ Menu NÃO mostra link "Utilizadores"

4. **Testar API Diretamente (Browser Console):**
   ```javascript
   fetch('/api/users').then(r => r.json()).then(console.log)
   ```
   - ✅ Resposta: `{ "error": "Forbidden" }` ou 403

5. **Limpar Teste:**
   - Login como admin
   - Eliminar `agent.teste@imoveismais.pt`

---

## 📊 VALIDAÇÃO DE DADOS

### Verificar Hashing de Passwords

**Conectar ao PostgreSQL:**
```bash
psql $DATABASE_URL
```

**Query:**
```sql
SELECT email, 
       LEFT(hashed_password, 10) as hash_preview,
       LENGTH(hashed_password) as hash_length 
FROM users;
```

**Resultado esperado:**
```
          email            | hash_preview | hash_length 
---------------------------+--------------+-------------
 tvindima@imoveismais.pt   | $2b$12$swV |          60
 faturacao@imoveismais.pt  | $2b$12$tJ9 |          60
 leiria@imoveismais.pt     | $2b$12$tJ9 |          60
```

**Validações:**
- ✅ Hash começa com `$2b$12$` (bcrypt)
- ✅ Comprimento ~60 caracteres
- ❌ **NUNCA** ver password em plain text

### Verificar Índices

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'users';
```

**Resultado esperado:**
```
      indexname       |                indexdef
----------------------+----------------------------------------
 users_pkey           | CREATE UNIQUE INDEX users_pkey ON ...
 users_email_key      | CREATE UNIQUE INDEX users_email_key ...
 idx_users_email      | CREATE INDEX idx_users_email ON ...
 idx_users_role       | CREATE INDEX idx_users_role ON ...
 idx_users_is_active  | CREATE INDEX idx_users_is_active ON ...
```

### Verificar Trigger

```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'update_users_updated_at';
```

**Resultado esperado:**
```
      trigger_name        | event_manipulation | event_object_table 
--------------------------+--------------------+--------------------
 update_users_updated_at | UPDATE             | users
```

**Teste manual do trigger:**
```sql
UPDATE users SET full_name = 'Tiago Vindima Updated' WHERE id = 1;
SELECT full_name, updated_at FROM users WHERE id = 1;
-- updated_at deve ser timestamp recente
```

---

## 🛠️ TROUBLESHOOTING

### Erro: "Module 'passlib' has no attribute 'context'"

**Causa:** `passlib[bcrypt]` não instalado

**Solução:**
```bash
cd backend
pip install 'passlib[bcrypt]'
railway up  # Re-deploy
```

### Erro: "relation 'users' does not exist"

**Causa:** Migração não executada

**Solução:**
```bash
curl -X POST https://crm-plus-production.up.railway.app/debug/create-users-table
```

### Erro: "401 Unauthorized" ao aceder `/users/me`

**Causa:** Token expirado ou inválido

**Solução:**
1. Fazer login novamente
2. Verificar cookie `crmplus_staff_session` no browser (DevTools → Application → Cookies)
3. Se cookie não existe, problema no proxy Next.js

### Erro: "Email already registered"

**Causa:** Tentar criar utilizador com email duplicado

**Solução:**
- Usar email diferente
- Ou eliminar utilizador antigo primeiro

### Frontend mostra página em branco

**Causa:** Erro de JavaScript não tratado

**Solução:**
1. Abrir DevTools → Console
2. Ver erro (ex: "Cannot read property 'role' of null")
3. Verificar se `/api/users/me` retorna dados
4. Verificar se `user` está null antes de render

### "Network Error" em requests para Railway

**Causa:** CORS ou Railway offline

**Solução:**
1. Verificar RAILWAY_API_URL em Vercel:
   ```bash
   vercel env ls
   # Deve ter: NEXT_PUBLIC_RAILWAY_API_URL
   ```
2. Verificar Railway logs:
   ```bash
   railway logs --service backend
   ```
3. Testar Railway direto:
   ```bash
   curl https://crm-plus-production.up.railway.app/health
   ```

---

## ✅ CHECKLIST FINAL DE DEPLOYMENT

### Pré-Deploy
- [x] `passlib[bcrypt]` em requirements.txt
- [x] Código commitado e pushed
- [x] Tests locais passando
- [x] Zero erros TypeScript em build

### Railway (Backend)
- [ ] Build bem-sucedido
- [ ] Migração SQL executada (`/debug/create-users-table`)
- [ ] 3 admins seedados
- [ ] Login endpoint funciona
- [ ] `/users/` endpoint funciona com token

### Vercel (Frontend)
- [ ] Build bem-sucedido
- [ ] `/backoffice/profile` acessível
- [ ] `/backoffice/users` acessível (admin only)
- [ ] API proxies funcionando
- [ ] Zero erros 500 em produção

### Testes E2E
- [ ] Login com admin sucede
- [ ] Editar perfil funciona
- [ ] Alterar password funciona
- [ ] Criar utilizador funciona
- [ ] Editar role funciona
- [ ] Desativar utilizador bloqueia login
- [ ] Agent NÃO acede página de utilizadores
- [ ] Logout limpa sessão

### Segurança
- [ ] Passwords hashed (bcrypt)
- [ ] Tokens JWT funcionando
- [ ] Cookies httpOnly
- [ ] RBAC funcionando (agent bloqueado)
- [ ] SQL injection previsto (SQLAlchemy)

### Documentação
- [x] QA Checklist criado
- [x] RBAC Matrix criado
- [x] Deployment Guide criado
- [ ] README atualizado

---

## 🎉 SIGN-OFF

**Deployment executado por:** _____________  
**Data:** _____________  
**Ambiente:** Production (Railway + Vercel)  
**Status:** ✅ SUCESSO / ❌ FALHOU  
**Notas:**

---

**Próximos passos após deploy bem-sucedido:**
1. ✅ Comunicar ao team: "Auth system live"
2. ✅ Executar QA checklist completo
3. ✅ Monitorar logs por 24h
4. ✅ Tag git: `v1.1.0-auth`
5. ✅ Iniciar próximo módulo (Properties CRUD completo)
