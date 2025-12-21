# 🔍 AUDITORIA - GAPS E FUNCIONALIDADES EM FALTA
**Data:** 21 dezembro 2025  
**App:** CRM PLUS Mobile Web  
**Backend:** FastAPI Railway  
**Status:** Análise Completa

---

## 📊 RESUMO EXECUTIVO

### ✅ Implementado e Funcional
- **34 endpoints** mobile no backend Railway
- **55+ screens** criados (incluindo versões e deprecated)
- **6 tabs** principais: Home, Leads, Propriedades, Agenda, IA, Perfil
- **Navegação** configurada (Stack + Bottom Tabs)

### ⚠️ GAPS IDENTIFICADOS

| Categoria | Endpoints Backend | Screens Mobile | Status |
|-----------|-------------------|----------------|--------|
| **Properties** | ✅ CRUD completo | ✅ Implementado | 🟡 Faltam ações |
| **Leads** | ✅ CRUD completo | ✅ Implementado | 🟡 Falta conversão |
| **Tasks** | ✅ CRUD básico | ⚠️ Parcial | 🔴 Incompleto |
| **Visits** | ✅ CRUD completo | ⚠️ Parcial | 🔴 Check-in/out |
| **Calendar** | ✅ Endpoints OK | ⚠️ AgendaV5 | 🟡 Visualização |
| **Cloudinary** | ✅ Upload config | ❌ UI upload | 🔴 SEM UI |
| **Site Preferences** | ❌ Não existe | ✅ Chamadas no código | 🔴 404 errors |

---

## 🚨 FUNCIONALIDADES CRÍTICAS EM FALTA

### 1️⃣ **UPLOAD DE FOTOS (Cloudinary)** 🔴 CRÍTICO

**Backend:** ✅ Pronto
```python
POST /mobile/properties/{property_id}/photos/upload
POST /mobile/properties/{property_id}/photos/bulk
GET /mobile/cloudinary/upload-config
```

**Mobile:** ❌ **SEM INTERFACE DE UPLOAD**

**Impacto:** Agentes não conseguem adicionar fotos a propriedades.

**Screens Afetados:**
- `PropertyDetailScreenV4.tsx` - Sem botão "Adicionar Fotos"
- `PropertiesScreenV4.tsx` - Sem opção upload em massa

**Ação Necessária:**
- [ ] Criar `PhotoUploadScreen.tsx`
- [ ] Adicionar botão "📷 Adicionar Fotos" em PropertyDetail
- [ ] Implementar ImagePicker (expo-image-picker)
- [ ] Integrar com `/mobile/cloudinary/upload-config`
- [ ] Upload client-side para Cloudinary
- [ ] Callback para salvar URL no backend

**Estimativa:** 4-6 horas

---

### 2️⃣ **CONVERSÃO DE LEADS** 🔴 CRÍTICO

**Backend:** ❌ **ENDPOINT NÃO EXISTE**

**Mobile:** ✅ Código chamando
```typescript
// LeadDetailScreenV4.tsx linha ~120
await apiService.put(`/mobile/leads/${id}/convert`);
```

**Impacto:** Botão "Converter" retorna **404 Not Found**.

**Ação Necessária:**

**Backend (criar endpoint):**
```python
# backend/app/mobile/routes.py
@router.put("/leads/{lead_id}/convert", response_model=lead_schemas.LeadOut)
def convert_lead_to_client(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Converter lead em cliente (property owner ou buyer)
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrada")
    
    # Lógica de conversão
    lead.status = LeadStatus.CONVERTED.value
    lead.converted_at = datetime.utcnow()
    db.commit()
    
    return lead
```

**Mobile:** ✅ Já implementado (aguardando endpoint)

**Estimativa:** 2 horas (backend) + testes

---

### 3️⃣ **SITE PREFERENCES** 🔴 CRÍTICO

**Backend:** ❌ **ENDPOINTS NÃO EXISTEM**

**Mobile:** ✅ Código chamando
```typescript
// ProfileScreenV6.tsx
await apiService.get<any>('/mobile/site-preferences');
await apiService.put('/mobile/site-preferences', { ... });
```

**Impacto:** Configurações do perfil retornam **404 Not Found**.

**Screens Afetados:**
- `ProfileScreenV6.tsx` - Preferências de notificação
- `SettingsScreen.tsx` - Configurações gerais

**Ação Necessária:**

**Backend (criar endpoints):**
```python
# backend/app/mobile/routes.py

@router.get("/site-preferences")
def get_user_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter preferências do utilizador"""
    # Retornar configurações do user ou defaults
    return {
        "notifications": {
            "new_leads": True,
            "visits_reminder": True,
            "property_updates": True
        },
        "theme": "dark",
        "language": "pt"
    }

@router.put("/site-preferences")
def update_user_preferences(
    preferences: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar preferências do utilizador"""
    # Salvar em tabela user_preferences ou JSON field
    return {"status": "updated"}
```

**Mobile:** ✅ Já implementado (aguardando endpoints)

**Estimativa:** 3 horas (backend + migration)

---

### 4️⃣ **TASKS (Tarefas) - CRUD INCOMPLETO** 🟡 MÉDIO

**Backend:** ⚠️ Parcial
```python
GET /mobile/tasks              # ✅ Listar
GET /mobile/tasks/today        # ✅ Hoje
POST /mobile/tasks             # ✅ Criar
PATCH /mobile/tasks/{id}/status # ✅ Atualizar status
```

**Faltam:**
```python
PUT /mobile/tasks/{id}         # ❌ Editar completo
DELETE /mobile/tasks/{id}      # ❌ Deletar
GET /mobile/tasks/{id}         # ❌ Detalhe individual
```

**Mobile:** ⚠️ Sem screens dedicados

**Screens:**
- `AgendaScreenV5.tsx` - Lista tasks, mas **sem detalhes/edição**
- ❌ **Falta:** `TaskDetailScreen.tsx`
- ❌ **Falta:** `NewTaskScreen.tsx`
- ❌ **Falta:** `EditTaskScreen.tsx`

**Ação Necessária:**
- [ ] Backend: Adicionar PUT/DELETE endpoints
- [ ] Mobile: Criar TaskDetailScreen
- [ ] Mobile: Criar NewTaskScreen (formulário)
- [ ] Mobile: Adicionar navegação nas tabs

**Estimativa:** 6 horas (3 backend + 3 mobile)

---

### 5️⃣ **VISITS - CHECK-IN/CHECK-OUT** 🟡 MÉDIO

**Backend:** ✅ Endpoints prontos
```python
POST /mobile/visits/{id}/check-in   # ✅ Disponível
POST /mobile/visits/{id}/check-out  # ✅ Disponível
POST /mobile/visits/{id}/feedback   # ✅ Disponível
```

**Mobile:** ⚠️ UI incompleta

**Problema:** `VisitDetailScreenV4.tsx` tem botões, mas:
- ❌ Sem geolocalização (verificar se agente está no local)
- ❌ Sem confirmação visual ("Check-in feito às 14:32")
- ❌ Sem timer (duração da visita)
- ❌ Feedback form muito básico

**Ação Necessária:**
- [ ] Adicionar expo-location (GPS check-in)
- [ ] Visual feedback com timestamp
- [ ] Timer de duração da visita
- [ ] Formulário feedback estruturado (rating + notas)

**Estimativa:** 4 horas

---

### 6️⃣ **CALENDAR VISUALIZAÇÃO** 🟡 MÉDIO

**Backend:** ✅ Endpoints prontos
```python
GET /mobile/calendar/day/{date}                # ✅ Disponível
GET /mobile/calendar/month/{year}/{month}      # ✅ Disponível
```

**Mobile:** ⚠️ AgendaScreenV5 lista apenas

**Problema:**
- ❌ Sem visualização de calendário (grid mensal)
- ❌ Sem drag & drop para reagendar
- ❌ Sem filtros por tipo (task, visit, lead)

**Screens:**
- `AgendaScreenV5.tsx` - Lista linear (não é calendário visual)

**Ação Necessária:**
- [ ] Integrar biblioteca `react-native-calendars`
- [ ] Criar CalendarMonthView component
- [ ] Adicionar dots nos dias com eventos
- [ ] Sincronizar com backend /calendar/month

**Estimativa:** 5 horas

---

### 7️⃣ **PROPERTIES - AÇÕES EM FALTA** 🟢 BAIXO

**Backend:** ✅ CRUD completo

**Mobile:** ⚠️ Faltam ações secundárias

**Falta em PropertyDetailScreenV4:**
- [ ] Botão "Compartilhar" (share property via WhatsApp/email)
- [ ] Botão "Favoritar" (salvar como favorito)
- [ ] Botão "Duplicar" (criar property similar)
- [ ] Botão "Histórico" (ver alterações)

**Estimativa:** 3 horas (apenas UI + integrações)

---

### 8️⃣ **LEADS - CONTACTO/HISTÓRICO** 🟢 BAIXO

**Backend:** ✅ Endpoint pronto
```python
POST /mobile/leads/{id}/contact  # ✅ Registar contacto
```

**Mobile:** ⚠️ UI básica

**Problema:** `LeadDetailScreenV4.tsx` tem botão, mas:
- ❌ Sem histórico de contactos (lista)
- ❌ Sem tipos de contacto (telefone, email, presencial, WhatsApp)
- ❌ Sem notas do contacto

**Ação Necessária:**
- [ ] Criar LeadContactHistoryComponent
- [ ] Adicionar selector tipo de contacto
- [ ] Campo notas obrigatório
- [ ] Listar histórico abaixo do botão

**Estimativa:** 3 horas

---

## 📱 SCREENS SEM NAVEGAÇÃO (ÓRFÃOS)

Screens criados mas **não linkados** no `Navigation`:

| Screen | Propósito | Status |
|--------|-----------|--------|
| `NewLeadScreen.tsx` (v1) | Criar lead | ❌ Deprecated (usar V4) |
| `VisitDetailScreen.tsx` (v1) | Detalhe visita | ❌ Deprecated (usar V4) |
| `ActiveDevicesScreen.tsx` | Sessões ativas | ⚠️ **Falta link** |
| `SettingsScreen.tsx` | Configurações | ⚠️ **Falta link** |

**Ação:**
- [ ] Adicionar link "Dispositivos Ativos" no ProfileScreenV6
- [ ] Adicionar botão "⚙️ Configurações" no ProfileScreenV6
- [ ] Remover screens deprecated (cleanup)

**Estimativa:** 1 hora

---

## 🔄 FLUXOS INCOMPLETOS

### 1. **Fluxo: Criar Propriedade**

**Atual:** ❌ Inexistente

**Esperado:**
1. PropertiesScreenV4 → Botão "➕ Nova Propriedade"
2. NewPropertyScreen (formulário multi-step)
3. Upload fotos (Cloudinary)
4. Confirmar → POST /mobile/properties
5. Redirect PropertyDetailScreen

**Falta:**
- [ ] Screen: `NewPropertyScreen.tsx`
- [ ] Componente: `PropertyFormWizard.tsx` (multi-step)
- [ ] Integração Cloudinary upload

**Estimativa:** 8 horas

---

### 2. **Fluxo: Converter Lead → Cliente**

**Atual:** ❌ 404 Error

**Esperado:**
1. LeadDetailScreenV4 → Botão "✅ Converter"
2. Modal confirmação
3. PUT /mobile/leads/{id}/convert
4. Lead vira cliente (status CONVERTED)
5. Opcional: criar property associada

**Falta:**
- [ ] Backend endpoint
- [ ] Modal confirmação no mobile

**Estimativa:** 3 horas

---

### 3. **Fluxo: Agendar Visita**

**Atual:** ⚠️ Parcial

**Esperado:**
1. PropertyDetailScreen → "📅 Agendar Visita"
2. NewVisitScreen (form)
3. Selecionar lead/client
4. Data/hora
5. POST /mobile/visits
6. Notificação criada

**Falta:**
- [ ] Screen: `NewVisitScreen.tsx`
- [ ] Seletor de clientes (autocomplete)
- [ ] Validação conflito de horário

**Estimativa:** 6 horas

---

## 🎨 COMPONENTES REUTILIZÁVEIS EM FALTA

### UI Components Necessários:

| Componente | Propósito | Usado Em |
|------------|-----------|----------|
| `ImageUploader` | Upload fotos Cloudinary | Properties, Leads |
| `DateTimePicker` | Selecionar data/hora | Tasks, Visits |
| `StatusBadge` | Badge colorido status | Todas listas |
| `SearchBar` | Busca com filtros | Properties, Leads |
| `EmptyState` | Tela vazia com ilustração | Todas listas |
| `LoadingSpinner` | Loading animado | Todos screens |
| `ErrorBoundary` | Catch erros React | App.tsx |
| `ConfirmModal` | Modal confirmação ações | Deletar, Converter |

**Estimativa:** 10 horas (criar biblioteca de componentes)

---

## 🔐 SEGURANÇA & VALIDAÇÃO

### Validações em Falta:

**Mobile:**
- [ ] Validação formulários (react-hook-form)
- [ ] Sanitização inputs
- [ ] Limites de upload (5MB por foto)
- [ ] Retry logic em network errors
- [ ] Offline mode (cache local)

**Backend:**
- [ ] Rate limiting (já existe?)
- [ ] Validação MIME types uploads
- [ ] Sanitização SQL (usar ORM resolve)
- [ ] Logs de auditoria (quem editou o quê)

**Estimativa:** 8 horas (validações + testes)

---

## 📊 PRIORIZAÇÃO SUGERIDA

### 🔴 **SPRINT 1 (Esta Semana) - CRÍTICO**
1. ✅ CORS mobile (✅ **JÁ FEITO**)
2. Backend: Criar endpoint `/mobile/leads/{id}/convert`
3. Backend: Criar endpoints `/mobile/site-preferences` (GET/PUT)
4. Mobile: Criar `PhotoUploadScreen` + Cloudinary integration
5. Testar fluxo completo no iPhone

**Tempo:** 15-20 horas

---

### 🟡 **SPRINT 2 (Próxima Semana) - IMPORTANTE**
1. Backend: Completar CRUD Tasks (PUT/DELETE)
2. Mobile: Criar `TaskDetailScreen` e `NewTaskScreen`
3. Mobile: Melhorar Check-in/Check-out (GPS + timer)
4. Mobile: Adicionar links para ActiveDevices + Settings
5. Mobile: Criar biblioteca de componentes reutilizáveis

**Tempo:** 20-25 horas

---

### 🟢 **SPRINT 3 (Semana Seguinte) - MELHORIAS**
1. Mobile: Calendar view mensal (react-native-calendars)
2. Mobile: Criar `NewPropertyScreen` (formulário completo)
3. Mobile: Criar `NewVisitScreen`
4. Mobile: Histórico de contactos em Leads
5. Backend: Logs de auditoria

**Tempo:** 25-30 horas

---

## 📝 CHECKLIST DE VALIDAÇÃO

### Antes de Considerar "Production-Ready":

**Funcionalidades Core:**
- [ ] Login/Logout funcional ✅ 
- [ ] Dashboard stats corretos ✅
- [ ] Properties CRUD completo ⚠️ (falta upload fotos)
- [ ] Leads CRUD completo ⚠️ (falta conversão)
- [ ] Tasks CRUD completo ❌
- [ ] Visits CRUD completo ⚠️ (falta UI melhorada)
- [ ] Calendar view ❌

**Integrações:**
- [ ] CORS configurado ✅
- [ ] Cloudinary upload funcionando ❌
- [ ] Push notifications ❌ (não implementado)
- [ ] Analytics (Sentry/Mixpanel) ❌

**UX/UI:**
- [ ] Loading states em todas ações ⚠️
- [ ] Error handling com retry ⚠️
- [ ] Offline mode ❌
- [ ] Feedback visual (toasts) ⚠️
- [ ] Skeleton loaders ❌

**Testes:**
- [ ] Testes unitários (jest) ❌
- [ ] Testes E2E (detox) ❌
- [ ] QA manual completo ⚠️

---

## 🚀 RECOMENDAÇÃO FINAL

### Situação Atual:
- ✅ **70% funcional** (core features OK)
- ⚠️ **20% incompleto** (endpoints faltando)
- ❌ **10% não implementado** (UI upload, calendar)

### Próximo Passo Imediato:
**FOCAR EM SPRINT 1** para:
1. Desbloquear conversão de leads (revenue!)
2. Permitir upload de fotos (essencial para agentes)
3. Corrigir 404 errors em preferences

**Depois disso, a app estará 85% pronta para beta testing.**

---

**FIM DA AUDITORIA**

---

**Metadata:**
- **Total Endpoints Backend:** 34
- **Total Screens Mobile:** 55+
- **Endpoints Órfãos (sem UI):** 4
- **Screens Órfãos (sem navegação):** 4
- **Horas Estimadas (Total):** 60-75 horas
- **Prioridade Alta:** 15-20 horas

**Próxima Ação:** Aprovar Sprint 1 e começar desenvolvimento.
