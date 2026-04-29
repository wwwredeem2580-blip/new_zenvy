import { api } from './axios';
import { Application, ApplicationStatus } from '../../data/applications';

export interface CreateApplicationData {
  name: string;
  dob: string;
  pob: string;
  nationality: string;
  codiceFiscale: string;
  phone: string;
  email: string;
  address: string;
  streetAddress?: string;
  postCode?: string;
  province?: string;
  permessoType?: string;
  permessoExpiry?: string;
  paymentMethod: 'Cash' | 'Revolut' | 'PostPay' | 'Card' | 'Credits';
  selectedServices: {
    name: string;
    price: number;
    duration: string;
  }[];
  transactionId?: string;
  attachments?: {
    name: string;
    url: string; // The objectKey from Backblaze
    uploadedBy: string;
    uploadedById: string;
  }[];
}

export const applicationApi = {
  /**
   * submitApplication — Sends application data to the backend.
   */
  submitApplication: async (data: CreateApplicationData) => {
    const response = await api.post<{ success: boolean; application: Application }>(
      '/applications',
      data
    );
    return response.data;
  },

  /**
   * getMyApplications — Fetches applications for the currently logged-in user.
   */
  getMyApplications: async () => {
    const response = await api.get<{ success: boolean; applications: Application[] }>(
      '/applications/my'
    );
    return response.data;
  },

  /**
   * getApplicationById — Fetches details for a specific application.
   */
  getApplicationById: async (id: string) => {
    const response = await api.get<{ success: boolean; application: Application }>(
      `/applications/${id}`
    );
    return response.data;
  },

  /**
   * listAllApplications — (Admin/Agent) Fetches all applications in the system.
   */
  listAllApplications: async () => {
    const response = await api.get<{ success: boolean; applications: Application[] }>(
      '/applications'
    );
    return response.data;
  },

  /**
   * uploadAttachment — Uploads a file directly to the backend, which then proxies it to Backblaze.
   */
  uploadAttachment: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ success: boolean; objectKey: string; filename: string }>(
      '/applications/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * updatePaymentStatus - (Admin/Agent) Updates the payment status.
   */
  updatePaymentStatus: async (applicationId: string, status: 'Pending' | 'Received') => {
    const response = await api.patch<{ success: boolean; application: Application }>(
      `/applications/${applicationId}/payment-status`,
      { status }
    );
    return response.data;
  },

  /**
   * assignAgent - (Admin/Agent) Assigns an agent to the application.
   */
  assignAgent: async (applicationId: string, agentId: string) => {
    const response = await api.patch<{ success: boolean; application: Application }>(
      `/applications/${applicationId}/assign`,
      { agentId }
    );
    return response.data;
  },

  /**
   * unassignAgent - (Admin/Agent) Removes the assigned agent.
   */
  unassignAgent: async (applicationId: string) => {
    const response = await api.patch<{ success: boolean; application: Application }>(
      `/applications/${applicationId}/unassign`
    );
    return response.data;
  },

  /**
   * updateStatus - (Admin/Agent) Updates the application status.
   */
  updateStatus: async (applicationId: string, status: ApplicationStatus) => {
    const response = await api.patch<{ success: boolean; application: Application }>(
      `/applications/${applicationId}/status`,
      { status }
    );
    return response.data;
  },

  /**
   * getAttachmentPreviewUrl — Requests a short-lived preview link for an attachment.
   */
  getAttachmentPreviewUrl: async (applicationId: string, key: string) => {
    const response = await api.get<{ success: boolean; previewUrl: string }>(
      `/applications/${applicationId}/attachment-preview`,
      { params: { key } }
    );
    return response.data;
  },

  /**
   * uploadFinalDocument — Uploads a final document and attaches it to the application.
   */
  uploadFinalDocument: async (applicationId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ success: boolean; application: Application }>(
      `/applications/${applicationId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * addNote — Adds an internal note/communication to the application.
   */
  addNote: async (applicationId: string, text: string) => {
    const response = await api.post<{ success: boolean; application: Application }>(
      `/applications/${applicationId}/notes`,
      { text }
    );
    return response.data;
  },
};
