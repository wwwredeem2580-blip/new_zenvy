"use client";

import React, { useState, ReactNode } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

export function SidebarSection({ title, children, collapsible = false, defaultOpen = true }: { title: string, children: ReactNode, collapsible?: boolean, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <div 
        className={`flex items-center justify-between py-2 px-2 text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 ${collapsible ? 'cursor-pointer hover:text-gray-600' : ''}`}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {collapsible && (
          <ChevronRight size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
        )}
      </div>
      <motion.div 
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="pt-1 space-y-0.5">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export function SidebarItem({ icon: Icon, label, active = false, onClick, hasMore = false, badge }: { icon: any, label: string, active?: boolean, onClick: () => void, hasMore?: boolean, badge?: string }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer transition-all duration-200 group
        ${active ? 'bg-gray-100 text-[#1a1c1d]' : 'text-[#616a75] hover:bg-gray-50 hover:text-[#1a1c1d]'}`}
    >
      <div className="flex items-center gap-3.5">
        <Icon size={18} className={`${active ? 'stroke-[2.5]' : 'stroke-[1.5] group-hover:stroke-[2] transition-all'}`} />
        <span className={`text-[14px] ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
      </div>
      {badge && (
        <span className="bg-shopify-green/10 text-shopify-green text-[10px] px-2 py-0.5 rounded-full font-black">{badge}</span>
      )}
      {hasMore && (
        <ChevronRight size={14} className={`text-gray-300 transition-transform ${active ? 'text-gray-500' : 'group-hover:text-gray-400'}`} />
      )}
    </div>
  );
}

export function SidebarSubItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer py-2 pl-4 pr-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-px h-4 bg-gray-100 group-hover:bg-gray-200 ml-4"></div>
      <span className="text-[13px] font-medium text-gray-500 group-hover:text-[#1a1c1d] transition-colors">{label}</span>
    </div>
  );
}

export function NavItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95 py-1 ${active ? 'text-[#1a1a1a]' : 'text-[#616a75]'}`}
    >
      <Icon size={22} className={`${active ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
      <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
      {active && <motion.div layoutId="nav-dot" className="h-[3px] w-4 bg-[#1a1a1a] rounded-full mt-0.5" />}
    </div>
  );
}
