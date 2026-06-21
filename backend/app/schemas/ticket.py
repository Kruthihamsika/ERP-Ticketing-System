import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import Department, Priority, TicketStatus


class TicketCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    department: Department
    priority: Priority


class TicketUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    department: Department | None = None
    priority: Priority | None = None
    status: TicketStatus | None = None


class TicketAssignRequest(BaseModel):
    agent_id: uuid.UUID


class TicketStatusUpdateRequest(BaseModel):
    status: TicketStatus


class TicketResolveRequest(BaseModel):
    resolution_notes: str = Field(min_length=1)


class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str

    department: Department
    priority: Priority
    status: TicketStatus

    created_by: uuid.UUID
    assigned_to: uuid.UUID | None

    # Display names
    created_by_name: str | None = None
    assigned_to_name: str | None = None

    created_at: datetime
    updated_at: datetime
    sla_due: datetime

    resolution_notes: str | None = None
    resolved_at: datetime | None = None


class PaginatedTicketsResponse(BaseModel):
    items: list[TicketResponse]
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    size: int = Field(ge=1, le=100)
    pages: int = Field(ge=0)