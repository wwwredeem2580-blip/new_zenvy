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
  permissions?: any; // For agent permissions
}
