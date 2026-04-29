import { api } from './axios';

import { User } from './mockApi';

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

  /**
   * listUsers — Fetches all registered users.
   */
  listUsers: async () => {
    const response = await api.get<{ success: boolean; users: User[] }>(
      '/admin/users'
    );
    return response.data;
  },

  /**
   * updateUserRole — Promotes or changes a user's role.
   */
  updateUserRole: async (userId: string, role: string) => {
    const response = await api.patch<{ success: boolean; user: User }>(
      `/admin/users/${userId}/role`,
      { role }
    );
    return response.data;
  },

  /**
   * addCredits — Issues financial credits to a user.
   */
  addCredits: async (userId: string, amount: number) => {
    const response = await api.post<{ success: boolean; user: User }>(
      `/admin/users/${userId}/credits`,
      { amount }
    );
    return response.data;
  },
};
