import { Schema, model, Document } from 'mongoose';

interface IMedia extends Document {
  userId?: string;
  type: string;
  provider: string;
  status: 'temp' | 'active' | 'deleted';
  objectKey: string;
  filename: string;
  mimeType: string;
  uploadedAt: Date;
  expiresAt?: Date;
  deletedAt?: Date;
  bucketName: string;
}

const MediaSchema = new Schema<IMedia>({
  userId: { type: String },
  type: { type: String, default: '' },
  provider: { type: String, default: 'backblaze' },
  status: { type: String, enum: ['temp', 'active', 'deleted'], default: 'temp' },
  objectKey: { type: String, required: true },
  filename: { type: String, required: true },
  mimeType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  deletedAt: { type: Date },
  bucketName: { type: String, required: true },
});

export const Media = model<IMedia>('Media', MediaSchema);
