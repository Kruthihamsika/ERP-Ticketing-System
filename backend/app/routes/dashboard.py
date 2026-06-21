from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.database.connection import get_db
from app.models.enums import Priority, TicketStatus
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    PriorityDistributionResponse,
    SlaResponse,
    StatusDistributionResponse,
)


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _count_tickets(db: Session, *where_clauses: object) -> int:
    statement = select(func.count()).select_from(Ticket)
    if where_clauses:
        statement = statement.where(*where_clauses)
    return int(db.scalar(statement) or 0)


def _status_counts(db: Session) -> dict[TicketStatus, int]:
    counts = {ticket_status: 0 for ticket_status in TicketStatus}
    rows = db.execute(
        select(Ticket.status, func.count(Ticket.id))
        .group_by(Ticket.status)
    ).all()

    for ticket_status, count in rows:
        counts[ticket_status] = int(count)

    return counts


def _priority_counts(db: Session) -> dict[Priority, int]:
    counts = {priority: 0 for priority in Priority}
    rows = db.execute(
        select(Ticket.priority, func.count(Ticket.id))
        .group_by(Ticket.priority)
    ).all()

    for priority, count in rows:
        counts[priority] = int(count)

    return counts


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> DashboardSummaryResponse:
    """Return high-level ticket counts for administrators."""
    status_counts = _status_counts(db)
    return DashboardSummaryResponse(
        total_tickets=sum(status_counts.values()),
        open_tickets=status_counts[TicketStatus.OPEN],
        assigned_tickets=status_counts[TicketStatus.ASSIGNED],
        in_progress_tickets=status_counts[TicketStatus.IN_PROGRESS],
        resolved_tickets=status_counts[TicketStatus.RESOLVED],
        closed_tickets=status_counts[TicketStatus.CLOSED],
    )


@router.get("/status-distribution", response_model=StatusDistributionResponse)
def get_status_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> StatusDistributionResponse:
    """Return ticket counts grouped by status for administrators."""
    return StatusDistributionResponse(status_distribution=_status_counts(db))


@router.get("/priority-distribution", response_model=PriorityDistributionResponse)
def get_priority_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> PriorityDistributionResponse:
    """Return ticket counts grouped by priority for administrators."""
    return PriorityDistributionResponse(priority_distribution=_priority_counts(db))


@router.get("/sla", response_model=SlaResponse)
def get_sla_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> SlaResponse:
    """Return SLA health metrics for administrators."""
    now = datetime.now(timezone.utc)
    upcoming_cutoff = now + timedelta(hours=24)

    tickets_with_sla = _count_tickets(db, Ticket.sla_due.is_not(None))
    breached_sla_count = _count_tickets(
        db,
        Ticket.sla_due.is_not(None),
        Ticket.sla_due < now,
        Ticket.status.not_in([TicketStatus.RESOLVED, TicketStatus.CLOSED]),
    )
    upcoming_sla_count = _count_tickets(
        db,
        Ticket.sla_due.is_not(None),
        Ticket.sla_due >= now,
        Ticket.sla_due <= upcoming_cutoff,
        Ticket.status.not_in([TicketStatus.RESOLVED, TicketStatus.CLOSED]),
    )

    return SlaResponse(
        tickets_with_sla=tickets_with_sla,
        breached_sla_count=breached_sla_count,
        upcoming_sla_count=upcoming_sla_count,
    )
