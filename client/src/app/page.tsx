"use client";

import { useRouter } from "next/navigation";
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  ChevronRight, 
  ClipboardList 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, setIsAuthOpen } = useAuth();

  const handleStartApply = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      router.push('/apply');
    }
  };

  return (
    <div className="px-6 py-12 md:py-24 max-w-[1280px] mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[10px] font-bold uppercase tracking-widest text-black/60">
            <ShieldCheck size={12} className="text-black" />
            Secure Government Services
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-space font-bold tracking-tighter leading-[0.9] text-black">
            Simplify Your <br />
            <span className="text-black/40">Smart CAF Journey.</span>
          </h1>
          
          <p className="text-lg text-black/60 max-w-[500px] font-light leading-relaxed">
            The most efficient way to manage your administrative files in Italy. 
            Fast, secure, and completely digital.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={handleStartApply}
              className="group flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-[20px] font-bold text-sm hover:scale-105 transition-all shadow-2xl shadow-black/10"
            >
              {user ? 'Continue Application' : 'Start New Application'}
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center justify-center gap-3 bg-black/5 border border-black/10 px-8 py-4 rounded-[20px] font-bold text-sm hover:bg-black/10 transition-all text-black">
              Learn More
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-black/5">
            <div>
              <p className="text-2xl font-space font-bold text-black">15k+</p>
              <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Processed</p>
            </div>
            <div>
              <p className="text-2xl font-space font-bold text-black">99%</p>
              <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Success Rate</p>
            </div>
            <div>
              <p className="text-2xl font-space font-bold text-black">24h</p>
              <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Avg. Response</p>
            </div>
          </div>
        </div>

        <div className="relative mt-8 lg:mt-0 overflow-hidden rounded-[40px]">
          <div className="absolute inset-0 bg-black/5 blur-[80px] pointer-events-none" />
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureCard 
              icon={<FileText className="text-black" />} 
              title="Digital Filing" 
              desc="Upload all documents securely from your phone."
            />
            <FeatureCard 
              icon={<Search className="text-black" />} 
              title="Profile Tracking" 
              desc="Monitor your application journey from your personal profile."
            />
            <FeatureCard 
              icon={<ClipboardList className="text-black" />} 
              title="Smart Forms" 
              desc="Validated fields to ensure zero errors."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-black" />} 
              title="Data Privacy" 
              desc="End-to-end encryption for your sensitive info."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="bg-black/5 border border-black/10 p-6 rounded-[32px] space-y-4 hover:border-black/20 transition-colors">
      <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-1 text-black">
        <h3 className="font-bold text-sm">{title}</h3>
        <p className="text-xs text-black/40 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
