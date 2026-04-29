/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Circle, 
  CheckCircle2, 
  Clock, 
  User, 
  Shield, 
  AlertCircle,
  TrendingUp,
  FileText,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { Application, ActivityLogEntry, ActivityType } from '../../data/applications';

interface ActivityTimelineProps {
  application: Application;
}

export function ActivityTimeline({ application }: ActivityTimelineProps) {
  const log = application.activityLog || [];
  
  // Sort log by timestamp (newest at bottom for timeline flow, but user wants oldest at top)
  // Wait, user said "oldest at top, newest at bottom" for notes, presumably same for activity log timeline.
  const sortedLog = [...log].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const getDotColor = (type: ActivityType) => {
    switch (type) {
      case 'status': return 'bg-blue-500';
      case 'financial': return 'bg-green-500';
      case 'document': return 'bg-yellow-500';
      case 'note': return 'bg-gray-400';
      case 'reassignment': return 'bg-purple-500';
      case 'system': return 'bg-red-500'; // Usually errors or critical rejections
      default: return 'bg-gray-200';
    }
  };

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'status': return <TrendingUp size={10} className="text-white" />;
      case 'financial': return <CreditCard size={10} className="text-white" />;
      case 'document': return <FileText size={10} className="text-white" />;
      case 'note': return <MessageSquare size={10} className="text-white" />;
      case 'reassignment': return <User size={10} className="text-white" />;
      case 'system': return <AlertCircle size={10} className="text-white" />;
      default: return <Circle size={10} className="text-white" />;
    }
  };

  // Lifecycle Summary Logic
  const statusChanges = sortedLog.filter(l => l.type === 'status' || (l.type === 'system' && l.description.includes('submitted')));
  const startTime = statusChanges.length > 0 ? new Date(statusChanges[0].timestamp) : null;
  const endTime = application.status === 'Approved' || application.status === 'Rejected' 
    ? new Date(sortedLog[sortedLog.length - 1]?.timestamp) 
    : new Date();
    
  const totalDays = startTime ? Math.max(0, Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Lifecycle Summary Strip */}
      <div className="bg-black/5 rounded-3xl p-6 border border-black/5">
         <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-black/40">Lifecycle Overview</span>
            <span className="text-[10px] font-bold px-3 py-1 bg-white rounded-full shadow-sm">
               Total Time: {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
            </span>
         </div>
         
         <div className="flex items-center gap-2">
            {statusChanges.length > 0 ? (
               statusChanges.map((entry, i) => (
                  <React.Fragment key={entry.id}>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold truncate max-w-[80px]">
                           {entry.description.includes('submitted') ? 'Submitted' : entry.description.split('→ ').pop()?.split(' by')[0]}
                        </span>
                        <span className="text-[8px] text-black/30 font-bold uppercase">
                           {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                     </div>
                     {i < statusChanges.length - 1 && (
                        <div className="h-0.5 w-6 bg-black/10 rounded-full" />
                     )}
                  </React.Fragment>
               ))
            ) : (
               <p className="text-[10px] text-black/40 italic">No status transitions recorded yet.</p>
            )}
         </div>
      </div>

      {/* Timeline Feed */}
      <div className="relative pl-4 space-y-8">
        {/* The Vertical Line */}
        <div className="absolute left-6 top-2 bottom-2 w-px bg-black/5" />

        {sortedLog.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-black/20 gap-4">
             <Clock size={32} />
             <p className="text-[10px] uppercase tracking-widest font-bold">Waiting for system activity...</p>
          </div>
        ) : (
          sortedLog.map((entry, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              key={entry.id} 
              className="relative pl-8 flex flex-col gap-1"
            >
              {/* Dot */}
              <div className={`absolute left-0 top-1 w-4 h-4 rounded-full ${getDotColor(entry.type)} flex items-center justify-center shadow-lg shadow-black/10 z-10`}>
                 {getIcon(entry.type)}
              </div>

              {/* Content */}
              <div className="flex justify-between items-start">
                 <p className="text-sm font-bold text-black/80 leading-relaxed max-w-[80%]">
                    {entry.description}
                 </p>
                 <span className="text-[9px] font-bold text-black/30 uppercase mt-1 shrink-0">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
              </div>
              
              <div className="flex items-center gap-2">
                 <span className="text-[8px] uppercase tracking-widest font-bold py-0.5 px-2 bg-black/5 rounded-md text-black/40">
                    {entry.actorName}
                 </span>
                 {index === sortedLog.length - 1 && (
                    <span className="text-[8px] uppercase tracking-widest font-bold text-blue-500 py-0.5 px-2 bg-blue-50 rounded-md">
                       Latest
                    </span>
                 )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
