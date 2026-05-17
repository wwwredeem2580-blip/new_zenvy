"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ZenvyContextType {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  storeName: string;
  setStoreName: (name: string) => void;
  storeLocation: string;
  setStoreLocation: (loc: string) => void;
}

const ZenvyContext = createContext<ZenvyContextType | undefined>(undefined);

export function ZenvyProvider({ children }: { children: ReactNode }) {
  const [phoneNumber, setPhoneNumberState] = useState('');
  const [storeName, setStoreNameState] = useState('');
  const [storeLocation, setStoreLocationState] = useState('');

  // Hydrate from localStorage on client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem('zenvy_phone');
      const savedName = localStorage.getItem('zenvy_storeName');
      const savedLoc = localStorage.getItem('zenvy_storeLocation');
      if (savedPhone) setPhoneNumberState(savedPhone);
      if (savedName) setStoreNameState(savedName);
      if (savedLoc) setStoreLocationState(savedLoc);
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

  const setStoreLocation = (loc: string) => {
    setStoreLocationState(loc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenvy_storeLocation', loc);
    }
  };

  return (
    <ZenvyContext.Provider value={{
      phoneNumber,
      setPhoneNumber,
      storeName,
      setStoreName,
      storeLocation,
      setStoreLocation
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
