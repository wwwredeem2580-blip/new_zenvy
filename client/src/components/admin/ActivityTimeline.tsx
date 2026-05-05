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
    <div className="space-y-6">
      {/* Timeline Feed */}
      <div className="relative pl-3 space-y-6">
        {/* Vertical Line */}
        <div className="absolute left-[5.5px] top-2 bottom-2 w-px bg-black/10" />

        {sortedLog.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-black/20 gap-3">
             <Clock size={24} />
             <p className="text-[10px] uppercase tracking-widest font-bold">No activity recorded</p>
          </div>
        ) : (
          sortedLog.reverse().map((entry, index) => (
            <div 
              key={(entry as any)._id || entry.id || `${entry.timestamp}-${index}`} 
              className="relative pl-8 flex flex-col gap-1"
            >
              {/* Dot */}
              <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-sm bg-black border-2 border-white shadow-sm z-10`} />

              {/* Content Row */}
              <div className="flex justify-between items-start gap-4">
                 <div className="flex flex-col">
                    <p className="text-sm font-bold text-black/80 leading-snug tracking-tight">
                       {entry.description}
                    </p>
                    {entry.type === 'financial' && (
                       <p className="text-[10px] font-medium text-black/40 mt-0.5">
                          Payment Status: {application.paymentStatus}
                       </p>
                    )}
                 </div>
                 <span className="text-[10px] font-bold text-black/20 uppercase mt-0.5 shrink-0 tracking-widest">
                    {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) === new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      ? new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    }
                 </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
