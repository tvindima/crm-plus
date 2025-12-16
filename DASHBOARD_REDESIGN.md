# Dashboard Backoffice - Redesign para Agentes

## 📋 Resumo das Alterações

Dashboard do backoffice foi completamente redesenhado baseado no mockup fornecido, com implementação de **permissões baseadas em roles** para diferenciar acesso entre agentes, coordenadores e administradores.

## 🎨 Novo Design

### Layout Principal
- **Header personalizado**: "Bem-vindo de volta, [Nome]!" com mensagem contextual
- **Grid responsivo**: 2 colunas principais (2/3 conteúdo + 1/3 sidebar)
- **Tema dark** com gradientes e efeitos glow

### Componentes Implementados

#### 1. KPIs (Top)
- **Total Propriedades Ativas**: Contador dinâmico com ícone roxo
- **Novas Leads (7d)**: Contador de leads recentes com ícone azul
- Cards com gradientes e animações hover

#### 2. Gráficos de Análise
**Propriedades por Concelho** (Bar Chart):
- Lisboa: 38
- Porto: 34
- Gaia: 15
- Sines: 8
- Outros: 5

**Distribuição por Tipologia** (Donut Chart):
- T1: 15%
- T2: 45% (destaque)
- T3: 30%
- Outros: 10%

#### 3. Leads Recentes
Feed de leads com:
- Nome do cliente
- Tipo de propriedade
- Status badge (Nova/Qualificada/Contacto)
- Timestamp

#### 4. Cards de Gestão (3 colunas)

**Gestão de Leads**:
- ✅ Nova Lead (todos os roles)
- ✅ Qualificar Leads (todos os roles)

**Gestão de Propriedades**:
- 🔒 **Nova Propriedade** (apenas coordinator/admin)
- ✅ Gerar Proposta (todos os roles)

**Gestão de Agenda**:
- ✅ Agendar Visita (todos os roles)
- ✅ Atribuir Tarefa (todos os roles)

#### 5. Ferramentas & Análises (Bottom Grid)
- Análises de Mercado
- Sistema de Relatórios
- Campanhas Marketing
- Comunicação Cliente

#### 6. Sidebar Direita - Assistente IA

**Assistente IA Pessoal**:
- Avatar 3D com gradiente
- Ferramentas Inteligentes:
  - Gerir Agenda
  - Gerar Avaliação Imóvel
  - Curar Post Redes Sociais
  - Notas & Ideias
- Chat interativo: "Olá [Nome]! Em que posso ajudar?"

**Gestão - Novidades**:
- Feed de atividades recentes da equipa
- Timestamps e ações

## 🔐 Permissões por Role

### Agent (Agente de Loja)
**PODE**:
- ✅ Ver todas as propriedades
- ✅ Editar características de propriedades
- ✅ Organizar galeria de fotos
- ✅ Criar e qualificar leads
- ✅ Gerar propostas
- ✅ Agendar visitas
- ✅ Atribuir tarefas
- ✅ Acessar ferramentas de análise
- ✅ Usar assistente IA

**NÃO PODE**:
- ❌ Adicionar novas propriedades (angariações)
- ❌ Remover propriedades
- ❌ Alterar preços de propriedades

### Coordinator / Admin
**PODE**:
- ✅ Tudo que o agente pode
- ✅ **Adicionar novas propriedades**
- ✅ **Remover propriedades**
- ✅ **Alterar preços**
- ✅ Gestão completa do sistema

## 🛠️ Implementação Técnica

### Detecção de Role
```tsx
const [userRole, setUserRole] = useState<'agent' | 'coordinator' | 'admin'>('agent');

useEffect(() => {
  const session = await getSession();
  const role = session.user.role || 'agent';
  setUserRole(role);
}, []);
```

### Renderização Condicional
```tsx
{(userRole === 'coordinator' || userRole === 'admin') && (
  <button onClick={() => router.push('/backoffice/properties/new')}>
    Nova Propriedade
  </button>
)}
```

### Estados dos Componentes
- `loading`: Controla skeleton/loading state
- `userName`: Nome do usuário extraído da sessão
- `userRole`: Role do usuário (agent/coordinator/admin)
- `kpis`: Array de KPIs com dados dinâmicos

## 📁 Arquivos Modificados

### Novo
- `frontend/backoffice/app/backoffice/dashboard/page.tsx` (redesenhado)

### Backup
- `frontend/backoffice/app/backoffice/dashboard/page_old.tsx` (versão anterior preservada)

## 🎯 Próximos Passos

### Backend (Necessário)
1. **Adicionar campo `role` no modelo User**:
   ```python
   class User(Base):
       role: str = Field(default="agent")  # agent | coordinator | admin
   ```

2. **Incluir role no token JWT**:
   ```python
   token_data = {
       "sub": user.email,
       "role": user.role,
       "exp": ...
   }
   ```

3. **Middleware de permissões**:
   ```python
   @router.post("/properties/")
   def create_property(current_user: User = Depends(require_role(["coordinator", "admin"]))):
       ...
   ```

### Frontend (Páginas Específicas)
1. **Página de Propriedades** (`/backoffice/properties/[id]`):
   - Desabilitar campos de preço para agents
   - Mostrar mensagem: "Apenas coordenadores podem editar preços"
   - Permitir edição de características e fotos

2. **Formulário de Edição**:
   ```tsx
   <input
     type="number"
     name="price"
     disabled={userRole === 'agent'}
     className={userRole === 'agent' ? 'opacity-50 cursor-not-allowed' : ''}
   />
   ```

### Integração de Dados Reais
- [ ] Substituir mock de leads por API call
- [ ] Substituir mock de atividades por API call
- [ ] Conectar ferramentas inteligentes a serviços reais
- [ ] Implementar chat do assistente IA

## 🧪 Testing Checklist

- [ ] Testar login como agent → verificar botão "Nova Propriedade" oculto
- [ ] Testar login como coordinator → verificar botão "Nova Propriedade" visível
- [ ] Testar responsividade (mobile, tablet, desktop)
- [ ] Testar animações e transições
- [ ] Verificar carregamento de dados reais (KPIs)
- [ ] Testar navegação entre páginas

## 📊 Métricas de Sucesso

- ✅ Dashboard replicado fielmente do mockup
- ✅ Permissões implementadas (renderização condicional)
- ✅ UI/UX melhorada com animações
- ⏳ Backend role system (pendente)
- ⏳ Integração com dados reais (pendente)

---

**Data**: 16 Dezembro 2024  
**Autor**: GitHub Copilot  
**Status**: ✅ Frontend completo | ⏳ Backend pendente
