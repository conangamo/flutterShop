from datetime import datetime, timezone
from pathlib import Path
import uuid

from fastapi import APIRouter, Depends, File, Request, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.exceptions import AppError
from app.db.models import User as UserRow
from app.features.users import service as users_svc
from app.features.users.schemas import UserOut, UserUpdateIn

router = APIRouter()

MEDIA_ROOT = Path(__file__).resolve().parents[3] / "media" / "uploads"


@router.get("/me", response_model=UserOut)
def read_me(current: UserRow = Depends(get_current_user)) -> UserOut:
    return UserOut(
        id=current.id,
        name=current.name,
        email=current.email,
        phone=current.phone,
        avatar=current.avatar,
        bio=current.bio,
        is_active=current.is_active,
        role=str(current.role),
    )


@router.patch("/me", response_model=UserOut)
def patch_me(
    payload: UserUpdateIn,
    db: Session = Depends(get_db),
    current: UserRow = Depends(get_current_user),
) -> UserOut:
    row = users_svc.update_profile(db, current.store_id, current.id, payload)
    return UserOut(
        id=row.id,
        name=row.name,
        email=row.email,
        phone=row.phone,
        avatar=row.avatar,
        bio=row.bio,
        is_active=row.is_active,
        role=str(row.role),
    )


@router.post("/me/avatar", response_model=UserOut)
async def upload_avatar(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current: UserRow = Depends(get_current_user),
) -> UserOut:
    """Upload a new avatar image for the current user."""
    # Validate content type
    content_type = (file.content_type or "").lower()
    if content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise AppError("bad_request", "Only JPEG, PNG, and WebP images are supported", status_code=400)
    
    # Determine file extension
    ext = ".jpg"
    if content_type == "image/png":
        ext = ".png"
    elif content_type == "image/webp":
        ext = ".webp"
    
    # Create avatars directory
    out_dir = MEDIA_ROOT / "avatars"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    name = f"{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:10]}{ext}"
    out_path = out_dir / name
    
    # Read and save file
    data = await file.read()
    if not data:
        raise AppError("bad_request", "Empty file", status_code=400)
    
    out_path.write_bytes(data)
    
    # Construct public URL
    base = str(request.base_url).rstrip("/")
    avatar_url = f"{base}/media/uploads/avatars/{name}"
    
    # Update user's avatar in database
    row = users_svc.update_profile(
        db, 
        current.store_id, 
        current.id, 
        UserUpdateIn(avatar=avatar_url)
    )
    
    return UserOut(
        id=row.id,
        name=row.name,
        email=row.email,
        phone=row.phone,
        avatar=row.avatar,
        bio=row.bio,
        is_active=row.is_active,
        role=str(row.role),
    )
