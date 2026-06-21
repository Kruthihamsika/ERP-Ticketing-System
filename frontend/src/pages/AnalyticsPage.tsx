import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
  AlertTriangle,
  BarChart3,
  Clock,
  Layers3,
  ShieldAlert,
} from "lucide-react";

import { MetricCard } from "../components/ui/MetricCard";
import { SectionHeader } from "../components/ui/SectionHeader";

import {
  getDashboardSummary,
  getPriorityDistribution,
  getSlaMetrics,
  getStatusDistribution,
} from "../services/dashboard";

import { prettifyEnum } from "../utils/format";

const colors = [
  "#2563eb",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#64748b",
];

export default function AnalyticsPage() {
  const summaryQuery = useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: getDashboardSummary,
  });

  const statusQuery = useQuery({
    queryKey: ["analytics", "status"],
    queryFn: getStatusDistribution,
  });

  const priorityQuery = useQuery({
    queryKey: ["analytics", "priority"],
    queryFn: getPriorityDistribution,
  });

  const slaQuery = useQuery({
    queryKey: ["analytics", "sla"],
    queryFn: getSlaMetrics,
  });

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

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 p-8 shadow-sm">
        <SectionHeader
          eyebrow="Executive Reporting"
          title="Analytics & Insights"
          description="Monitor ticket workload, SLA health, service efficiency, and operational risk from a single view."
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Tickets"
          value={summaryQuery.data?.total_tickets ?? 0}
          detail="Overall service volume"
          icon={Layers3}
        />

        <MetricCard
          title="Resolved"
          value={summaryQuery.data?.resolved_tickets ?? 0}
          detail="Successfully completed"
          icon={BarChart3}
          accent="bg-emerald-50 text-emerald-700"
        />

        <MetricCard
          title="Upcoming SLA"
          value={slaQuery.data?.upcoming_sla_count ?? 0}
          detail="Due within 24 hours"
          icon={Clock}
          accent="bg-amber-50 text-amber-700"
        />

        <MetricCard
          title="Breached SLA"
          value={slaQuery.data?.breached_sla_count ?? 0}
          detail="Requires escalation"
          icon={ShieldAlert}
          accent="bg-red-50 text-red-700"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold">
              Workflow Performance
            </h2>

            <p className="text-sm text-slate-500">
              Ticket distribution by status
            </p>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={statusData}>
                <defs>
                  <linearGradient
                    id="statusGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#2563eb"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="#2563eb"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={4}
                  fill="url(#statusGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold">
              Priority Breakdown
            </h2>

            <p className="text-sm text-slate-500">
              Business urgency distribution
            </p>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}
                  outerRadius={130}
                  paddingAngle={4}
                >
                  {priorityData.map(
                    (entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          colors[
                            index %
                              colors.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold">
            Priority Exposure Analysis
          </h2>

          <p className="text-sm text-slate-500">
            Ticket count by priority level
          </p>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart data={priorityData}>
              <CartesianGrid
                strokeDasharray="4 4"
              />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="value"
                radius={[10, 10, 0, 0]}
              >
                {priorityData.map(
                  (entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        colors[
                          index %
                            colors.length
                        ]
                      }
                    />
                  )
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card p-6">
          <AlertTriangle className="h-8 w-8 text-red-500" />

          <h3 className="mt-4 text-lg font-bold">
            SLA Risk
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Monitor overdue tickets and
            prioritize escalation before
            business impact increases.
          </p>
        </div>

        <div className="card p-6">
          <Clock className="h-8 w-8 text-amber-500" />

          <h3 className="mt-4 text-lg font-bold">
            Response Health
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Track upcoming SLA deadlines
            and ensure teams remain ahead
            of service commitments.
          </p>
        </div>

        <div className="card p-6">
          <BarChart3 className="h-8 w-8 text-blue-500" />

          <h3 className="mt-4 text-lg font-bold">
            Operational Insight
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Use analytics to understand
            ticket trends and optimize
            workload distribution.
          </p>
        </div>
      </div>
    </div>
  );
}