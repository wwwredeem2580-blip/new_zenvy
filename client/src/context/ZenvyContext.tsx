"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  const [phoneNumber, setPhoneNumberState] = useState('');
  const [storeName, setStoreNameState] = useState('');
  const [storeDescription, setStoreDescriptionState] = useState('');

  // Hydrate from localStorage on client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem('zenvy_phone');
      const savedName = localStorage.getItem('zenvy_storeName');
      const savedDesc = localStorage.getItem('zenvy_storeDesc');
      if (savedPhone) setPhoneNumberState(savedPhone);
      if (savedName) setStoreNameState(savedName);
      if (savedDesc) setStoreDescriptionState(savedDesc);
    }
  }, []);

  const setPhoneNumber = (phone: string) => {
    setPhoneNumberState(phone);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenvy_phone', phone);
    }
  };

  const setStoreName = (name: string) => {
    setStoreNameState(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenvy_storeName', name);
    }
  };

  const setStoreDescription = (desc: string) => {
    setStoreDescriptionState(desc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenvy_storeDesc', desc);
    }
  };

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
