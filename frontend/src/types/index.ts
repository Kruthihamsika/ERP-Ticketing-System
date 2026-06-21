export type Role = "ADMIN" | "AGENT" | "EMPLOYEE";

export type Department =
  | "IT"
  | "HR"
  | "FINANCE"
  | "ADMINISTRATION";

export type Priority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type TicketStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;

  department: Department;
  priority: Priority;
  status: TicketStatus;

  created_by: string;
assigned_to: string | null;

created_by_name: string | null;
assigned_to_name: string | null;

  created_at: string;
  updated_at: string;
  sla_due: string;

  // NEW FIELDS
  resolution_notes: string | null;
  resolved_at: string | null;
}

export interface TicketCreatePayload {
  title: string;
  description: string;
  department: Department;
  priority: Priority;
}

export interface TicketUpdatePayload {
  title?: string;
  description?: string;
  department?: Department;
  priority?: Priority;
  status?: TicketStatus;
}

export interface TicketFilters {
  status?: TicketStatus | "";
  priority?: Priority | "";
  department?: Department | "";
  search?: string;

  page?: number;
  size?: number;

  sort_by?:
    | "created_at"
    | "updated_at"
    | "priority"
    | "status";

  sort_order?: "asc" | "desc";
}

export interface PaginatedTicketsResponse {
  items: Ticket[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface Comment {
  id: string;
  ticket_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  ticket_id: string;
  action: string;
  performed_by: string;
  timestamp: string;
}

export interface Attachment {
  id: string;
  ticket_id: string;
  filename: string;
  file_path: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface DashboardSummary {
  total_tickets: number;
  open_tickets: number;
  assigned_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
}

export interface StatusDistribution {
  status_distribution: Record<
    TicketStatus,
    number
  >;
}

export interface PriorityDistribution {
  priority_distribution: Record<
    Priority,
    number
  >;
}

export interface SlaMetrics {
  tickets_with_sla: number;
  breached_sla_count: number;
  upcoming_sla_count: number;
}

export const departments: Department[] = [
  "IT",
  "HR",
  "FINANCE",
  "ADMINISTRATION",
];

export const priorities: Priority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

export const statuses: TicketStatus[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
];