import { motion } from "motion/react";
import { ArrowLeft, Search, Clock, CheckCircle2 } from "lucide-react";

export default function TrackPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="px-6 py-12 max-w-[1280px] mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-black/40 hover:text-black mb-8 transition-colors font-bold uppercase tracking-widest text-[10px]"
      >
        <ArrowLeft size={14} /> Back to Home
      </button>

      <div className="max-w-[600px] space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-space font-bold tracking-tighter">Track Application</h2>
          <p className="text-black/60">Enter your application ID or email to check your current status.</p>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
            <input 
              type="text" 
              placeholder="Application ID (ex: CAF-123456)"
              className="w-full pl-12 pr-4 py-4 bg-black/5 border border-black/10 rounded-2xl focus:outline-none focus:border-black/20 transition-colors"
            />
          </div>
          <button className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform">
            Search
          </button>
        </div>

        <div className="pt-12 space-y-6">
           <h3 className="text-[10px] uppercase tracking-widest font-bold text-black/40">Status Legend</h3>
           <div className="grid grid-cols-2 gap-4">
             <div className="flex items-center gap-3 p-4 bg-black/5 rounded-2xl border border-black/5">
                <Clock size={18} className="text-black/40" />
                <span className="text-sm font-bold">Pending</span>
             </div>
             <div className="flex items-center gap-3 p-4 bg-black/5 rounded-2xl border border-black/5">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="text-sm font-bold">Approved</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
