import { motion } from "motion/react";
import { ArrowLeft, Send } from "lucide-react";

export default function ApplicationForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="px-6 py-12 max-w-[1280px] mx-auto">
      <button 
        onClick={onClose}
        className="flex items-center gap-2 text-black/40 hover:text-black mb-8 transition-colors font-bold uppercase tracking-widest text-[10px]"
      >
        <ArrowLeft size={14} /> Back to Home
      </button>

      <div className="space-y-4">
        <h2 className="text-4xl font-space font-bold tracking-tighter">Start Application</h2>
        <p className="text-black/60 max-w-[500px]">Complete the multi-step form below to submit your CAF application.</p>
      </div>

      <div className="mt-12 p-12 bg-black/5 border border-black/10 rounded-[32px] text-center space-y-6">
        <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto">
          <Send size={24} />
        </div>
        <p className="text-black/40 font-bold uppercase tracking-widest text-[10px]">Step 1: Basic Information</p>
        <div className="h-48 border-2 border-dashed border-black/10 rounded-2xl flex items-center justify-center text-black/20 italic">
          Application Form Fields (Phase 9)
        </div>
        <button className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-sm hover:scale-105 transition-transform">
          Continue
        </button>
      </div>
    </div>
  );
}
