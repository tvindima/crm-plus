# 📱 EXPO GO - INSTRUÇÕES DE TESTE

**Data:** 18 Dezembro 2025  
**Servidor:** ✅ ATIVO

---

## 🌐 Servidor Expo

**Status:** ✅ Rodando  
**URL:** `exp://192.168.50.14:8081`  
**QR Code:** Visível no terminal

---

## 📲 OPÇÃO 1: Testar no Telemóvel (Expo Go)

### iOS:
1. Baixa **Expo Go** da App Store
2. Abre a app Expo Go
3. Toca em "Scan QR Code"
4. Aponta a câmera para o QR code no terminal
5. App vai carregar automaticamente

### Android:
1. Baixa **Expo Go** da Play Store
2. Abre a app Expo Go
3. Toca em "Scan QR code"
4. Aponta a câmera para o QR code no terminal
5. App vai carregar automaticamente

**Ou usa o link direto:**
```
exp://192.168.50.14:8081
```

---

## 💻 OPÇÃO 2: Simulador iOS (macOS)

No terminal onde o Expo está a correr, pressiona:
```
i
```

Isto vai:
1. Abrir Xcode Simulator automaticamente
2. Instalar Expo Go no simulador
3. Carregar a app CRM PLUS Mobile

---

## 🤖 OPÇÃO 3: Emulador Android

No terminal onde o Expo está a correr, pressiona:
```
a
```

Isto vai:
1. Verificar se Android Studio está instalado
2. Abrir emulador Android
3. Carregar a app CRM PLUS Mobile

---

## 🌍 OPÇÃO 4: Web Browser (Limitado)

No terminal onde o Expo está a correr, pressiona:
```
w
```

**Nota:** A versão web tem limitações pois a app foi desenvolvida para mobile.

---

## 🔧 Comandos Úteis no Terminal Expo

Enquanto o servidor está a correr:

- `r` - Reload app (reiniciar app sem fechar)
- `m` - Toggle developer menu
- `j` - Open debugger (Chrome DevTools)
- `o` - Open code editor
- `?` - Show all commands
- `Ctrl+C` - Stop server

---

## ✅ O Que Vais Ver (PASSO 1 Validação)

### 🏠 HomeScreenV2 (Dashboard)

**Background:**
- ✅ Gradient escuro (#0B0B0D → #12141A)
- ✅ Sem branco puro

**Header:**
- ✅ Greeting "Boa tarde, Tiago!"
- ✅ Avatar circular com letra inicial
- ✅ Border cyan no avatar

**Stats Grid (4 cards):**
- ✅ Gradient subtle (cyan + purple)
- ✅ Border cyan
- ✅ Icons: 🏠 👥 📅 ✨
- ✅ Valores numéricos grandes e cyan
- ✅ Labels em texto claro

**Próximas Visitas:**
- ✅ Cards com background dark
- ✅ Border subtle
- ✅ Icon 🏠
- ✅ Property title
- ✅ Timestamp formatado (Hoje/Amanhã)
- ✅ Status badge com cor dinâmica
- ✅ Lead name (se disponível)

**Ações Rápidas:**
- ✅ 4 cards: Propriedades, Leads, Agenda, Assistente IA
- ✅ Icons grandes em containers dark
- ✅ Labels brancas
- ✅ Hover/press feedback

**Estados:**
- ✅ Loading State: Spinner cyan + mensagem
- ✅ Empty State: Icon 📅 + "Sem visitas agendadas"
- ✅ Error State: Card com retry button

---

## ⚠️ Problemas Conhecidos

### Warnings (não impedem uso):
```
The following packages should be updated:
  @expo/metro-runtime@6.1.2 - expected version: ~3.2.3
  expo@51.0.0 - expected version: ~51.0.39
  react-native@0.74.1 - expected version: 0.74.5
  ...
```

**Impacto:** Nenhum para testes básicos. Atualizar se encontrar bugs.

---

## 🐛 Se Algo Correr Mal

### App não abre:
1. Verifica se telemóvel e Mac estão na mesma rede Wi-Fi
2. Tenta recarregar: pressiona `r` no terminal

### Erro de conexão:
1. Para o servidor: `Ctrl+C`
2. Reinicia: `npm start`
3. Scan QR code novamente

### Crash ao abrir:
1. Verifica logs no terminal
2. Tira screenshot do erro
3. Pressiona `r` para reload

---

## 📊 Checklist de Validação Visual

Enquanto testa no device, confirma:

### Background & Layout:
- [ ] Background é gradient escuro (não branco)
- [ ] Safe area funciona (notch/status bar)
- [ ] Scroll smooth sem jumps

### Componentes:
- [ ] Stats cards têm glow cyan subtil
- [ ] Texto é legível (branco/cinza claro)
- [ ] Botões têm gradient cyan → purple
- [ ] Cards têm border subtle

### Interação:
- [ ] Pull-to-refresh funciona
- [ ] Cards são clicáveis
- [ ] Feedback visual ao pressionar
- [ ] Navegação funciona (bottom tabs)

### Performance:
- [ ] Carregamento inicial rápido (<3s)
- [ ] Transições smooth
- [ ] Sem lag ao scroll

---

## 📸 Próximos Passos

Quando testares:

1. **Tira screenshots** de:
   - HomeScreen completo
   - Stats cards (zoom)
   - Visitas cards
   - Estados (loading/empty/error se aparecerem)

2. **Reporta bugs:**
   - Descrição do problema
   - Screenshot
   - Logs do terminal (se houver erro)

3. **Feedback visual:**
   - Cores estão corretas?
   - Spacing coerente?
   - Glow visível?
   - Design "premium"?

---

**Servidor ativo em:** Terminal atual  
**Para parar:** `Ctrl+C` no terminal

**Link direto Expo Go:**
```
exp://192.168.50.14:8081
```

**QR Code:** Visível no terminal onde correste `npm start` 📱
