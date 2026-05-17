"use client";

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Receipt, Share2 } from 'lucide-react';
import { generateSingleVariantInvoicePDF, getWhatsAppShareUrl } from '@/lib/invoice';

interface InvoiceSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: any;
}

export default function InvoiceSuccessModal({
  isOpen,
  onClose,
  invoiceData
}: InvoiceSuccessModalProps) {
  if (!isOpen || !invoiceData) return null;

  const handleDownloadPDF = () => {
    generateSingleVariantInvoicePDF(invoiceData);
  };

  const handleShareWhatsApp = () => {
    const url = getWhatsAppShareUrl(invoiceData);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Backdrop Click to Close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-white max-w-sm w-full shadow-2xl relative text-left border border-gray-100 flex flex-col p-6 rounded-2xl overflow-hidden z-10"
      >
        {/* Visual Success Icon */}
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 shadow-inner">
          <CheckCircle2 size={24} className="stroke-[2.5]" />
        </div>

        <h3 className="text-base font-sans font-semibold text-neutral-900 text-center tracking-tight">Sale Recorded!</h3>
        <p className="text-[11px] text-gray-500 text-center mt-1 font-light leading-relaxed">
          Inventory has been adjusted. Print or share a digital receipt.
        </p>

        {/* Receipt Mock Paper Preview */}
        <div className="my-5 p-4 bg-[#f8f8f9] rounded-2xl border border-gray-150 font-mono text-[10px] text-neutral-800 space-y-3 relative overflow-hidden shadow-xs">
          
          {/* Receipt Header */}
          <div className="text-center border-b border-dashed border-gray-200 pb-2.5">
            <p className="font-bold text-xs uppercase tracking-widest text-neutral-900">{invoiceData.shopName}</p>
            <p className="text-[8px] text-gray-400 font-sans mt-0.5 uppercase tracking-wider">Smartphone Merchant Terminal</p>
          </div>

          {/* Info Block */}
          <div className="space-y-0.5 text-neutral-600">
            <p className="flex justify-between">
              <span>Invoice No:</span>
              <strong className="text-neutral-900 font-bold">{invoiceData.invoiceNumber}</strong>
            </p>
            <p className="flex justify-between">
              <span>Date:</span>
              <span className="text-neutral-800">{invoiceData.date}</span>
            </p>
            <p className="flex justify-between">
              <span>Customer:</span>
              <span className="text-neutral-800 truncate max-w-[150px]">{invoiceData.buyerName}</span>
            </p>
          </div>

          {/* Items block */}
          <div className="border-t border-b border-dashed border-gray-200 py-2">
            <div className="flex justify-between font-bold text-neutral-900 mb-1 text-[9px] uppercase tracking-wider">
              <span>Item / Description</span>
              <span>Qty / Total</span>
            </div>
            <div className="flex justify-between leading-snug">
              <div className="truncate pr-3 max-w-[180px]">
                <p className="font-bold text-neutral-950 text-[10px] truncate">{invoiceData.brandName} {invoiceData.productName}</p>
                <p className="text-[8px] text-gray-400 italic">{invoiceData.variantColor} • {invoiceData.variantSpecs}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-neutral-950 font-bold">{invoiceData.qty} x Tk {invoiceData.price.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-baseline font-bold text-xs text-neutral-950 pt-1">
            <span>GRAND TOTAL:</span>
            <span className="text-sm text-neutral-900 font-bold">Tk {invoiceData.total.toLocaleString()}</span>
          </div>

          {/* Footer Message */}
          <div className="text-center text-[8px] text-gray-400 pt-2 border-t border-dashed border-gray-200 italic">
            Thank you for shopping with us!
          </div>
        </div>

        {/* Actions Grid */}
        <div className="space-y-2">
          <button
            onClick={handleDownloadPDF}
            className="w-full py-3 bg-black hover:bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Receipt size={13} />
            <span>Download PDF Receipt</span>
          </button>
          
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-[#25D366]/10"
          >
            <Share2 size={13} />
            <span>Share via WhatsApp</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-[10px] font-bold uppercase tracking-wider transition-all rounded-xl cursor-pointer"
          >
            Done / Close
          </button>
        </div>

      </motion.div>
    </div>
  );
}
