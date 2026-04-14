/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
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
  X, 
  Download, 
  Send,
  ChefHat,
  HardHat,
  Briefcase,
  ChevronDown,
  CreditCard,
  Timer,
  BookOpen,
  IdCard,
  FileCheck,
  Building2,
  Plus
} from "lucide-react";
import { useState, useRef, useMemo, useEffect } from "react";
import React from "react";
import { mockApi } from "../lib/api/mockApi";
import StripePayment from "./auth/StripePayment";

type Step = 1 | 2 | 3 | 4;

interface SubService {
  name: string;
  price: number;
  duration: string;
}

interface Service {
  id: string;
  name: string;
  icon: React.ReactNode;
  subservices: SubService[];
}

interface FormData {
  name: string;
  dob: string;
  pob: string;
  nationality: string;
  codiceFiscale: string;
  phone: string;
  email: string;
  address: string;
  permessoType: string;
  permessoExpiry: string;
  selectedServices: SubService[];
  documents: { [key: string]: File | null };
}

const initialData: FormData = {
  name: "",
  dob: "",
  pob: "",
  nationality: "",
  codiceFiscale: "",
  phone: "",
  email: "",
  address: "",
  permessoType: "",
  permessoExpiry: "",
  selectedServices: [],
  documents: {
    passport: null,
    permesso: null,
    codiceFiscaleDoc: null,
    contratto: null,
    other: null,
  },
};

const services: Service[] = [
  {
    id: "servizi-caf",
    name: "SERVIZI CAF",
    icon: <FileText size={20} />,
    subservices: [
      { name: "Cessione di fabbricato", price: 30, duration: "3 Days" },
      { name: "Idoneità alloggiativa / alloggio", price: 50, duration: "7 Days" },
      { name: "Richiesta Carta d’Identità Elettronica (CIE)", price: 25, duration: "5 Days" },
      { name: "Dichiarazione di residenza", price: 30, duration: "5 Days" },
      { name: "Permesso di soggiorno – kit fill-up", price: 40, duration: "7 Days" },
      { name: "Carta di soggiorno – kit fill-up", price: 45, duration: "7 Days" },
      { name: "Ricongiungimento familiare", price: 80, duration: "14 Days" },
      { name: "Cittadinanza italiana", price: 150, duration: "30 Days" },
      { name: "NASPI – disoccupazione", price: 35, duration: "5 Days" },
      { name: "Assegno Unico Universale", price: 20, duration: "3 Days" },
      { name: "Assegno di inclusione", price: 25, duration: "3 Days" },
      { name: "Assegno nucleo familiare", price: 20, duration: "3 Days" },
      { name: "Invalidità civile", price: 60, duration: "10 Days" },
      { name: "Dimissione volontaria", price: 15, duration: "1 Day" },
      { name: "SFL (Servizio di formazione lavoro)", price: 30, duration: "5 Days" },
      { name: "ISEE (Indicatore Situazione Economica Equivalente)", price: 0, duration: "2 Days" },
      { name: "Modello 730", price: 50, duration: "7 Days" },
      { name: "Modello Unico (Persone fisiche)", price: 70, duration: "10 Days" },
      { name: "F24 (Pagamenti fiscali)", price: 10, duration: "1 Day" },
      { name: "Firma digitale", price: 40, duration: "2 Days" },
      { name: "SPID (Sistema Pubblico di Identità Digitale)", price: 20, duration: "1 Day" },
      { name: "PEC (Posta Elettronica Certificata)", price: 25, duration: "1 Day" },
      { name: "Contratto di casa / negozio", price: 100, duration: "7 Days" },
      { name: "Visura catastale e planimetria", price: 20, duration: "2 Days" },
      { name: "Abbonamento ATAC – bus e ticket", price: 5, duration: "1 Day" },
      { name: "Domanda TARI (tassa rifiuti)", price: 30, duration: "5 Days" },
      { name: "Carta acquisti – min. 3 বছর & over 65", price: 20, duration: "5 Days" },
      { name: "Mensa scolastica", price: 15, duration: "3 Days" },
      { name: "Anno scolastico", price: 20, duration: "5 Days" },
      { name: "Bonus comunale", price: 25, duration: "5 Days" },
      { name: "Contratti di lavoro domestico", price: 60, duration: "7 Days" },
    ],
  },
  {
    id: "impresa-servizi",
    name: "IMPRESA SERVIZI",
    icon: <Building2 size={20} />,
    subservices: [
      { name: "Apertura Partita IVA / CCIAA / INPS / SCIA", price: 250, duration: "10 Days" },
      { name: "Chiusura Partita IVA / CCIAA / INPS / SCIA", price: 150, duration: "7 Days" },
      { name: "Variazione Partita IVA / CCIAA", price: 100, duration: "5 Days" },
      { name: "Apertura SRLS (Partita IVA / CCIAA / INPS / Atto / Notaio)", price: 800, duration: "20 Days" },
      { name: "Contratto di Lavoro (UNILAV)", price: 50, duration: "2 Days" },
      { name: "Busta Paga", price: 30, duration: "3 Days" },
      { name: "Electronic Fattura", price: 15, duration: "1 Day" },
      { name: "Contabilità", price: 100, duration: "Monthly" },
      { name: "Bilancio", price: 300, duration: "Annual" },
      { name: "Dichiarazione IVA", price: 150, duration: "Annual" },
      { name: "Comunicazione IVA", price: 50, duration: "Quarterly" },
    ],
  },
  {
    id: "flussi-migratori",
    name: "FLUSSI MIGRATORI",
    icon: <Globe size={20} />,
    subservices: [
      { name: "Richiesta ANPAL", price: 40, duration: "5 Days" },
      { name: "Asseverazione", price: 150, duration: "10 Days" },
      { name: "Idoneità alloggiativa / alloggio", price: 50, duration: "7 Days" },
      { name: "Compilazione domanda flussi", price: 100, duration: "14 Days" },
    ],
  },
  {
    id: "visti",
    name: "VISTI",
    icon: <IdCard size={20} />,
    subservices: [
      { name: "Umrah Visa", price: 200, duration: "10 Days" },
      { name: "Tourist Visa", price: 150, duration: "14 Days" },
    ],
  },
  {
    id: "embassy-services",
    name: "SERVIZI AMBESSATA / EMBASSY SERVICES",
    icon: <Building2 size={20} />,
    subservices: [
      { name: "New born passport application", price: 100, duration: "21 Days" },
      { name: "Birth certificate", price: 50, duration: "14 Days" },
      { name: "Wage Earner membership", price: 30, duration: "7 Days" },
      { name: "E-passport application and appointment", price: 120, duration: "30 Days" },
      { name: "Bangladesh embassy appointment service", price: 20, duration: "2 Days" },
      { name: "NVR (No Visa Required)", price: 80, duration: "14 Days" },
    ],
  },
];

const permessoTypes = [
  "Lavoro Subordinato",
  "Lavoro Autonomo",
  "Motivi Familiari",
  "Studio",
  "Asilo Politico",
  "Protezione Sussidiaria",
  "Altro",
];

function CustomCalendar({ value, onChange, onClose }: { value: string, onChange: (val: string) => void, onClose: () => void }) {
  const [currentDate, setCurrentDate] = useState(new Date(value || new Date()));
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-full left-0 mt-2 bg-surface border border-border rounded-2xl p-4 shadow-2xl z-[200] w-64"
    >
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={prevMonth} className="p-1 hover:bg-bg rounded-lg"><ChevronLeft size={14} /></button>
        <span className="text-[10px] font-bold uppercase tracking-widest">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
        <button type="button" onClick={nextMonth} className="p-1 hover:bg-bg rounded-lg"><ChevronRight size={14} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map(d => (
          <span key={d} className="text-[8px] text-muted font-bold">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={i} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = value === dateStr;
          return (
            <button
              key={day}
              type="button"
              onClick={() => {
                onChange(dateStr);
                onClose();
              }}
              className={`text-[10px] py-1 rounded-lg transition-colors ${isSelected ? 'bg-text text-bg font-bold' : 'hover:bg-bg'}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}



export default function ApplicationForm({ onClose, onComplete }: { onClose: () => void; onComplete?: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowPayment, setIsShowPayment] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState(0);
  
  // Pre-populate data if user is logged in
  useEffect(() => {
    const user = mockApi.getCurrentUser();
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      }));
      setUserBalance(user.balance || 0);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleService = (subservice: SubService) => {
    setFormData((prev) => {
      const isSelected = prev.selectedServices.some(s => s.name === subservice.name);
      if (isSelected) {
        return { ...prev, selectedServices: prev.selectedServices.filter((s) => s.name !== subservice.name) };
      } else {
        return { ...prev, selectedServices: [...prev.selectedServices, subservice] };
      }
    });
  };

  const totalCost = useMemo(() => {
    return formData.selectedServices.reduce((acc, curr) => acc + curr.price, 0);
  }, [formData.selectedServices]);

  const discountAmount = useMemo(() => {
    return Math.min(totalCost, userBalance);
  }, [totalCost, userBalance]);

  const finalAmount = useMemo(() => {
    return totalCost - discountAmount;
  }, [totalCost, discountAmount]);

  const handleFileUpload = (key: string, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [key]: file },
    }));
  };

  const nextStep = () => setStep((prev) => (prev + 1) as Step);
  const prevStep = () => setStep((prev) => (prev - 1) as Step);

  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount === 0) {
      handlePaymentSuccess();
    } else {
      setIsShowPayment(true);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsShowPayment(false);
    setIsLoading(true);
    
    try {
      const user = mockApi.getCurrentUser();
      if (user && discountAmount > 0) {
        await mockApi.deductCredits(user.id, discountAmount);
      }

      const application = await mockApi.submitApplication({
        name: formData.name,
        dob: formData.dob,
        pob: formData.pob,
        nationality: formData.nationality,
        codiceFiscale: formData.codiceFiscale,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        selectedServices: formData.selectedServices
      });
      
      setSubmittedAppId(application.id);
      setIsSubmitted(true);
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid = formData.name && formData.dob && formData.codiceFiscale && formData.phone;

  return (
    <div className="text-text font-dm selection:bg-text selection:text-bg pb-20">
      <div className="max-w-3xl mx-auto pt-8 px-8">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-8">
                <h1 className="text-3xl md:text-5xl font-space font-bold tracking-tighter mb-3">
                  {step === 1 ? "Basic Info." : step === 2 ? "Contact Details." : step === 3 ? "Select Services." : "Upload Documents."}
                </h1>
                <p className="text-sm text-muted max-w-lg font-light">
                  {step === 1 
                    ? "Let's start with your identity information." 
                    : step === 2
                    ? "How can we reach you and where do you reside?"
                    : step === 3
                    ? "Choose the services that best fit your needs."
                    : "Please provide high-quality scans of the required documents."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {step === 1 && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      label="Full Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      icon={<User size={14} />}
                      placeholder="John Doe"
                    />
                    <DateInputField
                      label="Date of Birth *"
                      name="dob"
                      value={formData.dob}
                      onChange={(val: any) => setFormData(prev => ({ ...prev, dob: val }))}
                      icon={<Calendar size={14} />}
                    />
                    <InputField
                      label="Place of Birth"
                      name="pob"
                      value={formData.pob}
                      onChange={handleInputChange}
                      icon={<MapPin size={14} />}
                      placeholder="Rome, Italy"
                    />
                    <InputField
                      label="Nationality"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      icon={<Globe size={14} />}
                      placeholder="Italian"
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      label="Codice Fiscale *"
                      name="codiceFiscale"
                      value={formData.codiceFiscale}
                      onChange={handleInputChange}
                      icon={<Hash size={14} />}
                      placeholder="RSSMRA80A01H501W"
                    />
                    <div className="relative">
                      <InputField
                        label="Phone Number *"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        icon={<Phone size={14} />}
                        placeholder="+39 123 456 7890"
                      />
                    </div>
                    <div className="relative">
                      <InputField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        icon={<Mail size={14} />}
                        placeholder="john@example.com"
                        readOnly={!!mockApi.getCurrentUser()}
                      />
                    </div>
                    <InputField
                      label="Residential Address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      icon={<Home size={14} />}
                      placeholder="Via Roma 123, Milan"
                    />
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                        <FileText size={12} /> Permesso Type
                      </label>
                      <div className="relative">
                        <select
                          name="permessoType"
                          value={formData.permessoType}
                          onChange={handleInputChange}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-text/30 appearance-none transition-colors"
                        >
                          <option value="">Select Type</option>
                          {permessoTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
                      </div>
                    </div>

                    <DateInputField
                      label="Permesso Expiry"
                      name="permessoExpiry"
                      value={formData.permessoExpiry}
                      onChange={(val: any) => setFormData(prev => ({ ...prev, permessoExpiry: val }))}
                      icon={<Clock size={14} />}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="border border-border rounded-[24px] overflow-hidden bg-surface/30 backdrop-blur-sm">
                        <button
                          type="button"
                          onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-text/5 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text shadow-inner">
                              {service.icon}
                            </div>
                            <div className="text-left">
                              <span className="block font-space text-lg font-bold tracking-tight text-text">{service.name}</span>
                              <span className="text-[8px] text-muted uppercase tracking-widest font-medium">
                                {service.subservices.length} options available
                              </span>
                            </div>
                          </div>
                          <ChevronDown 
                            size={16} 
                            className={`transition-transform duration-500 ${expandedService === service.id ? 'rotate-180' : ''}`} 
                          />
                        </button>
                        
                        <AnimatePresence>
                          {expandedService === service.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6 pt-1 grid grid-cols-1 gap-3">
                                {service.subservices.map((sub) => {
                                  const isSelected = formData.selectedServices.some(s => s.name === sub.name);
                                  return (
                                    <button
                                      key={sub.name}
                                      type="button"
                                      onClick={() => toggleService(sub)}
                                      className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-500 ${
                                        isSelected
                                          ? "bg-text text-bg border-text shadow-lg scale-[1.01]"
                                          : "bg-surface border-border hover:border-text/30 hover:bg-text/5"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-bg bg-bg' : 'border-muted'}`}>
                                          {isSelected && <Check size={12} className="text-text" />}
                                        </div>
                                        <div className="text-left">
                                          <span className={`block font-bold text-sm ${isSelected ? 'text-bg' : 'text-text'}`}>{sub.name}</span>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`flex items-center gap-1 text-[8px] uppercase tracking-widest font-bold ${isSelected ? 'text-bg/60' : 'text-muted'}`}>
                                              <Timer size={10} /> {sub.duration}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className={`block font-space text-xl font-bold ${isSelected ? 'text-bg' : 'text-text'}`}>
                                          €{sub.price}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}

                    {/* Cost Summary Sticky Bar */}
                    {formData.selectedServices.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-6 bg-text text-bg rounded-[24px] flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl relative overflow-hidden"
                      >
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                         
                        <div className="relative z-10">
                          <h4 className="text-xl font-space font-bold tracking-tight">Checkout Summary.</h4>
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
                             <span>{formData.selectedServices.length} Selected</span>
                             {discountAmount > 0 && (
                                <span className="text-green-400 bg-white/10 px-2 py-0.5 rounded-full border border-white/5 animate-pulse">
                                   Credits Applied: -€{discountAmount}
                                </span>
                             )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 relative z-10">
                          <div className="text-right">
                            <span className="block text-[8px] uppercase tracking-widest font-bold opacity-40">Amount to Pay</span>
                            <span className="text-3xl font-space font-bold">€{finalAmount}</span>
                            {discountAmount > 0 && <span className="block text-[8px] line-through opacity-20">Total €{totalCost}</span>}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FileUploadSlot
                      label="Passport"
                      icon={<BookOpen size={24} />}
                      onFileSelect={(file) => handleFileUpload("passport", file)}
                      file={formData.documents.passport}
                      description="Main page with photo"
                    />
                    <FileUploadSlot
                      label="Permesso di Soggiorno"
                      icon={<IdCard size={24} />}
                      onFileSelect={(file) => handleFileUpload("permesso", file)}
                      file={formData.documents.permesso}
                      description="Front and back scan"
                    />
                    <FileUploadSlot
                      label="Codice Fiscale"
                      icon={<FileCheck size={24} />}
                      onFileSelect={(file) => handleFileUpload("codiceFiscaleDoc", file)}
                      file={formData.documents.codiceFiscaleDoc}
                      description="Official document or card"
                    />
                    <FileUploadSlot
                      label="Contratto Affitto"
                      icon={<Building2 size={24} />}
                      onFileSelect={(file) => handleFileUpload("contratto", file)}
                      file={formData.documents.contratto}
                      description="Signed lease agreement"
                    />
                    <FileUploadSlot
                      label="Other Documents"
                      icon={<Plus size={24} />}
                      onFileSelect={(file) => handleFileUpload("other", file)}
                      file={formData.documents.other}
                      description="Any additional certifications"
                    />
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    type="button"
                    onClick={step === 1 ? onClose : prevStep}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border text-xs font-bold hover:border-text/30 transition-all text-text"
                  >
                    <ChevronLeft size={16} />
                    {step === 1 ? "Cancel Application" : "Previous Step"}
                  </button>

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={
                        (step === 1 && (!formData.name || !formData.dob)) ||
                        (step === 2 && (!formData.codiceFiscale || !formData.phone))
                      }
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-text text-bg px-10 py-3 rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 shadow-xl shadow-text/10"
                    >
                      Continue to {step === 1 ? "Contact" : step === 2 ? "Services" : "Documents"}
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                         if (finalAmount === 0) {
                            handlePaymentSuccess();
                         } else {
                            setIsShowPayment(true);
                         }
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-text text-bg px-10 py-3 rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-text/10"
                    >
                      {isLoading ? "Processing..." : finalAmount === 0 ? "Use Credits & Submit" : `Pay €${finalAmount} & Submit`}
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          ) : (
            <SuccessState onClose={onClose} appId={submittedAppId} />
          )}
        </AnimatePresence>
      </div>



      <AnimatePresence>
        {isShowPayment && (
          <StripePayment 
            amount={finalAmount}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setIsShowPayment(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function InputField({ label, icon, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-2">
        {icon} {label}
      </label>
      <input
        {...props}
        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-text/30 transition-all placeholder:text-muted/20 hover:border-text/10 text-text"
      />
    </div>
  );
}

function DateInputField({ label, icon, value, onChange }: any) {
  const [showCalendar, setShowCalendar] = useState(false);
  return (
    <div className="space-y-2 relative">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-2">
        {icon} {label}
      </label>
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-xs text-left focus:outline-none focus:border-text/30 transition-all hover:border-text/10 flex items-center justify-between"
      >
        <span className={value ? 'text-text' : 'text-muted/40'}>{value || "Select Date"}</span>
        <Calendar size={14} className="text-muted" />
      </button>
      {showCalendar && (
        <CustomCalendar 
          value={value} 
          onChange={onChange} 
          onClose={() => setShowCalendar(false)} 
        />
      )}
    </div>
  );
}

function FileUploadSlot({ label, icon, description, onFileSelect, file }: { 
  label: string; 
  icon: React.ReactNode;
  description: string;
  onFileSelect: (f: File | null) => void; 
  file: File | null 
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</label>
      <div 
        onClick={() => inputRef.current?.click()}
        className={`group relative h-40 border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ${
          file 
            ? "border-text bg-text/5 shadow-inner" 
            : "border-border hover:border-text/30 hover:bg-text/5 bg-surface/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
        />
        
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div 
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-2 p-4 text-center"
            >
              <div className="w-10 h-10 bg-text text-bg rounded-full flex items-center justify-center shadow-lg">
                <Check size={20} />
              </div>
              <div>
                <span className="block text-xs font-bold truncate max-w-[150px] text-text">{file.name}</span>
                <span className="text-[8px] uppercase tracking-widest font-bold text-muted mt-0.5 block">File Uploaded</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect(null);
                }}
                className="mt-1 px-3 py-1.5 rounded-lg bg-surface border border-border text-[8px] uppercase tracking-widest font-bold text-muted hover:text-text hover:border-text/30 transition-all"
              >
                Replace File
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-2 text-center px-4"
            >
              <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-muted group-hover:text-text group-hover:border-text/30 transition-all duration-500 shadow-sm">
                {icon}
              </div>
              <div>
                <span className="block text-xs font-bold text-text">Click to upload</span>
                <span className="text-[10px] text-muted mt-0.5 block">{description}</span>
              </div>
              <div className="mt-1 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-muted group-hover:scale-110 transition-transform">
                <Plus size={12} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SuccessState({ onClose, appId }: { onClose: () => void; appId: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center space-y-8"
    >
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -inset-8 bg-text/10 blur-2xl rounded-full"
        />
        <div className="w-24 h-24 bg-text text-bg rounded-[32px] flex items-center justify-center shadow-2xl relative z-10 rotate-12">
          <Check size={48} strokeWidth={3} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-4xl md:text-6xl font-space font-bold tracking-tighter text-text">Application Sent!</h2>
        <p className="text-sm text-muted max-w-md mx-auto font-light">
          Your application has been successfully submitted. Our team will review your details shortly.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-[24px] p-8 w-full max-w-xs shadow-inner">
        <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-muted mb-2">Application ID</p>
        <p className="text-4xl font-mono font-bold text-text tracking-tighter">#{appId}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button className="flex-1 flex items-center justify-center gap-2 bg-surface border border-border px-6 py-4 rounded-full text-xs font-bold hover:border-text/30 transition-all shadow-lg text-text">
          <Download size={16} />
          Receipt
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 bg-text text-bg px-6 py-4 rounded-full text-xs font-bold hover:scale-105 transition-all shadow-xl shadow-text/10">
          <Send size={16} />
          Email Me
        </button>
      </div>

      <button
        onClick={onClose}
        className="text-[10px] uppercase tracking-widest font-bold text-muted hover:text-text transition-colors pt-4"
      >
        Return to Homepage
      </button>
    </motion.div>
  );
}
