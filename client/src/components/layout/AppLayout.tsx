"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "./Navbar";
import AuthOverlay from "../auth/AuthOverlay";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthOpen, setIsAuthOpen, setUser } = useAuth();

  return (
    <div className="min-h-screen bg-white text-black font-dm selection:bg-black selection:text-white light">
      <Navbar />
      
      <main className="pt-24 min-h-screen">
        {children}
      </main>

      {/* Global Auth Overlay */}
      <AuthOverlay 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={(u) => setUser(u)} 
      />
    </div>
  );
}

