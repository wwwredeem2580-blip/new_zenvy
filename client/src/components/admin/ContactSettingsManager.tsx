"use client";

import React, { useEffect, useState } from "react";
import { Save, Phone, Mail, Loader2, Check } from "lucide-react";
import { contactSettingsApi, ContactSettings } from "../../lib/api/contactSettingsApi";
import { toast } from "sonner";

const WhatsappIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    className={`fill-current ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.03a11.782 11.782 0 001.59 5.96L0 24l6.117-1.605a11.764 11.764 0 005.925 1.597h.005c6.632 0 12.028-5.391 12.03-12.024a11.815 11.815 0 00-3.502-8.318z"/>
  </svg>
);

const Field = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  hint,
  icon: Icon,
}: {
  label: string;
  name: keyof ContactSettings;
  value: string;
  onChange: (name: keyof ContactSettings, val: string) => void;
  placeholder?: string;
  hint?: string;
  icon?: any;
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none z-10 flex items-center justify-center">
          {React.isValidElement(Icon) ? Icon : <Icon size={16} />}
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-black/[0.03] border border-black/5 rounded-xl py-3 text-sm focus:outline-none focus:border-black/20 transition-all placeholder:opacity-30 font-medium ${Icon ? "pl-12 pr-4" : "px-4"}`}
      />
    </div>
    {hint && <p className="text-[10px] text-black/30">{hint}</p>}
  </div>
);

export default function ContactSettingsManager() {
  const [form, setForm] = useState<Partial<ContactSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    contactSettingsApi.getAdmin()
      .then((data) => {
        setForm(data);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load contact settings");
        setIsLoading(false);
      });
  }, []);

  const handleChange = (name: keyof ContactSettings, val: string) => {
    setForm((prev) => ({ ...prev, [name]: val }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await contactSettingsApi.update(form as ContactSettings);
      setForm(updated);
      setSaved(true);
      toast.success("Contact settings updated successfully!");
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast.error("Failed to save contact settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-black/10" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-space font-bold tracking-tighter">Contact Settings</h2>
        <p className="text-sm text-black/50 mt-1">Manage the contact information shown publicly on the "Contact Us" page.</p>
      </div>

      <div className="bg-white border border-black/5 rounded-[24px] p-6 space-y-6">
        <div className="space-y-5">
          <Field
            label="WhatsApp Number"
            name="whatsappNumber"
            value={form.whatsappNumber || ""}
            onChange={handleChange}
            placeholder="+39 327 827 8278"
            icon={<WhatsappIcon />}
            hint="The exact phone number used for the WhatsApp direct link (include country code)."
          />
          <Field
            label="Support Email"
            name="supportEmail"
            value={form.supportEmail || ""}
            onChange={handleChange}
            placeholder="support@smartcaf.tech"
            icon={Mail}
            hint="The public email address for general inquiries."
          />
          <Field
            label="Support Phone"
            name="supportPhone"
            value={form.supportPhone || ""}
            onChange={handleChange}
            placeholder="+39 327 827 8278"
            icon={Phone}
            hint="The standard phone number displayed on the contact page."
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-black/5 pt-6">
        <button
          onClick={handleSave}
          disabled={isSaving || saved}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            saved
              ? "bg-green-500 text-white"
              : "bg-black text-white hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
          }`}
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <Check size={16} />
          ) : (
            <Save size={16} />
          )}
          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
