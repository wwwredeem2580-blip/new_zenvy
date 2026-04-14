/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ChevronRight, 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Globe,
  Hash,
  Home,
  Loader2
} from 'lucide-react';
import { Application, ApplicationStatus } from '../data/applications';
import { mockApi } from '../lib/api/mockApi';

export default function AdminPage({ onBack }: { onBack: () => void }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.getApplications();
      setApplications(data);
    } catch (error) {
      console.error("Failed to load applications", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || 
                         app.id.includes(search);
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, newStatus: ApplicationStatus) => {
    try {
      await mockApi.updateApplicationStatus(id, newStatus);
      // Update local state for immediate feedback
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <div className="text-text p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-space font-bold tracking-tighter">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search ID or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-surface border border-border rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-text/30 w-64 text-text"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-surface border border-border rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-text/30 text-text"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Reviewing">Reviewing</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 size={48} className="animate-spin text-text/20" />
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Fetching Applications...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 border-2 border-dashed border-border rounded-[32px]">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted">No applications found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApps.map(app => (
              <motion.div 
                key={app.id}
                layoutId={app.id}
                onClick={() => setSelectedApp(app)}
                className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:border-text/20 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center font-bold text-xs text-text border border-border">
                    {app.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-text">{app.name}</h3>
                    <p className="text-[10px] text-muted uppercase tracking-widest">ID: #{app.id} • {new Date(app.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <StatusBadge status={app.status} />
                  <ChevronRight size={16} className="text-muted group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[300] flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-bg/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-surface border-l border-border shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-space font-bold text-text">Application Details</h2>
                <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-bg rounded-full text-text transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-12">
                {/* Status Control */}
                <div className="bg-bg/50 p-6 rounded-3xl border border-border">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted mb-4">Current Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(["Pending", "Reviewing", "Approved", "Rejected"] as ApplicationStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selectedApp.id, s)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                          selectedApp.status === s 
                            ? 'bg-text text-bg scale-105' 
                            : 'bg-surface border border-border text-muted hover:border-text/20'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info Grid */}
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

                {/* Services */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted mb-4">Selected Services</p>
                  <div className="space-y-2">
                    {selectedApp.selectedServices.map((s, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-bg/30 rounded-2xl border border-border">
                        <span className="font-bold text-sm text-text">{s.name}</span>
                        <div className="text-right">
                          <span className="block text-xs font-bold text-text">€{s.price}</span>
                          <span className="text-[10px] text-muted">{s.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents Placeholder */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted mb-4">Documents</p>
                  <div className="grid grid-cols-2 gap-4">
                    {["Passport", "Permesso", "Codice Fiscale", "Contratto"].map(doc => (
                      <div key={doc} className="p-4 bg-bg/30 rounded-2xl border border-border flex items-center gap-3">
                        <FileText size={16} className="text-muted" />
                        <span className="text-xs font-medium text-text">{doc}</span>
                        <CheckCircle2 size={14} className="ml-auto text-green-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
      <p className="text-[10px] uppercase tracking-widest font-bold text-muted flex items-center gap-2">
        {icon} {label}
      </p>
      <p className="text-sm font-medium text-text">{value || "N/A"}</p>
    </div>
  );
}
