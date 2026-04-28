import mongoose, { Schema, Document } from 'mongoose';

export type ApplicationStatus = 'Pending' | 'Reviewing' | 'Approved' | 'Rejected';

export interface ISubService {
  name: string;
  price: number;
  duration: string;
}

export interface IActivityLogEntry {
  type: string;
  description: string;
  actorName: string;
  actorId: string;
  timestamp: Date;
}

export interface INote {
  authorId: string;
  authorName: string;
  text: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IAttachment {
  name: string;
  url: string;
  uploadedBy: string;
  uploadedById: string;
  uploadedAt: Date;
}

export interface IApplication extends Document {
  applicationId: string; // e.g., CAF-123456
  userId: mongoose.Types.ObjectId;
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
  paymentMethod?: 'Cash' | 'Revolut' | 'PostPay' | 'Card' | 'Credits';
  paymentStatus?: 'Pending' | 'Received';
  transactionId?: string;
  status: ApplicationStatus;
  selectedServices: ISubService[];
  reviewerId?: mongoose.Types.ObjectId;
  reviewerName?: string;
  lastActivityAt?: Date;
  refundAmount?: number;
  refundType?: 'Full' | 'Partial';
  notes: INote[];
  activityLog: IActivityLogEntry[];
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const SubServiceSchema = new Schema<ISubService>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
});

const ActivityLogSchema = new Schema<IActivityLogEntry>({
  type: { type: String, required: true },
  description: { type: String, required: true },
  actorName: { type: String, required: true },
  actorId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const NoteSchema = new Schema<INote>({
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

const AttachmentSchema = new Schema<IAttachment>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  uploadedById: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const ApplicationSchema = new Schema<IApplication>(
  {
    applicationId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dob: { type: String, required: true },
    pob: { type: String, required: true },
    nationality: { type: String, required: true },
    codiceFiscale: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    streetAddress: { type: String },
    postCode: { type: String },
    province: { type: String },
    permessoType: { type: String },
    permessoExpiry: { type: String },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Revolut', 'PostPay', 'Card', 'Credits'],
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Received'],
      default: 'Pending',
    },
    transactionId: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Reviewing', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    selectedServices: [SubServiceSchema],
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewerName: { type: String },
    lastActivityAt: { type: Date },
    refundAmount: { type: Number },
    refundType: { type: String, enum: ['Full', 'Partial'] },
    notes: { type: [NoteSchema], default: [] },
    activityLog: { type: [ActivityLogSchema], default: [] },
    attachments: { type: [AttachmentSchema], default: [] },
  },
  { timestamps: true }
);

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
