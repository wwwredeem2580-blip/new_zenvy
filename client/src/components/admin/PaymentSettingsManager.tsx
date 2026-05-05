"use client";

import React, { useEffect, useState } from "react";
import { Save, CreditCard, Smartphone, QrCode, Loader2, Check } from "lucide-react";
import { paymentSettingsApi, PaymentSettings } from "../../lib/api/paymentSettingsApi";
import { toast } from "sonner";

const Field = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  hint,
  monospace,
}: {
  label: string;
  name: keyof PaymentSettings;
  value: string;
  onChange: (name: keyof PaymentSettings, val: string) => void;
  placeholder?: string;
  hint?: string;
  monospace?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text/50">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text/30 transition-all placeholder:opacity-30 ${monospace ? "font-mono" : "font-medium"}`}
    />
    {hint && <p className="text-[10px] text-text/40">{hint}</p>}
  </div>
);

const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: keyof PaymentSettings;
  value: string;
  onChange: (name: keyof PaymentSettings, val: string) => void;
  placeholder?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text/50">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-text/30 transition-all placeholder:opacity-30 resize-none"
    />
  </div>
);

export default function PaymentSettingsManager() {
  const [form, setForm] = useState<PaymentSettings>({
    revolutTag: "",
    revolutQrUrl: "",
    iban: "",
    ibanRecipientName: "",
    cashNote: "",
    postpayNote: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    paymentSettingsApi.getAdmin()
      .then((s) => setForm({
        revolutTag: s.revolutTag || "",
        revolutQrUrl: s.revolutQrUrl || "",
        iban: s.iban || "",
        ibanRecipientName: s.ibanRecipientName || "",
        cashNote: s.cashNote || "",
        postpayNote: s.postpayNote || "",
      }))
      .catch(() => toast.error("Failed to load payment settings"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (name: keyof PaymentSettings, val: string) => {
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await paymentSettingsApi.update(form);
      setSaved(true);
      toast.success("Payment settings saved");
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast.error("Failed to save payment settings");
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
        <h2 className="text-2xl font-space font-bold tracking-tighter">Payment Settings</h2>
        <p className="text-sm text-text/50 mt-1">Configure the payment details shown to clients during application submission.</p>
      </div>

      {/* Revolut */}
      <div className="bg-surface border border-border rounded-[24px] p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Smartphone size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Revolut</h3>
            <p className="text-[10px] text-text/40 uppercase tracking-widest font-bold">Instant transfer</p>
          </div>
        </div>
        <Field
          label="RevTag"
          name="revolutTag"
          value={form.revolutTag || ""}
          onChange={handleChange}
          placeholder="@yourrevolutname"
          hint="The @tag clients should send money to."
        />
        <Field
          label="QR Code Image URL"
          name="revolutQrUrl"
          value={form.revolutQrUrl || ""}
          onChange={handleChange}
          placeholder="https://..."
          hint="Optional — link to your Revolut QR code image. Leave empty to show a placeholder icon."
        />
      </div>

      {/* Card / IBAN */}
      <div className="bg-surface border border-border rounded-[24px] p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <CreditCard size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Direct Card / Bank Transfer</h3>
            <p className="text-[10px] text-text/40 uppercase tracking-widest font-bold">IBAN details</p>
          </div>
        </div>
        <Field
          label="IBAN"
          name="iban"
          value={form.iban || ""}
          onChange={handleChange}
          placeholder="IT60 X 05034 01234 0000 1234"
          monospace
        />
        <Field
          label="Recipient Name"
          name="ibanRecipientName"
          value={form.ibanRecipientName || ""}
          onChange={handleChange}
          placeholder="Smart CAF Solutions S.r.l."
        />
      </div>

      {/* Notes */}
      <div className="bg-surface border border-border rounded-[24px] p-6 space-y-5">
        <div>
          <h3 className="font-bold text-sm">Instruction Notes</h3>
          <p className="text-[10px] text-text/40 uppercase tracking-widest font-bold mt-0.5">Shown to clients on Cash and PostPay steps</p>
        </div>
        <TextAreaField
          label="Cash Note"
          name="cashNote"
          value={form.cashNote || ""}
          onChange={handleChange}
          placeholder="An agent will call you at your provided number shortly..."
        />
        <TextAreaField
          label="PostPay Note"
          name="postpayNote"
          value={form.postpayNote || ""}
          onChange={handleChange}
          placeholder="Your application will be locked until payment is confirmed..."
        />
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 bg-text text-bg px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-text/10"
      >
        {isSaving ? (
          <Loader2 size={14} className="animate-spin" />
        ) : saved ? (
          <Check size={14} />
        ) : (
          <Save size={14} />
        )}
        {isSaving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}
