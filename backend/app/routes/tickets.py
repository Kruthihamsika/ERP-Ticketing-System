import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import InstrumentedAttribute

from app.core.dependencies import get_current_user, require_admin
from app.database.connection import get_db
from app.models.activity_log import ActivityLog
from app.models.comment import Comment
from app.models.enums import Department, Priority, Role, TicketStatus
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.activity_log import ActivityLogResponse
from app.schemas.comment import CommentCreate, CommentResponse
from app.schemas.ticket import (
    PaginatedTicketsResponse,
    TicketAssignRequest,
    TicketCreate,
    TicketResolveRequest,
    TicketResponse,
    TicketStatusUpdateRequest,
    TicketUpdate,
)


router = APIRouter(prefix="/tickets", tags=["Tickets"])

ALLOWED_STATUS_TRANSITIONS: dict[TicketStatus, set[TicketStatus]] = {
    TicketStatus.OPEN: {TicketStatus.ASSIGNED},
    TicketStatus.ASSIGNED: {TicketStatus.IN_PROGRESS},
    TicketStatus.IN_PROGRESS: {TicketStatus.RESOLVED},
    TicketStatus.RESOLVED: {TicketStatus.CLOSED},
    TicketStatus.CLOSED: set(),
    TicketStatus.REJECTED: set(),
}

SORTABLE_TICKET_FIELDS: dict[str, InstrumentedAttribute[object]] = {
    "created_at": Ticket.created_at,
    "updated_at": Ticket.updated_at,
    "priority": Ticket.priority,
    "status": Ticket.status,
}


def _ticket_list_statement(current_user: User) -> Select[tuple[Ticket]]:
    if current_user.role == Role.ADMIN:
        return select(Ticket)

    if current_user.role == Role.AGENT:
        return select(Ticket).where(Ticket.assigned_to == current_user.id)

    return select(Ticket).where(Ticket.created_by == current_user.id)


def _apply_ticket_filters(
    statement: Select[tuple[Ticket]],
    ticket_status: TicketStatus | None,
    priority: Priority | None,
    department: Department | None,
    search: str | None,
) -> Select[tuple[Ticket]]:
    if ticket_status is not None:
        statement = statement.where(Ticket.status == ticket_status)

    if priority is not None:
        statement = statement.where(Ticket.priority == priority)

    if department is not None:
        statement = statement.where(Ticket.department == department)

    if search:
        stripped_search = search.strip()
        if stripped_search:
            search_pattern = f"%{stripped_search}%"
            statement = statement.where(
                or_(
                    Ticket.title.ilike(search_pattern),
                    Ticket.description.ilike(search_pattern),
                )
            )

    return statement


def _apply_ticket_sorting(
    statement: Select[tuple[Ticket]],
    sort_by: str,
    sort_order: str,
) -> Select[tuple[Ticket]]:
    sort_column = SORTABLE_TICKET_FIELDS[sort_by]
    if sort_order == "asc":
        return statement.order_by(sort_column.asc())
    return statement.order_by(sort_column.desc())


def _can_access_ticket(ticket: Ticket, current_user: User) -> bool:
    if current_user.role == Role.ADMIN:
        return True
    if current_user.role == Role.AGENT:
        return ticket.assigned_to == current_user.id
    return ticket.created_by == current_user.id


def _ensure_ticket_access(ticket: Ticket, current_user: User) -> None:
    if not _can_access_ticket(ticket, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this ticket",
        )


def _get_ticket_or_404(ticket_id: uuid.UUID, db: Session) -> Ticket:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )
    return ticket


def _create_activity_log(
    db: Session,
    ticket_id: uuid.UUID,
    action: str,
    performed_by: uuid.UUID,
) -> ActivityLog:
    activity_log = ActivityLog(
        ticket_id=ticket_id,
        action=action,
        performed_by=performed_by,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(activity_log)
    return activity_log


def _validate_status_transition(
    current_status: TicketStatus,
    new_status: TicketStatus,
    current_user: User,
) -> None:
    if current_status == new_status:
        return

    if current_user.role == Role.ADMIN:
        return

    allowed_next_statuses = ALLOWED_STATUS_TRANSITIONS[current_status]
    if new_status not in allowed_next_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition from {current_status.value} to {new_status.value}",
        )


def _apply_ticket_updates(
    ticket: Ticket,
    updates: TicketUpdate,
    current_user: User,
    db: Session,
) -> None:
    update_data = updates.model_dump(exclude_unset=True)
    if not update_data:
        return

    old_status = ticket.status
    new_status = update_data.get("status")

    if isinstance(new_status, TicketStatus):
        _validate_status_transition(old_status, new_status, current_user)

    for field_name, value in update_data.items():
        setattr(ticket, field_name, value)

    ticket.updated_at = datetime.now(timezone.utc)
    _create_activity_log(
        db=db,
        ticket_id=ticket.id,
        action="Ticket updated",
        performed_by=current_user.id,
    )

    if isinstance(new_status, TicketStatus) and old_status != new_status:
        _create_activity_log(
            db=db,
            ticket_id=ticket.id,
            action=f"Status changed from {old_status.value} to {new_status.value}",
            performed_by=current_user.id,
        )


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Ticket:
    """Create a new ticket for the authenticated user."""

    now = datetime.now(timezone.utc)

    agent = db.scalar(
        select(User).where(
            User.role == Role.AGENT,
            User.department == ticket_in.department,
        )
    )

    ticket = Ticket(
        title=ticket_in.title,
        description=ticket_in.description,
        department=ticket_in.department,
        priority=ticket_in.priority,
        status=(
            TicketStatus.ASSIGNED
            if agent
            else TicketStatus.OPEN
        ),
        created_by=current_user.id,
        assigned_to=(
            agent.id
            if agent
            else None
        ),
        created_at=now,
        updated_at=now,
        sla_due=now + timedelta(hours=48),
    )

    db.add(ticket)
    db.flush()

    _create_activity_log(
        db=db,
        ticket_id=ticket.id,
        action="Ticket created",
        performed_by=current_user.id,
    )

    if agent:
        _create_activity_log(
            db=db,
            ticket_id=ticket.id,
            action=f"Auto assigned to {agent.name}",
            performed_by=current_user.id,
        )

    db.commit()
    db.refresh(ticket)

    return ticket


@router.get("", response_model=PaginatedTicketsResponse)
def list_tickets(
    status_filter: TicketStatus | None = Query(default=None, alias="status"),
    priority: Priority | None = None,
    department: Department | None = None,
    search: str | None = Query(default=None, min_length=1),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    sort_by: str = Query(default="created_at", pattern="^(created_at|updated_at|priority|status)$"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaginatedTicketsResponse:
    """List visible tickets with optional filters, search, sorting, and pagination."""
    base_statement = _ticket_list_statement(current_user)
    filtered_statement = _apply_ticket_filters(
        statement=base_statement,
        ticket_status=status_filter,
        priority=priority,
        department=department,
        search=search,
    )
    sorted_statement = _apply_ticket_sorting(
        statement=filtered_statement,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    total = int(
        db.scalar(
            select(func.count()).select_from(filtered_statement.subquery())
        )
        or 0
    )
    offset = (page - 1) * size
    tickets = db.scalars(sorted_statement.offset(offset).limit(size)).all()
    pages = (total + size - 1) // size if total else 0

    return PaginatedTicketsResponse(
        items=list(tickets),
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Ticket:
    """Return one ticket if the authenticated user has access to it."""
    ticket = _get_ticket_or_404(ticket_id, db)
    _ensure_ticket_access(ticket, current_user)
    return ticket


@router.put("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: uuid.UUID,
    ticket_in: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Ticket:
    """Update a ticket according to role-based permissions."""
    ticket = _get_ticket_or_404(ticket_id, db)

    if current_user.role == Role.ADMIN:
        _apply_ticket_updates(ticket, ticket_in, current_user, db)
    elif current_user.role == Role.AGENT:
        if ticket.assigned_to != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Agents can update only assigned tickets",
            )
        _apply_ticket_updates(ticket, ticket_in, current_user, db)
    else:
        if ticket.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employees can update only their own tickets",
            )
        if ticket.status != TicketStatus.OPEN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employees can update only open tickets",
            )
        if ticket_in.status is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employees cannot update ticket status",
            )
        _apply_ticket_updates(ticket, ticket_in, current_user, db)

    db.commit()
    db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/assign", response_model=TicketResponse)
def assign_ticket(
    ticket_id: uuid.UUID,
    assignment: TicketAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Ticket:
    """Assign a ticket to an agent. Administrator access is required."""
    ticket = _get_ticket_or_404(ticket_id, db)
    agent = db.get(User, assignment.agent_id)

    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    if agent.role != Role.AGENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must have AGENT role to be assigned a ticket",
        )

    previous_status = ticket.status
    ticket.assigned_to = agent.id
    ticket.status = TicketStatus.ASSIGNED
    ticket.updated_at = datetime.now(timezone.utc)

    _create_activity_log(
        db=db,
        ticket_id=ticket.id,
        action=f"Ticket assigned to agent {agent.id}",
        performed_by=current_user.id,
    )

    if previous_status != TicketStatus.ASSIGNED:
        _create_activity_log(
            db=db,
            ticket_id=ticket.id,
            action=f"Status changed from {previous_status.value} to {TicketStatus.ASSIGNED.value}",
            performed_by=current_user.id,
        )

    db.commit()
    db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    ticket_id: uuid.UUID,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Comment:
    """Add a comment to a ticket visible to the authenticated user."""
    ticket = _get_ticket_or_404(ticket_id, db)
    _ensure_ticket_access(ticket, current_user)

    comment = Comment(
        ticket_id=ticket.id,
        user_id=current_user.id,
        comment=comment_in.comment,
        created_at=datetime.now(timezone.utc),
    )
    db.add(comment)
    _create_activity_log(
        db=db,
        ticket_id=ticket.id,
        action="Comment added",
        performed_by=current_user.id,
    )

    db.commit()
    db.refresh(comment)
    return comment


@router.get("/{ticket_id}/comments", response_model=list[CommentResponse])
def list_comments(
    ticket_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Comment]:
    """List comments for a ticket visible to the authenticated user."""
    ticket = _get_ticket_or_404(ticket_id, db)
    _ensure_ticket_access(ticket, current_user)

    comments = db.scalars(
        select(Comment)
        .where(Comment.ticket_id == ticket.id)
        .order_by(Comment.created_at.asc())
    ).all()
    return list(comments)


@router.get("/{ticket_id}/activities", response_model=list[ActivityLogResponse])
def list_activities(
    ticket_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ActivityLog]:
    """List activity logs for a ticket visible to the authenticated user."""
    ticket = _get_ticket_or_404(ticket_id, db)
    _ensure_ticket_access(ticket, current_user)

    activities = db.scalars(
        select(ActivityLog)
        .where(ActivityLog.ticket_id == ticket.id)
        .order_by(ActivityLog.timestamp.asc())
    ).all()
    return list(activities)
@router.patch("/{ticket_id}/status", response_model=TicketResponse)
def update_ticket_status(
    ticket_id: uuid.UUID,
    payload: TicketStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Ticket:
    ticket = _get_ticket_or_404(ticket_id, db)

    if current_user.role not in {Role.ADMIN, Role.AGENT}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents and admins can update status",
        )

    if (
        current_user.role == Role.AGENT
        and ticket.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agents can update only assigned tickets",
        )

    old_status = ticket.status

    _validate_status_transition(
        old_status,
        payload.status,
        current_user,
    )

    ticket.status = payload.status
    ticket.updated_at = datetime.now(timezone.utc)

    _create_activity_log(
        db=db,
        ticket_id=ticket.id,
        action=f"Status changed from {old_status.value} to {payload.status.value}",
        performed_by=current_user.id,
    )

    db.commit()
    db.refresh(ticket)

    return ticket


@router.patch("/{ticket_id}/resolve", response_model=TicketResponse)
def resolve_ticket(
    ticket_id: uuid.UUID,
    payload: TicketResolveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Ticket:
    ticket = _get_ticket_or_404(ticket_id, db)

    if current_user.role not in {Role.ADMIN, Role.AGENT}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents and admins can resolve tickets",
        )

    if (
        current_user.role == Role.AGENT
        and ticket.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agents can resolve only assigned tickets",
        )

    ticket.resolution_notes = payload.resolution_notes
    ticket.status = TicketStatus.RESOLVED
    ticket.resolved_at = datetime.now(timezone.utc)
    ticket.updated_at = datetime.now(timezone.utc)

    _create_activity_log(
        db=db,
        ticket_id=ticket.id,
        action="Ticket resolved",
        performed_by=current_user.id,
    )

    db.commit()
    db.refresh(ticket)

    return ticket


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    ticket_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> None:
    """Delete a ticket. Administrator access is required."""

    ticket = _get_ticket_or_404(ticket_id, db)

    _create_activity_log(
        db=db,
        ticket_id=ticket.id,
        action="Ticket deleted",
        performed_by=current_user.id,
    )

    db.flush()
    db.delete(ticket)
    db.commit()

    return None