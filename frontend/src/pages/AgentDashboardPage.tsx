import { ClipboardCheck, Clock, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../components/ui/SectionHeader";
import { getTickets } from "../services/tickets";

export default function AgentDashboardPage() {
  const { data } = useQuery({
    queryKey: ["agent-dashboard"],
    queryFn: () => getTickets(),
  });

  const tickets = data?.items ?? [];

  const assignedCount = tickets.filter(
    (ticket) => ticket.status === "ASSIGNED"
  ).length;

  const inProgressCount = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) =>
      ticket.status === "RESOLVED" ||
      ticket.status === "CLOSED"
  ).length;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Agent Portal"
        title="Assigned Work Queue"
        description="Manage assigned tickets and resolutions."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card p-6">
          <ClipboardCheck className="mb-3 h-8 w-8 text-blue-500" />

          <h3 className="font-bold text-lg">
            My Assigned Tickets
          </h3>

          <p className="mt-2 text-3xl font-bold">
            {assignedCount}
          </p>
        </div>

        <div className="card p-6">
          <Clock className="mb-3 h-8 w-8 text-orange-500" />

          <h3 className="font-bold text-lg">
            My In Progress
          </h3>

          <p className="mt-2 text-3xl font-bold">
            {inProgressCount}
          </p>
        </div>

        <div className="card p-6">
          <CheckCircle className="mb-3 h-8 w-8 text-green-500" />

          <h3 className="font-bold text-lg">
            My Resolved
          </h3>

          <p className="mt-2 text-3xl font-bold">
            {resolvedCount}
          </p>
        </div>
      </div>
    </div>
  );
}