"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Edit2, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  History, 
  AlertTriangle,
  Phone,
  Globe
} from 'lucide-react';
import { Product, ProductVariant } from '@/types/zenvy';

const getColorHex = (colorName: string): string => {
  const name = colorName.toLowerCase();
  if (name.includes('black') || name.includes('dark')) return '#1a1c1d';
  if (name.includes('white') || name.includes('milk')) return '#ffffff';
  if (name.includes('blue') || name.includes('ocean')) return '#3b82f6';
  if (name.includes('green') || name.includes('emerald')) return '#22c55e';
  if (name.includes('gold') || name.includes('sunset')) return '#eab308';
  if (name.includes('gray') || name.includes('grey') || name.includes('silver') || name.includes('titanium')) return '#cbd5e1';
  if (name.includes('purple') || name.includes('lavender')) return '#a855f7';
  if (name.includes('red')) return '#ef4444';
  if (name.includes('orange')) return '#f97316';
  if (name.includes('pink')) return '#ec4899';
  return '#737373';
};

interface ProductDetailsScreenProps {
  product: Product;
  onBack: () => void;
  onEdit: (product: Product) => void;
  onUpdateStock: (
    productId: number | string, 
    variantId: string, 
    newQty: number, 
    historyLogText: string, 
    logType: 'add' | 'sell'
  ) => void;
  onDeleteProduct: (productId: number | string) => void;
}

export default function ProductDetailsScreen({
  product,
  onBack,
  onEdit,
  onUpdateStock,
  onDeleteProduct
}: ProductDetailsScreenProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedVariantImage, setSelectedVariantImage] = useState<string | null>(null);

  // Extract unique colors available
  const uniqueColors = Array.from(new Set(product.variants?.map(v => v.color) || []));
  const [activeColor, setActiveColor] = useState<string>(uniqueColors[0] || '');

  // Select active variant based on clicked color swatch
  const activeVariant = product.variants?.find(v => v.color === activeColor) || product.variants?.[0];

  // Determine active displayed image (either customized variant selection, active color image, or main image)
  const displayImage = selectedVariantImage || activeVariant?.image || product.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format';

  // Check if product has sales history
  const hasSalesHistory = product.variants?.some(v => v.quantity > 0) || false;

  // Calculate pricing ranges
  const prices = product.variants?.map(v => v.sellingPrice) || [];
  const buyingPrices = product.variants?.map(v => v.buyingPrice) || [];
  
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const minBuying = buyingPrices.length ? Math.min(...buyingPrices) : 0;

  const handleStockAdjust = (variant: ProductVariant, amount: number) => {
    const newQty = Math.max(0, variant.quantity + amount);
    if (newQty === variant.quantity) return; // No change

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const logText = amount > 0 
      ? `Added ${amount} unit${amount > 1 ? 's' : ''} — ${variant.color} ${variant.ram}/${variant.storage}`
      : `Sold ${Math.abs(amount)} unit${Math.abs(amount) > 1 ? 's' : ''} — ${variant.color} ${variant.ram}/${variant.storage}`;
    const logType = amount > 0 ? 'add' : 'sell';

    onUpdateStock(product.id, variant.id, newQty, `${logText} — ${dateStr}`, logType);
  };

  return (
    <div className="flex-1 bg-[#f1f2f4] overflow-y-auto relative h-full flex flex-col font-sans">
      {/* Header Sticky Bar */}
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-[60] border-b border-gray-300">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-600 hover:text-neutral-900 flex items-center gap-1.5 transition-colors text-xs font-semibold">
            <ArrowLeft size={16} />
            <span>Back to Inventory</span>
          </button>
        </div>

        {/* Edit & Delete Action Panel */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => onEdit(product)}
            className="flex items-center gap-1.5 bg-white border border-gray-300 text-neutral-800 px-4 py-2 hover:bg-gray-50 transition-all font-semibold text-xs rounded-sm"
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
          <button 
            onClick={() => setConfirmDeleteOpen(true)}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 px-4 py-2 transition-all font-semibold text-xs rounded-sm"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </header>

      {/* Main Details Body */}
      <div className="flex-1 flex justify-center md:p-8">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 pb-20">
          
          {/* ================= LEFT COLUMN: Faire-Style Product Showcase ================= */}
          <div className="w-full lg:w-[46%]">
            <div className="bg-white p-6 md:p-8 flex flex-col shadow-xs">
              
              {/* Faire Logo Header */}
              <div className="w-full text-center pb-5 mb-5 border-b border-gray-150">
                <span className="text-[18px] font-sans font-light uppercase tracking-[0.4em] text-neutral-900">Z E N V Y</span>
              </div>

              {/* Large Showcase Image */}
              <div className="aspect-[4/3] w-full bg-neutral-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                <img 
                  src={displayImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>

              {/* Showcase Meta Bar */}
              <div className="flex items-center justify-center gap-4 py-3.5 border-y border-gray-150 text-[10px] text-gray-600 font-medium mt-5">
                <span className="uppercase tracking-wider font-bold text-neutral-700">Phone</span>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1">
                  <Phone size={10} className="text-gray-600" />
                  <span>01712 345678</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1">
                  <Globe size={10} className="text-gray-600" />
                  <span>zenvy.com.bd</span>
                </div>
              </div>

              {/* Product Model Name */}
              <h1 className="text-[22px] font-sans font-medium text-neutral-950 mt-5 leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Wholesale & Retail MSRP Prices */}
              <div className="flex items-baseline mt-3">
                <span className="text-2xl font-medium text-neutral-950">
                  ৳{activeVariant ? activeVariant.buyingPrice.toLocaleString() : minBuying.toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-600 font-medium ml-3.5 tracking-wide">
                  MSRP ৳{activeVariant ? activeVariant.sellingPrice.toLocaleString() : minPrice.toLocaleString()}
                </span>
              </div>

              {/* Color Swatch Selectors */}
              {uniqueColors.length > 0 && (
                <div className="mt-7">
                  <h4 className="text-[11px] font-medium text-gray-600 uppercase tracking-widest">
                    Color: <span className='font-bold tracking-tight text-neutral-950 text-sm'>{activeColor}</span>
                  </h4>
                  <div className="flex flex-wrap gap-2.5 mt-2.5">
                    {uniqueColors.map((color) => {
                      const isActive = color === activeColor;
                      return (
                        <button
                          key={color}
                          onClick={() => {
                            setActiveColor(color);
                            setSelectedVariantImage(null);
                          }}
                          className={`border px-5 py-3 text-center cursor-pointer transition-all font-bold text-[11px] uppercase tracking-wider rounded-none min-w-[95px] shadow-xs
                            ${isActive 
                              ? 'border-neutral-950 bg-neutral-950 text-white ring-1 ring-neutral-950' 
                              : 'border-gray-300 bg-white text-neutral-800 hover:border-gray-500'}`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom Image Galleries Under Swatch */}
              {product.variants && product.variants.some(v => v.image && v.color === activeColor) && (
                <div className="flex gap-2.5 mt-5 justify-start overflow-x-auto pb-1">
                  <button 
                    onClick={() => setSelectedVariantImage(null)}
                    className={`w-10 h-10 border transition-all flex-shrink-0 ${
                      !selectedVariantImage ? 'border-neutral-950 ring-1 ring-neutral-950' : 'border-gray-200 hover:border-gray-450'
                    }`}
                  >
                    <img src={product.image} className="w-full h-full object-cover" alt="Main" />
                  </button>
                  {product.variants.filter(v => v.image && v.color === activeColor).map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantImage(v.image || null)}
                      className={`w-10 h-10 border overflow-hidden transition-all flex-shrink-0 ${
                        selectedVariantImage === v.image ? 'border-neutral-950 ring-1 ring-neutral-950' : 'border-gray-200 hover:border-gray-450'
                      }`}
                    >
                      <img src={v.image} className="w-full h-full object-cover" alt={v.color} />
                    </button>
                  ))}
                </div>
              )}

              {/* Specifications Card */}
              <div className="border-t border-gray-150 pt-5 mt-6">
                <h4 className="text-[12px] font-medium text-gray-600 uppercase tracking-widest mb-1.5">Note / Specifications</h4>
                <p className="text-sm text-neutral-700 leading-relaxed font-light whitespace-pre-line">
                  {product.description || "No specifications or description provided for this phone model. Click Edit to add details."}
                </p>
              </div>

            </div>
          </div>

          {/* ================= RIGHT COLUMN: Variants Cards & Stock History ================= */}
          <div className="flex-1 space-y-6">
            
            {/* Variants Inventory Cards Container */}
            <div className="space-y-4">
              <div className="flex p-4 items-center justify-between border-b-1 border-gray-300 pb-3 mb-2 flex-shrink-0">
                <h3 className="text-[14px] font-medium text-neutral-900 tracking-wider">Manage Variants</h3>
                <span className="text-[10px] font-semibold text-gray-400">৳ Bangladesh Taka</span>
              </div>

              <div className="flex flex-col gap-3.5">
                {product.variants && product.variants.map((v) => {
                  const isOutOfStock = v.quantity === 0;
                  const isLowStock = !isOutOfStock && v.quantity <= (product.lowStockThreshold || 2);
                  const isSelected = v.color === activeColor;

                  let cardBorder = isSelected ? "border-gray-300 hover:border-gray-400" : "border-gray-300 hover:border-gray-400";
                  
                  return (
                    <div 
                      key={v.id} 
                      onClick={() => {
                        setActiveColor(v.color);
                        setSelectedVariantImage(null);
                      }}
                      className={`bg-white p-4 flex gap-4 items-start relative transition-all group cursor-pointer ${cardBorder}`}
                    >
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 border border-gray-300 overflow-hidden flex-shrink-0 bg-neutral-50 shadow-xs">
                        <img src={v.image || product.image} alt={v.color} className="w-full h-full object-cover" />
                      </div>

                      {/* Details Column */}
                      <div className="flex-1 min-w-0">
                        {/* Variant Color Title */}
                        <div className="flex flex-col">
                          <span className="text-[15px] font-medium text-neutral-900 leading-snug">
                            {v.color}
                          </span>
                          <span className="text-[11px] text-neutral-600 font-medium uppercase tracking-wider mt-0.5">
                            {v.ram} RAM / {v.storage} ROM
                          </span>
                        </div>

                        {/* Inventory stock status badge */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          <span className={`text-[12px] font-normal px-2.5 py-1 flex items-center gap-1.5 border transition-all ${
                            isOutOfStock ? 'bg-neutral-50 text-neutral-400 border-neutral-200' :
                            isLowStock ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            <span>Stock Status</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                              isOutOfStock ? 'bg-neutral-100 text-neutral-400 line-through' :
                              isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {v.quantity}
                            </span>
                          </span>
                        </div>

                        {/* Pricing details and Adjustment actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3.5 border-t border-gray-150">
                          <div className="text-[12px] flex flex-col text-gray-600 font-medium space-y-2">
                            <span>Buying Price: <strong className="text-neutral-800 text-[14px]">৳{v.buyingPrice.toLocaleString()}</strong></span>
                            <span>Selling Price: <strong className="text-neutral-900 text-[14px]">৳{v.sellingPrice.toLocaleString()}</strong></span>
                          </div>

                          {/* Incremental adjustment triggers */}
                          <div className="flex gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleStockAdjust(v, 1)}
                              className="flex-1 sm:flex-none py-1.5 px-3.5 border border-gray-300 hover:border-green-500 hover:bg-green-50/60 text-green-700 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all rounded-xs"
                              title="Restock +1"
                            >
                              <Plus size={10} strokeWidth={2.5} />
                              <span>Add</span>
                            </button>
                            <button
                              onClick={() => handleStockAdjust(v, -1)}
                              disabled={isOutOfStock}
                              className={`flex-1 sm:flex-none py-1.5 px-3.5 border border-gray-300 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all rounded-sm shadow-xs
                                ${isOutOfStock 
                                  ? 'opacity-30 cursor-not-allowed border-gray-200 text-gray-350 line-through' 
                                  : 'hover:border-red-500 hover:bg-red-50/60 text-red-650'}`}
                              title="Mark 1 Sold"
                            >
                              <Minus size={10} strokeWidth={2.5} />
                              <span>Sold</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Timeline Stock History Card */}
            <div className="bg-white border border-gray-300 p-6 flex flex-col max-h-[460px] shadow-xs">
              <div className="flex items-center gap-2.5 border-b border-gray-250 pb-3 mb-4 flex-shrink-0">
                <History size={16} className="text-gray-500" />
                <h3 className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider">STOCK TRANSACTION HISTORY</h3>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 select-none space-y-4 max-h-[350px]">
                {product.history && product.history.length > 0 ? (
                  <div className="relative border-l border-gray-300 ml-3.5 pl-5 py-1 space-y-5">
                    {product.history.map((log: any, idx: number) => {
                      const isSell = log.type === 'sell';
                      return (
                        <div key={idx} className="relative group">
                          {/* Timeline node marker */}
                          <div className={`absolute -left-[26px] top-0.5 w-3 h-3 rounded-full border-2 bg-white transition-all group-hover:scale-110 ${
                            isSell ? 'border-blue-500 bg-blue-50' : 'border-green-500 bg-green-50'
                          }`} />
                          
                          <div className="text-xs">
                            <p className="font-semibold text-neutral-900">{log.text.split(' — ')[0]}</p>
                            <div className="flex items-center gap-1.5 text-gray-500 mt-1 font-medium text-[10px]">
                              <span>{log.text.split(' — ')[1] || 'Today'}</span>
                              <span>•</span>
                              <span className={`uppercase font-bold tracking-widest text-[9px] ${isSell ? 'text-blue-600' : 'text-green-600'}`}>
                                {isSell ? 'Sold Out' : 'Restock'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                    <History size={32} className="text-gray-300 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-semibold">No stock actions recorded yet</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Quick adjust stock in the variant list to build logs.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ================= CONFIRM DELETE MODAL ================= */}
      <AnimatePresence>
        {confirmDeleteOpen && (
          <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-md w-full border border-gray-300 shadow-2xl p-6 relative text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">Delete smartphone model</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed font-light">
                    Are you absolutely sure you want to delete <strong className="text-neutral-900 font-semibold">{product.name}</strong> from your inventory? This action is irreversible.
                  </p>
                  
                  {hasSalesHistory && (
                    <div className="bg-amber-50 border border-amber-200 p-3 mt-2 flex gap-2">
                      <AlertTriangle size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-800 font-semibold leading-relaxed">
                        WARNING: This product has transactions and sales history. Deleting it will purge all historical activity logs from your reports.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-150">
                <button
                  onClick={() => setConfirmDeleteOpen(false)}
                  className="px-4 py-2 border border-gray-350 hover:bg-gray-50 text-neutral-850 font-bold text-xs rounded-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteProduct(product.id);
                    setConfirmDeleteOpen(false);
                    onBack();
                  }}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-sm transition-all shadow-md shadow-red-200"
                >
                  Permanently Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
