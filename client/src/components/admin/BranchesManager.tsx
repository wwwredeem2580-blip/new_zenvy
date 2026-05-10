"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, MapPin, CheckCircle, Globe } from "lucide-react";
import { branchApi, Branch } from "@/lib/api/branchApi";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function BranchesManager() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const res = await branchApi.listAdminBranches();
      if (res.success) {
        setBranches(res.branches);
      }
    } catch (error) {
      toast.error("Failed to load branches");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;
    try {
      await branchApi.deleteBranch(id);
      toast.success("Branch deleted successfully");
      fetchBranches();
    } catch (error) {
      toast.error("Failed to delete branch");
    }
  };

  const openModal = (branch?: Branch) => {
    setEditingBranch(branch || null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="p-8 text-text/40 font-bold uppercase tracking-widest text-xs">Loading branches...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-space font-bold tracking-tight">Branches Management</h2>
          <p className="text-sm text-text/40 font-light mt-1">Manage office locations and set the main branch.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-text text-bg px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-text/10"
        >
          <Plus size={16} /> Add Branch
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {branches.map(branch => (
          <div key={branch._id} className={`p-6 rounded-[24px] border transition-all ${branch.isMain ? 'bg-text text-bg border-text' : 'bg-surface border-border text-text'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg leading-tight">{branch.name}</h3>
                {branch.isMain && <span className="text-[10px] font-bold uppercase tracking-widest text-bg/60 bg-bg/10 px-2 py-0.5 rounded-sm mt-1 inline-block">Main Branch</span>}
                {!branch.isActive && <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded-sm mt-1 inline-block ml-2">Inactive</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal(branch)} className={`p-1.5 rounded-full transition-colors ${branch.isMain ? 'hover:bg-bg/10 text-bg/60' : 'hover:bg-text/5 text-text/40'}`}>
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(branch._id)} className={`p-1.5 rounded-full transition-colors hover:bg-red-500/10 hover:text-red-500 ${branch.isMain ? 'text-bg/60' : 'text-text/40'}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-start gap-2">
                <MapPin size={14} className={`mt-0.5 ${branch.isMain ? 'text-bg/40' : 'text-text/40'}`} />
                <span className={`text-sm ${branch.isMain ? 'text-bg/80' : 'text-text/80'}`}>{branch.address}</span>
              </div>
              {branch.phone && (
                <div className={`text-xs ${branch.isMain ? 'text-bg/60' : 'text-text/60'}`}>{branch.phone}</div>
              )}
              {branch.email && (
                <div className={`text-xs ${branch.isMain ? 'text-bg/60' : 'text-text/60'}`}>{branch.email}</div>
              )}
              {branch.workingHours && (
                <div className={`text-xs ${branch.isMain ? 'text-bg/60' : 'text-text/60'}`}>Hours: {branch.workingHours}</div>
              )}
            </div>
            {branch.googleMapsUrl && (
              <a href={branch.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={`mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${branch.isMain ? 'text-bg hover:text-bg/80' : 'text-blue-500 hover:text-blue-600'}`}>
                <Globe size={14} /> View on Map
              </a>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <BranchModal 
          branch={editingBranch} 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => {
            setIsModalOpen(false);
            fetchBranches();
          }} 
        />
      )}
    </div>
  );
}

function BranchModal({ branch, onClose, onSave }: { branch: Branch | null, onClose: () => void, onSave: () => void }) {
  const [formData, setFormData] = useState({
    name: branch?.name || "",
    address: branch?.address || "",
    phone: branch?.phone || "",
    email: branch?.email || "",
    workingHours: branch?.workingHours || "",
    googleMapsUrl: branch?.googleMapsUrl || "",
    isMain: branch?.isMain || false,
    isActive: branch?.isActive ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (branch) {
        await branchApi.updateBranch(branch._id, formData);
        toast.success("Branch updated successfully");
      } else {
        await branchApi.createBranch(formData);
        toast.success("Branch created successfully");
      }
      onSave();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface border border-border rounded-[32px] p-8 max-w-md w-full shadow-2xl relative"
      >
        <h3 className="text-2xl font-space font-bold mb-6">{branch ? "Edit Branch" : "Add Branch"}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 mb-1 block">Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text/30" placeholder="e.g. Main Branch" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 mb-1 block">Address *</label>
            <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text/30" placeholder="e.g. Via Roma 1, Rome" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 mb-1 block">Phone</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text/30" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 mb-1 block">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text/30" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 mb-1 block">Working Hours</label>
            <input type="text" value={formData.workingHours} onChange={e => setFormData({...formData, workingHours: e.target.value})} className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text/30" placeholder="e.g. Mon-Fri 9:00 - 18:00" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 mb-1 block">Google Maps URL</label>
            <input type="url" value={formData.googleMapsUrl} onChange={e => setFormData({...formData, googleMapsUrl: e.target.value})} className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text/30" placeholder="https://maps.google.com/..." />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isMain} onChange={e => setFormData({...formData, isMain: e.target.checked})} className="w-4 h-4 rounded border-border" />
              <span className="text-sm font-medium">Set as Main Branch</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 rounded border-border" />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-border rounded-xl text-sm font-bold hover:bg-black/5">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-text text-bg rounded-xl text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Branch"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
