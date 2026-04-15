/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function OverviewView() {
    return (
        <div className="space-y-12">
            <div className="grid md:grid-cols-3 gap-12">
                <EditorialStat label="Applications" value="12,840" trend="+4%" />
                <EditorialStat label="Liquidity" value="€84k" trend="+1%" />
                <EditorialStat label="SLA" value="14.2h" trend="-1%" />
            </div>
            
            <div className="h-[300px] border border-black/5 rounded-[40px] flex items-center justify-center text-black/10 font-bold uppercase tracking-widest text-[10px]">
               Activity Visualization
            </div>
        </div>
    );
}

function EditorialStat({ label, value, trend }: { label: string, value: string, trend: string }) {
    return (
        <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">{label}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-space font-bold tracking-tighter">{value}</h3>
                <span className="text-[10px] font-bold text-green-600 uppercase font-space">{trend}</span>
            </div>
        </div>
    );
}