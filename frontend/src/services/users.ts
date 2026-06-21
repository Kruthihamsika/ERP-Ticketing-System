import { apiClient } from "../api/client";

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function getAgents(): Promise<Agent[]> {
  const { data } = await apiClient.get<Agent[]>(
    "/users/agents"
  );

  return data;
}