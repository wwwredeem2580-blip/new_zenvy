import { api } from './axios';
import { Application } from '../../data/applications';

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
};
