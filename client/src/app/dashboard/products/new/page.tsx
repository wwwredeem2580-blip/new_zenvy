"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NewProductScreen from '@/components/NewProductScreen';
import { Product } from '@/types/zenvy';
import { Suspense } from 'react';

function NewProductContent() {
  const router = useRouter();
  const [productList, setProductList] = useState<Product[]>([]);

  // Load productList from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zenvy_productList');
      if (saved) {
        try {
          setProductList(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleSuccess = (newProduct: any) => {
    const exists = productList.some(p => p.id === newProduct.id);
    let updatedList: Product[];
    if (exists) {
      updatedList = productList.map(p => p.id === newProduct.id ? newProduct : p);
    } else {
      updatedList = [newProduct, ...productList];
    }
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenvy_productList', JSON.stringify(updatedList));
    }
    
    // Redirect back to Products tab
    router.push('/dashboard?tab=products');
  };

  return (
    <NewProductScreen 
      onBack={() => router.push('/dashboard?tab=products')}
      onSuccess={handleSuccess}
    />
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 bg-[#fbf9f9] h-screen flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-t-[#020302] border-[#efeded] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest text-[#5e5e5d] font-bold">Loading showroom...</p>
        </div>
      </div>
    }>
      <NewProductContent />
    </Suspense>
  );
}
