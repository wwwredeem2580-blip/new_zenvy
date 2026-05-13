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
  FileCheck,
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
  Building2,
  Plus,
  ArrowDownCircle,
  AlertCircle,
  Search
} from "lucide-react";
import { useState, useRef, useMemo, useEffect } from "react";
import React from "react";
import { applicationApi } from "../lib/api/applicationApi";
import { authApi } from "../lib/api/authApi";
import PaymentSelection, { PaymentMethod } from "./ui/PaymentSelection";
import DateDropdownField from "./ui/DateDropdownField";
import { toast } from "sonner";
import { validateFile } from "../lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { branchApi, Branch } from "../lib/api/branchApi";
import { paymentSettingsApi, PaymentSettings } from "../lib/api/paymentSettingsApi";

const IconMap: Record<string, React.ReactNode> = {
  FileText: <FileText size={20} />,
  Building2: <Building2 size={20} />,
  Globe: <Globe size={20} />,
  IdCard: <IdCard size={20} />,
};

interface RequiredDocument {
  label: string;
  required: boolean;
  instruction?: string;
}

interface DynamicSubService {
  name: string;
  price: number;
  duration: string;
  requiredDocuments: RequiredDocument[];
}

interface DynamicService {
  id: string;
  name: string;
  icon: string;
  subservices: DynamicSubService[];
}

type Step = 1 | 2 | 3 | 4 | 5;

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
  selectedServices: DynamicSubService[];
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
  documents: {},
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

export default function ApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuth();
  const checkoutRef = useRef<HTMLDivElement>(null);
  const [showBouncingArrow, setShowBouncingArrow] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const [isShowPayment, setIsShowPayment] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [availableServices, setAvailableServices] = useState<DynamicService[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [isUseCredits, setIsUseCredits] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({});

  useEffect(() => {
    paymentSettingsApi.getPublic().then(setPaymentSettings).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await applicationApi.listServices();
        if (res.success) {
          setAvailableServices(res.services);
        }
      } catch (err) {
        console.error("Failed to load services", err);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await branchApi.listPublicBranches();
        if (res.success && res.branches.length > 0) {
          setBranches(res.branches);
          const main = res.branches.find((b: Branch) => b.isMain) || res.branches[0];
          setSelectedBranch(main);
        }
      } catch (err) {
        console.error("Failed to load branches", err);
      }
    };
    fetchBranches();
  }, []);

  const requiredDocs = useMemo(() => {
    const docsMap = new Map<string, RequiredDocument>();
    formData.selectedServices.forEach(sub => {
      sub.requiredDocuments.forEach(doc => {
        const existing = docsMap.get(doc.label);
        if (!existing || (!existing.required && doc.required)) {
          docsMap.set(doc.label, doc);
        }
      });
    });
    if (!docsMap.has("Other Documents") && formData.selectedServices.length > 0) {
      docsMap.set("Other Documents", { label: "Other Documents", required: false, instruction: "Any additional certifications" });
    }
    return Array.from(docsMap.values());
  }, [formData.selectedServices]);

  const allSubservices = useMemo(() => {
    return availableServices.flatMap(service => 
      service.subservices.map(sub => ({
        ...sub,
        categoryId: service.id,
        categoryName: service.name,
        icon: service.icon
      }))
    );
  }, [availableServices]);

  const serviceCategories = useMemo(() => {
    return [
      { id: "all", name: "All Services" },
      ...availableServices.map(s => ({ id: s.id, name: s.name }))
    ];
  }, [availableServices]);

  const filteredServices = useMemo(() => {
    return allSubservices.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || service.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, allSubservices]);

  const onClose = () => router.push('/');
  const onComplete = async () => {
    try {
      const response = await authApi.getMe();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error("Failed to refresh user after completion", error);
    }
  };

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
    const serviceParam = searchParams.get('subservice');
    if (serviceParam && availableServices.length > 0) {
      let foundSubService: DynamicSubService | undefined;
      for (const service of availableServices) {
        foundSubService = service.subservices.find(s => s.name === serviceParam || encodeURIComponent(s.name) === serviceParam);
        if (foundSubService) break;
      }
      
      if (foundSubService) {
        setFormData(prev => {
          if (prev.selectedServices.some(s => s.name === foundSubService!.name)) return prev;
          return {
            ...prev,
            selectedServices: [...prev.selectedServices, foundSubService!]
          };
        });
      }
    }
  }, [searchParams, availableServices]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleService = (subservice: DynamicSubService) => {
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
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }
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
      if (formData.codiceFiscale.length !== 16) newErrors.codiceFiscale = "Codice Fiscale must be 16 characters";
      if (formData.phone.length < 5) newErrors.phone = "Valid phone number is required";
      if (!formData.email.includes('@')) newErrors.email = "Valid email address is required";
      if (!formData.streetAddress) newErrors.streetAddress = "Street address is required";
      if (!formData.postCode) newErrors.postCode = "Post code is required";
      if (!formData.province) newErrors.province = "Province is required";
    }
    
    if (step === 3) {
      if (formData.selectedServices.length === 0) {
        toast.error("Please select at least one service");
        return false;
      }
    }

    if (step === 4) {
      if (!selectedBranch) {
        toast.error("Please select a branch location");
        return false;
      }
    }

    if (step === 5) {
      const missingDocs = requiredDocs.filter(rd => rd.required && !formData.documents[rd.label]);
      if (missingDocs.length > 0) {
        missingDocs.forEach(rd => {
          newErrors[rd.label] = "Required";
        });
        setErrors(newErrors);
        toast.error("Please upload all required documents");
        return false;
      }
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

  const uploadFiles = async () => {
    const uploadedAttachments = [];
    const documentEntries = Object.entries(formData.documents).filter(([_, file]) => file !== null);

    for (const [label, file] of documentEntries) {
      if (!file) continue;
      
      try {
        const { objectKey, filename } = await applicationApi.uploadAttachment(file);
        uploadedAttachments.push({
          name: filename,
          label: label,
          url: objectKey,
          uploadedBy: formData.name,
          uploadedById: user?.id || 'guest',
          uploadedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error(`Error uploading ${label}:`, err);
        throw err;
      }
    }
    
    return uploadedAttachments;
  };

  const handlePaymentSuccess = async (method: PaymentMethod | 'Credits', transactionId?: string) => {
    setIsShowPayment(false);
    setIsLoading(true);
    
    try {
      const attachments = await uploadFiles();

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
        branchId: selectedBranch?._id || '',
        branchName: selectedBranch?.name || '',
        paymentMethod: method as any,
        transactionId,
        attachments,
      });
      
      setSubmittedAppId(applicationResponse.application.applicationId);
      setIsSubmitted(true);
      if (onComplete) onComplete();
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error?.message || "Failed to submit application");
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
                  {step === 1 ? "Basic Info." : step === 2 ? "Contact Details." : step === 3 ? "Select Services." : step === 4 ? "Choose Location." : "Upload Documents."}
                </h1>
                <p className="text-sm text-muted max-w-lg font-light">
                  {step === 1 
                    ? "Let's start with your identity information." 
                    : step === 2
                    ? "How can we reach you and where do you reside?"
                    : step === 3
                    ? "Choose the services that best fit your needs."
                    : step === 4
                    ? "Select the office location where you'd like to receive your service."
                    : "Please provide high-quality scans of the required documents."}
                </p>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
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
                      label="Nationality *"
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
                        icon={<Home size={14} />}
                        placeholder="Rome"
                        error={errors.province}
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8">
                    {/* Search and Filter Controls */}
                    <div className="space-y-6">
                      <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-text transition-colors" size={20} />
                        <input 
                          type="text"
                          placeholder="Search for a service..."
                          className="w-full pl-14 pr-6 py-3 bg-surface border border-border rounded-[20px] focus:outline-none focus:border-text/30 shadow-xl shadow-text/5 transition-all text-text placeholder:text-text/20 font-medium text-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {serviceCategories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
                              selectedCategory === cat.id 
                                ? "bg-text text-bg shadow-lg shadow-text/20 scale-105" 
                                : "bg-surface text-text/40 hover:bg-text/5 hover:text-text border border-border"
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {filteredServices.length > 0 ? (
                        filteredServices.map((sub, i) => {
                          const isSelected = formData.selectedServices.some(s => s.name === sub.name);
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => toggleService(sub)}
                              className={`group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-[20px] border transition-all duration-300 text-left ${
                                isSelected
                                  ? "bg-text text-bg border-text shadow-lg"
                                  : "bg-surface border-border hover:border-text/30 hover:shadow-xl hover:shadow-text/5"
                              }`}
                            >
                              <div className="flex items-center gap-5 flex-1">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                                  isSelected ? "bg-bg/10 text-bg" : "bg-text/5 text-text"
                                }`}>
                                  {IconMap[sub.icon] || <FileText size={18} />}
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm ${
                                      isSelected ? "text-bg/60 bg-bg/10" : "text-text/40 bg-text/5"
                                    }`}>
                                      {sub.categoryName}
                                    </span>
                                  </div>
                                  <h4 className={`font-bold text-base leading-tight ${isSelected ? "text-bg" : "text-text"}`}>{sub.name}</h4>
                                  <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${
                                    isSelected ? "text-bg/60" : "text-muted"
                                  }`}>
                                    <Clock size={12} /> {sub.duration}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 shrink-0">
                                <div className="text-right">
                                  <span className={`block font-space text-2xl font-bold ${isSelected ? "text-bg" : "text-text"}`}>
                                    €{sub.price}
                                  </span>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isSelected ? "border-bg bg-bg" : "border-border bg-surface group-hover:border-text/30"
                                }`}>
                                  {isSelected && <Check size={14} className="text-text" />}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-center py-12 bg-surface/50 rounded-xl border border-dashed border-border">
                          <p className="text-text/40 font-bold uppercase tracking-widest text-[10px]">No services found</p>
                        </div>
                      )}
                    </div>

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
                            <span className="block text-[8px] uppercase tracking-[0.2em] opacity-40 font-bold mb-1">Total Due</span>
                            <span className="block text-4xl font-space font-bold">€{finalAmount}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div className="grid gap-4">
                    {branches.length === 0 ? (
                      <div className="text-center py-12 bg-surface/50 rounded-xl border border-dashed border-border">
                        <MapPin size={32} className="mx-auto text-text/20 mb-3" />
                        <p className="text-text/40 font-bold uppercase tracking-widest text-[10px]">No branches available</p>
                      </div>
                    ) : (
                      branches.map((branch) => {
                        const isSelected = selectedBranch?._id === branch._id;
                        return (
                          <button
                            key={branch._id}
                            type="button"
                            onClick={() => setSelectedBranch(branch)}
                            className={`group text-left p-6 rounded-[24px] border transition-all duration-300 ${
                              isSelected
                                ? "bg-text text-bg border-text shadow-lg"
                                : "bg-surface border-border hover:border-text/30 hover:shadow-xl"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${ isSelected ? "bg-bg/10 text-bg" : "bg-text/5 text-text" }`}>
                                  <MapPin size={20} />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className={`font-bold text-lg leading-tight ${isSelected ? "text-bg" : "text-text"}`}>{branch.name}</h4>
                                    {branch.isMain && (
                                      <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm ${ isSelected ? "text-bg/60 bg-bg/10" : "text-text/40 bg-text/5" }`}>Main</span>
                                    )}
                                  </div>
                                  <p className={`text-sm font-medium ${ isSelected ? "text-bg/80" : "text-text/70" }`}>{branch.address}</p>
                                  {branch.workingHours && (
                                    <p className={`text-[11px] font-bold uppercase tracking-widest ${ isSelected ? "text-bg/50" : "text-muted" }`}>
                                      <Clock size={11} className="inline mr-1" />{branch.workingHours}
                                    </p>
                                  )}
                                  {branch.phone && (
                                    <p className={`text-[11px] ${ isSelected ? "text-bg/50" : "text-muted" }`}>{branch.phone}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2 shrink-0">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${ isSelected ? "border-bg bg-bg" : "border-border bg-surface group-hover:border-text/30" }`}>
                                  {isSelected && <Check size={14} className="text-text" />}
                                </div>
                                {branch.googleMapsUrl && (
                                  <a
                                    href={branch.googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className={`text-[10px] font-bold uppercase tracking-widest underline underline-offset-2 ${ isSelected ? "text-bg/60 hover:text-bg" : "text-blue-500 hover:text-blue-700" }`}
                                  >
                                    View Map
                                  </a>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}

                {step === 5 && (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {requiredDocs.map((rd, idx) => (
                      <FileUploadSlot
                        key={rd.label}
                        label={`${rd.label}${rd.required ? " *" : ""}`}
                        icon={rd.label.toLowerCase().includes("passport") ? <BookOpen size={24} /> : rd.label.toLowerCase().includes("nid") ? <IdCard size={24} /> : <FileCheck size={24} />}
                        onFileSelect={(file) => handleFileUpload(rd.label, file)}
                        file={formData.documents[rd.label]}
                        description={rd.instruction || (rd.required ? "Required document" : "Optional document")}
                        error={errors[rd.label]}
                      />
                    ))}
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

                  {step < 5 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-text text-bg px-10 py-3 rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-text/10"
                    >
                      Continue to {step === 1 ? "Contact" : step === 2 ? "Services" : step === 3 ? "Location" : "Documents"}
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep()) {
                          if (finalAmount === 0) {
                            handlePaymentSuccess('Credits');
                          } else {
                            setIsShowPayment(true);
                          }
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
            paymentSettings={paymentSettings}
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

function FileUploadSlot({ label, icon, description, onFileSelect, file, error }: { 
  label: string; 
  icon: React.ReactNode;
  description: string;
  onFileSelect: (f: File | null) => void; 
  file: File | null;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={`text-[10px] font-bold uppercase tracking-widest ${error ? 'text-red-500' : 'text-muted'}`}>{label}</label>
        {error && <span className="text-[8px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1"><AlertCircle size={10} /> {error}</span>}
      </div>
      <div 
        onClick={() => inputRef.current?.click()}
        className={`group relative h-40 border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ${
          file 
            ? "border-text bg-text/5 shadow-inner" 
            : error 
              ? "border-red-200 bg-red-50/30 hover:border-red-300"
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
            My Profile
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-text text-bg px-8 py-4 rounded-3xl font-bold text-xs hover:scale-105 transition-all shadow-xl"
          >
            Back to Home
          </button>
        </div>
      </div>
    </motion.div>
  );
}
