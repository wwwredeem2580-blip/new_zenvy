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
  
  /**
   * listWorkspaces — Fetches all cloud storage workspaces.
   */
  listWorkspaces: async () => {
    const response = await api.get<{ success: boolean; workspaces: any[] }>('/admin/workspaces');
    return response.data;
  },

  /**
   * createWorkspace — Creates a new folder workspace.
   */
  createWorkspace: async (data: { name: string; permission: string; allowedAgents?: string[] }) => {
    const response = await api.post<{ success: boolean; workspace: any }>('/admin/workspaces', data);
    return response.data;
  },

  /**
   * updateWorkspace — Updates workspace settings.
   */
  updateWorkspace: async (id: string, data: any) => {
    const response = await api.patch<{ success: boolean; workspace: any }>(`/admin/workspaces/${id}`, data);
    return response.data;
  },

  /**
   * deleteWorkspace — Removes a workspace.
   */
  deleteWorkspace: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/admin/workspaces/${id}`);
    return response.data;
  },

  /**
   * listFiles — Lists all files within a workspace.
   */
  listFiles: async (workspaceId: string) => {
    const response = await api.get<{ success: boolean; files: any[] }>(`/admin/workspaces/${workspaceId}/files`);
    return response.data;
  },

  /**
   * uploadFile — Uploads a file to a custom workspace.
   */
  uploadFile: async (workspaceId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ success: boolean; file: any }>(
      `/admin/workspaces/${workspaceId}/files`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * deleteFile — Removes a file from a workspace.
   */
  deleteFile: async (workspaceId: string, fileKey: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/admin/workspaces/${workspaceId}/files`,
      { params: { fileKey } }
    );
    return response.data;
  },

  /**
   * getFilePreviewUrl — Requests a short-lived preview link for a workspace file.
   */
  getFilePreviewUrl: async (workspaceId: string, fileKey: string) => {
    const response = await api.get<{ success: boolean; previewUrl: string }>(
      `/admin/workspaces/${workspaceId}/preview`,
      { params: { fileKey } }
    );
    return response.data;
  }
};
