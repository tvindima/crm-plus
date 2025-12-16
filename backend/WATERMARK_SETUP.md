# Configuração de Marca D'água

## 📝 Como adicionar logo da agência

1. **Criar logo transparente (PNG com fundo transparente)**
   - Dimensões recomendadas: 500x500px ou maior
   - Formato: PNG com canal alpha (transparência)
   - Fundo: Transparente
   - Logo: Preferencialmente branco ou cor clara

2. **Salvar arquivo:**
   ```
   backend/media/logo-watermark.png
   ```

3. **Pronto!** O sistema aplicará automaticamente em todas as imagens

## ⚙️ Configurações atuais

- **Opacidade**: 60% (WATERMARK_OPACITY = 0.6)
- **Tamanho**: 15% da largura da imagem (WATERMARK_SCALE = 0.15)
- **Posição**: Canto inferior direito com margem de 20px
- **Aplicado em**: Imagens medium e large (não em thumbnails)

## �� Ajustar configurações

Edite `backend/app/properties/routes.py`:

```python
WATERMARK_OPACITY = 0.6   # 0.0 a 1.0 (0% a 100%)
WATERMARK_SCALE = 0.15    # Tamanho relativo (15% da largura)
```

## 🧪 Testar

1. Adicione `logo-watermark.png` em `backend/media/`
2. Faça upload de uma propriedade
3. Verifique as imagens salvas (medium e large terão watermark)

## ⚠️ Notas

- Se o arquivo não existir, sistema continua funcionando SEM watermark
- Marca d'água NÃO é aplicada em thumbnails (muito pequenos)
- Posição fixa: canto inferior direito
- Mantém proporção do logo original
