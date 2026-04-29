/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowUpRight,
  TrendingUp,
  Loader2,
  LayoutGrid,
  Folder,
  Settings2,
  Trash2,
  CheckCircle2,
  Users,
  BarChart3,
  LogOut,
  FileText,
  Clock,
  ChevronRight,
  UserPlus,
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  MapPin,
  Hash,
  Download,
  Shield,
  Search,
  Home,
  PlusIcon,
  CreditCard,
  Check,
  FolderPlus
} from 'lucide-react';

import { OverviewView } from './admin/OverviewView';
import { ApplicationsView } from './admin/ApplicationsView';
import { UsersView } from './admin/UsersView';
import { WorkspacesManager } from './admin/WorkspacesManager';
import { InviteAgentModal } from './admin/InviteAgentModal';
import { PermissionsModal } from './admin/PermissionsModal';
import { RefundModal } from './admin/RefundModal';
import { InternalNotes } from './admin/InternalNotes';
import { AssignAgentModal } from './admin/AssignAgentModal';
import { ActivityTimeline } from './admin/ActivityTimeline';
import { Application, ApplicationStatus } from '../data/applications';
import { mockApi, User as UserType, Workspace, WorkspacePermission, FileRecord, AgentPermissions } from '../lib/api/mockApi';
import { applicationApi } from '../lib/api/applicationApi';
import { CollapsibleSection } from './ui/CollapsibleSection';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type AdminTab = 'Overview' | 'Applications' | 'Users' | 'Workspaces' | 'Analytics' | 'Settings';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const onBack = () => router.push('/');
  const [activeTab, setActiveTab] = useState<AdminTab>('Applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingRefundApp, setPendingRefundApp] = useState<Application | null>(null);
  
  // Workspace specific state
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<FileRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Agent Management state
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'agent' | 'admin'>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isWsModalOpen, setIsWsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDocUploading, setIsDocUploading] = useState(false);

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
        const response = await applicationApi.listAllApplications();
        setApplications(response.applications);
        if (selectedApp) {
           const updated = response.applications.find(a => a.id === selectedApp.id);
           if (updated) setSelectedApp(updated);
        }
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-black font-dm selection:bg-black selection:text-white -mt-24">
      {/* Sidebar - Desktop Only (lg+) */}
      <aside className="hidden lg:flex w-64 border-r border-black/5 flex-col pt-32 px-10 shrink-0">
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

      {/* Mobile/Tablet Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold">S</span>
          </div>
          <span className="font-bold text-sm tracking-tight">Admin</span>
        </div>
        <button 
          onClick={onBack}
          className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-600 transition-colors"
        >
          Exit
        </button>
      </header>

      {/* Main Workspace - Centered Content */}
      <main className="flex-1 mt-2 lg:pt-32 pt-24 pb-24 lg:pb-24 overflow-y-auto">
        <div className="max-w-6xl mx-auto lg:px-16 px-6">
          <header className="mb-16">
             <motion.h1 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               key={activeTab}
               className="text-4xl md:text-6xl font-space font-bold tracking-tighter leading-none mb-6"
             >
               {activeTab}.
             </motion.h1>
             <p className="text-md text-black/50 font-light max-w-xl leading-relaxed">
               {activeTab === 'Applications' && "Review and manage all incoming service requests from our citizens."}
               {activeTab === 'Users' && "Manage registered user accounts, metadata, and financial credit issuance."}
               {activeTab === 'Workspaces' && "Orchestrate cloud storage structures and manage folder-level permissions."}
               {activeTab === 'Overview' && "Real-time metrics and system health indicators at a glance."}
             </p>

             {activeTab === 'Applications' && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="mt-6 flex items-center gap-6"
               >
                  <button className="flex items-center gap-3 px-6 py-2 bg-black/5 border-black/5 rounded-lg font-bold text-sm shadow-sm hover:shadow-md transition-all group">
                     Export CSV
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
                    className="flex items-center gap-3 px-4 py-2 bg-black/5 border-black/5 text-black rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-all"
                  >
                    <FolderPlus size={16} />
                    New Folder
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
                      <OverviewView />
                   )}
                  {activeTab === 'Settings' && (
                     <div className="space-y-12 py-12">
                        <section className="space-y-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black">
                                 <Clock size={20} />
                              </div>
                              <div>
                                 <h3 className="text-xl font-bold tracking-tight">Workflow Configuration</h3>
                                 <p className="text-[10px] uppercase tracking-widest font-bold text-black/30">Auto-release stale reviews</p>
                              </div>
                           </div>
                           
                           <div className="bg-black/5 p-8 rounded-[32px] border border-black/5 space-y-6">
                              <div className="space-y-2">
                                 <p className="text-sm font-bold">Review Expiration Threshold</p>
                                 <p className="text-[10px] text-black/40 leading-relaxed max-w-md uppercase font-bold tracking-widest">
                                    Applications in "Reviewing" status will automatically revert to "Pending" if inactive for longer than this duration.
                                 </p>
                              </div>
                              
                              <div className="flex flex-wrap gap-3">
                                 {[24, 48, 72, 168].map(h => (
                                    <button
                                      key={h}
                                      onClick={() => {
                                         mockApi.setAutoReleaseHours(h);
                                         loadData(); // Just to trigger a re-render of current config if visible
                                      }}
                                      className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${mockApi.getAutoReleaseHours() === h ? 'bg-black text-white shadow-xl scale-105' : 'bg-white border border-black/5 text-black/40 hover:border-black/20'}`}
                                    >
                                       {h} Hours {h === 48 && "(Default)"}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </section>

                        <div className="py-24 border-2 border-dashed border-black/5 rounded-[40px] flex flex-col items-center justify-center text-black/20 font-bold uppercase tracking-widest text-[10px]">
                            Advanced Settings Module Under Construction
                        </div>
                     </div>
                  )}
                  {activeTab === 'Analytics' && (
                     <div className="py-24 border-2 border-dashed border-black/5 rounded-[40px] flex flex-col items-center justify-center text-black/20 font-bold uppercase tracking-widest text-[10px]">
                        Module Under Construction
                     </div>
                  )}
               </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Mobile Dock Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-black/5 px-2 py-2 safe-area-bottom">
        <div className="flex items-center justify-around">
          <DockItem icon={<LayoutGrid size={22} />} label="Overview" isActive={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
          <DockItem icon={<FileText size={22} />} label="Apps" isActive={activeTab === 'Applications'} onClick={() => setActiveTab('Applications')} />
          <DockItem icon={<Users size={22} />} label="Users" isActive={activeTab === 'Users'} onClick={() => setActiveTab('Users')} />
          <DockItem icon={<UserPlus size={22} />} label="Invite" isActive={isInviteModalOpen} onClick={() => setIsInviteModalOpen(true)} />
          <DockItem icon={<Folder size={22} />} label="Workspaces" isActive={activeTab === 'Workspaces'} onClick={() => setActiveTab('Workspaces')} />
          <DockItem icon={<BarChart3 size={22} />} label="Stats" isActive={activeTab === 'Analytics'} onClick={() => setActiveTab('Analytics')} />
          <DockItem icon={<Settings2 size={22} />} label="Settings" isActive={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
        </div>
      </nav>

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
                    {selectedApp.status === 'Reviewing' && selectedApp.reviewerId && (
                       <div className="flex flex-col items-center gap-1 ml-2 sm:gap-2 pr-4 sm:pr-6 border-r border-black/5">
                          <p className="text-[7px] sm:text-[8px] uppercase tracking-widest font-bold text-black/30">Reviewer</p>
                          <div className="flex items-center gap-2 sm:gap-3 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl shadow-sm border border-black/5">
                             <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                                <img 
                                   src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedApp.reviewerName}${selectedApp.reviewerId}`} 
                                   alt={selectedApp.reviewerName}
                                   className="w-full h-full object-cover"
                                />
                             </div>
                             <span className="text-xs sm:text-sm font-bold">{selectedApp.reviewerName}</span>
                          </div>
                       </div>
                    )}
                    <div className="min-w-12 min-h-12 bg-white rounded-[16px] flex items-center justify-center shadow-lg border border-black/5">
                         {selectedApp.status === "Approved" ? <CheckCircle2 size={24} className="text-green-500" /> : <Clock size={24} className="text-black/20" />}
                    </div>
                 </div>

                  {/* Financial Verification & Payment Control */}
                  <section className="bg-black/5 p-8 rounded-[40px] space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-black shadow-sm">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <p className="text-[8px] uppercase tracking-widest font-bold text-black/30">Payment Method</p>
                          <p className="text-sm font-bold tracking-tight">{selectedApp.paymentMethod || "Not Selected"} • {selectedApp.transactionId || "No TXID"}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${selectedApp.paymentStatus === 'Received' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'}`}>
                        {selectedApp.paymentStatus}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Verify Payment</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            const res = await applicationApi.updatePaymentStatus(selectedApp.applicationId, 'Received');
                            if (res.success) loadData();
                          }}
                          disabled={selectedApp.paymentStatus === 'Received'}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedApp.paymentStatus === 'Received' ? 'bg-black text-white opacity-50 cursor-default' : 'bg-black text-white hover:scale-105 shadow-lg'}`}
                        >
                          Approve Payment
                        </button>
                        <button 
                          onClick={async () => {
                            const res = await applicationApi.updatePaymentStatus(selectedApp.applicationId, 'Pending');
                            if (res.success) loadData();
                          }}
                          disabled={selectedApp.paymentStatus === 'Pending'}
                          className="px-4 py-2 bg-white border border-black/5 text-black/40 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-black/20 transition-all"
                        >
                          Reset to Pending
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Admin Assignment Section */}
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Task Assignment</p>
                       <div className="flex items-center gap-4">
                          {selectedApp.paymentStatus === 'Received' ? (
                            <>
                              <button 
                                onClick={async () => {
                                  if (!user?.id) return;
                                  const res = await applicationApi.assignAgent(selectedApp.applicationId, user.id);
                                  if (res.success) loadData();
                                }}
                                className="text-[9px] uppercase tracking-widest font-bold text-green-600 hover:text-green-700 transition-colors flex items-center gap-2"
                              >
                                <Check size={12} /> Claim Task
                              </button>
                              <button 
                                onClick={() => setIsAssignModalOpen(true)}
                                className="text-[9px] uppercase tracking-widest font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2"
                              >
                                <PlusIcon size={12} /> Assign Agent
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest font-bold text-black/20 bg-black/5 px-3 py-1.5 rounded-lg">
                               <Shield size={10} /> Payment Approval Required to Assign
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="bg-black/5 p-1 rounded-full flex gap-1">
                       {(['Pending', 'Reviewing', 'Approved', 'Rejected'] as ApplicationStatus[]).map(s => (
                          <button 
                            key={s} 
                            disabled={s === 'Reviewing' && selectedApp.paymentStatus !== 'Received'}
                            onClick={async () => {
                               if (s === 'Rejected') {
                                  setPendingRefundApp(selectedApp);
                                  return;
                               }
                               // Update status logic here - potentially via a new updateStatus API
                               // For now, focusing on the requested assignment/payment flow
                            }}
                            className={`flex-1 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${selectedApp.status === s ? 'bg-white text-black shadow-sm' : 'text-black/40 hover:text-black'}`}
                          >
                            {s}
                          </button>
                       ))}
                    </div>
                  </section>

                 {/* Info Grid - Mirrored from ProfilePage */}
                 <CollapsibleSection title="Application Details">
                    <div className="grid grid-cols-2 gap-8 mb-8">
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
                    <div className="space-y-4 mb-10">
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
                 </CollapsibleSection>

                  {/* Internal Notes Section */}
                  <div className='pt-8 bg-black/5 -mx-8 px-8 border-t border-black/5 space-y-12 pb-12'>
                     {/* Secure Application Documents Workspace */}
                     <CollapsibleSection 
                        title="Secure Application Documents" 
                        subtitle="Visible only to Admin & Assigned Agent"
                      >
                         <div className="space-y-6">
                            <div className="flex justify-end">
                               {(user?.role === 'admin' || user?.id === selectedApp.reviewerId) && (
                                  <button 
                                    disabled={isDocUploading}
                                    onClick={async () => {
                                       setIsDocUploading(true);
                                       await mockApi.uploadApplicationDocument(selectedApp._id, `Signed_Final_${Math.floor(Math.random()*1000)}.pdf`);
                                       await loadData();
                                       setIsDocUploading(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-bold text-[9px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                                  >
                                     {isDocUploading ? <Loader2 size={12} className="animate-spin" /> : <PlusIcon size={12} />}
                                     Upload Final Document
                                  </button>
                               )}
                            </div>

                            {selectedApp.attachments && selectedApp.attachments.length > 0 ? (
                              <div className="grid gap-2">
                                 {selectedApp.attachments.map((doc) => (
                                    <div key={doc.id} className="group p-5 bg-white border border-black/5 rounded-[24px] flex items-center justify-between hover:shadow-xl hover:shadow-black/5 transition-all">
                                       <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black/20">
                                             <FileText size={20} />
                                          </div>
                                          <div className="flex flex-col">
                                             <span className="text-sm font-bold">{doc.name}</span>
                                             <span className="text-[8px] uppercase tracking-widest font-bold text-black/30">
                                                Uploaded by {doc.uploadedBy} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                             </span>
                                          </div>
                                       </div>
                                       <button className="p-3 bg-black/5 rounded-full hover:bg-black hover:text-white transition-all">
                                          <Download size={14} />
                                       </button>
                                    </div>
                                 ))}
                              </div>
                            ) : (
                              <div className="py-12 border-2 border-dashed border-black/10 rounded-[32px] flex flex-col items-center justify-center text-black/10 font-bold uppercase tracking-widest text-[8px] gap-2">
                                 <Shield size={24} className="opacity-50" />
                                 Secure document locker is empty
                              </div>
                            )}
                         </div>
                      </CollapsibleSection>

                     <InternalNotes 
                        application={selectedApp} 
                        onUpdate={loadData} 
                     />
                     
                     <div className="pt-8 border-t border-black/5">
                        <CollapsibleSection title="Audit Trail & Activity Log">
                           <ActivityTimeline application={selectedApp} />
                        </CollapsibleSection>
                     </div>
                  </div>

                  <div className='pt-8'>
                     <button onClick={() => setSelectedApp(null)} className='w-full bg-black text-white py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:scale-105 transition-all shadow-2xl shadow-black/20'>
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

       <RefundModal 
          isOpen={!!pendingRefundApp}
          onClose={() => setPendingRefundApp(null)}
          application={pendingRefundApp || selectedApp || {} as Application}
          onConfirm={async (refundData) => {
             if (pendingRefundApp) {
                await mockApi.updateApplicationStatus(pendingRefundApp._id, 'Rejected', false, refundData);
                setPendingRefundApp(null);
                const data = await mockApi.getApplications();
                setApplications(data);
                setSelectedApp(null);
             }
          }}
       />

       {/* Smart Agent Assignment Modal */}
       <AnimatePresence>
          {isAssignModalOpen && selectedApp && (
             <AssignAgentModal 
               applicationId={selectedApp._id}
               onClose={() => setIsAssignModalOpen(false)}
               onAssigned={async () => {
                  await loadData();
                  setIsAssignModalOpen(false);
               }}
             />
          )}
       </AnimatePresence>
    </div>
  );
}

// Old functions removed - using imports from ./admin/

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

function DockItem({ icon, label, isActive, onClick, isExit }: { icon: React.ReactNode, label: string, isActive?: boolean, onClick: () => void, isExit?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all min-w-[52px] ${
        isActive 
          ? 'text-black bg-black/5' 
          : isExit 
            ? 'text-red-500' 
            : 'text-black/30 hover:text-black/60'
      }`}
    >
      {icon}
      <span className="text-[8px] mt-1 font-medium">{label}</span>
    </button>
  );
}

//ApplicationsView now imported from admin/
//UsersView now imported from admin/
//InviteAgentModal now imported from admin/
//PermissionsModal now imported from admin/

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


