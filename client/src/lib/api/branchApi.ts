import { api } from './axios';

export interface Branch {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  workingHours?: string;
  googleMapsUrl?: string;
  isMain: boolean;
  isActive: boolean;
}

export const branchApi = {
  // Public Endpoint
  listPublicBranches: async () => {
    const response = await api.get('/branches');
    return response.data;
  },

  // Admin Endpoints
  listAdminBranches: async () => {
    const response = await api.get('/admin/branches');
    return response.data;
  },

  createBranch: async (data: Partial<Branch>) => {
    const response = await api.post('/admin/branches', data);
    return response.data;
  },

  updateBranch: async (id: string, data: Partial<Branch>) => {
    const response = await api.put(`/admin/branches/${id}`, data);
    return response.data;
  },

  deleteBranch: async (id: string) => {
    const response = await api.delete(`/admin/branches/${id}`);
    return response.data;
  }
};
