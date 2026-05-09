import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../types/auth.type';

export interface IAgentPermissions {
  canViewWorkspaces: boolean;
  canUploadFiles: boolean;
  canDeleteFiles: boolean;
  canViewApplications: boolean;
  canManageApplications: boolean;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  authProvider: 'manual' | 'google';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpiry?: Date;
  googleId?: string;
  avatar?: string;
  phone?: string;
  balance: number;
  permissions?: IAgentPermissions;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'agent', 'client'],
      default: 'client',
    },
    authProvider: {
      type: String,
      enum: ['manual', 'google'],
      default: 'manual',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationTokenExpiry: {
      type: Date,
      select: false,
    },
    googleId: {
      type: String,
      sparse: true, // Allows null but enforces unique when set
    },
    avatar: {
      type: String,
    },
    phone: {
      type: String,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    permissions: {
      canViewWorkspaces: { type: Boolean },
      canUploadFiles: { type: Boolean },
      canDeleteFiles: { type: Boolean },
      canViewApplications: { type: Boolean },
      canManageApplications: { type: Boolean },
    },
  },
  {
    timestamps: true,
  }
);

// Index for token lookups during email verification
UserSchema.index({ emailVerificationToken: 1 }, { sparse: true });

export const User = mongoose.model<IUser>('User', UserSchema);
