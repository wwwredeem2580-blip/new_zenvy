"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  Banknote, 
  Check, 
  X, 
  QrCode, 
  Info,
  ChevronRight,
  PhoneCall,
  Clock
} from "lucide-react";

export type PaymentMethod = 'Cash' | 'Revolut' | 'PostPay' | 'Card';

interface PaymentSelectionProps {
  amount: number;
  onSuccess: (method: PaymentMethod) => void;
  onCancel: () => void;
}

export default function PaymentSelection({ amount, onSuccess, onCancel }: PaymentSelectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!selectedMethod) return;
    setIsProcessing(true);
    // Simulate a brief processing for premium feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSuccess(selectedMethod);
  };

  const methods = [
    {
      id: 'Cash',
      name: 'Cash Payment',
      icon: <Banknote size={24} />,
      desc: 'Pay in person to our agent',
      color: 'bg-green-500/10 text-green-500',
      instruction: "Available: Agent will call you shortly for collection confirmation."
    },
    {
      id: 'Revolut',
      name: 'Revolut',
      icon: <Smartphone size={24} />,
      desc: 'Instant transfer via Revolut',
      color: 'bg-blue-500/10 text-blue-500',
      instruction: "Instant: Send money to our Revolut account via QR or ID."
    },
    {
      id: 'PostPay',
      name: 'PostPay',
      icon: <Clock size={24} />,
      desc: 'Pay later using PostPay',
      color: 'bg-orange-500/10 text-orange-500',
      instruction: "Flexible: Complete your payment within 48 hours."
    },
    {
      id: 'Card',
      name: 'Direct Card Transfer',
      icon: <CreditCard size={24} />,
      desc: 'Send money to our card',
      color: 'bg-purple-500/10 text-purple-500',
      instruction: "Manual: View our card details and follow instructions."
    }
  ];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onCancel}
      />
      
      <motion.div 
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-surface border border-border rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        <div className="w-full md:w-5/12 bg-bg/50 p-8 border-b md:border-b-0 md:border-r border-border">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Application Total</p>
              <h2 className="text-4xl font-space font-bold text-text">€{amount.toFixed(2)}</h2>
            </div>
            
            <div className="pt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-text/5 flex items-center justify-center text-text shrink-0">
                  <Info size={12} />
                </div>
                <p className="text-[10px] text-muted leading-relaxed uppercase tracking-wider font-medium">
                  {selectedMethod ? "Follow the selected method's instructions to complete your application." : "Please select a payment method to proceed."}
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onCancel}
            className="absolute bottom-8 left-8 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors flex items-center gap-2"
          >
            <X size={14} /> Cancel
          </button>
        </div>

        <div className="w-full md:w-7/12 p-8">
           <h3 className="text-xl font-space font-bold mb-6">Payment Method.</h3>
           
           <div className="grid grid-cols-1 gap-3">
             {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    selectedMethod === method.id 
                      ? "bg-text text-bg border-text shadow-xl scale-[1.02]" 
                      : "bg-surface border-border hover:border-text/20 hover:bg-text/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedMethod === method.id ? 'bg-bg text-text' : method.color}`}>
                      {method.icon}
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-sm tracking-tight">{method.name}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${selectedMethod === method.id ? 'opacity-60' : 'text-muted'}`}>{method.desc}</span>
                    </div>
                  </div>
                  {selectedMethod === method.id && <Check size={18} />}
                </button>
             ))}
           </div>

           <AnimatePresence mode="wait">
             {selectedMethod && (
               <motion.div
                 key={selectedMethod}
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 className="mt-6 p-4 rounded-2xl bg-text/5 border border-text/10"
               >
                 {selectedMethod === 'Cash' && (
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                         <PhoneCall size={14} />
                      </div>
                      <p className="text-xs leading-relaxed">
                        <span className="font-bold block mb-1">Cash Collection</span>
                        Thanks for your application, you will get a call from an agent soon for confirmation.
                      </p>
                    </div>
                 )}
                 {selectedMethod === 'Revolut' && (
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start text-xs leading-relaxed">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                           <QrCode size={14} />
                        </div>
                        <div>
                          <span className="font-bold block mb-1">Revolut Transfer</span>
                          Send €{amount.toFixed(2)} to <span className="font-bold">@smartcaf_biz</span> or scan the QR code.
                        </div>
                      </div>
                      <div className="flex justify-center p-4 bg-white rounded-xl">
                         <div className="w-32 h-32 bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 rounded-lg">
                            <QrCode size={64} />
                         </div>
                      </div>
                    </div>
                 )}
                 {selectedMethod === 'PostPay' && (
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
                         <Clock size={14} />
                      </div>
                      <p className="text-xs leading-relaxed">
                        <span className="font-bold block mb-1">PostPay (Pay Later)</span>
                        You have chosen to pay later. Your application will be processed once payment is received.
                      </p>
                    </div>
                 )}
                 {selectedMethod === 'Card' && (
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
                         <CreditCard size={14} />
                      </div>
                      <div className="text-xs leading-relaxed">
                        <span className="font-bold block mb-1">Direct Card Transfer</span>
                        Follow these instructions:
                        <ul className="list-disc list-inside mt-1 space-y-1 opacity-80">
                          <li>Send to IBAN: <span className="font-bold">IT60 X 05034 01234 0000 12345678</span></li>
                          <li>Recipient: Smart CAF Services</li>
                          <li>Reference: YOUR_APPLICATION_ID</li>
                        </ul>
                      </div>
                    </div>
                 )}
               </motion.div>
             )}
           </AnimatePresence>

           <div className="mt-8">
             <button
                disabled={!selectedMethod || isProcessing}
                onClick={handleConfirm}
                className="w-full bg-text text-bg py-4 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-3 drop-shadow-2xl"
             >
                {isProcessing ? "Processing..." : `Confirm & Submit Application`}
                <ChevronRight size={18} />
             </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
