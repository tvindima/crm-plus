# 🔒 AUDITORIA DE DEPLOY ISOLADO - VERCEL MULTI-PROJETO
**Data:** 15 de dezembro de 2025  
**Branch:** Branch 2 - Frontpage Montra Agência  
**Repositório:** github.com/tvindima/crm-plus

---

## 📊 RESUMO EXECUTIVO

Configuração de 3 projetos Vercel independentes no mesmo repositório Git, com deploy isolado por pasta usando **Ignored Build Step Scripts**.

**Status:** ✅ **CONFIGURAÇÃO VALIDADA E FUNCIONAL**

---

## 🏗️ ARQUITETURA

### **Projetos Configurados:**

| Projeto | Root Directory | Domínio | Scope |
|---------|---------------|---------|-------|
| **imoveismais-site** | `frontend/web` | imoveismais-site.vercel.app | Montra B2C (Vitrine de imóveis) |
| **crm-plus-site** | `crm-plus-site` | crm-plus-site.vercel.app | Site promocional B2B |
| **crm-plus-backoffice** | `frontend/backoffice` | crm-plus-backoffice.vercel.app | Backoffice privado |

---

## 🔐 MECANISMO DE ISOLAMENTO

Cada projeto tem um **Ignored Build Step Script** que:
1. Verifica se houve alterações na sua pasta específica
2. **Retorna exit 0** (skip build) se NÃO houve alterações
3. **Retorna exit 1** (proceed build) se houve alterações

### **Scripts Criados:**

```bash
# Commit: 69fce06
frontend/web/vercel-build-check.sh
frontend/backoffice/vercel-build-check.sh
crm-plus-site/vercel-build-check.sh
```

### **Configuração Vercel (cada projeto):**

```
Settings → Git → Ignored Build Step
Command: bash vercel-build-check.sh
```

---

## 🧪 TESTES DE VALIDAÇÃO EXECUTADOS

### **Teste 1: Push Vazio**
- **Commit:** `cb6407d` - "test: empty commit to verify all projects skip build"
- **Expectativa:** Todos os 3 projetos skipam build (sem alterações em nenhuma pasta)
- **Resultado:** ✅ **VALIDADO**

### **Teste 2: Commit Isolado em frontend/web**
- **Commit:** `3ea08a9` - "test(frontend/web): isolated commit to verify only imoveismais-site deploys"
- **Alteração:** `frontend/web/README.md`
- **Expectativa:** Apenas `imoveismais-site` faz deploy
- **Resultado:** ✅ **VALIDADO**

### **Teste 3: Commit Isolado em crm-plus-site**
- **Commit:** `cba1a48` - "test(crm-plus-site): isolated commit to verify only crm-plus-site deploys"
- **Alteração:** `crm-plus-site/README.md`
- **Expectativa:** Apenas `crm-plus-site` faz deploy
- **Resultado:** ✅ **VALIDADO**

### **Teste 4: Commit Isolado em frontend/backoffice**
- **Commit:** `440e06a` - "test(frontend/backoffice): isolated commit to verify only crm-plus-backoffice deploys"
- **Alteração:** `frontend/backoffice/README.md`
- **Expectativa:** Apenas `crm-plus-backoffice` faz deploy
- **Resultado:** ✅ **VALIDADO**

### **Teste 5: Validação de Conteúdo nos Domínios**

| Domínio | Conteúdo Esperado | Status |
|---------|-------------------|--------|
| imoveismais-site.vercel.app | "Experiência Cinematográfica" (HeroCarousel) | ✅ DETECTADO |
| crm-plus-site.vercel.app | "CRM PLUS", "Power your real estate" | ✅ DETECTADO |
| crm-plus-backoffice.vercel.app | "Backoffice", "Dashboard" | ✅ DETECTADO |

---

## 🔒 VARIÁVEIS DE AMBIENTE - SEGREGAÇÃO

### **Recomendações Implementadas:**

1. **Variáveis específicas por projeto:**
   - Cada projeto Vercel tem seu próprio set de env vars
   - `NEXT_PUBLIC_API_BASE_URL` configurado por projeto
   - Sem cross-contamination entre projetos

2. **Boas práticas:**
   - Variáveis sensíveis encriptadas no Vercel
   - `.env.example` em cada pasta para documentação
   - `.env*.local` em `.gitignore`

---

## 📁 ESTRUTURA DE REPOSITÓRIO

```
crm-plus/
├── frontend/
│   ├── web/                          ← imoveismais-site
│   │   ├── vercel-build-check.sh
│   │   ├── app/
│   │   ├── components/
│   │   └── package.json
│   └── backoffice/                   ← crm-plus-backoffice
│       ├── vercel-build-check.sh
│       ├── src/
│       └── package.json
├── crm-plus-site/                    ← crm-plus-site (landing B2B)
│   ├── vercel-build-check.sh
│   ├── app/
│   └── package.json
└── backend/                          ← Backend (Railway)
    └── app/
```

---

## ✅ BENEFÍCIOS DA CONFIGURAÇÃO

1. **Isolamento Total:**
   - Commits em `frontend/web/` não afetam `crm-plus-site` ou `backoffice`
   - Deploy independente = menos builds desnecessários = economia de tempo/recursos

2. **Branches Isolados:**
   - Branch 2 (Frontpage Montra) trabalha só em `frontend/web/`
   - Outros branches trabalham em suas pastas sem conflito

3. **Redução de Custos:**
   - Menos builds = menos minutos de build consumidos
   - Apenas projetos afetados fazem redeploy

4. **Segurança:**
   - Variáveis de ambiente segregadas por projeto
   - Sem risco de leaks entre projetos

---

## ⚠️ DEPENDÊNCIAS CROSS-BRANCH IDENTIFICADAS

**Backend /agents/ endpoint:**
- **Status:** 500 Internal Server Error
- **Impacto:** Página `/agentes` da montra usa fallback para mocks
- **Responsável:** Branch backend (fora do scope deste branch)
- **Ação:** NÃO ALTERADO - aguardando fix do owner do branch backend

---

## 📝 CHECKLIST DE MANUTENÇÃO FUTURA

Para adicionar novo projeto no monorepo:

- [ ] Criar pasta na raiz ou em `frontend/`
- [ ] Adicionar `vercel-build-check.sh` na pasta do projeto
- [ ] Configurar projeto no Vercel com Root Directory correto
- [ ] Configurar Ignored Build Step: `bash vercel-build-check.sh`
- [ ] Testar com commit isolado
- [ ] Documentar em README.md da pasta

---

## 🎯 COMMITS DE REFERÊNCIA

| Commit | Descrição |
|--------|-----------|
| `69fce06` | Scripts de Ignored Build Step criados |
| `cb6407d` | Teste: push vazio (skip all) |
| `3ea08a9` | Teste: deploy isolado frontend/web |
| `cba1a48` | Teste: deploy isolado crm-plus-site |
| `440e06a` | Teste: deploy isolado frontend/backoffice |

---

## 📞 CONTACTO E SUPORTE

**Branch Owner (Branch 2):** Agente especializado em Frontpage Montra  
**Escopo:** `frontend/web/` apenas  
**Fora do escopo:** Backend, backoffice, crm-plus-site

---

**Documento gerado automaticamente em:** 15 dezembro 2025  
**Última validação:** 15 dezembro 2025 (todos os testes passaram)  
**Próxima revisão:** Quando houver alterações na estrutura do monorepo
