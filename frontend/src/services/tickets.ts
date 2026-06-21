import { apiClient } from "../api/client";
import type {
  ActivityLog,
  Attachment,
  Comment,
  PaginatedTicketsResponse,
  Ticket,
  TicketCreatePayload,
  TicketFilters,
  TicketUpdatePayload,
} from "../types";

export async function getTickets(
  filters: TicketFilters = {}
): Promise<PaginatedTicketsResponse> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) =>
        value !== undefined &&
        value !== ""
    )
  );

  const { data } =
    await apiClient.get<PaginatedTicketsResponse>(
      "/tickets",
      { params }
    );

  return data;
}

export async function getTicket(
  ticketId: string
): Promise<Ticket> {
  const { data } =
    await apiClient.get<Ticket>(
      `/tickets/${ticketId}`
    );

  return data;
}

export async function createTicket(
  payload: TicketCreatePayload
): Promise<Ticket> {
  const { data } =
    await apiClient.post<Ticket>(
      "/tickets",
      payload
    );

  return data;
}

export async function updateTicket(
  ticketId: string,
  payload: TicketUpdatePayload
): Promise<Ticket> {
  const { data } =
    await apiClient.put<Ticket>(
      `/tickets/${ticketId}`,
      payload
    );

  return data;
}

export async function deleteTicket(
  ticketId: string
): Promise<void> {
  await apiClient.delete(
    `/tickets/${ticketId}`
  );
}

export async function getComments(
  ticketId: string
): Promise<Comment[]> {
  const { data } =
    await apiClient.get<Comment[]>(
      `/tickets/${ticketId}/comments`
    );

  return data;
}

export async function addComment(
  ticketId: string,
  comment: string
): Promise<Comment> {
  const { data } =
    await apiClient.post<Comment>(
      `/tickets/${ticketId}/comments`,
      {
        comment,
      }
    );

  return data;
}

export async function getActivities(
  ticketId: string
): Promise<ActivityLog[]> {
  const { data } =
    await apiClient.get<ActivityLog[]>(
      `/tickets/${ticketId}/activities`
    );

  return data;
}

export async function getAttachments(
  ticketId: string
): Promise<Attachment[]> {
  const { data } =
    await apiClient.get<Attachment[]>(
      `/tickets/${ticketId}/attachments`
    );

  return data;
}

export async function uploadAttachment(
  ticketId: string,
  file: File
): Promise<Attachment> {
  const formData = new FormData();

  formData.append("file", file);

  const { data } =
    await apiClient.post<Attachment>(
      `/tickets/${ticketId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return data;
}

export async function deleteAttachment(
  attachmentId: string
): Promise<void> {
  await apiClient.delete(
    `/attachments/${attachmentId}`
  );
}

export async function updateTicketStatus(
  ticketId: string,
  status: string
): Promise<Ticket> {
  const { data } =
    await apiClient.patch<Ticket>(
      `/tickets/${ticketId}/status`,
      {
        status,
      }
    );

  return data;
}

export async function resolveTicket(
  ticketId: string,
  resolution_notes: string
): Promise<Ticket> {
  const { data } =
    await apiClient.patch<Ticket>(
      `/tickets/${ticketId}/resolve`,
      {
        resolution_notes,
      }
    );

  return data;
}

export async function assignTicket(
  ticketId: string,
  agent_id: string
): Promise<Ticket> {
  const { data } =
    await apiClient.post<Ticket>(
      `/tickets/${ticketId}/assign`,
      {
        agent_id,
      }
    );

  return data;
}