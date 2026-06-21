import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.attachment import Attachment
from app.models.enums import Role
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.attachment import AttachmentResponse


router = APIRouter(tags=["Attachments"])

BACKEND_ROOT = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BACKEND_ROOT / "uploads"


def _can_access_ticket(ticket: Ticket, current_user: User) -> bool:
    if current_user.role == Role.ADMIN:
        return True
    if current_user.role == Role.AGENT:
        return ticket.assigned_to == current_user.id
    return ticket.created_by == current_user.id


def _get_ticket_or_404(ticket_id: uuid.UUID, db: Session) -> Ticket:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )
    return ticket


def _ensure_ticket_access(ticket: Ticket, current_user: User) -> None:
    if not _can_access_ticket(ticket, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this ticket",
        )


def _get_attachment_or_404(attachment_id: uuid.UUID, db: Session) -> Attachment:
    attachment = db.get(Attachment, attachment_id)
    if attachment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found",
        )
    return attachment


def _build_stored_filename(original_filename: str) -> str:
    safe_suffix = Path(original_filename).suffix[:20]
    return f"{uuid.uuid4()}{safe_suffix}"


def _sanitize_original_filename(original_filename: str) -> str:
    safe_name = Path(original_filename).name
    if len(safe_name) <= 255:
        return safe_name

    suffix = Path(safe_name).suffix[:20]
    stem_limit = 255 - len(suffix)
    return f"{Path(safe_name).stem[:stem_limit]}{suffix}"


def _remove_local_file(file_path: str) -> None:
    target_path = (BACKEND_ROOT / file_path).resolve()
    upload_root = UPLOAD_DIR.resolve()

    if upload_root not in target_path.parents:
        return

    if target_path.exists() and target_path.is_file():
        target_path.unlink()


@router.post(
    "/tickets/{ticket_id}/attachments",
    response_model=AttachmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_attachment(
    ticket_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Attachment:
    """Upload a local file attachment for a ticket visible to the authenticated user."""
    ticket = _get_ticket_or_404(ticket_id, db)
    _ensure_ticket_access(ticket, current_user)

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a filename",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    stored_filename = _build_stored_filename(file.filename)
    absolute_file_path = UPLOAD_DIR / stored_filename
    relative_file_path = (Path("uploads") / stored_filename).as_posix()

    with absolute_file_path.open("wb") as destination:
        shutil.copyfileobj(file.file, destination)

    attachment = Attachment(
        ticket_id=ticket.id,
        filename=_sanitize_original_filename(file.filename),
        file_path=relative_file_path,
        uploaded_by=current_user.id,
        uploaded_at=datetime.now(timezone.utc),
    )
    db.add(attachment)

    try:
        db.commit()
    except Exception:
        db.rollback()
        _remove_local_file(relative_file_path)
        raise

    db.refresh(attachment)
    return attachment


@router.get("/tickets/{ticket_id}/attachments", response_model=list[AttachmentResponse])
def list_attachments(
    ticket_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Attachment]:
    """List attachment metadata for a ticket visible to the authenticated user."""
    ticket = _get_ticket_or_404(ticket_id, db)
    _ensure_ticket_access(ticket, current_user)

    attachments = db.scalars(
        select(Attachment)
        .where(Attachment.ticket_id == ticket.id)
        .order_by(Attachment.uploaded_at.desc())
    ).all()
    return list(attachments)


@router.delete("/attachments/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attachment(
    attachment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete an attachment when requested by an admin or the original uploader."""
    attachment = _get_attachment_or_404(attachment_id, db)

    if current_user.role != Role.ADMIN and attachment.uploaded_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this attachment",
        )

    _remove_local_file(attachment.file_path)
    db.delete(attachment)
    db.commit()
    return None
