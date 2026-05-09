/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  AlertCircle
} from 'lucide-react';
import { applicationApi } from '../../lib/api/applicationApi';
import { branchApi, Branch } from '../../lib/api/branchApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { validateFile } from '../../lib/utils';

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

  const handleSubmit = async () => {
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
        });
      }

      // 2. Submit application
      await applicationApi.submitApplication({
        ...formData,
        address: `${formData.streetAddress}, ${formData.postCode}, ${formData.province}`,
        userId: selectedUser.id,
        branchId: selectedBranch?._id || '',
        branchName: selectedBranch?.name || '',
        paymentMethod: 'Cash', // Default for agent submissions
        attachments,
        submittedBy: {
          agentId: agent?.id || '',
          agentName: `${agent?.firstName} ${agent?.lastName}`,
          method: 'agent_assisted'
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
                {step === 1 ? "Client Identity" : step === 2 ? "Services" : step === 3 ? "Documents" : "Review"}
              </h2>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-black/5 rounded-sm"><X size={24} /></button>
          </div>

          <div className="space-y-12">
            {step === 1 && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormInput label="Full Name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} icon={<User size={14}/>} />
                  <FormInput label="Date of Birth" value={formData.dob} onChange={(v: string) => setFormData({...formData, dob: v})} icon={<Calendar size={14}/>} placeholder="YYYY-MM-DD" />
                  <FormInput label="Place of Birth" value={formData.pob} onChange={(v: string) => setFormData({...formData, pob: v})} icon={<MapPin size={14}/>} />
                  <FormInput label="Nationality" value={formData.nationality} onChange={(v: string) => setFormData({...formData, nationality: v})} icon={<Globe size={14}/>} />
                  <FormInput label="Codice Fiscale" value={formData.codiceFiscale} onChange={(v: string) => setFormData({...formData, codiceFiscale: v})} icon={<Hash size={14}/>} />
                  <FormInput label="Phone" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} icon={<Phone size={14}/>} />
                </div>
                <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-black/5">
                  <div className="md:col-span-1">
                    <FormInput label="Street Address" value={formData.streetAddress} onChange={(v: string) => setFormData({...formData, streetAddress: v})} icon={<Home size={14}/>} />
                  </div>
                  <FormInput label="Post Code" value={formData.postCode} onChange={(v: string) => setFormData({...formData, postCode: v})} icon={<Hash size={14}/>} />
                  <FormInput label="Province" value={formData.province} onChange={(v: string) => setFormData({...formData, province: v})} icon={<MapPin size={14}/>} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="grid gap-3">
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
                        className={`flex items-center justify-between p-6 border rounded-sm transition-all ${isSelected ? 'bg-black text-white border-black' : 'bg-white border-black/5 hover:border-black/20'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${isSelected ? 'bg-white/10' : 'bg-black/5'}`}>
                            {IconMap[sub.icon] || <FileText size={18}/>}
                          </div>
                          <div className="text-left">
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
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 block mb-4">Submission Location</label>
                  <div className="grid gap-3">
                    {branches.map(b => (
                      <button
                        key={b._id}
                        onClick={() => setSelectedBranch(b)}
                        className={`flex items-center justify-between p-6 border rounded-sm transition-all ${selectedBranch?._id === b._id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-black/5 hover:border-black/20'}`}
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
                  onClick={() => setStep(step + 1)}
                  disabled={step === 2 && formData.selectedServices.length === 0}
                  className="flex-1 py-6 bg-black text-white rounded-sm font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-black/90 transition-all disabled:opacity-20"
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
}

function FormInput({ label, value, onChange, icon, placeholder }: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
        {icon} {label}
      </label>
      <input 
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-black/[0.02] border border-black/10 rounded-sm text-sm focus:outline-none focus:border-black transition-all"
      />
    </div>
  );
}
