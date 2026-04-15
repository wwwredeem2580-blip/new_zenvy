/**
 * Mock API Service Layer
 * This simulates backend functionality for the Smart CAF demo.
 * Uses localStorage to persist state across refreshes.
 */

import { Application, ApplicationStatus, mockApplications } from "../../data/applications";

export interface AgentPermissions {
  canViewWorkspaces: boolean;
  canUploadFiles: boolean;
  canDeleteFiles: boolean;
  canViewApplications: boolean;
  canManageApplications: boolean;
  canIssueCredits: boolean;
}

export const DEFAULT_AGENT_PERMISSIONS: AgentPermissions = {
  canViewWorkspaces: true,
  canUploadFiles: true,
  canDeleteFiles: false,
  canViewApplications: true,
  canManageApplications: true,
  canIssueCredits: false,
};

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin' | 'subagent';
  emailVerified: boolean;
  phoneVerified: boolean;
  balance: number;
  createdAt: string;
  inviteToken?: string;
  permissions?: Partial<AgentPermissions>; // Overrides for agents
}

export type WorkspacePermission = 'Public' | 'Read-only' | 'Restricted';

export interface Workspace {
  id: string;
  name: string;
  permission: WorkspacePermission;
  allowedAgents: string[]; // User IDs
  createdAt: string;
}

export interface FileRecord {
  id: string;
  workspaceId: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string; // User Name
  uploadedAt: string;
}

const USERS_KEY = 'smart_caf_mock_users';
const SESSION_KEY = 'smart_caf_session';
const APPLICATIONS_KEY = 'smart_caf_mock_applications';
const WORKSPACES_KEY = 'smart_caf_mock_workspaces';
const FILES_KEY = 'smart_caf_mock_files';

// Helper to get from localStorage
const getFromStorage = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

// Helper to save to localStorage
const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const mockApi = {
  // Authentication
  register: async (data: Partial<User>): Promise<{ user: User; token: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate delay
    
    const users = getFromStorage<User[]>(USERS_KEY) || [];
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: (data.email || '').trim().toLowerCase(),
      role: 'user',
      emailVerified: false,
      phoneVerified: false,
      balance: 1250, // Initial demo balance
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveToStorage(USERS_KEY, users);
    
    const token = 'mock_jwt_token_' + newUser.id;
    saveToStorage(SESSION_KEY, { user: newUser, token });
    
    return { user: newUser, token };
  },

  login: async (email: string, password?: string): Promise<{ user: User; token: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const users = getFromStorage<User[]>(USERS_KEY) || [];
    const normalizedEmail = email.trim().toLowerCase();
    let user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      // For demo purposes, create a user if not found
      user = {
        id: 'demo_user_123',
        firstName: 'John',
        lastName: 'Doe',
        email: normalizedEmail,
        role: 'user',
        emailVerified: true,
        phoneVerified: false,
        balance: 1450.50,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      saveToStorage(USERS_KEY, users);
    }

    const token = 'mock_jwt_token_' + user.id;
    saveToStorage(SESSION_KEY, { user, token });

    return { user, token };
  },

  googleLogin: async (): Promise<{ user: User; token: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    const user: User = {
      id: 'google_user_555',
      firstName: 'Google',
      lastName: 'User',
      email: 'user@gmail.com',
      role: 'user',
      emailVerified: true,
      phoneVerified: false,
      balance: 2850.75,
      createdAt: new Date().toISOString(),
    };

    const token = 'google_mock_token';
    saveToStorage(SESSION_KEY, { user, token });

    return { user, token };
  },

  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
  },

  getCurrentUser: (): User | null => {
    const session = getFromStorage<{ user: User; token: string }>(SESSION_KEY);
    return session ? session.user : null;
  },

  // User Management
  getUsers: async (): Promise<User[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return getFromStorage<User[]>(USERS_KEY) || [];
  },

  getUserById: async (id: string): Promise<User | null> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const users = getFromStorage<User[]>(USERS_KEY) || [];
    return users.find(u => u.id === id) || null;
  },

  addCredits: async (userId: string, amount: number): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const users = getFromStorage<User[]>(USERS_KEY) || [];
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].balance += amount;
      saveToStorage(USERS_KEY, users);
      
      // Update session if it's the current user
      const session = getFromStorage<{ user: User; token: string }>(SESSION_KEY);
      if (session && session.user.id === userId) {
        session.user.balance += amount;
        saveToStorage(SESSION_KEY, session);
      }
      return true;
    }
    return false;
  },

  deductCredits: async (userId: string, amount: number): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const users = getFromStorage<User[]>(USERS_KEY) || [];
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
      if ((users[index].balance || 0) < amount) return false;
      
      users[index].balance -= amount;
      saveToStorage(USERS_KEY, users);
      
      // Update session if it's the current user
      const session = getFromStorage<{ user: User; token: string }>(SESSION_KEY);
      if (session && session.user.id === userId) {
        session.user.balance -= amount;
        saveToStorage(SESSION_KEY, session);
      }
      return true;
    }
    return false;
  },

  // Verification
  verifyEmail: async (token: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const session = getFromStorage<{ user: User; token: string }>(SESSION_KEY);
    if (session) {
      session.user.emailVerified = true;
      saveToStorage(SESSION_KEY, session);
      
      // Update in users list too
      const users = getFromStorage<User[]>(USERS_KEY) || [];
      const userIndex = users.findIndex(u => u.id === session.user.id);
      if (userIndex !== -1) {
        users[userIndex].emailVerified = true;
        saveToStorage(USERS_KEY, users);
      }
      return true;
    }
    return false;
  },

  // Applications
  getApplications: async (): Promise<Application[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    let apps = getFromStorage<Application[]>(APPLICATIONS_KEY);
    if (!apps) {
      apps = mockApplications;
      saveToStorage(APPLICATIONS_KEY, apps);
    }
    return apps;
  },

  getApplicationsByEmail: async (email: string): Promise<Application[]> => {
    const apps = await mockApi.getApplications();
    const normalizedEmail = (email || '').trim().toLowerCase();
    return apps.filter(app => (app.email || '').trim().toLowerCase() === normalizedEmail);
  },

  submitApplication: async (app: Partial<Application>): Promise<Application> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const apps = await mockApi.getApplications();
    const newApp: Application = {
      ...app as Application,
      email: (app.email || '').trim().toLowerCase(), // Robust email handling
      id: 'CAF-' + Math.floor(100000 + Math.random() * 900000).toString(),
      status: 'Pending',
      submittedAt: new Date().toISOString(),
    };
    apps.unshift(newApp);
    saveToStorage(APPLICATIONS_KEY, apps);
    return newApp;
  },

  updateApplicationStatus: async (id: string, status: ApplicationStatus): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const apps = await mockApi.getApplications();
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
      apps[index].status = status;
      saveToStorage(APPLICATIONS_KEY, apps);
      return true;
    }
    return false;
  },

  // Workspaces & Cloud Storage
  getWorkspaces: async (): Promise<Workspace[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    let workspaces = getFromStorage<Workspace[]>(WORKSPACES_KEY);
    if (!workspaces) {
      workspaces = [
        { id: 'ws1', name: 'Application Documents', permission: 'Public', allowedAgents: [], createdAt: new Date().toISOString() },
        { id: 'ws2', name: 'Templates', permission: 'Read-only', allowedAgents: [], createdAt: new Date().toISOString() },
        { id: 'ws3', name: 'Internal Reports', permission: 'Restricted', allowedAgents: [], createdAt: new Date().toISOString() },
      ];
      saveToStorage(WORKSPACES_KEY, workspaces);
    }
    return workspaces;
  },

  createWorkspace: async (data: Partial<Workspace>): Promise<Workspace> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const workspaces = await mockApi.getWorkspaces();
    const newWs: Workspace = {
      id: 'ws-' + Math.random().toString(36).substr(2, 5),
      name: data.name || 'Untitled Workspace',
      permission: data.permission || 'Public',
      allowedAgents: data.allowedAgents || [],
      createdAt: new Date().toISOString(),
    };
    workspaces.push(newWs);
    saveToStorage(WORKSPACES_KEY, workspaces);
    return newWs;
  },

  updateWorkspace: async (id: string, data: Partial<Workspace>): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const workspaces = await mockApi.getWorkspaces();
    const index = workspaces.findIndex(ws => ws.id === id);
    if (index !== -1) {
      workspaces[index] = { ...workspaces[index], ...data };
      saveToStorage(WORKSPACES_KEY, workspaces);
      return true;
    }
    return false;
  },

  deleteWorkspace: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const workspaces = await mockApi.getWorkspaces();
    const filtered = workspaces.filter(ws => ws.id !== id);
    saveToStorage(WORKSPACES_KEY, filtered);
    return true;
  },

  getFiles: async (workspaceId: string): Promise<FileRecord[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const files = getFromStorage<FileRecord[]>(FILES_KEY) || [];
    return files.filter(f => f.workspaceId === workspaceId);
  },

  uploadFile: async (workspaceId: string, name: string): Promise<FileRecord> => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const files = getFromStorage<FileRecord[]>(FILES_KEY) || [];
    const currentUser = mockApi.getCurrentUser();
    
    const newFile: FileRecord = {
      id: 'file-' + Math.random().toString(36).substr(2, 5),
      workspaceId,
      name,
      size: (Math.random() * 5 + 1).toFixed(1) + ' MB',
      type: name.split('.').pop()?.toUpperCase() || 'FILE',
      uploadedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Anonymous',
      uploadedAt: new Date().toISOString(),
    };
    
    files.unshift(newFile);
    saveToStorage(FILES_KEY, files);
    return newFile;
  },

  deleteFile: async (workspaceId: string, fileId: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const files = getFromStorage<FileRecord[]>(FILES_KEY) || [];
    const filtered = files.filter(f => f.id !== fileId);
    saveToStorage(FILES_KEY, filtered);
    return true;
  },

  // Agent & User Lifecycle
  inviteAgent: async (email: string, name: string): Promise<{ user: User; inviteLink: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const users = getFromStorage<User[]>(USERS_KEY) || [];
    
    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
       throw new Error("User with this email already exists");
    }

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Invited';
    const lastName = nameParts.slice(1).join(' ') || 'Agent';
    const inviteToken = Math.random().toString(36).substr(2, 12);

    const newUser: User = {
       id: 'agent-' + Math.random().toString(36).substr(2, 5),
       firstName,
       lastName,
       email: email.toLowerCase(),
       role: 'subagent',
       emailVerified: true, // We assume invite link verifies email
       phoneVerified: false,
       balance: 0,
       createdAt: new Date().toISOString(),
       inviteToken,
    };

    users.push(newUser);
    saveToStorage(USERS_KEY, users);

    // In a real app, this would be the URL to our frontend
    const inviteLink = `${window.location.origin}${window.location.pathname}?invite_token=${inviteToken}`;
    return { user: newUser, inviteLink };
  },

  acceptInvite: async (token: string, password?: string): Promise<{ user: User; token: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const users = getFromStorage<User[]>(USERS_KEY) || [];
    const user = users.find(u => u.inviteToken === token);

    if (!user) throw new Error("Invalid or expired invitation token");

    // Clear the token so it can't be reused
    user.inviteToken = undefined;
    saveToStorage(USERS_KEY, users);

    const jwtToken = 'mock_jwt_token_' + user.id;
    saveToStorage(SESSION_KEY, { user, token: jwtToken });

    return { user, token: jwtToken };
  },

  assignUserRole: async (userId: string, role: 'user' | 'admin' | 'subagent'): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const users = getFromStorage<User[]>(USERS_KEY) || [];
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
       users[index].role = role;
       saveToStorage(USERS_KEY, users);
       
       // Sync session if it's current user
       const session = getFromStorage<{ user: User; token: string }>(SESSION_KEY);
       if (session && session.user.id === userId) {
          session.user.role = role;
          saveToStorage(SESSION_KEY, session);
       }
       return true;
    }
    return false;
  },

  updateUserPermissions: async (userId: string, permissions: Partial<AgentPermissions>): Promise<boolean> => {
     await new Promise((resolve) => setTimeout(resolve, 400));
     const users = getFromStorage<User[]>(USERS_KEY) || [];
     const index = users.findIndex(u => u.id === userId);

     if (index !== -1) {
        users[index].permissions = { ...users[index].permissions, ...permissions };
        saveToStorage(USERS_KEY, users);

        const session = getFromStorage<{ user: User; token: string }>(SESSION_KEY);
        if (session && session.user.id === userId) {
           session.user.permissions = users[index].permissions;
           saveToStorage(SESSION_KEY, session);
        }
        return true;
     }
     return false;
  },

  getEffectivePermissions: (user: User): AgentPermissions => {
     if (user.role === 'admin') {
        return {
           canViewWorkspaces: true,
           canUploadFiles: true,
           canDeleteFiles: true,
           canViewApplications: true,
           canManageApplications: true,
           canIssueCredits: true
        };
     }
     if (user.role === 'user') {
        return {
           canViewWorkspaces: false,
           canUploadFiles: false,
           canDeleteFiles: false,
           canViewApplications: false,
           canManageApplications: false,
           canIssueCredits: false
        };
     }
     // Agent merge
     return { ...DEFAULT_AGENT_PERMISSIONS, ...(user.permissions || {}) };
  }
};
