"use client";

import { motion } from 'motion/react';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useZenvy } from '@/context/ZenvyContext';

export default function StoreDetailsScreen() {
  const router = useRouter();
  const { storeName, setStoreName, storeLocation, setStoreLocation } = useZenvy();

  const handleNext = () => {
    if (storeName) {
      router.push('/congratulations');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-white p-8 max-w-lg mx-auto w-full"
    >
      <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center -ml-2 mb-8 hover:bg-gray-50 rounded-full transition-colors">
        <ChevronLeft size={24} />
      </button>

      <h1 className="text-4xl font-serif text-[#333333] mb-12">Store Details</h1>

      <div className="space-y-12 flex-1">
        <div className="text-left">
          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium tracking-[0.1em] font-sans">Store Name</label>
          <input 
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="e.g., Simple Salt"
            className="w-full border-b border-gray-200 focus:border-[#333333] outline-none text-xl text-[#333333] py-2 transition-colors font-sans"
          />
        </div>

        <div className="text-left">
          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium tracking-[0.1em] font-sans">Store Location</label>
          <input 
            type="text"
            value={storeLocation}
            onChange={(e) => setStoreLocation(e.target.value)}
            placeholder="e.g., London, United Kingdom"
            className="w-full border-b border-gray-200 focus:border-[#333333] outline-none text-xl text-[#333333] py-2 transition-colors font-sans"
          />
        </div>
      </div>

      <button 
        onClick={handleNext}
        className={`w-full py-4 px-6 flex items-center justify-center gap-2 transition-all duration-300 border group
          ${storeName
            ? 'bg-[#333333] text-white border-[#333333] hover:bg-white hover:text-[#333333]' 
            : 'bg-gray-50 text-gray-300 border-gray-100'
          }`}
      >
        <span className="font-sans font-medium">Next</span>
        <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}
