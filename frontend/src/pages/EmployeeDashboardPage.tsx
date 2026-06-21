import { Link } from "react-router-dom";
import {
  Ticket,
  PlusCircle,
  CheckCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../components/ui/SectionHeader";
import { getTickets } from "../services/tickets";

export default function EmployeeDashboardPage() {
  const { data } = useQuery({
    queryKey: ["employee-dashboard"],
    queryFn: () => getTickets(),
  });

  const tickets = data?.items ?? [];

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) =>
      ticket.status === "OPEN" ||
      ticket.status === "ASSIGNED" ||
      ticket.status === "IN_PROGRESS"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) =>
      ticket.status === "RESOLVED" ||
      ticket.status === "CLOSED"
  ).length;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Employee Portal"
        title="My Support Requests"
        description="Create and track your support tickets."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card p-6">
          <Ticket className="mb-3 h-8 w-8 text-blue-500" />

          <h3 className="font-bold text-lg">
            My Tickets
          </h3>

          <p className="mt-2 text-3xl font-bold">
            {totalTickets}
          </p>
        </div>

        <div className="card p-6">
          <CheckCircle className="mb-3 h-8 w-8 text-green-500" />

          <h3 className="font-bold text-lg">
            Resolved Tickets
          </h3>

          <p className="mt-2 text-3xl font-bold">
            {resolvedTickets}
          </p>
        </div>

        <div className="card p-6">
          <PlusCircle className="mb-3 h-8 w-8 text-indigo-500" />

          <h3 className="font-bold text-lg">
            Open Tickets
          </h3>

          <p className="mt-2 text-3xl font-bold">
            {openTickets}
          </p>

          <Link
            to="/tickets/new"
            className="btn-primary mt-4 inline-flex"
          >
            New Ticket
          </Link>
        </div>
      </div>
    </div>
  );
}