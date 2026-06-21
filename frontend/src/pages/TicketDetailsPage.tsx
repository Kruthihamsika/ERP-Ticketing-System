import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AlertTriangle,
  Clock,
  User,
} from "lucide-react";

import { SectionHeader } from "../components/ui/SectionHeader";
import {
  PriorityBadge,
  StatusBadge,
} from "../components/ui/Badge";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../hooks/useAuth";

import {
  getTicket,
  resolveTicket,
  updateTicketStatus,
  assignTicket,
  getComments,
  addComment,
} from "../services/tickets";

import { getAgents } from "../services/users";

import {
  formatDate,
  prettifyEnum,
} from "../utils/format";

import type { TicketStatus } from "../types";

const statuses: TicketStatus[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
];

export default function TicketDetailsPage() {
  const { ticketId } = useParams();

  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [selectedStatus, setSelectedStatus] =
    useState<TicketStatus>("OPEN");

  const [resolutionNotes, setResolutionNotes] =
    useState("");

  const [newComment, setNewComment] =
    useState("");

  const [selectedAgent, setSelectedAgent] =
    useState("");

  const ticketQuery = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicket(ticketId!),
    enabled: Boolean(ticketId),
  });

  const agentsQuery = useQuery({
    queryKey: ["agents"],
    queryFn: getAgents,
    enabled: user?.role === "ADMIN",
  });

  const commentsQuery = useQuery({
    queryKey: ["comments", ticketId],
    queryFn: () => getComments(ticketId!),
    enabled: Boolean(ticketId),
  });

  const ticket = ticketQuery.data;

  const statusMutation = useMutation({
    mutationFn: (status: TicketStatus) =>
      updateTicketStatus(ticketId!, status),

    onSuccess: () => {
      showToast("Ticket status updated");

      queryClient.invalidateQueries({
        queryKey: ["ticket", ticketId],
      });

      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
    },

    onError: () => {
      showToast(
        "Failed to update ticket status",
        "error"
      );
    },
  });

  const resolveMutation = useMutation({
    mutationFn: () =>
      resolveTicket(ticketId!, resolutionNotes),

    onSuccess: () => {
      showToast("Ticket resolved successfully");

      setResolutionNotes("");

      queryClient.invalidateQueries({
        queryKey: ["ticket", ticketId],
      });

      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
    },

    onError: () => {
      showToast(
        "Failed to resolve ticket",
        "error"
      );
    },
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      assignTicket(
        ticketId!,
        selectedAgent
      ),

    onSuccess: () => {
      showToast("Agent assigned");

      queryClient.invalidateQueries({
        queryKey: ["ticket", ticketId],
      });

      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
    },

    onError: () => {
      showToast(
        "Failed to assign agent",
        "error"
      );
    },
  });

  const commentMutation = useMutation({
    mutationFn: () =>
      addComment(ticketId!, newComment),

    onSuccess: () => {
      showToast("Comment added");

      setNewComment("");

      queryClient.invalidateQueries({
        queryKey: ["comments", ticketId],
      });
    },

    onError: () => {
      showToast(
        "Failed to add comment",
        "error"
      );
    },
  });

  if (ticketQuery.isLoading) {
    return (
      <div className="card p-8">
        Loading ticket...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="card p-8">
        Ticket not found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Ticket Details"
        title={ticket.title}
        description={ticket.description}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-bold">
            Status
          </h3>
          <StatusBadge status={ticket.status} />
        </div>

        <div className="card p-6">
          <h3 className="mb-4 text-lg font-bold">
            Priority
          </h3>
          <PriorityBadge priority={ticket.priority} />
        </div>

        <div className="card p-6">
          <h3 className="mb-4 text-lg font-bold">
            Department
          </h3>
          <p>{ticket.department}</p>
        </div>
      </div>

      {user?.role === "ADMIN" && (
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-bold">
            Assign Agent
          </h3>

          <div className="flex flex-col gap-4 md:flex-row">
            <select
              className="input"
              value={selectedAgent}
              onChange={(e) =>
                setSelectedAgent(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Agent
              </option>

              {agentsQuery.data?.map(
                (agent) => (
                  <option
                    key={agent.id}
                    value={agent.id}
                  >
                    {agent.name}
                  </option>
                )
              )}
            </select>

            <button
              className="btn-primary"
              disabled={
                !selectedAgent ||
                assignMutation.isPending
              }
              onClick={() =>
                assignMutation.mutate()
              }
            >
              {assignMutation.isPending
                ? "Assigning..."
                : "Assign Ticket"}
            </button>
          </div>
        </div>
      )}

      {user?.role !== "EMPLOYEE" && (
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-bold">
            Update Status
          </h3>

          <div className="flex flex-col gap-4 md:flex-row">
            <select
              className="input"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value as TicketStatus
                )
              }
            >
              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {prettifyEnum(status)}
                </option>
              ))}
            </select>

            <button
              className="btn-primary"
              disabled={statusMutation.isPending}
              onClick={() =>
                statusMutation.mutate(
                  selectedStatus
                )
              }
            >
              {statusMutation.isPending
                ? "Updating..."
                : "Update Status"}
            </button>
          </div>
        </div>
      )}

      {user?.role !== "EMPLOYEE" && (
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-bold">
            Resolve Ticket
          </h3>

          <textarea
            className="input min-h-32"
            placeholder="Enter resolution details..."
            value={resolutionNotes}
            onChange={(event) =>
              setResolutionNotes(
                event.target.value
              )
            }
          />

          <button
            className="btn-primary mt-4"
            disabled={
              !resolutionNotes.trim() ||
              resolveMutation.isPending
            }
            onClick={() =>
              resolveMutation.mutate()
            }
          >
            {resolveMutation.isPending
              ? "Resolving..."
              : "Resolve Ticket"}
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 font-bold">
            Ticket Information
          </h3>

          <div className="space-y-4">
            <div className="flex gap-3">
              <Clock className="mt-1 h-4 w-4" />
              <div>
                <p className="text-sm text-slate-500">
                  Created
                </p>
                <p>
                  {formatDate(ticket.created_at)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Clock className="mt-1 h-4 w-4" />
              <div>
                <p className="text-sm text-slate-500">
                  SLA Due
                </p>
                <p>
                  {formatDate(ticket.sla_due)}
                </p>
              </div>
            </div>

           <div className="flex gap-3">
  <User className="mt-1 h-4 w-4" />
  <div>
    <p className="text-sm text-slate-500">
      Raised By
    </p>

    <p>
      {ticket.created_by_name ?? "Unknown"}
    </p>
  </div>
</div>

<div className="flex gap-3">
  <User className="mt-1 h-4 w-4" />
  <div>
    <p className="text-sm text-slate-500">
      Assigned Agent
    </p>

    <p>
      {ticket.assigned_to_name ??
        "Not assigned"}
    </p>
  </div>
</div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 font-bold">
            Resolution
          </h3>

          {ticket.resolution_notes ? (
            <div>
              <p className="whitespace-pre-wrap">
                {ticket.resolution_notes}
              </p>

              <p className="mt-4 text-sm text-slate-500">
                Resolved at{" "}
                {ticket.resolved_at
                  ? formatDate(
                      ticket.resolved_at
                    )
                  : "-"}
              </p>
            </div>
          ) : (
            <div className="flex gap-3 text-slate-500">
              <AlertTriangle className="h-5 w-5" />
              No resolution yet.
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="mb-6 text-lg font-bold">
          Comments
        </h3>

        <div className="space-y-4">
          {commentsQuery.data?.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <p className="text-sm text-slate-500">
                {formatDate(comment.created_at)}
              </p>

              <p className="mt-2">
                {comment.comment}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <textarea
            className="input min-h-24"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(event) =>
              setNewComment(
                event.target.value
              )
            }
          />

          <button
            className="btn-primary mt-4"
            disabled={
              !newComment.trim() ||
              commentMutation.isPending
            }
            onClick={() =>
              commentMutation.mutate()
            }
          >
            {commentMutation.isPending
              ? "Posting..."
              : "Add Comment"}
          </button>
        </div>
      </div>
    </div>
  );
}