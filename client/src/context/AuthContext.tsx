"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { mockApi, User } from "@/lib/api/mockApi";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  isAuthOpen: boolean;
  setIsAuthOpen: (isOpen: boolean) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const currentUser = mockApi.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);

    // Check for invite token in URL (extracted from SmartCAF logic)
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get('invite_token');
    if (inviteToken && !currentUser) {
      setIsAuthOpen(true);
    }
  }, []);

  const logout = async () => {
    await mockApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      isLoading, 
      isAuthOpen, 
      setIsAuthOpen,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
