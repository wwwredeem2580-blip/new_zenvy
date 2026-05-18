"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronLeft, RotateCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { COUNTRY_CODE } from '@/data/constants';
import { useZenvy } from '@/context/ZenvyContext';
import { toast } from 'sonner';

export default function OtpScreen() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { phoneNumber } = useZenvy();

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    setCountdown(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '').slice(-1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    
    // Clear inputs and refocus
    setOtp(['', '', '', '']);
    setTimeout(() => {
      document.getElementById('otp-0')?.focus();
    }, 50);

    // Trigger toast success
    toast.success("Verification code resent!", {
      description: "A new 4-digit code has been successfully dispatched to your phone.",
      duration: 4000,
    });

    // Restart timer
    startTimer();
  };

  const isComplete = otp.every(v => v !== '');

  const handleVerify = () => {
    if (isComplete) {
      router.push('/setup-store');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-white p-8 max-w-lg mx-auto w-full select-none"
    >
      <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center -ml-2 mb-8 hover:bg-gray-50 rounded-full transition-colors">
        <ChevronLeft size={24} />
      </button>

      <h1 className="text-4xl font-serif text-[#333333] mb-4">Verify Phone</h1>
      <p className="text-gray-500 mb-10 text-sm leading-relaxed font-sans">
        We've sent a code via SMS to <span className="text-[#333333] font-medium font-sans">{COUNTRY_CODE} {phoneNumber}</span>
      </p>

      <div className="flex justify-between mb-10 gap-4">
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="tel"
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-16 h-20 text-3xl text-center border-b-2 border-gray-100 focus:border-[#333333] outline-none transition-colors font-sans"
            autoFocus={i === 0}
          />
        ))}
      </div>

      <button 
        onClick={handleVerify}
        className={`w-full py-4 px-6 flex items-center justify-center gap-2 transition-all duration-300 border mb-8 group
          ${isComplete 
            ? 'bg-[#333333] text-white border-[#333333] hover:bg-white hover:text-[#333333]' 
            : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
          }`}
        disabled={!isComplete}
      >
        <span className="font-sans font-medium">Verify Code</span>
        <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="flex flex-col items-center gap-4 text-sm font-medium mt-2">
        {countdown > 0 ? (
          <div className="flex items-center gap-2 text-gray-400 font-sans cursor-not-allowed select-none py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Resend code in 0:{countdown < 10 ? `0${countdown}` : countdown}s</span>
          </div>
        ) : (
          <button 
            onClick={handleResend}
            className="text-[#333333] hover:text-black hover:underline transition-all font-sans flex items-center gap-1.5 active:scale-95 py-1"
          >
            <RotateCw size={14} className="stroke-[2.5]" />
            <span>Resend code</span>
          </button>
        )}
        <button onClick={() => router.push('/onboarding')} className="text-gray-400 hover:text-[#333333] transition-colors font-sans py-1">Change number</button>
      </div>
    </motion.div>
  );
}
