import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from . import services, schemas
from app.database import get_db
from app.properties.models import PropertyStatus

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("/", response_model=list[schemas.PropertyOut])
def list_properties(
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    return services.get_properties(db, skip=skip, limit=limit, search=search, status=status)


@router.get("/{property_id}", response_model=schemas.PropertyOut)
def get_property(property_id: int, db: Session = Depends(get_db)):
    property = services.get_property(db, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property


@router.post("/", response_model=schemas.PropertyOut, status_code=201)
def create_property(property: schemas.PropertyCreate, db: Session = Depends(get_db)):
    return services.create_property(db, property)


@router.put("/{property_id}", response_model=schemas.PropertyOut)
def update_property(property_id: int, property_update: schemas.PropertyUpdate, db: Session = Depends(get_db)):
    property = services.update_property(db, property_id, property_update)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property


@router.delete("/{property_id}", response_model=schemas.PropertyOut)
def delete_property(property_id: int, db: Session = Depends(get_db)):
    property = services.delete_property(db, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property


@router.post("/{property_id}/upload")
async def upload_property_images(
    property_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    property_obj = services.get_property(db, property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")

    media_root = os.path.join("media", "properties", str(property_id))
    os.makedirs(media_root, exist_ok=True)

    urls = property_obj.images or []
    for upload in files:
        file_location = os.path.join(media_root, upload.filename)
        with open(file_location, "wb") as buffer:
            buffer.write(await upload.read())
        urls.append(f"/media/properties/{property_id}/{upload.filename}")

    services.update_property(
        db,
        property_id,
        schemas.PropertyUpdate(images=urls),
    )
    return JSONResponse({"uploaded": len(files), "urls": urls})
