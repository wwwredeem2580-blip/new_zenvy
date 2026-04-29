/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api/adminApi';
import { Loader2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function OverviewView() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const response = await adminApi.getAnalytics();
                if (response.success) {
                    setData(response.analytics);
                }
            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setLoading(false);
            }
        };
        loadAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-24">
               <Loader2 className="animate-spin text-black/20" size={32} />
            </div>
        );
    }

    if (!data) return null;

    const totalApps = Object.values(data.statuses).reduce((a: any, b: any) => a + b, 0);

    return (
        <div className="space-y-12">
            <div className="grid md:grid-cols-3 gap-12">
                <EditorialStat label="Total Applications" value={totalApps as string} trend="" />
                <EditorialStat label="Confirmed Revenue" value={`€${data.totalRevenue.toLocaleString()}`} trend="paid" />
                <EditorialStat label="Pending Revenue" value={`€${data.pendingRevenue.toLocaleString()}`} trend="outstanding" isWarning />
            </div>
            
            <div className="p-8 border border-black/5 rounded-[40px] bg-white">
               <h3 className="text-[10px] uppercase tracking-widest font-bold text-black/40 mb-8">Revenue Cashflow (7 Days)</h3>
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                         <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A0A0A0', fontWeight: 'bold' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A0A0A0', fontWeight: 'bold' }} dx={-10} tickFormatter={(value) => `€${value}`} />
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}
                       itemStyle={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}
                       labelStyle={{ fontSize: '10px', textTransform: 'uppercase', color: '#A0A0A0', fontWeight: 'bold', marginBottom: '4px' }}
                     />
                     <Area type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                <StatusCard label="Pending" value={data.statuses.Pending} color="bg-yellow-50 text-yellow-600" />
                <StatusCard label="Reviewing" value={data.statuses.Reviewing} color="bg-blue-50 text-blue-600" />
                <StatusCard label="Approved" value={data.statuses.Approved} color="bg-green-50 text-green-600" />
                <StatusCard label="Rejected" value={data.statuses.Rejected} color="bg-red-50 text-red-600" />
            </div>
        </div>
    );
}

function EditorialStat({ label, value, trend, isWarning }: { label: string, value: string, trend: string, isWarning?: boolean }) {
    return (
        <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">{label}</p>
            <div className="flex items-baseline gap-2">
                <h3 className={`text-4xl font-space font-bold tracking-tighter ${isWarning ? 'text-black/40' : ''}`}>{value}</h3>
                {trend && <span className={`text-[10px] font-bold uppercase font-space ${isWarning ? 'text-yellow-600' : 'text-green-600'}`}>{trend}</span>}
            </div>
        </div>
    );
}

function StatusCard({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className={`p-6 rounded-[24px] ${color} flex flex-col items-center justify-center`}>
            <span className="text-3xl font-space font-bold">{value || 0}</span>
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-60 mt-2">{label}</span>
        </div>
    );
}