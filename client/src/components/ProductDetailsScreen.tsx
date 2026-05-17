"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ProductVariant } from '@/types/zenvy';
import { AlertTriangle, ChevronRight, Edit2, Share2, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

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

  // Extract unique colors available
  const uniqueColors = Array.from(new Set(product.variants?.map(v => v.color) || []));
  const [activeColor, setActiveColor] = useState<string>(uniqueColors[0] || '');

  // Select active variant based on clicked color swatch
  const activeVariant = product.variants?.find(v => v.color === activeColor) || product.variants?.[0];

  // Bento gallery array setup
  const galleryImages = [
    product.image,
    ...(product.variants?.map(v => v.image).filter((img): img is string => !!img) || [])
  ].filter((img, index, self) => self.indexOf(img) === index); // unique images

  // Premium studio photography placeholders from mockup
  const defaultPlaceholders = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAT13321j0ZVQgYGdMX1goe77Ft75fShc6ZKORiMmIgyPp2ArvNQJIgBPjpEncasXi_E6k1T4hc9plGSRjRzqHnTnXHdi94IZi9BclSxE7X7YC1LMwIAzB6_Ds7zcLsLwtVdgMLTtimqBQVCtlMsfvP9G_c0aEMISFm9QndVp7tKzD-bCjIX4bX4oyjXRFrt1KgbamEKsAiS0SgdrNfAkz2sutr5NBZBfmZuG3DtO8HSKgR9LAsp2flZw8q5AkzSm_Dq2KT3cQrjCdP", // 1. main
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAFoUTKdVxURHl99I7jjnpSGPmHN5sVyiiP32ddMv8MVZOOVXRRBZ-ckHtgWTwtgkP334SJm3OrXZqs6PMd4YoyogRUUoaDN69IIGITs67JYhbtc8V95nRkf18rXcNoP6ZTSKrzr1z_6o0DY5YVNxfZhAaKQB5_ooeXAK1exU-K-d4qBU1WThw17PWWyKKVn6nFvpzG7_0dsjmO4J-LPAZNDS-2tkPMsiTSEqRbA5m1qG_CG2TgpQvZktd8idpbMQOZ7cBvpweO_gEm", // 2. camera macro
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD-kdb67imDdIecq6SQfIDlaS8QQuC1_Qd2aw_rNtV19kr6su7EjVLK1KBMBfY2-Jg11J90t-2sXNAHU-ncGmFMjO_SmESsTWpS6o8vEzN8sm9I9d-NBGX8HdcYFyISC4ui4bt0Ne6oOhkMGgxoQBPT1V8Jdzh0Z4l0N7Tvm_FtV6spp1x8cg5gta58CWj8fQXvw1u-suGIHJNgkq4nRhe6FOtPAd4Mm_b_Lo1tmGHLxq2RbwDCTHO8q7CzVSK69ESyEfAf5qNa-q_n", // 3. side buttons
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAisQiUT4yYhuR6DUDsnMwC7EvKQXXg7wqfSbtJvIMby-fo4lgbYM1soD6a5LqV66XfI7tbdgVlvEuTpaKO6R7RjTne1ZP6FxMXvy2mNPDlrtxyRpZPjmEIVAx8xZUaXP6Ybm2Wcv7TroVwea1WRF71GnHZvLYviWWSUhCazfyftajvrZhTYrbVFTpRYTxhw_zp3j7CXfzwWeeqvLWA6eECjnQbDW9yIxCXjosL0WrZPkJuJoeDkR1yh-mx-qCxKKubTR1fUcXHOOYJ", // 4. AMOLED screen
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBWOYogEXZ-CONbIYoiIZFVBJrjB9l9uVIV-K9JhnVlwpjEVn95L0J0IAtRS-GtEsisf3yqQqN8rYWYwChIogXAetdTTUdBep6BqW6R9YO3tnj95bey8iOF-eMa1ERz1ho4J-ZKv-_TcU7ou5LLG4GpFZftgUP9cXPom70deCRhMbNzJmJ7FEyhcoW4fH0Eh_dFgGRvL0hEzx6Ksiba1TTTHspwZ5ybH0pjtQo2ZtdMtq9MOfQkLfex-PLZ43cjleL-xMtYGtQ-rMy3"  // 5. marble lifestyle
  ];

  const getBentoImage = (index: number): string => {
    if (index === 0) return activeVariant?.image || product.image || defaultPlaceholders[0];
    return galleryImages[index] || defaultPlaceholders[index];
  };

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
  
  const hasSalesHistory = product.variants?.some(v => v.quantity > 0) || false;

  return (
    <div className="flex-1 bg-[#fbf9f9] overflow-y-auto relative h-full flex flex-col font-sans text-[#1b1c1c]">
      {/* Main Content Area mapping to the HTML <main> */}
      <div className="pt-8 pb-20 md:pb-8 min-h-screen px-4 md:px-[48px]">
        <div className="max-w-6xl mx-auto">
          
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-[12px] leading-[1.4] font-normal text-[#5e5e5d] mb-8 font-sans">
            <button onClick={onBack} className="hover:text-[#020302] transition-colors cursor-pointer bg-transparent border-none p-0 text-[12px]">Inventory</button>
            <ChevronRight size={14} />
            <span className="text-[#020302] font-bold">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
            
            {/* Product Gallery (Bento Layout) */}
            <div className="lg:col-span-7 -mx-4 md:mx-0">
              <div className="flex md:grid md:grid-cols-4 md:grid-rows-[repeat(2,250px)] gap-[16px] overflow-x-auto snap-x snap-mandatory px-4 md:px-0 pb-4 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                {/* Bento Item Large */}
                <div className="flex-none w-[85vw] md:w-auto snap-center md:col-span-2 md:row-span-2 relative overflow-hidden border border-[#c7c7bf] bg-white aspect-[4/5] md:aspect-auto">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                    src={getBentoImage(4)} 
                    alt={product.name} 
                  />
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#c7c7bf]">
                    <span className="font-bold text-[12px] leading-[1.4] text-[#020302] uppercase font-sans tracking-wide">Main View</span>
                  </div>
                </div>

                <div className="flex-none w-[65vw] md:w-auto snap-center md:col-span-1 md:row-span-1 relative overflow-hidden border border-[#c7c7bf] bg-white aspect-[4/5] md:aspect-auto">
                  <img className="w-full h-full object-cover" src={getBentoImage(1)} alt="Gallery 1" />
                </div>
                
                <div className="flex-none w-[65vw] md:w-auto snap-center md:col-span-1 md:row-span-1 relative overflow-hidden border border-[#c7c7bf] bg-white aspect-[4/5] md:aspect-auto">
                  <img className="w-full h-full object-cover" src={getBentoImage(2)} alt="Gallery 2" />
                </div>
                
                <div className="flex-none w-[65vw] md:w-auto snap-center md:col-span-1 md:row-span-1 relative overflow-hidden border border-[#c7c7bf] bg-white aspect-[4/5] md:aspect-auto">
                  <img className="w-full h-full object-cover" src={getBentoImage(3)} alt="Gallery 3" />
                </div>
                
                <div className="flex-none w-[65vw] md:w-auto snap-center md:col-span-1 md:row-span-1 relative overflow-hidden border border-[#c7c7bf] bg-white aspect-[4/5] md:aspect-auto">
                  <img className="w-full h-full object-cover" src={getBentoImage(4)} alt="Gallery 4" />
                </div>

              </div>
            </div>

            {/* Product Info */}
            <div className="lg:col-span-5 flex flex-col space-y-8">
              <div>
                <h1 className="font-medium text-3xl md:text-4xl text-[#020302] mb-2 font-sans tracking-tight">{product.name}</h1>
                <div className="flex items-baseline space-x-4">
                  <span className="text-2xl font-medium text-[#020302] font-sans">
                    ৳{activeVariant ? activeVariant.sellingPrice.toLocaleString() : minPrice.toLocaleString()}
                  </span>
                  
                  {activeVariant && activeVariant.sellingPrice > 0 && (
                    <>
                      <span className="text-[16px] leading-[1.6] font-[300] font-sans text-[#5e5e5d] line-through">
                        ৳{(activeVariant.sellingPrice * 1.17).toLocaleString()}
                      </span>
                      <span className="bg-[#e9e8e7] px-2 py-0.5 rounded font-bold text-[12px] leading-[1.4] text-[#464741] font-sans">
                        17% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-[#c7c7bf] pt-6">
                <h3 className="font-bold text-[14px] leading-[1.4] tracking-[0.04em] text-[#020302] mb-3 uppercase font-sans">Specifications</h3>
                <p className="text-[16px] leading-[1.6] font-[300] font-sans text-[#5e5e5d] leading-relaxed whitespace-pre-line">
                  {product.description || "Samsung Galaxy smartphone features a premium glass back, standard 120Hz Super AMOLED display, and a powerful triple camera setup. Ideal for smooth multitasking and premium mobile photography."}
                </p>
              </div>

              {/* Color Swatches */}
              {uniqueColors.length > 0 && (
                <div>
                  <h3 className="font-bold text-[14px] leading-[1.4] tracking-[0.04em] text-[#020302] mb-4 uppercase font-sans">Color Selection</h3>
                  <div className="flex space-x-3">
                    {uniqueColors.map((color) => {
                      const isActive = color === activeColor;
                      const hex = getColorHex(color);
                      return (
                        <button
                          key={color}
                          onClick={() => setActiveColor(color)}
                          className={`w-10 h-10 rounded-full border p-1 transition-all flex items-center justify-center cursor-pointer ${
                            isActive ? 'border-2 border-[#020302]' : 'border-[#c7c7bf] hover:border-[#5e5e5d]'
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

              {/* Actions */}
              <div className="flex space-x-4">
                <button 
                  onClick={() => onEdit(product)}
                  className="flex-1 h-12 bg-[#020302] text-[#ffffff] font-bold text-[14px] leading-[1.4] tracking-[0.04em] flex items-center justify-center space-x-2 hover:opacity-90 active:scale-[0.98] transition-all font-sans cursor-pointer"
                >
                  <Edit2 size={16} />
                  <span>Edit Listing</span>
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Product share link copied to clipboard!");
                  }}
                  className="w-12 h-12 border border-[#c7c7bf] rounded-2xl flex items-center justify-center text-[#020302] hover:bg-[#f5f3f3] transition-all cursor-pointer"
                >
                  <Share2 size={18} />
                </button>
                <button 
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="w-12 h-12 border border-[#ba1a1a] rounded-2xl flex items-center justify-center text-[#ba1a1a] hover:bg-red-50 transition-all cursor-pointer"
                  title="Delete Product"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Manage Variants */}
          <section className="mt-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-medium text-xl text-[#020302] font-sans">Manage Variants</h2>
              <button className="text-[12px] leading-[1.4] tracking-[0.04em] font-normal text-[#020302] border-b-2 border-[#020302] hover:text-[#5e5e5d] hover:border-[#5e5e5d] transition-all pb-1 font-sans cursor-pointer">
                View All Variants
              </button>
            </div>
            <div className="space-y-4">
              {product.variants && product.variants.map((v) => {
                const isOutOfStock = v.quantity === 0;
                const hex = getColorHex(v.color);

                if (isOutOfStock) {
                  return (
                    <div key={v.id} className="bg-white border border-[#c7c7bf] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-75">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg border border-[#c7c7bf] flex-shrink-0" style={{ backgroundColor: hex }}></div>
                        <div>
                          <h4 className="font-bold text-[14px] leading-[1.4] tracking-[0.04em] text-[#020302] font-sans">
                            {v.color} {v.ram.replace('GB','')}/{v.storage.replace('GB','')}
                          </h4>
                          <p className="font-bold text-[12px] leading-[1.4] text-[#ba1a1a] font-sans mt-1">OUT OF STOCK</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-2 gap-8 text-left">
                        <div>
                          <p className="font-bold text-[12px] leading-[1.4] text-[#5e5e5d] uppercase mb-1 font-sans tracking-wide">Buying Price</p>
                          <p className="font-bold text-[14px] leading-[1.4] tracking-[0.04em] text-[#020302] font-sans">৳{v.buyingPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-bold text-[12px] leading-[1.4] text-[#5e5e5d] uppercase mb-1 font-sans tracking-wide">Selling Price</p>
                          <p className="font-bold text-[14px] leading-[1.4] tracking-[0.04em] text-[#020302] font-sans">৳{v.sellingPrice.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleStockAdjust(v, 1)}
                          className="px-4 py-2 bg-[#020302] text-[#ffffff] font-bold text-[14px] leading-[1.4] tracking-[0.04em] rounded hover:opacity-90 transition-all active:scale-95 font-sans cursor-pointer"
                        >
                          Restock
                        </button>
                        <button 
                          disabled
                          className="px-4 py-2 bg-[#e3e2e2]/20 text-[#5e5e5d] font-bold text-[14px] leading-[1.4] tracking-[0.04em] rounded border border-[#c7c7bf] cursor-not-allowed font-sans"
                        >
                          Mark Sold
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={v.id} className="bg-white border border-[#c7c7bf] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg border border-[#c7c7bf] flex-shrink-0" style={{ backgroundColor: hex }}></div>
                      <div>
                        <h4 className="font-bold text-[14px] leading-[1.4] tracking-[0.04em] text-[#020302] font-sans">
                          {v.color} {v.ram.replace('GB','')}/{v.storage.replace('GB','')}
                        </h4>
                        <p className="text-[12px] leading-[1.4] font-normal text-[#5e5e5d] font-sans mt-1">
                          Stock: <span className="font-bold text-[#1b1c1c]">{v.quantity} units</span>
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-8 text-left">
                      <div>
                        <p className="font-bold text-[12px] leading-[1.4] text-[#5e5e5d] uppercase mb-1 font-sans tracking-wide">Buying Price</p>
                        <p className="font-bold text-[14px] leading-[1.4] tracking-[0.04em] text-[#020302] font-sans">৳{v.buyingPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-bold text-[12px] leading-[1.4] text-[#5e5e5d] uppercase mb-1 font-sans tracking-wide">Selling Price</p>
                        <p className="font-bold text-[14px] leading-[1.4] tracking-[0.04em] text-[#020302] font-sans">৳{v.sellingPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleStockAdjust(v, 1)}
                        className="px-4 py-2 bg-[#efeded] text-[#020302] font-bold text-[14px] leading-[1.4] tracking-[0.04em] rounded border border-[#c7c7bf] hover:bg-[#e9e8e7] transition-all active:scale-95 font-sans cursor-pointer"
                      >
                        Add Stock
                      </button>
                      <button 
                        onClick={() => handleStockAdjust(v, -1)}
                        className="px-4 py-2 bg-[#020302] text-[#ffffff] font-bold text-[14px] leading-[1.4] tracking-[0.04em] rounded hover:opacity-90 transition-all active:scale-95 font-sans cursor-pointer"
                      >
                        Mark Sold
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Transaction History */}
          <section className="mt-16 mb-12">
            <div className="border-b border-[#c7c7bf] pb-4 mb-6">
              <h2 className="font-bold text-[14px] leading-[1.4] tracking-[0.2em] text-[#020302] uppercase font-sans">Stock Transaction History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f5f3f3]">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-[12px] leading-[1.4] text-[#5e5e5d] uppercase font-sans">Date</th>
                    <th className="px-6 py-4 text-left font-bold text-[12px] leading-[1.4] text-[#5e5e5d] uppercase font-sans">Action</th>
                    <th className="px-6 py-4 text-left font-bold text-[12px] leading-[1.4] text-[#5e5e5d] uppercase font-sans">Variant</th>
                    <th className="px-6 py-4 text-left font-bold text-[12px] leading-[1.4] text-[#5e5e5d] uppercase font-sans">Qty</th>
                    <th className="px-6 py-4 text-left font-bold text-[12px] leading-[1.4] text-[#5e5e5d] uppercase font-sans">Total Value</th>
                    <th className="px-6 py-4 text-right font-bold text-[12px] leading-[1.4] text-[#5e5e5d] uppercase font-sans">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c7c7bf]">
                  {product.history && product.history.length > 0 ? (
                    product.history.map((log: any, idx: number) => {
                      const parts = log.text.split(' — ');
                      const actionDesc = parts[0] || 'Updated';
                      const variantDetails = parts.length === 3 ? parts[1] : (product.variants?.[0] ? `${product.variants[0].color} ${product.variants[0].ram}/${product.variants[0].storage}` : 'Standard');
                      const dateStr = parts.length === 3 ? parts[2] : (parts[1] || 'Today');
                      const isSell = log.type === 'sell';
                      
                      const qtyMatch = actionDesc.match(/\d+/);
                      const qtyVal = qtyMatch ? parseInt(qtyMatch[0]) : 1;
                      const displayQty = isSell ? `-${qtyVal}` : `+${qtyVal}`;

                      const matchedVariant = product.variants?.find(v => variantDetails.toLowerCase().includes(v.color.toLowerCase()));
                      const price = matchedVariant ? (isSell ? matchedVariant.sellingPrice : matchedVariant.buyingPrice) : (product.variants?.[0]?.sellingPrice || 0);
                      const totalValue = price * qtyVal;

                      const displayBalance = product.stock; // Approximation

                      return (
                        <tr key={idx} className="hover:bg-white transition-colors">
                          <td className="px-6 py-4 text-[16px] leading-[1.6] font-[300] text-[#1b1c1c] font-sans">{dateStr}</td>
                          <td className="px-6 py-4 font-bold text-[14px] leading-[1.4] tracking-[0.04em] font-sans">
                            {isSell ? (
                              <span className="text-[#ba1a1a] flex items-center">
                                <ArrowUpRight size={16} className="mr-2" strokeWidth={3} /> Sold
                              </span>
                            ) : (
                              <span className="text-green-600 flex items-center">
                                <ArrowDownLeft size={16} className="mr-2" strokeWidth={3} /> Added
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[16px] leading-[1.6] font-[300] text-[#1b1c1c] font-sans">{variantDetails}</td>
                          <td className="px-6 py-4 text-[16px] leading-[1.6] font-[300] text-[#1b1c1c] font-sans">{displayQty}</td>
                          <td className="px-6 py-4 text-[16px] leading-[1.6] font-[300] text-[#1b1c1c] font-sans">৳{totalValue.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-[16px] leading-[1.6] font-[300] text-[#1b1c1c] font-sans">{displayBalance}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[#5e5e5d] font-sans">
                        No transactions recorded yet. Adjust stock to see history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
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
