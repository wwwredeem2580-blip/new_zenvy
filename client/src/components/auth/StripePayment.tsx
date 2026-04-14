"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  Info, 
  Check, 
  Loader2,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

interface StripePaymentProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripePayment({ amount, onSuccess, onCancel }: StripePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: ""
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Basic formatting for demo
    let formattedValue = value;
    if (name === 'cardNumber') {
        formattedValue = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    if (name === 'expiry') {
        formattedValue = value.replace(/(\d{2})(\d{1,2})/, '$1/$2').substr(0, 5);
    }
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    setIsSuccess(true);
    
    // Final delay before completion
    await new Promise(resolve => setTimeout(resolve, 2000));
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#F6F9FC] backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.98 }}
        className="relative w-full max-w-[900px] h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side: Order Summary */}
        <div className="md:w-5/12 bg-[#F6F9FC] p-8 border-r border-[#E6EBF1] flex flex-col">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">C</div>
            <span className="font-bold text-sm tracking-tight">Smart CAF Business</span>
          </div>

          <div className="space-y-6 flex-1">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#697386]">Pay Smart CAF</p>
              <h2 className="text-4xl font-space font-bold text-[#32325d]">€{amount.toFixed(2)}</h2>
            </div>
            
            <div className="space-y-4 pt-12">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-[#697386]">Services Fee</span>
                  <span className="font-bold text-[#32325d]">€{amount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-[#697386]">Taxes</span>
                  <span className="font-bold text-[#32325d]">€0.00</span>
               </div>
               <div className="h-px bg-[#E6EBF1] my-4" />
               <div className="flex justify-between items-center">
                  <span className="font-bold text-[#32325d]">Total Due</span>
                  <span className="font-bold text-[#32325d] text-lg">€{amount.toFixed(2)}</span>
               </div>
            </div>
          </div>

          <button 
            onClick={onCancel}
            disabled={isProcessing}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#697386] hover:text-[#32325d] transition-colors"
          >
            <ChevronLeft size={14} /> Back to Application
          </button>
        </div>

        {/* Right Side: Payment Form */}
        <div className="md:w-7/12 p-12 bg-white relative">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-1">
                   <h3 className="text-xl font-bold text-[#32325d]">Pay with card</h3>
                   <p className="text-xs text-[#697386]">Enter your payment details below</p>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#697386]">Card Information</label>
                        <div className="relative">
                           <input 
                             type="text"
                             name="cardNumber"
                             placeholder="1234 5678 9012 3456"
                             value={formData.cardNumber}
                             onChange={handleInput}
                             maxLength={19}
                             required
                             className="w-full border border-[#E6EBF1] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#586ada] transition-all"
                           />
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                             <CreditCard size={18} className="text-[#697386]" />
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <input 
                             type="text"
                             name="expiry"
                             placeholder="MM / YY"
                             value={formData.expiry}
                             onChange={handleInput}
                             maxLength={5}
                             required
                             className="w-1/2 border border-[#E6EBF1] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#586ada] transition-all"
                           />
                           <input 
                             type="text"
                             name="cvc"
                             placeholder="CVC"
                             value={formData.cvc}
                             onChange={handleInput}
                             maxLength={4}
                             required
                             className="w-1/2 border border-[#E6EBF1] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#586ada] transition-all"
                           />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[10px] uppercase tracking-widest font-bold text-[#697386]">Name on Card</label>
                         <input 
                           type="text"
                           name="name"
                           placeholder="John Doe"
                           value={formData.name}
                           onChange={handleInput}
                           required
                           className="w-full border border-[#E6EBF1] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#586ada] transition-all"
                         />
                      </div>
                   </div>

                   <button 
                     type="submit"
                     disabled={isProcessing}
                     className="w-full bg-[#5469d4] hover:bg-[#32325d] text-white py-4 rounded-lg font-bold text-sm shadow-lg hover:translate-y-[-1px] active:translate-y-[0px] transition-all flex items-center justify-center gap-3 disabled:bg-[#a3acb9] disabled:translate-y-0"
                   >
                     {isProcessing ? (
                       <Loader2 size={18} className="animate-spin" />
                     ) : (
                       <>Pay €{amount.toFixed(2)} <ChevronRight size={18} /></>
                     )}
                   </button>
                </form>

                <div className="flex items-center justify-center gap-1.5 text-[9px] text-[#697386] font-medium uppercase tracking-[0.2em]">
                   <Lock size={10} /> Secure payment by 
                   <span className="font-bold text-[#32325d] flex items-center gap-0.5">
                     <div className="w-1.5 h-1.5 bg-[#5469d4] rounded-full" />
                     Stripe
                   </span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-20 h-20 bg-[#5469d4] text-white rounded-full flex items-center justify-center shadow-2xl">
                   <motion.div
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     transition={{ delay: 0.2 }}
                   >
                     <Check size={40} strokeWidth={4} />
                   </motion.div>
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-bold text-[#32325d]">Payment Successful</h3>
                   <p className="text-sm text-[#697386]">Your application is being submitted...</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#f6f9fc] rounded-full text-[10px] text-[#5469d4] font-bold uppercase tracking-widest border border-[#e6ebf1]">
                   Redirecting in 2s
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Branding */}
          <div className="absolute bottom-8 left-0 w-full px-12 flex justify-between items-center text-[10px] text-[#697386] font-medium opacity-40">
             <div className="flex gap-4">
                <span>Terms</span>
                <span>Privacy</span>
             </div>
             <div className="flex items-center gap-1">
                Powered by <b>Stripe</b>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
