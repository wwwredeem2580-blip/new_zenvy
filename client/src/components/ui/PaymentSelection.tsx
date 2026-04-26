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
  ChevronLeft,
  PhoneCall,
  Clock,
  Copy,
  Receipt,
  AlertCircle
} from "lucide-react";

export type PaymentMethod = 'Cash' | 'Revolut' | 'PostPay' | 'Card';

interface PaymentSelectionProps {
  amount: number;
  onSuccess: (method: PaymentMethod, transactionId?: string) => void;
  onCancel: () => void;
}

function CopyButton({ text, label }: { text: string, label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border ${
        copied 
          ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20' 
          : 'bg-white border-border hover:border-text/20 text-text/60 hover:text-text'
      }`}
    >
      {label && <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>}
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

export default function PaymentSelection({ amount, onSuccess, onCancel }: PaymentSelectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [transactionId, setTransactionId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!selectedMethod) return;
    setIsProcessing(true);
    // Simulate a brief processing for premium feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSuccess(selectedMethod, transactionId);
  };

  const methods = [
    {
      id: 'Cash',
      name: 'Cash Payment',
      icon: <Banknote size={24} />,
      desc: 'Pay in person to our agent',
      color: 'bg-green-500/10 text-green-500',
    },
    {
      id: 'Revolut',
      name: 'Revolut',
      icon: <Smartphone size={24} />,
      desc: 'Instant transfer via Revolut',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      id: 'PostPay',
      name: 'PostPay',
      icon: <Clock size={24} />,
      desc: 'Pay later using PostPay',
      color: 'bg-orange-500/10 text-orange-500',
    },
    {
      id: 'Card',
      name: 'Direct Card Transfer',
      icon: <CreditCard size={24} />,
      desc: 'Send money to our card',
      color: 'bg-purple-500/10 text-purple-500',
    }
  ];

  const currentMethodData = methods.find(m => m.id === selectedMethod);
  const needsTransactionId = selectedMethod === 'Revolut' || selectedMethod === 'Card';

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
        className="relative w-full max-w-2xl bg-surface border border-border rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[450px]"
      >
        <div className="w-full md:w-5/12 bg-bg/50 p-8 border-b md:border-b-0 md:border-r border-border flex flex-col justify-between">
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
                  {step === 1 ? "Select a method to proceed." : step === 2 ? `Follow ${selectedMethod} steps.` : "Verify your transaction."}
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={step > 1 ? () => setStep((step - 1) as any) : onCancel}
            className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors flex items-center gap-2 pt-8"
          >
            {step > 1 ? <><ChevronLeft size={14} /> Back</> : <><X size={14} /> Cancel</>}
          </button>
        </div>

        <div className="w-full md:w-7/12 p-8 flex flex-col">
           <AnimatePresence mode="wait">
             {step === 1 ? (
               <motion.div
                 key="step1"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="flex-1 flex flex-col"
               >
                 <h1 className="text-xl font-space font-bold mb-6">Payment Method.</h1>
                 
                 <div className="grid grid-cols-1 gap-3 flex-1">
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

                 <div className="mt-8">
                   <button
                      disabled={!selectedMethod}
                      onClick={() => setStep(2)}
                      className="w-full bg-text text-bg py-4 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-xl"
                   >
                      Continue to Instructions <ChevronRight size={18} />
                   </button>
                 </div>
               </motion.div>
             ) : step === 2 ? (
               <motion.div
                 key="step2"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="flex-1 flex flex-col"
               >
                 <h1 className="text-xl font-space font-bold mb-6 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentMethodData?.color}`}>
                      {currentMethodData?.icon}
                    </div>
                    Instructions.
                 </h1>

                 <div className="p-6 rounded-3xl bg-text/5 border border-text/10 flex-1 space-y-6">
                   {selectedMethod === 'Cash' && (
                      <div className="flex gap-4 items-start h-full flex-col justify-center text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0 mx-auto">
                           <PhoneCall size={32} />
                        </div>
                        <div className="space-y-2">
                          <span className="font-bold text-lg block">Agent Call-back</span>
                          <p className="text-xs leading-relaxed opacity-60">
                            An agent will call you at your provided number shortly to finalize the cash collection.
                          </p>
                        </div>
                      </div>
                   )}
                   {selectedMethod === 'Revolut' && (
                      <div className="space-y-8">
                        <div className="flex justify-center flex-col items-center gap-4 text-center">
                           <div className="w-28 h-28 bg-white p-4 rounded-3xl shadow-inner border border-border flex items-center justify-center">
                              <QrCode size={70} strokeWidth={1} />
                           </div>
                           <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Scan to pay €{amount.toFixed(2)}</p>
                        </div>

                        <div className="space-y-3">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Recipient RevTag</p>
                           <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border group hover:border-blue-500/30 transition-colors">
                              <span className="font-bold text-sm tracking-tight text-blue-600">@smartcaf_biz</span>
                              <CopyButton text="@smartcaf_biz" label="Copy Tag" />
                           </div>
                        </div>
                      </div>
                   )}
                   {selectedMethod === 'PostPay' && (
                      <div className="flex gap-4 items-start h-full flex-col justify-center text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0 mx-auto">
                           <Clock size={32} />
                        </div>
                        <div className="space-y-2">
                          <span className="font-bold text-lg block">PostPay Processing</span>
                          <p className="text-xs leading-relaxed opacity-60">
                            Your application will be locked until payment is confirmed via our physical terminal (within 48 hours).
                          </p>
                        </div>
                      </div>
                   )}
                   {selectedMethod === 'Card' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Recipient IBAN</p>
                           <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border">
                              <span className="font-mono text-xs font-bold truncate pr-2">IT60 X 05034 01234 0000 1234</span>
                              <div className="shrink-0"><CopyButton text="IT60 X 05034 01234 0000 1234" /></div>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Recipient Name</p>
                           <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border">
                              <span className="font-bold text-xs">Smart CAF Solutions S.r.l.</span>
                              <CopyButton text="Smart CAF Solutions S.r.l." />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Payment Reference</p>
                           <p className="text-[8px] text-orange-500 font-bold uppercase mb-1">Important: Include this in transfer note</p>
                           <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border">
                              <span className="font-bold text-xs opacity-60 tracking-wider">CAF_{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                              <CopyButton text="CAF_GENERIC_REF" />
                           </div>
                        </div>
                      </div>
                   )}
                 </div>

                 <div className="mt-8">
                   <button
                      disabled={isProcessing}
                      onClick={needsTransactionId ? () => setStep(3) : handleConfirm}
                      className="group w-full bg-text text-bg py-4 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl"
                   >
                      {needsTransactionId ? (
                        <>I have Made the Payment <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                      ) : (
                        isProcessing ? "Processing..." : `Complete & Submit Application`
                      )}
                   </button>
                 </div>
               </motion.div>
             ) : (
               <motion.div
                 key="step3"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="flex-1 flex flex-col"
               >
                 <h1 className="text-xl font-space font-bold mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Receipt size={18} />
                    </div>
                    Proof of Payment.
                 </h1>

                 <div className="flex-1 space-y-8">
                    <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                       <AlertCircle size={20} className="text-blue-500 shrink-0 mt-1" />
                       <p className="text-[11px] leading-relaxed text-blue-800/80">
                          To speed up your application approval, please provide the <span className="font-bold">Transaction ID</span> or <span className="font-bold">Reference Number</span> from your bank/app receipt.
                       </p>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Transaction ID / Ref Number *</label>
                       <div className="relative">
                          <input 
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                            placeholder="e.g. REV-12345678 or IBAN-REF"
                            className="w-full bg-surface border border-border rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none focus:border-text/30 transition-all placeholder:font-normal placeholder:opacity-30"
                          />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-muted">
                             <Receipt size={20} />
                          </div>
                       </div>
                       <p className="text-[9px] text-muted italic">Paste the transaction hash found in your payment confirmation.</p>
                    </div>
                 </div>

                 <div className="mt-8">
                   <button
                      disabled={!transactionId || isProcessing}
                      onClick={handleConfirm}
                      className="w-full bg-text text-bg py-4 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-xl"
                   >
                      {isProcessing ? "Processing..." : `Verify & Submit Application`}
                      <ChevronRight size={18} />
                   </button>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
