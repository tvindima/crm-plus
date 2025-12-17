# 🎬 Instalação do FFmpeg no Railway

## Para comprimir vídeos automaticamente, instale FFmpeg no Railway:

### Opção 1: Via Nixpacks (Recomendado)

Crie `nixpacks.toml` na raiz do projeto:

```toml
[phases.setup]
nixPkgs = ["python39", "ffmpeg"]
```

### Opção 2: Via Dockerfile

Se já usa Dockerfile, adicione:

```dockerfile
RUN apt-get update && apt-get install -y ffmpeg
```

### Opção 3: Build Command no Railway

No Railway Dashboard > Settings > Build Command:

```bash
apt-get update && apt-get install -y ffmpeg && pip install -r requirements.txt
```

---

## Verificar se FFmpeg está instalado:

```bash
ffmpeg -version
```

## Sem FFmpeg:

- Vídeos ≤20MB: Aceita original sem compressão
- Vídeos >20MB: Rejeita com erro

## Com FFmpeg:

- Compressão automática para ~2Mbps (Full HD)
- Reduz significativamente o tamanho
- Otimiza para streaming web
