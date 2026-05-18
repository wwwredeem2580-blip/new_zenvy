"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ProductVariant } from '@/types/zenvy';
import { AlertTriangle, ChevronRight, Edit2, Share2, Trash2, ArrowUpRight, ArrowDownLeft, ChevronDown, ChevronUp } from 'lucide-react';

const getColorHex = (colorName: string): string => {
  const name = colorName.toLowerCase();
  if (name.includes('black') || name.includes('dark')) return '#1F1F1F';
  if (name.includes('white') || name.includes('milk')) return '#ffffff';
  if (name.includes('blue') || name.includes('ocean') || name.includes('ice')) return '#E1F0FF';
  if (name.includes('green') || name.includes('emerald')) return '#22c55e';
  if (name.includes('gold') || name.includes('sunset')) return '#eab308';
  if (name.includes('gray') || name.includes('grey') || name.includes('silver') || name.includes('titanium')) return '#cbd5e1';
  if (name.includes('purple') || name.includes('lavender')) return '#a855f7';
  if (name.includes('red')) return '#ef4444';
  if (name.includes('orange')) return '#f97316';
  if (name.includes('pink')) return '#ec4899';
  return '#737373';
};

const formatPriceK = (price: number) => {
  if (!price) return '৳0';
  return `৳${(price / 1000).toFixed(1).replace('.0', '')}k`;
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
  autoScrollToVariants?: boolean;
}

export default function ProductDetailsScreen({
  product,
  onBack,
  onEdit,
  onUpdateStock,
  onDeleteProduct,
  autoScrollToVariants = false
}: ProductDetailsScreenProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const variantsRef = React.useRef<HTMLDivElement>(null);

  // Extract unique colors available
  const uniqueColors = Array.from(new Set(product.variants?.map(v => v.color) || []));
  const [activeColor, setActiveColor] = useState<string>(uniqueColors[0] || '');

  // Select active variant based on clicked color swatch
  const activeVariant = product.variants?.find(v => v.color === activeColor) || product.variants?.[0];

  React.useEffect(() => {
    if (autoScrollToVariants && variantsRef.current) {
      const timer = setTimeout(() => {
        variantsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350); // delay slightly to allow container transition to complete
      return () => clearTimeout(timer);
    }
  }, [autoScrollToVariants]);

  const handleStockAdjust = (variant: ProductVariant, amount: number) => {
    const newQty = Math.max(0, variant.quantity + amount);
    if (newQty === variant.quantity) return;

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const logText = amount > 0 
      ? `Added ${amount} unit${amount > 1 ? 's' : ''} — ${variant.color} ${variant.ram}/${variant.storage}`
      : `Sold ${Math.abs(amount)} unit${Math.abs(amount) > 1 ? 's' : ''} — ${variant.color} ${variant.ram}/${variant.storage}`;
    const logType = amount > 0 ? 'add' : 'sell';

    onUpdateStock(product.id, variant.id, newQty, `${logText} — ${dateStr}`, logType);
  };

  // Pricing
  const prices = product.variants?.map(v => v.sellingPrice) || [];
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  
  const hasSalesHistory = product.variants?.some(v => v.quantity > 0) || false;

  return (
    <div className="flex-1 bg-[#fbf9f9] overflow-y-auto relative h-full flex flex-col font-sans text-[#1b1c1c]">
      {/* Main Content Area mapping to the HTML <main> */}
      <div className="pt-8 pb-20 md:pb-8 min-h-screen px-4 md:px-[48px]">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Breadcrumb & Navigation */}
          <nav className="flex items-center space-x-2 text-[12px] leading-[1.4] font-normal text-[#5e5e5d] font-sans">
            <button onClick={onBack} className="hover:text-[#020302] transition-colors cursor-pointer bg-transparent border-none p-0 text-[12px] font-bold uppercase tracking-wider">
              Inventory
            </button>
            <ChevronRight size={14} />
            <span className="text-[#020302] font-bold uppercase tracking-wider">{product.name}</span>
          </nav>

          {/* TOP SECTION: Product Image + Premium Header Info */}
          <div className="bg-white border border-[#efeded] p-6 rounded-xl flex flex-col md:flex-row gap-8 items-center md:items-start shadow-2xs">
            {/* Elegant Square Product Frame */}
            <div className="w-32 h-32 md:w-36 md:h-36 bg-[#f5f3f3] flex items-center justify-center overflow-hidden border border-[#efeded] flex-shrink-0 rounded-lg">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
              />
            </div>

            {/* Header Core Details */}
            <div className="flex-1 flex flex-col justify-between w-full min-w-0 h-full text-center md:text-left space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-neutral-400 font-sans block">
                  {product.brand || 'Smartphone'}
                </span>
                <h1 className="font-extrabold text-2xl md:text-3xl text-[#020302] font-sans tracking-tight leading-tight">
                  {product.name}
                </h1>
                
                {/* Total quantities & condensed price stats */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-[12px] font-bold font-sans">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] 
                    ${product.stock === 0 
                      ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                      : product.stock <= (product.lowStockThreshold || 4)
                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}
                  >
                    {product.stock === 0 ? 'Out of stock' : `${product.stock} units left`}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-full text-[11px]">
                    {minPrice === maxPrice ? formatPriceK(minPrice) : `${formatPriceK(minPrice)} – ${formatPriceK(maxPrice)}`}
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
                <button 
                  onClick={() => onEdit(product)}
                  className="bg-[#020302] hover:bg-neutral-800 text-white text-[11px] font-extrabold uppercase tracking-wider px-5 py-2.5 transition-all duration-200 cursor-pointer active:scale-97 shadow-2xs rounded-xs font-sans flex items-center gap-1.5"
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Product share link copied to clipboard!");
                  }}
                  className="bg-white hover:bg-neutral-50 text-[#020302] border border-[#efeded] text-[11px] font-extrabold uppercase tracking-wider px-4 py-2.5 transition-all duration-200 cursor-pointer active:scale-97 shadow-2xs rounded-xs font-sans flex items-center gap-1.5"
                  title="Share Product"
                >
                  <Share2 size={13} className="text-neutral-500" />
                  <span>Share</span>
                </button>
                <button 
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="bg-white hover:bg-rose-50 text-rose-600 border border-[#efeded] hover:border-rose-200 text-[11px] font-extrabold uppercase tracking-wider px-4 py-2.5 transition-all duration-200 cursor-pointer active:scale-97 shadow-2xs rounded-xs font-sans flex items-center gap-1.5"
                  title="Delete Listing"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          {/* COLLAPSIBLE SPECIFICATIONS ACCORDION */}
          <div className="bg-white border border-[#efeded] rounded-xl overflow-hidden shadow-2xs">
            <button 
              onClick={() => setIsSpecsOpen(!isSpecsOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors cursor-pointer text-left"
            >
              <span className="text-[12px] font-extrabold uppercase tracking-wider text-neutral-500 font-sans">
                {isSpecsOpen ? 'Hide specifications' : 'View specifications'}
              </span>
              {isSpecsOpen ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
            </button>
            
            <AnimatePresence initial={false}>
              {isSpecsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="px-6 pb-6 pt-2 border-t border-[#efeded] space-y-6 text-left">
                    {/* Description Paragraph */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-400">Description</h4>
                      <p className="text-[14px] leading-relaxed text-neutral-600 font-normal font-sans whitespace-pre-line">
                        {product.description || "Samsung Galaxy smartphone features a premium glass back, standard 120Hz Super AMOLED display, and a powerful triple camera setup. Ideal for smooth multitasking and premium mobile photography."}
                      </p>
                    </div>

                    {/* Quick Specs Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      <div className="bg-neutral-50 p-3 rounded-lg border border-[#efeded]">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 font-sans block">Brand</span>
                        <span className="text-[13px] font-bold text-neutral-800 font-sans mt-0.5 block">{product.brand || 'N/A'}</span>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-lg border border-[#efeded]">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 font-sans block">Total Variants</span>
                        <span className="text-[13px] font-bold text-neutral-800 font-sans mt-0.5 block">{product.variants?.length || 0}</span>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-lg border border-[#efeded]">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 font-sans block">Low Stock Limit</span>
                        <span className="text-[13px] font-bold text-neutral-800 font-sans mt-0.5 block">{product.lowStockThreshold || 4} units</span>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-lg border border-[#efeded]">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 font-sans block">Stock Status</span>
                        <span className="text-[13px] font-bold text-neutral-800 font-sans mt-0.5 block">
                          {product.stock === 0 ? 'Depleted' : product.stock <= (product.lowStockThreshold || 4) ? 'Low' : 'Healthy'}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Swatch Colors if present */}
                    {uniqueColors.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-400 mb-3">Color Swatches ({uniqueColors.length})</h4>
                        <div className="flex space-x-2.5">
                          {uniqueColors.map((color) => {
                            const isActive = color === activeColor;
                            const hex = getColorHex(color);
                            return (
                              <button
                                key={color}
                                onClick={() => setActiveColor(color)}
                                className={`w-8 h-8 rounded-full border p-0.5 transition-all flex items-center justify-center cursor-pointer ${
                                  isActive ? 'border-2 border-[#020302] scale-105 shadow-xs' : 'border-[#c7c7bf] hover:border-[#5e5e5d]'
                                }`}
                                title={color}
                              >
                                <div 
                                  className="w-full h-full rounded-full border border-black/10" 
                                  style={{ backgroundColor: hex }}
                                ></div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MANAGE VARIANTS SECTION (DOMINATES THE SCREEN) */}
          <section ref={variantsRef} className="space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-[#efeded] pb-4">
              <h2 className="font-extrabold text-sm uppercase tracking-widest text-[#020302] font-sans">Manage Variants</h2>
              <span className="text-[11px] font-bold text-neutral-400 font-sans bg-neutral-100 px-2.5 py-0.5 rounded-full">
                {product.variants?.length || 0} active configurations
              </span>
            </div>

            <div className="space-y-3">
              {product.variants && product.variants.length > 0 ? (
                product.variants.map((v) => {
                  const isOutOfStock = v.quantity === 0;
                  const threshold = product.lowStockThreshold || 4;
                  const isLowStock = v.quantity > 0 && v.quantity <= threshold;
                  const hex = getColorHex(v.color);

                  return (
                    <div 
                      key={v.id} 
                      className={`bg-white border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 rounded-xl shadow-2xs hover:border-black/50
                        ${isOutOfStock ? 'border-neutral-200 bg-neutral-50/50 opacity-90' : 'border-[#efeded]'}`}
                    >
                      {/* Color Dot & Specs Title */}
                      <div className="flex items-center space-x-3.5">
                        <div className="w-8 h-8 rounded-full border border-[#c7c7bf] flex-shrink-0 shadow-2xs" style={{ backgroundColor: hex }}></div>
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-[15px] text-[#020302] font-sans tracking-tight">
                            {v.color} {v.ram.replace('GB','')}/{v.storage.replace('GB','')}
                          </h4>
                          <p className={`text-[12px] font-bold font-sans flex items-center gap-1.5
                            ${isOutOfStock 
                              ? 'text-rose-600' 
                              : isLowStock 
                                ? 'text-amber-600' 
                                : 'text-emerald-600'}`}
                          >
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            Stock: {v.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Buy & Sell Values Grid */}
                      <div className="flex gap-8 text-left bg-neutral-50 px-4 py-2.5 rounded-lg border border-[#efeded] md:min-w-[180px]">
                        <div className="flex-1">
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-sans">Buy</p>
                          <p className="font-extrabold text-[13px] text-[#020302] font-sans mt-0.5">
                            {formatPriceK(v.buyingPrice)}
                          </p>
                        </div>
                        <div className="w-[1px] bg-neutral-200 self-stretch" />
                        <div className="flex-1">
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-sans">Sell</p>
                          <p className="font-extrabold text-[13px] text-[#020302] font-sans mt-0.5">
                            {formatPriceK(v.sellingPrice)}
                          </p>
                        </div>
                      </div>

                      {/* Satisfying Inline Restock & Sell Button Controls */}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleStockAdjust(v, 1)}
                          className="px-4 py-2 bg-white hover:bg-neutral-50 text-[#020302] border border-[#efeded] text-[11px] font-extrabold uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-2xs rounded-xs font-sans cursor-pointer flex items-center gap-1"
                        >
                          <span>+ Stock</span>
                        </button>
                        <button 
                          onClick={() => handleStockAdjust(v, -1)}
                          disabled={isOutOfStock}
                          className={`px-5 py-2 font-extrabold text-[11px] uppercase tracking-wider transition-all duration-150 active:scale-95 rounded-xs font-sans cursor-pointer
                            ${isOutOfStock 
                              ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed line-through' 
                              : 'bg-[#020302] hover:bg-neutral-800 text-white shadow-2xs'}`}
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Fallback for single standard layout if no variants listed */
                <div className="bg-white border border-[#efeded] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full border border-neutral-300 bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-neutral-400">STD</span>
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-[14px] text-[#020302] font-sans tracking-tight">Standard Variant</h4>
                      <p className={`text-[12px] font-bold font-sans ${product.stock === 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        Stock: {product.stock}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-8 text-left bg-neutral-50 px-4 py-2 rounded-lg border border-[#efeded] md:min-w-[180px]">
                    <div>
                      <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-sans">Buy</p>
                      <p className="font-extrabold text-[13px] text-[#020302] font-sans mt-0.5">
                        {formatPriceK(product.variants?.[0]?.buyingPrice || 25000)}
                      </p>
                    </div>
                    <div className="w-[1px] bg-neutral-200 self-stretch" />
                    <div>
                      <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-sans">Sell</p>
                      <p className="font-extrabold text-[13px] text-[#020302] font-sans mt-0.5">
                        {formatPriceK(product.variants?.[0]?.sellingPrice || 30000)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        const defaultV = product.variants?.[0] || { id: 'default', color: 'Standard', ram: '', storage: '', quantity: product.stock, buyingPrice: 25000, sellingPrice: 30000 };
                        handleStockAdjust(defaultV as any, 1);
                      }}
                      className="px-4 py-2 bg-white hover:bg-neutral-50 text-[#020302] border border-[#efeded] text-[11px] font-extrabold uppercase tracking-wider rounded border transition-all active:scale-95 font-sans cursor-pointer"
                    >
                      + Stock
                    </button>
                    <button 
                      onClick={() => {
                        const defaultV = product.variants?.[0] || { id: 'default', color: 'Standard', ram: '', storage: '', quantity: product.stock, buyingPrice: 25000, sellingPrice: 30000 };
                        handleStockAdjust(defaultV as any, -1);
                      }}
                      disabled={product.stock === 0}
                      className={`px-5 py-2 font-extrabold text-[11px] uppercase tracking-wider rounded transition-all active:scale-95 font-sans cursor-pointer
                        ${product.stock === 0 
                          ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed line-through' 
                          : 'bg-[#020302] hover:bg-neutral-800 text-white shadow-2xs'}`}
                    >
                      Sell
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* STOCK ACTIVITY FEED (TIMELINE - AUDIT Feed replacing accounting tables) */}
          <section className="space-y-6 text-left pt-4">
            <div className="border-b border-[#efeded] pb-4">
              <h2 className="font-extrabold text-sm uppercase tracking-widest text-[#020302] font-sans">Stock Activity History</h2>
            </div>
            
            {product.history && product.history.length > 0 ? (
              <div className="relative border-l border-neutral-200 ml-3 pl-6 space-y-4 font-sans">
                {product.history.map((log: any, idx: number) => {
                  const parts = log.text.split(' — ');
                  const actionDesc = parts[0] || 'Inventory adjustment';
                  const variantDetails = parts.length === 3 ? parts[1] : (product.variants?.[0] ? `${product.variants[0].color} ${product.variants[0].ram}/${product.variants[0].storage}` : 'Standard');
                  const dateStr = parts.length === 3 ? parts[2] : (parts[1] || 'Today');
                  const isSell = log.type === 'sell';

                  return (
                    <div key={idx} className="relative group">
                      {/* Timeline Dot Connector */}
                      <span className={`absolute -left-[30px] top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border bg-white transition-transform duration-250 group-hover:scale-110
                        ${isSell 
                          ? 'border-amber-300 text-amber-500' 
                          : 'border-emerald-300 text-emerald-500'}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${isSell ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      </span>

                      {/* Audit Row Box */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-[#efeded] p-4 hover:border-black transition-colors rounded-xl shadow-2xs">
                        <div className="space-y-1">
                          <h4 className="text-[13px] font-extrabold text-neutral-800 font-sans tracking-tight">
                            {actionDesc}
                          </h4>
                          <p className="text-[11px] font-bold text-neutral-400 font-sans uppercase tracking-widest">
                            Configuration: {variantDetails}
                          </p>
                        </div>
                        <div className="text-left md:text-right flex items-center md:justify-end">
                          <span className="text-[10px] font-extrabold text-neutral-400 font-sans uppercase tracking-widest bg-neutral-100 px-2 py-1 rounded-sm">
                            {dateStr}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-[#efeded] text-neutral-400 text-sm font-sans rounded-xl">
                No inventory logs recorded. Adjust a variant's stock to begin populating this timeline.
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Delete Confirmation Overlay modal */}
      <AnimatePresence>
        {confirmDeleteOpen && (
          <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-md w-full border border-[#c7c7bf] shadow-2xl p-6 relative text-left rounded-xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[14px] font-bold text-[#020302] uppercase tracking-wide font-sans">Delete smartphone model</h3>
                  <p className="text-[12px] text-[#5e5e5d] leading-relaxed font-normal">
                    Are you absolutely sure you want to delete <strong className="text-[#020302] font-semibold">{product.name}</strong> from your inventory? This action is irreversible.
                  </p>
                  
                  {hasSalesHistory && (
                    <div className="bg-amber-50 border border-amber-200 p-3 mt-2 flex gap-2 rounded-lg">
                      <AlertTriangle size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-800 font-semibold leading-relaxed">
                        WARNING: This product has transactions and sales history. Deleting it will purge all historical activity logs from your reports.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#efeded]">
                <button
                  onClick={() => setConfirmDeleteOpen(false)}
                  className="px-4 py-2 border border-[#c7c7bf] hover:bg-[#f5f3f3] text-[#020302] font-bold text-xs rounded-lg transition-all cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteProduct(product.id);
                    setConfirmDeleteOpen(false);
                    onBack();
                  }}
                  className="px-5 py-2 bg-[#ba1a1a] hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer font-sans"
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
