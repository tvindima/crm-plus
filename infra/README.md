
# CRM PLUS Infrastructure

Docker Compose enables local development parity while Kubernetes manifests describe production-ready orchestration.

## Arquivos de Configuração

### Docker Compose
- `docker-compose.yml` - Desenvolvimento local completo (backend, frontend, postgres, redis)

### Kubernetes
- `k8s/backend-deployment.yaml` - Deploy do backend API
- `k8s/frontend-deployment.yaml` - Deploy do frontend web
- `k8s/redis.yaml` - Deploy do Redis
- `k8s/ingress.yaml` - Configuração de domínio, SSL e roteamento

## Configuração de Domínio

Para configurar domínios personalizados (ex: `crmplus.com`, `api.crmplus.com`):

### Documentação
- 📘 **[Guia Completo](../docs/domain-setup.md)** - Configuração detalhada
- 🚀 **[Guia Rápido](../docs/domain-quickstart.md)** - Setup por cenário
- 🌍 **[Ambientes](../docs/domain-environments.md)** - Config por ambiente

### Scripts Auxiliares
```bash
# Setup assistido
./scripts/setup-domain.sh production

# Validação de configuração
./scripts/validate-domain.sh crmplus.com api.crmplus.com
```

## Deploy Local

```bash
# Subir todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Logs
docker-compose logs -f

# Parar
docker-compose down
```

## Deploy Kubernetes

### Pré-requisitos
```bash
# NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# cert-manager (SSL automático)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### Deploy
```bash
# Aplicar todos os manifests
kubectl apply -f k8s/

# Ou individualmente
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Verificar
kubectl get pods
kubectl get services
kubectl get ingress
kubectl get certificates
```

### Obter IP do LoadBalancer
```bash
kubectl get service ingress-nginx-controller -n ingress-nginx
```

Use o `EXTERNAL-IP` nos seus registros DNS tipo A.

## Ambientes

### Desenvolvimento Local
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Staging/Production
Configure via variáveis de ambiente e Ingress (ver `k8s/ingress.yaml`).

## Recursos Adicionais

- [Deploy/UAT Guide](../docs/deploy-uat.md)
- [Scripts README](../scripts/README.md)
- [Backend README](../backend/README.md)
