"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus } from 'lucide-react';
import { Product } from '@/types/zenvy';
import confetti from 'canvas-confetti';

interface MarkSoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  setProductList: React.Dispatch<React.SetStateAction<Product[]>>;
  setRecentActivities: React.Dispatch<React.SetStateAction<any[]>>;
  storeName: string;
  onSaleRecorded: (invoice: any) => void;
}

export default function MarkSoldModal({
  isOpen,
  onClose,
  product,
  setProductList,
  setRecentActivities,
  storeName,
  onSaleRecorded
}: MarkSoldModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [soldQty, setSoldQty] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>('');

  // Automatically select first in-stock variant when product changes
  useEffect(() => {
    if (product) {
      const firstInStock = product.variants?.find(v => v.quantity > 0) || product.variants?.[0] || null;
      setSelectedVariant(firstInStock);
      setSoldQty(1);
      setBuyerName('');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleConfirmSale = () => {
    if (!selectedVariant) return;

    const qtyToDeduct = soldQty;
    const pId = product.id;
    const vId = selectedVariant.id;
    const customer = buyerName.trim() || 'Walk-in Customer';

    // 1. Mutate state productList: decrement variant quantity
    setProductList(prevList => prevList.map(p => {
      if (p.id === pId) {
        const updatedVariants = p.variants?.map(v => 
          v.id === vId ? { ...v, quantity: Math.max(0, v.quantity - qtyToDeduct) } : v
        ) || [];
        const newTotalStock = updatedVariants.reduce((sum, v) => sum + v.quantity, 0);
        
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const logText = `Sold ${qtyToDeduct} unit${qtyToDeduct > 1 ? 's' : ''} to ${customer} — ${selectedVariant.color} ${selectedVariant.ram}/${selectedVariant.storage} — ${dateStr}`;

        return {
          ...p,
          variants: updatedVariants,
          stock: newTotalStock,
          history: [
            { text: logText, type: 'sell' },
            ...(p.history || [])
          ]
        };
      }
      return p;
    }));

    // 2. Add dynamic entry to dashboard bottom activity feed
    const activityText = `Marked sold`;
    const productDetail = `${product.brand} ${product.name} ${selectedVariant.color} ${selectedVariant.ram}/${selectedVariant.storage} (Qty: ${qtyToDeduct})`;
    setRecentActivities(prev => [
      { 
        type: 'sold', 
        text: activityText, 
        product: productDetail, 
        time: 'Just now' 
      },
      ...prev
    ].slice(0, 10));

    // 3. Compile invoice sale data for receipt modal callback
    const finalInvoice = {
      shopName: storeName || 'Zenvy Store',
      invoiceNumber: `ZN-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      buyerName: customer,
      productName: product.name,
      brandName: product.brand || 'Generic',
      variantColor: selectedVariant.color,
      variantSpecs: `${selectedVariant.ram}/${selectedVariant.storage}`,
      price: selectedVariant.sellingPrice,
      qty: qtyToDeduct,
      total: selectedVariant.sellingPrice * qtyToDeduct
    };

    // 4. Trigger confetti explosion for wow moment!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    // 5. Fire parent callbacks
    onSaleRecorded(finalInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Backdrop Click to Close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-white max-w-md w-full shadow-2xl relative text-left border border-gray-100 flex flex-col p-6 overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
          <h3 className="text-base font-sans font-medium text-[#1a1c1d] tracking-tight">Record Smartphone Sale</h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-neutral-900 transition-colors cursor-pointer p-1 hover:bg-neutral-50 rounded-full animate-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Specs Showcase */}
        <div className="flex gap-3 bg-[#f6f6f7] border border-gray-100 p-3 mb-5 rounded-xl">
          <div className="w-12 h-12 bg-white border border-gray-150 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <h4 className="text-xs font-bold text-neutral-900 leading-snug">{product.name}</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{product.brand}</p>
          </div>
        </div>

        {/* Select Variant */}
        <div className="space-y-2 mb-5">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Select Sold Variant</label>
          <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
            {product.variants?.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              const isOutOfStock = v.quantity === 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => {
                    setSelectedVariant(v);
                    setSoldQty(1); // reset qty limits
                  }}
                  className={`p-3 text-left border transition-all flex flex-col justify-between relative cursor-pointer h-[66px]
                    ${isOutOfStock 
                      ? 'opacity-30 bg-[#f6f6f7] border-gray-100 cursor-not-allowed line-through' 
                      : isSelected 
                        ? 'border-black bg-black text-white shadow-sm' 
                        : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-xs'}`}
                >
                  <span className="text-xs font-bold truncate block w-full">{v.color}</span>
                  <span className={`text-[10px] font-semibold mt-0.5 block ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                    {v.ram}/{v.storage} • {isOutOfStock ? '0 Stock' : `${v.quantity} Stock`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity and Buyer Fields */}
        {selectedVariant && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Stepper */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Quantity</label>
              <div className="flex items-center border border-gray-200 h-[42px] rounded-xl bg-white">
                <button
                  type="button"
                  onClick={() => setSoldQty(q => Math.max(1, q - 1))}
                  className="w-10 h-full flex items-center justify-center hover:bg-neutral-50 text-neutral-800 transition-colors cursor-pointer"
                >
                  <Minus size={12} strokeWidth={2.5} />
                </button>
                <span className="flex-1 text-center font-bold text-xs text-neutral-950">{soldQty}</span>
                <button
                  type="button"
                  onClick={() => setSoldQty(q => Math.min(selectedVariant.quantity, q + 1))}
                  className="w-10 h-full flex items-center justify-center hover:bg-neutral-50 text-neutral-800 transition-colors cursor-pointer"
                >
                  <Plus size={12} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Buyer Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Buyer (Optional)</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full border border-gray-200 px-3.5 h-[42px] text-xs font-semibold focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5 rounded-xl transition-all"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3.5 border-t border-gray-100 pt-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedVariant || selectedVariant.quantity === 0}
            onClick={handleConfirmSale}
            className={`flex-1 py-3 text-xs text-white font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm text-center
              ${(!selectedVariant || selectedVariant.quantity === 0)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-black hover:bg-neutral-900'}`}
          >
            Confirm Sale
          </button>
        </div>

      </motion.div>
    </div>
  );
}
