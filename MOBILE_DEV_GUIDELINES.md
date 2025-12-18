# 📱 Diretrizes de Desenvolvimento - Mobile Backend

> **Branch:** `feat/mobile-backend-app`  
> **Data:** 18 de dezembro de 2025  
> **Status:** 🟢 Ativa para desenvolvimento

---

## 🎯 ÂMBITO DO PROJETO - LEIA PRIMEIRO

### ⚠️ CRÍTICO: Esta é uma App B2E (Business-to-Employee)

**Utilizadores:** ✅ **Apenas agentes imobiliários Imóveis Mais** (colaboradores internos)  
**Objetivo:** ✅ **Produtividade e gestão operacional em campo**  
**Dados:** ✅ **Backoffice CRM** (não do site montra)

**NÃO É:**
❌ Portal público para clientes finais  
❌ Marketplace de pesquisa de imóveis  
❌ App B2C (Business-to-Consumer)  
❌ Integração com site montra  

📖 **Documento obrigatório:** [MOBILE_APP_PRODUCT_BRIEF.md](MOBILE_APP_PRODUCT_BRIEF.md)

---

## ⚠️ IMPORTANTE

**TODAS as alterações relacionadas com a app mobile devem ser feitas APENAS nesta branch:**

```bash
git checkout feat/mobile-backend-app
```

✅ APIs mobile  
✅ Endpoints `/mobile/*`  
✅ Models relacionados  
✅ Documentação mobile  
✅ Schemas específicos mobile  
✅ Testes de integração mobile

---

## 📝 Convenção de Commits

### **Formato Obrigatório:**
```
<tipo>(<scope>): <descrição curta>

[corpo opcional com mais detalhes]
[issue/ticket opcional]
```

### **Tipos Permitidos:**

| Tipo | Uso | Exemplo |
|------|-----|---------|
| `feat` | Nova funcionalidade | `feat(api): adicionar endpoints de visitas para mobile` |
| `fix` | Correção de bug | `fix(auth): corrigir refresh token mobile` |
| `docs` | Apenas documentação | `docs: atualizar swagger mobile endpoints` |
| `refactor` | Refatoração sem mudar comportamento | `refactor(mobile): simplificar query de properties` |
| `perf` | Melhorias de performance | `perf(mobile): otimizar query dashboard stats` |
| `test` | Adicionar/corrigir testes | `test(mobile): adicionar testes para leads endpoints` |
| `chore` | Tarefas de manutenção | `chore: atualizar dependências mobile` |

### **Scopes Recomendados:**

- `api` - Endpoints gerais
- `auth` - Autenticação/autorização
- `properties` - Gestão de propriedades
- `leads` - Gestão de leads
- `tasks` - Gestão de tarefas
- `upload` - Upload de ficheiros
- `dashboard` - Dashboard/estatísticas
- `docs` - Documentação

### **Exemplos Práticos:**

✅ **BOM:**
```bash
git commit -m "feat(api): adicionar endpoint para favoritos de propriedades mobile"
git commit -m "fix(upload): corrigir limite de tamanho de foto para 10MB"
git commit -m "docs: adicionar exemplos de response para /mobile/leads"
git commit -m "refactor(properties): extrair validação de permissões para middleware"
```

❌ **EVITAR:**
```bash
git commit -m "updates"
git commit -m "fix bug"
git commit -m "WIP"
git commit -m "changes to mobile"
```

---

## 🔄 Workflow de Desenvolvimento

### **1. Antes de Começar**
```bash
# Garantir que está na branch correta
git checkout feat/mobile-backend-app

# Atualizar com últimas alterações
git pull origin feat/mobile-backend-app

# Verificar status
git status
```

### **2. Durante o Desenvolvimento**

```bash
# Criar alterações
# ...

# Adicionar ficheiros específicos
git add backend/app/mobile/routes.py

# Commit com mensagem descritiva
git commit -m "feat(leads): adicionar filtro por data de criação"

# Push para remote
git push origin feat/mobile-backend-app
```

### **3. Commits Frequentes**

- ✅ Fazer commits pequenos e focados
- ✅ Cada commit deve ser uma unidade lógica
- ✅ Testar antes de fazer commit
- ❌ Não acumular muitas alterações num só commit

### **4. Sincronização**

```bash
# Antes de começar o dia
git pull origin feat/mobile-backend-app

# Antes de fazer push
git pull --rebase origin feat/mobile-backend-app
git push origin feat/mobile-backend-app
```

---

## 📚 Documentação Obrigatória

### **Quando Adicionar Documentação:**

1. **Novo Endpoint** → Atualizar [MOBILE_API_DOCS.md](MOBILE_API_DOCS.md)
2. **Alterar Response** → Atualizar exemplos no docs
3. **Novo Query Parameter** → Documentar comportamento
4. **Mudar Permissões** → Atualizar tabela de permissões
5. **Novo Status/Enum** → Documentar valores possíveis

### **Formato da Documentação:**

```markdown
#### `POST /mobile/novo-endpoint`
Breve descrição do que faz

**Body:**
```json
{
  "campo": "valor"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {}
}
```

**Permissões:** agent, coordinator, admin
```

### **Documentação no Código:**

```python
@router.get("/mobile/properties/{property_id}/visits")
def get_property_visits(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obter visitas agendadas para uma propriedade
    
    Retorna lista de visitas com informações do lead e agente.
    Agentes veem apenas suas propriedades.
    
    Permissões: agent, coordinator, admin
    """
    # ... implementação
```

---

## ✅ Checklist Antes de Commit

- [ ] Código testado localmente
- [ ] Sem erros no terminal
- [ ] Documentação atualizada (se aplicável)
- [ ] Convenção de commits seguida
- [ ] Apenas ficheiros relacionados no commit
- [ ] Sem `print()` ou código de debug
- [ ] Sem secrets/passwords no código

---

## 🚫 Regras de Merge

### **NÃO fazer merge para `main` ou `dev` sem:**

1. ✅ **Code Review** completo
2. ✅ **Testes** passando (quando implementados)
3. ✅ **Validação total** do mobile app
4. ✅ **Documentação** atualizada
5. ✅ **Aprovação** do tech lead

### **Processo de Merge:**

```bash
# 1. Criar Pull Request
# Via GitHub interface

# 2. Aguardar code review
# Pelo menos 1 aprovação

# 3. Resolver conflitos (se houver)
git checkout feat/mobile-backend-app
git pull origin main
# Resolver conflitos
git push origin feat/mobile-backend-app

# 4. Merge será feito pelo tech lead
```

---

## 🎯 Estrutura de Ficheiros Mobile

```
backend/app/mobile/
├── __init__.py
├── routes.py          # Todos os endpoints mobile
├── schemas.py         # (futuro) Schemas específicos mobile
├── services.py        # (futuro) Lógica de negócio
└── utils.py           # (futuro) Funções auxiliares
```

**Regra:** Manter tudo relacionado com mobile dentro de `app/mobile/`

---

## 🔧 Comandos Úteis

### **Verificar Branch Atual:**
```bash
git branch --show-current
```

### **Ver Histórico de Commits:**
```bash
git log --oneline -10
```

### **Desfazer Último Commit (manter alterações):**
```bash
git reset --soft HEAD~1
```

### **Ver Diferenças Antes de Commit:**
```bash
git diff
git diff --staged
```

### **Limpar Ficheiros não Tracked:**
```bash
git clean -n  # preview
git clean -f  # executar
```

---

## 📞 Comunicação

### **Quando Comunicar:**

- 🟡 Antes de fazer alterações **breaking changes**
- 🟡 Quando adicionar novos endpoints importantes
- 🟡 Quando mudar estrutura de responses
- 🔴 Quando encontrar bugs críticos

### **Canal de Comunicação:**
- Slack: `#mobile-backend-dev`
- Issues: Criar issue no GitHub para features grandes
- Reviews: Comentar no PR

---

## 📊 Status Atual da Branch

### **Implementado:**
✅ Estrutura base `/mobile` router  
✅ Autenticação e perfil (`/mobile/auth/me`)  
✅ CRUD completo de propriedades  
✅ Upload de fotos otimizado (10MB)  
✅ Gestão de leads com contactos  
✅ Gestão de tarefas  
✅ Dashboard stats e activity  
✅ Documentação completa em [MOBILE_API_DOCS.md](MOBILE_API_DOCS.md)

### **Em Desenvolvimento:**
🚧 Sistema de favoritos  
🚧 Filtros avançados  
🚧 Notificações push  
🚧 Sincronização offline

### **Pendente:**
⏳ Testes de integração  
⏳ Testes unitários  
⏳ Performance testing  
⏳ Validação com app mobile real

---

## 🎓 Boas Práticas

1. **DRY (Don't Repeat Yourself)**
   - Extrair lógica comum para `services.py`
   - Reutilizar validações

2. **Segurança**
   - Sempre validar permissões
   - Nunca confiar em dados do cliente
   - Sanitizar inputs

3. **Performance**
   - Usar `.limit()` nas queries
   - Evitar N+1 queries
   - Indexar campos frequentemente filtrados

4. **Manutenibilidade**
   - Código legível > código "clever"
   - Comentários apenas quando necessário
   - Nomes descritivos de variáveis

5. **API Design**
   - RESTful quando possível
   - Status codes apropriados
   - Responses consistentes

---

## 🆘 Troubleshooting

### **Problema: Conflitos de merge**
```bash
git status  # ver ficheiros em conflito
# Editar ficheiros e resolver <<<< ==== >>>>
git add <ficheiro-resolvido>
git commit
```

### **Problema: Push rejeitado**
```bash
git pull --rebase origin feat/mobile-backend-app
# Resolver conflitos se houver
git push origin feat/mobile-backend-app
```

### **Problema: Commit na branch errada**
```bash
# Desfazer commit (manter alterações)
git reset --soft HEAD~1

# Mudar para branch correta
git checkout feat/mobile-backend-app

# Fazer commit novamente
git add .
git commit -m "mensagem"
```

---

## 📅 Timeline Estimada

| Fase | Duração | Status |
|------|---------|--------|
| Setup inicial | 1 dia | ✅ Completo |
| Desenvolvimento core | 1 semana | 🟡 Em progresso |
| Testes | 3 dias | ⏳ Pendente |
| Code review | 2 dias | ⏳ Pendente |
| Ajustes pós-review | 2 dias | ⏳ Pendente |
| Merge para main | 1 dia | ⏳ Pendente |

---

**Última atualização:** 18 de dezembro de 2025  
**Responsável:** Dev Team Backend  
**Revisão:** Quinzenal
