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
    const settings = res.data.settings;
    if (settings.revolutQrUrl && settings.revolutQrUrl.startsWith('/')) {
      settings.revolutQrUrl = `${api.defaults.baseURL}${settings.revolutQrUrl}`;
    }
    return settings;
  },

  getAdmin: async (): Promise<PaymentSettings> => {
    const res = await api.get('/admin/payment-settings');
    const settings = res.data.settings;
    if (settings.revolutQrUrl && settings.revolutQrUrl.startsWith('/')) {
      settings.revolutQrUrl = `${api.defaults.baseURL}${settings.revolutQrUrl}`;
    }
    return settings;
  },

  update: async (data: PaymentSettings): Promise<PaymentSettings> => {
    const res = await api.put('/admin/payment-settings', data);
    return res.data.settings;
  },

  uploadQrCode: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('qrImage', file);
    const res = await api.post('/admin/payment-settings/qr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    let qrUrl = res.data.qrUrl;
    if (qrUrl && qrUrl.startsWith('/')) {
      qrUrl = `${api.defaults.baseURL}${qrUrl}`;
    }
    return qrUrl;
  },
};
