/**
 * Mock API Service Layer
 * This simulates backend functionality for the Smart CAF demo.
 * Uses localStorage to persist state across refreshes.
 */

import { Application, ApplicationStatus, mockApplications } from "../../data/applications";

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
}

const USERS_KEY = 'smart_caf_mock_users';
const SESSION_KEY = 'smart_caf_session';
const APPLICATIONS_KEY = 'smart_caf_mock_applications';

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
  }
};
