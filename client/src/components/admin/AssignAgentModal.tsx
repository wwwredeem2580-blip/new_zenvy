"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, Check, Users, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { adminApi, AgentWorkload } from '../../lib/api/adminApi';
import { applicationApi } from '../../lib/api/applicationApi';
import { getAvatarUrl } from '../../lib/utils';

interface AssignAgentModalProps {
  applicationId: string;
  onClose: () => void;
  onAssigned: () => void;
}

export function AssignAgentModal({ applicationId, onClose, onAssigned }: AssignAgentModalProps) {
  const [agents, setAgents] = useState<AgentWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.listAgents();
      setAgents(data.agents);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (agentId: string) => {
    setIsProcessing(agentId);
    try {
      const res = await applicationApi.assignAgent(applicationId, agentId);
      if (res.success) {
        onAssigned();
      }
    } catch (e) {
      console.error(e);
      alert(typeof e === 'string' ? e : (e as any).message || "Failed to assign agent");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-sm w-full max-w-xl p-10 lg:p-16 border border-black/10 shadow-2xl relative flex flex-col max-h-[90vh]"
      >
        <button 
          onClick={onClose} 
          className="absolute right-10 top-10 p-3 hover:bg-black/5 rounded-sm transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-2 mb-10">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-black/20">Delegation Hub</p>
          <h3 className="text-4xl font-space font-bold tracking-tighter uppercase">Assign Agent</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Select an agent to manage this application</p>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
             <Loader2 size={32} className="animate-spin text-black/10" />
             <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Loading workforce data...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center text-black/20">
                <Users size={32} />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">No sub-agents available</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {agents.map((agent) => (
               <button
                 key={agent.id}
                 disabled={!!isProcessing}
                 onClick={() => handleAssign(agent.id)}
                 className="w-full flex items-center justify-between p-6 bg-black/[0.02] border border-black/10 rounded-sm hover:bg-white hover:border-black/30 hover:shadow-2xl transition-all group pointer-events-auto"
               >
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-sm bg-white border border-black/10 overflow-hidden shadow-sm shrink-0 flex items-center justify-center">
                       <img 
                          src={getAvatarUrl(agent.firstName || agent.email, (agent as any).avatar)} 
                          alt={agent.firstName}
                          className="w-full h-full object-cover"
                       />
                    </div>
                    <div className="text-left">
                       <span className="block font-bold text-sm">{agent.firstName} {agent.lastName}</span>
                       <span className="block text-[8px] uppercase tracking-widest font-bold text-black/30">{agent.email}</span>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="text-right">
                       <div className={`text-[9px] font-bold uppercase tracking-widest ${agent.activeWorkload === 0 ? 'text-green-500' : 'text-orange-500'}`}>
                          {agent.activeWorkload === 0 ? 'Free' : `${agent.activeWorkload} Active`}
                       </div>
                       <p className="text-[7px] uppercase font-bold text-black/20">Current Workload</p>
                    </div>
                    <div className="w-10 h-10 rounded-sm bg-black flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                       {isProcessing === agent.id ? <Loader2 size={12} className="animate-spin" /> : <ChevronRight size={14} />}
                    </div>
                 </div>
               </button>
            ))}
          </div>
        )}

        <div className="mt-12 p-8 bg-blue-50 border border-blue-100 rounded-sm flex items-start gap-5">
           <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
           <p className="text-[10px] leading-relaxed text-blue-800/80">
              <span className="font-bold">Smart Suggestion:</span> Assign to agents marked as <span className="font-bold">"Free"</span> to ensure faster processing times and balanced team distribution.
           </p>
        </div>
      </motion.div>
    </div>
  );
}
