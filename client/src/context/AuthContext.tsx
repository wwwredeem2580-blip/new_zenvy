"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/user";
import { authApi } from "@/lib/api/authApi";

interface AuthContextType {
  user: User | null;
  setUser: (user: any | null) => void;
  isLoading: boolean;
  isAuthOpen: boolean;
  setIsAuthOpen: (isOpen: boolean) => void;
  logout: () => Promise<void>;
  verificationMessage: { type: 'success' | 'error', text: string } | null;
  setVerificationMessage: (msg: { type: 'success' | 'error', text: string } | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await authApi.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        }
      } catch (error) {
        console.log("No active session");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Check for invite token or verification status in URL
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get('invite_token');
    const verified = params.get('verified');
    const error = params.get('error');

    if (inviteToken && !user) {
      setIsAuthOpen(true);
    }

    if (verified === 'true') {
      setVerificationMessage({ type: 'success', text: 'Email verified successfully! You can now log in.' });
      setIsAuthOpen(true);
      // Clear params safely
      window.history.replaceState({}, '', window.location.pathname);
    } else if (verified === 'false' || error) {
      setVerificationMessage({ type: 'error', text: error || 'Email verification failed.' });
      setIsAuthOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      isLoading, 
      isAuthOpen, 
      setIsAuthOpen,
      logout,
      verificationMessage,
      setVerificationMessage
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
