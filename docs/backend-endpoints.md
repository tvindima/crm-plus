# CRM PLUS – Endpoints Properties (atualização)

## Mantidos
- `GET /properties/` — lista com `skip/limit`, agora suporta filtros opcionais `search`, `status`.
- `GET /properties/{id}` — detalhe.
- `POST /properties` — cria propriedade.
- `PUT /properties/{id}` — atualiza propriedade.
- `DELETE /properties/{id}` — remove propriedade.

## Novos/Ajustados
- Model `Property` expandido: `reference`, `business_type`, `property_type`, `typology`, `usable_area`, `land_area`, `municipality`, `parish`, `condition`, `energy_certificate`, `observations`, `images (JSON)`, `created_at/updated_at`.
- `POST /properties/{id}/upload` — multipart upload para `media/properties/{id}/`; retorna URLs relativas `/media/...` e atualiza campo `images`.
- Static files montados em `/media`.
- Filtros em listagem: `search` (titulo/referencia/localizacao), `status` (`available|reserved|sold`).

## TODOs
- Migration: propriedades novas colunas requerem recriar DB ou aplicar migração (SQLite não migra colunas automaticamente).
- Autenticação/permissões ainda não aplicadas (TODO).
- Upload: atualmente grava em filesystem local `media/properties/{id}`; para produção, integrar storage/cloud + validação de tamanho/mimetype.
- Validar campos adicionais (negócio, certificados) conforme regras de negócio finais.
