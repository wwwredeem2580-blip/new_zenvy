import { api } from './axios';

import { User } from '../../types/user';

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
  getAnalytics: async () => {
    const response = await api.get<{ success: boolean; analytics: any }>('/admin/analytics');
    return response.data;
  },

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
   * updateUserPermissions — Overrides agent permissions.
   */
  updateUserPermissions: async (userId: string, permissions: any) => {
    const response = await api.patch<{ success: boolean; user: User }>(
      `/admin/users/${userId}/permissions`,
      { permissions }
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
  },

  /**
   * listInvitations — Fetches all pending/expired staff invitations.
   */
  listInvitations: async () => {
    const response = await api.get<{ success: boolean; invitations: any[] }>('/admin/invitations');
    return response.data;
  },

  /**
   * createInvitation — Sends a secure invite to a new staff member.
   */
  createInvitation: async (email: string, role: 'agent' | 'admin') => {
    const response = await api.post<{ success: boolean; invitation: any }>('/admin/invitations', { email, role });
    return response.data;
  },

  /**
   * revokeInvitation — Cancels a pending invitation.
   */
  revokeInvitation: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/admin/invitations/${id}`);
    return response.data;
  },

  /**
   * listServices — Fetches all available services.
   */
  listServices: async () => {
    const response = await api.get<{ success: boolean; services: any[] }>('/services');
    return response.data;
  },

  /**
   * createUpdateService — Creates a new service or updates an existing one.
   */
  createUpdateService: async (data: any) => {
    const response = await api.post<{ success: boolean; service: any }>('/services', data);
    return response.data;
  },

  /**
   * deleteService — Removes a service from the catalog.
   */
  deleteService: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/services/${id}`);
    return response.data;
  },

  /**
   * findUser — Searches for users by email or phone.
   */
  findUser: async (query: string) => {
    const response = await api.get<{ success: boolean; users: User[] }>(
      '/admin/users/search',
      { params: { query } }
    );
    return response.data;
  },

  /**
   * createMinimalUser — Creates a minimal account for a client.
   */
  createMinimalUser: async (data: { firstName: string; lastName: string; email: string; phone: string }) => {
    const response = await api.post<{ success: boolean; user: User }>(
      '/admin/users/minimal',
      data
    );
    return response.data;
  },
};
