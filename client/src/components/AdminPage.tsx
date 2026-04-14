/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  ArrowUpRight,
  TrendingUp,
  Loader2,
  ChevronRight,
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  MapPin,
  Hash,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Application, ApplicationStatus } from '../data/applications';
import { mockApi, User as UserType } from '../lib/api/mockApi';

type AdminTab = 'Overview' | 'Applications' | 'Users' | 'Analytics' | 'Settings';

export default function AdminPage({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>('Applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'Applications') {
        const data = await mockApi.getApplications();
        setApplications(data);
      } else if (activeTab === 'Users') {
        const data = await mockApi.getUsers();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIssueCredit = async () => {
    if (!selectedUser || !creditAmount || isNaN(parseFloat(creditAmount))) return;
    setIsProcessing(true);
    try {
      await mockApi.addCredits(selectedUser.id, parseFloat(creditAmount));
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, balance: (u.balance || 0) + parseFloat(creditAmount) } : u));
      setIsCreditModalOpen(false);
      setCreditAmount("");
    } catch (error) {
      console.error("Failed to issue credit", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-black font-dm selection:bg-black selection:text-white -mt-24">
      {/* Sidebar - Sesame Minimalist Style */}
      <aside className="w-64 border-r border-black/5 flex flex-col pt-32 px-10 shrink-0">
        <div className="mb-16">
           <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/20">Dashboard</h2>
        </div>
        
        <nav className="flex flex-col gap-6 text-sm font-medium">
           <div className="flex flex-col gap-3">
              <SidebarLink label="Overview" isActive={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
              <SidebarLink label="Applications" isActive={activeTab === 'Applications'} onClick={() => setActiveTab('Applications')} />
              <SidebarLink label="Users" isActive={activeTab === 'Users'} onClick={() => setActiveTab('Users')} />
           </div>
           
           <div className="pt-6 border-t border-black/5 flex flex-col gap-3">
              <div className="text-[10px] uppercase tracking-widest font-bold text-black/20 mb-1">System</div>
              <SidebarLink label="Analytics" isActive={activeTab === 'Analytics'} onClick={() => setActiveTab('Analytics')} />
              <SidebarLink label="Settings" isActive={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
           </div>

           <div className="pt-12">
              <button 
                onClick={onBack}
                className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                Exit Portal
              </button>
           </div>
        </nav>
      </aside>

      {/* Main Workspace - Centered Content */}
      <main className="flex-1 pt-32 pb-24 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-16">
          <header className="mb-24">
             <motion.h1 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               key={activeTab}
               className="text-6xl md:text-8xl font-space font-bold tracking-tighter leading-none mb-6"
             >
               {activeTab}.
             </motion.h1>
             <p className="text-lg text-black/40 font-light max-w-xl leading-relaxed">
               {activeTab === 'Applications' && "Review and manage all incoming service requests from our citizens."}
               {activeTab === 'Users' && "Manage registered user accounts, metadata, and financial credit issuance."}
               {activeTab === 'Overview' && "Real-time metrics and system health indicators at a glance."}
             </p>

             {activeTab === 'Applications' && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="mt-12 flex items-center gap-6"
               >
                  <button className="flex items-center gap-3 px-8 py-4 bg-white border border-black/10 rounded-2xl font-bold text-sm shadow-sm hover:shadow-md transition-all group">
                     Export Records
                     <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
               </motion.div>
             )}
          </header>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 size={32} className="animate-spin text-black/10" />
              <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Syncing with system...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
               >
                  {activeTab === 'Applications' && (
                     <ApplicationsView applications={applications} onSelect={setSelectedApp} />
                  )}
                  {activeTab === 'Users' && (
                     <UsersView 
                       users={users} 
                       onIssueCredit={(u) => {
                         setSelectedUser(u);
                         setIsCreditModalOpen(true);
                       }} 
                     />
                  )}
                  {activeTab === 'Overview' && (
                     <OverviewPlaceholder />
                  )}
                  {(activeTab === 'Analytics' || activeTab === 'Settings') && (
                     <div className="py-24 border-2 border-dashed border-black/5 rounded-[40px] flex flex-col items-center justify-center text-black/20 font-bold uppercase tracking-widest text-[10px]">
                        Module Under Construction
                     </div>
                  )}
               </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Application Detail View - Restored Cleaner/Cooler Style */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[500] flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedApp(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-2xl h-full bg-white shadow-2xl p-12 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                 <h2 className="text-2xl font-space font-bold tracking-tighter uppercase">Application Details.</h2>
                 <button onClick={() => setSelectedApp(null)} className="p-3 hover:bg-black/5 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-12">
                 {/* Status Section */}
                 <section className="bg-black/5 p-8 rounded-[32px] space-y-6">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Current Status</p>
                    <div className="flex flex-wrap gap-2">
                       {(['Pending', 'Reviewing', 'Approved', 'Rejected'] as ApplicationStatus[]).map(s => (
                          <button 
                            key={s} 
                            onClick={() => {
                               mockApi.updateApplicationStatus(selectedApp.id, s);
                               setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: s } : a));
                               setSelectedApp(prev => prev ? { ...prev, status: s } : null);
                            }}
                            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedApp.status === s ? 'bg-black text-white scale-105' : 'bg-white border border-black/5 text-black/40 hover:border-black/20'}`}
                          >
                            {s}
                          </button>
                       ))}
                    </div>
                 </section>

                 {/* Information Grid */}
                 <section className="grid grid-cols-2 gap-8">
                    <DetailItem icon={<User size={14}/>} label="Full Name" value={selectedApp.name} />
                    <EditorialInfo label="Email" value={selectedApp.email} />
                    <DetailItem icon={<Globe size={14}/>} label="Nationality" value={selectedApp.nationality} />
                    <DetailItem icon={<MapPin size={14}/>} label="POB" value={selectedApp.pob} />
                    <DetailItem icon={<Hash size={14}/>} label="ID Number" value={selectedApp.id} />
                    <DetailItem icon={<Calendar size={14}/>} label="Submitted" value={new Date(selectedApp.submittedAt).toLocaleDateString()} />
                 </section>

                 {/* Documents */}
                 <section className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-black/40">Linked Documents</h3>
                    <div className="grid gap-2">
                       {["Passport Scan", "Residence Permit", "Tax Code"].map(doc => (
                          <div key={doc} className="flex items-center gap-4 p-4 bg-black/[0.02] border border-black/5 rounded-2xl group hover:bg-white hover:border-black/20 transition-all cursor-pointer">
                             <FileText size={18} className="text-black/20" />
                             <span className="text-xs font-bold text-black/60 flex-1">{doc}</span>
                             <button className="text-[8px] uppercase font-bold tracking-widest text-black/20 group-hover:text-black">Preview</button>
                          </div>
                       ))}
                    </div>
                 </section>

                 <div className="pt-8">
                    <button onClick={() => setSelectedApp(null)} className="w-full bg-black text-white py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:scale-[1.02] transition-all">
                       Close Details
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Credit Issuance Modal - Re-polished */}
      <AnimatePresence>
        {isCreditModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-xl p-12 space-y-12 shadow-2xl relative"
            >
               <button onClick={() => setIsCreditModalOpen(false)} className="absolute right-8 top-8 p-2 hover:bg-black/5 rounded-full transition-colors"><X size={20} /></button>
               
               <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-black/40 text-center">Financial Action</p>
                  <h3 className="text-4xl font-space font-bold tracking-tighter uppercase text-center">Issue Credits.</h3>
                  <p className="text-sm text-black/40 font-light text-center">Adding funds to <span className="text-black font-bold">{selectedUser.firstName}'s</span> account.</p>
               </div>

               <div className="space-y-8">
                  <div className="space-y-4">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-black/20">Amount in EUR</label>
                     <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 font-space text-2xl font-bold">€</span>
                        <input 
                          type="number" 
                          autoFocus
                          value={creditAmount}
                          onChange={(e) => setCreditAmount(e.target.value)}
                          placeholder="00.00"
                          className="w-full bg-black/5 border border-black/5 rounded-[24px] pl-16 pr-6 py-8 text-4xl font-space font-bold focus:outline-none focus:bg-black/10 transition-all placeholder:text-black/5"
                        />
                     </div>
                  </div>

                  <button 
                    onClick={handleIssueCredit}
                    disabled={isProcessing || !creditAmount}
                    className="w-full bg-black text-white py-6 rounded-[24px] font-bold text-sm tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20 disabled:opacity-20"
                  >
                     {isProcessing ? "Processing..." : "Confirm Credits ↗"}
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarLink({ label, isActive, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`text-left transition-all ${isActive ? 'text-black font-bold scale-105 origin-left' : 'text-black/30 hover:text-black'}`}
    >
      {label}
    </button>
  );
}

function ApplicationsView({ applications, onSelect }: any) {
  const [search, setSearch] = useState("");
  const filtered = applications.filter(app => app.name.toLowerCase().includes(search.toLowerCase()) || app.id.includes(search));

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center border-b border-black/5 pb-12">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-black/20" size={20} />
            <input 
              type="text" 
              placeholder="Filter by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder:text-black/10"
            />
         </div>
      </div>

      <div className="space-y-0.5">
         {filtered.map(app => (
            <motion.div 
               key={app.id} 
               onClick={() => onSelect(app)}
               className="group flex items-center justify-between py-5 px-6 hover:bg-black/[0.02] rounded-2xl transition-all cursor-pointer"
            >
               <div className="flex items-center gap-12">
                  <span className="text-[10px] font-mono font-bold text-black/10">#{app.id}</span>
                  <div className="flex flex-col">
                     <span className="text-lg font-bold">{app.name}</span>
                     <span className="text-[9px] uppercase tracking-widest font-bold text-black/30">{new Date(app.submittedAt).toLocaleDateString()}</span>
                  </div>
               </div>

               <div className="flex items-center gap-12">
                  <StatusPill status={app.status} />
                  <ChevronRight size={16} className="text-black/10 group-hover:text-black transition-all" />
               </div>
            </motion.div>
         ))}
      </div>
    </div>
  );
}

function UsersView({ users, onIssueCredit }: any) {
  const [search, setSearch] = useState("");
  const filtered = users.filter(u => u.firstName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-12">
       <div className="flex justify-between items-center border-b border-black/5 pb-12">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-black/20" size={20} />
            <input 
              type="text" 
              placeholder="Search by user or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder:text-black/10"
            />
         </div>
      </div>

      <div className="space-y-0.5">
         {filtered.map(user => (
            <div 
               key={user.id} 
               className="flex items-center justify-between py-6 px-8 hover:bg-black/[0.02] rounded-[40px] transition-all"
            >
               <div className="flex items-center gap-10">
                  <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-[10px] uppercase">
                    {user.firstName[0]}
                  </div>
                  <div className="flex flex-col">
                     <span className="text-xl font-bold tracking-tight">{user.firstName} {user.lastName}</span>
                     <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">{user.email}</span>
                  </div>
               </div>

               <div className="flex items-center gap-24">
                  <div className="flex flex-col items-end">
                     <span className="text-xl font-space font-bold">€{(user.balance || 0).toFixed(2)}</span>
                     <span className="text-[8px] uppercase tracking-widest font-bold text-black/20">Balance</span>
                  </div>
                  <button 
                    onClick={() => onIssueCredit(user)}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black border-b-2 border-black/20 pb-0.5 hover:border-black transition-all"
                  >
                    Issue Credit
                  </button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ApplicationStatus }) {
  const colors: Record<ApplicationStatus, string> = {
    Pending: "bg-yellow-500",
    Reviewing: "bg-blue-500",
    Approved: "bg-green-500",
    Rejected: "bg-red-500"
  };
  return (
    <div className="flex items-center gap-3">
       <div className={`w-1.5 h-1.5 rounded-full ${colors[status]}`} />
       <span className="text-[10px] uppercase tracking-widest font-bold text-black/40">{status}</span>
    </div>
  );
}

function DetailItem({ icon, label, value }: any) {
    return (
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 flex items-center gap-2">
          {icon} {label}
        </p>
        <p className="text-xs font-bold text-black/80">{value || "N/A"}</p>
      </div>
    );
}

function EditorialInfo({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
       <p className="text-[10px] uppercase tracking-widest font-bold text-black/20">{label}</p>
       <p className="text-sm font-bold tracking-tight">{value || "—"}</p>
    </div>
  );
}

function OverviewPlaceholder() {
    return (
        <div className="space-y-12">
            <div className="grid md:grid-cols-3 gap-12">
                <EditorialStat label="Applications" value="12,840" trend="+4%" />
                <EditorialStat label="Liquidity" value="€84k" trend="+1%" />
                <EditorialStat label="SLA" value="14.2h" trend="-1%" />
            </div>
            
            <div className="h-[300px] border border-black/5 rounded-[40px] flex items-center justify-center text-black/10 font-bold uppercase tracking-widest text-[10px]">
               Activity Visualization
            </div>
        </div>
    );
}

function EditorialStat({ label, value, trend }: any) {
    return (
        <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">{label}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-5xl font-space font-bold tracking-tighter">{value}</h3>
                <span className="text-[10px] font-bold text-green-600 uppercase font-space">{trend}</span>
            </div>
        </div>
    );
}
