/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  Loader2,
  FileText,
  Home,
  ShieldAlert,
  ArrowUpRight,
  Download,
  Folder,
  ChevronRight,
  ChevronLeft,
  Trash2,
  ClipboardList,
  CheckCircle2,
  Clock,
  UploadCloudIcon,
  DownloadCloudIcon
} from 'lucide-react';
import { Application, ApplicationStatus } from '../data/applications';
import { mockApi, User as UserType, Workspace, FileRecord, AgentPermissions } from '../lib/api/mockApi';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AgentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const onBack = () => router.push('/');
  
  if (!user) return null;
  const [activeTab, setActiveTab] = useState<'workspaces' | 'applications'>('workspaces');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");

  const permissions = mockApi.getEffectivePermissions(user);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'workspaces' && permissions.canViewWorkspaces) {
        const all = await mockApi.getWorkspaces();
        const allowed = all.filter(ws => {
           if (user.role === 'admin') return true;
           if (ws.permission === 'Public' || ws.permission === 'Read-only') return true;
           if (ws.permission === 'Restricted' && ws.allowedAgents?.includes(user.id)) return true;
           return false;
        });
        setWorkspaces(allowed);
      } else if (activeTab === 'applications' && permissions.canViewApplications) {
        const data = await mockApi.getApplications();
        setApplications(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFiles = async (wsId: string) => {
    const files = await mockApi.getFiles(wsId);
    setWorkspaceFiles(files);
  };

  const handleSelectWorkspace = (ws: Workspace) => {
    setSelectedWorkspace(ws);
    loadFiles(ws.id);
  };

  const handleFileUpload = async (fileName: string) => {
    if (!selectedWorkspace || selectedWorkspace.permission === 'Read-only' || !permissions.canUploadFiles) return;
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
    if (!selectedWorkspace || selectedWorkspace.permission === 'Read-only' || !permissions.canDeleteFiles) return;
    const ok = await mockApi.deleteFile(selectedWorkspace.id, fileId);
    if (ok) {
      setWorkspaceFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const updateAppStatus = async (id: string, status: ApplicationStatus) => {
    if (!permissions.canManageApplications) return;
    await mockApi.updateApplicationStatus(id, status);
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (selectedApp?.id === id) {
       setSelectedApp(prev => prev ? { ...prev, status } : null);
    }
  };

  const filteredWorkspaces = workspaces.filter(ws => 
    ws.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black/5 text-black font-dm selection:bg-black selection:text-white pb-24 px-8 md:px-16">
      <div className="max-w-6xl mx-auto space-y-6">
         <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
               <button onClick={onBack} className="text-[10px] uppercase tracking-widest font-bold text-black/40 hover:text-black mb-8 transition-colors">
                 ← Back to Portal
               </button>
               <h1 className="text-3xl md:text-7xl font-space font-bold tracking-tighter uppercase mb-4">
                 Agent Hub.
               </h1>
               <p className="text-md text-black/40 font-light max-w-xl leading-relaxed">
                 Access your designated cloud workspaces and operational documents.
               </p>
            </div>
            
            <div className="bg-white px-6 py-2 rounded-[16px] shadow-sm border border-black/5 flex items-center gap-6 min-w-[300px]">
               <div className="w-12 h-12 border border-black/10 rounded-2xl flex items-center justify-center font-bold text-lg uppercase">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email+user.id}`} alt={user.email}/>
               </div>
               <div className="flex flex-col">
                  <span className="text-sm font-bold">{user.firstName} {user.lastName}</span>
                  <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest leading-tight">
                    {user.role} Hub <br/>
                    <span className="text-blue-500 font-medium">Verified Official</span>
                  </span>
               </div>
            </div>
         </header>

         {/* Agent Tabs */}
         <div className="flex items-center gap-4 bg-black/5 p-1 rounded-2xl w-fit">
            {permissions.canViewWorkspaces && (
               <button 
                 onClick={() => setActiveTab('workspaces')}
                 className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'workspaces' ? 'bg-white text-black shadow-sm' : 'text-black/30 hover:text-black'}`}
               >
                  Workspaces
               </button>
            )}
            {permissions.canViewApplications && (
               <button 
                 onClick={() => setActiveTab('applications')}
                 className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'applications' ? 'bg-white text-black shadow-sm' : 'text-black/30 hover:text-black'}`}
               >
                  Queue
               </button>
            )}
         </div>

         {isLoading ? (
            <div className="flex justify-center py-24">
               <Loader2 className="animate-spin text-black/20" size={32} />
            </div>
         ) : selectedWorkspace ? (
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-12"
            >
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-black/5 pb-6">
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-black/30">
                        <button onClick={() => setSelectedWorkspace(null)} className="hover:text-black transition-colors">Workspaces</button>
                        <ChevronRight size={10} />
                        <span className="text-black">{selectedWorkspace.name}</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-space font-bold tracking-tighter uppercase">{selectedWorkspace.name}.</h2>
                        {selectedWorkspace.permission === 'Read-only' && (
                           <span className="px-3 py-1 bg-black/5 rounded-full text-[10px] tracking-widest text-black/40 flex items-center gap-1">
                              <ShieldAlert size={12} /> Read-only
                           </span>
                        )}
                     </div>
                  </div>

                  {selectedWorkspace.permission !== 'Read-only' && permissions.canUploadFiles && (
                     <button 
                        onClick={() => handleFileUpload(`Agent_Upload_${Math.floor(Math.random()*100)}.pdf`)}
                        disabled={isUploading}
                        className="px-6 py-2 bg-black text-white rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-all disabled:opacity-20 flex items-center gap-2"
                     >
                        <UploadCloudIcon size={16} /> {isUploading ? "Uploading..." : "Add File"}
                     </button>
                  )}
               </div>

               <div className="space-y-4">
                  {workspaceFiles.length === 0 ? (
                     <div className="py-32 border-2 border-dashed border-black/5 rounded-[40px] flex flex-col items-center justify-center text-black/10 font-bold uppercase tracking-widest text-[10px] gap-4">
                        <Folder size={48} className="opacity-50" />
                        No Documents Found
                     </div>
                  ) : (
                     <div className="grid gap-3">
                        {workspaceFiles.map(file => (
                           <div key={file.id} className="group flex items-center justify-between px-4 py-2 bg-black/[0.02] border border-black/5 rounded-[16px] hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all">
                              <div className="flex items-center gap-6">
                                 <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                                    <span className="text-black/90 text-2xl">📄</span>
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold">{file.name}</span>
                                    <span className="text-[8px] uppercase tracking-widest font-bold text-black/50">
                                       {file.size} • {file.uploadedBy} • {new Date(file.uploadedAt).toLocaleDateString()}
                                    </span>
                                 </div>
                              </div>
                              
                              <div className="flex items-center gap-2 transition-opacity">
                                 <button className="p-3 hover:bg-black/5 rounded-full transition-all">
                                    <DownloadCloudIcon size={16} />
                                 </button>
                                 {selectedWorkspace.permission !== 'Read-only' && permissions.canDeleteFiles && (
                                    <button 
                                       onClick={() => handleFileDelete(file.id)}
                                       className="p-3 hover:bg-red-50 text-red-500 rounded-full transition-all"
                                    >
                                       <Trash2 size={16} />
                                    </button>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </motion.div>
         ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               {activeTab === 'workspaces' ? (
                  <>
                     <div className="relative max-w-md">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-black/20" size={20} />
                        <input 
                           type="text" 
                           placeholder="Search your workspaces..."
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           className="w-full pl-10 pr-4 py-4 bg-transparent border-b border-black/10 text-sm focus:outline-none focus:border-black placeholder:text-black/40 font-bold transition-all"
                        />
                     </div>

                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredWorkspaces.map(ws => (
                           <div 
                              key={ws.id}
                              onClick={() => handleSelectWorkspace(ws)}
                              className="group bg-white border border-black/5 rounded-[16px] p-8 flex flex-col justify-between h-[180px] hover:shadow-2xl hover:shadow-black/5 transition-all cursor-pointer"
                           >
                              <div className="flex justify-between items-start">
                                 <div className="w-10 h-10 bg-black/5 text-black rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                    <Folder size={18} />
                                 </div>
                                 {ws.permission === 'Read-only' && (
                                    <span className="p-2 bg-black/5 rounded-full text-black/40 group-hover:text-black transition-colors">
                                       <ShieldAlert size={14} />
                                    </span>
                                 )}
                              </div>
                              <div>
                                 <h3 className="text-xl font-bold tracking-tight mb-1">{ws.name}</h3>
                                 <p className="text-[10px] uppercase tracking-widest font-bold text-black/30">
                                    {ws.permission} Access
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </>
               ) : (
                  <div className="space-y-12">
                     <div className="relative max-w-md">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-black/20" size={20} />
                        <input 
                           type="text" 
                           placeholder="Search by name or ID..."
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           className="w-full pl-10 pr-4 py-4 bg-transparent border-b border-black/10 text-sm focus:outline-none focus:border-black placeholder:text-black/40 font-bold transition-all"
                        />
                     </div>

                     <div className="space-y-0">
                        {applications.filter(a => a.name.toLowerCase().includes(search.toLowerCase())).map(app => (
                           <div 
                              key={app.id}
                              onClick={() => setSelectedApp(app)}
                              className="group flex items-center justify-between py-4 px-4 border-b border-black/5 hover:bg-black/[0.02] transition-all cursor-pointer"
                           >
                              <div className="flex items-center gap-12">
                                 <span className="text-[10px] max-w-[20px] sm:max-w-none font-mono font-bold text-black/50">#{app.id}</span>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold">{app.name}</span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-black/30">
                                       {new Date(app.submittedAt).toLocaleDateString()}
                                    </span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6">
                                 <StatusPill status={app.status} />
                                 <ChevronRight size={12} className="text-black/40 group-hover:text-black transition-all" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </motion.div>
         )}

         {/* Application Detail View Modal for Agent */}
         <AnimatePresence>
            {selectedApp && (
               <div className="fixed inset-0 z-[500] flex items-center justify-end">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedApp(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  <motion.div 
                     initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                     className="relative w-full max-w-2xl h-full bg-white border-l border-black/5 shadow-2xl p-8 overflow-y-auto"
                  >
                     <div className="flex justify-between items-center mb-12">
                        <h2 className="text-2xl font-space font-bold tracking-tighter uppercase">Review Queue.</h2>
                        <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X size={20} /></button>
                     </div>

                     <div className="space-y-12">
                        <div className="bg-black/5 p-8 rounded-[40px] flex items-center justify-between">
                           <div>
                               <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-black/40 mb-2">Live Status</p>
                               <p className="text-3xl font-space font-bold tracking-tighter uppercase">{selectedApp.status}</p>
                           </div>
                           <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-lg border border-black/5">
                                {selectedApp.status === "Approved" ? <CheckCircle2 size={32} className="text-green-500" /> : <Clock size={32} className="text-black/20" />}
                           </div>
                        </div>

                        {permissions.canManageApplications && (
                           <section className="space-y-4">
                              <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 font-bold">Operational Actions</p>
                              <div className="flex flex-wrap gap-2">
                                 {['Pending', 'Reviewing', 'Approved', 'Rejected'].map(s => (
                                    <button 
                                      key={s} 
                                      onClick={() => updateAppStatus(selectedApp.id, s as any)}
                                      className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedApp.status === s ? 'bg-black text-white scale-105 shadow-xl' : 'bg-white border border-black/5 text-black/40 hover:border-black/20'}`}
                                    >
                                      {s}
                                    </button>
                                 ))}
                              </div>
                           </section>
                        )}

                        {/* App Metadata Displays */}
                        <div className="grid grid-cols-2 gap-8">
                           <DetailItem label="Full Name" value={selectedApp.name} />
                           <DetailItem label="Legal DOB" value={selectedApp.dob} />
                           <DetailItem label="Ph. Number" value={selectedApp.phone} />
                           <DetailItem label="Public Email" value={selectedApp.email} />
                        </div>

                        <div className="pt-8">
                           <button onClick={() => setSelectedApp(null)} className="w-full bg-black text-white py-4 rounded-xl font-bold text-[10px] tracking-widest uppercase hover:scale-[1.02] transition-all shadow-2xl shadow-black/20">
                              Release Record
                           </button>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ApplicationStatus }) {
  const styles: Record<ApplicationStatus, string> = {
    'Pending': 'bg-yellow-400 text-black',
    'Reviewing': 'bg-blue-400 text-white',
    'Approved': 'bg-green-500 text-white',
    'Rejected': 'bg-red-500 text-white'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${styles[status]}`}>
      {status}
    </span>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">
        {label}
      </p>
      <p className="text-sm font-bold text-black/80">{value || "N/A"}</p>
    </div>
  );
}
