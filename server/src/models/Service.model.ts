import mongoose, { Schema, Document } from 'mongoose';

export interface IRequiredDocument {
  label: string;
  required: boolean;
  instruction?: string;
}

export interface ISubService {
  name: string;
  price: number;
  duration: string;
  requiredDocuments: IRequiredDocument[];
}

export interface IService extends Document {
  id: string; // Slug/Internal ID
  name: string;
  icon: string; // Icon name (lucide)
  subservices: ISubService[];
}

const RequiredDocumentSchema = new Schema<IRequiredDocument>({
  label: { type: String, required: true },
  required: { type: Boolean, default: true },
  instruction: { type: String },
});

const SubServiceSchema = new Schema<ISubService>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  requiredDocuments: { type: [RequiredDocumentSchema], default: [] },
});

const ServiceSchema = new Schema<IService>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  subservices: { type: [SubServiceSchema], default: [] },
}, { timestamps: true });

export const Service = mongoose.model<IService>('Service', ServiceSchema);
