from pydantic import BaseModel, Field

from app.models.enums import Priority, TicketStatus


class DashboardSummaryResponse(BaseModel):
    total_tickets: int = Field(ge=0)
    open_tickets: int = Field(ge=0)
    assigned_tickets: int = Field(ge=0)
    in_progress_tickets: int = Field(ge=0)
    resolved_tickets: int = Field(ge=0)
    closed_tickets: int = Field(ge=0)


class StatusDistributionResponse(BaseModel):
    status_distribution: dict[TicketStatus, int]


class PriorityDistributionResponse(BaseModel):
    priority_distribution: dict[Priority, int]


class SlaResponse(BaseModel):
    tickets_with_sla: int = Field(ge=0)
    breached_sla_count: int = Field(ge=0)
    upcoming_sla_count: int = Field(ge=0)
