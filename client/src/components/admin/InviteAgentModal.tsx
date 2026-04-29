/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, UserPlus, ShieldCheck } from 'lucide-react';
import { adminApi } from '@/lib/api/adminApi';

export function InviteAgentModal({ onClose, onInvited }: { onClose: () => void, onInvited: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<'agent' | 'admin'>('agent');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await adminApi.createInvitation(email, role);
      setIsSuccess(true);
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
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
             <h3 className="text-2xl font-space font-bold tracking-tighter uppercase text-center">Invite Agent.</h3>
          </div>

          {!isSuccess ? (
             <form onSubmit={handleInvite} className="space-y-8">
                <div className="space-y-4">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-black/20 px-1">Designated Role</label>
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button" 
                        onClick={() => setRole('agent')}
                        className={`flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all ${role === 'agent' ? 'bg-black text-white border-black' : 'bg-white text-black/30 border-black/5 hover:border-black/20'}`}
                      >
                         <UserPlus size={16} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Agent</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setRole('admin')}
                        className={`flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all ${role === 'admin' ? 'bg-black text-white border-black' : 'bg-white text-black/30 border-black/5 hover:border-black/20'}`}
                      >
                         <ShieldCheck size={16} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Admin</span>
                      </button>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-black/20 px-1">Email Address</label>
                   <input 
                     type="email" 
                     required
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                     placeholder="agent@smartcaf.it"
                     className="w-full bg-black/5 border border-black/5 rounded-[24px] px-8 py-5 text-lg font-bold focus:outline-none focus:bg-black/10 transition-all"
                   />
                </div>

                <button 
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-black text-white py-6 rounded-[24px] font-bold text-sm tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20 disabled:opacity-20"
                >
                   {isSending ? "Sending Invite..." : "Confirm Invitation ↗"}
                </button>
             </form>
          ) : (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-green-50 p-8 rounded-[40px] border border-green-100 flex flex-col items-center text-center space-y-6">
                   <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-200">
                      <CheckCircle2 size={40} />
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-2xl font-space font-bold tracking-tighter uppercase">Invitation Sent.</h4>
                      <p className="text-xs text-green-800/60 leading-relaxed max-w-xs mx-auto">
                        A secure onboarding link has been sent to <strong>{email}</strong>. 
                        The recipient can use it to set up their staff profile.
                      </p>
                   </div>
                </div>
                <button onClick={onInvited} className="w-full py-6 rounded-[24px] bg-black text-white font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">
                   Back to Agents
                </button>
             </div>
          )}
       </motion.div>
    </div>
  );
}