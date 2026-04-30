/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Calendar, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Application } from '../../data/applications';
import { exportApplicationsToExcel, ExportPeriod } from '../../lib/exportToExcel';

interface ExportModalProps {
  applications: Application[];
  onClose: () => void;
}

const PERIOD_OPTIONS: { id: ExportPeriod; label: string; sublabel: string; days: string }[] = [
  { id: 'today', label: 'Today', sublabel: "Today's applications only", days: '1 sheet' },
  { id: 'week', label: 'Last 7 Days', sublabel: 'Past week, day by day', days: 'Up to 7 sheets' },
  { id: 'month', label: 'Last 30 Days', sublabel: 'Past month, day by day', days: 'Up to 30 sheets' },
];

export function ExportModal({ applications, onClose }: ExportModalProps) {
  const [selected, setSelected] = useState<ExportPeriod>('week');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    // Small timeout to let the spinner render before the synchronous XLSX work
    setTimeout(() => {
      try {
        exportApplicationsToExcel({ applications, period: selected });
      } finally {
        setIsExporting(false);
        onClose();
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        className="bg-white rounded-sm w-full max-w-lg p-10 space-y-10 shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 border border-green-100 rounded-sm flex items-center justify-center">
                <FileSpreadsheet size={18} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">Export to Excel</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-black/30">Day-by-Day Breakdown</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-sm transition-colors text-black/40 hover:text-black"
          >
            <X size={18} />
          </button>
        </div>

        {/* Period Selection */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Select Time Period</p>
          <div className="space-y-2">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-sm border transition-all ${
                  selected === opt.id
                    ? 'border-black bg-black text-white shadow-lg'
                    : 'border-black/10 bg-white hover:border-black/30 hover:bg-black/[0.02]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Calendar size={16} className={selected === opt.id ? 'text-white/60' : 'text-black/30'} />
                  <div className="text-left">
                    <span className={`block text-sm font-bold ${selected === opt.id ? 'text-white' : 'text-black'}`}>
                      {opt.label}
                    </span>
                    <span className={`text-[10px] font-medium ${selected === opt.id ? 'text-white/60' : 'text-black/40'}`}>
                      {opt.sublabel}
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm ${
                  selected === opt.id ? 'bg-white/10 text-white/70' : 'bg-black/5 text-black/40'
                }`}>
                  {opt.days}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-black/[0.02] border border-black/5 rounded-sm px-5 py-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">What's Included</p>
          <p className="text-xs text-black/60 leading-relaxed">
            Each day becomes a separate Excel sheet. A <span className="font-bold text-black">Summary</span> sheet is included as the first tab showing daily totals, statuses, and revenue.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-sm border border-black/10 text-[10px] font-bold uppercase tracking-widest text-black/50 hover:bg-black/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 py-4 rounded-sm bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isExporting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={14} />
                Download Excel
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
