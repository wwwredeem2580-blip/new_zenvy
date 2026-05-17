"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ZenvyContextType {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  storeName: string;
  setStoreName: (name: string) => void;
  storeDescription: string;
  setStoreDescription: (desc: string) => void;
}

const ZenvyContext = createContext<ZenvyContextType | undefined>(undefined);

export function ZenvyProvider({ children }: { children: ReactNode }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');

  return (
    <ZenvyContext.Provider value={{
      phoneNumber,
      setPhoneNumber,
      storeName,
      setStoreName,
      storeDescription,
      setStoreDescription
    }}>
      {children}
    </ZenvyContext.Provider>
  );
}

export function useZenvy() {
  const context = useContext(ZenvyContext);
  if (context === undefined) {
    throw new Error('useZenvy must be used within a ZenvyProvider');
  }
  return context;
}
