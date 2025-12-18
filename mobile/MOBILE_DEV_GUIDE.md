# 📱 CRM PLUS Mobile App

Aplicação mobile React Native (Expo) para gestão de leads, propriedades e visitas em campo.

## 🚀 Branch de Desenvolvimento

**Branch exclusiva**: `feat/mobile-app`

⚠️ **IMPORTANTE**: Todas as alterações relacionadas ao app mobile devem ser feitas APENAS nesta branch.

## 📋 Setup Inicial

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app no celular (iOS/Android)

### Instalação

```bash
cd mobile/app
npm install
```

### Configuração

1. Copiar arquivo de ambiente:
```bash
cp .env.example .env
```

2. Configurar variáveis no `.env`:
```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend-url.com
```

### Executar

```bash
# Iniciar servidor de desenvolvimento
npm start

# ou específico para plataforma
npm run android
npm run ios
```

## 🏗️ Estrutura do Projeto

```
mobile/app/
├── src/
│   ├── screens/          # Telas da aplicação
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── ...
│   ├── navigation/       # Configuração de rotas
│   │   └── index.tsx
│   ├── components/       # Componentes reutilizáveis
│   ├── contexts/         # Contexts globais (Auth, Theme, etc)
│   │   └── AuthContext.tsx
│   ├── services/         # APIs e serviços externos
│   │   ├── api.ts
│   │   └── auth.ts
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── constants/        # Constantes e configurações
│   │   ├── theme.ts
│   │   └── config.ts
│   └── utils/            # Funções utilitárias
├── App.tsx               # Entry point
├── app.json              # Configuração Expo
├── package.json
└── tsconfig.json
```

## 🎨 Features Implementadas

### ✅ Autenticação
- Login com JWT
- Logout
- Persistência de sessão (AsyncStorage)
- Proteção de rotas
- Refresh token

### ✅ Navegação
- Stack Navigator
- Proteção de rotas autenticadas
- Loading states

### ✅ UI/UX
- Tema centralizado (light mode)
- Componentes estilizados
- Design system consistente
- Feedback visual (loading, errors)

## 🔄 Convenção de Commits

Usar prefixo `feat(mobile):` para todas as alterações mobile:

```bash
# Features
git commit -m "feat(mobile): criar navegação inicial"
git commit -m "feat(mobile): integração login JWT"
git commit -m "feat(mobile): adicionar tela de propriedades"

# Fixes
git commit -m "fix(mobile): corrigir erro ao fazer logout"

# Chores
git commit -m "chore(mobile): ajustes no theme dark mode"
git commit -m "chore(mobile): atualizar dependências"
```

## 📦 Pull Requests

Sempre indicar **[MOBILE]** no título do PR:

```
[MOBILE] Adicionar autenticação JWT
[MOBILE] Implementar dashboard do agente
[MOBILE] Integrar gestão de leads
```

## 🧪 Testes

```bash
npm test
```

## 🔗 Integrações Backend

### Endpoints Utilizados

- `POST /auth/login` - Login
- `GET /auth/me` - Dados do usuário autenticado
- `POST /auth/refresh` - Refresh token
- `GET /properties/` - Listar propriedades
- `GET /leads/` - Listar leads
- `GET /visits/` - Listar visitas

### CORS

Certifique-se de que o backend permite requests do Expo:

```env
# backend/.env
CRMPLUS_CORS_ORIGINS=http://localhost:8081,exp://192.168.1.x:8081
```

## 📅 Sessões de Integração

**Frequência**: Semanal  
**Objetivo**: QA conjunto com backend, evitar bloqueios

### Checklist de Integração
- [ ] Endpoints sincronizados
- [ ] Contratos de API validados
- [ ] Testes de autenticação
- [ ] Validação de dados
- [ ] Performance e timeouts

## 🐛 Debug

### Expo DevTools
```bash
npm start
# Pressionar 'd' para abrir DevTools
```

### Logs
```bash
# Console logs aparecem no terminal
# Ou use React Native Debugger
```

## 📱 Build

### Development Build
```bash
npx expo prebuild
npm run android
npm run ios
```

### Production Build
```bash
eas build --platform android
eas build --platform ios
```

## 🤝 Comunicação

### Slack/Teams
- Canal: `#mobile-dev`
- Notificar bloqueios de integração
- Compartilhar progresso semanal

### Jira
- Epic: Mobile App Development
- Tag: `mobile`
- Sprint: mobile-sprint-01

## 👥 Equipe

**Frontend Mobile Lead**: [Nome]  
**Backend Integration**: [Nome]  
**QA Mobile**: [Nome]

## 📚 Recursos

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Backend API Docs](https://your-backend-url.com/docs)

---

**Última atualização**: 18 de dezembro de 2025  
**Branch**: `feat/mobile-app`  
**Status**: 🟢 Em desenvolvimento ativo
