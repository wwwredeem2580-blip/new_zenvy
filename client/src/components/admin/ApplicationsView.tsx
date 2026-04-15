/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { Application, ApplicationStatus } from '../../data/applications';

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
  const filtered = applications.filter((app: Application) => 
    app.name.toLowerCase().includes(search.toLowerCase()) || app.id.includes(search)
  );

  return (
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
      </div>

      <div className="space-y-0.5">
         {filtered.map((app: Application) => (
            <motion.div 
               key={app.id} 
               onClick={() => onSelect(app)}
               className="group flex items-center justify-between py-4 px-4 border-b border-black/5 hover:bg-black/[0.02] transition-all cursor-pointer"
            >
               <div className="flex items-center gap-12">
                  <span className="text-[10px] max-w-[20px] sm:max-w-none font-mono font-bold text-black/50">#{app.id}</span>
                  <div className="flex flex-col">
                     <span className="text-sm font-bold">{app.name}</span>
                     <span className="text-[10px] uppercase tracking-widest font-bold text-black/30">{new Date(app.submittedAt).toLocaleDateString()}</span>
                  </div>
               </div>

               <div className="flex items-center gap-12">
                  <StatusPill status={app.status} />
                  <ChevronRight size={12} className="text-black/40 group-hover:text-black transition-all" />
               </div>
            </motion.div>
         ))}
      </div>
    </div>
  );
}