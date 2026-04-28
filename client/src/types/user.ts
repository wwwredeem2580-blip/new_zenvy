export type UserRole = 'admin' | 'agent' | 'client';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
