# API Mobile - Documentação para Agentes

## 📱 Visão Geral

API otimizada para aplicação móvel dos agentes com permissões completas de edição. Todas as rotas estão sob o prefixo `/mobile`.

## 🔐 Autenticação

Todas as rotas requerem autenticação via Bearer Token JWT. O token deve ser incluído no header:

```
Authorization: Bearer <token>
```

## 📋 Endpoints Disponíveis

### **1. Autenticação & Perfil**

#### `GET /mobile/auth/me`
Obter perfil completo do agente logado

**Resposta:**
```json
{
  "user": {
    "id": 1,
    "email": "agente@crm.pt",
    "full_name": "João Silva",
    "role": "agent",
    "avatar_url": "https://...",
    "phone": "+351 912345678",
    "is_active": true
  },
  "agent": {
    "id": 5,
    "name": "João Silva",
    "email": "joao@crm.pt",
    "phone": "+351 912345678",
    "photo": "https://...",
    "license_ami": "AMI12345"
  },
  "permissions": {
    "can_create_property": true,
    "can_edit_property": true,
    "can_delete_property": false,
    "can_manage_leads": true,
    "can_manage_tasks": true,
    "can_upload_photos": true,
    "can_update_status": true
  }
}
```

---

### **2. Propriedades**

#### `GET /mobile/properties`
Listar propriedades com filtros

**Query Parameters:**
- `skip` (int): Offset para paginação (default: 0)
- `limit` (int): Limite de resultados (default: 50)
- `status` (string): Filtrar por status (disponivel, vendido, arrendado, reservado)
- `business_type` (string): Filtrar por tipo de negócio (venda, arrendamento)
- `property_type` (string): Filtrar por tipo (moradia, apartamento, terreno, etc)
- `search` (string): Busca em referência, localização, descrição
- `my_properties` (bool): Mostrar apenas minhas propriedades (default: false)

**Exemplo:**
```
GET /mobile/properties?my_properties=true&status=disponivel&limit=20
```

#### `GET /mobile/properties/{property_id}`
Obter detalhes de uma propriedade específica

#### `POST /mobile/properties`
Criar nova propriedade

**Body:**
```json
{
  "reference": "MOV-2024-001",
  "business_type": "venda",
  "property_type": "moradia",
  "typology": "T3",
  "price": 350000,
  "location": "Porto",
  "municipality": "Porto",
  "parish": "Cedofeita",
  "description": "Moradia T3 com jardim",
  "usable_area": 150,
  "land_area": 200,
  "condition": "bom",
  "status": "disponivel"
}
```

#### `PUT /mobile/properties/{property_id}`
Atualizar propriedade existente

**Permissões:**
- Agentes: apenas suas próprias propriedades
- Coordenadores/Admin: qualquer propriedade

#### `PATCH /mobile/properties/{property_id}/status`
Atualizar rapidamente apenas o status

**Body:**
```json
{
  "status": "vendido"
}
```

**Status válidos:**
- `disponivel`
- `vendido`
- `arrendado`
- `reservado`
- `inativo`

#### `POST /mobile/properties/{property_id}/photos/upload`
Upload de foto para propriedade

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Arquivo de imagem (max 10MB)

**Formatos aceites:** JPG, PNG, WebP

**Resposta:**
```json
{
  "success": true,
  "url": "https://cloudinary.../property-photo.jpg",
  "property_id": 123,
  "total_photos": 5
}
```

---

### **3. Leads**

#### `GET /mobile/leads`
Listar leads

**Query Parameters:**
- `skip` (int): Offset (default: 0)
- `limit` (int): Limite (default: 50)
- `status` (string): Filtrar por status
- `my_leads` (bool): Apenas meus leads (default: true)

**Status de Leads:**
- `novo` - Lead novo
- `contactado` - Já contactado
- `qualificado` - Lead qualificado
- `convertido` - Convertido em cliente
- `perdido` - Lead perdido

#### `GET /mobile/leads/{lead_id}`
Obter detalhes de um lead

#### `PATCH /mobile/leads/{lead_id}/status`
Atualizar status do lead

**Body:**
```json
{
  "status": "contactado",
  "notes": "Cliente interessado, agendar visita"
}
```

#### `POST /mobile/leads/{lead_id}/contact`
Registrar contacto com lead

**Query Parameters:**
- `contact_type` (string): Tipo de contacto (call, email, whatsapp, visit)
- `notes` (string): Notas do contacto

**Exemplo:**
```
POST /mobile/leads/45/contact?contact_type=whatsapp&notes=Cliente%20confirmou%20visita
```

**Resposta:**
```json
{
  "success": true,
  "lead_id": 45,
  "contact_type": "whatsapp",
  "last_contact": "2024-12-18T14:30:00"
}
```

---

### **4. Tarefas (Tasks)**

#### `GET /mobile/tasks`
Listar tarefas

**Query Parameters:**
- `skip` (int): Offset (default: 0)
- `limit` (int): Limite (default: 50)
- `status` (string): Filtrar por status
- `my_tasks` (bool): Apenas minhas tarefas (default: true)

**Status de Tarefas:**
- `pendente`
- `em_progresso`
- `concluida`
- `cancelada`

#### `GET /mobile/tasks/today`
Obter tarefas de hoje (widget)

**Resposta:**
```json
{
  "tasks": [
    {
      "id": 10,
      "title": "Visita à moradia em Porto",
      "due_date": "2024-12-18T15:00:00",
      "status": "pendente",
      "priority": "alta"
    }
  ],
  "count": 1,
  "date": "2024-12-18"
}
```

#### `POST /mobile/tasks`
Criar nova tarefa

**Body:**
```json
{
  "title": "Reunião com cliente",
  "description": "Apresentar proposta de moradia T3",
  "due_date": "2024-12-20T10:00:00",
  "priority": "alta",
  "status": "pendente"
}
```

**Prioridades:**
- `baixa`
- `media`
- `alta`
- `urgente`

#### `PATCH /mobile/tasks/{task_id}/status`
Atualizar status de tarefa

**Body:**
```json
{
  "status": "concluida"
}
```

---

### **5. Dashboard & Estatísticas**

#### `GET /mobile/dashboard/stats`
Estatísticas resumidas do agente

**Resposta:**
```json
{
  "properties": 25,
  "leads": 12,
  "tasks_pending": 5,
  "tasks_today": 2,
  "agent_id": 5
}
```

#### `GET /mobile/dashboard/recent-activity`
Atividade recente do agente

**Query Parameters:**
- `limit` (int): Limite de items (default: 20)

**Resposta:**
```json
{
  "recent_properties": [
    {
      "id": 123,
      "reference": "MOV-2024-001",
      "location": "Porto",
      "price": 350000,
      "status": "disponivel",
      "created_at": "2024-12-18T10:00:00"
    }
  ],
  "recent_leads": [
    {
      "id": 45,
      "name": "Maria Santos",
      "email": "maria@email.pt",
      "phone": "+351 912345678",
      "status": "novo",
      "created_at": "2024-12-18T09:30:00"
    }
  ],
  "recent_tasks": [
    {
      "id": 10,
      "title": "Visita à moradia",
      "due_date": "2024-12-18T15:00:00",
      "status": "pendente",
      "priority": "alta"
    }
  ]
}
```

---

## 🔑 Sistema de Permissões

### Agente (role: "agent")
✅ Criar propriedades (atribuídas automaticamente a si)
✅ Editar suas próprias propriedades
✅ Upload de fotos nas suas propriedades
✅ Gestão completa dos seus leads
✅ Gestão completa das suas tarefas
✅ Atualizar status de propriedades/leads/tarefas
❌ Editar propriedades de outros agentes
❌ Eliminar propriedades

### Coordenador (role: "coordinator")
✅ Todas as permissões de Agente
✅ Editar propriedades de qualquer agente
✅ Ver e gerir leads de todos os agentes
✅ Eliminar propriedades

### Admin (role: "admin")
✅ Permissões completas no sistema

---

## 📊 Códigos de Resposta HTTP

- `200 OK` - Sucesso
- `201 Created` - Recurso criado com sucesso
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `413 Payload Too Large` - Ficheiro muito grande
- `415 Unsupported Media Type` - Tipo de ficheiro não suportado
- `500 Internal Server Error` - Erro do servidor

---

## 🔄 Fluxo Típico de Uso

### 1. Login & Inicialização
```
POST /api/v1/auth/login
GET /mobile/auth/me
GET /mobile/dashboard/stats
```

### 2. Listagem de Dados
```
GET /mobile/properties?my_properties=true&limit=20
GET /mobile/leads?my_leads=true
GET /mobile/tasks/today
```

### 3. Criação de Propriedade
```
POST /mobile/properties
POST /mobile/properties/{id}/photos/upload (múltiplas vezes)
```

### 4. Gestão de Lead
```
GET /mobile/leads/{id}
POST /mobile/leads/{id}/contact?contact_type=call
PATCH /mobile/leads/{id}/status (status: contactado)
```

### 5. Gestão de Tarefas
```
POST /mobile/tasks
PATCH /mobile/tasks/{id}/status (status: concluida)
```

---

## 🚀 Otimizações para Mobile

1. **Paginação Eficiente**: Limits padrão reduzidos (50 items)
2. **Upload Otimizado**: Limite de 10MB por imagem
3. **Filtros Inteligentes**: `my_properties`, `my_leads`, `my_tasks` por padrão
4. **Endpoints Rápidos**: Status updates via PATCH sem enviar todos os dados
5. **Dashboard Widget**: Endpoint `/tasks/today` otimizado para widget
6. **Atividade Recente**: Dados resumidos sem joins pesados

---

## 📝 Notas de Implementação

- Todas as datas estão em formato ISO 8601 UTC
- Uploads de imagens são processados e armazenados no Cloudinary
- As fotos das propriedades são armazenadas como string CSV separada por vírgulas
- Contactos com leads ficam registados no campo `notes` com timestamp
- Tarefas completadas registam automaticamente `completed_at`

---

## 🔧 Ambientes

### Desenvolvimento
```
Base URL: http://localhost:8000
Documentação: http://localhost:8000/docs
```

### Produção (Railway)
```
Base URL: https://crm-plus-production.up.railway.app
Documentação: https://crm-plus-production.up.railway.app/docs
```

---

## 📞 Suporte

Para questões técnicas ou problemas com a API, contacte o dev team.
