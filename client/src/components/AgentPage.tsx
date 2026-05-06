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
  DownloadCloudIcon,
  AlertTriangle,
  MapPin, 
  Globe, 
  Hash, 
  User, 
  Calendar, 
  Mail, 
  Phone,
  Check,
  Shield,
  RefreshCw,
  Lock,
  Eye,
  MessageSquare,
  PlusIcon
} from 'lucide-react';
import { InternalNotes } from './admin/InternalNotes';
import { AssignAgentModal } from './admin/AssignAgentModal';
import { ActivityTimeline } from './admin/ActivityTimeline';
import { RequestFileModal } from './admin/RequestFileModal';
import { Application, ApplicationStatus, RequestedFile } from "../data/applications";
import { adminApi } from '../lib/api/adminApi';
import { applicationApi } from '../lib/api/applicationApi';
import { Workspace, AgentPermissions, FileRecord } from '../types/user';
import { RefundModal } from './admin/RefundModal';
import { CollapsibleSection } from './ui/CollapsibleSection';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { validatePreviewUrl, validateFile } from "@/lib/utils";
import UserAvatar from "./ui/UserAvatar";

export default function AgentPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && (!user || (user.role !== 'agent' && user.role !== 'admin'))) {
      toast.error('Permission denied: Agent access required');
      router.push('/');
    }
  }, [user, isAuthLoading, router]);
  
  const timeAgo = (date?: string) => {
    if (!date) return "";
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    const intervals = {
      day: 86400,
      hour: 3600,
      minute: 60
    };

    if (seconds < 60) return "just now";
    if (seconds < intervals.hour) return `since ${Math.floor(seconds / 60)}m ago`;
    if (seconds < intervals.day) return `since ${Math.floor(seconds / intervals.hour)}h ago`;
    return `since ${Math.floor(seconds / intervals.day)}d ago`;
  };

  const onBack = () => router.push('/');
  
  const [activeTab, setActiveTab] = useState<'workspaces' | 'applications'>('workspaces');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<FileRecord[]>([]);
  const [pendingRefundApp, setPendingRefundApp] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDocUploading, setIsDocUploading] = useState(false);
  const [search, setSearch] = useState("");

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDocsExpanded, setIsDocsExpanded] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [requestFileName, setRequestFileName] = useState("");
  const [requestFileNote, setRequestFileNote] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleViewAttachment = async (attachment: any) => {
    if (!selectedApp) return;
    try {
      const response = await applicationApi.getAttachmentPreviewUrl((selectedApp._id || selectedApp.id) as string, attachment.url);
      if (response.success && response.previewUrl) {
        if (!validatePreviewUrl(response.previewUrl)) {
          toast.error('Invalid preview URL');
          return;
        }
        window.open(response.previewUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to get preview URL', error);
      toast.error('Error: Access denied or file not found.');
    }
  };


  const permissions = user?.role === 'admin' 
    ? { canViewWorkspaces: true, canUploadFiles: true, canDeleteFiles: true, canViewApplications: true, canManageApplications: true }
    : user?.permissions || {
        canViewWorkspaces: true,
        canUploadFiles: false,
        canDeleteFiles: false,
        canViewApplications: true,
        canManageApplications: true,
      };

  useEffect(() => {
    if (!isAuthLoading && user && (user.role === 'agent' || user.role === 'admin')) {
      loadData();
    }
  }, [isAuthLoading, user, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'workspaces' && permissions.canViewWorkspaces) {
        const response = await adminApi.listWorkspaces();
        // Backend handles filtering workspaces for agents now.
        const mappedWs = response.workspaces.map((w: any) => ({ ...w, id: w._id || w.id }));
        setWorkspaces(mappedWs);
      } else if (activeTab === 'applications' && permissions.canViewApplications) {
        const response = await applicationApi.listAllApplications();
        const mappedApps = response.applications.map((a: any) => ({ ...a, id: a._id || a.id }));
        setApplications(mappedApps);
        // Refresh selected application if it's currently open
        if (selectedApp) {
           const updated = mappedApps.find((a: any) => a.id === selectedApp.id);
           if (updated) setSelectedApp(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFiles = async (wsId: string) => {
    try {
      const response = await adminApi.listFiles(wsId);
      setWorkspaceFiles(response.files);
    } catch(e) {
      console.error(e);
    }
  };

  const handleSelectWorkspace = (ws: Workspace) => {
    setSelectedWorkspace(ws);
    loadFiles((ws._id || ws.id) as string);
  };

  const handleFileUpload = async (fileName: string) => {
    if (!selectedWorkspace || selectedWorkspace.permission === 'Read-only' || !permissions.canUploadFiles) return;
    setIsUploading(true);
    try {
      const dummyFile = new File(["dummy content"], fileName, { type: "text/plain" });
      const response = await adminApi.uploadFile((selectedWorkspace._id || selectedWorkspace.id) as string, dummyFile);
      setWorkspaceFiles(prev => [response.file, ...prev]);
    } catch (e: any) {
      console.error(e);
      alert("Failed to upload: " + (e.response?.data?.message || e.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!selectedWorkspace || selectedWorkspace.permission === 'Read-only' || !permissions.canDeleteFiles) return;
    try {
      await adminApi.deleteFile((selectedWorkspace._id || selectedWorkspace.id) as string, fileId);
      setWorkspaceFiles(prev => prev.filter(f => f.id !== fileId));
    } catch(e) {
      console.error(e);
      alert("Failed to delete file");
    }
  };

  const handleFilePreview = async (fileId: string) => {
    if (!selectedWorkspace) return;
    try {
      const res = await adminApi.getFilePreviewUrl(
        selectedWorkspace._id || selectedWorkspace.id!,
        fileId
      );
      if (res.success && res.previewUrl) {
        if (!validatePreviewUrl(res.previewUrl)) {
          toast.error('Invalid preview URL');
          return;
        }
        window.open(res.previewUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate preview. Please try again.');
    }
  };

   const updateAppStatus = async (id: string, status: ApplicationStatus, forceRelease: boolean = false) => {
    if (!permissions.canManageApplications) return;
    try {
      await applicationApi.updateStatus(id, status);
      await loadData();
    } catch(e) {
      console.error(e);
    }
  };

  const filteredWorkspaces = workspaces.filter(ws => 
    ws.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || (user.role !== 'agent' && user.role !== 'admin')) return null;

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
               <UserAvatar 
                 name={user.firstName || user.email} 
                 src={user.avatar} 
                 size={48} 
                 className="rounded-2xl border border-black/10"
               />
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
                           <div
                             key={file.id}
                             onClick={() => handleFilePreview(file.id)}
                             className="group flex items-center justify-between px-4 py-2 bg-black/[0.02] border border-black/5 rounded-[16px] hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all cursor-pointer"
                           >
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
                                 <button
                                   onClick={(e) => { e.stopPropagation(); handleFilePreview(file.id); }}
                                   className="p-3 hover:bg-black/5 rounded-full transition-all"
                                   title="Preview / Download"
                                 >
                                    <DownloadCloudIcon size={16} />
                                 </button>
                                 {selectedWorkspace.permission !== 'Read-only' && permissions.canDeleteFiles && (
                                    <button 
                                       onClick={(e) => { e.stopPropagation(); handleFileDelete(file.id); }}
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
                                       {new Date(app.createdAt || app.submittedAt).toLocaleDateString()}
                                    </span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6">
                                 <div className="flex items-center gap-4">
                                    {app.status === 'Reviewing' && app.reviewerId && (
                                       <div className="flex items-center gap-2 pr-4 border-r border-black/5">
                                          <div className="flex items-center -space-x-1">
                                             <UserAvatar 
                                               name={app.reviewerName || 'Agent'} 
                                               src={app.reviewerAvatar} 
                                               size={32} 
                                               className="mr-3 shrink-0"
                                             />
                                          </div>
                                          <div className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tight pl-3 border border-blue-500/10">
                                             {app.reviewerName?.split(' ')[0]}
                                          </div>
                                          <span className="text-[8px] font-bold text-black/20 hidden lg:block italic">
                                             {timeAgo(app.lastActivityAt)}
                                          </span>
                                       </div>
                                    )}
                                    <StatusPill status={app.status} />
                                 </div>
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
{/* Unified Application Detail View (Agent Version) */}
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
                             <>
                                <button 
                                  disabled={isActionLoading}
                                  onClick={async () => {
                                     if (!user?.id) return;
                                     setIsActionLoading(true);
                                     try {
                                       const res = await applicationApi.assignAgent(selectedApp._id, user.id);
                                       if (res.success) loadData();
                                     } finally {
                                       setIsActionLoading(false);
                                     }
                                  }} className="px-6 py-2 rounded-sm bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
                                   {isActionLoading && <Loader2 size={12} className="animate-spin" />}
                                   Claim
                                </button>
                                <button onClick={() => setIsAssignModalOpen(true)} className="px-6 py-2 rounded-sm border border-black/10 bg-white text-black/60 text-xs font-bold hover:bg-black/5 transition-colors shadow-sm">
                                   Assign
                                </button>
                             </>
                          )}
                          {selectedApp.reviewerId && (
                             <button 
                                disabled={isActionLoading}
                                onClick={async () => {
                                   setIsActionLoading(true);
                                   try {
                                     const res = await applicationApi.unassignAgent(selectedApp._id);
                                     if (res.success) loadData();
                                   } finally {
                                     setIsActionLoading(false);
                                   }
                                }} className="px-6 py-2 rounded-sm border border-black/10 bg-white text-black/60 text-xs font-bold hover:bg-black/5 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
                                {isActionLoading && <Loader2 size={12} className="animate-spin" />}
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
                               if (res.success) loadData();
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
                               if (res.success) loadData();
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
                               if (res.success) loadData();
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
                                             {(() => {
                                                const requirements = new Map<string, { label: string, required: boolean, instruction?: string }>();
                                                selectedApp.selectedServices.forEach(s => {
                                                   s.requiredDocuments?.forEach(rd => {
                                                      if (!requirements.has(rd.label) || (!requirements.get(rd.label)!.required && rd.required)) {
                                                         requirements.set(rd.label, rd);
                                                      }
                                                   });
                                                });
                                                
                                                const reqList = Array.from(requirements.values());
                                                const attachments = selectedApp.attachments || [];
                                                const requests = selectedApp.requestedFiles || [];

                                                return (
                                                  <>
                                                    {reqList.map((req, i) => {
                                                      const attachment = attachments.find(a => a.label === req.label);
                                                      const request = requests.find(rf => rf.name === req.label && rf.status === 'Pending');

                                                      if (attachment) {
                                                        return (
                                                          <div key={`req-slot-${i}`} className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-sm hover:shadow-sm transition-all group">
                                                            <div className="flex items-center gap-4">
                                                              <div className="w-10 h-10 bg-black/5 rounded-sm flex items-center justify-center text-black/20 group-hover:bg-green-50 group-hover:text-green-500 transition-colors">
                                                                <FileText size={18} />
                                                              </div>
                                                              <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-black/80">{req.label}</span>
                                                                <span className="text-[8px] uppercase tracking-widest font-bold text-black/30">
                                                                  {attachment.uploadedBy} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                                                                </span>
                                                              </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                              <button 
                                                                onClick={() => handleViewAttachment(attachment)}
                                                                className="p-2 hover:bg-black/5 rounded-sm transition-colors text-black/40 hover:text-black"
                                                              >
                                                                <Eye size={14} />
                                                              </button>
                                                              <button className="p-2 hover:bg-black/5 rounded-sm transition-colors text-black/40 hover:text-black">
                                                                <Download size={14} />
                                                              </button>
                                                            </div>
                                                          </div>
                                                        );
                                                      }

                                                      return (
                                                        <div key={`req-slot-${i}`} className={`flex items-center justify-between p-4 border rounded-sm group ${request ? 'bg-indigo-50/30 border-indigo-100' : 'bg-black/[0.01] border-black/5 border-dashed'}`}>
                                                          <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${request ? 'bg-indigo-500 text-white animate-pulse' : 'bg-black/5 text-black/20'}`}>
                                                              <Clock size={18} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                              <span className={`text-xs font-bold ${request ? 'text-indigo-900' : 'text-black/40'}`}>
                                                                {request ? `Awaiting: ${req.label}` : `Missing: ${req.label}`}
                                                              </span>
                                                              <span className="text-[8px] uppercase tracking-widest font-bold text-black/20">
                                                                {req.required ? 'Mandatory Requirement' : 'Optional Requirement'}
                                                              </span>
                                                            </div>
                                                          </div>
                                                          {!request && (
                                                            <button 
                                                              onClick={() => {
                                                                setRequestFileName(req.label);
                                                                setRequestFileNote(req.instruction || "");
                                                                setIsRequestModalOpen(true);
                                                              }}
                                                              className="px-3 py-1 bg-black/[0.02] hover:bg-black text-black/40 hover:text-white rounded-sm text-[8px] font-bold uppercase tracking-widest transition-all"
                                                            >
                                                              Request
                                                            </button>
                                                          )}
                                                          {request && (
                                                            <div className="text-[8px] font-black uppercase tracking-tighter text-indigo-300">
                                                              Req. {new Date(request.requestedAt).toLocaleDateString()}
                                                            </div>
                                                          )}
                                                        </div>
                                                      );
                                                    })}

                                                    {/* Other/Legacy Attachments */}
                                                    {attachments.filter(a => !reqList.some(r => r.label === a.label)).map((doc, i) => (
                                                      <div key={`extra-doc-${i}`} className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-sm hover:shadow-sm transition-all group">
                                                         <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-black/5 rounded-sm flex items-center justify-center text-black/20 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                               <FileText size={18} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                               <span className="text-xs font-bold text-black/80">{doc.label || doc.name}</span>
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

                                                    {/* Extra Pending Requests */}
                                                    {requests.filter(rf => rf.status === 'Pending' && !reqList.some(r => r.label === rf.name)).map((rf, i) => (
                                                      <div key={`extra-req-${i}`} className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-sm group">
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
                                                        <div className="text-[8px] font-black uppercase tracking-tighter text-indigo-300">
                                                          Custom Request
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </>
                                                );
                                             })()}
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

      
         <RefundModal 
            isOpen={!!pendingRefundApp}
            onClose={() => setPendingRefundApp(null)}
            application={pendingRefundApp || selectedApp || {} as Application}
            onConfirm={async (refundData) => {
               if (pendingRefundApp) {
                  await applicationApi.updateStatus((pendingRefundApp._id || pendingRefundApp.id) as string, 'Rejected');
                  setPendingRefundApp(null);
                  loadData();
                  setSelectedApp(null);
               }
            }}
         />

         <AnimatePresence>
            {isRequestModalOpen && selectedApp && (
               <RequestFileModal 
                 applicationId={selectedApp._id}
                 initialName={requestFileName}
                 initialNote={requestFileNote}
                 onClose={() => {
                    setIsRequestModalOpen(false);
                    setRequestFileName("");
                    setRequestFileNote("");
                 }}
                 onRequested={async () => {
                    await loadData();
                    const refreshed = await applicationApi.getApplicationById(selectedApp._id);
                    if (refreshed.success) setSelectedApp(refreshed.application);
                 }}
               />
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

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/40">
        {icon}
        {label}
      </div>
      <p className="text-sm font-bold text-black/80">{value || "N/A"}</p>
    </div>
  );
}
