"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User as UserIcon, 
  CreditCard, 
  FileText, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  ArrowLeft,
  X,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Hash,
  Home,
  Loader2,
  TrendingUp,
  ArrowUpRight,
  Download,
  Printer,
  Receipt,
  Upload,
  Lock,
  Eye,
  Shield,
  Plus as PlusIcon
} from "lucide-react";
import { User } from "../types/user";
import { applicationApi } from '../lib/api/applicationApi';
import { validatePreviewUrl } from '../lib/utils';
import { toast } from 'sonner';
import { authApi } from "../lib/api/authApi";
import { Application, ApplicationStatus, RequestedFile } from "../data/applications";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const onBack = () => router.push('/');
  
  // Guard for rendering if user is missing (page level should handle this but safety first)
  const [localUser, setLocalUser] = useState<User>(user as any);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    refreshUser();
    loadUserApplications();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] space-y-4">
        <Loader2 size={40} className="animate-spin text-black/10" />
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/40">Authenticating...</p>
      </div>
    );
  }

  if (!user) return null;

  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      if (response.success && response.user) {
        setLocalUser(response.user);
      }
    } catch (error) {
      console.error("Failed to refresh user data", error);
    }
  };

  const loadUserApplications = async () => {
    setIsLoading(true);
    try {
      const response = await applicationApi.getMyApplications();
      setApplications(response.applications);
    } catch (error) {
      console.error("Failed to load user applications", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAttachment = async (attachment: any) => {
    if (!selectedApp) return;
    try {
      const response = await applicationApi.getAttachmentPreviewUrl(selectedApp._id, attachment.url);
      if (response.success && response.previewUrl) {
        if (!validatePreviewUrl(response.previewUrl)) {
          toast.error("Invalid preview URL");
          return;
        }
        window.open(response.previewUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error("Failed to get preview URL", error);
      toast.error("Error: Access denied or file not found.");
    }
  };

  const handleDownloadInvoice = async () => {
    if (!selectedApp) return;
    const invoice = selectedApp.attachments?.find(a => a.uploadedById === 'system');
    
    if (invoice) {
      try {
        const response = await applicationApi.getAttachmentPreviewUrl(selectedApp._id, invoice.url);
        if (response.success && response.previewUrl) {
          // Trigger direct download
          const link = document.createElement('a');
          link.href = response.previewUrl;
          link.download = invoice.name;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error("Failed to download invoice", error);
      }
    } else {
      alert("Invoice not yet generated. Payment may still be pending.");
    }
  };

  const handleUploadAdditionalDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedApp) return;

    // Optional: client-side type check
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      alert("Invalid file type. Only JPG, PNG, and PDF are allowed.");
      return;
    }

    setIsUploadingDoc(true);
    try {
      const response = await applicationApi.uploadFinalDocument(selectedApp._id, file);
      if (response.success) {
        // Refresh the applications list to get the updated document list
        const updatedApps = await applicationApi.getMyApplications();
        setApplications(updatedApps.applications);
        
        // Update the currently selected app view
        const refreshedApp = updatedApps.applications.find(a => a._id === selectedApp._id);
        if (refreshedApp) setSelectedApp(refreshedApp);
        
        alert("Document uploaded successfully!");
      }
    } catch (error: any) {
      console.error("Upload failed", error);
      alert(error.response?.data?.message || "Failed to upload document. Please try again.");
    } finally {
      setIsUploadingDoc(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amt);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-space font-bold tracking-tighter">My Profile.</h1>
          <p className="text-sm text-black/40 font-medium">Manage your personal account and track applications.</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/40 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} /> Back to Portal
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Col: Account Info & Balance */}
        <div className="space-y-8">
          {/* Virtual Credit Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-64 w-full bg-[#111] rounded-[32px] p-6 md:p-8 overflow-hidden shadow-2xl flex flex-col justify-between group isolate [transform:translateZ(0)]"
          >
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="waves" width="100" height="20" patternUnits="userSpaceOnUse">
                            <path d="M0 10 Q 25 0, 50 10 T 100 10" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#waves)" />
                </svg>
            </div>

            <div className="relative flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">My Balance</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-space font-bold text-white tracking-tighter">
                        {formatCurrency(localUser?.balance || 0)}
                    </span>
                    <TrendingUp size={14} className="text-green-400" />
                </div>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                <div className="flex gap-0.5">
                    <div className="w-1.5 h-3 bg-white/20 rounded-full" />
                    <div className="w-1.5 h-3 bg-white/40 rounded-full" />
                    <div className="w-1.5 h-3 bg-white/60 rounded-full" />
                </div>
              </div>
            </div>

            <div className="relative space-y-4">
               <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold">
                 Show account balance in EUR <ChevronRight size={10} className="rotate-90" />
               </div>
               <div className="flex justify-between items-end gap-2">
                  <div className="space-y-1 min-w-0 flex-1 pr-2">
                     <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold truncate">Account Holder</p>
                     <p className="text-sm text-white font-medium tracking-tight uppercase truncate">{localUser?.firstName || ''} {localUser?.lastName || ''}</p>
                  </div>
                  <div className="flex -space-x-2 flex-shrink-0">
                     <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" />
                     <div className="w-8 h-8 rounded-full border border-white/10 bg-white/20 backdrop-blur-sm" />
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Quick Info Card */}
          <div className="bg-black/5 border border-black/5 rounded-[32px] p-6 md:p-8 space-y-6 overflow-hidden">
             <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Profile Summary</p>
                <h3 className="text-xl font-space font-bold">Account Details.</h3>
             </div>
              <div className="space-y-4">
                  <InfoRow icon={<UserIcon size={14} />} label="Full Name" value={`${localUser?.firstName || ''} ${localUser?.lastName || ''}`} />
                  <InfoRow icon={<Mail size={14} />} label="Email Address" value={localUser?.email || ''} />
                  <InfoRow icon={<Hash size={14} />} label="Member ID" value={`#${localUser?.id || localUser?._id || ''}`} />
                  <InfoRow icon={<Calendar size={14} />} label="Joined" value={localUser?.createdAt ? new Date(localUser.createdAt).toLocaleDateString() : ''} />
               </div>
          </div>
        </div>

        {/* Right Col: Applications List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-space font-bold tracking-tight">Recent Applications.</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Status Updates
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 size={48} className="animate-spin text-black/10" />
              <p className="text-[10px] uppercase tracking-widest font-bold text-black/40">Fetching your records...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-black/5 rounded-[40px] space-y-4 group">
               <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={32} className="text-black/20" />
               </div>
               <div className="text-center">
                  <p className="font-bold text-sm">No applications found</p>
                  <p className="text-xs text-black/40">You haven't submitted any applications yet.</p>
               </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {applications.map((app) => (
                <motion.div
                  key={app._id}
                  onClick={() => setSelectedApp(app)}
                  className="bg-white border border-black/5 p-4 sm:p-5 rounded-[24px] flex flex-wrap sm:flex-nowrap items-center justify-between cursor-pointer hover:border-black/20 hover:shadow-xl hover:shadow-black/5 transition-all group gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-2xl flex items-center justify-center font-bold text-lg rotate-3 group-hover:rotate-0 transition-transform">
                      {app.selectedServices[0]?.name[0] || "A"}
                    </div>
                    <div className="min-w-0 pr-2">
                      <h4 className="font-bold text-xs sm:text-sm truncate">{app.selectedServices.map(s => s.name).join(", ")}</h4>
                      <div className="flex items-center gap-1 sm:gap-2 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-black/40">ID: #{app.applicationId}</span>
                        <div className="flex-shrink-0 w-1 h-1 rounded-full bg-black/10" />
                        <span className="text-[9px] uppercase tracking-widest font-bold text-black/40 truncate">{new Date(app.createdAt || app.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 sm:gap-3 flex-shrink-0">
                    <StatusBadge status={app.status} />
                    {app.requestedFiles?.some(rf => rf.status === 'Pending') && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-red-200 bg-red-50 text-red-600 text-[8px] font-bold uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Action Required
                      </div>
                    )}
                    {app.paymentMethod && (
                       <div className={`px-2 py-0.5 rounded-lg border text-[8px] font-bold uppercase tracking-widest ${app.paymentStatus === 'Received' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'}`}>
                          {app.paymentMethod} • {app.paymentStatus}
                       </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black/5 hidden sm:flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                      <ChevronRight size={14} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[300] flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-white border-l border-black/5 shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-md sm:text-xl md:text-2xl font-space font-bold tracking-tighter uppercase">Document Details.</h2>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={handleDownloadInvoice}
                     className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-black/90 transition-all rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/20"
                   >
                      <Download size={14} /> Download Invoice
                   </button>
                   <button 
                       onClick={() => setSelectedApp(null)} 
                       className="p-2 hover:bg-black/5 rounded-full transition-colors"
                   >
                     <X size={20} />
                   </button>
                </div>
              </div>

              <div className="space-y-12">
                {/* Status Hero */}
                <div className="bg-black/5 px-8 py-4 md:px-8 sm:py-8 rounded-[40px] flex items-center justify-between">
                   <div>
                       <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-black/40 mb-2">Application Status</p>
                       <p className="text-2xl sm:text-3xl font-space font-bold tracking-tighter uppercase">{selectedApp.status}</p>
                   </div>
                   <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-lg border border-black/5">
                        {selectedApp.status === "Approved" ? <CheckCircle2 size={32} className="text-green-500" /> : <Clock size={32} className="text-black/20" />}
                   </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-8">
                  <DetailItem icon={<UserIcon size={14}/>} label="Full Name" value={selectedApp.name} />
                  <DetailItem icon={<Calendar size={14}/>} label="DOB" value={selectedApp.dob} />
                  <DetailItem icon={<MapPin size={14}/>} label="Place of Birth" value={selectedApp.pob} />
                  <DetailItem icon={<Globe size={14}/>} label="Nationality" value={selectedApp.nationality} />
                  <DetailItem icon={<Hash size={14}/>} label="Codice Fiscale" value={selectedApp.codiceFiscale} />
                  <DetailItem icon={<Phone size={14}/>} label="Phone" value={selectedApp.phone} />
                  <DetailItem icon={<Mail size={14}/>} label="Email" value={selectedApp.email} />
                  <DetailItem icon={<Home size={14}/>} label="Address" value={selectedApp.address} />
                  <DetailItem icon={<CreditCard size={14}/>} label="Payment Method" value={selectedApp.paymentMethod} />
                  <DetailItem icon={<CheckCircle2 size={14}/>} label="Payment Status" value={selectedApp.paymentStatus} />
                  {selectedApp.transactionId && <DetailItem icon={<Receipt size={14}/>} label="Transaction ID" value={selectedApp.transactionId} />}
                </div>

                {/* Services Section */}
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-black/40">Included Services</h3>
                  <div className="space-y-2">
                    {selectedApp.selectedServices.map((s, i) => (
                      <div key={i} className="flex justify-between items-center p-5 bg-black/[0.02] border border-black/5 rounded-[24px] hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all">
                        <div className="space-y-1">
                            <span className="block font-bold text-sm">{s.name}</span>
                            <span className="flex items-center gap-1 text-[8px] uppercase tracking-widest font-bold text-black/40">
                                <Clock size={10} /> {s.duration}
                            </span>
                        </div>
                        <span className="text-xl font-space font-bold">€{s.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-black/40">Secure Application Documents</h3>
                        <div className="flex items-center gap-2">
                            <Lock size={12} className="text-black/20" />
                            <span className="text-[8px] font-black uppercase tracking-tighter text-black/30">End-to-End Encrypted</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {(() => {
                            const requirements = new Map<string, { label: string, required: boolean, instruction?: string }>();
                            selectedApp.selectedServices.forEach(s => {
                                s.requiredDocuments?.forEach(rd => {
                                    if (!requirements.has(rd.label) || (!requirements.get(rd.label)!.required && rd.required)) {
                                        requirements.set(rd.label, rd);
                                    }
                                });
                            });

                            const reqList = Array.from(requirements.values());
                            const attachments = selectedApp.attachments || [];
                            const requests = selectedApp.requestedFiles || [];

                            return (
                                <>
                                    {reqList.map((req, i) => {
                                        const attachment = attachments.find(a => a.label === req.label);
                                        const request = requests.find(rf => rf.name === req.label && rf.status === 'Pending');

                                        if (attachment) {
                                            return (
                                                <div key={`req-slot-${i}`} className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-[20px] hover:shadow-xl hover:shadow-black/5 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center">
                                                            <CheckCircle2 size={18} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-black/80">{req.label}</span>
                                                            <span className="text-[8px] uppercase tracking-widest font-bold text-black/30">
                                                                Verified Document • {new Date(attachment.uploadedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleViewAttachment(attachment)}
                                                        className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/40 hover:text-black"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={`req-slot-${i}`} className={`p-5 rounded-[24px] border-2 border-dashed transition-all ${request ? 'bg-red-50 border-red-200 shadow-sm shadow-red-500/5' : 'bg-black/[0.01] border-black/5'}`}>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-bold uppercase tracking-tight ${request ? 'text-red-900' : 'text-black/40'}`}>
                                                                {request ? `Action Required: ${req.label}` : `Missing: ${req.label}`}
                                                            </span>
                                                            {req.required && !request && <span className="px-1.5 py-0.5 rounded-md bg-black/5 text-[8px] font-bold text-black/40">MANDATORY</span>}
                                                        </div>
                                                        {(request?.note || req.instruction) && (
                                                            <p className={`text-[10px] font-medium leading-relaxed ${request ? 'text-red-700/60' : 'text-black/30'}`}>
                                                                "{request?.note || req.instruction}"
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${request ? 'bg-red-500 text-white animate-pulse' : 'bg-black/5 text-black/20'}`}>
                                                        <Upload size={18} />
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        // We could pass the label to the input somehow, but for now generic upload
                                                        fileInputRef.current?.click();
                                                    }}
                                                    className={`mt-4 w-full py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${request ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20' : 'bg-black text-white hover:bg-black/90'}`}
                                                >
                                                    Upload {req.label}
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {/* Additional/Legacy documents not matching labels */}
                                    {attachments.filter(a => !reqList.some(r => r.label === a.label)).map((doc, i) => (
                                        <div key={`extra-${i}`} className="flex items-center justify-between p-4 bg-black/5 border border-black/5 rounded-[20px] hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-black/80">{doc.label || doc.name}</span>
                                                    <span className="text-[8px] uppercase tracking-widest font-bold text-black/30">Supplemental Document</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleViewAttachment(doc)}
                                                className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/40 hover:text-black"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {/* Custom file requests from agents/admins not tied to service requirements */}
                                    {requests
                                      .filter(rf => rf.status === 'Pending' && !reqList.some(r => r.label === rf.name))
                                      .map((rf, i) => (
                                        <div key={`custom-req-${i}`} className="p-5 rounded-[24px] border-2 border-dashed border-red-200 bg-red-50 transition-all">
                                          <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold uppercase tracking-tight text-red-900">
                                                  Action Required: {rf.name}
                                                </span>
                                              </div>
                                              {rf.note && (
                                                <p className="text-[10px] font-medium leading-relaxed text-red-700/60">
                                                  &ldquo;{rf.note}&rdquo;
                                                </p>
                                              )}
                                              <p className="text-[8px] font-bold uppercase tracking-widest text-red-400">
                                                Requested on {new Date(rf.requestedAt).toLocaleDateString()}
                                              </p>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center animate-pulse flex-shrink-0">
                                              <Upload size={18} />
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => {
                                              // Generic upload, backend handles matching by name
                                              fileInputRef.current?.click();
                                            }}
                                            className="mt-4 w-full py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
                                          >
                                            Upload {rf.name}
                                          </button>
                                        </div>
                                      ))
                                    }

                                    {/* Generic Upload for supplemental docs */}
                                    {(selectedApp.status === "Pending" || selectedApp.status === "Reviewing") && (
                                        <>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                ref={fileInputRef}
                                                onChange={handleUploadAdditionalDoc}
                                                accept=".jpg,.jpeg,.png,.pdf"
                                            />
                                            <button
                                                disabled={isUploadingDoc}
                                                onClick={() => fileInputRef.current?.click()}
                                                className="mt-2 group p-4 border-2 border-dashed border-black/10 rounded-[24px] flex items-center justify-center gap-4 hover:border-black/20 hover:bg-black/5 transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                                    {isUploadingDoc ? <Loader2 size={18} className="animate-spin" /> : <PlusIcon size={18} />}
                                                </div>
                                                <div className="flex flex-col items-start text-left">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Add Other Document</span>
                                                    <span className="text-[8px] text-black/40 font-medium">Extra file support</span>
                                                </div>
                                            </button>
                                        </>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>

                <div className="pt-8 block">
                    <button 
                        onClick={() => setSelectedApp(null)}
                        className="w-full bg-black text-white py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:scale-105 transition-all shadow-2xl shadow-black/20"
                    >
                        Close Detail View
                    </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ icon, label, value }: any) {
    return (
        <div className="flex items-center gap-4 group min-w-0">
            <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-black/40 group-hover:bg-black group-hover:text-white transition-all">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[8px] uppercase tracking-widest font-bold text-black/20">{label}</p>
                <p className="text-[11px] font-bold text-black/80 truncate">{value}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
    const styles = {
      Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      Reviewing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "Pending Admin Approval": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      Approved: "bg-green-500/10 text-green-500 border-green-500/20",
      Rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    };
  
    const icons = {
      Pending: <Clock size={12} />,
      Reviewing: <Search size={12} />,
      "Pending Admin Approval": <Shield size={12} />,
      Approved: <CheckCircle2 size={12} />,
      Rejected: <AlertCircle size={12} />,
    };
  
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${styles[status]}`}>
        {icons[status]}
        {status}
      </div>
    );
}

function DetailItem({ icon, label, value }: any) {
    // If value is a date string, format it safely
    let displayValue = value;
    if (label === "DOB" && value) {
      try { displayValue = new Date(value).toLocaleDateString(); } catch(e) {}
    }

    return (
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 flex items-center gap-2">
          {icon} {label}
        </p>
        <p className="text-sm font-medium text-black/80">{displayValue || "N/A"}</p>
      </div>
    );
}
