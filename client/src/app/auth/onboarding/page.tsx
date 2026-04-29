/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ShieldCheck, UserPlus, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/api/authApi';
import { useAuth } from '@/context/AuthContext';

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { setUser } = useAuth();

  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
  });

  useEffect(() => {
    if (!token) {
      setError("No invitation token found.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await authApi.verifyInvitation(token);
        if (res.success) {
          setInvitation(res.invitation);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Invalid or expired invitation.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await authApi.registerAgent({
        ...formData,
        token
      });

      if (res.success) {
        setIsSuccess(true);
        // We could log them in automatically
        if (res.user) {
          setUser(res.user);
          router.push(res.user.role === 'admin' ? '/admin' : '/agent');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="text-white/20 animate-spin" size={48} />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="space-y-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto border border-red-500/20">
            <ShieldCheck className="text-red-500" size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-white text-4xl font-space font-bold tracking-tighter uppercase">Access Denied.</h1>
            <p className="text-white/40 max-w-xs mx-auto text-sm">{error || "This invitation link is no longer valid."}</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-white text-black rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
          >
            Back to Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="bg-black p-12 text-center space-y-4">
           <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center mx-auto backdrop-blur-md border border-white/5">
             {invitation.role === 'admin' ? <ShieldCheck className="text-white" size={32} /> : <UserPlus className="text-white" size={32} />}
           </div>
           <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Official Onboarding</p>
              <h2 className="text-white text-4xl font-space font-bold tracking-tighter uppercase">Welcome to Smart CAF.</h2>
           </div>
           <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Joining as {invitation.role}</span>
           </div>
        </div>

        <div className="p-12 space-y-10">
           <div className="bg-black/5 p-6 rounded-[24px] border border-black/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
                 <Mail size={20} />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] uppercase tracking-widest font-bold text-black/30">Verified Email</span>
                 <span className="text-sm font-bold">{invitation.email}</span>
              </div>
           </div>

           <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-black/20 pl-1">First Name</label>
                    <input 
                      required
                      type="text"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      placeholder="John"
                      className="w-full bg-black/5 border border-black/5 rounded-[16px] px-6 py-4 text-sm font-bold focus:outline-none focus:bg-black/10 transition-all"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-black/20 pl-1">Last Name</label>
                    <input 
                      required
                      type="text"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      placeholder="Doe"
                      className="w-full bg-black/5 border border-black/5 rounded-[16px] px-6 py-4 text-sm font-bold focus:outline-none focus:bg-black/10 transition-all"
                    />
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] uppercase tracking-widest font-bold text-black/20 pl-1">Create Password</label>
                 <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                    <input 
                      required
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full bg-black/5 border border-black/5 rounded-[24px] pl-14 pr-6 py-5 text-sm font-bold focus:outline-none focus:bg-black/10 transition-all"
                    />
                 </div>
              </div>

              {error && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">{error}</p>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-6 rounded-[24px] font-bold text-sm tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20 disabled:opacity-20"
              >
                 {isSubmitting ? "Orchestrating Account..." : "Join the Team ↗"}
              </button>
           </form>
        </div>
      </motion.div>
    </div>
  );
}
