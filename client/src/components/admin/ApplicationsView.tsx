/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { Application, ApplicationStatus } from '../../data/applications';
import { ExportModal } from './ExportModal';
import UserAvatar from '../ui/UserAvatar';

function StatusPill({ status }: { status: ApplicationStatus }) {
  const colors: Record<ApplicationStatus, string> = {
    Pending: "bg-yellow-500",
    Reviewing: "bg-blue-500",
    Approved: "bg-green-500",
    Rejected: "bg-red-500"
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">{status}</span>
    </div>
  );
}

export function ApplicationsView({ applications, onSelect }: { applications: Application[], onSelect: (app: Application) => void }) {
  const [search, setSearch] = useState("");
  const [isExportOpen, setIsExportOpen] = useState(false);

  const filtered = applications.filter((app: Application) => 
    app.name.toLowerCase().includes(search.toLowerCase()) || (app.applicationId || "").includes(search)
  );

  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between items-center border-b border-black/5 pb-12">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-black/20" size={20} />
              <input 
                type="text" 
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder:text-black/40"
              />
           </div>

           {/* Export Button */}
           <button
             onClick={() => setIsExportOpen(true)}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-sm text-[10px] font-bold uppercase tracking-widest text-black/60 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
           >
             <FileSpreadsheet size={14} />
             Export Excel
           </button>
        </div>

        <div className="space-y-0.5">
           {filtered.map((app: Application) => (
              <motion.div 
                 key={app.applicationId} 
                 onClick={() => onSelect(app)}
                 className="group flex items-center justify-between py-4 px-4 border-b border-black/5 hover:bg-black/[0.02] transition-all cursor-pointer"
              >
                 <div className="flex items-center gap-12">
                    <span className="text-[10px] max-w-[20px] sm:max-w-none font-mono font-bold text-black/50">#{app.applicationId}</span>
                    <div className="flex flex-col">
                       <span className="text-sm font-bold">{app.name}</span>
                       <span className="text-[10px] uppercase tracking-widest font-bold text-black/30">{new Date(app.createdAt || app.submittedAt).toLocaleDateString()}</span>
                    </div>
                 </div>

                 <div className="flex items-center gap-12">
                    <div className="flex items-center gap-4">
                       {app.status === 'Reviewing' && app.reviewerId && (
                          <div className="flex items-center gap-2 pr-4 border-r border-black/5">
                             <UserAvatar 
                                name={app.reviewerName || 'Agent'} 
                                src={app.reviewerAvatar} 
                                size={24} 
                                className="shrink-0"
                             />
                             <span className="text-[9px] font-bold text-black/40 hidden sm:block">
                                {app.reviewerName?.split(' ')[0]}
                             </span>
                          </div>
                       )}
                        <div className="flex flex-col items-end gap-0.5">
                           <StatusPill status={app.status} />
                           {app.paymentMethod && (
                              <span className="text-[8px] font-bold text-black/20 uppercase tracking-tighter">
                                 {app.paymentMethod} • {app.paymentStatus}
                              </span>
                           )}
                        </div>
                     </div>
                    <ChevronRight size={12} className="text-black/40 group-hover:text-black transition-all" />
                 </div>
              </motion.div>
           ))}
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {isExportOpen && (
          <ExportModal
            applications={applications}
            onClose={() => setIsExportOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}