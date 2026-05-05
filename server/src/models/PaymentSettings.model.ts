import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentSettings extends Document {
  revolutTag?: string;
  revolutQrUrl?: string;
  iban?: string;
  ibanRecipientName?: string;
  cashNote?: string;
  postpayNote?: string;
}

const PaymentSettingsSchema = new Schema<IPaymentSettings>(
  {
    revolutTag: { type: String, default: '' },
    revolutQrUrl: { type: String, default: '' },
    iban: { type: String, default: '' },
    ibanRecipientName: { type: String, default: '' },
    cashNote: { type: String, default: 'An agent will call you at your provided number shortly to finalize the cash collection.' },
    postpayNote: { type: String, default: 'Your application will be locked until payment is confirmed via our physical terminal (within 48 hours).' },
  },
  { timestamps: true }
);

export const PaymentSettings = mongoose.model<IPaymentSettings>('PaymentSettings', PaymentSettingsSchema);
