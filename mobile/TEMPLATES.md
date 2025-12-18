# 📝 Templates - Mobile App Development

## 🎫 Template de Issue (Jira)

```markdown
### Título
[MOBILE] Como [persona], quero [ação] para [benefício]

### Descrição
Descrição detalhada da funcionalidade ou problema.

### Acceptance Criteria
- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

### Technical Notes
- Endpoint necessário: `GET /api/endpoint`
- Componentes afetados: `ComponentName.tsx`
- Dependências: biblioteca X, Y

### Definition of Done
- [ ] Código implementado
- [ ] Testes unitários (>80% coverage)
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Testado em iOS e Android
- [ ] Sem erros TypeScript
- [ ] Performance OK (TTI < 3s)

### Story Points
[Fibonacci: 1, 2, 3, 5, 8, 13, 21]

### Priority
[High | Medium | Low]

### Labels
`mobile`, `frontend`, `feature` / `bug` / `enhancement`
```

---

## 📋 Template de Pull Request

```markdown
## [MOBILE] Título do PR

### 📝 Descrição
Breve descrição das mudanças implementadas.

### 🎯 Issue Relacionada
Closes #123
Related to #456

### 🔄 Tipo de Mudança
- [ ] 🚀 Nova feature
- [ ] 🐛 Bug fix
- [ ] 🎨 UI/UX improvement
- [ ] 📚 Documentação
- [ ] 🔧 Configuração
- [ ] ♻️ Refactoring
- [ ] ⚡ Performance

### ✅ Checklist
- [ ] Code segue as convenções do projeto
- [ ] Testes unitários adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Sem erros TypeScript
- [ ] Testado em iOS
- [ ] Testado em Android
- [ ] Screenshots/GIFs adicionados (se UI)
- [ ] Code review solicitado

### 📸 Screenshots
<!-- Se aplicável, adicione screenshots ou GIFs -->

#### Antes
[screenshot]

#### Depois
[screenshot]

### 🧪 Como Testar
1. Passo 1
2. Passo 2
3. Resultado esperado

### 📝 Notas Adicionais
Qualquer informação adicional relevante para o reviewer.

### 🔗 Links Úteis
- [Documentação relevante](#)
- [Figma design](#)
```

---

## 🐛 Template de Bug Report

```markdown
### 🐛 Bug Report

**Título:** [MOBILE BUG] Descrição curta do problema

**Prioridade:** [Critical | High | Medium | Low]

**Ambiente:**
- App version: 0.1.0
- Expo SDK: 51.0.0
- Device: iPhone 14 / Samsung Galaxy S23
- OS: iOS 17.2 / Android 14
- Network: WiFi / 4G / 5G

**Descrição do Bug:**
Descrição clara e concisa do problema.

**Passos para Reproduzir:**
1. Ir para tela X
2. Clicar em Y
3. Observar erro Z

**Comportamento Esperado:**
O que deveria acontecer.

**Comportamento Atual:**
O que está acontecendo.

**Screenshots/Logs:**
<!-- Cole screenshots ou logs de erro -->
```js
// Logs de erro
```

**Possível Solução (opcional):**
Sugestão de como resolver.

**Contexto Adicional:**
Qualquer informação relevante.

**Labels:**
`mobile`, `bug`, `ios` / `android`, `critical` / `high` / `medium` / `low`
```

---

## 📊 Template de Code Review

```markdown
### Code Review Checklist

**PR:** #123  
**Reviewer:** @username  
**Data:** YYYY-MM-DD

#### 🔍 Análise de Código
- [ ] Código segue padrões do projeto
- [ ] Nomes de variáveis/funções são descritivos
- [ ] Lógica é clara e fácil de entender
- [ ] Sem código comentado ou debug logs
- [ ] Sem duplicação de código
- [ ] Imports organizados e otimizados

#### 🎨 UI/UX
- [ ] Interface consistente com design system
- [ ] Responsivo em diferentes tamanhos de tela
- [ ] Feedback visual adequado (loading, errors)
- [ ] Acessibilidade considerada

#### 🧪 Testes
- [ ] Testes unitários presentes
- [ ] Coverage > 80%
- [ ] Testes passam localmente
- [ ] Edge cases cobertos

#### 📱 Mobile Specific
- [ ] Testado em iOS
- [ ] Testado em Android
- [ ] Performance aceitável
- [ ] Não há memory leaks
- [ ] Offline behavior considerado

#### 📚 Documentação
- [ ] README atualizado (se necessário)
- [ ] Comentários em código complexo
- [ ] JSDoc em funções públicas
- [ ] CHANGELOG.md atualizado

#### 🔐 Segurança
- [ ] Sem dados sensíveis hardcoded
- [ ] Inputs validados
- [ ] Autenticação/autorização OK
- [ ] Sem vulnerabilidades conhecidas

#### ✅ Aprovação
- [ ] ✅ Aprovado
- [ ] ⚠️ Aprovado com comentários
- [ ] ❌ Mudanças necessárias

**Comentários:**
<!-- Feedback detalhado -->
```

---

## 📅 Template de Sprint Planning

```markdown
# Sprint Planning - Mobile App

**Sprint:** #N  
**Data Início:** DD/MM/YYYY  
**Data Fim:** DD/MM/YYYY  
**Duração:** 2 semanas

## 🎯 Objetivo da Sprint
Descrição do objetivo principal da sprint.

## 📋 Backlog Selecionado

### 🔴 High Priority
1. **[MOBILE-XXX]** Título da issue - [8 pts]
2. **[MOBILE-XXX]** Título da issue - [5 pts]

### 🟡 Medium Priority
1. **[MOBILE-XXX]** Título da issue - [3 pts]

### 🟢 Low Priority
1. **[MOBILE-XXX]** Título da issue - [2 pts]

**Total Story Points:** 18 pts

## 👥 Atribuições
- **Dev 1:** MOBILE-XXX, MOBILE-XXX
- **Dev 2:** MOBILE-XXX
- **Dev 3:** MOBILE-XXX

## 📊 Dependências
- Backend endpoint X precisa estar pronto até dia Y
- Design de tela Z aguardando aprovação

## 🚧 Bloqueios Conhecidos
- Nenhum no momento

## 📅 Cerimônias
- **Daily Standup:** Todo dia, 10h (Slack)
- **Sprint Review:** DD/MM, 15h
- **Retrospective:** DD/MM, 16h

## ✅ Definition of Ready
- [ ] Issue tem acceptance criteria
- [ ] Designs estão prontos (se UI)
- [ ] Backend endpoints disponíveis
- [ ] Sem dependências bloqueadas

## ✅ Definition of Done
- [ ] Código implementado e mergeado
- [ ] Testes passando (>80% coverage)
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Testado em iOS e Android
- [ ] Demo para stakeholders
```

---

## 🔄 Template de Daily Standup (Slack)

```markdown
### 📱 Daily Standup - Mobile Team

**Data:** DD/MM/YYYY

**@dev1:**
- ✅ Ontem: Implementei tela de propriedades
- 🚧 Hoje: Integrar com API de propriedades
- 🚫 Bloqueios: Aguardando endpoint do backend

**@dev2:**
- ✅ Ontem: Testes unitários do AuthContext
- 🚧 Hoje: Implementar tela de leads
- 🚫 Bloqueios: Nenhum

**@dev3:**
- ✅ Ontem: Setup de navegação bottom tabs
- 🚧 Hoje: Continuar navegação + upload de fotos
- 🚫 Bloqueios: Preciso de credenciais Cloudinary
```

---

## 📝 Template de Commit Message

```bash
# Formato
<type>(mobile): <subject>

<body>

<footer>

# Exemplo completo
feat(mobile): implementar tela de listagem de propriedades

- Adicionar componente PropertyList
- Integrar com API GET /properties/
- Implementar filtros por status e tipo
- Adicionar paginação infinita
- Incluir skeleton loaders

Closes #MOBILE-123
```

### Tipos de Commit
- `feat` - Nova feature
- `fix` - Bug fix
- `docs` - Documentação
- `style` - Formatação, lint
- `refactor` - Refatoração
- `test` - Testes
- `chore` - Manutenção, config
- `perf` - Performance

---

## 🎨 Template de Component Documentation

```typescript
/**
 * PropertyCard Component
 * 
 * Displays a property card with image, title, price, and status.
 * Used in property listings and search results.
 * 
 * @component
 * @example
 * ```tsx
 * <PropertyCard
 *   property={propertyData}
 *   onPress={() => navigate('PropertyDetails', { id: property.id })}
 * />
 * ```
 */

import React from 'react';
import { TouchableOpacity, Text, Image, View } from 'react-native';
import type { Property } from '@/types';

interface PropertyCardProps {
  /** Property object containing all property data */
  property: Property;
  
  /** Callback when card is pressed */
  onPress?: () => void;
  
  /** Show favorite button */
  showFavorite?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  showFavorite = true,
}) => {
  // Component implementation
};
```

---

## 📊 Template de Sprint Retrospective

```markdown
# Sprint Retrospective - Mobile Team

**Sprint:** #N  
**Data:** DD/MM/YYYY  
**Participantes:** @dev1, @dev2, @dev3

## 😊 O que foi bem (Keep)
- Comunicação diária funcionou muito bem
- Pair programming ajudou em bugs complexos
- Documentação está ótima

## 😕 O que pode melhorar (Improve)
- Code reviews demoraram muito
- Testes ficaram para o final da sprint
- Faltou alinhamento com backend em alguns endpoints

## 💡 Ideias (Try)
- Fazer code review no mesmo dia do PR
- Começar testes junto com implementação (TDD)
- Daily de integração com backend (15min)

## ✅ Action Items
- [ ] @dev1: Criar template de code review mais ágil
- [ ] @dev2: Setup de CI/CD para rodar testes automaticamente
- [ ] @dev3: Agendar daily de integração backend às 11h

## 📊 Métricas da Sprint
- **Velocity:** 18 pts planejados / 16 pts completados
- **Bugs encontrados:** 3
- **Code review time:** média 24h
- **Test coverage:** 75%
```

---

## 🎯 Uso dos Templates

### Para Issues
1. Copiar template de Issue
2. Preencher todos os campos
3. Adicionar labels apropriadas
4. Atribuir a sprint e epic

### Para PRs
1. Copiar template de PR
2. Preencher descrição e checklist
3. Adicionar screenshots se UI
4. Solicitar reviewers

### Para Commits
1. Seguir formato: `type(mobile): subject`
2. Body detalhado para mudanças complexas
3. Referenciar issues: `Closes #123`

---

**Última atualização:** 18/12/2025  
**Manutenção:** Mobile Team Lead
