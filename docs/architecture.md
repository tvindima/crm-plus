
# CRM PLUS Architecture Overview

```mermaid
graph LR
  subgraph Client
    A[Web App]
    B[Mobile App]
  end
  subgraph Backend
    C[FastAPI API]
    D[(PostgreSQL)]
    E[(Redis Cache)]
  end
  F[S3 Storage]
  G[Integrations]

  A -->|REST/WebSocket| C
  B -->|REST/WebSocket| C
  C --> D
  C --> E
  C --> F
  C --> G
```

The platform follows an API-first approach. FastAPI exposes `/api/v1` endpoints secured with JWT. PostgreSQL stores authoritative data while Redis accelerates caching, rate limiting, and workflows.
