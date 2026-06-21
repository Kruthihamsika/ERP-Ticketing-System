import { apiClient } from "../api/client";
import type { DashboardSummary, PriorityDistribution, SlaMetrics, StatusDistribution } from "../types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>("/dashboard/summary");
  return data;
}

export async function getStatusDistribution(): Promise<StatusDistribution> {
  const { data } = await apiClient.get<StatusDistribution>("/dashboard/status-distribution");
  return data;
}

export async function getPriorityDistribution(): Promise<PriorityDistribution> {
  const { data } = await apiClient.get<PriorityDistribution>("/dashboard/priority-distribution");
  return data;
}

export async function getSlaMetrics(): Promise<SlaMetrics> {
  const { data } = await apiClient.get<SlaMetrics>("/dashboard/sla");
  return data;
}
