# 🗺️ CONFIGURAÇÃO GOOGLE PLACES API

## 📋 PRÉ-REQUISITOS

Este sistema usa **Google Places API** para autocomplete de moradas e mapas interativos.

---

## 🔑 OBTER API KEY

### 1. Aceder Google Cloud Console
https://console.cloud.google.com/

### 2. Criar/Selecionar Projeto
- Clicar em "Select a project" (topo)
- "New Project" → Nome: "CRM PLUS Mobile"
- Aguardar criação (~30s)

### 3. Ativar APIs Necessárias

**APIs & Services** → **Library** → Pesquisar e ativar:

✅ **Places API** (obrigatório)
✅ **Maps SDK for Android** (obrigatório para Android)
✅ **Maps SDK for iOS** (obrigatório para iOS)
✅ **Geocoding API** (opcional - reverse geocoding)

### 4. Criar API Key

**APIs & Services** → **Credentials** → **+ CREATE CREDENTIALS** → **API Key**

Copiar a chave: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

---

## 🔒 RESTRINGIR API KEY (SEGURANÇA)

**⚠️ IMPORTANTE:** Não usar API key sem restrições em produção!

### Opção 1: Restringir por aplicação (RECOMENDADO)

**Credentials** → Clicar na API Key criada → **Application restrictions**:

#### **Android:**
- Selecionar: **Android apps**
- Adicionar:
  - **Package name:** `com.tiagovindima.crmplus`
  - **SHA-1:** Obter com:
    ```bash
    cd mobile/app
    keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
    ```

#### **iOS:**
- Selecionar: **iOS apps**
- Adicionar **Bundle ID:** `com.tiagovindima.crmplus`

### Opção 2: Restringir por API (DESENVOLVIMENTO)

**API restrictions** → **Restrict key**:
- ✅ Places API
- ✅ Maps SDK for Android
- ✅ Maps SDK for iOS
- ✅ Geocoding API

---

## ⚙️ CONFIGURAR NO PROJETO

### 1. Criar ficheiro `.env`

```bash
cd mobile/app
cp .env.example .env
```

### 2. Editar `.env`

```env
EXPO_PUBLIC_API_BASE_URL=https://fantastic-simplicity-production.up.railway.app
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Atualizar `app.json` (já configurado)

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "SUA_API_KEY_AQUI"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "SUA_API_KEY_AQUI"
        }
      }
    }
  }
}
```

**⚠️ NOTA:** Por segurança, as chaves em `app.json` devem ser diferentes para iOS/Android em produção.

---

## 🧪 TESTAR

```bash
cd mobile/app
npx expo start --clear
```

### Cenários de Teste:

#### ✅ Autocomplete
1. Agenda → + → Campo "Localização"
2. Clicar ícone 🗺️
3. Escrever: "Praça do Comércio, Lisboa"
4. Selecionar sugestão
5. **Esperado:** Mapa move para Lisboa + pin colocado

#### ✅ GPS Atual
1. Clicar botão 📍 (canto superior direito)
2. Permitir acesso localização
3. **Esperado:** Mapa move para localização atual

#### ✅ Arrastar Pin
1. Segurar pin no mapa
2. Arrastar para outro local
3. Soltar
4. **Esperado:** Endereço atualiza automaticamente

#### ✅ Criar Evento
1. Escolher localização
2. Confirmar (✓)
3. Preencher formulário
4. Criar evento
5. **Esperado:** Backend recebe `latitude`, `longitude`, `location`

---

## 💰 CUSTOS

### Tier Gratuito (por mês):
- **Places Autocomplete:** $0.00 até 1.000 requests
- **Geocoding API:** $0.00 até 40.000 requests
- **Maps SDK:** Gratuito (uso estático)

### Após Tier Gratuito:
- Places Autocomplete: $2.83 por 1.000 requests
- Geocoding: $5.00 por 1.000 requests

**Estimativa:** ~100-300 requests/dia = **Gratuito** 🎉

---

## 🐛 TROUBLESHOOTING

### Erro: "API key not valid"
- ✅ Verificar se API key está correta no `.env`
- ✅ Confirmar que **Places API** está ativada
- ✅ Aguardar 5 minutos após criar key (propagação)

### Erro: "This API project is not authorized"
- ✅ Ativar **Maps SDK for Android/iOS**
- ✅ Verificar restrições da API key

### Sugestões não aparecem
- ✅ Confirmar internet ativa
- ✅ Verificar console para erros de API
- ✅ Testar com VPN desligada

### Localização GPS não funciona
- ✅ Verificar permissões no dispositivo
- ✅ Testar em dispositivo real (não emulador)
- ✅ Confirmar que `expo-location` está instalado

---

## 📚 DOCUMENTAÇÃO OFICIAL

- **Places API:** https://developers.google.com/maps/documentation/places/web-service
- **React Native Maps:** https://github.com/react-native-maps/react-native-maps
- **Expo Location:** https://docs.expo.dev/versions/latest/sdk/location/

---

## 🔐 SEGURANÇA `.env`

**⚠️ NUNCA FAZER COMMIT DE `.env`!**

Verificar `.gitignore`:
```bash
cat mobile/app/.gitignore | grep .env
```

Se não existir:
```bash
echo ".env" >> mobile/app/.gitignore
echo ".env.local" >> mobile/app/.gitignore
```

---

**✅ PRONTO! Sistema de localização configurado!** 🗺️
