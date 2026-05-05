/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DownloadCloudIcon, Folder, PlusIcon, Settings2, Trash2, UploadCloudIcon, X } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { adminApi } from '@/lib/api/adminApi';
import { validatePreviewUrl } from '@/lib/utils';
import { toast } from 'sonner';

export type WorkspacePermission = 'Public' | 'Read-only' | 'Restricted';

export interface Workspace {
  _id: string;
  id?: string;
  name: string;
  permission: WorkspacePermission;
  isSystem: boolean;
  allowedAgents?: string[];
  createdAt: string;
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

export function WorkspacesManager({ 
  workspaces, 
  users, 
  onUpdateFolders, 
  onDeleteWorkspace 
}: { 
  workspaces: Workspace[], 
  users: UserType[], 
  onUpdateFolders: () => void, 
  onDeleteWorkspace: (id: string) => void 
}) {
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
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((ws: Workspace) => (
          <motion.div
            key={ws._id || ws.id}
            whileHover={{ y: -5 }}
            className="group relative bg-black/[0.02] border border-black/5 rounded-[16px] p-8 flex flex-col justify-between h-[180px] hover:bg-white hover:shadow-2xl hover:shadow-black/5 transition-all cursor-pointer overflow-hidden"
            onClick={() => setViewedWorkspace(ws)}
          >
            <div className="relative z-10 flex justify-between items-start">
               <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                  <Folder size={18} />
               </div>
               <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingWorkspace(ws);
                    }}
                    className="p-2 bg-white/50 rounded-full hover:bg-black hover:text-white transition-all shadow-sm"
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

            {!ws.isSystem && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if(confirm("Are you sure? This will delete all files inside.")) {
                    onDeleteWorkspace(ws._id || ws.id!);
                  }
                }}
                className="absolute bottom-8 right-8 p-3 hover:bg-red-50 text-red-500 rounded-full transition-all"
              >
                <Trash2 size={16} />
              </button>
            )}
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
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadFiles();
  }, [workspace._id, workspace.id]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.listFiles(workspace._id || workspace.id!);
      setFiles(res.files);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await adminApi.uploadFile(workspace._id || workspace.id!, file);
      if (res.success) {
        setFiles(prev => [res.file, ...prev]);
      }
    } catch (e) {
      console.error(e);
      alert("Upload failed. System folders only accept uploads through applications.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      const res = await adminApi.deleteFile(workspace._id || workspace.id!, id);
      if (res.success) setFiles(prev => prev.filter(f => f.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePreview = async (fileKey: string) => {
    try {
      const res = await adminApi.getFilePreviewUrl(workspace._id || workspace.id!, fileKey);
      if (res.success) {
        if (!validatePreviewUrl(res.previewUrl)) {
          toast.error("Invalid preview URL");
          return;
        }
        window.open(res.previewUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate preview URL");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-black/5 pb-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-black/30">
            <button onClick={onBack} className="hover:text-black transition-colors">Workspaces</button>
            <span>›</span>
            <span className="text-black">{workspace.name}</span>
          </div>
          <h2 className="text-2xl font-space font-bold tracking-tighter uppercase">{workspace.name}.</h2>
        </div>
        <div className="flex items-center gap-4">
           {!workspace.isSystem && (
             <button onClick={onEdit} className="px-4 py-2 bg-black/5 rounded-xl hover:bg-black/10 transition-colors">
               <Settings2 size={16} />
             </button>
           )}
           
           {!workspace.isSystem && (
             <>
               <input 
                 type="file" 
                 className="hidden" 
                 ref={fileInputRef} 
                 onChange={handleUpload}
               />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 disabled={isUploading}
                 className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-20"
               >
                <UploadCloudIcon size={16} />
                 {isUploading ? "Uploading..." : "Upload File"}
               </button>
             </>
           )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24 text-black/10">Loading...</div>
      ) : files.length === 0 ? (
        <div className="py-32 border-2 border-dashed border-black/5 rounded-[40px] flex flex-col items-center justify-center text-black/10 font-bold uppercase tracking-widest text-[10px] gap-4">
           <Folder size={48} className="opacity-50" />
           This folder is empty
        </div>
      ) : (
        <div className="grid gap-3">
          {files.map(file => (
            <div 
              key={file.id} 
              onClick={() => handlePreview(file.id)}
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
                 <button className="p-3 hover:bg-black/5 rounded-full transition-all">
                  <DownloadCloudIcon size={16} />
                 </button>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     handleDeleteFile(file.id);
                   }} 
                   className="p-3 hover:bg-red-50 text-red-500 rounded-full transition-all"
                 >
                  <Trash2 size={16} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function WorkspaceModal({ users, workspace, onClose, onSaved }: { 
  users: UserType[], 
  workspace?: Workspace, 
  onClose: () => void, 
  onSaved: () => void 
}) {
  const [name, setName] = useState(workspace?.name || "");
  const [permission, setPermission] = useState<WorkspacePermission>(workspace?.permission || 'Public');
  const [allowedAgents, setAllowedAgents] = useState<string[]>(workspace?.allowedAgents || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!workspace;
  const agents = users.filter((u: any) => u.role === 'agent' || u.role === 'admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await adminApi.updateWorkspace(workspace._id || workspace.id!, { name, permission, allowedAgents });
        onSaved();
      } else {
        await adminApi.createWorkspace({ name, permission, allowedAgents });
        onSaved();
      }
    } catch (error) {
       console.error(error);
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ scale: 0.9, opacity: 0 }}
         className="bg-white rounded-[40px] w-full max-w-xl p-6 space-y-6 shadow-2xl relative"
       >
          <button onClick={onClose} className="absolute right-8 top-8 p-2 hover:bg-black/5 rounded-full transition-colors"><X size={20} /></button>
          
          <div className="space-y-2">
             <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-black/40 text-center">Cloud Logistics</p>
             <h3 className="text-2xl font-space font-bold tracking-tighter uppercase text-center">{isEdit ? 'Edit Settings.' : 'New Workspace.'}</h3>
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
                  className="w-full bg-black/5 border border-black/5 rounded-[16px] px-4 py-4 text-sm font-bold focus:outline-none focus:bg-black/10 transition-all"
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
                        className={`py-2 px-4 rounded-xl text-[10px] font-medium uppercase tracking-widest border transition-all ${permission === p ? 'bg-black text-white border-black' : 'bg-white border-black/5 text-black/30 hover:border-black/20'}`}
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
               className="w-full bg-black text-white py-4 rounded-[16px] font-bold text-xs tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20 disabled:opacity-20 mt-4"
             >
                {isSubmitting ? "Processing..." : "Update Workspace ↗"}
             </button>
          </form>
       </motion.div>
    </div>
  );
}