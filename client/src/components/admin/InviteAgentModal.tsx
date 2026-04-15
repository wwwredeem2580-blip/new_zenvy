/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';
import { mockApi } from '../../lib/api/mockApi';

export function InviteAgentModal({ onClose, onInvited }: { onClose: () => void, onInvited: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const result = await mockApi.inviteAgent(email, name);
      setInviteLink(result.inviteLink);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ scale: 0.9, opacity: 0 }}
         className="bg-white rounded-[40px] w-full max-w-xl p-12 space-y-10 shadow-2xl relative"
       >
          <button onClick={onClose} className="absolute right-8 top-8 p-2 hover:bg-black/5 rounded-full transition-colors"><X size={20} /></button>
          
          <div className="space-y-2">
             <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-black/40 text-center">Team Expansion</p>
             <h3 className="text-4xl font-space font-bold tracking-tighter uppercase text-center">Invite Agent.</h3>
          </div>

          {!inviteLink ? (
             <form onSubmit={handleInvite} className="space-y-8">
                <div className="space-y-4">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-black/20 px-1">Agent Full Name</label>
                   <input 
                     type="text" 
                     required
                     value={name}
                     onChange={e => setName(e.target.value)}
                     placeholder="John Smith"
                     className="w-full bg-black/5 border border-black/5 rounded-[24px] px-8 py-5 text-lg font-bold focus:outline-none"
                   />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-black/20 px-1">Email Address</label>
                   <input 
                     type="email" 
                     required
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                     placeholder="agent@smartcaf.it"
                     className="w-full bg-black/5 border border-black/5 rounded-[24px] px-8 py-5 text-lg font-bold focus:outline-none"
                   />
                </div>
                <button 
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-black text-white py-6 rounded-[24px] font-bold text-sm tracking-[0.2em] uppercase hover:scale-[1.02] shadow-2xl shadow-black/20"
                >
                   {isSending ? "Generating Invite..." : "Send Invitation Link ↗"}
                </button>
             </form>
          ) : (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-green-50 p-8 rounded-[32px] border border-green-100 space-y-4">
                   <div className="flex items-center gap-3 text-green-600">
                      <CheckCircle2 size={24} />
                      <span className="font-bold text-sm uppercase tracking-widest">Invitation Ready</span>
                   </div>
                   <p className="text-sm text-green-800/60 leading-relaxed">
                      Copy the link below and send it to your new agent. They can use it to set their password and join the hub.
                   </p>
                </div>
                <div className="p-6 bg-black/5 rounded-2xl break-all font-mono text-[10px] border border-black/5 select-all cursor-pointer hover:bg-black/10 transition-colors" title="Click to select all">
                   {inviteLink}
                </div>
                <button onClick={onInvited} className="w-full py-4 rounded-xl border-2 border-black font-bold text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                   Done
                </button>
             </div>
          )}
       </motion.div>
    </div>
  );
}