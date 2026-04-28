"use client";

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
  ChevronDown,
  Timer,
  BookOpen,
  IdCard,
  FileCheck,
  Building2,
  Plus,
  ArrowDownCircle
} from "lucide-react";
import { useState, useRef, useMemo, useEffect } from "react";
import React from "react";
import { mockApi } from "../lib/api/mockApi";
import { applicationApi } from "../lib/api/applicationApi";
import PaymentSelection, { PaymentMethod } from "./ui/PaymentSelection";
import DateDropdownField from "./ui/DateDropdownField";

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
  streetAddress: string;
  postCode: string;
  province: string;
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
  streetAddress: "",
  postCode: "",
  province: "",
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

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ApplicationForm() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const checkoutRef = useRef<HTMLDivElement>(null);
  const [showBouncingArrow, setShowBouncingArrow] = useState(false);

  const onClose = () => router.push('/');
  const onComplete = () => {
    const freshUser = mockApi.getCurrentUser();
    if (freshUser) setUser(freshUser);
  };
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowPayment, setIsShowPayment] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [isUseCredits, setIsUseCredits] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Pre-populate data if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      }));
      setUserBalance(user.balance || 0);
    }
  }, [user]);

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
      const newSelection = isSelected 
        ? prev.selectedServices.filter((s) => s.name !== subservice.name) 
        : [...prev.selectedServices, subservice];
      
      if (!isSelected && newSelection.length === 1) {
        setShowBouncingArrow(true);
      } else if (newSelection.length === 0) {
        setShowBouncingArrow(false);
      }

      return { ...prev, selectedServices: newSelection };
    });
  };

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowBouncingArrow(false);
  };

  const totalCost = useMemo(() => {
    return formData.selectedServices.reduce((acc, curr) => acc + curr.price, 0);
  }, [formData.selectedServices]);

  const discountAmount = useMemo(() => {
    return isUseCredits ? Math.min(totalCost, userBalance) : 0;
  }, [totalCost, userBalance, isUseCredits]);

  const finalAmount = useMemo(() => {
    return totalCost - discountAmount;
  }, [totalCost, discountAmount]);

  const handleFileUpload = (key: string, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [key]: file },
    }));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (formData.name.length < 2) newErrors.name = "Full name is required";
      if (!formData.dob) newErrors.dob = "Date of birth is required";
      if (!formData.pob) newErrors.pob = "Place of birth is required";
      if (!formData.nationality) newErrors.nationality = "Nationality is required";
    }
    
    if (step === 2) {
      if (formData.codiceFiscale.length !== 16) newErrors.codiceFiscale = "Codice Fiscale must be exactly 16 characters";
      if (formData.phone.length < 5) newErrors.phone = "Valid phone number is required";
      if (!formData.email.includes('@')) newErrors.email = "Valid email address is required";
      if (!formData.streetAddress) newErrors.streetAddress = "Street address is required";
      if (!formData.postCode) newErrors.postCode = "Post code is required";
      if (!formData.province) newErrors.province = "Province is required";
    }
    
    if (step === 3) {
      if (formData.selectedServices.length === 0) newErrors.services = "Please select at least one service";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => (prev + 1) as Step);
      setErrors({});
    }
  };
  const prevStep = () => setStep((prev) => (prev - 1) as Step);

  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount === 0) {
      handlePaymentSuccess('Credits');
    } else {
      setIsShowPayment(true);
    }
  };

  const handlePaymentSuccess = async (method: PaymentMethod | 'Credits') => {
    setIsShowPayment(false);
    setIsLoading(true);
    
    try {
      const user = mockApi.getCurrentUser();
      if (user && discountAmount > 0) {
        await mockApi.deductCredits(user.id, discountAmount);
      }

      const applicationResponse = await applicationApi.submitApplication({
        name: formData.name,
        dob: formData.dob,
        pob: formData.pob,
        nationality: formData.nationality,
        codiceFiscale: formData.codiceFiscale,
        phone: formData.phone,
        email: formData.email,
        address: `${formData.streetAddress}, ${formData.postCode}, ${formData.province}`,
        streetAddress: formData.streetAddress,
        postCode: formData.postCode,
        province: formData.province,
        permessoType: formData.permessoType,
        permessoExpiry: formData.permessoExpiry,
        selectedServices: formData.selectedServices,
        paymentMethod: method as any,
      });
      
      setSubmittedAppId(applicationResponse.application.id);
      setIsSubmitted(true);
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
                    <InputField
                      label="Place of Birth"
                      name="pob"
                      value={formData.pob}
                      onChange={handleInputChange}
                      icon={<MapPin size={14} />}
                      placeholder="Rome, Italy"
                      error={errors.pob}
                    />
                    <InputField
                      label="Nationality"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      icon={<Globe size={14} />}
                      placeholder="Italian"
                      error={errors.nationality}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputField
                        label="Codice Fiscale *"
                        name="codiceFiscale"
                        value={formData.codiceFiscale}
                        onChange={handleInputChange}
                        icon={<Hash size={14} />}
                        placeholder="RSSMRA80A01H501W"
                        error={errors.codiceFiscale}
                      />
                      <InputField
                        label="Phone Number *"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        icon={<Phone size={14} />}
                        placeholder="+39 123 456 7890"
                        error={errors.phone}
                      />
                      <InputField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        icon={<Mail size={14} />}
                        placeholder="john@example.com"
                        readOnly={!!user}
                        error={errors.email}
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
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-border">
                      <div className="md:col-span-1">
                          <InputField
                             label="Street Address *"
                             name="streetAddress"
                             value={formData.streetAddress}
                             onChange={handleInputChange}
                             icon={<MapPin size={14} />}
                             placeholder="Via Roma 123"
                             error={errors.streetAddress}
                           />
                      </div>
                      <InputField
                        label="Post Code *"
                        name="postCode"
                        value={formData.postCode}
                        onChange={handleInputChange}
                        icon={<Hash size={14} />}
                        placeholder="00100"
                        error={errors.postCode}
                      />
                      <InputField
                        label="Province *"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        icon={<Globe size={14} />}
                        placeholder="Rome"
                        error={errors.province}
                      />
                    </div>

                    <DateDropdownField
                      label="Permesso Expiry"
                      icon={<Clock size={14} />}
                      value={formData.permessoExpiry}
                      onChange={(val) => setFormData(p => ({ ...p, permessoExpiry: val }))}
                      disablePast
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
                        ref={checkoutRef}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-6 bg-text text-bg rounded-[24px] flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl relative overflow-hidden"
                      >
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                         
                        <div className="relative z-10">
                          <h4 className="text-xl font-space font-bold tracking-tight">Checkout Summary.</h4>
                          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">
                             <span>{formData.selectedServices.length} Selected</span>
                             {userBalance > 0 && (
                                <button 
                                  type="button"
                                  onClick={() => setIsUseCredits(!isUseCredits)}
                                  className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${isUseCredits ? 'bg-green-400 text-bg border-green-400' : 'bg-white/10 text-white/40 border-white/5'}`}
                                >
                                   {isUseCredits ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full bg-white/10" />}
                                   Use Credits (€{userBalance})
                                </button>
                             )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 relative z-10">
                          <div className="text-right">
                            <span className="block text-[8px] uppercase tracking-widest font-bold opacity-40">Amount to Pay</span>
                            <span className="text-3xl font-space font-bold">€{finalAmount}</span>
                            {(discountAmount > 0 || (!isUseCredits && userBalance > 0)) && (
                               <span className="block text-[8px] opacity-20">
                                  {isUseCredits ? `Selected Total €${totalCost}` : `€${userBalance} Credits Available`}
                               </span>
                            )}
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
                      disabled={false}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-text text-bg px-10 py-3 rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-text/10"
                    >
                      Continue to {step === 1 ? "Contact" : step === 2 ? "Services" : "Documents"}
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                         if (finalAmount === 0) {
                            handlePaymentSuccess('Credits');
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

        {/* Smart Bouncing Arrow */}
        <AnimatePresence>
          {showBouncingArrow && step === 3 && (
            <motion.button
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              onClick={scrollToCheckout}
              className="fixed bottom-10 right-10 z-[300] bg-text text-bg w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-bg"
            >
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowDownCircle size={32} />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isShowPayment && (
          <PaymentSelection
            amount={finalAmount}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setIsShowPayment(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function InputField({ label, icon, error, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${error ? 'text-red-500' : 'text-muted'}`}>
        {icon} {label}
      </label>
      <div className="relative">
        <input
          {...props}
          className={`w-full bg-surface border rounded-xl px-4 py-3 text-xs focus:outline-none transition-all placeholder:text-muted/20 text-text ${
            error ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-border focus:border-text/30 hover:border-text/10'
          }`}
        />
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-red-500 font-bold mt-1 ml-1"
          >
            {error}
          </motion.p>
        )}
      </div>
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
              <div className="w-12 h-12 rounded-full bg-text text-bg flex items-center justify-center">
                <Check size={24} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold truncate max-w-[200px]">{file.name}</p>
                <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Document Uploaded</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 p-4 text-center"
            >
              <div className="text-muted group-hover:text-text transition-colors">
                {icon}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text">Click to Upload</p>
                <p className="text-[10px] text-muted leading-relaxed max-w-[150px]">{description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SuccessState({ onClose, appId }: { onClose: () => void, appId: string | null }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20 px-8 bg-surface/30 backdrop-blur-xl border border-border rounded-[48px] shadow-2xl relative overflow-hidden"
    >
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-text/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-text/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center max-w-sm mx-auto">
        <div className="w-24 h-24 bg-text text-bg rounded-full flex items-center justify-center mb-10 shadow-2xl">
          <Check size={48} strokeWidth={3} />
        </div>
        <h2 className="text-4xl md:text-5xl font-space font-bold tracking-tighter mb-4">Application Sent.</h2>
        <p className="text-muted text-sm font-light leading-relaxed mb-10">
          Your case <span className="font-bold text-text">#{appId}</span> has been received successfully.
          Our team is now processing your documents.
        </p>
        
        <div className="grid grid-cols-2 gap-4 w-full">
           <button 
            onClick={() => window.location.href = '/profile'}
            className="w-full flex items-center justify-center bg-bg text-text border border-border px-8 py-4 rounded-3xl font-bold text-xs hover:bg-bg/50 transition-all shadow-xl"
          >
            My Applications
          </button>
          <button 
            onClick={onClose}
            className="w-full flex items-center justify-center bg-text text-bg px-8 py-4 rounded-3xl font-bold text-xs hover:scale-105 transition-all shadow-2xl shadow-text/10"
          >
            Return Home
          </button>
        </div>
      </div>
    </motion.div>
  );
}
