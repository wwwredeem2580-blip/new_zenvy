"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { COUNTRY_CODE } from '@/data/constants';
import { useZenvy } from '@/context/ZenvyContext';

export default function OnboardingScreen() {
  const [inputNumber, setInputNumber] = useState('');
  const router = useRouter();
  const { setPhoneNumber } = useZenvy();

  const handleContinue = () => {
    if (inputNumber.length >= 10) {
      setPhoneNumber(inputNumber);
      router.push('/verify');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-white max-w-lg mx-auto w-full"
    >
      <div className="h-[45vh] w-full relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=1000&auto=format&fit=crop" 
          alt="Lifestyle"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 px-8 pt-10 pb-12 flex flex-col text-center">
        <h2 className="text-sm tracking-[0.3em] uppercase text-[#333333] opacity-60 mb-2 font-serif">ZENVY</h2>
        <h1 className="text-4xl font-serif text-[#333333] mb-4">Welcome to Zenvy</h1>
        <p className="text-gray-500 mb-10 text-sm font-sans">Log in or sign up to shop over 100,000 brands</p>

        <div className="mb-6 text-left">
          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium font-sans">Phone Number</label>
          <div className="flex items-center border-b border-gray-200 focus-within:border-[#333333] transition-colors pb-1">
            <span className="text-gray-400 mr-2 font-sans">{COUNTRY_CODE}</span>
            <input 
              type="tel"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="01XXXXXXX"
              className="flex-1 outline-none text-lg text-[#333333] font-sans"
            />
          </div>
        </div>

        <button 
          onClick={handleContinue}
          className={`w-full py-4 px-6 flex items-center justify-center gap-2 transition-all duration-300 border mb-10 group
            ${inputNumber.length >= 10 
              ? 'bg-[#333333] text-white border-[#333333] hover:bg-white hover:text-[#333333]' 
              : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed text-xs uppercase tracking-widest font-sans'
            }`}
        >
          <span className="font-sans font-medium">Continue</span>
          <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest bg-white px-4 text-gray-400 font-sans">or</div>
        </div>

        <div className="space-y-3">
          <SocialButton icon="apple" label="Continue with Apple" />
          <SocialButton icon="google" label="Continue with Google" />
        </div>
      </div>
    </motion.div>
  );
}

function SocialButton({ icon, label }: { icon: 'apple' | 'google', label: string }) {
  return (
    <button className="w-full py-4 px-6 border border-gray-100 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
      {icon === 'apple' ? (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#333333]"><path d="M17.057 12.064c.018 2.628 2.274 3.504 2.304 3.518-.023.072-.358 1.233-1.18 2.443-.71 1.042-1.446 2.08-2.6 2.102-1.134.02-1.498-.673-2.795-.673-1.298 0-1.704.653-2.78.694-1.116.041-1.95-.11-2.766-1.294-1.674-2.42-1.674-6.22 0-8.64 1.396-1.97 3.44-3.21 5.63-3.21 1.666 0 3.23.86 3.23.86s.76-.86 2.31-.86c1.65 0 3.03.88 3.03.88s-1.84 1.63-1.87 4.19zM15.485 3c-.96.012-1.93.57-2.6 1.348-.68.8-1.24 1.95-1.24 3.1 0 .12.02.24.03.36.16.008.32.012.48.012 1.13 0 2.27-.66 2.94-1.44.68-.8 1.23-1.96 1.23-3.11 0-.092-.01-.184-.02-.27z"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
      )}
      <span className="text-sm font-medium font-sans">{label}</span>
    </button>
  );
}
