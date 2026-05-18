"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  AlertTriangle, 
  ChevronRight, 
  Check, 
  Minus, 
  Plus, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  Receipt, 
  MessageCircle 
} from 'lucide-react';
import { Product } from '@/types/zenvy';
import confetti from 'canvas-confetti';
import { generateBrandedInvoicePDF } from '@/lib/invoice';

interface POSCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  productList: Product[];
  setProductList: React.Dispatch<React.SetStateAction<Product[]>>;
  setRecentActivities: React.Dispatch<React.SetStateAction<any[]>>;
  storeName: string;
}

interface CartItem {
  product: Product;
  variant: any;
  quantity: number;
  overridePrice: number;
}

export default function POSCheckoutModal({
  isOpen,
  onClose,
  productList,
  setProductList,
  setRecentActivities,
  storeName
}: POSCheckoutModalProps) {
  // POS-specific local states
  const [posStep, setPosStep] = useState<number>(1);
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [posSearch, setPosSearch] = useState<string>('');
  const [posBuyerName, setPosBuyerName] = useState<string>('');
  const [posDiscountType, setPosDiscountType] = useState<'flat' | 'percent'>('flat');
  const [posDiscountValue, setPosDiscountValue] = useState<number>(0);
  const [posSuccessData, setPosSuccessData] = useState<any | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | number | null>(null);

  // Cart operations
  const handleAddToCart = (product: Product, variant: any) => {
    setPosCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.variant.id === variant.id);
      if (existingItemIndex > -1) {
        const existingItem = prevCart[existingItemIndex];
        if (existingItem.quantity >= variant.quantity) {
          // Cannot add more than in-stock
          return prevCart;
        }
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + 1
        };
        return updatedCart;
      } else {
        return [...prevCart, {
          product,
          variant,
          quantity: 1,
          overridePrice: variant.sellingPrice
        }];
      }
    });
  };

  const handleDecrementFromCart = (variantId: string) => {
    setPosCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.variant.id === variantId);
      if (existingItemIndex > -1) {
        const existingItem = prevCart[existingItemIndex];
        if (existingItem.quantity <= 1) {
          return prevCart.filter(item => item.variant.id !== variantId);
        }
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity - 1
        };
        return updatedCart;
      }
      return prevCart;
    });
  };

  const handleRemoveFromCart = (variantId: string) => {
    setPosCart(prevCart => prevCart.filter(item => item.variant.id !== variantId));
  };

  const handleUpdateCartItemPrice = (variantId: string, newPrice: number) => {
    const cleanPrice = Math.max(0, newPrice);
    setPosCart(prevCart => prevCart.map(item => 
      item.variant.id === variantId ? { ...item, overridePrice: cleanPrice } : item
    ));
  };

  const handleConfirmPOSSale = () => {
    if (posCart.length === 0) return;

    const customer = posBuyerName.trim() || 'Walk-in Customer';
    const subtotal = posCart.reduce((sum, item) => sum + (item.overridePrice * item.quantity), 0);
    
    let discountAmount = 0;
    if (posDiscountType === 'flat') {
      discountAmount = Math.min(subtotal, posDiscountValue);
    } else {
      discountAmount = Math.min(subtotal, Math.round(subtotal * (posDiscountValue / 100)));
    }
    const grandTotal = subtotal - discountAmount;

    // 1. Mutate state productList: decrement variant quantity for all sold items
    setProductList(prevList => prevList.map(p => {
      const productCartItems = posCart.filter(item => item.product.id === p.id);
      if (productCartItems.length === 0) return p;

      const updatedVariants = p.variants?.map(v => {
        const cartItem = productCartItems.find(item => item.variant.id === v.id);
        if (cartItem) {
          return {
            ...v,
            quantity: Math.max(0, v.quantity - cartItem.quantity)
          };
        }
        return v;
      }) || [];

      const newTotalStock = updatedVariants.reduce((sum, v) => sum + v.quantity, 0);
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const newHistoryLogs = productCartItems.map(item => ({
        text: `Sold ${item.quantity} unit${item.quantity > 1 ? 's' : ''} to ${customer} — ${item.variant.color} ${item.variant.ram}/${item.variant.storage} — ${dateStr}`,
        type: 'sell' as const
      }));

      return {
        ...p,
        variants: updatedVariants,
        stock: newTotalStock,
        history: [...newHistoryLogs, ...(p.history || [])]
      };
    }));

    // 2. Prepend Bottom Feed dynamic activities
    posCart.forEach(item => {
      setRecentActivities(prev => [
        { 
          type: 'sold', 
          text: 'Marked sold', 
          product: `${item.product.brand} ${item.product.name} ${item.variant.color} ${item.variant.ram}/${item.variant.storage} (Qty: ${item.quantity})`, 
          time: 'Just now' 
        },
        ...prev
      ].slice(0, 10));
    });

    // 3. Compile POS Invoice receipt data
    const finalReceipt = {
      shopName: storeName || 'Zenvy Store',
      invoiceNumber: `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      buyerName: customer,
      items: posCart.map(item => ({
        brand: item.product.brand || 'Generic',
        name: item.product.name,
        color: item.variant.color,
        specs: `${item.variant.ram}/${item.variant.storage}`,
        quantity: item.quantity,
        price: item.overridePrice,
        total: item.overridePrice * item.quantity
      })),
      subtotal,
      discount: discountAmount,
      total: grandTotal
    };

    setPosSuccessData(finalReceipt);

    // 4. Confetti Explosion
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 }
    });

    // 5. Haptic Vibe
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // 6. Transition
    localStorage.setItem('zenvy_checklist_recordFirstSale', 'true');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('zenvy_onboarding_update'));
    }
    setPosStep(3);
  };

  const handleClose = () => {
    // Reset internal state
    setPosStep(1);
    setPosCart([]);
    setPosSearch('');
    setPosBuyerName('');
    setPosDiscountType('flat');
    setPosDiscountValue(0);
    setPosSuccessData(null);
    setExpandedProductId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#020302]/20 backdrop-blur-sm">
      {/* Backdrop Close Click */}
      <div className="absolute inset-0" onClick={handleClose} />

      <AnimatePresence mode="wait">
        {posStep === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="w-full max-w-2xl z-[210] flex flex-col font-sans text-on-surface"
          >
            {/* Step 1: Select Products */}
            <div className="bg-[#fbf9f9] w-full max-h-[85vh] sm:max-h-[90vh] md:max-h-[850px] flex flex-col border-t sm:border border-[#c7c7bf] shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="px-4 pt-5 pb-3 sm:px-8 sm:pt-8 sm:pb-4 flex justify-between items-center shrink-0">
                <h1 className="font-medium text-xl sm:text-2xl md:text-[32px] tracking-[0.01em] text-[#020302]">Select Products</h1>
                <button 
                  type="button"
                  onClick={handleClose} 
                  className="p-1.5 sm:p-2 hover:bg-[#f5f3f3] rounded-full transition-all cursor-pointer"
                >
                  <X size={20} className="text-[#464741] sm:hidden" />
                  <X size={24} className="text-[#464741] hidden sm:block" />
                </button>
              </div>
              
              {/* Search Section */}
              <div className="px-4 pb-4 sm:px-8 sm:pb-6 border-b border-[#c7c7bf]/30 shrink-0">
                <div className="relative flex items-center">
                  <Search size={18} className="absolute left-3.5 text-[#464741] sm:hidden" />
                  <Search size={20} className="absolute left-4 text-[#464741] hidden sm:block" />
                  <input
                    type="text"
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:pl-12 sm:pr-4 sm:py-3 bg-white border border-[#c7c7bf] rounded-lg text-sm sm:text-base font-light text-[#1b1c1c] focus:outline-none focus:border-[#020302] transition-colors placeholder:text-[#464741]/50"
                    placeholder="Search mobile by name, brand..."
                  />
                  {posSearch && (
                    <button 
                      type="button"
                      onClick={() => setPosSearch('')} 
                      className="absolute right-4 text-[#464741] cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Product List Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 sm:py-6 space-y-4 sm:space-y-6 bg-[#ffffff]">
                {(() => {
                  const query = posSearch.toLowerCase().trim();
                  const filtered = productList.filter(p => {
                    if (p.stock === 0) return false;
                    const matchProduct = p.name.toLowerCase().includes(query) || (p.brand || '').toLowerCase().includes(query);
                    if (matchProduct) return true;
                    const matchVariants = p.variants?.some(v => 
                      (v.color || '').toLowerCase().includes(query) || 
                      (v.storage || '').toLowerCase().includes(query) ||
                      (v.ram || '').toLowerCase().includes(query)
                    );
                    return matchVariants;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-16 text-neutral-400">
                        <AlertTriangle size={24} className="mx-auto mb-2 opacity-50 text-[#1b1c1c]" />
                        <p className="text-[11px] font-medium uppercase tracking-wider text-[#5e5e5d]">No matching smartphone in stock</p>
                      </div>
                    );
                  }

                  return filtered.map((product: any) => {
                    const isExpanded = expandedProductId === product.id;
                    const cartItemCount = posCart
                      .filter(item => item.product.id === product.id)
                      .reduce((sum, item) => sum + item.quantity, 0);

                    if (isExpanded) {
                      return (
                        <section key={product.id} className="bg-white border border-[#020302] overflow-hidden transition-all duration-300 ring-1 ring-[#020302]/10">
                          <div 
                            onClick={() => setExpandedProductId(null)}
                            className="p-4 sm:p-6 flex items-start gap-4 sm:gap-6 cursor-pointer"
                          >
                            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#fbf9f9] rounded-lg flex-shrink-0 border border-[#c7c7bf] overflow-hidden">
                              <img className="w-full h-full object-cover" src={product.image} alt={product.name} />
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-center gap-2">
                                <h2 className="text-lg sm:text-[24px] font-normal tracking-[0.01em] text-[#020302] truncate">{product.name}</h2>
                                <ChevronRight size={20} className="text-[#020302] transition-transform duration-200 rotate-90 shrink-0 sm:hidden" />
                                <ChevronRight size={24} className="text-[#020302] transition-transform duration-200 rotate-90 shrink-0 hidden sm:block" />
                              </div>
                              <p className="text-[10px] sm:text-[12px] text-[#c7c6c5] uppercase tracking-wider mt-1 truncate">{"Mobile & Tablets • " + product.brand}</p>
                            </div>
                          </div>

                          {/* Variant Selection */}
                          <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-2 sm:space-y-3 bg-[#ffffff]">
                            {product.variants?.map((v: any) => {
                              const cartItem = posCart.find(item => item.variant.id === v.id);
                              const itemQtyInCart = cartItem?.quantity || 0;
                              const isOutOfStock = v.quantity === 0;

                              if (isOutOfStock) {
                                  return (
                                    <div key={v.id} className="p-3 sm:p-4 bg-[#efeded] border border-[#c7c7bf] flex items-center justify-between opacity-50 cursor-not-allowed">
                                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#c7c7bf] rounded-sm shrink-0"></div>
                                        <div className="min-w-0">
                                          <p className="text-sm sm:text-[16px] font-light text-[#1b1c1c] truncate">{v.color + " " + v.ram + "/" + v.storage}</p>
                                          <p className="text-[11px] sm:text-[12px] text-[#ba1a1a]">0 Available</p>
                                        </div>
                                      </div>
                                      <span className="text-xs sm:text-[14px] text-[#5e5e5d] font-medium shrink-0">{"Tk " + v.sellingPrice.toLocaleString()}</span>
                                    </div>
                                  );
                              }

                              if (itemQtyInCart > 0) {
                                return (
                                  <div 
                                    key={v.id} 
                                    onClick={(e) => { e.stopPropagation(); handleRemoveFromCart(v.id); }} 
                                    className="p-3 sm:p-4 bg-[#1d1d1b] border border-[#020302] flex items-center justify-between cursor-pointer transition-all"
                                  >
                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#020302] rounded-sm flex items-center justify-center text-white shrink-0">
                                        <Check size={12} strokeWidth={3} className="sm:hidden" />
                                        <Check size={14} strokeWidth={3} className="hidden sm:block" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm sm:text-[16px] font-light text-white truncate">{v.color + " " + v.ram + "/" + v.storage} <span className="ml-1 text-white/50 text-[9px] sm:text-[10px] uppercase">{"x" + itemQtyInCart}</span></p>
                                        <p className="text-[11px] sm:text-[12px] text-[#868582]">{v.quantity + " Available"}</p>
                                      </div>
                                    </div>
                                    <span className="text-xs sm:text-[14px] text-white font-medium shrink-0">{"Tk " + v.sellingPrice.toLocaleString()}</span>
                                  </div>
                                );
                              }

                              return (
                                <div 
                                  key={v.id} 
                                  onClick={(e) => { e.stopPropagation(); handleAddToCart(product, v); }} 
                                  className="p-3 sm:p-4 bg-[#fbf9f9] border border-[#c7c7bf] flex items-center justify-between hover:border-[#020302] cursor-pointer transition-all group"
                                >
                                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#c7c7bf] rounded-sm flex items-center justify-center group-hover:border-[#020302] shrink-0"></div>
                                    <div className="min-w-0">
                                      <p className="text-sm sm:text-[16px] font-light text-[#1b1c1c] truncate">{v.color + " " + v.ram + "/" + v.storage}</p>
                                      <p className="text-[11px] sm:text-[12px] text-[#5e5e5d]">{v.quantity + " Available"}</p>
                                    </div>
                                  </div>
                                  <span className="text-xs sm:text-[14px] text-[#020302] font-medium shrink-0">{"Tk " + v.sellingPrice.toLocaleString()}</span>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      );
                    }

                    return (
                      <div 
                        key={product.id}
                        onClick={() => setExpandedProductId(product.id)}
                        className="p-4 sm:p-6 bg-white border border-[#c7c7bf] flex items-center gap-4 sm:gap-6 hover:bg-[#ffffff] hover:border-[#5e5e5d] transition-all cursor-pointer min-w-0"
                      >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#fbf9f9] flex-shrink-0 border border-[#c7c7bf] overflow-hidden opacity-80">
                          <img className="w-full h-full object-cover" src={product.image} alt={product.name} />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-center gap-2">
                            <h2 className="text-md sm:text-[18px] font-normal tracking-[0.01em] text-[#020302] opacity-80 truncate">{product.name}</h2>
                            {cartItemCount > 0 && (
                              <span className="bg-[#020302] text-white text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                {cartItemCount + " added"}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-[12px] text-[#c7c6c5] uppercase tracking-wider truncate">{"Mobile & Tablets • " + product.brand}</p>
                        </div>
                        <ChevronRight className="text-[#5e5e5d] shrink-0" size={20} />
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Modal Footer (Stepper Actions) */}
              <div className="px-4 py-4 sm:px-8 sm:py-6 bg-[#fbf9f9] border-t border-[#c7c7bf] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex gap-1.5 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#020302]"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#e3e2e2]"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#e3e2e2]"></div>
                  </div>
                  <span className="text-[11px] sm:text-[12px] text-[#5e5e5d]">Step 1 of 3</span>
                </div>
                <div className="flex gap-2 sm:gap-4">
                  <button 
                    type="button"
                    onClick={handleClose} 
                    className="px-4 py-2 sm:px-6 sm:py-2.5 border border-[#020302] text-[#020302] text-xs sm:text-[14px] font-medium hover:bg-[#f5f3f3] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    disabled={posCart.length === 0}
                    onClick={() => setPosStep(2)} 
                    className={"px-4 py-2.5 sm:px-8 sm:py-2.5 text-xs sm:text-[14px] font-medium flex items-center gap-1 sm:gap-2 transition-all cursor-pointer " + (posCart.length === 0 ? "bg-[#c7c6c5] text-[#1b1c1c] cursor-not-allowed" : "bg-[#020302] text-white hover:opacity-90")}
                  >
                    Next
                    <ArrowRight size={16} className="sm:hidden" />
                    <ArrowRight size={18} className="hidden sm:block" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {posStep === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="w-full max-w-2xl z-[210] flex flex-col font-sans text-on-surface"
          >
            {/* Step 2: Configure Negotiation & Overrides */}
            <div className="bg-[#fbf9f9] w-full max-h-[85vh] sm:max-h-[90vh] md:max-h-[850px] flex flex-col border-t sm:border border-[#c7c7bf] shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="px-4 pt-5 pb-3 sm:px-8 sm:py-6 border-b border-[#c7c7bf]/30 flex justify-between items-center shrink-0">
                <div>
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-[#5e5e5d] mb-1">Step 2 of 3</p>
                  <h1 className="text-lg sm:text-[24px] font-medium tracking-tight text-[#020302]">Configure Negotiation &amp; Overrides</h1>
                </div>
                <button 
                  type="button"
                  onClick={handleClose} 
                  className="p-1.5 sm:p-2 text-[#5e5e5d] hover:text-[#020302] transition-all cursor-pointer shrink-0"
                >
                  <X size={20} className="sm:hidden" />
                  <X size={24} className="hidden sm:block" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-grow overflow-y-auto px-4 py-4 sm:p-8 space-y-6 sm:space-y-8 bg-[#ffffff]">
                {/* Cart Items List */}
                <div className="space-y-4">
                  {posCart.map((item, idx) => (
                    <div key={`${item.variant.id}-${idx}`} className="bg-[#fbf9f9] p-4 sm:p-6 border border-[#c7c7bf] rounded-lg">
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white border border-[#c7c7bf] overflow-hidden flex-shrink-0">
                          <img className="w-full h-full object-cover" src={item.product.image} alt={item.product.name} />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h3 className="text-lg sm:text-[24px] font-medium text-[#020302] truncate leading-tight">{item.product.name}</h3>
                              <p className="text-xs sm:text-[14px] text-[#5e5e5d] mt-1 truncate">
                                {item.product.brand} • {item.variant.color} {item.variant.ram}/{item.variant.storage}
                              </p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => handleRemoveFromCart(item.variant.id)}
                              className="text-[#ba1a1a] text-xs sm:text-[14px] font-medium flex items-center gap-1 hover:opacity-80 transition-opacity shrink-0 cursor-pointer"
                            >
                              <Trash2 size={16} />
                              <span>Remove</span>
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 sm:mt-6">
                            <div>
                              <label className="block text-xs sm:text-[14px] font-medium text-[#020302] uppercase mb-1.5">Unit Price</label>
                              <div className="relative flex items-center">
                                <span className="absolute left-4 text-[#5e5e5d] font-normal text-sm sm:text-base">Tk</span>
                                <input 
                                  type="number"
                                  value={item.overridePrice}
                                  onChange={(e) => handleUpdateCartItemPrice(item.variant.id, Number(e.target.value))}
                                  className="w-full bg-white border border-[#c7c7bf] pl-10 pr-4 py-2 sm:py-3 rounded focus:ring-1 focus:ring-[#020302] focus:border-[#020302] outline-none text-sm sm:text-base font-normal text-[#1b1c1c]"
                                />
                              </div>
                              <p className="text-[11px] sm:text-xs text-[#5e5e5d] mt-1.5">MSRP: Tk {item.variant.sellingPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <label className="block text-xs sm:text-[14px] font-medium text-[#020302] uppercase mb-1.5">Quantity</label>
                              <div className="flex items-center border border-[#c7c7bf] rounded bg-white w-28 sm:w-32 overflow-hidden">
                                <button 
                                  type="button"
                                  onClick={() => handleDecrementFromCart(item.variant.id)}
                                  className="p-2 sm:p-3 text-[#5e5e5d] hover:text-[#020302] hover:bg-[#f5f3f3] transition-colors cursor-pointer shrink-0"
                                >
                                  <Minus size={14} />
                                </button>
                                <input 
                                  type="text" 
                                  readOnly
                                  value={item.quantity}
                                  className="w-full text-center border-none focus:ring-0 font-normal text-sm sm:text-base text-[#1b1c1c] p-0"
                                />
                                <button 
                                  type="button"
                                  onClick={() => handleAddToCart(item.product, item.variant)}
                                  className="p-2 sm:p-3 text-[#5e5e5d] hover:text-[#020302] hover:bg-[#f5f3f3] transition-colors cursor-pointer shrink-0"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Negotiation Form (Customer & Discount) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-[14px] font-medium text-[#020302] uppercase">Customer Name</label>
                    <input 
                      type="text"
                      value={posBuyerName}
                      onChange={(e) => setPosBuyerName(e.target.value)}
                      className="w-full bg-white border border-[#c7c7bf] px-4 py-2.5 sm:py-3 rounded focus:ring-1 focus:ring-[#020302] focus:border-[#020302] outline-none text-sm sm:text-base font-light text-[#1b1c1c]" 
                      placeholder="Search or add customer..." 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs sm:text-[14px] font-medium text-[#020302] uppercase">Discount</label>
                      <div className="flex bg-[#fbf9f9] border border-[#c7c7bf] rounded p-0.5 shrink-0">
                        <button 
                          type="button"
                          onClick={() => {
                            setPosDiscountType('flat');
                            setPosDiscountValue(0);
                          }}
                          className={`px-3 py-0.5 text-[10px] sm:text-xs font-medium rounded-sm transition-all cursor-pointer
                            ${posDiscountType === 'flat' ? 'bg-[#020302] text-white' : 'text-[#5e5e5d] hover:text-[#020302]'}`}
                        >
                          Tk
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setPosDiscountType('percent');
                            setPosDiscountValue(0);
                          }}
                          className={`px-3 py-0.5 text-[10px] sm:text-xs font-medium rounded-sm transition-all cursor-pointer
                            ${posDiscountType === 'percent' ? 'bg-[#020302] text-white' : 'text-[#5e5e5d] hover:text-[#020302]'}`}
                        >
                          %
                        </button>
                      </div>
                    </div>
                    <div className="relative flex items-center">
                      <input 
                        type="number"
                        value={posDiscountValue || ''}
                        onChange={(e) => setPosDiscountValue(Number(e.target.value))}
                        className="w-full bg-white border border-[#c7c7bf] pl-4 pr-10 py-2.5 sm:py-3 rounded focus:ring-1 focus:ring-[#020302] focus:border-[#020302] outline-none text-sm sm:text-base font-light text-[#1b1c1c] text-right" 
                        placeholder="0" 
                      />
                      <span className="absolute right-4 text-[#5e5e5d] font-normal text-sm shrink-0">
                        {posDiscountType === 'flat' ? 'Tk' : '%'}
                      </span>
                    </div>
                    
                    {/* Quick discount buttons */}
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPosDiscountType('flat');
                          setPosDiscountValue(500);
                        }}
                        className="px-3 py-1.5 bg-[#efeded] text-[#020302] hover:bg-[#e3e2e2] border border-[#c7c7bf] text-[11px] font-bold rounded transition-all active:scale-95 uppercase cursor-pointer font-sans"
                      >
                        -500
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPosDiscountType('flat');
                          setPosDiscountValue(1000);
                        }}
                        className="px-3 py-1.5 bg-[#efeded] text-[#020302] hover:bg-[#e3e2e2] border border-[#c7c7bf] text-[11px] font-bold rounded transition-all active:scale-95 uppercase cursor-pointer font-sans"
                      >
                        -1000
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calculations Summary Section */}
                {(() => {
                  const subtotal = posCart.reduce((sum, item) => sum + (item.overridePrice * item.quantity), 0);
                  let discount = 0;
                  if (posDiscountType === 'flat') {
                    discount = Math.min(subtotal, posDiscountValue);
                  } else {
                    discount = Math.min(subtotal, Math.round(subtotal * (posDiscountValue / 100)));
                  }
                  const grandTotal = subtotal - discount;

                  return (
                    <div className="pt-4 sm:pt-6 border-t border-[#c7c7bf]/30 space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center text-[#5e5e5d]">
                        <span className="text-sm sm:text-base font-light">Subtotal</span>
                        <span className="text-sm sm:text-base font-normal text-[#1b1c1c]">Tk {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#5e5e5d]">
                        <span className="text-sm sm:text-base font-light">Adjustments</span>
                        <span className="text-sm sm:text-base font-normal text-[#ba1a1a]">-Tk {discount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-dashed border-[#c7c7bf]/30">
                        <span className="text-xs sm:text-[14px] font-bold text-[#020302] uppercase tracking-wider">Grand Total</span>
                        <span className="text-xl sm:text-[32px] font-medium text-[#020302] tracking-tight">Tk {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Actions */}
              <div className="px-4 py-4 sm:px-8 sm:py-6 bg-[#efeded] flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 shrink-0 border-t border-[#c7c7bf]/30">
                <div className="flex gap-2 sm:gap-4">
                  <button 
                    type="button"
                    onClick={() => setPosStep(1)}
                    className="flex-1 sm:flex-initial px-6 py-2.5 sm:py-3 bg-white border border-[#c7c7bf] text-[#5e5e5d] text-xs sm:text-sm font-medium hover:border-[#020302] hover:text-[#020302] transition-all uppercase tracking-widest cursor-pointer text-center"
                  >
                    Back
                  </button>
                  <button 
                    type="button"
                    onClick={handleConfirmPOSSale}
                    className="flex-1 sm:flex-initial px-8 py-2.5 sm:py-3 bg-[#020302] text-white text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity uppercase tracking-widest cursor-pointer text-center"
                  >
                    Confirm Sale
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {posStep === 3 && posSuccessData && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="w-full max-w-2xl z-[210] flex flex-col font-sans text-on-surface"
          >
            <div className="bg-[#fbf9f9] w-full max-h-[85vh] sm:max-h-[90vh] md:max-h-[850px] flex flex-col border-t sm:border border-[#c7c7bf] shadow-2xl overflow-hidden">
              
              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-12 flex flex-col items-center text-center">
                {/* Success Icon */}
                <div className="mb-6 w-16 h-16 rounded-full bg-[#efeded] flex items-center justify-center text-[#020302] shrink-0">
                  <CheckCircle2 size={32} className="stroke-[2.5]" />
                </div>

                {/* Header Content */}
                <div className="mb-8 space-y-2 shrink-0">
                  <h1 className="text-xl sm:text-[32px] font-medium tracking-tight text-[#020302]">Sale Recorded Successfully!</h1>
                  <p className="text-xs sm:text-sm text-[#5e5e5d] max-w-md mx-auto">
                    Smartphone stocks have been adjusted live. Branded designer invoice is prepared.
                  </p>
                </div>

                {/* Digital Ticket Section */}
                <div className="w-full max-w-md bg-white border border-[#c7c7bf] p-6 sm:p-8 mb-8 relative overflow-hidden text-left shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-lg">
                  {/* Branding */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center border border-[#c7c7bf] p-1 overflow-hidden shrink-0">
                        <img src="/logo.png" alt="Zenvy Logo" className="w-full h-full object-contain" />
                      </div>
                      <div className="space-y-0.5">
                        <h2 className="text-xs sm:text-[14px] font-bold text-[#020302] uppercase tracking-widest font-sans">{posSuccessData.shopName || "Zenvy Store"}</h2>
                        <p className="text-[10px] sm:text-xs text-[#5e5e5d] font-sans">STOCKNET POS TICKET</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] sm:text-xs text-[#5e5e5d] font-sans">Invoice No</p>
                      <p className="text-xs sm:text-[14px] font-medium text-[#020302] font-sans">{posSuccessData.invoiceNumber}</p>
                    </div>
                  </div>

                  {/* Meta Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b border-[#c7c7bf]/30">
                    <div>
                      <p className="text-[10px] sm:text-xs text-[#5e5e5d]">Date/Time</p>
                      <p className="text-xs sm:text-sm text-[#020302]">{posSuccessData.date} {posSuccessData.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] sm:text-xs text-[#5e5e5d]">Buyer Name</p>
                      <p className="text-xs sm:text-sm text-[#020302] truncate max-w-[150px] ml-auto">{posSuccessData.buyerName}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {posSuccessData.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-start leading-snug">
                        <div className="flex-1 pr-4 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-[#020302] truncate">{item.brand} {item.name}</p>
                          <p className="text-[10px] sm:text-xs text-[#5e5e5d]">{item.color} • {item.specs}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs sm:text-sm text-[#020302] font-medium">{item.quantity} x Tk {item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Summary */}
                  <div className="space-y-2 pt-4 border-t border-dashed border-[#c7c7bf]">
                    <div className="flex justify-between items-center text-[#5e5e5d]">
                      <p className="text-xs sm:text-[14px]">Subtotal</p>
                      <p className="text-xs sm:text-sm font-medium text-[#020302]">Tk {posSuccessData.subtotal.toLocaleString()}</p>
                    </div>
                    {posSuccessData.discount > 0 && (
                      <div className="flex justify-between items-center text-red-500">
                        <p className="text-xs sm:text-[14px]">Applied Discount</p>
                        <p className="text-xs sm:text-sm font-medium">-Tk {posSuccessData.discount.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[#020302] pt-2 border-t border-[#c7c7bf]/10">
                      <p className="text-xs sm:text-[14px] font-bold uppercase tracking-wider">TOTAL VALUE PAID</p>
                      <p className="text-lg sm:text-[24px] font-bold">Tk {posSuccessData.total.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Decorative Bottom Circle Cuts */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 flex justify-between px-1" style={{ transform: "translateY(50%)" }}>
                    <div className="w-3 h-3 rounded-full bg-[#fbf9f9] -mt-1.5"></div>
                    <div className="w-3 h-3 rounded-full bg-[#fbf9f9] -mt-1.5"></div>
                    <div className="w-3 h-3 rounded-full bg-[#fbf9f9] -mt-1.5"></div>
                    <div className="w-3 h-3 rounded-full bg-[#fbf9f9] -mt-1.5"></div>
                    <div className="w-3 h-3 rounded-full bg-[#fbf9f9] -mt-1.5"></div>
                    <div className="w-3 h-3 rounded-full bg-[#fbf9f9] -mt-1.5"></div>
                    <div className="w-3 h-3 rounded-full bg-[#fbf9f9] -mt-1.5"></div>
                    <div className="w-3 h-3 rounded-full bg-[#fbf9f9] -mt-1.5"></div>
                    <div className="w-3 h-3 rounded-full bg-[#fbf9f9] -mt-1.5"></div>
                    <div className="w-3 h-3 rounded-full bg-[#fbf9f9] -mt-1.5"></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full flex flex-col gap-3 sm:gap-4 max-w-md shrink-0">
                  <button 
                    type="button"
                    onClick={handleClose}
                    className="w-full bg-[#020302] text-white py-3 px-6 text-xs sm:text-sm font-bold hover:bg-[#868582] transition-colors duration-200 uppercase tracking-wider cursor-pointer"
                  >
                    Return to Merchant Dashboard
                  </button>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button 
                      type="button"
                      onClick={() => generateBrandedInvoicePDF(posSuccessData)}
                      className="flex-1 flex items-center justify-center gap-2 border border-[#020302] bg-white text-[#020302] py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-bold hover:bg-[#efeded] transition-colors duration-200 uppercase cursor-pointer"
                    >
                      <Receipt size={16} />
                      <span>Print Invoice PDF</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        generateBrandedInvoicePDF(posSuccessData);
                        const textMessage = `Hello ${posSuccessData.buyerName},\n\nThank you for purchasing at ${posSuccessData.shopName || 'Zenvy Store'}!\nHere is your receipt details:\n\n*Invoice No:* ${posSuccessData.invoiceNumber}\n*Date:* ${posSuccessData.date} ${posSuccessData.time}\n\n*Items Purchased:* \n${posSuccessData.items.map((item: any) => `- *${item.brand} ${item.name}* (${item.color} ${item.specs}) x ${item.quantity} units @ Tk ${item.price.toLocaleString()}`).join('\n')}\n\n*Subtotal:* Tk ${posSuccessData.subtotal.toLocaleString()}\n*Discount Applied:* -Tk ${posSuccessData.discount.toLocaleString()}\n*Grand Total:* *Tk ${posSuccessData.total.toLocaleString()}*\n\nYour digital A4 Invoice PDF has been generated offline. Thank you for shopping with us! 🌟`;
                        const encodedText = encodeURIComponent(textMessage);
                        window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
                      }}
                      className="flex-1 text-white flex items-center justify-center gap-2 bg-green-500/90 text-[#020302] py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-bold hover:bg-[#efeded] transition-colors duration-200 uppercase cursor-pointer"
                    >
                      <MessageCircle size={16} />
                      <span>WhatsApp Receipt</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
