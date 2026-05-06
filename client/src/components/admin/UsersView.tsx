/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState } from 'react';
import { Search, TrendingUp, Shield, User, Clock, X } from 'lucide-react';
import { User as UserType } from '../../types/user';
import { adminApi } from '../../lib/api/adminApi';
import UserAvatar from '../ui/UserAvatar';

type RoleFilter = 'all' | 'client' | 'agent' | 'admin';

export function UsersView({ 
  users, 
  invitations = [],
  roleFilter, 
  setRoleFilter, 
  onIssueCredit, 
  onManagePermissions, 
  onRevokeInvite,
  onRefresh 
}: { 
  users: UserType[], 
  invitations?: any[],
  roleFilter: RoleFilter, 
  setRoleFilter: (filter: RoleFilter) => void, 
  onIssueCredit: (user: UserType) => void, 
  onManagePermissions: (user: UserType) => void, 
  onRevokeInvite?: (id: string) => void,
  onRefresh: () => void 
}) {
  const [search, setSearch] = useState("");
  
  const filtered = users.filter((u: UserType) => {
    const matchesSearch = u.firstName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: 'client' | 'agent' | 'admin') => {
    try {
      const response = await adminApi.updateUserRole(userId, newRole);
      if (response.success) {
        onRefresh();
      }
    } catch (e) {
      console.error("Failed to update role", e);
      alert("Failed to update user role");
    }
  };

  return (
    <div className="space-y-2">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-black/5 pb-12">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-black/20" size={20} />
             <input 
               type="text" 
               placeholder="Search registry..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-8 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder:text-black/40"
             />
          </div>

          <div className="flex items-center gap-2 p-1 bg-black/5 rounded-2xl">
             {(['all', 'client', 'agent', 'admin'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${roleFilter === role ? 'bg-white text-black shadow-sm' : 'text-black/30 hover:text-black'}`}
                >
                   {role === 'agent' ? 'Agents' : role + 's'}
                </button>
             ))}
          </div>
       </div>

       <div className="space-y-0.5">
          {invitations.length > 0 && (roleFilter === 'all' || roleFilter === 'agent' || roleFilter === 'admin') && (
            <div className="mb-8">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-black/40 mb-4 px-4">Pending Invitations</h3>
              <div className="space-y-0.5">
                {invitations.map((invite: any) => (
                  <div key={invite._id} className="group flex items-center justify-between py-4 px-4 bg-orange-50/50 hover:bg-orange-50 border-b border-orange-100 transition-all rounded-xl">
                    <div className="flex items-center gap-10">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500">
                        <Clock size={16} />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-md font-bold tracking-tight text-orange-900">Pending Invite</span>
                         <span className="text-[9px] max-w-[150px] overflow-hidden text-ellipsis text-orange-900/60 font-bold tracking-widest">{invite.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-16">
                      <div className="flex flex-col items-end">
                         <span className="text-xs font-space font-bold uppercase text-orange-600">{invite.role}</span>
                         <span className="text-[8px] uppercase tracking-widest font-bold text-orange-900/40">Role</span>
                      </div>
                      <div className="h-10 w-px bg-orange-200" />
                      <div className="flex items-center gap-6">
                        {onRevokeInvite && (
                           <button 
                             onClick={() => onRevokeInvite(invite._id)}
                             className="p-3 hover:bg-red-100 text-red-500 rounded-xl transition-all"
                             title="Revoke Invitation"
                           >
                             <X size={16} />
                           </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filtered.map((user: UserType) => (
             <div 
                key={user.id} 
                className="group flex items-center justify-between py-4 px-4 hover:bg-black/[0.02] border-b border-black/5 transition-all"
             >
                <div className="flex items-center gap-10">
                   <div className="relative">
                      <UserAvatar 
                        name={user.firstName || user.email} 
                        src={user.avatar} 
                        size={32} 
                        className="rounded-lg"
                      />
                      {user.role === 'admin' && (
                         <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center">
                            <Shield size={10} className="text-white" />
                         </div>
                      )}
                      {user.role === 'agent' && (
                         <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                            <User size={10} className="text-white" />
                         </div>
                      )}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-md font-bold tracking-tight">{user.firstName} {user.lastName}</span>
                      <span className="text-[9px] max-w-[150px] overflow-hidden text-ellipsis text-black/60 font-bold tracking-widest">{user.email}</span>
                   </div>
                </div>

                <div className="flex items-center gap-16">
                   <div className="flex flex-col items-end">
                      <span className="text-xl font-space font-bold">€{(user.balance || 0).toFixed(2)}</span>
                      <span className="text-[8px] uppercase tracking-widest font-bold text-black/20">Liquidity</span>
                   </div>

                   <div className="h-10 w-px bg-black/5" />

                   <div className="flex items-center gap-6">
                      <div className="flex flex-col gap-1">
                         <span className="text-[8px] uppercase tracking-widest font-bold text-black/20">Assign Role</span>
                         <select 
                           value={user.role}
                           onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                           className="bg-transparent text-[10px] font-bold uppercase tracking-widest focus:outline-none appearance-none cursor-pointer hover:text-blue-600 transition-colors"
                         >
                            <option value="client">User</option>
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                         </select>
                      </div>

                      {user.role === 'agent' && (
                         <button 
                           onClick={() => onManagePermissions(user)}
                           className="p-3 bg-black/5 rounded-xl hover:bg-black text-white transition-all text-[10px] font-bold uppercase"
                         >
                            Permissions
                         </button>
                      )}

                      <button 
                        onClick={() => onIssueCredit(user)}
                        className="p-3 hover:bg-black/5 rounded-xl transition-all"
                        title="Issue Credit"
                      >
                        <TrendingUp size={16} />
                      </button>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}