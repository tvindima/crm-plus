# 🟡 FASE 2 — INTEGRAÇÕES ESSENCIAIS MOBILE API

**Data:** 19 de dezembro de 2025  
**Deadline:** Até fim da semana (22/12/2025)  
**Prioridade:** 🟡 ALTA - Funcionalidades essenciais de produção  
**Branch:** `feat/mobile-backend-app`  
**Estimativa:** 8-12 horas de desenvolvimento

---

## 📋 SUMÁRIO EXECUTIVO

**FASE 1:** ✅ 20/20 endpoints básicos (COMPLETO)  
**FASE 2:** 🟡 4 integrações críticas (EM PLANEAMENTO)

### Objetivos FASE 2

1. ✅ **Upload Cloudinary Otimizado** - URLs diretas + presets mobile
2. ✅ **Autenticação Multi-Device** - Sessões robustas + device tracking
3. 🆕 **Notificações Tempo Real** - WebSockets para visitas/leads
4. ✅ **Error Handling Padronizado** - Mensagens claras + códigos consistentes

**Resultado Esperado:** Backend production-ready com UX premium

---

## 🎯 TRABALHO DETALHADO

### 1️⃣ ENDPOINTS PARA UPLOAD DE FOTOS VIA URLs

**Status Atual:** ✅ Upload via File já implementado (POST /mobile/properties/{id}/photos/upload)  
**Falta:** Endpoint para receber array de URLs Cloudinary

#### Por Que URLs Diretas?

**Cenário Mobile:**
1. User seleciona 5 fotos na galeria
2. App faz upload direto para Cloudinary (client-side)
3. App recebe 5 URLs do Cloudinary
4. App envia array de URLs para backend em 1 request
5. Backend salva URLs na database

**Vantagens:**
- ✅ **Performance:** Upload paralelo client-side (mais rápido)
- ✅ **Bandwidth backend:** Zero - Cloudinary CDN serve imagens
- ✅ **Offline-first:** App pode fazer queue de uploads
- ✅ **Progress tracking:** App mostra % de cada foto

---

#### A. Criar Upload Preset no Cloudinary

**Aceder:** https://cloudinary.com/console/settings/upload

**Passos:**
1. Settings → Upload → Upload presets
2. Add upload preset:
   ```
   Nome: crm-plus-mobile
   Signing Mode: Unsigned (permite upload direto do app)
   Folder: crm-plus/mobile-uploads
   
   Transformations:
   - Resize: Limit, Width: 2000, Height: 2000 (otimizar)
   - Quality: 85 (comprimir)
   - Format: Auto (WebP se browser suporta)
   
   Upload control:
   - Max file size: 10MB
   - Allowed formats: jpg, png, heic, webp
   - Use filename: true
   ```

3. Copiar **preset name:** `crm-plus-mobile`

**Adicionar ao .env:**
```env
CLOUDINARY_UPLOAD_PRESET_MOBILE=crm-plus-mobile
```

---

#### B. Novo Endpoint: POST /mobile/properties/{id}/photos/bulk

**Ficheiro:** `backend/app/mobile/routes.py`

**Implementação:**

```python
from pydantic import BaseModel, HttpUrl
from typing import List

class PhotoURLInput(BaseModel):
    """Schema para upload de fotos via URLs"""
    url: HttpUrl
    caption: Optional[str] = None
    order: Optional[int] = None

class BulkPhotoUploadInput(BaseModel):
    """Input para upload em massa de URLs"""
    photos: List[PhotoURLInput]  # Array de URLs Cloudinary

@router.post("/properties/{property_id}/photos/bulk")
async def upload_property_photos_bulk(
    property_id: int,
    input: BulkPhotoUploadInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload em massa de fotos via URLs Cloudinary
    
    Cenário: App mobile faz upload direto para Cloudinary,
    depois envia array de URLs para backend salvar na database.
    
    Request Body:
    {
      "photos": [
        {"url": "https://res.cloudinary.com/.../photo1.jpg", "caption": "Sala", "order": 1},
        {"url": "https://res.cloudinary.com/.../photo2.jpg", "caption": "Quarto", "order": 2}
      ]
    }
    """
    # 1. Validar propriedade existe
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Propriedade não encontrada")
    
    # 2. Verificar permissões
    if current_user.role == UserRole.AGENT.value:
        if property.agent_id != current_user.agent_id:
            raise HTTPException(
                status_code=403, 
                detail="Agente não tem permissão sobre esta propriedade"
            )
    
    # 3. Validar URLs são do Cloudinary correto
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    valid_urls = []
    
    for photo in input.photos:
        url_str = str(photo.url)
        
        # Validação segurança: apenas URLs do nosso Cloudinary
        if f"res.cloudinary.com/{cloud_name}" not in url_str:
            raise HTTPException(
                status_code=400,
                detail=f"URL inválida: {url_str}. Apenas URLs do Cloudinary {cloud_name} são permitidas."
            )
        
        valid_urls.append(url_str)
    
    # 4. Adicionar URLs à propriedade
    try:
        if property.photos:
            # Já tem fotos, adicionar às existentes
            existing_photos = property.photos.split(',') if isinstance(property.photos, str) else []
            all_photos = existing_photos + valid_urls
            property.photos = ','.join(all_photos)
        else:
            # Primeira(s) foto(s)
            property.photos = ','.join(valid_urls)
        
        property.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(property)
        
        # 5. Response com confirmação
        total_photos = len(property.photos.split(',')) if property.photos else 0
        
        return {
            "success": True,
            "property_id": property_id,
            "photos_uploaded": len(valid_urls),
            "total_photos": total_photos,
            "urls": valid_urls
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao salvar fotos: {str(e)}"
        )


@router.get("/cloudinary/upload-config")
def get_cloudinary_upload_config(
    current_user: User = Depends(get_current_user)
):
    """
    Retorna configuração para upload direto do mobile para Cloudinary
    
    App usa estas configs para fazer upload client-side antes de 
    enviar URLs para o endpoint /photos/bulk
    """
    return {
        "cloud_name": os.getenv("CLOUDINARY_CLOUD_NAME"),
        "upload_preset": os.getenv("CLOUDINARY_UPLOAD_PRESET_MOBILE"),
        "api_base_url": f"https://api.cloudinary.com/v1_1/{os.getenv('CLOUDINARY_CLOUD_NAME')}/image/upload",
        "folder": "crm-plus/mobile-uploads",
        "max_file_size_mb": 10,
        "allowed_formats": ["jpg", "jpeg", "png", "heic", "webp"]
    }
```

**Testes:**

```bash
# 1. Obter config Cloudinary
curl https://SEU_URL_RAILWAY/mobile/cloudinary/upload-config \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "cloud_name": "dtpk4oqoa",
  "upload_preset": "crm-plus-mobile",
  "api_base_url": "https://api.cloudinary.com/v1_1/dtpk4oqoa/image/upload",
  "folder": "crm-plus/mobile-uploads"
}

# 2. Upload fotos via URLs
curl -X POST https://SEU_URL_RAILWAY/mobile/properties/1/photos/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "photos": [
      {
        "url": "https://res.cloudinary.com/dtpk4oqoa/image/upload/v1234/crm-plus/mobile-uploads/photo1.jpg",
        "caption": "Vista sala",
        "order": 1
      },
      {
        "url": "https://res.cloudinary.com/dtpk4oqoa/image/upload/v1234/crm-plus/mobile-uploads/photo2.jpg",
        "caption": "Cozinha",
        "order": 2
      }
    ]
  }'

# Expected: 200 OK
{
  "success": true,
  "property_id": 1,
  "photos_uploaded": 2,
  "total_photos": 2,
  "urls": [...]
}
```

**Integração Mobile (React Native):**

```typescript
// mobile/app/src/services/cloudinary.ts
import { API_CONFIG } from '../constants/config';

interface CloudinaryConfig {
  cloud_name: string;
  upload_preset: string;
  api_base_url: string;
}

class CloudinaryService {
  private config: CloudinaryConfig | null = null;

  async getConfig(): Promise<CloudinaryConfig> {
    if (this.config) return this.config;

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/mobile/cloudinary/upload-config`,
      {
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      }
    );

    this.config = await response.json();
    return this.config!;
  }

  async uploadPhoto(imageUri: string): Promise<string> {
    const config = await this.getConfig();

    // Criar form data
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);
    formData.append('upload_preset', config.upload_preset);
    formData.append('folder', 'crm-plus/mobile-uploads');

    // Upload direto para Cloudinary (não passa pelo backend)
    const response = await fetch(config.api_base_url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.secure_url; // URL da foto no Cloudinary
  }

  async uploadMultiple(imageUris: string[]): Promise<string[]> {
    // Upload paralelo de todas as fotos
    const uploadPromises = imageUris.map(uri => this.uploadPhoto(uri));
    return Promise.all(uploadPromises);
  }
}

export const cloudinaryService = new CloudinaryService();
```

**Uso no App:**

```typescript
// Exemplo: Criar angariação com fotos
async function createPropertyWithPhotos(propertyData, photoUris) {
  try {
    // 1. Upload fotos para Cloudinary (paralelo, client-side)
    const photoUrls = await cloudinaryService.uploadMultiple(photoUris);
    
    // 2. Criar propriedade
    const property = await api.post('/mobile/properties', propertyData);
    
    // 3. Associar fotos à propriedade (1 request com todas as URLs)
    await api.post(`/mobile/properties/${property.id}/photos/bulk`, {
      photos: photoUrls.map((url, index) => ({
        url,
        order: index + 1
      }))
    });
    
    return property;
  } catch (error) {
    console.error('Erro ao criar propriedade:', error);
    throw error;
  }
}
```

---

### 2️⃣ AUTENTICAÇÃO MULTI-DEVICE ROBUSTA

**Status Atual:** ✅ Refresh token já implementado com rotation  
**Falta:** Device tracking e gestão de sessões múltiplas

#### A. Melhorar RefreshToken Model

**Ficheiro:** `backend/app/users/refresh_token.py`

**Adicionar campos:**

```python
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Device tracking (NOVO)
    device_info = Column(String, nullable=True)  # User-Agent
    device_name = Column(String, nullable=True)  # "iPhone 15 Pro" (opcional, frontend envia)
    device_type = Column(String, nullable=True)  # "mobile", "tablet", "desktop"
    ip_address = Column(String, nullable=True)   # IP do último uso
    last_used_at = Column(DateTime, nullable=True)  # Timestamp último refresh
    
    expires_at = Column(DateTime, nullable=False, index=True)
    is_revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="refresh_tokens")
```

**Migration:**

```bash
# Criar migration
cd backend
alembic revision --autogenerate -m "add device tracking to refresh_tokens"

# Aplicar
alembic upgrade head
```

#### B. Atualizar Endpoint /auth/login

**Ficheiro:** `backend/app/api/v1/auth_mobile.py`

**Capturar device info:**

```python
from fastapi import Request

@router.post("/auth/mobile/login")
def mobile_login(
    payload: LoginPayload,
    request: Request,  # Novo: capturar request info
    db: Session = Depends(get_db)
):
    # ... validação user/password ...
    
    # Extrair device info do User-Agent
    user_agent = request.headers.get("User-Agent", "Unknown")
    
    # Parse device type (simplificado)
    device_type = "unknown"
    if "iPhone" in user_agent or "Android" in user_agent:
        device_type = "mobile"
    elif "iPad" in user_agent or "Tablet" in user_agent:
        device_type = "tablet"
    else:
        device_type = "desktop"
    
    # Extrair IP (considerar proxies/load balancers)
    client_ip = request.client.host if request.client else "unknown"
    if "X-Forwarded-For" in request.headers:
        client_ip = request.headers["X-Forwarded-For"].split(",")[0].strip()
    
    # Criar refresh token com device info
    new_refresh_token = RefreshToken(
        token=RefreshToken.generate_token(),
        user_id=user.id,
        device_info=user_agent,
        device_type=device_type,
        device_name=payload.device_name,  # Frontend envia (opcional)
        ip_address=client_ip,
        last_used_at=datetime.utcnow(),
        expires_at=RefreshToken.create_expiry(days=7)
    )
    
    db.add(new_refresh_token)
    db.commit()
    
    # ... gerar access token e retornar ...
```

**Schema atualizado:**

```python
class LoginPayload(BaseModel):
    email: EmailStr
    password: str
    device_name: Optional[str] = None  # "iPhone de Tiago"

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_at: datetime
    device_id: int  # ID do refresh_token (para gestão)
```

#### C. Endpoint de Gestão de Sessões

**Novo endpoint:** `GET /mobile/auth/sessions`

```python
@router.get("/auth/sessions")
def list_user_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todas as sessões ativas do usuário
    Útil para feature "Devices ativos" no app
    """
    sessions = db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id,
        RefreshToken.is_revoked == False,
        RefreshToken.expires_at > datetime.utcnow()
    ).order_by(RefreshToken.last_used_at.desc()).all()
    
    return {
        "total_sessions": len(sessions),
        "sessions": [
            {
                "id": s.id,
                "device_name": s.device_name or "Dispositivo desconhecido",
                "device_type": s.device_type,
                "ip_address": s.ip_address,
                "last_used": s.last_used_at,
                "created_at": s.created_at,
                "expires_at": s.expires_at,
                "is_current": False  # TODO: comparar com token atual
            }
            for s in sessions
        ]
    }
```

**Revogar sessão específica:**

```python
@router.delete("/auth/sessions/{session_id}")
def revoke_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Revoga sessão específica (logout remoto)
    Útil para revogar acesso de device perdido
    """
    session = db.query(RefreshToken).filter(
        RefreshToken.id == session_id,
        RefreshToken.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(404, "Sessão não encontrada")
    
    session.revoke()
    db.commit()
    
    return {"success": True, "message": "Sessão revogada com sucesso"}
```

**Revogar todas as sessões (exceto atual):**

```python
@router.post("/auth/sessions/revoke-all")
def revoke_all_sessions(
    current_token: str = Depends(get_current_token),  # Token atual
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Revoga todas as sessões exceto a atual
    Útil para "Fazer logout em todos os dispositivos"
    """
    # Buscar todas as sessões ativas
    sessions = db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id,
        RefreshToken.is_revoked == False
    ).all()
    
    revoked_count = 0
    for session in sessions:
        # Não revogar a sessão atual (comparar token)
        if session.token != current_token:
            session.revoke()
            revoked_count += 1
    
    db.commit()
    
    return {
        "success": True,
        "sessions_revoked": revoked_count,
        "message": f"{revoked_count} sessões revogadas"
    }
```

---

### 3️⃣ NOTIFICAÇÕES EM TEMPO REAL (WebSockets)

**Objetivo:** Push notifications para eventos críticos (nova lead, visita agendada, etc)

#### A. Adicionar Dependência WebSocket

**Ficheiro:** `backend/requirements.txt`

```txt
fastapi
uvicorn[standard]
websockets>=12.0  # Novo
...
```

#### B. Criar Sistema de Eventos

**Novo ficheiro:** `backend/app/core/events.py`

```python
"""
Sistema de eventos em tempo real via WebSockets
"""
from typing import Dict, Set, Callable
from datetime import datetime
import json
import asyncio

class EventBus:
    """
    Bus centralizado de eventos
    Permite publish/subscribe entre componentes
    """
    def __init__(self):
        self._subscribers: Dict[str, Set[Callable]] = {}
    
    def subscribe(self, event_type: str, callback: Callable):
        """Inscrever callback para evento específico"""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = set()
        self._subscribers[event_type].add(callback)
    
    def unsubscribe(self, event_type: str, callback: Callable):
        """Remover inscrição"""
        if event_type in self._subscribers:
            self._subscribers[event_type].discard(callback)
    
    async def publish(self, event_type: str, data: dict):
        """Publicar evento para todos os subscribers"""
        if event_type in self._subscribers:
            tasks = []
            for callback in self._subscribers[event_type]:
                if asyncio.iscoroutinefunction(callback):
                    tasks.append(callback(data))
                else:
                    callback(data)
            
            if tasks:
                await asyncio.gather(*tasks)

# Singleton global
event_bus = EventBus()
```

#### C. WebSocket Manager

**Novo ficheiro:** `backend/app/core/websocket.py`

```python
"""
Gerenciador de conexões WebSocket
"""
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json
from datetime import datetime

class ConnectionManager:
    """Gerencia conexões WebSocket de múltiplos clientes"""
    
    def __init__(self):
        # agent_id -> Set[WebSocket]
        self.active_connections: Dict[int, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, agent_id: int):
        """Aceitar nova conexão"""
        await websocket.accept()
        
        if agent_id not in self.active_connections:
            self.active_connections[agent_id] = set()
        
        self.active_connections[agent_id].add(websocket)
        
        print(f"[WS] Agent {agent_id} connected. Total connections: {len(self.active_connections[agent_id])}")
    
    def disconnect(self, websocket: WebSocket, agent_id: int):
        """Remover conexão"""
        if agent_id in self.active_connections:
            self.active_connections[agent_id].discard(websocket)
            
            # Limpar se não há mais conexões
            if not self.active_connections[agent_id]:
                del self.active_connections[agent_id]
        
        print(f"[WS] Agent {agent_id} disconnected")
    
    async def send_personal_message(self, message: dict, agent_id: int):
        """Enviar mensagem para um agente específico (todos os devices)"""
        if agent_id in self.active_connections:
            disconnected = set()
            
            for websocket in self.active_connections[agent_id]:
                try:
                    await websocket.send_json(message)
                except:
                    disconnected.add(websocket)
            
            # Remover conexões mortas
            for ws in disconnected:
                self.active_connections[agent_id].discard(ws)
    
    async def broadcast(self, message: dict):
        """Broadcast para todos os agentes conectados"""
        for agent_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, agent_id)

# Singleton
manager = ConnectionManager()
```

#### D. Endpoint WebSocket

**Ficheiro:** `backend/app/mobile/routes.py`

```python
from fastapi import WebSocket, WebSocketDisconnect
from app.core.websocket import manager
from app.core.events import event_bus

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),  # JWT token via query param
    db: Session = Depends(get_db)
):
    """
    WebSocket para notificações em tempo real
    
    Conexão: ws://localhost:8000/mobile/ws?token={JWT_TOKEN}
    
    Eventos enviados:
    - new_lead: Nova lead atribuída ao agente
    - visit_scheduled: Visita agendada
    - visit_reminder: Lembrete de visita (30min antes)
    - lead_status_changed: Status de lead mudou
    """
    try:
        # 1. Validar token JWT
        payload = decode_access_token(token)
        agent_id = payload.get("agent_id")
        
        if not agent_id:
            await websocket.close(code=4001, reason="Token inválido - sem agent_id")
            return
        
        # 2. Conectar
        await manager.connect(websocket, agent_id)
        
        # 3. Enviar mensagem de boas-vindas
        await websocket.send_json({
            "type": "connected",
            "agent_id": agent_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # 4. Manter conexão alive (heartbeat)
        while True:
            # Aguardar mensagens do cliente (ping/pong)
            data = await websocket.receive_text()
            
            if data == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, agent_id)
    
    except Exception as e:
        print(f"[WS] Erro: {e}")
        manager.disconnect(websocket, agent_id)
        await websocket.close()
```

#### E. Integrar Eventos com CRUD

**Exemplo: Notificar quando lead é criada**

**Ficheiro:** `backend/app/mobile/routes.py` (endpoint POST /leads)

```python
from app.core.websocket import manager
from app.core.events import event_bus

@router.post("/leads", response_model=lead_schemas.LeadOut, status_code=201)
async def create_mobile_lead(
    input: lead_schemas.LeadCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # ... criar lead na database ...
    
    # NOVO: Publicar evento WebSocket
    await manager.send_personal_message(
        message={
            "type": "new_lead",
            "data": {
                "lead_id": new_lead.id,
                "name": new_lead.name,
                "property_id": new_lead.property_id,
                "created_at": new_lead.created_at.isoformat()
            },
            "timestamp": datetime.utcnow().isoformat()
        },
        agent_id=current_user.agent_id
    )
    
    return new_lead
```

**Exemplo: Notificar 30min antes de visita**

**Novo ficheiro:** `backend/app/core/scheduler.py`

```python
"""
Background tasks para notificações agendadas
"""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.visit import Visit, VisitStatus
from app.core.websocket import manager

async def visit_reminder_task():
    """
    Task que roda a cada 5 minutos
    Envia lembrete para visitas que iniciam em 30 minutos
    """
    while True:
        try:
            db = SessionLocal()
            
            # Buscar visitas que iniciam em 25-35 minutos
            now = datetime.utcnow()
            start_window = now + timedelta(minutes=25)
            end_window = now + timedelta(minutes=35)
            
            upcoming_visits = db.query(Visit).filter(
                Visit.scheduled_at.between(start_window, end_window),
                Visit.status.in_([VisitStatus.SCHEDULED.value, VisitStatus.CONFIRMED.value]),
                Visit.reminder_sent == False  # Novo campo
            ).all()
            
            for visit in upcoming_visits:
                # Enviar notificação WebSocket
                await manager.send_personal_message(
                    message={
                        "type": "visit_reminder",
                        "data": {
                            "visit_id": visit.id,
                            "property_title": visit.property_obj.title,
                            "scheduled_at": visit.scheduled_at.isoformat(),
                            "minutes_until": int((visit.scheduled_at - now).total_seconds() / 60)
                        },
                        "timestamp": now.isoformat()
                    },
                    agent_id=visit.agent_id
                )
                
                # Marcar como enviado
                visit.reminder_sent = True
            
            db.commit()
            db.close()
        
        except Exception as e:
            print(f"[Scheduler] Erro: {e}")
        
        # Aguardar 5 minutos
        await asyncio.sleep(300)

# Iniciar task no startup do FastAPI
from app.main import app

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(visit_reminder_task())
```

#### F. Cliente Mobile (React Native)

```typescript
// mobile/app/src/services/websocket.ts
import { API_CONFIG } from '../constants/config';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(accessToken: string) {
    const wsUrl = API_CONFIG.BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    
    this.ws = new WebSocket(`${wsUrl}/mobile/ws?token=${accessToken}`);

    this.ws.onopen = () => {
      console.log('[WS] Conectado');
      this.reconnectAttempts = 0;
      
      // Heartbeat a cada 30s
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      // Notificar listeners
      const listeners = this.listeners.get(message.type) || new Set();
      listeners.forEach(callback => callback(message.data));
    };

    this.ws.onerror = (error) => {
      console.error('[WS] Erro:', error);
    };

    this.ws.onclose = () => {
      console.log('[WS] Desconectado');
      this.attemptReconnect(accessToken);
    };
  }

  on(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  off(eventType: string, callback: Function) {
    this.listeners.get(eventType)?.delete(callback);
  }

  private startHeartbeat() {
    setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, 30000);
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(token), 5000);
    }
  }
}

export const wsService = new WebSocketService();
```

**Uso no App:**

```typescript
// Conectar no login
wsService.connect(accessToken);

// Escutar eventos
wsService.on('new_lead', (data) => {
  showNotification({
    title: 'Nova Lead!',
    body: `${data.name} interessado em propriedade`,
    data: { leadId: data.lead_id }
  });
  
  // Atualizar lista de leads
  refetchLeads();
});

wsService.on('visit_reminder', (data) => {
  showNotification({
    title: 'Lembrete de Visita',
    body: `Visita em ${data.property_title} começa em ${data.minutes_until}min`,
    data: { visitId: data.visit_id }
  });
});
```

---

### 4️⃣ TRATAMENTO DE ERROS PADRONIZADO

**Objetivo:** Respostas consistentes e mensagens claras em todos os endpoints

#### A. Exception Handlers Globais

**Ficheiro:** `backend/app/main.py`

```python
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, OperationalError
import traceback

app = FastAPI(...)

# 1. Validação Pydantic (422)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Erros de validação de input (campos faltando, tipos errados, etc)
    """
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "Dados de entrada inválidos. Verifique os campos abaixo.",
            "details": errors,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# 2. Integridade de Database (409)
@app.exception_handler(IntegrityError)
async def integrity_exception_handler(request: Request, exc: IntegrityError):
    """
    Violação de constraints (UNIQUE, FOREIGN KEY, etc)
    """
    error_msg = str(exc.orig)
    
    # Mensagens amigáveis
    if "UNIQUE constraint" in error_msg:
        message = "Este registro já existe na base de dados."
    elif "FOREIGN KEY constraint" in error_msg:
        message = "Registro relacionado não encontrado."
    else:
        message = "Erro de integridade de dados."
    
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "error": "Integrity Error",
            "message": message,
            "details": error_msg if os.getenv("ENVIRONMENT") == "development" else None,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# 3. Erro de Conexão Database (503)
@app.exception_handler(OperationalError)
async def database_exception_handler(request: Request, exc: OperationalError):
    """
    Database indisponível ou erro de conexão
    """
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "error": "Database Error",
            "message": "Serviço temporariamente indisponível. Tente novamente em instantes.",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# 4. Erros Genéricos (500)
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Catch-all para erros não tratados
    """
    # Log completo (produção: enviar para Sentry/DataDog)
    print(f"[ERROR] {type(exc).__name__}: {exc}")
    if os.getenv("ENVIRONMENT") == "development":
        traceback.print_exc()
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "Ocorreu um erro inesperado. Equipa técnica foi notificada.",
            "details": str(exc) if os.getenv("ENVIRONMENT") == "development" else None,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

#### B. Custom Exceptions

**Novo ficheiro:** `backend/app/core/exceptions.py`

```python
"""
Exceções customizadas para erros de negócio
"""
from fastapi import HTTPException, status

class BusinessRuleError(HTTPException):
    """Erro de regra de negócio (validações específicas)"""
    def __init__(self, message: str, details: dict = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Business Rule Violation",
                "message": message,
                "details": details
            }
        )

class ResourceNotFoundError(HTTPException):
    """Recurso não encontrado (404)"""
    def __init__(self, resource: str, identifier: int | str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "Not Found",
                "message": f"{resource} não encontrado(a).",
                "identifier": identifier
            }
        )

class PermissionDeniedError(HTTPException):
    """Sem permissão (403)"""
    def __init__(self, message: str = "Sem permissão para esta operação"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Permission Denied",
                "message": message
            }
        )

class ConflictError(HTTPException):
    """Conflito de estado (409)"""
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": "Conflict",
                "message": message
            }
        )
```

**Uso nos endpoints:**

```python
from app.core.exceptions import (
    BusinessRuleError,
    ResourceNotFoundError,
    PermissionDeniedError
)

@router.post("/visits")
async def create_visit(input, current_user, db):
    # Validar propriedade existe
    property = db.query(Property).filter(Property.id == input.property_id).first()
    if not property:
        raise ResourceNotFoundError("Propriedade", input.property_id)
    
    # Validar permissões
    if property.agent_id != current_user.agent_id:
        raise PermissionDeniedError(
            "Não pode agendar visitas em propriedades de outros agentes"
        )
    
    # Validar horário disponível
    conflicting_visit = db.query(Visit).filter(
        Visit.agent_id == current_user.agent_id,
        Visit.scheduled_at == input.scheduled_at,
        Visit.status.in_([VisitStatus.SCHEDULED, VisitStatus.CONFIRMED])
    ).first()
    
    if conflicting_visit:
        raise BusinessRuleError(
            "Já existe visita agendada neste horário",
            details={
                "conflicting_visit_id": conflicting_visit.id,
                "scheduled_at": input.scheduled_at.isoformat()
            }
        )
    
    # Criar visita...
```

#### C. Logging Estruturado

**Adicionar dependência:**

```txt
# requirements.txt
python-json-logger>=2.0.7
```

**Configurar logging:**

```python
# backend/app/core/logging.py
import logging
import sys
from pythonjsonlogger import jsonlogger

def setup_logging():
    """Configura logging estruturado (JSON format)"""
    
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Handler para stdout (Railway/Docker logs)
    handler = logging.StreamHandler(sys.stdout)
    
    # Format JSON
    formatter = jsonlogger.JsonFormatter(
        '%(timestamp)s %(level)s %(name)s %(message)s %(pathname)s %(lineno)d',
        rename_fields={
            "levelname": "level",
            "asctime": "timestamp"
        }
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger

# Usar em main.py
from app.core.logging import setup_logging

logger = setup_logging()

# Nos endpoints:
logger.info("Lead criada", extra={
    "lead_id": new_lead.id,
    "agent_id": current_user.agent_id,
    "property_id": input.property_id
})

logger.error("Erro ao criar lead", extra={
    "error": str(e),
    "user_id": current_user.id
}, exc_info=True)
```

---

## 📊 RESUMO DE IMPLEMENTAÇÃO

### Checklist Fase 2

**1. Upload Cloudinary:**
- [ ] Criar upload preset no Cloudinary dashboard
- [ ] Adicionar `CLOUDINARY_UPLOAD_PRESET_MOBILE` ao `.env`
- [ ] Implementar `POST /mobile/properties/{id}/photos/bulk`
- [ ] Implementar `GET /mobile/cloudinary/upload-config`
- [ ] Testar upload bulk com 5 URLs
- [ ] Documentar no Swagger

**2. Autenticação Multi-Device:**
- [ ] Adicionar campos device tracking ao `RefreshToken`
- [ ] Criar migration `add_device_tracking_to_refresh_tokens`
- [ ] Atualizar `/auth/mobile/login` para capturar device info
- [ ] Implementar `GET /auth/sessions` (listar)
- [ ] Implementar `DELETE /auth/sessions/{id}` (revogar)
- [ ] Implementar `POST /auth/sessions/revoke-all`
- [ ] Testar login multi-device (iOS + Android simultâneo)

**3. WebSocket Notificações:**
- [ ] Adicionar `websockets>=12.0` ao requirements
- [ ] Criar `backend/app/core/events.py` (EventBus)
- [ ] Criar `backend/app/core/websocket.py` (ConnectionManager)
- [ ] Implementar `websocket /mobile/ws`
- [ ] Integrar evento `new_lead` no POST /leads
- [ ] Integrar evento `visit_scheduled` no POST /visits
- [ ] Criar scheduler para `visit_reminder` (30min antes)
- [ ] Testar conexão WebSocket + heartbeat
- [ ] Testar notificação cross-device

**4. Error Handling:**
- [ ] Criar exception handlers globais em `main.py`
- [ ] Criar `backend/app/core/exceptions.py` (custom exceptions)
- [ ] Refatorar endpoints para usar custom exceptions
- [ ] Adicionar `python-json-logger` ao requirements
- [ ] Configurar logging estruturado (JSON)
- [ ] Testar cada tipo de erro (400, 401, 403, 404, 422, 500)
- [ ] Validar mensagens são claras em português

---

## 🧪 PLANO DE TESTES

### Testes Upload Cloudinary

```bash
# 1. Obter config
curl /mobile/cloudinary/upload-config

# 2. Upload direto para Cloudinary (simular mobile)
curl -X POST https://api.cloudinary.com/v1_1/dtpk4oqoa/image/upload \
  -F "file=@photo.jpg" \
  -F "upload_preset=crm-plus-mobile" \
  -F "folder=crm-plus/mobile-uploads"

# 3. Bulk upload URLs
curl -X POST /mobile/properties/1/photos/bulk \
  -d '{"photos": [{"url": "https://res.cloudinary.com/..."}, {...}]}'
```

### Testes Multi-Device

```bash
# 1. Login Device A (iPhone)
curl -X POST /auth/mobile/login \
  -d '{"email":"...","password":"...","device_name":"iPhone de Tiago"}'

# 2. Login Device B (iPad)
curl -X POST /auth/mobile/login \
  -d '{"email":"...","password":"...","device_name":"iPad Pro"}'

# 3. Listar sessões ativas
curl /auth/sessions

# Expected: 2 sessões

# 4. Revogar Device A
curl -X DELETE /auth/sessions/{device_a_id}

# 5. Device A tenta refresh → 401 Unauthorized
```

### Testes WebSocket

```javascript
// Browser console
const ws = new WebSocket('ws://localhost:8000/mobile/ws?token=eyJ...');

ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};

// Trigger evento (criar lead em outro tab)
// → WebSocket deve receber notificação

// Heartbeat
setInterval(() => ws.send('ping'), 30000);
```

### Testes Error Handling

```bash
# 422 - Validação
curl -X POST /mobile/leads -d '{"name": 123}'  # name deve ser string
# Expected: {"error":"Validation Error","details":[...]}

# 404 - Not Found
curl /mobile/properties/999999
# Expected: {"error":"Not Found","message":"Propriedade não encontrada"}

# 403 - Permission Denied
curl /mobile/properties/999/photos/upload  # propriedade de outro agente
# Expected: {"error":"Permission Denied","message":"..."}

# 409 - Conflict
curl -X POST /mobile/visits -d '{"scheduled_at":"2025-12-20T10:00",...}'
curl -X POST /mobile/visits -d '{"scheduled_at":"2025-12-20T10:00",...}'  # mesmo horário
# Expected: {"error":"Business Rule Violation","message":"Já existe visita..."}
```

---

## 📈 MÉTRICAS DE SUCESSO

**Performance:**
- WebSocket latency <100ms
- Upload bulk (5 fotos) <10s
- Error response time <50ms

**Funcionalidade:**
- ✅ 100% uploads via URLs funcionais
- ✅ Multi-device sessions tracked
- ✅ WebSocket notificações real-time
- ✅ Errors sempre com mensagens PT claras

**Experiência:**
- Zero confusão sobre erros (mensagens claras)
- Notificações chegam <2s após evento
- Múltiplos devices sem conflitos

---

## 🚀 DEPLOYMENT

**Adicionar ao `.env` Railway:**

```env
# Cloudinary
CLOUDINARY_UPLOAD_PRESET_MOBILE=crm-plus-mobile

# Logging
ENVIRONMENT=production
LOG_LEVEL=INFO

# WebSocket (se usar Nginx/load balancer)
WS_PING_INTERVAL=30
WS_PING_TIMEOUT=10
```

**Atualizar `requirements.txt`:**
```bash
pip install websockets python-json-logger
pip freeze > requirements.txt
```

**Aplicar migrations:**
```bash
alembic revision --autogenerate -m "add device tracking"
alembic upgrade head
```

---

## 📞 COMUNICAÇÃO FRONTEND

**Template Email/Slack:**

```
Subject: [MOBILE API] FASE 2 Implementada - Notificações Real-Time + Multi-Device

Time Frontend,

FASE 2 deployada com 4 novas integrações! 🎉

✅ IMPLEMENTADO:

1. Upload Cloudinary via URLs
   - Endpoint: POST /mobile/properties/{id}/photos/bulk
   - Config: GET /mobile/cloudinary/upload-config
   - Permite upload direto do app (client-side)

2. Multi-Device Sessions
   - Endpoint: GET /auth/sessions (listar devices)
   - Endpoint: DELETE /auth/sessions/{id} (revogar device)
   - Track IP, device type, last used

3. WebSocket Notificações
   - ws://URL/mobile/ws?token={JWT}
   - Eventos: new_lead, visit_scheduled, visit_reminder
   - Real-time push para todos os devices do agente

4. Error Handling Padronizado
   - Mensagens claras em português
   - Códigos HTTP consistentes
   - Details object com contexto

📚 DOCS:
- Swagger: /docs (atualizado com novos endpoints)
- Guia WebSocket: [link doc]
- Exemplos Cloudinary: [link doc]

🧪 AÇÕES FRONTEND:
1. Implementar upload Cloudinary client-side
2. Integrar WebSocket service (template fornecido)
3. Testar multi-device (2 simuladores)
4. Validar error handling UI (toasts/alerts)

🐛 TESTES:
- Todos os 4 features testados e validados ✅
- Performance OK (<100ms WS, <10s upload bulk)
- Backward compatible (FASE 1 inalterada)

Timeline:
- Hoje: Frontend integra WebSocket
- Amanhã: Testes E2E multi-device
- 22/12: Code review FASE 2

Let's ship! 🚀
```

---

**FIM DO GUIA FASE 2**

*Gerado: 19/12/2025 às 09:45*  
*Autor: Backend Dev Team*  
*Deadline: 22/12/2025 (fim de semana)*  
*Estimativa: 8-12h desenvolvimento + 4h testes*
