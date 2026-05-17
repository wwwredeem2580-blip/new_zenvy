"use client";

import { motion } from 'motion/react';
import { ArrowRight, Plus, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CongratulationsScreen() {
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-white max-w-xl mx-auto w-full"
    >
      <div className="h-[40vh] w-full relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop" 
          alt="Success"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 px-8 pt-10 pb-12 flex flex-col text-center">
        <h1 className="text-4xl font-serif text-[#333333] mb-8">Congratulations!</h1>
        
        <div className="space-y-6 mb-12">
          <p className="text-gray-500 text-sm font-sans">Your account has been created with</p>
          <div className="flex items-center justify-center gap-2 text-[#333333]">
            <CheckCircle2 size={18} className="text-[#333333]" />
            <span className="text-sm font-medium font-sans">Free Access to Dashboard</span>
          </div>
          <div className="w-16 h-px bg-gray-100 mx-auto"></div>
          <p className="text-gray-500 text-sm font-sans leading-relaxed">
            Start stocking your shelves today with <br />products from thousands of brands
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 px-6 bg-[#333333] text-white border border-[#333333] flex items-center justify-center gap-2 hover:bg-white hover:text-[#333333] transition-all duration-300 group"
          >
            <span className="font-sans font-medium">Go to Dashboard</span>
            <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            className="w-full py-4 px-6 bg-white text-[#333333] border border-gray-100 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all duration-300"
          >
            <Plus size={18} />
            <span className="font-sans font-medium">Add your first product</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
