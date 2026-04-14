"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User as UserIcon, 
  CreditCard, 
  FileText, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  ArrowLeft,
  X,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Hash,
  Home,
  Loader2,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";
import { mockApi, User } from "../lib/api/mockApi";
import { Application, ApplicationStatus } from "../data/applications";

export default function ProfilePage({ onBack, user }: { onBack: () => void; user: User }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    loadUserApplications();
  }, [user]);

  const loadUserApplications = async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.getApplicationsByEmail(user.email);
      setApplications(data);
    } catch (error) {
      console.error("Failed to load user applications", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amt);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-space font-bold tracking-tighter">My Dashboard.</h1>
          <p className="text-sm text-black/40 font-medium">Manage your personal account and track applications.</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/40 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} /> Back to Portal
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Col: Account Info & Balance */}
        <div className="space-y-8">
          {/* Virtual Credit Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-64 w-full bg-[#111] rounded-[32px] p-8 overflow-hidden shadow-2xl flex flex-col justify-between group"
          >
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="waves" width="100" height="20" patternUnits="userSpaceOnUse">
                            <path d="M0 10 Q 25 0, 50 10 T 100 10" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#waves)" />
                </svg>
            </div>

            <div className="relative flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">My Balance</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-space font-bold text-white tracking-tighter">
                        {formatCurrency(user.balance)}
                    </span>
                    <TrendingUp size={14} className="text-green-400" />
                </div>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                <div className="flex gap-0.5">
                    <div className="w-1.5 h-3 bg-white/20 rounded-full" />
                    <div className="w-1.5 h-3 bg-white/40 rounded-full" />
                    <div className="w-1.5 h-3 bg-white/60 rounded-full" />
                </div>
              </div>
            </div>

            <div className="relative space-y-4">
               <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold">
                 Show account balance in EUR <ChevronRight size={10} className="rotate-90" />
               </div>
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                     <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Account Holder</p>
                     <p className="text-sm text-white font-medium tracking-tight uppercase">{user.firstName} {user.lastName}</p>
                  </div>
                  <div className="flex -space-x-2">
                     <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" />
                     <div className="w-8 h-8 rounded-full border border-white/10 bg-white/20 backdrop-blur-sm" />
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Quick Info Card */}
          <div className="bg-black/5 border border-black/5 rounded-[32px] p-8 space-y-6">
             <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Profile Summary</p>
                <h3 className="text-xl font-space font-bold">Account Details.</h3>
             </div>
             <div className="space-y-4">
                <InfoRow icon={<UserIcon size={14} />} label="Full Name" value={`${user.firstName} ${user.lastName}`} />
                <InfoRow icon={<Mail size={14} />} label="Email Address" value={user.email} />
                <InfoRow icon={<Hash size={14} />} label="Member ID" value={`#${user.id}`} />
                <InfoRow icon={<Calendar size={14} />} label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
             </div>
          </div>
        </div>

        {/* Right Col: Applications List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-space font-bold tracking-tight">Recent Applications.</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Status Updates
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 size={48} className="animate-spin text-black/10" />
              <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Fetching your records...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-black/5 rounded-[40px] space-y-4 group">
               <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={32} className="text-black/20" />
               </div>
               <div className="text-center">
                  <p className="font-bold text-sm">No applications found</p>
                  <p className="text-xs text-black/40">You haven't submitted any applications yet.</p>
               </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {applications.map((app) => (
                <motion.div
                  key={app.id}
                  layoutId={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="bg-white border border-black/5 p-5 rounded-[24px] flex items-center justify-between cursor-pointer hover:border-black/20 hover:shadow-xl hover:shadow-black/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-bold text-lg rotate-3 group-hover:rotate-0 transition-transform">
                      {app.selectedServices[0]?.name[0] || "A"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm truncate max-w-[200px]">{app.selectedServices.map(s => s.name).join(", ")}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-black/40">ID: #{app.id}</span>
                        <div className="w-1 h-1 rounded-full bg-black/10" />
                        <span className="text-[9px] uppercase tracking-widest font-bold text-black/40">{new Date(app.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <StatusBadge status={app.status} />
                    <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                        <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[300] flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-white border-l border-black/5 shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-space font-bold tracking-tighter uppercase">Document Details.</h2>
                <button 
                    onClick={() => setSelectedApp(null)} 
                    className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-12">
                {/* Status Hero */}
                <div className="bg-black/5 p-8 rounded-[40px] flex items-center justify-between">
                   <div>
                       <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-black/40 mb-2">Application Status</p>
                       <p className="text-3xl font-space font-bold tracking-tighter uppercase">{selectedApp.status}</p>
                   </div>
                   <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-lg border border-black/5">
                        {selectedApp.status === "Approved" ? <CheckCircle2 size={32} className="text-green-500" /> : <Clock size={32} className="text-black/20" />}
                   </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-8">
                  <DetailItem icon={<UserIcon size={14}/>} label="Full Name" value={selectedApp.name} />
                  <DetailItem icon={<Calendar size={14}/>} label="DOB" value={selectedApp.dob} />
                  <DetailItem icon={<MapPin size={14}/>} label="Place of Birth" value={selectedApp.pob} />
                  <DetailItem icon={<Globe size={14}/>} label="Nationality" value={selectedApp.nationality} />
                  <DetailItem icon={<Hash size={14}/>} label="Codice Fiscale" value={selectedApp.codiceFiscale} />
                  <DetailItem icon={<Phone size={14}/>} label="Phone" value={selectedApp.phone} />
                  <DetailItem icon={<Mail size={14}/>} label="Email" value={selectedApp.email} />
                  <DetailItem icon={<Home size={14}/>} label="Address" value={selectedApp.address} />
                </div>

                {/* Services Section */}
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-black/40">Included Services</h3>
                  <div className="space-y-2">
                    {selectedApp.selectedServices.map((s, i) => (
                      <div key={i} className="flex justify-between items-center p-5 bg-black/[0.02] border border-black/5 rounded-[24px] hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all">
                        <div className="space-y-1">
                            <span className="block font-bold text-sm">{s.name}</span>
                            <span className="flex items-center gap-1 text-[8px] uppercase tracking-widest font-bold text-black/40">
                                <Clock size={10} /> {s.duration}
                            </span>
                        </div>
                        <span className="text-xl font-space font-bold">€{s.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Preview Placeholder */}
                <div className="space-y-4">
                   <h3 className="text-[10px] uppercase tracking-widest font-bold text-black/40">Attached Documents</h3>
                   <div className="grid grid-cols-2 gap-4">
                      {["Passport Scan", "Codice Fiscale"].map(doc => (
                         <div key={doc} className="group p-4 bg-black/5 border border-black/5 rounded-2xl flex items-center gap-4 hover:bg-black hover:text-white transition-all cursor-pointer">
                            <div className="w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center">
                                <FileText size={18} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{doc}</span>
                         </div>
                      ))}
                   </div>
                </div>
                
                <div className="pt-8 block">
                    <button 
                        onClick={() => setSelectedApp(null)}
                        className="w-full bg-black text-white py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:scale-105 transition-all shadow-2xl shadow-black/20"
                    >
                        Close Detail View
                    </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ icon, label, value }: any) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-black/40 group-hover:bg-black group-hover:text-white transition-all">
                {icon}
            </div>
            <div>
                <p className="text-[8px] uppercase tracking-widest font-bold text-black/20">{label}</p>
                <p className="text-[11px] font-bold text-black/80">{value}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
    const styles = {
      Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      Reviewing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Approved: "bg-green-500/10 text-green-500 border-green-500/20",
      Rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    };
  
    const icons = {
      Pending: <Clock size={12} />,
      Reviewing: <Search size={12} />,
      Approved: <CheckCircle2 size={12} />,
      Rejected: <AlertCircle size={12} />,
    };
  
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${styles[status]}`}>
        {icons[status]}
        {status}
      </div>
    );
}

function DetailItem({ icon, label, value }: any) {
    return (
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 flex items-center gap-2">
          {icon} {label}
        </p>
        <p className="text-sm font-medium text-black/80">{value || "N/A"}</p>
      </div>
    );
}
