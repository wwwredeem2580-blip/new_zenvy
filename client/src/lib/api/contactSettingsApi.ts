import { api } from './axios';

export interface ContactSettings {
  whatsappNumber: string;
  supportEmail: string;
  supportPhone: string;
}

export const contactSettingsApi = {
  // Public method to fetch settings
  getPublic: async (): Promise<ContactSettings> => {
    const res = await api.get('/contact-settings');
    return res.data.settings;
  },

  // Admin method to fetch settings
  getAdmin: async (): Promise<ContactSettings> => {
    const res = await api.get('/admin/contact-settings');
    return res.data.settings;
  },

  // Admin method to update settings
  update: async (data: ContactSettings): Promise<ContactSettings> => {
    const res = await api.put('/admin/contact-settings', data);
    return res.data.settings;
  },
};
