import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, AlertCircle, Euro } from 'lucide-react';
import { Application } from '../../data/applications';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (refundData: { amount: number, type: 'Full' | 'Partial' }) => void;
  application: Application;
}

export function RefundModal({ isOpen, onClose, onConfirm, application }: RefundModalProps) {
  const services = application?.selectedServices || [];
  const totalAmount = services.reduce((sum, s) => sum + s.price, 0);
  const [refundType, setRefundType] = useState<'Full' | 'Partial'>('Full');
  const [partialAmount, setPartialAmount] = useState<string>(totalAmount.toString());
  const [error, setError] = useState<string | null>(null);

  // Sync partialAmount when totalAmount changes (e.g. when application is finally loaded)
  React.useEffect(() => {
    if (isOpen) {
      setPartialAmount(totalAmount.toString());
      setError(null);
    }
  }, [isOpen, totalAmount]);

  const handleConfirm = () => {
    const amount = refundType === 'Full' ? totalAmount : parseFloat(partialAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    if (amount > totalAmount) {
      setError(`Refund cannot exceed the total paid amount (€${totalAmount}).`);
      return;
    }

    onConfirm({
      amount,
      type: refundType
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-space font-bold tracking-tighter uppercase">Issue Refund.</h2>
                <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Application {application.id}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Total Summary */}
              <div className="bg-black/5 p-6 rounded-[32px] flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Total Paid</p>
                  <p className="text-3xl font-space font-bold">€{totalAmount}</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Euro size={24} className="text-black/20" />
                </div>
              </div>

              {/* Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setRefundType('Full');
                    setPartialAmount(totalAmount.toString());
                    setError(null);
                  }}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${refundType === 'Full' ? 'border-black bg-black text-white' : 'border-black/5 bg-white text-black/40 hover:border-black/20'}`}
                >
                  <Check size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Full Refund</span>
                </button>
                <button
                  onClick={() => setRefundType('Partial')}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${refundType === 'Partial' ? 'border-black bg-black text-white' : 'border-black/5 bg-white text-black/40 hover:border-black/20'}`}
                >
                  <Euro size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Partial</span>
                </button>
              </div>

              {refundType === 'Partial' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] uppercase tracking-widest font-bold text-black/40 ml-4">Refund Amount (€)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={partialAmount}
                      onChange={(e) => {
                        setPartialAmount(e.target.value);
                        setError(null);
                      }}
                      className="w-full bg-black/5 border-none rounded-[20px] px-6 py-4 font-space font-bold text-xl focus:ring-2 ring-black/5 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-2xl"
                >
                  <AlertCircle size={16} />
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">{error}</p>
                </motion.div>
              )}

              <button
                onClick={handleConfirm}
                className="w-full bg-black text-white py-6 rounded-[32px] font-space font-bold uppercase tracking-widest text-sm hover:scale-[1.02] transition-all"
              >
                Confirm Rejection & Refund
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
