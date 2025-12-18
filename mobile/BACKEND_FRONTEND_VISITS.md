# 📋 BACKEND → FRONTEND: Sistema de Visitas Mobile

**Data**: 18 de dezembro de 2025  
**Versão Backend**: v1.2.0  
**Status**: ✅ Endpoints prontos para integração  
**Prioridade**: Alta

---

## 🎯 RESUMO EXECUTIVO

O **sistema completo de visitas** está implementado no backend e pronto para integração mobile.

### ✅ O Que Está Pronto
- ✅ Model `Visit` com 24 campos
- ✅ 10 endpoints REST funcionais
- ✅ 9 schemas Pydantic validados
- ✅ Migration Alembic aplicada
- ✅ Índices de performance otimizados
- ✅ Side effects automáticos (tasks, lead status)
- ✅ Validações GPS (Haversine)
- ✅ Documentação OpenAPI completa

### 🎯 O Que o Frontend Precisa Fazer
- Implementar 6 telas principais
- Integrar geolocalização (GPS)
- Criar formulários de feedback
- Widgets de dashboard
- Sistema de notificações

**Estimativa**: 8-11 dias de desenvolvimento

---

## 🏗️ BACKEND: O QUE FOI IMPLEMENTADO

### 📊 Model Visit

**Arquivo**: `backend/app/models/visit.py`

```python
class Visit:
    # Identificação
    id: int
    property_id: int
    lead_id: Optional[int]
    agent_id: int
    
    # Agendamento
    scheduled_at: datetime
    duration_minutes: int = 60
    
    # Status e Workflow
    status: VisitStatus  # scheduled, confirmed, in_progress, completed, cancelled, no_show
    
    # Check-in/Check-out
    checked_in_at: Optional[datetime]
    checked_out_at: Optional[datetime]
    check_in_latitude: Optional[float]
    check_in_longitude: Optional[float]
    check_out_latitude: Optional[float]
    check_out_longitude: Optional[float]
    
    # Feedback
    feedback_notes: Optional[str]
    interest_level: Optional[InterestLevel]  # none, low, medium, high, very_high
    rating: Optional[int]  # 1-5
    client_feedback: Optional[str]
    
    # Follow-up
    next_steps: Optional[str]
    follow_up_date: Optional[date]
    
    # Metadata
    created_at: datetime
    updated_at: datetime
```

### 🔄 Status Workflow

```
scheduled → confirmed → in_progress → completed
    ↓           ↓
cancelled   no_show
```

**Transições Válidas**:
- `scheduled` → `confirmed`, `cancelled`, `no_show`
- `confirmed` → `in_progress`, `cancelled`, `no_show`
- `in_progress` → `completed`, `cancelled`

### 🌐 Endpoints Disponíveis

#### 1. **GET /mobile/visits**
Lista visitas com paginação e filtros

**Query Params**:
```typescript
{
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  from_date?: string  // YYYY-MM-DD
  to_date?: string
  property_id?: number
  lead_id?: number
  page?: number
  size?: number
}
```

**Response**:
```typescript
{
  items: Visit[]
  total: number
  page: number
  size: number
  pages: number
}
```

**Exemplo**:
```bash
GET /mobile/visits?status=scheduled&from_date=2025-12-18&page=1&size=20
```

---

#### 2. **GET /mobile/visits/today**
Widget para dashboard - visitas de hoje

**Response**:
```typescript
{
  total_today: number
  completed: number
  pending: number
  in_progress: number
  upcoming: Visit[]  // próximas 3 visitas
}
```

**Uso**: Exibir card no dashboard do agente

---

#### 3. **GET /mobile/visits/{id}**
Detalhes completos de uma visita

**Response**:
```typescript
{
  id: number
  property: {
    id: number
    title: string
    address: string
    photos: string[]
  }
  lead?: {
    id: number
    name: string
    phone: string
    email: string
  }
  agent: {
    id: number
    name: string
    avatar_url: string
  }
  scheduled_at: string
  duration_minutes: number
  status: string
  // ... todos os campos do modelo
}
```

---

#### 4. **POST /mobile/visits**
Criar nova visita

**Request**:
```typescript
{
  property_id: number
  lead_id?: number
  scheduled_at: string  // ISO 8601
  duration_minutes?: number
  notes?: string
}
```

**Response**:
```typescript
{
  id: number
  status: "scheduled"
  // ... dados completos da visita
}
```

**Side Effects**:
- ✅ Cria task no calendário do agente
- ✅ Atualiza status do lead (se fornecido)

---

#### 5. **PUT /mobile/visits/{id}**
Editar visita (antes de iniciar)

**Request**:
```typescript
{
  scheduled_at?: string
  duration_minutes?: number
  notes?: string
  property_id?: number
  lead_id?: number
}
```

**Regras**:
- ❌ Não pode editar visita `in_progress` ou `completed`
- ✅ Pode editar `scheduled` ou `confirmed`

---

#### 6. **PATCH /mobile/visits/{id}/status**
Atualizar status (confirmar, cancelar)

**Request**:
```typescript
{
  status: 'confirmed' | 'cancelled' | 'no_show'
  cancellation_reason?: string
}
```

**Validações**:
- Verifica transições válidas
- `cancellation_reason` obrigatório se `status=cancelled`

---

#### 7. **POST /mobile/visits/{id}/check-in**
Check-in com GPS ⭐

**Request**:
```typescript
{
  latitude: number   // -90 a 90
  longitude: number  // -180 a 180
}
```

**Response**:
```typescript
{
  id: number
  status: "in_progress"
  checked_in_at: string
  check_in_latitude: number
  check_in_longitude: number
  distance_from_property: number  // metros
}
```

**Backend faz**:
1. Valida que status = `confirmed` ou `scheduled`
2. Calcula distância da propriedade (Haversine)
3. Alerta se > 500m da propriedade
4. Atualiza status → `in_progress`
5. Registra timestamp

---

#### 8. **POST /mobile/visits/{id}/check-out**
Check-out com feedback completo ⭐

**Request**:
```typescript
{
  latitude: number
  longitude: number
  feedback_notes?: string
  interest_level?: 'none' | 'low' | 'medium' | 'high' | 'very_high'
  rating?: number  // 1-5
  client_feedback?: string
  next_steps?: string
  follow_up_date?: string  // YYYY-MM-DD
}
```

**Response**:
```typescript
{
  id: number
  status: "completed"
  checked_out_at: string
  duration_actual_minutes: number
  // ... todos os dados
}
```

**Backend faz**:
1. Valida que status = `in_progress`
2. Calcula duração real
3. Registra GPS de saída
4. Atualiza status → `completed`
5. Se `interest_level` >= `high`, atualiza lead status

---

#### 9. **POST /mobile/visits/{id}/feedback**
Adicionar feedback standalone (após visita)

**Request**:
```typescript
{
  feedback_notes?: string
  interest_level?: string
  rating?: number
  client_feedback?: string
  next_steps?: string
  follow_up_date?: string
}
```

**Uso**: Agente esqueceu de dar feedback no check-out

---

## 📱 FRONTEND: O QUE IMPLEMENTAR

### 🎨 Telas Necessárias

#### 1. **Lista de Visitas** (`VisitsListScreen.tsx`)

**Features**:
- [ ] FlatList com scroll infinito
- [ ] Filtros por status (tabs ou dropdown)
- [ ] Filtro por data (hoje, esta semana, personalizado)
- [ ] Pull-to-refresh
- [ ] Card de visita com:
  - Horário e duração
  - Foto da propriedade
  - Nome do lead (se houver)
  - Status badge colorido
  - Botões de ação contextual

**Exemplo de Card**:
```tsx
<VisitCard
  visit={visit}
  onPress={() => navigate('VisitDetails', { id: visit.id })}
  onCheckIn={() => handleCheckIn(visit.id)}
  onCancel={() => handleCancel(visit.id)}
/>
```

---

#### 2. **Detalhes da Visita** (`VisitDetailsScreen.tsx`)

**Sections**:
- [ ] Header com foto da propriedade
- [ ] Informações da visita (data, hora, duração)
- [ ] Dados do lead (se houver)
- [ ] Endereço da propriedade com botão "Ver no Mapa"
- [ ] Botão de ação principal (Check-in, Check-out, Editar)
- [ ] Histórico de status
- [ ] Feedback (se completed)

**Ações**:
```tsx
// Status = scheduled ou confirmed
<Button onPress={handleCheckIn}>Check-in</Button>

// Status = in_progress
<Button onPress={handleCheckOut}>Check-out</Button>

// Status = completed
<FeedbackDisplay feedback={visit} />
```

---

#### 3. **Criar Visita** (`CreateVisitScreen.tsx`)

**Formulário**:
```tsx
<Form>
  <PropertyPicker
    onSelect={(property) => setPropertyId(property.id)}
  />
  
  <LeadPicker
    optional
    onSelect={(lead) => setLeadId(lead.id)}
  />
  
  <DateTimePicker
    value={scheduledAt}
    onChange={setScheduledAt}
  />
  
  <DurationPicker
    value={duration}
    onChange={setDuration}
    options={[30, 60, 90, 120]}
  />
  
  <TextArea
    placeholder="Notas (opcional)"
    value={notes}
    onChange={setNotes}
  />
  
  <Button onPress={handleCreate}>
    Agendar Visita
  </Button>
</Form>
```

**API Call**:
```typescript
const createVisit = async (data: CreateVisitRequest) => {
  const response = await apiService.post<Visit>('/mobile/visits', data);
  return response;
};
```

---

#### 4. **Check-in Screen** (`CheckInScreen.tsx`)

**Features**:
- [ ] Obter geolocalização atual
- [ ] Exibir mapa com pin da propriedade e localização atual
- [ ] Calcular e exibir distância
- [ ] Alerta se > 500m da propriedade
- [ ] Botão "Confirmar Check-in"

**Implementação GPS**:
```typescript
import * as Location from 'expo-location';

const handleCheckIn = async (visitId: number) => {
  // 1. Pedir permissão
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Erro', 'Permissão de localização negada');
    return;
  }
  
  // 2. Obter localização
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  
  // 3. Enviar para backend
  try {
    const response = await apiService.post(
      `/mobile/visits/${visitId}/check-in`,
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
    );
    
    // 4. Verificar distância
    if (response.distance_from_property > 500) {
      Alert.alert(
        'Atenção',
        `Você está a ${Math.round(response.distance_from_property)}m da propriedade. Tem certeza?`,
        [
          { text: 'Cancelar' },
          { text: 'Confirmar', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      Alert.alert('Sucesso', 'Check-in realizado!');
      navigation.goBack();
    }
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível fazer check-in');
  }
};
```

---

#### 5. **Check-out Screen** (`CheckOutScreen.tsx`)

**Formulário de Feedback**:
```tsx
<Form>
  {/* GPS automático */}
  <LocationIndicator loading={loadingGPS} />
  
  {/* Feedback obrigatório */}
  <TextArea
    label="Como foi a visita?"
    placeholder="Descreva o que aconteceu..."
    value={feedbackNotes}
    onChange={setFeedbackNotes}
    required
  />
  
  {/* Nível de interesse */}
  <InterestLevelPicker
    value={interestLevel}
    onChange={setInterestLevel}
    options={[
      { value: 'none', label: 'Nenhum interesse', color: '#ef4444' },
      { value: 'low', label: 'Baixo interesse', color: '#f59e0b' },
      { value: 'medium', label: 'Interesse moderado', color: '#3b82f6' },
      { value: 'high', label: 'Alto interesse', color: '#10b981' },
      { value: 'very_high', label: 'Muito interessado', color: '#22c55e' },
    ]}
  />
  
  {/* Rating */}
  <StarRating
    label="Avalie a visita"
    value={rating}
    onChange={setRating}
    max={5}
  />
  
  {/* Feedback do cliente */}
  <TextArea
    label="Feedback do cliente (opcional)"
    placeholder="O que o cliente disse?"
    value={clientFeedback}
    onChange={setClientFeedback}
  />
  
  {/* Próximos passos */}
  <TextArea
    label="Próximos passos"
    placeholder="O que precisa ser feito?"
    value={nextSteps}
    onChange={setNextSteps}
  />
  
  {/* Follow-up */}
  <DatePicker
    label="Data de follow-up (opcional)"
    value={followUpDate}
    onChange={setFollowUpDate}
  />
  
  <Button onPress={handleCheckOut} loading={loading}>
    Finalizar Visita
  </Button>
</Form>
```

**API Call**:
```typescript
const handleCheckOut = async () => {
  // Obter GPS
  const location = await Location.getCurrentPositionAsync();
  
  // Enviar feedback
  const response = await apiService.post(
    `/mobile/visits/${visitId}/check-out`,
    {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      feedback_notes: feedbackNotes,
      interest_level: interestLevel,
      rating: rating,
      client_feedback: clientFeedback,
      next_steps: nextSteps,
      follow_up_date: followUpDate,
    }
  );
  
  Alert.alert('Sucesso', 'Visita finalizada!');
  navigation.navigate('VisitsList');
};
```

---

#### 6. **Widget Dashboard** (`TodayVisitsWidget.tsx`)

**Design**:
```tsx
<Card>
  <CardHeader>
    <Text>Visitas de Hoje</Text>
    <Badge>{data.total_today}</Badge>
  </CardHeader>
  
  <StatsRow>
    <Stat label="Concluídas" value={data.completed} color="green" />
    <Stat label="Pendentes" value={data.pending} color="orange" />
    <Stat label="Em Andamento" value={data.in_progress} color="blue" />
  </StatsRow>
  
  <Divider />
  
  <Text>Próximas</Text>
  {data.upcoming.map(visit => (
    <MiniVisitCard key={visit.id} visit={visit} />
  ))}
  
  <Button onPress={() => navigate('VisitsList')}>
    Ver Todas
  </Button>
</Card>
```

**API Call**:
```typescript
const { data, loading } = useQuery('/mobile/visits/today');
```

---

## 💻 CÓDIGO TYPESCRIPT COMPLETO

### 🎯 Types (copiar para `src/types/index.ts`)

```typescript
// Enums
export type VisitStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export type InterestLevel = 
  | 'none' 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'very_high';

// Model completo
export interface Visit {
  id: number;
  property_id: number;
  property?: Property;
  lead_id?: number;
  lead?: Lead;
  agent_id: number;
  agent?: User;
  
  scheduled_at: string;
  duration_minutes: number;
  
  status: VisitStatus;
  
  checked_in_at?: string;
  checked_out_at?: string;
  check_in_latitude?: number;
  check_in_longitude?: number;
  check_out_latitude?: number;
  check_out_longitude?: number;
  
  feedback_notes?: string;
  interest_level?: InterestLevel;
  rating?: number;
  client_feedback?: string;
  
  next_steps?: string;
  follow_up_date?: string;
  
  notes?: string;
  cancellation_reason?: string;
  
  created_at: string;
  updated_at: string;
}

// Request types
export interface CreateVisitRequest {
  property_id: number;
  lead_id?: number;
  scheduled_at: string;
  duration_minutes?: number;
  notes?: string;
}

export interface UpdateVisitRequest {
  scheduled_at?: string;
  duration_minutes?: number;
  notes?: string;
  property_id?: number;
  lead_id?: number;
}

export interface CheckInRequest {
  latitude: number;
  longitude: number;
}

export interface CheckOutRequest {
  latitude: number;
  longitude: number;
  feedback_notes?: string;
  interest_level?: InterestLevel;
  rating?: number;
  client_feedback?: string;
  next_steps?: string;
  follow_up_date?: string;
}

export interface FeedbackRequest {
  feedback_notes?: string;
  interest_level?: InterestLevel;
  rating?: number;
  client_feedback?: string;
  next_steps?: string;
  follow_up_date?: string;
}

export interface UpdateStatusRequest {
  status: 'confirmed' | 'cancelled' | 'no_show';
  cancellation_reason?: string;
}

// Response types
export interface CheckInResponse extends Visit {
  distance_from_property: number;
}

export interface TodayVisitsWidget {
  total_today: number;
  completed: number;
  pending: number;
  in_progress: number;
  upcoming: Visit[];
}
```

---

### 🌐 API Service (copiar para `src/services/visits.ts`)

```typescript
import { apiService } from './api';
import type {
  Visit,
  CreateVisitRequest,
  UpdateVisitRequest,
  CheckInRequest,
  CheckInResponse,
  CheckOutRequest,
  FeedbackRequest,
  UpdateStatusRequest,
  TodayVisitsWidget,
  PaginatedResponse,
} from '../types';

class VisitsService {
  /**
   * Listar visitas com paginação e filtros
   */
  async list(params?: {
    status?: string;
    from_date?: string;
    to_date?: string;
    property_id?: number;
    lead_id?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Visit>> {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    
    return apiService.get<PaginatedResponse<Visit>>(
      `/mobile/visits?${queryString}`
    );
  }

  /**
   * Widget de visitas de hoje
   */
  async today(): Promise<TodayVisitsWidget> {
    return apiService.get<TodayVisitsWidget>('/mobile/visits/today');
  }

  /**
   * Obter detalhes de uma visita
   */
  async get(id: number): Promise<Visit> {
    return apiService.get<Visit>(`/mobile/visits/${id}`);
  }

  /**
   * Criar nova visita
   */
  async create(data: CreateVisitRequest): Promise<Visit> {
    return apiService.post<Visit>('/mobile/visits', data);
  }

  /**
   * Editar visita
   */
  async update(id: number, data: UpdateVisitRequest): Promise<Visit> {
    return apiService.put<Visit>(`/mobile/visits/${id}`, data);
  }

  /**
   * Atualizar status
   */
  async updateStatus(id: number, data: UpdateStatusRequest): Promise<Visit> {
    return apiService.patch<Visit>(`/mobile/visits/${id}/status`, data);
  }

  /**
   * Check-in com GPS
   */
  async checkIn(id: number, data: CheckInRequest): Promise<CheckInResponse> {
    return apiService.post<CheckInResponse>(
      `/mobile/visits/${id}/check-in`,
      data
    );
  }

  /**
   * Check-out com feedback
   */
  async checkOut(id: number, data: CheckOutRequest): Promise<Visit> {
    return apiService.post<Visit>(`/mobile/visits/${id}/check-out`, data);
  }

  /**
   * Adicionar feedback standalone
   */
  async addFeedback(id: number, data: FeedbackRequest): Promise<Visit> {
    return apiService.post<Visit>(`/mobile/visits/${id}/feedback`, data);
  }

  /**
   * Cancelar visita
   */
  async cancel(id: number, reason: string): Promise<Visit> {
    return this.updateStatus(id, {
      status: 'cancelled',
      cancellation_reason: reason,
    });
  }

  /**
   * Confirmar visita
   */
  async confirm(id: number): Promise<Visit> {
    return this.updateStatus(id, { status: 'confirmed' });
  }
}

export const visitsService = new VisitsService();
```

---

### 🪝 Custom Hook (copiar para `src/hooks/useVisits.ts`)

```typescript
import { useState, useEffect } from 'react';
import { visitsService } from '../services/visits';
import type { Visit, PaginatedResponse } from '../types';

export function useVisits(filters?: {
  status?: string;
  from_date?: string;
  to_date?: string;
}) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadVisits = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await visitsService.list({
        ...filters,
        page: pageNum,
        size: 20,
      });

      if (append) {
        setVisits(prev => [...prev, ...response.items]);
      } else {
        setVisits(response.items);
      }

      setHasMore(pageNum < response.pages);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.detail || 'Erro ao carregar visitas');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => loadVisits(1, false);
  const loadMore = () => {
    if (hasMore && !loading) {
      loadVisits(page + 1, true);
    }
  };

  useEffect(() => {
    loadVisits();
  }, [filters?.status, filters?.from_date, filters?.to_date]);

  return {
    visits,
    loading,
    error,
    refresh,
    loadMore,
    hasMore,
  };
}
```

---

### 🎨 Exemplo de Screen Completa

```typescript
// src/screens/VisitsListScreen.tsx
import React, { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { useVisits } from '../hooks/useVisits';
import { VisitCard } from '../components/VisitCard';
import { StatusFilter } from '../components/StatusFilter';

export function VisitsListScreen({ navigation }) {
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  
  const { visits, loading, error, refresh, loadMore, hasMore } = useVisits({
    status: statusFilter,
  });

  return (
    <View style={{ flex: 1 }}>
      <StatusFilter
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          { value: undefined, label: 'Todas' },
          { value: 'scheduled', label: 'Agendadas' },
          { value: 'confirmed', label: 'Confirmadas' },
          { value: 'in_progress', label: 'Em andamento' },
          { value: 'completed', label: 'Concluídas' },
        ]}
      />

      <FlatList
        data={visits}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <VisitCard
            visit={item}
            onPress={() => navigation.navigate('VisitDetails', { id: item.id })}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading && <Text>Nenhuma visita encontrada</Text>
        }
      />
    </View>
  );
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### 📅 Fase 1: Setup e Estrutura (1-2 dias)
- [ ] Copiar types para `src/types/index.ts`
- [ ] Criar service `src/services/visits.ts`
- [ ] Criar hook `src/hooks/useVisits.ts`
- [ ] Adicionar permissão GPS no `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Permitir que $(PRODUCT_NAME) acesse sua localização para check-in em visitas."
        }
      ]
    ]
  }
}
```
- [ ] Instalar dependências:
```bash
npx expo install expo-location
npx expo install @react-native-community/datetimepicker
```

### 📅 Fase 2: Telas Principais (3-4 dias)
- [ ] ✅ `VisitsListScreen` - Lista com filtros
- [ ] ✅ `VisitDetailsScreen` - Detalhes completos
- [ ] ✅ `CreateVisitScreen` - Formulário de criação
- [ ] ✅ Widget `TodayVisitsWidget` no dashboard

### 📅 Fase 3: Check-in/Check-out (2-3 dias)
- [ ] ✅ `CheckInScreen` - GPS + validação distância
- [ ] ✅ `CheckOutScreen` - Formulário feedback completo
- [ ] ✅ Permissões de localização
- [ ] ✅ Validações client-side

### 📅 Fase 4: Refinamentos (2 dias)
- [ ] ✅ Badges de status coloridos
- [ ] ✅ Notificações de visitas próximas
- [ ] ✅ Mapa na tela de check-in
- [ ] ✅ Gráficos no dashboard
- [ ] ✅ Testes unitários (>80% coverage)

**Total estimado**: 8-11 dias úteis

---

## 🚨 VALIDAÇÕES CLIENT-SIDE

### Criar Visita
```typescript
const validateCreateVisit = (data: CreateVisitRequest): string[] => {
  const errors: string[] = [];
  
  if (!data.property_id) {
    errors.push('Propriedade é obrigatória');
  }
  
  if (!data.scheduled_at) {
    errors.push('Data/hora é obrigatória');
  }
  
  const scheduledDate = new Date(data.scheduled_at);
  if (scheduledDate < new Date()) {
    errors.push('Data não pode ser no passado');
  }
  
  if (data.duration_minutes && data.duration_minutes < 15) {
    errors.push('Duração mínima é 15 minutos');
  }
  
  return errors;
};
```

### Check-out
```typescript
const validateCheckOut = (data: CheckOutRequest): string[] => {
  const errors: string[] = [];
  
  if (!data.latitude || !data.longitude) {
    errors.push('GPS é obrigatório');
  }
  
  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    errors.push('Rating deve ser entre 1 e 5');
  }
  
  return errors;
};
```

---

## 🎨 COMPONENTES SUGERIDOS

### 1. VisitCard
```typescript
interface VisitCardProps {
  visit: Visit;
  onPress: () => void;
}

export const VisitCard: React.FC<VisitCardProps> = ({ visit, onPress }) => {
  const statusColor = {
    scheduled: '#3b82f6',
    confirmed: '#10b981',
    in_progress: '#f59e0b',
    completed: '#22c55e',
    cancelled: '#ef4444',
    no_show: '#6b7280',
  }[visit.status];

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {/* Implementação */}
    </TouchableOpacity>
  );
};
```

### 2. StatusBadge
```typescript
export const StatusBadge: React.FC<{ status: VisitStatus }> = ({ status }) => {
  const labels = {
    scheduled: 'Agendada',
    confirmed: 'Confirmada',
    in_progress: 'Em andamento',
    completed: 'Concluída',
    cancelled: 'Cancelada',
    no_show: 'Não compareceu',
  };

  return <Badge color={statusColor} label={labels[status]} />;
};
```

### 3. InterestLevelPicker
```typescript
export const InterestLevelPicker: React.FC<{
  value?: InterestLevel;
  onChange: (value: InterestLevel) => void;
}> = ({ value, onChange }) => {
  // Implementação com botões ou slider
};
```

---

## 🔗 ENDPOINTS RESUMO

| Método | Endpoint | Uso |
|--------|----------|-----|
| `GET` | `/mobile/visits` | Lista com filtros |
| `GET` | `/mobile/visits/today` | Widget dashboard |
| `GET` | `/mobile/visits/{id}` | Detalhes |
| `POST` | `/mobile/visits` | Criar |
| `PUT` | `/mobile/visits/{id}` | Editar |
| `PATCH` | `/mobile/visits/{id}/status` | Update status |
| `POST` | `/mobile/visits/{id}/check-in` | Check-in GPS |
| `POST` | `/mobile/visits/{id}/check-out` | Check-out feedback |
| `POST` | `/mobile/visits/{id}/feedback` | Feedback standalone |

---

## 📞 SUPORTE E DÚVIDAS

### Backend Team
- **Slack**: `#backend-dev`
- **Issues**: Tag `backend` + `visits`

### Documentação Adicional
- **OpenAPI**: `http://127.0.0.1:8000/docs#/mobile-visits`
- **Exemplos**: Ver testes em `backend/tests/test_visits.py`

---

## 🎯 PRIORIZAÇÃO

### Alta Prioridade (Sprint Atual)
1. ✅ Lista de visitas
2. ✅ Widget dashboard
3. ✅ Check-in GPS
4. ✅ Check-out feedback

### Média Prioridade (Próxima Sprint)
5. ✅ Criar visita
6. ✅ Editar visita
7. ✅ Cancelar visita

### Baixa Prioridade (Backlog)
8. Notificações push
9. Mapa com múltiplas visitas
10. Relatórios e analytics

---

**Última atualização**: 18/12/2025  
**Versão Backend**: v1.2.0  
**Para Frontend Mobile Team**: ✅ Pronto para integração

**Dúvidas?** Slack `#backend-dev` ou `#mobile-dev`
