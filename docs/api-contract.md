# API Contract (Preview)

## Auth

- `POST /api/v1/auth/login`
  - Request
    ```json
    {
      "email": "agent@broker.pt",
      "password": "changeme"
    }
    ```
  - Response 200
    ```json
    {
      "access_token": "token",
      "token_type": "bearer",
      "expires_at": "2025-01-01T12:00:00Z"
    }
    ```

## Health

- `GET /api/v1/health`
  - Response 200
    ```json
    {
      "service": "CRM PLUS API",
      "status": "ok",
      "timestamp": "2025-01-01T12:00:00Z"
    }
    ```
