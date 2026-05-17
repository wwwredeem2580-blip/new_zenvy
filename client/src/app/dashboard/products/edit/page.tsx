"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NewProductScreen from '@/components/NewProductScreen';
import { Product } from '@/types/zenvy';
import { Suspense } from 'react';

function EditProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [productList, setProductList] = useState<Product[]>([]);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const idParam = searchParams.get('id');

  // Load productList and find matching product on mount/change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zenvy_productList');
      if (saved) {
        try {
          const list = JSON.parse(saved) as Product[];
          setProductList(list);

          if (idParam) {
            // Find product matching number or string id
            const matched = list.find(p => String(p.id) === String(idParam));
            if (matched) {
              setTargetProduct(matched);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
  }, [idParam]);

  const handleSuccess = (updatedProduct: any) => {
    // Update the edited product in the list
    const updatedList = productList.map(p => 
      String(p.id) === String(updatedProduct.id) ? updatedProduct : p
    );
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenvy_productList', JSON.stringify(updatedList));
    }
    
    // Redirect back to Products tab
    router.push('/dashboard?tab=products');
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[#fbf9f9] h-screen flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-t-[#020302] border-[#efeded] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest text-[#5e5e5d] font-bold">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!targetProduct) {
    return (
      <div className="flex-1 bg-[#fbf9f9] h-screen flex items-center justify-center font-sans p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#020302]">Product Not Found</h2>
            <p className="text-xs text-[#5e5e5d] leading-relaxed">
              We couldn't locate the product you are trying to edit. It may have been deleted or the link is invalid.
            </p>
          </div>
          <button 
            onClick={() => router.push('/dashboard?tab=products')}
            className="w-full h-[48px] bg-[#020302] text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer rounded-sm"
          >
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <NewProductScreen 
      onBack={() => router.push('/dashboard?tab=products')}
      onSuccess={handleSuccess}
      initialProduct={targetProduct}
    />
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 bg-[#fbf9f9] h-screen flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-t-[#020302] border-[#efeded] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest text-[#5e5e5d] font-bold">Loading showroom...</p>
        </div>
      </div>
    }>
      <EditProductContent />
    </Suspense>
  );
}
