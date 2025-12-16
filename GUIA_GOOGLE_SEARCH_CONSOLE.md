# 🔍 Guia Google Search Console - Imóveis Mais

## 📋 Pré-requisitos
- ✅ **Site em Produção**: https://web-k0x8jrf7q-toinos-projects.vercel.app
- ✅ **Sitemap.xml**: Gerado dinamicamente com ~109 URLs
- ✅ **Robots.txt**: Configurado com diretrizes corretas
- ✅ **Structured Data**: JSON-LD implementado (Product + BreadcrumbList)
- ✅ **Metadata**: Open Graph, Twitter Cards, canonical URLs

---

## 🚀 Passo 1: Adicionar Propriedade ao Search Console

### 1.1 Aceder ao Google Search Console
```
URL: https://search.google.com/search-console
```

### 1.2 Adicionar Nova Propriedade
1. Clique em **"Adicionar propriedade"**
2. Escolha **"Prefixo do URL"**
3. Insira: `https://web-k0x8jrf7q-toinos-projects.vercel.app`
4. Clique em **"Continuar"**

---

## ✅ Passo 2: Verificar Ownership

### Opção A: Verificação por Ficheiro HTML (Recomendado)
1. Descarregue o ficheiro de verificação (ex: `googleXXXXXXX.html`)
2. Adicione ao projeto:
   ```bash
   # Crie o ficheiro em frontend/web/public/
   cp ~/Downloads/googleXXXXXXX.html /Users/tiago.vindima/Desktop/'CRM PLUS'/frontend/web/public/
   
   # Faça commit e deploy
   cd /Users/tiago.vindima/Desktop/'CRM PLUS'
   git add frontend/web/public/googleXXXXXXX.html
   git commit -m "feat: adicionar verificação Google Search Console"
   git push origin main
   
   # Deploy
   cd frontend/web
   vercel --prod --yes
   ```
3. Clique em **"Verificar"** no Search Console

### Opção B: Verificação por Meta Tag
1. Copie a meta tag fornecida
2. Adicione ao `app/layout.tsx` em `metadata`:
   ```tsx
   export const metadata: Metadata = {
     // ... outras configs
     verification: {
       google: 'SEU_CODIGO_AQUI'
     }
   }
   ```
3. Faça deploy e clique em **"Verificar"**

### Opção C: Verificação por DNS (Vercel)
1. Copie o registo TXT fornecido
2. Vá a Vercel Dashboard → Settings → Domains
3. Adicione o registo TXT ao DNS
4. Aguarde propagação (pode demorar até 72h)
5. Clique em **"Verificar"**

---

## 📤 Passo 3: Submeter Sitemap

### 3.1 Aceder a Sitemaps
1. No menu lateral, clique em **"Sitemaps"**
2. Insira: `sitemap.xml`
3. Clique em **"Submeter"**

### 3.2 Validar Sitemap
Aguarde 24-48h e verifique:
- **Estado**: Sucesso ✅
- **URLs descobertos**: ~109
- **Erros**: 0

---

## 📊 Passo 4: Monitorizar Indexação

### 4.1 Verificar Páginas Indexadas
1. Menu lateral → **"Indexação"** → **"Páginas"**
2. Aguarde 48-72h para indexação inicial
3. Monitore:
   - **Páginas válidas**: Deve aumentar gradualmente
   - **Excluídas**: Verificar motivos
   - **Erros**: Corrigir imediatamente

### 4.2 Verificar Cobertura
1. Menu lateral → **"Cobertura"**
2. Verifique gráfico de URLs indexados vs. válidos
3. Meta: **99%+ de cobertura**

### 4.3 Inspecionar URL Específico
```
Ferramenta: Inspeção de URL
Teste: https://web-k0x8jrf7q-toinos-projects.vercel.app/imovel/TV1270

Verificar:
✅ URL está no Google
✅ Rastreamento permitido
✅ Indexação permitida
✅ Sitemap correto
✅ Página canónica correta
```

---

## 🔧 Passo 5: Validar Structured Data

### 5.1 Rich Results Test
```
URL: https://search.google.com/test/rich-results
Testar: https://web-k0x8jrf7q-toinos-projects.vercel.app/imovel/TV1270

Resultados Esperados:
✅ Product schema detectado
✅ BreadcrumbList schema detectado
✅ 0 erros
✅ 0 avisos críticos
```

### 5.2 Schema Markup Validator
```
URL: https://validator.schema.org/
Colar HTML da página ou URL

Verificar:
✅ Structured data válido
✅ Propriedades corretas (price, address, floorSize)
✅ Breadcrumbs hierarchy correta
```

---

## 📈 Passo 6: Configurar Alertas e Relatórios

### 6.1 Ativar Notificações Email
1. **Configurações** → **Utilizadores e permissões**
2. Ative notificações para:
   - ✅ Erros críticos de rastreamento
   - ✅ Ações manuais
   - ✅ Problemas de segurança
   - ✅ Novos problemas de AMP

### 6.2 Relatórios Semanais
Monitore:
- **Desempenho** (Pesquisa Google):
  - Cliques
  - Impressões
  - CTR médio
  - Posição média
- **Core Web Vitals**:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- **Experiência na página**:
  - URLs otimizados para mobile
  - HTTPS
  - Sem overlays intrusivos

---

## 🎯 Metas de Sucesso (30-60 dias)

### KPIs de Indexação
- ✅ **100+ URLs indexados** (de ~109 disponíveis)
- ✅ **0 erros críticos**
- ✅ **Sitemap processado sem erros**

### KPIs de Performance
- ✅ **Impressões**: 1000+/mês
- ✅ **Cliques**: 50+/mês
- ✅ **CTR médio**: 3-5%
- ✅ **Posição média**: Top 20 para keywords principais

### KPIs Técnicos
- ✅ **Core Web Vitals**: 90%+ URLs "Bom"
- ✅ **Mobile Usability**: 100% URLs otimizados
- ✅ **Structured Data**: 0 erros

---

## 🔍 Keywords Alvo (Portugal)

### Primary Keywords
```
- "imoveis portugal"
- "casas venda leiria"
- "apartamentos leiria"
- "moradias batalha"
- "imoveis venda portugal"
```

### Long-tail Keywords
```
- "apartamento t2 leiria preço"
- "moradia t4 batalha com jardim"
- "imoveis investimento portugal"
- "casas venda marinha grande"
```

### Local SEO
```
- "imobiliaria leiria"
- "agentes imobiliarios leiria"
- "imoveis mais leiria"
```

---

## 📝 Checklist de Atividades Recorrentes

### Semanal ✅
- [ ] Verificar erros de rastreamento
- [ ] Monitorar posições de keywords principais
- [ ] Rever Core Web Vitals

### Mensal ✅
- [ ] Analisar relatório de desempenho
- [ ] Identificar páginas com baixo CTR
- [ ] Otimizar meta descriptions de páginas com impressões altas
- [ ] Verificar backlinks novos

### Trimestral ✅
- [ ] Auditoria completa de SEO
- [ ] Análise de concorrência
- [ ] Atualizar keywords alvo
- [ ] Revisar e melhorar conteúdo de baixo desempenho

---

## 🚨 Troubleshooting Comum

### Problema: Sitemap não processado
**Solução**:
1. Verificar URL sitemap está correto
2. Testar `curl https://web-k0x8jrf7q-toinos-projects.vercel.app/sitemap.xml`
3. Validar XML em https://www.xml-sitemaps.com/validate-xml-sitemap.html
4. Re-submeter

### Problema: URLs não indexados
**Solução**:
1. Verificar robots.txt não bloqueia
2. Usar ferramenta "Inspecionar URL"
3. Solicitar indexação manual
4. Aguardar 48-72h

### Problema: Structured data com erros
**Solução**:
1. Testar em https://search.google.com/test/rich-results
2. Corrigir erros indicados
3. Fazer deploy
4. Solicitar nova validação

### Problema: Core Web Vitals ruins
**Solução**:
1. Executar Lighthouse audit
2. Otimizar imagens (WebP, lazy loading)
3. Reduzir JavaScript não usado
4. Implementar CDN para assets estáticos

---

## 📞 Suporte e Recursos

### Documentação Oficial
- **Search Console Help**: https://support.google.com/webmasters
- **SEO Starter Guide**: https://developers.google.com/search/docs/beginner/seo-starter-guide
- **Structured Data**: https://developers.google.com/search/docs/appearance/structured-data

### Ferramentas Recomendadas
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
- **Rich Results Test**: https://search.google.com/test/rich-results
- **Schema Validator**: https://validator.schema.org/

---

## ✅ Status Atual (16 Dezembro 2025)

| Item | Status | Observações |
|------|--------|-------------|
| **Build Produção** | ✅ Completo | 63 páginas, 0 erros |
| **Deploy Vercel** | ✅ Ativo | 43s deploy time |
| **Sitemap.xml** | ✅ Funcional | ~109 URLs dinâmicos |
| **Robots.txt** | ✅ Configurado | Diretrizes corretas |
| **Structured Data** | ✅ Implementado | Product + BreadcrumbList |
| **Metadata SEO** | ✅ Completo | OG, Twitter, canonical |
| **Lighthouse Score** | ✅ Bom | Performance 87%, SEO 66% → 90%+ esperado |
| **Search Console** | ⏳ Pendente | Aguarda configuração pelo utilizador |

---

## 🎉 Próximo Passo Imediato

**AÇÃO REQUERIDA**:
1. Aceda a https://search.google.com/search-console
2. Adicione propriedade: `https://web-k0x8jrf7q-toinos-projects.vercel.app`
3. Verifique ownership (método HTML recomendado)
4. Submeta sitemap: `sitemap.xml`
5. Aguarde 24-48h para primeira indexação

**Prazo**: O mais rápido possível para iniciar processo de indexação.

---

**Documento criado**: 16 Dezembro 2025  
**Última atualização**: 16 Dezembro 2025  
**Versão**: 1.0  
**Autor**: CRM PLUS Dev Team
