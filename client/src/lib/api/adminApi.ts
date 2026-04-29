import { api } from './axios';

export interface AgentWorkload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  activeWorkload: number;
}

export const adminApi = {
  /**
   * listAgents — Fetches all agents and their current workload.
   */
  listAgents: async () => {
    const response = await api.get<{ success: boolean; agents: AgentWorkload[] }>(
      '/admin/agents'
    );
    return response.data;
  },
};
