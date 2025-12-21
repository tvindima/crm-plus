# 🚀 MOBILE APP - AÇÕES IMEDIATAS PARA DEPLOY PÚBLICO
**Data:** 20 dezembro 2025  
**Tempo Estimado:** 30 minutos  
**Objetivo:** App mobile online com dados sincronizados do Railway

---

## ⚡ SOLUÇÃO RÁPIDA: WEB APP (React Native Web)

### Por Que Começar com Web?
- ✅ **Mais rápido:** 30 min vs 2-3 horas (EAS builds)
- ✅ **Sem stores:** Não precisa App Store/Google Play
- ✅ **Universal:** Funciona em qualquer dispositivo
- ✅ **Atualização instantânea:** Sem reinstalar
- ✅ **PWA:** Pode ser "instalado" no celular
- ✅ **SEO-friendly:** Indexável pelo Google

### Limitações
- ⚠️ Sem acesso a features nativas (câmera, push notifications)
- ⚠️ Performance inferior a apps nativos
- ⚠️ Requer internet sempre

---

## 📋 PASSO A PASSO (COPIAR E COLAR)

### 1️⃣ Corrigir Variável de Ambiente (2 min)

```bash
cd /Users/tiago.vindima/Desktop/crm-plus/CRM-PLUS/mobile/app

# Backup do arquivo atual
cp .env.production .env.production.backup

# Criar novo .env.production correto
cat > .env.production << 'EOF'
# Production Environment
EXPO_PUBLIC_API_BASE_URL=https://fantastic-simplicity-production.up.railway.app
ENVIRONMENT=production

# IMPORTANTE: Expo Web só reconhece variáveis com prefixo EXPO_PUBLIC_
# Esta variável será embarcada no bundle JavaScript público
EOF

echo "✅ .env.production corrigido!"
```

---

### 2️⃣ Instalar Dependências Web (se necessário) (3 min)

```bash
cd /Users/tiago.vindima/Desktop/crm-plus/CRM-PLUS/mobile/app

# Garantir que react-native-web está instalado
npm install react-native-web@^0.19.13 --save

# Verificar instalação
npm list react-native-web
```

---

### 3️⃣ Exportar Build Web (5-10 min)

```bash
cd /Users/tiago.vindima/Desktop/crm-plus/CRM-PLUS/mobile/app

# Limpar cache anterior (importante!)
rm -rf .expo web-build dist

# Exportar para web (vai compilar tudo)
npx expo export:web

echo "✅ Build web criado em web-build/"
```

**O que vai acontecer:**
- Metro bundler compila código React Native para web
- Gera HTML, CSS, JS otimizados
- Assets (imagens, fontes) são processados
- Output final em `web-build/`

**Possíveis Erros:**

| Erro | Solução |
|------|---------|
| `metro-config not found` | `npm install` novamente |
| `expo-cli outdated` | `npm install -g expo-cli@latest` |
| Stuck em "Building..." | Ctrl+C e tentar novamente |

---

### 4️⃣ Testar Localmente (opcional, 2 min)

```bash
cd /Users/tiago.vindima/Desktop/crm-plus/CRM-PLUS/mobile/app

# Servir build local
npx serve web-build -p 3000

# Abrir browser
open http://localhost:3000
```

**Verificar:**
- [ ] App carrega sem erros
- [ ] Tela de login aparece
- [ ] Console sem erros críticos

---

### 5️⃣ Deploy no Vercel (5 min)

#### Opção A: Via CLI (recomendado)

```bash
cd /Users/tiago.vindima/Desktop/crm-plus/CRM-PLUS/mobile/app/web-build

# Login no Vercel (se necessário)
vercel login

# Deploy production
vercel --prod --name crm-plus-mobile-app

# Salvar URL gerada
```

#### Opção B: Via Dashboard Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Import Git Repository ou Upload folder
3. Selecione `mobile/app/web-build/`
4. Framework: **Other (Static)**
5. Build Command: (deixar vazio)
6. Output Directory: `.` (root)
7. Deploy!

---

### 6️⃣ Configurar Variáveis de Ambiente no Vercel (2 min)

**IMPORTANTE:** Expo Web embarca env vars no bundle durante o build, **NÃO** no runtime.

Por isso, as variáveis já estão "baked in" no JavaScript.

**MAS** se quiser rebuild dinâmico no Vercel:

```bash
# Via CLI
vercel env add EXPO_PUBLIC_API_BASE_URL
# Quando perguntar:
# Value: https://fantastic-simplicity-production.up.railway.app
# Environment: Production

# Rebuild (força novo deploy)
vercel --prod --force
```

**Ou via Dashboard:**
1. Projeto → Settings → Environment Variables
2. Add: `EXPO_PUBLIC_API_BASE_URL`
3. Value: `https://fantastic-simplicity-production.up.railway.app`
4. Environment: Production
5. Save → Redeploy

---

### 7️⃣ Testar App Online (5 min)

```bash
# URL exemplo (substituir pela sua)
open https://crm-plus-mobile-app.vercel.app
```

**Checklist de Testes:**

- [ ] **Login**
  - Email: `tvindima@imoveismais.pt`
  - Password: `testepassword123`
  - Deve redirecionar para dashboard

- [ ] **Dashboard**
  - Ver stats (properties, leads, tasks)
  - Dados vêm do Railway (não mockados)

- [ ] **Properties List**
  - Listar propriedades
  - Click em uma propriedade → ver detalhes

- [ ] **Network Inspector**
  - F12 → Network tab
  - Requests devem ir para `fantastic-simplicity-production.up.railway.app`
  - Status 200 OK (não 401/403/500)

---

## 🔧 TROUBLESHOOTING

### Problema: "EXPO_PUBLIC_API_BASE_URL is not defined"

**Causa:** Build foi feito com `.env` incorreto.

**Solução:**
```bash
# 1. Corrigir .env.production
# 2. Limpar completamente
rm -rf .expo web-build node_modules/.cache
# 3. Rebuild
npx expo export:web
# 4. Redeploy
cd web-build && vercel --prod --force
```

---

### Problema: "401 Unauthorized" ao fazer login

**Causa:** Backend rejeita CORS ou credenciais incorretas.

**Verificar Backend:**
```bash
# Testar endpoint auth
curl -X POST https://fantastic-simplicity-production.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tvindima@imoveismais.pt","password":"testepassword123"}'

# Deve retornar:
# {"access_token":"...", "refresh_token":"...", "user":{...}}
```

**Configurar CORS:**
```python
# backend/app/main.py
ALLOWED_ORIGINS = [
    "https://crm-plus-mobile-app.vercel.app",
    # ... adicionar seu domínio Vercel
]
```

---

### Problema: "Network request failed"

**Causa:** App não consegue chamar Railway API.

**Debug:**
```javascript
// Abrir Console do browser (F12)
// Ver se BASE_URL está correto
console.log(process.env.EXPO_PUBLIC_API_BASE_URL)
// Deve mostrar: https://fantastic-simplicity-production.up.railway.app

// Se mostrar undefined ou localhost, rebuild é necessário
```

---

### Problema: Build travado em "Building JavaScript bundle"

**Solução:**
```bash
# Limpar TUDO
cd /Users/tiago.vindima/Desktop/crm-plus/CRM-PLUS/mobile/app
rm -rf .expo node_modules/.cache web-build dist
watchman watch-del-all 2>/dev/null || true

# Reinstalar
npm install --legacy-peer-deps

# Rebuild
npx expo export:web
```

---

## 📱 PRÓXIMO PASSO: PWA (Progressive Web App)

Depois de web app funcionando, torná-lo "instalável" como app:

### Adicionar Service Worker

```javascript
// mobile/app/web/register-service-worker.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(reg => console.log('Service Worker registrado', reg))
    .catch(err => console.error('Erro ao registrar SW', err));
}
```

### Adicionar Manifest

```json
// mobile/app/web/manifest.json
{
  "name": "CRM PLUS Mobile",
  "short_name": "CRM+",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F3D5C",
  "theme_color": "#0F3D5C",
  "icons": [
    {
      "src": "/icon.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Isso permite:
- "Add to Home Screen" no mobile
- App abre sem barra de navegação do browser
- Ícone na tela inicial do celular
- Funciona offline (com cache)

---

## 🎯 RESUMO: 30 MINUTOS PARA APP ONLINE

```bash
# Comando único (copiar tudo)
cd /Users/tiago.vindima/Desktop/crm-plus/CRM-PLUS/mobile/app && \
echo 'EXPO_PUBLIC_API_BASE_URL=https://fantastic-simplicity-production.up.railway.app
ENVIRONMENT=production' > .env.production && \
rm -rf .expo web-build && \
npx expo export:web && \
cd web-build && \
vercel --prod --name crm-plus-mobile-app && \
say -v Luciana "Tiago, app mobile está online! Verifica o URL no terminal."
```

**Resultado:** App mobile acessível via browser, sincronizando dados reais do Railway.

---

## 📊 COMPARAÇÃO: WEB vs NATIVO

| Feature | Web App | EAS Build iOS/Android |
|---------|---------|----------------------|
| **Tempo deploy** | 30 min | 3-4 horas |
| **Custo** | Grátis | Grátis (Expo) |
| **Plataformas** | Todas | iOS + Android |
| **Instalação** | URL / PWA | App Store + Google Play |
| **Câmera** | ⚠️ Browser API | ✅ Nativo |
| **Push Notifications** | ⚠️ Web Push | ✅ Nativo |
| **Offline** | ⚠️ Service Worker | ✅ Completo |
| **Performance** | 🟡 Boa | 🟢 Excelente |
| **Atualização** | Instantânea | Requer update app |
| **SEO** | ✅ Indexável | ❌ Não aplicável |

---

## 🚀 DEPOIS DO WEB: APPS NATIVOS

Quando web app estiver validado:

### Android APK (2 horas)
```bash
eas build --profile preview --platform android
# Download APK direto
# Distribuir via link
```

### iOS TestFlight (3 horas)
```bash
eas build --profile production --platform ios
eas submit --platform ios
# Beta via TestFlight
```

### Publicação Stores (1-2 semanas)
- Preparar assets (screenshots, descrições)
- Política de privacidade
- Review processo

---

**Agora é executar! 🚀**

---

**Criado em:** 20 dezembro 2025  
**Autor:** GitHub Copilot  
**Versão:** 1.0
