"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
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
    <div className="min-h-screen mt-6 bg-[#F8F8F6]">
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
      <section className="px-6 pb-16 mb-16">
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
                  <div className="w-12 h-12 mb-3 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-7 h-7 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.03a11.782 11.782 0 001.59 5.96L0 24l6.117-1.605a11.764 11.764 0 005.925 1.597h.005c6.632 0 12.028-5.391 12.03-12.024a11.815 11.815 0 00-3.502-8.318z"/>
                    </svg>
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
