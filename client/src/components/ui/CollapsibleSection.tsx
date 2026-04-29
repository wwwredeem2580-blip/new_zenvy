"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleSection({ 
  title, 
  subtitle,
  children, 
  defaultOpen = false,
  className = "" 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'bg-white shadow-2xl shadow-black/5 ring-1 ring-black/5 rounded-[32px]' : 'bg-black/[0.02] border border-black/5 rounded-2xl hover:bg-black/[0.04]'} ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 group transition-all"
      >
        <div className="flex flex-col items-start gap-1">
          <h3 className={`text-sm font-bold tracking-tight transition-colors ${isOpen ? 'text-black' : 'text-black/60 group-hover:text-black'}`}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest opacity-80">
              {subtitle}
            </p>
          )}
        </div>
        
        <motion.div
          animate={{ 
            rotate: isOpen ? 180 : 0,
            backgroundColor: isOpen ? '#3b82f6' : 'rgba(0,0,0,0.05)',
            color: isOpen ? '#ffffff' : 'rgba(0,0,0,0.4)'
          }}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-shadow group-hover:shadow-lg"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 pt-2">
              <div className="w-full h-px bg-black/5 mb-8" />
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
