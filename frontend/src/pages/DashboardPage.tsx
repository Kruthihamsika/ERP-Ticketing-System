import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  PlusCircle,
  Ticket,
} from "lucide-react";

import { MetricCard } from "../components/ui/MetricCard";
import { PriorityBadge, StatusBadge } from "../components/ui/Badge";
import { SectionHeader } from "../components/ui/SectionHeader";
import EmptyState from "../components/ui/EmptyState";

import {
  getDashboardSummary,
  getPriorityDistribution,
  getSlaMetrics,
  getStatusDistribution,
} from "../services/dashboard";

import { getActivities, getTickets } from "../services/tickets";

import { formatDate, prettifyEnum } from "../utils/format";

const chartColors = [
  "#2563eb",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#64748b",
];

export default function DashboardPage() {
  const summaryQuery = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: getDashboardSummary,
  });

  const statusQuery = useQuery({
    queryKey: ["dashboard", "status"],
    queryFn: getStatusDistribution,
  });

  const priorityQuery = useQuery({
    queryKey: ["dashboard", "priority"],
    queryFn: getPriorityDistribution,
  });

  const slaQuery = useQuery({
    queryKey: ["dashboard", "sla"],
    queryFn: getSlaMetrics,
  });

  const ticketsQuery = useQuery({
    queryKey: ["tickets", "recent"],
    queryFn: () => getTickets({ size: 5 }),
  });

  const activityQueries = useQueries({
    queries: (ticketsQuery.data?.items ?? [])
      .slice(0, 3)
      .map((ticket) => ({
        queryKey: ["activities", ticket.id],
        queryFn: () => getActivities(ticket.id),
        enabled: Boolean(ticket.id),
      })),
  });

  const summary = summaryQuery.data;
  const sla = slaQuery.data;

  const statusData = Object.entries(
    statusQuery.data?.status_distribution ?? {}
  ).map(([name, value]) => ({
    name: prettifyEnum(name),
    value,
  }));

  const priorityData = Object.entries(
    priorityQuery.data?.priority_distribution ?? {}
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const recentActivities = activityQueries
    .flatMap((query) => query.data ?? [])
    .slice(0, 6);

  return (
    <div className="space-y-10">
      <div className="rounded-3xl bg-gradient-to-r from-slate-50 to-cyan-50 p-8 shadow-sm">
        <SectionHeader
          eyebrow="Operations Overview"
          title="Ticket Command Dashboard"
          description="Live visibility into queue pressure, SLA compliance, ticket health, and operational activity."
          action={
            <Link
              to="/tickets/new"
              className="btn-primary shadow-lg"
            >
              <PlusCircle className="h-4 w-4" />
              New Ticket
            </Link>
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Tickets"
          value={summary?.total_tickets ?? 0}
          detail="All service requests"
          icon={Ticket}
        />

        <MetricCard
          title="Open Queue"
          value={summary?.open_tickets ?? 0}
          detail="Awaiting triage"
          icon={Clock3}
          accent="bg-sky-50 text-sky-700"
        />

        <MetricCard
          title="In Progress"
          value={summary?.in_progress_tickets ?? 0}
          detail="Being handled"
          icon={Activity}
          accent="bg-amber-50 text-amber-700"
        />

        <MetricCard
          title="SLA Breached"
          value={sla?.breached_sla_count ?? 0}
          detail="Needs attention"
          icon={AlertTriangle}
          accent="bg-red-50 text-red-700"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="card p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold">
              Ticket Status Distribution
            </h2>

            <p className="text-sm text-slate-500">
              Workflow state overview
            </p>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statusData}>
                <defs>
                  <linearGradient
                    id="statusFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#2563eb"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="#2563eb"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="4 4" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={4}
                  fill="url(#statusFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold">
            Priority Mix
          </h2>

          <p className="text-sm text-slate-500">
            Severity breakdown
          </p>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {priorityData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        chartColors[
                          index % chartColors.length
                        ]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {priorityData.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl bg-slate-50 p-4"
              >
                <p className="text-xs uppercase text-slate-500">
                  {item.name}
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card overflow-hidden">
          <div className="border-b p-6">
            <h2 className="text-xl font-bold">
              Recent Tickets
            </h2>

            <p className="text-sm text-slate-500">
              Latest requests
            </p>
          </div>

          <div>
            {(ticketsQuery.data?.items ?? []).map(
              (ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between border-b p-5 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-semibold">
                      {ticket.title}
                    </p>

                    <p className="text-sm text-slate-500">
                      {ticket.department} •{" "}
                      {formatDate(ticket.created_at)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <PriorityBadge
                      priority={ticket.priority}
                    />
                    <StatusBadge
                      status={ticket.status}
                    />
                  </div>
                </Link>
              )
            )}

            {ticketsQuery.data?.items.length === 0 ? (
              <EmptyState
                icon={Ticket}
                title="No tickets yet"
                message="Create your first ticket."
              />
            ) : null}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold">
            Recent Activity
          </h2>

          <p className="text-sm text-slate-500">
            Latest events
          </p>

          <div className="mt-6 space-y-5">
            {recentActivities.length ? (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold">
                      {activity.action}
                    </p>

                    <p className="text-sm text-slate-500">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Activity}
                title="No activity"
                message="Events will appear here."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}