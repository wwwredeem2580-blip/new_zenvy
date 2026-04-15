/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { User as UserType, AgentPermissions } from '../../lib/api/mockApi';
import { mockApi } from '../../lib/api/mockApi';

export function PermissionsModal({ 
  user, 
  onClose, 
  onSaved 
}: { 
  user: UserType, 
  onClose: () => void, 
  onSaved: () => void 
}) {
  const [overrides, setOverrides] = useState<Partial<AgentPermissions>>(user.permissions || {});
  const [isSaving, setIsSaving] = useState(false);

  const effective = mockApi.getEffectivePermissions({ ...user, permissions: overrides });

  const toggle = (key: keyof AgentPermissions) => {
    setOverrides((prev: any) => ({
       ...prev,
       [key]: !effective[key]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await mockApi.updateUserPermissions(user.id, overrides);
    onSaved();
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ scale: 0.9, opacity: 0 }}
         className="bg-white rounded-[40px] w-full max-w-xl p-12 space-y-10 shadow-2xl relative"
       >
          <button onClick={onClose} className="absolute right-8 top-8 p-2 hover:bg-black/5 rounded-full transition-colors"><X size={20} /></button>
          
          <div className="space-y-2">
             <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-black/40 text-center">Override Management</p>
             <h3 className="text-4xl font-space font-bold tracking-tighter uppercase text-center">Permissions.</h3>
             <p className="text-sm text-black/40 font-light text-center">Configuring agent: <span className="text-black font-bold">{user.firstName} {user.lastName}</span></p>
          </div>

          <div className="space-y-3">
             {Object.entries(effective).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-5 bg-black/[0.02] border border-black/5 rounded-[24px]">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                   <button 
                     onClick={() => toggle(key as any)}
                     className={`w-12 h-6 rounded-full relative transition-colors ${val ? 'bg-black' : 'bg-black/10'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${val ? 'right-1' : 'left-1'}`} />
                   </button>
                </div>
             ))}
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-black text-white py-6 rounded-[24px] font-bold text-sm tracking-[0.2em] uppercase shadow-2xl"
          >
             {isSaving ? "Saving..." : "Apply Changes ↗"}
          </button>
       </motion.div>
    </div>
  );
}