import { motion } from "motion/react";
import { ArrowLeft, LayoutDashboard, Settings, Users, FileText } from "lucide-react";

export default function AdminPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="px-6 py-12 max-w-[1280px] mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-black/40 hover:text-black mb-8 transition-colors font-bold uppercase tracking-widest text-[10px]"
      >
        <ArrowLeft size={14} /> Back to Home
      </button>

      <div className="flex justify-between items-end mb-12">
        <div className="space-y-4">
          <h2 className="text-4xl font-space font-bold tracking-tighter">Admin Dashboard</h2>
          <p className="text-black/60 max-w-[500px]">Manage applications, subagents, and portal settings.</p>
        </div>
        <div className="flex gap-4">
           <button className="p-3 bg-black/5 rounded-xl hover:bg-black/10 transition-colors">
              <Settings size={20} />
           </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
         <AdminStatCard icon={<FileText />} label="Pending Applications" value="124" />
         <AdminStatCard icon={<Users />} label="Subagents Active" value="12" />
         <AdminStatCard icon={<LayoutDashboard />} label="App Success Rate" value="98.2%" />
      </div>

      <div className="mt-12 p-8 bg-black/5 border border-black/10 rounded-[32px]">
        <h3 className="font-bold mb-6">Recent Activity</h3>
        <div className="space-y-4 text-sm text-black/40 italic">
          Admin metrics and subagent management (Phase 2 & 11)
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ icon, label, value }: any) {
  return (
    <div className="p-6 bg-white border border-black/5 rounded-[24px] shadow-sm">
      <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center mb-4 text-black/60">
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">{label}</p>
      <p className="text-3xl font-space font-bold mt-1">{value}</p>
    </div>
  );
}
