"use client";

import { useRouter } from "next/navigation";
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  ChevronRight, 
  ClipboardList,
  MapPin,
  Clock,
  ArrowRight,
  Archive,
  FileSliders
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { applicationApi } from "@/lib/api/applicationApi";
import { branchApi, Branch } from "@/lib/api/branchApi";

export default function Home() {
  const router = useRouter();
  const { user, setIsAuthOpen } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [services, setServices] = useState<any[]>([]);
  const [mainBranch, setMainBranch] = useState<Branch | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await applicationApi.listServices();
        if (res.success) {
          setServices(res.services);
        }
      } catch (err) {
        console.error("Failed to load services", err);
      }
    };
    const fetchBranches = async () => {
      try {
        const res = await branchApi.listPublicBranches();
        if (res.success && res.branches.length > 0) {
          const main = res.branches.find((b: Branch) => b.isMain) || res.branches[0];
          setMainBranch(main);
        }
      } catch (err) {
        console.error("Failed to load branches", err);
      }
    };
    fetchServices();
    fetchBranches();
  }, []);

  const allSubservices = useMemo(() => {
    return services.flatMap(service => 
      service.subservices.map((sub: any) => ({
        ...sub,
        categoryId: service.id,
        categoryName: service.name,
        icon: service.icon
      }))
    );
  }, [services]);

  const categories = useMemo(() => {
    return [
      { id: "all", name: "All Services" },
      ...services.map(s => ({ id: s.id, name: s.name }))
    ];
  }, [services]);

  const filteredServices = useMemo(() => {
    return allSubservices.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || service.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, allSubservices]);

  const handleStartApply = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      router.push('/apply');
    }
  };

  return (
    <div className="px-6 py-12 md:py-24 max-w-[1280px] mx-auto space-y-24">
      {/* Hero Section */}
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[10px] font-bold uppercase tracking-widest text-black/60">
            <ShieldCheck size={12} className="text-black" />
            Secure Government Services
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-space font-bold tracking-tighter leading-[0.9] text-black">
            Simplify Your <br />
            <span className="text-black/40">CAF Journey.</span>
          </h1>
          
          <p className="text-lg text-black/60 max-w-[500px] font-light leading-relaxed">
            We specialize in providing essential services for immigrants and residents in Italy. Our platform offers expert assistance with CAF (Fiscal Assistance Centers), Patronato (Social Welfare Services), and Immigration-related processes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={handleStartApply}
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

        <div className="relative hidden md:flex mt-8 lg:mt-0 overflow-hidden rounded-[40px]">
          <div className="absolute inset-0 bg-black/5 blur-[80px] pointer-events-none" />
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureCard 
              icon={<FileText className="text-black" />} 
              title="Digital Filing" 
              desc="Upload all documents securely from your phone."
            />
            <FeatureCard 
              icon={<Search className="text-black" />} 
              title="Profile Tracking" 
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

      {/* Services Section */}
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-space font-bold tracking-tighter text-black">
            Our Services
          </h2>
          <p className="text-black/60 font-light max-w-xl mx-auto">
            Find the right service for your needs and start your application in seconds.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search for a service (e.g. ISEE, Visa, NASPI...)"
              className="w-full pl-16 pr-6 py-5 bg-white border border-black/10 rounded-[24px] focus:outline-none focus:border-black/30 shadow-xl shadow-black/5 transition-all text-black placeholder:text-black/20 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  selectedCategory === cat.id 
                    ? "bg-black text-white shadow-lg shadow-black/20 scale-105" 
                    : "bg-black/5 text-black/40 hover:bg-black/10 hover:text-black"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 max-w-5xl mx-auto">
          {filteredServices.length > 0 ? (
            filteredServices.map((sub, i) => (
              <div 
                key={i} 
                className="bg-white border-b border-black/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-black/30 hover:shadow-2xl hover:shadow-black/5 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-5 flex-1">
                  <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center text-black shrink-0 group-hover:scale-110 transition-transform">
                    <FileSliders className="text-black" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/20 bg-black/[0.03] px-2 py-0.5 rounded-sm">
                        {sub.categoryName}
                      </span>
                    </div>
                    <h4 className="font-bold text-xl text-black leading-tight">{sub.name}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-black/40 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-black/20" /> {mainBranch?.address || 'Italy'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-black/20" /> {sub.duration}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0 border-t md:border-t-0 border-black/5 pt-4 md:pt-0">
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Standard Fee</div>
                    <div className="text-2xl font-space font-bold text-black">
                      {sub.price === 0 ? "FREE" : `€${sub.price}`}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (!user) {
                        setIsAuthOpen(true);
                      } else {
                        router.push(`/apply?subservice=${encodeURIComponent(sub.name)}`);
                      }
                    }}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 sm:px-6 md:px-8 sm:py-3 md:py-4 rounded-[20px] text-[9px] sm:text-xs md:text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
                  >
                    Apply Now
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-black/5 rounded-[40px] border border-dashed border-black/10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/5 text-black/20 mb-4">
                <Search size={32} />
              </div>
              <p className="text-black font-bold">No services found</p>
              <p className="text-black/40 text-sm">Try adjusting your search or category filter</p>
              <button 
                onClick={() => {setSearchQuery(""); setSelectedCategory("all");}}
                className="mt-6 text-xs font-bold uppercase tracking-widest underline underline-offset-4 hover:text-black transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
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
