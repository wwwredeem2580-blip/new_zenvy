import mongoose, { Schema, Document } from 'mongoose';

export interface IContactSettings extends Document {
  whatsappNumber?: string;
  supportEmail?: string;
  supportPhone?: string;
}

const ContactSettingsSchema = new Schema<IContactSettings>(
  {
    whatsappNumber: { type: String, default: '+393278278278' },
    supportEmail: { type: String, default: 'support@smartcaf.tech' },
    supportPhone: { type: String, default: '+39 327 827 8278' },
  },
  { timestamps: true }
);

export const ContactSettings = mongoose.model<IContactSettings>('ContactSettings', ContactSettingsSchema);
