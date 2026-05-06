"use client";

import React, { useEffect, useState } from "react";
import { Save, Phone, Mail, MessageCircle, Loader2, Check } from "lucide-react";
import { contactSettingsApi, ContactSettings } from "../../lib/api/contactSettingsApi";
import { toast } from "sonner";

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
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text/50">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30">
          <Icon size={16} />
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-bg border border-border rounded-xl py-3 text-sm focus:outline-none focus:border-text/30 transition-all placeholder:opacity-30 font-medium ${Icon ? "pl-11 pr-4" : "px-4"}`}
      />
    </div>
    {hint && <p className="text-[10px] text-text/40">{hint}</p>}
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
        <Loader2 size={24} className="animate-spin text-text/30" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-space font-bold tracking-tighter">Contact Settings</h2>
        <p className="text-sm text-text/50 mt-1">Manage the contact information shown publicly on the "Contact Us" page.</p>
      </div>

      <div className="bg-surface border border-border rounded-[24px] p-6 space-y-6">
        <div className="space-y-5">
          <Field
            label="WhatsApp Number"
            name="whatsappNumber"
            value={form.whatsappNumber || ""}
            onChange={handleChange}
            placeholder="+39 327 827 8278"
            icon={MessageCircle}
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

      <div className="flex justify-end border-t border-border pt-6">
        <button
          onClick={handleSave}
          disabled={isSaving || saved}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            saved
              ? "bg-green-500 text-white"
              : "bg-black text-white hover:scale-105 active:scale-95"
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
