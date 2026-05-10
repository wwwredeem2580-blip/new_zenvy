/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Loader2, UserPlus, Mail, Phone, ChevronRight, User } from 'lucide-react';
import { adminApi } from '../../lib/api/adminApi';
import { toast } from 'sonner';

import { User as UserType } from '../../types/user';

interface UserLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: UserType) => void;
}

export function UserLookupModal({ isOpen, onClose, onSelect }: UserLookupModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = async () => {
    if (query.length < 3) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await adminApi.findUser(query);
      setResults(res.users);
    } catch (err) {
      console.error(err);
      toast.error('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await adminApi.createMinimalUser(formData);
      toast.success('Minimal account created');
      onSelect(res.user);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-xl bg-white rounded-sm shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-black/5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-space font-bold uppercase tracking-tight">Client Lookup</h2>
                <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-1">Search existing or create new</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-sm"><X size={20}/></button>
            </div>

            <div className="p-8">
              {!showCreateForm ? (
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search by email or phone..."
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        if (hasSearched) setHasSearched(false);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-12 pr-24 py-4 bg-black/[0.02] border border-black/10 rounded-sm text-sm focus:outline-none focus:border-black transition-all"
                    />
                    <button 
                      onClick={handleSearch}
                      disabled={isSearching || query.length < 3}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-sm disabled:opacity-20"
                    >
                      {isSearching ? <Loader2 size={12} className="animate-spin" /> : 'Search'}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {results.length > 0 ? (
                      results.map((u: UserType) => (
                        <button 
                          key={u.id || (u as any)._id}
                          onClick={() => onSelect(u)}
                          className="w-full flex items-center justify-between p-4 bg-white border border-black/5 rounded-sm hover:border-black transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-sm bg-black/5 flex items-center justify-center text-black/20 group-hover:bg-black group-hover:text-white transition-all">
                              <User size={18} />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-bold">{u.firstName} {u.lastName}</p>
                              <p className="text-[10px] text-black/40 font-medium">{u.email}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-black/10 group-hover:text-black transition-all" />
                        </button>
                      ))
                    ) : hasSearched && !isSearching && (
                      <div className="text-center py-12 bg-black/[0.01] rounded-sm border border-dashed border-black/5">
                        <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">No clients found</p>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => setShowCreateForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-6 border border-dashed border-black/20 rounded-sm text-[10px] font-bold uppercase tracking-widest text-black/40 hover:bg-black/5 hover:text-black transition-all"
                  >
                    <UserPlus size={16} /> Create Minimal Account for New Client
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">First Name</label>
                      <input 
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-3 bg-black/[0.02] border border-black/10 rounded-sm text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Last Name</label>
                      <input 
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-3 bg-black/[0.02] border border-black/10 rounded-sm text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Email Address</label>
                    <input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-black/[0.02] border border-black/10 rounded-sm text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Phone Number (Optional)</label>
                    <input 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-black/[0.02] border border-black/10 rounded-sm text-sm"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 py-4 border border-black/10 rounded-sm text-[10px] font-bold uppercase tracking-widest text-black/40 hover:bg-black/5 transition-all"
                    >
                      Back to Search
                    </button>
                    <button 
                      type="submit"
                      disabled={isCreating}
                      className="flex-1 py-4 bg-black text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-black/90 transition-all flex items-center justify-center gap-2"
                    >
                      {isCreating && <Loader2 size={12} className="animate-spin" />}
                      Create & Continue
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
