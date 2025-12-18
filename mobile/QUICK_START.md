# ⚡ Quick Start - Mobile App

## 🚀 Começar Agora (5 minutos)

### 1️⃣ Checkout da Branch
```bash
cd "/Users/tiago.vindima/Desktop/CRM PLUS"
git checkout feat/mobile-app
git pull origin feat/mobile-app
```

### 2️⃣ Instalar Dependências
```bash
cd mobile/app
npm install
```

### 3️⃣ Iniciar App
```bash
npm start
```

### 4️⃣ Abrir no Celular
- Instale **Expo Go** (iOS/Android)
- Escaneie o QR code do terminal
- App abrirá automaticamente

### 5️⃣ Testar Login
```
Email: admin@crmplus.com
Senha: [solicitar ao backend]
```

---

## 📱 Comandos Úteis

```bash
# Desenvolvimento
npm start              # Iniciar Expo
npm run android        # Abrir no Android
npm run ios            # Abrir no iOS

# Git
git status             # Ver mudanças
git add .              # Adicionar tudo
git commit -m "feat(mobile): sua feature"
git push origin feat/mobile-app

# Testes
npm test               # Rodar testes
```

---

## 📚 Documentação

- **Guia Completo**: [MOBILE_DEV_GUIDE.md](./MOBILE_DEV_GUIDE.md)
- **Checklist**: [CHECKLIST.md](./CHECKLIST.md)
- **Kickoff**: [KICKOFF_MOBILE_TEAM.md](./KICKOFF_MOBILE_TEAM.md)
- **Relatório**: [RELATORIO_KICKOFF_EXECUTIVO.md](./RELATORIO_KICKOFF_EXECUTIVO.md)

---

## 🆘 Problemas Comuns

### App não conecta ao backend
```bash
# Verificar .env
cat mobile/app/.env

# Deve ter:
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# Para dispositivo real, use IP da LAN:
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.x:8000
```

### Erro ao fazer login
1. Backend está rodando? `http://127.0.0.1:8000/docs`
2. CORS configurado? Ver `backend/.env`
3. Credenciais corretas?

### Módulos não encontrados
```bash
cd mobile/app
rm -rf node_modules package-lock.json
npm install
```

---

## 💡 Próximo Passo

Ler [KICKOFF_MOBILE_TEAM.md](./KICKOFF_MOBILE_TEAM.md) para contexto completo!

---

**Última atualização**: 18/12/2025
