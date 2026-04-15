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
  Download,
  Shield,
  UserPlus,
  ArrowRight,
  MoreVertical,
Home,
  Folder,
  Settings2,
  Trash2,
  Check,
  CheckCircle2
} from 'lucide-react';
import { Application, ApplicationStatus } from '../data/applications';
import { mockApi, User as UserType, Workspace, WorkspacePermission, FileRecord, AgentPermissions } from '../lib/api/mockApi';

type AdminTab = 'Overview' | 'Applications' | 'Users' | 'Workspaces' | 'Analytics' | 'Settings';

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
  
  // Workspace specific state
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<FileRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Agent Management state
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'subagent' | 'admin'>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isWsModalOpen, setIsWsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (selectedWorkspace) {
      loadFiles(selectedWorkspace.id);
    }
  }, [selectedWorkspace]);

  const loadFiles = async (wsId: string) => {
    const files = await mockApi.getFiles(wsId);
    setWorkspaceFiles(files);
  };

  const handleFileUpload = async (fileName: string) => {
    if (!selectedWorkspace) return;
    setIsUploading(true);
    try {
      const newFile = await mockApi.uploadFile(selectedWorkspace.id, fileName);
      setWorkspaceFiles(prev => [newFile, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!selectedWorkspace) return;
    const ok = await mockApi.deleteFile(selectedWorkspace.id, fileId);
    if (ok) {
      setWorkspaceFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'Applications') {
        const data = await mockApi.getApplications();
        setApplications(data);
      } else if (activeTab === 'Users') {
        const data = await mockApi.getUsers();
        setUsers(data);
      } else if (activeTab === 'Workspaces') {
        const data = await mockApi.getWorkspaces();
        setWorkspaces(data);
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
              <SidebarLink label="Workspaces" isActive={activeTab === 'Workspaces'} onClick={() => setActiveTab('Workspaces')} />
           </div>

           <div className="pt-6 border-t border-black/5 flex flex-col gap-3">
              <div className="text-[10px] uppercase tracking-widest font-bold text-black/20 mb-1">Operations</div>
              <SidebarLink 
                label="Invite Agent" 
                onClick={() => setIsInviteModalOpen(true)} 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold"
              />
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
               {activeTab === 'Workspaces' && "Orchestrate cloud storage structures and manage folder-level permissions."}
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

             {activeTab === 'Workspaces' && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="mt-12 flex items-center gap-6"
               >
                  <button 
                    onClick={() => setIsWsModalOpen(true)}
                    className="flex items-center gap-3 px-10 py-4 bg-black text-white rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-all"
                  >
                     New Workspace
                     <ArrowUpRight size={18} />
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
                       roleFilter={roleFilter}
                       setRoleFilter={setRoleFilter}
                       onRefresh={loadData}
                       onIssueCredit={(u: UserType) => {
                         setSelectedUser(u);
                         setIsCreditModalOpen(true);
                       }} 
                       onManagePermissions={(u: UserType) => {
                         setSelectedUser(u);
                         setIsPermissionsModalOpen(true);
                       }}
                     />
                  )}
                  {activeTab === 'Workspaces' && (
                     <WorkspacesManager 
                       workspaces={workspaces}
                       users={users}
                       onUpdateFolders={async () => {
                          const data = await mockApi.getWorkspaces();
                          setWorkspaces(data);
                       }}
                       onDeleteWorkspace={async (id: string) => {
                          await mockApi.deleteWorkspace(id);
                          setWorkspaces(prev => prev.filter(ws => ws.id !== id));
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

      {/* Unified Application Detail View (Admin Version) */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[500] flex items-center justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedApp(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-white border-l border-black/5 shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                 <h2 className="text-2xl font-space font-bold tracking-tighter uppercase">Document Details.</h2>
                 <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-12">
                 {/* Status Hero - Mirrored from ProfilePage */}
                 <div className="bg-black/5 p-8 rounded-[40px] flex items-center justify-between">
                    <div>
                        <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-black/40 mb-2">Application Status</p>
                        <p className="text-3xl font-space font-bold tracking-tighter uppercase">{selectedApp.status}</p>
                    </div>
                    <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-lg border border-black/5">
                         {selectedApp.status === "Approved" ? <CheckCircle2 size={32} className="text-green-500" /> : <Clock size={32} className="text-black/20" />}
                    </div>
                 </div>

                 {/* Admin Action Section */}
                 <section className="space-y-4">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Admin Actions</p>
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

                 {/* Info Grid - Mirrored from ProfilePage */}
                 <div className="grid grid-cols-2 gap-8">
                    <DetailItem icon={<User size={14}/>} label="Full Name" value={selectedApp.name} />
                    <DetailItem icon={<Calendar size={14}/>} label="DOB" value={selectedApp.dob} />
                    <DetailItem icon={<MapPin size={14}/>} label="Place of Birth" value={selectedApp.pob} />
                    <DetailItem icon={<Globe size={14}/>} label="Nationality" value={selectedApp.nationality} />
                    <DetailItem icon={<Hash size={14}/>} label="Codice Fiscale" value={selectedApp.codiceFiscale} />
                    <DetailItem icon={<Phone size={14}/>} label="Phone" value={selectedApp.phone} />
                    <DetailItem icon={<Mail size={14}/>} label="Email" value={selectedApp.email} />
                    <DetailItem icon={<Home size={14}/>} label="Address" value={selectedApp.address} />
                 </div>

                 {/* Services Section - Mirrored from ProfilePage */}
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

                 {/* Documents Section - Mirrored from ProfilePage */}
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

                 <div className="pt-8">
                    <button onClick={() => setSelectedApp(null)} className="w-full bg-black text-white py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:scale-105 transition-all shadow-2xl shadow-black/20">
                       Close Detail View
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Credit Issuance Modal */}
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



       <AnimatePresence>
         {isWsModalOpen && (
           <WorkspaceModal 
             users={users}
             onClose={() => setIsWsModalOpen(false)}
             onCreated={(ws: Workspace) => {
               setWorkspaces(prev => [...prev, ws]);
               setIsWsModalOpen(false);
             }}
           />
         )}
       </AnimatePresence>

       {/* Invite Agent Modal */}
       <AnimatePresence>
          {isInviteModalOpen && (
            <InviteAgentModal 
              onClose={() => setIsInviteModalOpen(false)}
              onInvited={() => {
                 loadData();
                 setIsInviteModalOpen(false);
              }}
            />
          )}
       </AnimatePresence>

       {/* Permissions Override Modal */}
       <AnimatePresence>
          {isPermissionsModalOpen && selectedUser && (
             <PermissionsModal 
               user={selectedUser}
               onClose={() => setIsPermissionsModalOpen(false)}
               onSaved={() => {
                  loadData();
                  setIsPermissionsModalOpen(false);
               }}
             />
          )}
       </AnimatePresence>
    </div>
  );
}

function WorkspacesManager({ workspaces, users, onUpdateFolders, onDeleteWorkspace }: any) {
  const [viewedWorkspace, setViewedWorkspace] = useState<Workspace | null>(null);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);

  if (viewedWorkspace) {
    return (
      <WorkspaceBrowser 
        workspace={viewedWorkspace} 
        onBack={() => setViewedWorkspace(null)}
        onEdit={() => setEditingWorkspace(viewedWorkspace)}
      />
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {workspaces.map((ws: Workspace) => (
          <motion.div
            key={ws.id}
            whileHover={{ y: -5 }}
            className="group relative bg-black/[0.02] border border-black/5 rounded-[32px] p-8 flex flex-col justify-between h-[240px] hover:bg-white hover:shadow-2xl hover:shadow-black/5 transition-all cursor-pointer overflow-hidden"
            onClick={() => setViewedWorkspace(ws)}
          >
            <div className="relative z-10 flex justify-between items-start">
               <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                  <Folder size={24} />
               </div>
               <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingWorkspace(ws);
                    }}
                    className="p-2 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white transition-all shadow-sm"
                  >
                    <Settings2 size={14} />
                  </button>
                  <PermissionBadge type={ws.permission} />
               </div>
            </div>

            <div className="relative z-10">
               <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-black transition-colors">{ws.name}</h3>
               <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-black/20">
                    Created {new Date(ws.createdAt).toLocaleDateString()}
                  </span>
               </div>
            </div>

            <button 
              onClick={(e) => {
                 e.stopPropagation();
                 if(confirm("Are you sure? This will delete all files inside.")) {
                   onDeleteWorkspace(ws.id);
                 }
              }}
              className="absolute bottom-8 right-8 p-3 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 rounded-full transition-all"
            >
               <Trash2 size={16} />
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {editingWorkspace && (
          <WorkspaceModal 
            users={users}
            workspace={editingWorkspace}
            onClose={() => setEditingWorkspace(null)}
            onSaved={() => {
              onUpdateFolders();
              setEditingWorkspace(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function WorkspaceBrowser({ workspace, onBack, onEdit }: { workspace: Workspace, onBack: () => void, onEdit: () => void }) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [workspace.id]);

  const loadFiles = async () => {
    setIsLoading(true);
    const data = await mockApi.getFiles(workspace.id);
    setFiles(data);
    setIsLoading(false);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const newFile = await mockApi.uploadFile(workspace.id, `Manual_Upload_${Math.floor(Math.random()*1000)}.pdf`);
      setFiles(prev => [newFile, ...prev]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    const ok = await mockApi.deleteFile(workspace.id, id);
    if (ok) setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-black/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-black/30">
            <button onClick={onBack} className="hover:text-black transition-colors">Workspaces</button>
            <ChevronRight size={10} />
            <span className="text-black">{workspace.name}</span>
          </div>
          <h2 className="text-4xl font-space font-bold tracking-tighter uppercase">{workspace.name}.</h2>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={onEdit} className="p-4 bg-black/5 rounded-2xl hover:bg-black/10 transition-colors">
              <Settings2 size={20} />
           </button>
           <button 
             onClick={handleUpload}
             disabled={isUploading}
             className="px-8 py-4 bg-black text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-20"
           >
             {isUploading ? "Uploading..." : "Upload File"}
           </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-black/10" size={32} /></div>
      ) : files.length === 0 ? (
        <div className="py-32 border-2 border-dashed border-black/5 rounded-[40px] flex flex-col items-center justify-center text-black/10 font-bold uppercase tracking-widest text-[10px] gap-4">
           <Folder size={48} className="opacity-50" />
           This folder is empty
        </div>
      ) : (
        <div className="grid gap-3">
          {files.map(file => (
            <div key={file.id} className="group flex items-center justify-between p-6 bg-black/[0.02] border border-black/5 rounded-[24px] hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white border border-black/5 rounded-xl flex items-center justify-center shadow-sm">
                  <FileText size={20} className="text-black/20" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{file.name}</span>
                  <span className="text-[8px] uppercase tracking-widest font-bold text-black/30">
                    {file.size} • {file.uploadedBy} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="p-3 hover:bg-black/5 rounded-full transition-all"><Download size={16} /></button>
                 <button onClick={() => handleDeleteFile(file.id)} className="p-3 hover:bg-red-50 text-red-500 rounded-full transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function WorkspaceModal({ users, workspace, onClose, onCreated, onSaved }: any) {
  const [name, setName] = useState(workspace?.name || "");
  const [permission, setPermission] = useState<WorkspacePermission>(workspace?.permission || 'Public');
  const [allowedAgents, setAllowedAgents] = useState<string[]>(workspace?.allowedAgents || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!workspace;
  const agents = users.filter((u: any) => u.role === 'subagent' || u.role === 'admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await mockApi.updateWorkspace(workspace.id, { name, permission, allowedAgents });
        onSaved();
      } else {
        const ws = await mockApi.createWorkspace({ name, permission, allowedAgents });
        onCreated(ws);
      }
    } catch (error) {
       console.error(error);
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ scale: 0.9, opacity: 0 }}
         className="bg-white rounded-[40px] w-full max-w-xl p-12 space-y-10 shadow-2xl relative"
       >
          <button onClick={onClose} className="absolute right-8 top-8 p-2 hover:bg-black/5 rounded-full transition-colors"><X size={20} /></button>
          
          <div className="space-y-2">
             <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-black/40 text-center">Cloud Logistics</p>
             <h3 className="text-4xl font-space font-bold tracking-tighter uppercase text-center">{isEdit ? 'Edit Settings.' : 'New Workspace.'}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
             <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-black/20 px-1">Workspace Name</label>
                <input 
                  type="text"
                  autoFocus
                  placeholder="e.g. Internal Templates"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/5 border border-black/5 rounded-[24px] px-8 py-5 text-lg font-bold focus:outline-none focus:bg-black/10 transition-all"
                />
             </div>

             <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-black/20 px-1">Access Level</label>
                <div className="grid grid-cols-3 gap-3">
                   {(['Public', 'Read-only', 'Restricted'] as WorkspacePermission[]).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPermission(p)}
                        className={`py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${permission === p ? 'bg-black text-white border-black' : 'bg-white border-black/5 text-black/30 hover:border-black/20'}`}
                      >
                         {p}
                      </button>
                   ))}
                </div>
             </div>

             {permission === 'Restricted' && (
                <div className="space-y-4">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-black/20 px-1">Assign Agents</label>
                   <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-2 bg-black/5 rounded-2xl">
                      {agents.map((a: any) => (
                         <button
                           key={a.id}
                           type="button"
                           onClick={() => {
                              if (allowedAgents.includes(a.id)) setAllowedAgents(prev => prev.filter(id => id !== a.id));
                              else setAllowedAgents(prev => [...prev, a.id]);
                           }}
                           className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all ${allowedAgents.includes(a.id) ? 'bg-black text-white shadow-lg' : 'bg-white border border-black/5 text-black/40'}`}
                         >
                            {a.firstName} {a.lastName}
                         </button>
                      ))}
                   </div>
                </div>
             )}

             <button 
               type="submit"
               disabled={isSubmitting || !name}
               className="w-full bg-black text-white py-6 rounded-[24px] font-bold text-sm tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20 disabled:opacity-20 mt-4"
             >
                {isSubmitting ? "Processing..." : (isEdit ? "Update Workspace ↗" : "Confirm Workspace ↗")}
             </button>
          </form>
       </motion.div>
    </div>
  );
}

function PermissionBadge({ type }: { type: WorkspacePermission }) {
   const styles: Record<WorkspacePermission, string> = {
      'Public': 'bg-green-500/10 text-green-600 border-green-500/20',
      'Read-only': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'Restricted': 'bg-red-500/10 text-red-600 border-red-500/20'
   };
   return (
      <span className={`px-3 py-1 rounded-full border text-[8px] font-bold uppercase tracking-widest ${styles[type]}`}>
         {type}
      </span>
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
  const filtered = applications.filter((app: Application) => app.name.toLowerCase().includes(search.toLowerCase()) || app.id.includes(search));

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
         {filtered.map((app: Application) => (
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

function UsersView({ users, roleFilter, setRoleFilter, onIssueCredit, onManagePermissions, onRefresh }: any) {
  const [search, setSearch] = useState("");
  
  const filtered = users.filter((u: UserType) => {
    const matchesSearch = u.firstName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: 'user' | 'subagent' | 'admin') => {
    try {
      await mockApi.assignUserRole(userId, newRole);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-12">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-black/5 pb-12">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-black/20" size={20} />
             <input 
               type="text" 
               placeholder="Search registry..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-8 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder:text-black/10"
             />
          </div>

          <div className="flex items-center gap-2 p-1 bg-black/5 rounded-2xl">
             {(['all', 'user', 'subagent', 'admin'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${roleFilter === role ? 'bg-white text-black shadow-sm' : 'text-black/30 hover:text-black'}`}
                >
                   {role === 'subagent' ? 'Agents' : role + 's'}
                </button>
             ))}
          </div>
       </div>

       <div className="space-y-0.5">
          {filtered.map((user: UserType) => (
             <div 
                key={user.id} 
                className="group flex items-center justify-between py-6 px-8 hover:bg-black/[0.02] rounded-[40px] transition-all"
             >
                <div className="flex items-center gap-10">
                   <div className="relative">
                      <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-bold text-lg uppercase">
                        {user.firstName[0]}
                      </div>
                      {user.role === 'admin' && (
                         <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center">
                            <Shield size={10} className="text-white" />
                         </div>
                      )}
                      {user.role === 'subagent' && (
                         <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                            <User size={10} className="text-white" />
                         </div>
                      )}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xl font-bold tracking-tight">{user.firstName} {user.lastName}</span>
                      <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">{user.email}</span>
                   </div>
                </div>

                <div className="flex items-center gap-16">
                   <div className="flex flex-col items-end">
                      <span className="text-xl font-space font-bold">€{(user.balance || 0).toFixed(2)}</span>
                      <span className="text-[8px] uppercase tracking-widest font-bold text-black/20">Liquidity</span>
                   </div>

                   <div className="h-10 w-px bg-black/5" />

                   <div className="flex items-center gap-6">
                      <div className="flex flex-col gap-1">
                         <span className="text-[8px] uppercase tracking-widest font-bold text-black/20">Assign Role</span>
                         <select 
                           value={user.role}
                           onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                           className="bg-transparent text-[10px] font-bold uppercase tracking-widest focus:outline-none appearance-none cursor-pointer hover:text-blue-600 transition-colors"
                         >
                            <option value="user">User</option>
                            <option value="subagent">Agent</option>
                            <option value="admin">Admin</option>
                         </select>
                      </div>

                      {user.role === 'subagent' && (
                         <button 
                           onClick={() => onManagePermissions(user)}
                           className="p-3 bg-black/5 rounded-xl hover:bg-black text-white transition-all text-[10px] font-bold uppercase"
                         >
                            Permissions
                         </button>
                      )}

                      <button 
                        onClick={() => onIssueCredit(user)}
                        className="p-3 hover:bg-black/5 rounded-xl transition-all"
                        title="Issue Credit"
                      >
                        <TrendingUp size={16} />
                      </button>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}

function InviteAgentModal({ onClose, onInvited }: any) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const result = await mockApi.inviteAgent(email, name);
      setInviteLink(result.inviteLink);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ scale: 0.9, opacity: 0 }}
         className="bg-white rounded-[40px] w-full max-w-xl p-12 space-y-10 shadow-2xl relative"
       >
          <button onClick={onClose} className="absolute right-8 top-8 p-2 hover:bg-black/5 rounded-full transition-colors"><X size={20} /></button>
          
          <div className="space-y-2">
             <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-black/40 text-center">Team Expansion</p>
             <h3 className="text-4xl font-space font-bold tracking-tighter uppercase text-center">Invite Agent.</h3>
          </div>

          {!inviteLink ? (
             <form onSubmit={handleInvite} className="space-y-8">
                <div className="space-y-4">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-black/20 px-1">Agent Full Name</label>
                   <input 
                     type="text" 
                     required
                     value={name}
                     onChange={e => setName(e.target.value)}
                     placeholder="John Smith"
                     className="w-full bg-black/5 border border-black/5 rounded-[24px] px-8 py-5 text-lg font-bold focus:outline-none"
                   />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-black/20 px-1">Email Address</label>
                   <input 
                     type="email" 
                     required
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                     placeholder="agent@smartcaf.it"
                     className="w-full bg-black/5 border border-black/5 rounded-[24px] px-8 py-5 text-lg font-bold focus:outline-none"
                   />
                </div>
                <button 
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-black text-white py-6 rounded-[24px] font-bold text-sm tracking-[0.2em] uppercase hover:scale-[1.02] shadow-2xl shadow-black/20"
                >
                   {isSending ? "Generating Invite..." : "Send Invitation Link ↗"}
                </button>
             </form>
          ) : (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-green-50 p-8 rounded-[32px] border border-green-100 space-y-4">
                   <div className="flex items-center gap-3 text-green-600">
                      <CheckCircle2 size={24} />
                      <span className="font-bold text-sm uppercase tracking-widest">Invitation Ready</span>
                   </div>
                   <p className="text-sm text-green-800/60 leading-relaxed">
                      Copy the link below and send it to your new agent. They can use it to set their password and join the hub.
                   </p>
                </div>
                <div className="p-6 bg-black/5 rounded-2xl break-all font-mono text-[10px] border border-black/5 select-all cursor-pointer hover:bg-black/10 transition-colors" title="Click to select all">
                   {inviteLink}
                </div>
                <button onClick={onClose} className="w-full py-4 rounded-xl border-2 border-black font-bold text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                   Done
                </button>
             </div>
          )}
       </motion.div>
    </div>
  );
}

function PermissionsModal({ user, onClose, onSaved }: any) {
  const [overrides, setOverrides] = useState<Partial<AgentPermissions>>(user.permissions || {});
  const [isSaving, setIsSaving] = useState(false);

  // Helper to get actual effective state
  const effective = mockApi.getEffectivePermissions({ ...user, permissions: overrides });

  const toggle = (key: keyof AgentPermissions) => {
    setOverrides((prev: any) => ({
       ...prev,
       [key]: !effective[key]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await mockApi.updateUserPermissions(user.id, overrides);
    onSaved();
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ scale: 0.9, opacity: 0 }}
         className="bg-white rounded-[40px] w-full max-w-xl p-12 space-y-10 shadow-2xl relative"
       >
          <button onClick={onClose} className="absolute right-8 top-8 p-2 hover:bg-black/5 rounded-full transition-colors"><X size={20} /></button>
          
          <div className="space-y-2">
             <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-black/40 text-center">Override Management</p>
             <h3 className="text-4xl font-space font-bold tracking-tighter uppercase text-center">Permissions.</h3>
             <p className="text-sm text-black/40 font-light text-center">Configuring agent: <span className="text-black font-bold">{user.firstName} {user.lastName}</span></p>
          </div>

          <div className="space-y-3">
             {Object.entries(effective).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-5 bg-black/[0.02] border border-black/5 rounded-[24px]">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                   <button 
                     onClick={() => toggle(key as any)}
                     className={`w-12 h-6 rounded-full relative transition-colors ${val ? 'bg-black' : 'bg-black/10'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${val ? 'right-1' : 'left-1'}`} />
                   </button>
                </div>
             ))}
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-black text-white py-6 rounded-[24px] font-bold text-sm tracking-[0.2em] uppercase shadow-2xl"
          >
             {isSaving ? "Saving..." : "Apply Changes ↗"}
          </button>
       </motion.div>
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
        <p className="text-sm font-bold text-black/80">{value || "N/A"}</p>
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
