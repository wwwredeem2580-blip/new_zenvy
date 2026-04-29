import mongoose, { Schema, Document } from 'mongoose';

export type WorkspacePermission = 'Public' | 'Read-only' | 'Restricted';

export interface IWorkspace extends Document {
  name: string;
  isSystem: boolean; // Cannot be deleted if true
  permission: WorkspacePermission;
  allowedAgents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, unique: true },
    isSystem: { type: Boolean, default: false },
    permission: { 
      type: String, 
      enum: ['Public', 'Read-only', 'Restricted'], 
      default: 'Public' 
    },
    allowedAgents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Workspace = mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
