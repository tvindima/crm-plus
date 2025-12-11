from datetime import UTC, datetime

from fastapi import APIRouter

from app.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse)
def read_health() -> HealthResponse:
    """Simple readiness probe for monitoring."""
    return HealthResponse(service="CRM PLUS API", status="ok", timestamp=datetime.now(UTC))
