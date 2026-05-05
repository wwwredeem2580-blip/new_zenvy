import { api } from './axios';

export interface PaymentSettings {
  revolutTag?: string;
  revolutQrUrl?: string;
  iban?: string;
  ibanRecipientName?: string;
  cashNote?: string;
  postpayNote?: string;
}

export const paymentSettingsApi = {
  getPublic: async (): Promise<PaymentSettings> => {
    const res = await api.get('/payment-settings');
    return res.data.settings;
  },

  getAdmin: async (): Promise<PaymentSettings> => {
    const res = await api.get('/admin/payment-settings');
    return res.data.settings;
  },

  update: async (data: PaymentSettings): Promise<PaymentSettings> => {
    const res = await api.put('/admin/payment-settings', data);
    return res.data.settings;
  },
};
