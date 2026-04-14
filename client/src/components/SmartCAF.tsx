"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  LayoutDashboard,
  ClipboardList,
  Home as HomeIcon,
  Menu,
  X,
  User as UserIcon,
  LogOut
} from "lucide-react";
import ApplicationForm from "./ApplicationForm";
import AdminPage from "./AdminPage";
import ProfilePage from "./ProfilePage";
import AuthOverlay from "./auth/AuthOverlay";
import { mockApi, User } from "../lib/api/mockApi";

type CAFPage = 'home' | 'apply' | 'admin' | 'profile';

export default function SmartCAF({ onExit }: { onExit: () => void }) {
  const [currentPage, setCurrentPage] = useState<CAFPage>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // Force light theme for Smart CAF
    document.documentElement.classList.add('light');
    
    // Check for existing session
    const currentUser = mockApi.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleStartApply = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      setCurrentPage('apply');
    }
  };

  const handleLogout = async () => {
    await mockApi.logout();
    setUser(null);
    setIsProfileOpen(false);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'apply':
        return <ApplicationForm onClose={() => setCurrentPage('home')} />;
      case 'admin':
        return <AdminPage onBack={() => setCurrentPage('home')} />;
      case 'profile':
        return user ? <ProfilePage user={user} onBack={() => setCurrentPage('home')} /> : null;
      default:
        return <CAFHome onStart={handleStartApply} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-dm selection:bg-black selection:text-white light">
      {/* CAF Navbar */}
      <nav className="fixed top-0 left-0 w-full px-6 py-4 flex justify-between items-center z-[100] bg-white/70 backdrop-blur-2xl border-b border-black/5">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentPage('home')}
        >
          <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-space font-bold text-xl group-hover:rotate-6 transition-transform">
            C
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tighter font-space text-black">Smart CAF</span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-black/40 font-bold">Official Portal</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center bg-black/5 rounded-full px-6 py-2 space-x-8 border border-black/5">
          <button 
            onClick={() => setCurrentPage('admin')}
            className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${currentPage === 'admin' ? 'text-black' : 'text-black/40 hover:text-black'}`}
          >
            Admin
          </button>
          {user && (
            <button 
              onClick={() => setCurrentPage('profile')}
              className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${currentPage === 'profile' ? 'text-black' : 'text-black/40 hover:text-black'}`}
            >
              My Dashboard
            </button>
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
                    <button 
                      onClick={() => { setCurrentPage('profile'); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-black/60 hover:text-black hover:bg-black/5 rounded-lg transition-colors"
                    >
                      <UserIcon size={14} /> Profile
                    </button>
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
            onClick={onExit}
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
                onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }} 
              />
              <MobileNavLink 
                icon={<LayoutDashboard size={20} />} 
                label="Admin Dashboard" 
                onClick={() => { setCurrentPage('admin'); setIsMenuOpen(false); }} 
              />
              {user && (
                <MobileNavLink 
                  icon={<UserIcon size={20} />} 
                  label="My Profile" 
                  onClick={() => { setCurrentPage('profile'); setIsMenuOpen(false); }} 
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
                    onClick={handleLogout}
                    className="flex items-center gap-4 text-2xl font-space font-bold tracking-tighter text-red-500"
                  >
                    <span className="text-red-500/40"><LogOut size={20} /></span> Logout
                  </button>
                )}
                <button 
                  onClick={onExit}
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

      <main className="pt-24 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Auth Overlay */}
      <AuthOverlay 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={(u) => setUser(u)} 
      />
    </div>
  );
}

function MobileNavLink({ icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-4 text-2xl font-space font-bold tracking-tighter hover:text-black/60 transition-colors"
    >
      <span className="text-black/40">{icon}</span>
      {label}
    </button>
  );
}

function CAFHome({ onStart, user }: { onStart: () => void; user: User | null }) {
  return (
    <div className="px-6 py-12 md:py-24 max-w-[1280px] mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[10px] font-bold uppercase tracking-widest text-black/60">
            <ShieldCheck size={12} className="text-black" />
            Secure Government Services
          </div>
          
          <h1 className="text-6xl md:text-8xl font-space font-bold tracking-tighter leading-[0.9] text-black">
            Simplify Your <br />
            <span className="text-black/40">Smart CAF Journey.</span>
          </h1>
          
          <p className="text-lg text-black/60 max-w-[500px] font-light leading-relaxed">
            The most efficient way to manage your administrative files in Italy. 
            Fast, secure, and completely digital.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={onStart}
              className="group flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-[20px] font-bold text-sm hover:scale-105 transition-all shadow-2xl shadow-black/10"
            >
              {user ? 'Continue Application' : 'Start New Application'}
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center justify-center gap-3 bg-black/5 border border-black/10 px-8 py-4 rounded-[20px] font-bold text-sm hover:bg-black/10 transition-all text-black">
              Learn More
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-black/5">
            <div>
              <p className="text-2xl font-space font-bold text-black">15k+</p>
              <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Processed</p>
            </div>
            <div>
              <p className="text-2xl font-space font-bold text-black">99%</p>
              <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Success Rate</p>
            </div>
            <div>
              <p className="text-2xl font-space font-bold text-black">24h</p>
              <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Avg. Response</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-20 bg-black/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative grid grid-cols-2 gap-4">
            <FeatureCard 
              icon={<FileText className="text-black" />} 
              title="Digital Filing" 
              desc="Upload all documents securely from your phone."
            />
            <FeatureCard 
              icon={<Search className="text-black" />} 
              title="Dashboard Tracking" 
              desc="Monitor your application journey from your personal profile."
            />
            <FeatureCard 
              icon={<ClipboardList className="text-black" />} 
              title="Smart Forms" 
              desc="Validated fields to ensure zero errors."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-black" />} 
              title="Data Privacy" 
              desc="End-to-end encryption for your sensitive info."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="bg-black/5 border border-black/10 p-6 rounded-[32px] space-y-4 hover:border-black/20 transition-colors">
      <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-1 text-black">
        <h3 className="font-bold text-sm">{title}</h3>
        <p className="text-xs text-black/40 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
