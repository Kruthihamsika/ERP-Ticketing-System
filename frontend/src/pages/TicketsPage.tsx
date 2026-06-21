import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  Ticket as TicketIcon,
} from "lucide-react";

import { PriorityBadge, StatusBadge } from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAuth } from "../hooks/useAuth";

import { getTickets } from "../services/tickets";

import type {
  Department,
  Priority,
  TicketFilters,
  TicketStatus,
} from "../types";

import {
  departments,
  priorities,
  statuses,
} from "../types";

import { formatDate } from "../utils/format";

export default function TicketsPage() {
  const { user } = useAuth();

  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    size: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const query = useQuery({
    queryKey: ["tickets", filters],
    queryFn: () => getTickets(filters),
  });

  const pageSummary = useMemo(() => {
    if (!query.data) return "No tickets";

    const start =
      query.data.total === 0
        ? 0
        : (query.data.page - 1) * query.data.size + 1;

    const end = Math.min(
      query.data.page * query.data.size,
      query.data.total
    );

    return `${start}-${end} of ${query.data.total}`;
  }, [query.data]);

  function updateFilter(next: Partial<TicketFilters>) {
    setFilters((current) => ({
      ...current,
      ...next,
      page: next.page ?? 1,
    }));
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-slate-50 to-cyan-50 p-8 shadow-sm">
        <SectionHeader
          eyebrow="Ticket Management"
          title={
            user?.role === "ADMIN"
              ? "Enterprise Ticket Queue"
              : user?.role === "AGENT"
              ? "Assigned Tickets"
              : "My Tickets"
          }
          description={
            user?.role === "ADMIN"
              ? "Manage all tickets across the organization."
              : user?.role === "AGENT"
              ? "View and work on tickets assigned to you."
              : "Track tickets you have created."
          }
          action={
            user?.role !== "AGENT" ? (
              <Link
                to="/tickets/new"
                className="btn-primary shadow-lg"
              >
                <PlusCircle className="h-4 w-4" />
                Create Ticket
              </Link>
            ) : undefined
          }
        />
      </div>

      <div className="card p-6">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_repeat(4,0.8fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              className="input pl-11"
              placeholder="Search title or description..."
              value={filters.search ?? ""}
              onChange={(event) =>
                updateFilter({
                  search: event.target.value,
                })
              }
            />
          </div>

          <select
            className="input"
            value={filters.status ?? ""}
            onChange={(event) =>
              updateFilter({
                status:
                  event.target.value as
                    | TicketStatus
                    | "",
              })
            }
          >
            <option value="">All Statuses</option>

            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={filters.priority ?? ""}
            onChange={(event) =>
              updateFilter({
                priority:
                  event.target.value as
                    | Priority
                    | "",
              })
            }
          >
            <option value="">All Priorities</option>

            {priorities.map((priority) => (
              <option
                key={priority}
                value={priority}
              >
                {priority}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={filters.department ?? ""}
            onChange={(event) =>
              updateFilter({
                department:
                  event.target.value as
                    | Department
                    | "",
              })
            }
          >
            <option value="">All Departments</option>

            {departments.map((department) => (
              <option
                key={department}
                value={department}
              >
                {department}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={`${filters.sort_by}:${filters.sort_order}`}
            onChange={(event) => {
              const [sort_by, sort_order] =
                event.target.value.split(
                  ":"
                ) as [
                  TicketFilters["sort_by"],
                  TicketFilters["sort_order"]
                ];

              updateFilter({
                sort_by,
                sort_order,
              });
            }}
          >
            <option value="created_at:desc">
              Newest First
            </option>

            <option value="created_at:asc">
              Oldest First
            </option>

            <option value="updated_at:desc">
              Recently Updated
            </option>

            <option value="priority:desc">
              Priority High → Low
            </option>

            <option value="status:asc">
              Status A → Z
            </option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold">
              Tickets
            </h2>

            <p className="text-sm text-slate-500">
              {pageSummary}
            </p>
          </div>

          <ArrowDownUp className="h-5 w-5 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ticket
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Department
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Priority
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  SLA Due
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Updated
                </th>
              </tr>
            </thead>

            <tbody>
              {(query.data?.items ?? []).map(
                (ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-5">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="font-semibold text-slate-900 hover:text-brand-600"
                      >
                        {ticket.title}
                      </Link>

                      <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                        {ticket.description}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm">
                      {ticket.department}
                    </td>

                    <td className="px-6 py-5">
                      <PriorityBadge
                        priority={ticket.priority}
                      />
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge
                        status={ticket.status}
                      />
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-500">
                      {formatDate(ticket.sla_due)}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-500">
                      {formatDate(ticket.updated_at)}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {(query.data?.items ?? []).length === 0 && (
          <div className="p-10">
            <EmptyState
              icon={TicketIcon}
              title="No tickets found"
              message="Create a ticket or change filters."
            />
          </div>
        )}

        <div className="flex items-center justify-between border-t px-6 py-5">
          <p className="text-sm text-slate-500">
            Page {query.data?.page ?? 1} of{" "}
            {query.data?.pages ?? 0}
          </p>

          <div className="flex gap-2">
            <button
              className="btn-secondary"
              disabled={
                (query.data?.page ?? 1) <= 1
              }
              onClick={() =>
                updateFilter({
                  page:
                    (query.data?.page ?? 1) - 1,
                })
              }
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              className="btn-secondary"
              disabled={
                (query.data?.page ?? 1) >=
                (query.data?.pages ?? 0)
              }
              onClick={() =>
                updateFilter({
                  page:
                    (query.data?.page ?? 1) + 1,
                })
              }
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}