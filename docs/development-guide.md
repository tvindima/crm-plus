# Development Guide

- Clean Code e SOLID orientam todas as camadas.
- Controladores FastAPI chamam services puros, que por sua vez usam repositórios SQLAlchemy.
- Toda entidade terá campos `id`, `created_at`, `updated_at`, `created_by`, `updated_by`.
- Documentação automática via OpenAPI/Swagger é obrigatória.
- Validações devem rejeitar inputs mal formados antes de atingir a camada de dados.
