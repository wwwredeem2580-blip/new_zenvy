"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home as HomeIcon,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, setIsAuthOpen } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    router.push('/');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full px-6 py-4 flex justify-between items-center z-[100] bg-white/70 backdrop-blur-2xl border-b border-black/5">
        <Link 
          href="/"
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-space font-bold text-xl group-hover:rotate-6 transition-transform">
            C
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tighter font-space text-black">Smart CAF</span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-black/40 font-bold">Official Portal</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center bg-black/5 rounded-full px-6 py-2 space-x-8 border border-black/5">
          <NavLink href="/admin" label="Admin" active={pathname === '/admin'} />
          {user && (user.role === 'subagent' || user.role === 'admin') && (
            <NavLink href="/agent" label="Agent Hub" active={pathname === '/agent'} />
          )}
          {user && (
            <NavLink href="/profile" label="My Profile" active={pathname === '/profile'} />
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pl-3 bg-black/5 rounded-full border border-black/5 hover:bg-black/10 transition-colors"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">{user.firstName}</span>
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                  {user.firstName[0]}
                </div>
              </button>
              
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-black/5 rounded-2xl shadow-xl p-2 z-[110]"
                  >
                    <div className="p-3 border-b border-black/5 mb-1">
                      <p className="text-xs font-bold truncate">{user.email}</p>
                      <p className="text-[9px] uppercase tracking-widest font-bold text-black/40">Role: {user.role}</p>
                    </div>
                    <Link 
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-black/60 hover:text-black hover:bg-black/5 rounded-lg transition-colors"
                    >
                      <UserIcon size={14} /> Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-2 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Login
            </button>
          )}
          
          <button 
            onClick={() => console.log("Exit portal")}
            className="hidden lg:flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/40 hover:text-black transition-colors ml-2"
          >
            <ArrowLeft size={14} />
            Exit Portal
          </button>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 border border-black/10"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-white pt-24 px-6"
          >
            <div className="flex flex-col gap-8">
              <MobileNavLink 
                icon={<HomeIcon size={20} />} 
                label="Home" 
                href="/"
                onClick={() => setIsMenuOpen(false)} 
              />
              <MobileNavLink 
                icon={<LayoutDashboard size={20} />} 
                label="Admin Dashboard" 
                href="/admin"
                onClick={() => setIsMenuOpen(false)} 
              />
              {user && (
                <MobileNavLink 
                  icon={<UserIcon size={20} />} 
                  label="My Profile" 
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)} 
                />
              )}
              <div className="pt-8 border-t border-black/10 flex flex-col gap-6">
                {!user ? (
                   <button 
                    onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }}
                    className="flex items-center gap-4 text-2xl font-space font-bold tracking-tighter"
                  >
                    <span className="text-black/40"><UserIcon size={20} /></span> Login
                  </button>
                ) : (
                   <button 
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="flex items-center gap-4 text-2xl font-space font-bold tracking-tighter text-red-500"
                  >
                    <span className="text-red-500/40"><LogOut size={20} /></span> Logout
                  </button>
                )}
                <button 
                  onClick={() => console.log("Exit portal")}
                  className="flex items-center gap-4 text-black/40 font-bold uppercase tracking-widest text-xs"
                >
                  <ArrowLeft size={20} />
                  Exit Portal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, label, active }: { href: string, label: string, active: boolean }) {
  return (
    <Link 
      href={href}
      className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${active ? 'text-black' : 'text-black/40 hover:text-black'}`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ icon, label, href, onClick }: any) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className="flex items-center gap-4 text-2xl font-space font-bold tracking-tighter hover:text-black/60 transition-colors"
    >
      <span className="text-black/40">{icon}</span>
      {label}
    </Link>
  );
}
