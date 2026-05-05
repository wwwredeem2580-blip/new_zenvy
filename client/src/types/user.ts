export type UserRole = 'admin' | 'agent' | 'client';

export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  phoneVerified?: boolean;
  balance?: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: AgentPermissions; // For agent permissions
}

export interface AgentPermissions {
  canViewWorkspaces: boolean;
  canUploadFiles: boolean;
  canDeleteFiles: boolean;
  canViewApplications: boolean;
  canManageApplications: boolean;
}

export type WorkspacePermission = 'Public' | 'Read-only' | 'Restricted';

export interface Workspace {
  _id: string;
  id?: string;
  name: string;
  permission: WorkspacePermission;
  isSystem: boolean;
  allowedAgents?: string[];
  createdAt: string;
}

export interface FileRecord {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}
