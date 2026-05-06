"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Globe,
} from "lucide-react";
import { api } from "@/lib/api/axios";

interface ContactSettings {
  whatsappNumber: string;
  supportEmail: string;
  supportPhone: string;
}

interface Branch {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  workingHours?: string;
  googleMapsUrl?: string;
  isMain: boolean;
}

// Build the WhatsApp link from a phone number
function buildWhatsappLink(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const message = encodeURIComponent(
    "Hi, I was inquiring about Smart CAF services. Could you please assist me?"
  );
  return `https://wa.me/${cleaned}?text=${message}`;
}

function BranchCard({ branch, index }: { branch: Branch; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
      className="group relative bg-white border border-black/5 rounded-[28px] p-8 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300"
    >
      {branch.isMain && (
        <span className="inline-block mb-4 text-[10px] font-black uppercase tracking-[0.2em] bg-black text-white px-3 py-1 rounded-full">
          Main Office
        </span>
      )}
      <h3 className="text-xl font-space font-bold tracking-tight mb-5">
        {branch.name}
      </h3>

      <div className="space-y-3">
        <div className="flex items-start gap-3 text-sm text-black/60">
          <MapPin size={15} className="mt-0.5 shrink-0 text-black/30" />
          <span className="leading-relaxed">{branch.address}</span>
        </div>
        {branch.phone && (
          <div className="flex items-center gap-3 text-sm text-black/60">
            <Phone size={15} className="shrink-0 text-black/30" />
            <a href={`tel:${branch.phone}`} className="hover:text-black transition-colors">
              {branch.phone}
            </a>
          </div>
        )}
        {branch.email && (
          <div className="flex items-center gap-3 text-sm text-black/60">
            <Mail size={15} className="shrink-0 text-black/30" />
            <a href={`mailto:${branch.email}`} className="hover:text-black transition-colors">
              {branch.email}
            </a>
          </div>
        )}
        {branch.workingHours && (
          <div className="flex items-center gap-3 text-sm text-black/60">
            <Clock size={15} className="shrink-0 text-black/30" />
            <span>{branch.workingHours}</span>
          </div>
        )}
      </div>

      {branch.googleMapsUrl && (
        <a
          href={branch.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black/40 hover:text-black transition-colors"
        >
          <Globe size={12} />
          View on Maps
          <ExternalLink size={11} />
        </a>
      )}
    </motion.div>
  );
}

export default function ContactPage() {
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/contact-settings").then((r) => r.data.settings),
      api.get("/branches").then((r) => r.data.branches || r.data),
    ]).then(([contact, branchList]) => {
      setSettings(contact);
      setBranches(Array.isArray(branchList) ? branchList : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F8F6]">
      {/* Hero */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-5">
              Smart CAF — Contact Us
            </p>
            <h1 className="text-5xl md:text-7xl font-space font-bold tracking-tighter leading-[1] mb-6">
              We're here<br />
              <span className="text-black/25">to help you.</span>
            </h1>
            <p className="text-lg text-black/50 max-w-xl leading-relaxed font-light">
              Reach out to our team for any inquiries, guidance, or support with
              your fiscal and administrative services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Actions */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WhatsApp */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {loading || !settings ? (
                <div className="h-52 rounded-[28px] bg-black/5 animate-pulse" />
              ) : (
                <a
                  href={buildWhatsappLink(settings.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: '#25D366' }}
                  className="group flex flex-col justify-between h-full text-white rounded-[28px] p-8 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">
                      Fastest Response
                    </p>
                    <h2 className="text-2xl font-space font-bold tracking-tight mb-1">
                      Message on WhatsApp
                    </h2>
                    <p className="text-sm opacity-75 leading-relaxed">
                      Chat with us directly. We usually respond within minutes.
                    </p>
                    <div className="mt-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                      Open WhatsApp <ChevronRight size={13} />
                    </div>
                  </div>
                </a>
              )}
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {loading || !settings ? (
                <div className="h-52 rounded-[28px] bg-black/5 animate-pulse" />
              ) : (
                <a
                  href={`mailto:${settings.supportEmail}`}
                  className="group flex flex-col justify-between h-full bg-white border border-black/5 rounded-[28px] p-8 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center">
                    <Mail size={24} className="text-black" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">
                      Email Support
                    </p>
                    <h2 className="text-2xl font-space font-bold tracking-tight mb-1">
                      Send an Email
                    </h2>
                    <p className="text-sm text-black/50 leading-relaxed">
                      {settings.supportEmail}
                    </p>
                    <div className="mt-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-black/30 group-hover:text-black transition-colors">
                      Write to us <ChevronRight size={13} />
                    </div>
                  </div>
                </a>
              )}
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {loading || !settings ? (
                <div className="h-52 rounded-[28px] bg-black/5 animate-pulse" />
              ) : (
                <a
                  href={`tel:${settings.supportPhone}`}
                  className="group flex flex-col justify-between h-full bg-white border border-black/5 rounded-[28px] p-8 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center">
                    <Phone size={24} className="text-black" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">
                      Phone Support
                    </p>
                    <h2 className="text-2xl font-space font-bold tracking-tight mb-1">
                      Call Us
                    </h2>
                    <p className="text-sm text-black/50 leading-relaxed">
                      {settings.supportPhone}
                    </p>
                    <div className="mt-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-black/30 group-hover:text-black transition-colors">
                      Call now <ChevronRight size={13} />
                    </div>
                  </div>
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-3">
              Our Locations
            </p>
            <h2 className="text-4xl font-space font-bold tracking-tighter">
              Find a branch near you.
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-56 rounded-[28px] bg-black/5 animate-pulse" />
              ))}
            </div>
          ) : branches.length === 0 ? (
            <div className="py-20 text-center text-black/25 font-bold uppercase tracking-widest text-[10px]">
              No branch locations configured yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {branches.map((branch, index) => (
                <BranchCard key={branch._id} branch={branch} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
