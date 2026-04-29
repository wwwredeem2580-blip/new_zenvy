import { api } from './axios';

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
  token?: string; // Although we use cookies, sometimes we might return the token in JSON
}

export const authApi = {
  register: async (data: any) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: any) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post<AuthResponse>('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<AuthResponse>('/auth/me');
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.get<AuthResponse>(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  getGoogleAuthUrl: async () => {
    // This is usually a simple redirect, but we can fetch it if needed
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/google`;
  },
  resendVerification: async () => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/auth/resend-verification'
    );
    return response.data;
  },

  verifyInvitation: async (token: string) => {
    const response = await api.get<{ success: boolean; invitation: any }>(`/auth/invitations/${token}`);
    return response.data;
  },

  registerAgent: async (data: any) => {
    const response = await api.post<AuthResponse>('/auth/register-agent', data);
    return response.data;
  },
};
