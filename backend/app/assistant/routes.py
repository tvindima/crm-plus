from fastapi import APIRouter
from .services import handle_intent

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/intent/")
def parse_intent(text: str):
    return {"result": handle_intent(text)}
