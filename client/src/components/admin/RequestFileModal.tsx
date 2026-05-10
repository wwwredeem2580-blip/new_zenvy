import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Loader2, Send } from 'lucide-react';
import { applicationApi } from '@/lib/api/applicationApi';
import { toast } from 'sonner';

interface RequestFileModalProps {
  applicationId: string;
  onClose: () => void;
  onRequested: () => void;
  initialName?: string;
  initialNote?: string;
}

export const RequestFileModal: React.FC<RequestFileModalProps> = ({ applicationId, onClose, onRequested, initialName = '', initialNote = '' }) => {
  const [name, setName] = useState(initialName);
  const [note, setNote] = useState(initialNote);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    try {
      await applicationApi.requestFile(applicationId, name, note);
      toast.success('File request sent to user.');
      onRequested();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to request file.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-sm w-full max-w-lg p-8 space-y-8 shadow-2xl relative border border-black/10"
      >
        <button onClick={onClose} className="absolute right-6 top-6 p-2 hover:bg-black/5 rounded-sm transition-colors">
          <X size={20} />
        </button>

        <div className="space-y-1">
          <h3 className="text-xl font-space font-bold uppercase tracking-tighter">Request Document.</h3>
          <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Ask the client to provide specific evidence</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Document Name</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
              <input 
                type="text"
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Passport Copy, Bank Statement..."
                className="w-full bg-black/5 border border-black/5 rounded-sm pl-12 pr-4 py-4 text-sm focus:outline-none focus:bg-black/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-black/40">Note / Reason (Optional)</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explain why this document is needed..."
              rows={3}
              className="w-full bg-black/5 border border-black/5 rounded-sm px-4 py-4 text-sm focus:outline-none focus:bg-black/10 transition-all resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !name}
            className="w-full bg-black text-white py-4 rounded-sm font-bold text-[10px] tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-20 flex items-center justify-center gap-3"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Send Request
          </button>
        </form>
      </motion.div>
    </div>
  );
};
