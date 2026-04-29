import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitation extends Document {
  email: string;
  role: 'agent' | 'admin';
  token: string;
  status: 'Pending' | 'Accepted' | 'Expired';
  expiresAt: Date;
  invitedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['agent', 'admin'], default: 'agent' },
    token: { type: String, required: true, unique: true },
    status: { 
      type: String, 
      enum: ['Pending', 'Accepted', 'Expired'], 
      default: 'Pending' 
    },
    expiresAt: { type: Date, required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Index to automatically expire invitations (MongoDB TTL index)
InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Invitation = mongoose.model<IInvitation>('Invitation', InvitationSchema);
