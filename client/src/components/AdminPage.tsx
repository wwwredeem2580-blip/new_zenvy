/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  FolderPlus,
  Eye,
  RefreshCw,
  Lock,
  MessageSquare
} from 'lucide-react';

import { OverviewView } from './admin/OverviewView';
import { ApplicationsView } from './admin/ApplicationsView';
import { UsersView } from './admin/UsersView';
import { WorkspacesManager, WorkspaceModal } from './admin/WorkspacesManager';
import { InviteAgentModal } from './admin/InviteAgentModal';
import { PermissionsModal } from './admin/PermissionsModal';
import { RefundModal } from './admin/RefundModal';
import { InternalNotes } from './admin/InternalNotes';
import { AssignAgentModal } from './admin/AssignAgentModal';
import { ActivityTimeline } from './admin/ActivityTimeline';
import { RequestFileModal } from './admin/RequestFileModal';
import { Application, ApplicationStatus, RequestedFile } from '../data/applications';
import { mockApi, User as UserType, Workspace, WorkspacePermission, FileRecord, AgentPermissions } from '../lib/api/mockApi';
import { applicationApi } from '../lib/api/applicationApi';
import { CollapsibleSection } from './ui/CollapsibleSection';
import { adminApi } from '@/lib/api/adminApi';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { validateFile } from '@/lib/utils';

type AdminTab = 'Overview' | 'Applications' | 'Users' | 'Workspaces' | 'Analytics' | 'Settings';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'admin')) {
      toast.error('Permission denied: Admin access required');
      router.push('/');
    }
  }, [user, isAuthLoading, router]);
  
  const onBack = () => router.push('/');
  const [activeTab, setActiveTab] = useState<AdminTab>('Applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingRefundApp, setPendingRefundApp] = useState<Application | null>(null);
  const [invitations, setInvitations] = useState<any[]>([]);

  const handleRevokeInvitation = async (id: string) => {
    if (!confirm("Revoke this invitation?")) return;
    try {
      await adminApi.revokeInvitation(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };
  
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
  const [isDocsExpanded, setIsDocsExpanded] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && user && user.role === 'admin') {
      loadData();
    }
  }, [isAuthLoading, user, activeTab]);

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
           const updated = response.applications.find(a => a._id === selectedApp._id || (a.id && a.id === selectedApp.id));
           if (updated) setSelectedApp(updated);
        }
      } else if (activeTab === 'Users') {
        const [userRes, inviteRes] = await Promise.all([
          adminApi.listUsers(),
          adminApi.listInvitations()
        ]);
        const mappedUsers = userRes.users.map((u: any) => ({
           ...u,
           id: u._id || u.id
        }));
        setUsers(mappedUsers);
        setInvitations(inviteRes.invitations);
      } else if (activeTab === 'Workspaces') {
        const [wsResponse, userRes] = await Promise.all([
          adminApi.listWorkspaces(),
          adminApi.listUsers()
        ]);
        setWorkspaces(wsResponse.workspaces);
        const mappedUsers = userRes.users.map((u: any) => ({
           ...u,
           id: u._id || u.id
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAttachment = async (attachment: any) => {
    if (!selectedApp) return;
    try {
      const response = await applicationApi.getAttachmentPreviewUrl(selectedApp._id, attachment.url);
      if (response.success && response.previewUrl) {
        window.open(response.previewUrl, '_blank');
      }
    } catch (error) {
      console.error("Failed to get preview URL", error);
      alert("Error: Access denied or file not found.");
    }
  };

  const handleIssueCredit = async () => {
    if (!selectedUser || !creditAmount || isNaN(parseFloat(creditAmount))) return;
    setIsProcessing(true);
    try {
      const response = await adminApi.addCredits(selectedUser.id, parseFloat(creditAmount));
      if (response.success) {
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, balance: response.user.balance } : u));
        setIsCreditModalOpen(false);
        setCreditAmount("");
      }
    } catch (error) {
      console.error("Failed to issue credit", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

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
                    className="flex items-center gap-3 px-4 py-2 bg-black/5 border-black/5 text-black rounded-sm font-bold text-sm shadow-xl hover:scale-105 transition-all"
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
                       invitations={invitations}
                       roleFilter={roleFilter}
                       setRoleFilter={setRoleFilter}
                       onRefresh={loadData}
                       onRevokeInvite={handleRevokeInvitation}
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
                       workspaces={workspaces as any[]}
                       users={users}
                       onUpdateFolders={async () => {
                          const response = await adminApi.listWorkspaces();
                          setWorkspaces(response.workspaces);
                       }}
                       onDeleteWorkspace={async (id: string) => {
                          await adminApi.deleteWorkspace(id);
                          setWorkspaces(prev => prev.filter(ws => ((ws as any)._id || ws.id) !== id));
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
                              <div className="w-12 h-12 bg-black/5 rounded-sm flex items-center justify-center text-black">
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
                                      className={`px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${mockApi.getAutoReleaseHours() === h ? 'bg-black text-white shadow-xl scale-105' : 'bg-white border border-black/5 text-black/40 hover:border-black/20'}`}
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
              className="relative w-full max-w-4xl h-full bg-white border-l border-black/10 shadow-2xl p-6 sm:p-12 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-16">
                 <h2 className="text-2xl font-space tracking-tight uppercase font-bold">Document Details</h2>
                 <button onClick={() => setSelectedApp(null)} className="p-3 hover:bg-black/5 rounded-sm transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                 {/* Top Card: Status & Payment Actions */}
                 <div className="bg-white border border-black/5 rounded-sm p-8 flex flex-col gap-10">
                    {/* Status Info Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
                       {/* Application Status */}
                       <div className="flex flex-col gap-3 lg:border-r border-black/10 pr-4">
                           <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Application Status</span>
                           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-indigo-50 border border-indigo-100 text-indigo-600 w-max">
                              <div className="w-1.5 h-1.5 rounded-sm bg-indigo-500" />
                              <span className="text-xs font-bold">{selectedApp.status}</span>
                           </div>
                       </div>
                       
                       {/* Reviewer */}
                       <div className="flex flex-col gap-3 lg:border-r border-black/10 lg:px-4">
                           <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Reviewer</span>
                           {selectedApp.reviewerId ? (
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-sm bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-white/20">
                                    {selectedApp.reviewerName?.charAt(0)}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold leading-tight">{selectedApp.reviewerName}</span>
                                    <span className="text-[10px] text-black/40 font-medium">Smart CAF</span>
                                 </div>
                              </div>
                           ) : (
                              <span className="text-sm font-bold text-black/20 mt-1">Unassigned</span>
                           )}
                       </div>

                       {/* Payment Method */}
                       <div className="flex flex-col gap-3 lg:border-r border-black/10 lg:px-4">
                           <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Payment Method</span>
                           <span className="text-sm font-bold text-black/80 mt-1">{selectedApp.paymentMethod || "Cash"} • {selectedApp.transactionId || "No TXID"}</span>
                       </div>

                       {/* Received */}
                       <div className="flex flex-col gap-3 lg:pl-4">
                           <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Received</span>
                           <div className="mt-1">
                              {selectedApp.paymentStatus === 'Received' ? (
                                 <div className="w-8 h-8 rounded-sm bg-green-50 text-green-500 flex items-center justify-center border border-green-100 shadow-sm">
                                    <Check size={16} strokeWidth={3} />
                                 </div>
                              ) : (
                                 <div className="w-8 h-8 rounded-sm bg-black/5 flex items-center justify-center">
                                    <Clock size={16} className="text-black/20" />
                                 </div>
                              )}
                           </div>
                       </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button 
                          onClick={async () => {
                            setIsActionLoading(true);
                            try {
                              const res = await applicationApi.updatePaymentStatus(selectedApp._id, 'Received');
                              if (res.success) await loadData();
                            } finally {
                              setIsActionLoading(false);
                            }
                          }}
                          disabled={selectedApp.paymentStatus === 'Received' || isActionLoading}
                          className={`flex items-center justify-center gap-3 py-4 rounded-sm font-bold text-[10px] uppercase tracking-widest transition-all ${selectedApp.paymentStatus === 'Received' ? 'bg-indigo-50 text-indigo-200 cursor-default border border-indigo-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'}`}
                        >
                           {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                           Verify Payment
                        </button>
                        <button 
                          onClick={async () => {
                            setIsActionLoading(true);
                            try {
                              const res = await applicationApi.updatePaymentStatus(selectedApp._id, 'Received');
                              if (res.success) await loadData();
                            } finally {
                              setIsActionLoading(false);
                            }
                          }}
                          disabled={selectedApp.paymentStatus === 'Received' || isActionLoading}
                          className={`flex items-center justify-center gap-3 py-4 rounded-sm font-bold text-[10px] uppercase tracking-widest transition-all ${selectedApp.paymentStatus === 'Received' ? 'bg-black/5 text-black/20 cursor-default border border-black/10' : 'bg-black text-white hover:bg-black/90 disabled:opacity-50'}`}
                        >
                           {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                           Approve Payment
                        </button>
                        <button 
                          onClick={async () => {
                            setIsActionLoading(true);
                            try {
                              const res = await applicationApi.updatePaymentStatus(selectedApp._id, 'Pending');
                              if (res.success) await loadData();
                            } finally {
                              setIsActionLoading(false);
                            }
                          }}
                          disabled={selectedApp.paymentStatus === 'Pending' || isActionLoading}
                          className="flex items-center justify-center gap-3 py-4 rounded-sm border border-black/20 bg-white font-bold text-[10px] uppercase tracking-widest hover:bg-black/5 transition-all text-black/60 disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                           {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                           Reset to Pending
                        </button>
                    </div>
                 </div>

                 {/* Task Assignment Card */}
                 <div className="bg-white border border-black/10 rounded-sm p-8 flex flex-col gap-10">
                    <h3 className="font-bold text-sm text-black/80">Task Assignment</h3>
                    
                    {/* Assigned To Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-black/10 rounded-sm p-6 bg-black/[0.02] gap-6">
                       <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-black/60 uppercase tracking-widest">Assigned To</span>
                          {selectedApp.reviewerId ? (
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-sm bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">{selectedApp.reviewerName?.charAt(0)}</div>
                                <span className="text-sm font-bold text-black/80">{selectedApp.reviewerName}</span>
                             </div>
                          ) : (
                             <span className="text-sm font-bold text-black/40">Unassigned</span>
                          )}
                       </div>
                       
                       <div className="flex items-center gap-3">
                          {!selectedApp.reviewerId && selectedApp.paymentStatus === 'Received' && (
                                <button onClick={() => setIsAssignModalOpen(true)} className="px-6 py-2 rounded-sm border border-black/10 bg-white text-black/60 text-xs font-bold hover:bg-black/5 transition-colors shadow-sm">
                                   Assign
                                </button>
                          )}
                          {selectedApp.reviewerId && (
                             <button onClick={async () => {
                                const res = await applicationApi.unassignAgent(selectedApp._id);
                                if (res.success) loadData();
                             }} className="px-6 py-2 rounded-sm border border-black/10 bg-white text-black/60 text-xs font-bold hover:bg-black/5 transition-colors shadow-sm">
                                Unassign
                             </button>
                          )}
                       </div>
                    </div>

                    {/* Flowchart Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                       <button 
                          disabled={isActionLoading}
                          onClick={async () => {
                             setIsActionLoading(true);
                             try {
                               const res = await applicationApi.updateStatus(selectedApp._id, 'Pending');
                               if (res.success) await loadData();
                             } finally {
                               setIsActionLoading(false);
                             }
                          }}
                          className={`py-4 flex items-center justify-center gap-2 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all border ${selectedApp.status === 'Pending' ? 'bg-black text-white border-black shadow-lg' : 'border-black/10 text-black/40 bg-white hover:border-black/20'} disabled:opacity-50`}>
                          {isActionLoading && selectedApp.status !== 'Pending' && <Loader2 size={12} className="animate-spin" />}
                          Pending
                       </button>

                       <button 
                          disabled={selectedApp.paymentStatus !== 'Received' || isActionLoading}
                          onClick={async () => {
                             setIsActionLoading(true);
                             try {
                               const res = await applicationApi.updateStatus(selectedApp._id, 'Reviewing');
                               if (res.success) await loadData();
                             } finally {
                               setIsActionLoading(false);
                             }
                          }}
                          className={`py-4 flex items-center justify-center gap-2 rounded-sm text-[10px] uppercase tracking-widest font-bold border transition-all ${selectedApp.status === 'Reviewing' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'border-black/10 text-black/40 bg-white hover:border-black/20 disabled:opacity-20'}`}>
                          {isActionLoading && selectedApp.status !== 'Reviewing' && <Loader2 size={12} className="animate-spin" />}
                          Reviewing
                       </button>

                       <button 
                          disabled={isActionLoading}
                          onClick={async () => {
                             setIsActionLoading(true);
                             try {
                               const res = await applicationApi.updateStatus(selectedApp._id, 'Approved');
                               if (res.success) await loadData();
                             } finally {
                               setIsActionLoading(false);
                             }
                          }}
                          className={`py-4 flex items-center justify-center gap-2 rounded-sm text-[10px] uppercase tracking-widest font-bold border transition-all ${selectedApp.status === 'Approved' ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'border-black/10 text-black/40 bg-white hover:border-black/20'} disabled:opacity-50`}>
                          {isActionLoading && selectedApp.status !== 'Approved' && <Loader2 size={12} className="animate-spin" />}
                          Approved
                       </button>

                       <button 
                          disabled={isActionLoading}
                          onClick={async () => {
                             setPendingRefundApp(selectedApp);
                          }}
                          className={`py-4 flex items-center justify-center gap-2 rounded-sm text-[10px] uppercase tracking-widest font-bold border transition-all ${selectedApp.status === 'Rejected' ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'border-black/10 text-black/40 bg-white hover:border-black/20'} disabled:opacity-50`}>
                          Rejected
                       </button>
                    </div>
                 </div>

                 {/* 2-Column Grid Layout for Bottom Section */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    {/* Left Column: Application Details & Audit Trail */}
                    <div className="space-y-6">
                       {/* Application Details Summary Card */}
                       <div className="bg-white border border-black/10 rounded-sm p-8 shadow-sm space-y-12">
                          <div className="space-y-4">
                             <h3 className="font-bold text-[10px] uppercase tracking-widest text-black/40">Application Details</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
                                <DetailItem icon={<User size={14}/>} label="Full Name" value={selectedApp.name} />
                                <DetailItem icon={<Calendar size={14}/>} label="DOB" value={selectedApp.dob} />
                                <DetailItem icon={<MapPin size={14}/>} label="Place of Birth" value={selectedApp.pob} />
                                <DetailItem icon={<Globe size={14}/>} label="Nationality" value={selectedApp.nationality} />
                                <DetailItem icon={<Hash size={14}/>} label="Codice Fiscale" value={selectedApp.codiceFiscale} />
                                <DetailItem icon={<Phone size={14}/>} label="Phone" value={selectedApp.phone} />
                                <DetailItem icon={<Mail size={14}/>} label="Email" value={selectedApp.email} />
                                <DetailItem icon={<Home size={14}/>} label="Address" value={selectedApp.address} />
                             </div>
                          </div>

                          <div className="space-y-4">
                             <h3 className="text-[10px] uppercase tracking-widest font-bold text-black/40">Included Services</h3>
                             <div className="grid gap-2">
                                {selectedApp.selectedServices.map((s, i) => (
                                   <div key={i} className="flex justify-between items-center p-5 bg-black/[0.02] border border-black/10 rounded-sm hover:bg-white hover:shadow-xl transition-all group">
                                      <div className="space-y-1">
                                          <span className="block font-bold text-xs">{s.name}</span>
                                          <span className="flex items-center gap-1 text-[8px] uppercase tracking-widest font-bold text-black/40">
                                              <Clock size={10} /> {s.duration}
                                          </span>
                                      </div>
                                      <span className="text-sm font-space font-bold">€{s.price}</span>
                                   </div>
                                ))}
                             </div>
                          </div>

                          <div className="pt-4 border-t border-black/5">
                             <div 
                                onClick={() => setIsDocsExpanded(!isDocsExpanded)}
                                className={`flex items-center justify-between border rounded-sm p-4 transition-all cursor-pointer group ${isDocsExpanded ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-black/[0.02] border-black/5 hover:bg-black/5'}`}
                             >
                                <div className="flex items-center gap-4">
                                   <div className={`w-10 h-10 rounded-sm flex items-center justify-center shadow-sm transition-colors ${isDocsExpanded ? 'bg-white/20 text-white' : 'bg-white border border-black/5 text-black/40'}`}>
                                      <Lock size={18} />
                                   </div>
                                   <div className="flex flex-col">
                                      <span className={`text-sm font-bold transition-colors ${isDocsExpanded ? 'text-white' : 'text-black/80 group-hover:text-black'}`}>Secure Application Documents</span>
                                      <span className={`text-[10px] font-medium transition-colors ${isDocsExpanded ? 'text-white/60' : 'text-black/40'}`}>Visible only to Admin & Assigned Agent</span>
                                   </div>
                                </div>
                                <ChevronRight size={18} className={`transition-all ${isDocsExpanded ? 'text-white rotate-90' : 'text-black/20 group-hover:text-black/40'}`} />
                             </div>

                             <AnimatePresence>
                                {isDocsExpanded && (
                                   <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                   >
                                      <div className="pt-6 space-y-6">
                                         <div className="flex justify-between items-center">
                                            <h4 className="text-[10px] uppercase tracking-widest font-bold text-black/40">Secure Workspace</h4>
                                            {(user?.role === 'admin' || (user?._id || user?.id) === selectedApp.reviewerId) && (
                                               <>
                                                 <input 
                                                   type="file" 
                                                   className="hidden" 
                                                   ref={fileInputRef} 
                                                   onChange={async (e) => {
                                                     const file = e.target.files?.[0];
                                                     if (!file || !selectedApp) return;

                                                     const validation = validateFile(file);
                                                     if (!validation.valid) {
                                                       toast.error(validation.error);
                                                       return;
                                                     }

                                                     setIsDocUploading(true);
                                                     try {
                                                       const res = await applicationApi.uploadFinalDocument(selectedApp._id, file);
                                                       if (res.success) {
                                                         toast.success("Document uploaded successfully");
                                                         await loadData();
                                                       }
                                                     } catch (err: any) {
                                                       toast.error(err?.message || 'Upload failed. Please try again.');
                                                     } finally {
                                                       setIsDocUploading(false);
                                                     }
                                                   }}
                                                 />
                                                 <div className="flex items-center gap-2">
                                                   <button 
                                                     onClick={() => fileInputRef.current?.click()}
                                                     disabled={isDocUploading}
                                                     className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-sm font-bold text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                                                   >
                                                      {isDocUploading ? <Loader2 size={12} className="animate-spin" /> : <PlusIcon size={12} />}
                                                      Upload
                                                   </button>
                                                   <button 
                                                     onClick={() => setIsRequestModalOpen(true)}
                                                     className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-sm font-bold text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                                                   >
                                                      <MessageSquare size={12} />
                                                      Request File
                                                   </button>
                                                 </div>
                                               </>
                                            )}
                                         </div>

                                         <div className="grid gap-3">
                                            {/* Pending Requests */}
                                            {selectedApp.requestedFiles?.filter((rf: any) => rf.status === 'Pending').map((rf: any, i: number) => (
                                              <div key={`req-${i}`} className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-sm group">
                                                <div className="flex items-center gap-4">
                                                  <div className="w-10 h-10 bg-indigo-500 text-white rounded-sm flex items-center justify-center animate-pulse">
                                                    <Clock size={18} />
                                                  </div>
                                                  <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-indigo-900">Awaiting: {rf.name}</span>
                                                    <span className="text-[8px] uppercase tracking-widest font-bold text-indigo-400">
                                                      Requested on {new Date(rf.requestedAt).toLocaleDateString()}
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-tighter text-indigo-300">
                                                  Pending Client Action
                                                </div>
                                              </div>
                                            ))}

                                            {selectedApp.attachments && selectedApp.attachments.length > 0 ? (
                                               <>
                                                  {selectedApp.attachments.map((doc: any, i: number) => (
                                                     <div key={i} className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-sm hover:shadow-sm transition-all group">
                                                        <div className="flex items-center gap-4">
                                                           <div className="w-10 h-10 bg-black/5 rounded-sm flex items-center justify-center text-black/20 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                              <FileText size={18} />
                                                           </div>
                                                           <div className="flex flex-col">
                                                              <span className="text-xs font-bold text-black/80">{doc.name}</span>
                                                              <span className="text-[8px] uppercase tracking-widest font-bold text-black/30">
                                                                 {doc.uploadedBy} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                                              </span>
                                                           </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                           <button 
                                                              onClick={() => handleViewAttachment(doc)}
                                                              className="p-2 hover:bg-black/5 rounded-sm transition-colors text-black/40 hover:text-black"
                                                           >
                                                              <Eye size={14} />
                                                           </button>
                                                           <button className="p-2 hover:bg-black/5 rounded-sm transition-colors text-black/40 hover:text-black">
                                                              <Download size={14} />
                                                           </button>
                                                        </div>
                                                     </div>
                                                  ))}
                                               </>
                                            ) : (
                                               selectedApp.requestedFiles?.some((rf: any) => rf.status === 'Pending') ? null : (
                                                 <div className="py-8 border-2 border-dashed border-black/5 rounded-sm flex flex-col items-center justify-center text-black/10 font-bold uppercase tracking-widest text-[8px] gap-2">
                                                    <Shield size={20} className="opacity-50" />
                                                    Workspace is empty
                                                 </div>
                                               )
                                            )}
                                         </div>
                                      </div>
                                   </motion.div>
                                )}
                             </AnimatePresence>
                          </div>
                       </div>

                       {/* Audit Trail & Activity Log Card */}
                       <div className="bg-white border border-black/10 rounded-sm p-8 shadow-sm space-y-10">
                          <div className="flex items-center justify-between">
                             <h3 className="font-bold text-[10px] uppercase tracking-widest text-black/40">Audit Trail & Activity Log</h3>
                          </div>
                          
                          <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-black/60">Lifecycle Overview</span>
                                <span className="text-[10px] font-bold text-indigo-500">Total Time: 1 Day</span>
                             </div>
                             
                             <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                <ActivityTimeline application={selectedApp} />
                             </div>

                             <button className="w-full flex items-center justify-center gap-2 py-4 rounded-sm border border-black/10 bg-black/[0.02] text-[10px] font-bold uppercase tracking-widest text-black/40 hover:bg-black/5 transition-colors">
                                View Full Timeline <ChevronRight size={14} className="rotate-90" />
                             </button>
                          </div>
                       </div>
                    </div>

                    {/* Right Column: Internal Communications */}
                    <div className="h-full">
                       <InternalNotes 
                          application={selectedApp} 
                          onUpdate={loadData} 
                       />
                    </div>
                 </div>

                 <div className='pt-8 border-t border-black/5'>
                    <button onClick={() => setSelectedApp(null)} className='w-full bg-black text-white py-6 rounded-sm font-bold text-[10px] tracking-[0.3em] uppercase hover:bg-black/90 transition-all shadow-2xl'>
                       Close Detail View
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
         {isRequestModalOpen && selectedApp && (
            <RequestFileModal 
              applicationId={selectedApp._id}
              onClose={() => setIsRequestModalOpen(false)}
              onRequested={async () => {
                 await loadData();
                 const refreshed = await applicationApi.getApplicationById(selectedApp._id);
                 if (refreshed.success) setSelectedApp(refreshed.application);
              }}
            />
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
               <button onClick={() => setIsCreditModalOpen(false)} className="absolute right-8 top-8 p-2 hover:bg-black/5 rounded-sm transition-colors"><X size={20} /></button>
               
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
             onSaved={() => {
               loadData();
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
           <button onClick={onEdit} className="p-4 bg-black/5 rounded-sm hover:bg-black/10 transition-colors">
              <Settings2 size={20} />
           </button>
           <button 
             onClick={handleUpload}
             disabled={isUploading}
             className="px-8 py-4 bg-black text-white rounded-sm font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-20"
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
                <div className="w-12 h-12 bg-white border border-black/5 rounded-sm flex items-center justify-center shadow-sm">
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
                 <button className="p-3 hover:bg-black/5 rounded-sm transition-all"><Download size={16} /></button>
                 <button onClick={() => handleDeleteFile(file.id)} className="p-3 hover:bg-red-50 text-red-500 rounded-sm transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}


function SidebarLink({ label, isActive, onClick, className }: any) {
  return (
    <button 
      onClick={onClick}
      className={`text-left transition-all ${className} ${isActive ? 'text-black font-bold scale-105 origin-left' : 'text-black/30 hover:text-black'}`}
    >
      {label}
    </button>
  );
}

function DockItem({ icon, label, isActive, onClick, isExit }: { icon: React.ReactNode, label: string, isActive?: boolean, onClick: () => void, isExit?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-sm transition-all min-w-[52px] ${
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
       <div className={`w-1.5 h-1.5 rounded-sm ${colors[status]}`} />
       <span className="text-[10px] uppercase tracking-widest font-bold text-black/40">{status}</span>
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
      Rejected: <X size={12} />,
    };
  
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-sm border text-[10px] font-bold uppercase tracking-widest ${styles[status]}`}>
        {icons[status]}
        {status}
      </div>
    );
}

function DetailItem({ icon, label, value }: any) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/30 flex items-center gap-3">
          {icon} {label}
        </p>
        <p className="text-sm font-bold text-black/90 break-words leading-relaxed">{value || "N/A"}</p>
      </div>
    );
}
