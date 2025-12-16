# 📋 COMUNICADO PARA EQUIPA FRONTEND - SITE MONTRA

**Data**: 16 dezembro 2025  
**De**: Backend Team  
**Para**: Frontend Team - Site Montra (crm-plus-site)  
**Assunto**: Configuração Vercel Backoffice - Sem Impacto no Site Público

---

## 🎯 Resumo

Foi criado um arquivo `vercel.json` **APENAS** para o **backoffice** (frontend/backoffice/).

**✅ SEM IMPACTO** no site montra (crm-plus-site/) - os projetos são **independentes** no Vercel.

---

## 📦 Alterações Realizadas

### 1️⃣ Criado `frontend/backoffice/vercel.json`
```json
{
  "build": {
    "env": {
      "NEXT_PUBLIC_API_BASE_URL": "https://crm-plus-production.up.railway.app"
    }
  }
}
```

**Objetivo**: Garantir que o backoffice em produção use o backend Railway.

---

## 🔍 Verificações Necessárias (Site Montra)

### ✅ Nada a Fazer - Projetos Separados

O site montra (`crm-plus-site`) e o backoffice (`frontend/backoffice`) são **deployados separadamente** no Vercel:

- **Site Montra**: https://crm-plus-site.vercel.app (ou domínio customizado)
- **Backoffice**: https://crm-plus-backoffice.vercel.app

**Cada projeto tem seu próprio vercel.json e variáveis de ambiente.**

---

## 📌 Configuração Atual do Site Montra

**Localização**: `/crm-plus-site/.env.production`

Verifiquem que esta configuração está correta:

```bash
NEXT_PUBLIC_API_BASE_URL=https://crm-plus-production.up.railway.app
```

Se o site montra **NÃO** precisa do backend Railway (é apenas site estático de apresentação), podem remover esta variável.

---

## 🚨 Ações Requeridas

### Para a Equipa Frontend - Site Montra:

1. **Verificar** se o site montra está funcional em produção
2. **Confirmar** se há alguma chamada ao backend Railway
3. **Informar** se encontrarem algum erro após este deploy

### Como Testar:

```bash
# 1. Verificar se site montra está online
curl -I https://crm-plus-site.vercel.app

# 2. Verificar console do browser por erros
# Abrir https://crm-plus-site.vercel.app
# F12 → Console → verificar erros
```

---

## 📊 Arquitetura Atual

```
┌─────────────────────────────────────────┐
│  Backend Railway (PostgreSQL)           │
│  https://crm-plus-production...         │
│  - 330 propriedades                     │
│  - API REST                             │
└────────────┬────────────────────────────┘
             │
             ├──────────────────────────────┐
             │                              │
┌────────────▼───────────┐   ┌──────────────▼─────────┐
│ Backoffice Vercel      │   │ Site Montra Vercel     │
│ (frontend/backoffice)  │   │ (crm-plus-site)        │
│ ✅ CONFIGURADO         │   │ ❓ A VERIFICAR         │
│ - Dashboard admin      │   │ - Site público         │
│ - Gestão propriedades  │   │ - Sem backend?         │
└────────────────────────┘   └────────────────────────┘
```

---

## 🆘 Contactos

Se houver **qualquer problema** com o site montra:

1. Verificar logs Vercel: https://vercel.com/toinos-projects/crm-plus-site/deployments
2. Reportar no Slack/Discord: #frontend-site-montra
3. Reverter deploy se necessário

---

## ✅ Checklist Equipa Site Montra

- [ ] Site montra está online e funcional
- [ ] Não há erros no console do browser
- [ ] Formulários de contacto funcionam (se aplicável)
- [ ] Imagens carregam corretamente
- [ ] Performance mantida
- [ ] SEO não afetado

---

**Status**: 🟢 **Nenhuma ação urgente** - apenas verificação de rotina

Se tudo estiver OK, respondam com "✅ Site montra verificado - sem problemas".

Se houver problemas, reportem imediatamente com detalhes.

---

**Equipa Backend**  
16 dezembro 2025
