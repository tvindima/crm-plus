# 📱 CRM PLUS Mobile App

React Native (Expo) client para gestão de leads, propriedades e visitas em campo.

**Branch:** `feat/mobile-app`  
**Status:** 🟢 Em desenvolvimento ativo  
**Versão:** 0.1.0

---

## 🚀 Quick Start

```bash
# 1. Checkout da branch
git checkout feat/mobile-app

# 2. Instalar dependências
cd mobile/app
npm install

# 3. Configurar ambiente
cp .env.example .env
# Editar .env com URL do backend

# 4. Iniciar app
npm start
```

📖 **Guia completo:** [QUICK_START.md](./QUICK_START.md)

---

## 📚 Documentação

### 🎯 Para Começar
- **[QUICK_START.md](./QUICK_START.md)** - Início rápido (5 minutos)
- **[KICKOFF_MOBILE_TEAM.md](./KICKOFF_MOBILE_TEAM.md)** - Comunicado de kickoff
- **[MOBILE_DEV_GUIDE.md](./MOBILE_DEV_GUIDE.md)** - Guia completo de desenvolvimento

### 📊 Status e Planejamento
- **[STATUS_FRONTEND_MOBILE.md](./STATUS_FRONTEND_MOBILE.md)** - Relatório de status atual
- **[CHECKLIST.md](./CHECKLIST.md)** - Roadmap e checklist
- **[RELATORIO_KICKOFF_EXECUTIVO.md](./RELATORIO_KICKOFF_EXECUTIVO.md)** - Relatório executivo

### 🛠️ Recursos para Desenvolvimento
- **[TEMPLATES.md](./TEMPLATES.md)** - Templates de issues, PRs, commits, etc.

---

## 🏗️ Estrutura do Projeto

```
mobile/app/
├── src/
│   ├── screens/          # Telas (LoginScreen, HomeScreen, etc)
│   ├── navigation/       # Configuração de rotas
│   ├── components/       # Componentes reutilizáveis
│   ├── contexts/         # Contexts globais (Auth, Theme)
│   ├── services/         # APIs e serviços (api.ts, auth.ts)
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   ├── constants/        # Tema e configurações
│   └── utils/            # Funções utilitárias
├── App.tsx               # Entry point
├── package.json
└── .env                  # Configuração local
```

---

## ✨ Features Implementadas

### ✅ Autenticação JWT
- Login/logout com backend FastAPI
- Persistência de sessão (AsyncStorage)
- Proteção de rotas
- Context global

### ✅ Navegação
- React Navigation (Stack)
- Proteção de rotas autenticadas
- Loading states

### ✅ Telas
- **LoginScreen** - Autenticação
- **HomeScreen** - Dashboard básico

---

## 🔄 Workflow

### Convenções de Commits
```bash
feat(mobile): nova feature
fix(mobile): correção
docs(mobile): documentação
chore(mobile): manutenção
```

### Pull Requests
Sempre usar prefixo `[MOBILE]` no título.

### Comunicação
- **Slack:** `#mobile-dev`
- **Jira:** Tag `mobile`
- **Sessões:** Terças, 15h (integração backend)

---

## 🔗 Integração Backend

### Endpoints Configurados
- ✅ `POST /auth/login` - Login
- ✅ `GET /auth/me` - Dados do usuário

### CORS Configuration
```env
# backend/.env
CRMPLUS_CORS_ORIGINS=http://localhost:8081,exp://192.168.1.x:8081
```

---

## 📱 Executar App

### Development
```bash
npm start              # Expo DevTools
npm run android        # Android
npm run ios            # iOS
```

### Testing
```bash
npm test               # Testes unitários
```

---

## 🎯 Próximos Passos

1. **Tela de Propriedades** - Listagem e detalhes
2. **Gestão de Leads** - CRUD completo
3. **Agenda de Visitas** - Calendário e check-in
4. **Upload de Fotos** - Cloudinary integration

Ver [CHECKLIST.md](./CHECKLIST.md) para roadmap completo.

---

## 🆘 Suporte

- **Documentação:** Arquivos `*.md` nesta pasta
- **Slack:** `#mobile-dev`
- **Issues:** Usar tag `mobile` no Jira

---

## 📊 Status Atual

**Fase 1 (Fundação):** ✅ Completa  
**Fase 2 (Features):** 🚧 Em progresso  
**Test Coverage:** 0% → Meta: 80%  
**Commits:** 6  
**Última atualização:** 18/12/2025

---

**Para mais informações, consulte a documentação completa na pasta `/mobile/`.**
