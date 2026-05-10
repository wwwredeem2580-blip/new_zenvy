"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Calendar, 
  MapPin, 
  Globe, 
  Hash, 
  Phone, 
  Mail, 
  Home, 
  FileText, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Upload, 
  Loader2,
  Building2,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { applicationApi } from '../../lib/api/applicationApi';
import { branchApi, Branch } from '../../lib/api/branchApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { validateFile } from '../../lib/utils';
import DateDropdownField from '../ui/DateDropdownField';

interface SubmitOnBehalfModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: any;
  onSuccess: () => void;
}

const IconMap: Record<string, React.ReactNode> = {
  FileText: <FileText size={20} />,
  Building2: <Building2 size={20} />,
  Globe: <Globe size={20} />,
};

const permessoTypes = [
  "Lavoro Subordinato",
  "Lavoro Autonomo",
  "Motivi Familiari",
  "Studio",
  "Asilo Politico",
  "Protezione Sussidiaria",
  "Altro",
];

export function SubmitOnBehalfModal({ isOpen, onClose, selectedUser, onSuccess }: SubmitOnBehalfModalProps) {
  const { user: agent } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    pob: '',
    nationality: '',
    codiceFiscale: '',
    phone: '',
    email: '',
    streetAddress: '',
    postCode: '',
    province: '',
    permessoType: '',
    permessoExpiry: '',
    selectedServices: [] as any[],
    documents: {} as { [key: string]: File | null },
  });

  useEffect(() => {
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        name: `${selectedUser.firstName} ${selectedUser.lastName}`,
        email: selectedUser.email,
        phone: selectedUser.phone || '',
      }));
    }
  }, [selectedUser]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, branchesRes] = await Promise.all([
          applicationApi.listServices(),
          branchApi.listPublicBranches()
        ]);
        if (servicesRes.success) setAvailableServices(servicesRes.services);
        if (branchesRes.success) {
          setBranches(branchesRes.branches);
          setSelectedBranch(branchesRes.branches.find((b: Branch) => b.isMain) || branchesRes.branches[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (isOpen) loadData();
  }, [isOpen]);

  const allSubservices = useMemo(() => {
    return availableServices.flatMap(service => 
      service.subservices.map((sub: any) => ({
        ...sub,
        categoryId: service.id,
        categoryName: service.name,
        icon: service.icon
      }))
    );
  }, [availableServices]);

  const requiredDocs = useMemo(() => {
    const docsMap = new Map<string, any>();
    formData.selectedServices.forEach(sub => {
      sub.requiredDocuments.forEach((doc: any) => {
        const existing = docsMap.get(doc.label);
        if (!existing || (!existing.required && doc.required)) {
          docsMap.set(doc.label, doc);
        }
      });
    });
    return Array.from(docsMap.values());
  }, [formData.selectedServices]);

  const handleFileUpload = (label: string, file: File | null) => {
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [label]: file }
    }));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (formData.name.length < 2) newErrors.name = "Full name is required";
      if (!formData.dob) newErrors.dob = "Date of birth is required";
      if (!formData.pob) newErrors.pob = "Place of birth is required";
      if (!formData.nationality) newErrors.nationality = "Nationality is required";
      if (formData.codiceFiscale.length !== 16) newErrors.codiceFiscale = "Codice Fiscale must be 16 characters";
      if (formData.phone.length < 5) newErrors.phone = "Valid phone number is required";
      if (!formData.streetAddress) newErrors.streetAddress = "Street address is required";
      if (!formData.postCode) newErrors.postCode = "Post code is required";
      if (!formData.province) newErrors.province = "Province is required";
    }
    
    if (step === 2) {
      if (formData.selectedServices.length === 0) {
        toast.error("Please select at least one service");
        return false;
      }
      if (!selectedBranch) {
        toast.error("Please select a branch location");
        return false;
      }
    }

    if (step === 3) {
      const missingDocs = requiredDocs.filter(rd => rd.required && !formData.documents[rd.label]);
      if (missingDocs.length > 0) {
        toast.error("Please upload all required documents");
        return false;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsLoading(true);
    try {
      // 1. Upload files
      const attachments = [];
      for (const [label, file] of Object.entries(formData.documents)) {
        if (!file) continue;
        const uploadRes = await applicationApi.uploadAttachment(file);
        attachments.push({
          name: uploadRes.filename,
          label: label,
          url: uploadRes.objectKey,
          uploadedBy: agent?.firstName + ' ' + agent?.lastName + ' (Agent)',
          uploadedById: agent?.id || 'agent',
          uploadedAt: new Date().toISOString()
        });
      }

      // 2. Submit application
      await applicationApi.submitApplication({
        ...formData,
        address: `${formData.streetAddress}, ${formData.postCode}, ${formData.province}`,
        userId: selectedUser?.id || selectedUser?._id,
        branchId: selectedBranch?._id || '',
        branchName: selectedBranch?.name || '',
        paymentMethod: 'Cash', // Default for agent submissions
        attachments,
        submittedBy: {
          agentId: (agent as any)?.id || (agent as any)?._id || '',
          agentName: `${agent?.firstName} ${agent?.lastName}`,
          method: 'agent_assisted'
        },
        referredBy: {
          agentId: (agent as any)?.id || (agent as any)?._id || '',
          agentName: `${agent?.firstName} ${agent?.lastName}`
        }
      });

      toast.success('Application submitted successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-4xl h-full bg-white border-l border-black/10 shadow-2xl overflow-y-auto"
      >
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/40 mb-2">
                <User size={12} /> Submitting for {selectedUser.firstName} {selectedUser.lastName}
              </div>
              <h2 className="text-3xl font-space font-bold uppercase tracking-tighter">
                {step === 1 ? "Client Identity" : step === 2 ? "Services & Location" : "Documents"}
              </h2>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-black/5 rounded-sm transition-colors"><X size={24} /></button>
          </div>

          <div className="space-y-12">
            {step === 1 && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormInput 
                    label="Full Name" 
                    value={formData.name} 
                    onChange={(v: string) => setFormData({...formData, name: v})} 
                    icon={<User size={14}/>} 
                    error={errors.name}
                  />
                  <DateDropdownField
                    label="Date of Birth"
                    icon={<Calendar size={14} />}
                    value={formData.dob}
                    onChange={(val) => setFormData(p => ({ ...p, dob: val }))}
                    required
                    disableFuture
                    externalError={errors.dob}
                  />
                  <FormInput 
                    label="Place of Birth" 
                    value={formData.pob} 
                    onChange={(v: string) => setFormData({...formData, pob: v})} 
                    icon={<MapPin size={14}/>} 
                    error={errors.pob}
                  />
                  <FormInput 
                    label="Nationality" 
                    value={formData.nationality} 
                    onChange={(v: string) => setFormData({...formData, nationality: v})} 
                    icon={<Globe size={14}/>} 
                    error={errors.nationality}
                  />
                  <FormInput 
                    label="Codice Fiscale" 
                    value={formData.codiceFiscale} 
                    onChange={(v: string) => setFormData({...formData, codiceFiscale: v})} 
                    icon={<Hash size={14}/>} 
                    error={errors.codiceFiscale}
                  />
                  <FormInput 
                    label="Phone" 
                    value={formData.phone} 
                    onChange={(v: string) => setFormData({...formData, phone: v})} 
                    icon={<Phone size={14}/>} 
                    error={errors.phone}
                  />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
                      <FileText size={12} /> Permesso Type
                    </label>
                    <div className="relative">
                      <select
                        name="permessoType"
                        value={formData.permessoType}
                        onChange={(e) => setFormData({...formData, permessoType: e.target.value})}
                        className="w-full px-4 py-3 bg-black/[0.02] border border-black/10 rounded-sm text-sm focus:outline-none focus:border-black appearance-none transition-all"
                      >
                        <option value="">Select Type</option>
                        {permessoTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black/40" />
                    </div>
                  </div>

                  <DateDropdownField
                    label="Permesso Expiry"
                    icon={<Calendar size={14} />}
                    value={formData.permessoExpiry}
                    onChange={(val) => setFormData(p => ({ ...p, permessoExpiry: val }))}
                    externalError={errors.permessoExpiry}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-black/5">
                  <div className="md:col-span-1">
                    <FormInput 
                      label="Street Address" 
                      value={formData.streetAddress} 
                      onChange={(v: string) => setFormData({...formData, streetAddress: v})} 
                      icon={<Home size={14}/>} 
                      error={errors.streetAddress}
                    />
                  </div>
                  <FormInput 
                    label="Post Code" 
                    value={formData.postCode} 
                    onChange={(v: string) => setFormData({...formData, postCode: v})} 
                    icon={<Hash size={14}/>} 
                    error={errors.postCode}
                  />
                  <FormInput 
                    label="Province" 
                    value={formData.province} 
                    onChange={(v: string) => setFormData({...formData, province: v})} 
                    icon={<MapPin size={14}/>} 
                    error={errors.province}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="grid gap-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 block">Select Services</label>
                  {allSubservices.map((sub, i) => {
                    const isSelected = formData.selectedServices.some(s => s.name === sub.name);
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            selectedServices: isSelected 
                              ? prev.selectedServices.filter(s => s.name !== sub.name)
                              : [...prev.selectedServices, sub]
                          }));
                        }}
                        className={`flex items-center justify-between p-6 border rounded-sm transition-all ${isSelected ? 'bg-black text-white border-black shadow-lg' : 'bg-white border-black/5 hover:border-black/20'}`}
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${isSelected ? 'bg-white/10' : 'bg-black/5'}`}>
                            {IconMap[sub.icon] || <FileText size={18}/>}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{sub.name}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/40' : 'text-black/40'}`}>{sub.categoryName} • {sub.duration}</p>
                          </div>
                        </div>
                        <span className="font-space font-bold text-xl">€{sub.price}</span>
                      </button>
                    );
                  })}
                </div>
                
                <div className="pt-8 border-t border-black/5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 block mb-4">Submission Location (Branch)</label>
                  <div className="grid gap-3">
                    {branches.map(b => (
                      <button
                        key={b._id}
                        onClick={() => setSelectedBranch(b)}
                        className={`flex items-center justify-between p-6 border rounded-sm transition-all ${selectedBranch?._id === b._id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white border-black/5 hover:border-black/20'}`}
                      >
                        <div className="flex items-center gap-4 text-left">
                          <MapPin size={18} />
                          <div>
                            <p className="text-sm font-bold">{b.name}</p>
                            <p className={`text-[10px] font-medium ${selectedBranch?._id === b._id ? 'text-white/60' : 'text-black/40'}`}>{b.address}</p>
                          </div>
                        </div>
                        {selectedBranch?._id === b._id && <Check size={18} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                {requiredDocs.length === 0 ? (
                  <div className="text-center py-24 bg-black/5 rounded-sm border border-dashed border-black/10">
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">No documents required for selected services</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {requiredDocs.map((rd, i) => (
                      <div key={i} className="p-6 border border-black/5 rounded-sm bg-black/[0.02] space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-black/80">{rd.label}</p>
                            <p className="text-[10px] text-black/40 font-medium mt-1">{rd.required ? 'Required' : 'Optional'}</p>
                          </div>
                          {formData.documents[rd.label] && <Check size={16} className="text-green-500" />}
                        </div>
                        <input 
                          type="file" 
                          id={`file-${i}`} 
                          className="hidden" 
                          onChange={e => handleFileUpload(rd.label, e.target.files?.[0] || null)} 
                        />
                        <label 
                          htmlFor={`file-${i}`}
                          className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-black/10 rounded-sm text-[10px] font-bold uppercase tracking-widest text-black/60 hover:bg-black/5 transition-all cursor-pointer"
                        >
                          <Upload size={14} /> {formData.documents[rd.label]?.name || 'Choose File'}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-12 border-t border-black/5">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-6 border border-black/10 rounded-sm font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-black/5 transition-all"
                >
                  Previous
                </button>
              )}
              {step < 3 ? (
                <button 
                  onClick={handleNext}
                  className="flex-1 py-6 bg-black text-white rounded-sm font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-black/90 transition-all shadow-xl"
                >
                  Continue
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 py-6 bg-indigo-600 text-white rounded-sm font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-700 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  Submit Application
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface FormInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  placeholder?: string;
  error?: string;
}

function FormInput({ label, value, onChange, icon, placeholder, error }: FormInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${error ? 'text-red-500' : 'text-black/40'}`}>
          {icon} {label}
        </label>
        {error && (
          <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">
            {error}
          </span>
        )}
      </div>
      <input 
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-black/[0.02] border rounded-sm text-sm focus:outline-none transition-all ${
          error ? 'border-red-500 bg-red-50' : 'border-black/10 focus:border-black'
        }`}
      />
    </div>
  );
}

