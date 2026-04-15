/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  Trash2
} from 'lucide-react';
import { mockApi, User as UserType, Workspace, FileRecord } from '../lib/api/mockApi';

export default function AgentPage({ user, onBack }: { user: UserType, onBack: () => void }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const all = await mockApi.getWorkspaces();
      
      const allowed = all.filter(ws => {
         if (ws.permission === 'Public' || ws.permission === 'Read-only') return true;
         if (ws.permission === 'Restricted' && ws.allowedAgents?.includes(user.id)) return true;
         return false;
      });

      setWorkspaces(allowed);
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
    if (!selectedWorkspace || selectedWorkspace.permission === 'Read-only') return;
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
    if (!selectedWorkspace || selectedWorkspace.permission === 'Read-only') return;
    const ok = await mockApi.deleteFile(selectedWorkspace.id, fileId);
    if (ok) {
      setWorkspaceFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const filteredWorkspaces = workspaces.filter(ws => 
    ws.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black/5 text-black font-dm selection:bg-black selection:text-white pt-32 pb-24 px-8 md:px-16">
      <div className="max-w-6xl mx-auto space-y-16">
         <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
               <button onClick={onBack} className="text-[10px] uppercase tracking-widest font-bold text-black/40 hover:text-black mb-8 transition-colors">
                 ← Back to Portal
               </button>
               <h1 className="text-5xl md:text-7xl font-space font-bold tracking-tighter uppercase mb-4">
                 Agent Hub.
               </h1>
               <p className="text-lg text-black/40 font-light max-w-xl leading-relaxed">
                 Access your designated cloud workspaces and operational documents.
               </p>
            </div>
            
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-black/5 flex items-center gap-6 min-w-[300px]">
               <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-bold text-lg uppercase">
                  {user.firstName[0]}
               </div>
               <div className="flex flex-col">
                  <span className="text-sm font-bold">{user.firstName} {user.lastName}</span>
                  <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">{user.role} Access</span>
               </div>
            </div>
         </header>

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
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-black/5 pb-12">
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-black/30">
                        <button onClick={() => setSelectedWorkspace(null)} className="hover:text-black transition-colors">Workspaces</button>
                        <ChevronRight size={10} />
                        <span className="text-black">{selectedWorkspace.name}</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <h2 className="text-4xl font-space font-bold tracking-tighter uppercase">{selectedWorkspace.name}.</h2>
                        {selectedWorkspace.permission === 'Read-only' && (
                           <span className="px-3 py-1 bg-black/5 rounded-full text-[10px] tracking-widest text-black/40 flex items-center gap-1">
                              <ShieldAlert size={12} /> Read-only
                           </span>
                        )}
                     </div>
                  </div>

                  {selectedWorkspace.permission !== 'Read-only' && (
                     <button 
                       onClick={() => handleFileUpload(`Agent_Upload_${Math.floor(Math.random()*100)}.pdf`)}
                       disabled={isUploading}
                       className="px-8 py-4 bg-black text-white rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-all disabled:opacity-20 flex items-center gap-2"
                     >
                        {isUploading ? "Uploading..." : "Add File"} <ArrowUpRight size={16} />
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
                           <div key={file.id} className="group flex items-center justify-between p-6 bg-black/[0.02] border border-black/5 rounded-[24px] hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all">
                              <div className="flex items-center gap-6">
                                 <div className="w-12 h-12 bg-white border border-black/5 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                    <FileText size={20} className="text-black/20" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold">{file.name}</span>
                                    <span className="text-[8px] uppercase tracking-widest font-bold text-black/30 mt-1">
                                       {file.size} • By {file.uploadedBy}
                                    </span>
                                 </div>
                              </div>
                              
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-3 hover:bg-black/5 rounded-full transition-all">
                                    <Download size={16} />
                                 </button>
                                 {selectedWorkspace.permission !== 'Read-only' && (
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
               <div className="relative max-w-md">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-black/20" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search your workspaces..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-transparent border-b border-black/10 text-sm focus:outline-none focus:border-black placeholder:text-black/20 font-bold transition-all"
                  />
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredWorkspaces.map(ws => (
                     <div 
                        key={ws.id}
                        onClick={() => handleSelectWorkspace(ws)}
                        className="group bg-white border border-black/5 rounded-[32px] p-8 flex flex-col justify-between h-[220px] hover:shadow-2xl hover:shadow-black/5 transition-all cursor-pointer"
                     >
                        <div className="flex justify-between items-start">
                           <div className="w-12 h-12 bg-black/5 text-black rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                              <Folder size={20} />
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
            </motion.div>
         )}
      </div>
    </div>
  );
}
