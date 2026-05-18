"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Star, 
  MessageCircle, 
  ShoppingBag, 
  Heart,
  Sparkles, 
  Check, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  MoreVertical,
  ChevronLeft,
  SlidersHorizontal,
  Home,
  Package,
  User,
  X
} from 'lucide-react';
import { Product } from '@/types/zenvy';

export default function PublicShopCard() {
  const [storeName, setStoreName] = useState('Zenvy Store');
  const [storeDesc, setStoreDesc] = useState('Premium Smartphone Distribution Outlet');
  const [phoneNumber, setPhoneNumber] = useState('+8801712345678');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({});
  const [activeBottomNav, setActiveBottomNav] = useState('Home');
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);

  // Hydrate states from localStorage on public view mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('zenvy_storeName');
      const savedDesc = localStorage.getItem('zenvy_storeDesc');
      const savedPhone = localStorage.getItem('zenvy_phone');
      const savedWhatsApp = localStorage.getItem('zenvy_whatsAppNumber');
      const savedProducts = localStorage.getItem('zenvy_productList');

      if (savedName) setStoreName(savedName);
      if (savedDesc) setStoreDesc(savedDesc);
      if (savedPhone) setPhoneNumber(savedPhone);
      if (savedWhatsApp) setWhatsAppNumber(savedWhatsApp);
      
      if (savedProducts) {
        try {
          setProducts(JSON.parse(savedProducts));
        } catch (e) {
          console.error(e);
        }
      } else {
        // Fallback default mock products if no localStorage exists
        const defaultMock = [
          { 
            id: 1, 
            name: "Galaxy A35 5G", 
            brand: "Samsung",
            stock: 19, 
            status: 'Published', 
            image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=300&auto=format',
            lowStockThreshold: 5,
            description: "Samsung Galaxy A35 5G features a premium glass back, standard 120Hz Super AMOLED display.",
            variants: [
              { id: 'v1_1', color: 'Blue', ram: '8GB', storage: '256GB', quantity: 4, buyingPrice: 32000, sellingPrice: 38500 },
              { id: 'v1_2', color: 'Black', ram: '8GB', storage: '128GB', quantity: 15, buyingPrice: 28000, sellingPrice: 34000 }
            ]
          },
          { 
            id: 2, 
            name: "Redmi Note 13 Pro", 
            brand: "Xiaomi",
            stock: 14, 
            status: 'Published', 
            image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=300&auto=format',
            lowStockThreshold: 4,
            description: "Redmi Note 13 Pro boasts an ultra-clear 200MP camera with OIS.",
            variants: [
              { id: 'v2_1', color: 'Forest Green', ram: '8GB', storage: '256GB', quantity: 12, buyingPrice: 24000, sellingPrice: 29500 },
              { id: 'v2_2', color: 'Ocean Blue', ram: '12GB', storage: '512GB', quantity: 2, buyingPrice: 29000, sellingPrice: 35000 }
            ]
          },
          { 
            id: 3, 
            name: "iPhone 15 Pro Max", 
            brand: "Apple",
            stock: 9, 
            status: 'Published', 
            image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=300&auto=format',
            variants: [
              { id: 'v3_1', color: 'Natural Titanium', ram: '8GB', storage: '256GB', quantity: 8, buyingPrice: 125000, sellingPrice: 145000 }
            ]
          }
        ];
        setProducts(defaultMock as any);
      }
    }
  }, []);

  const toggleLike = (id: string | number) => {
    const key = id.toString();
    setLikedProducts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getWhatsAppLink = (product: Product, selectedVariant: any) => {
    const activeNumber = whatsAppNumber || phoneNumber;
    const cleanPhone = activeNumber.replace(/[^0-9+]/g, '');
    const targetPhone = cleanPhone.startsWith('+') ? cleanPhone : `+880${cleanPhone.replace(/^0/, '')}`;
    const text = `Hello ${storeName}! I saw your public inventory catalog and am interested in: \n\n*${product.brand} ${product.name}*\nVariant: ${selectedVariant.color} (${selectedVariant.ram}/${selectedVariant.storage})\nPrice: Tk ${selectedVariant.sellingPrice.toLocaleString()}\n\nIs this variant still available for purchase? Thank you!`;
    return `https://api.whatsapp.com/send?phone=${encodeURIComponent(targetPhone)}&text=${encodeURIComponent(text)}`;
  };

  const getWhatsAppInquiryLink = (product: Product, selectedVariant: any) => {
    const activeNumber = whatsAppNumber || phoneNumber;
    const cleanPhone = activeNumber.replace(/[^0-9+]/g, '');
    const targetPhone = cleanPhone.startsWith('+') ? cleanPhone : `+880${cleanPhone.replace(/^0/, '')}`;
    const text = `ভাই ${product.brand} ${product.name} ${selectedVariant.color} ${selectedVariant.ram}/${selectedVariant.storage} available?`;
    return `https://api.whatsapp.com/send?phone=${encodeURIComponent(targetPhone)}&text=${encodeURIComponent(text)}`;
  };

  // Extract unique brands for filter tabs
  const brands = ['All', ...Array.from(new Set(products.map(p => p.brand || '').filter(Boolean)))];

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.brand || '').toLowerCase().includes(search.toLowerCase());
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    return matchesSearch && matchesBrand && p.status !== 'Draft';
  });

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-[#333333] pb-28">
      {/* 1. Tall Lifestyle Ambient Cover Photo Banner */}
      <div className="relative h-30 md:h-40 bg-gray-100 overflow-hidden">
        {/* <img 
          src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1200&auto=format" 
          alt="Store Banner"
          className="w-full h-full object-cover"
        /> */}
        
        {/* Transparent Action Buttons Floating on Cover Photo */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black shadow-md hover:bg-gray-50 active:scale-95 transition-all">
            <ChevronLeft size={20} className="stroke-[2.5]" />
          </button>
          
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black shadow-md hover:bg-gray-50 active:scale-95 transition-all">
              <Heart size={16} className="stroke-[2]" />
            </button>
            <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black shadow-md hover:bg-gray-50 active:scale-95 transition-all">
              <MoreVertical size={16} className="stroke-[2]" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Store Profile Container */}
      <div className="max-w-2xl mx-auto px-5 relative z-10">
        
        {/* Spinning Circular Custom Royal Seal Overlap Logo */}
        <div className="w-24 h-24 rounded-full bg-[#002f6c] border-4 border-white shadow-xl flex items-center justify-center relative -mt-12 ml-1 z-20 overflow-hidden select-none">
          <svg viewBox="0 0 100 100" className="w-full h-full p-1 animate-[spin_25s_linear_infinite]">
            <path id="textPath" d="M 20,50 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0" fill="none" />
            <text className="text-[7.5px] font-bold fill-white tracking-[0.18em] uppercase">
              <textPath href="#textPath" startOffset="50%" textAnchor="middle">
                {storeName} · EST. 2026 ·
              </textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={22} className="text-white fill-white/10" />
          </div>
        </div>

        {/* Store Profile Info - Left Aligned */}
        <div className="mt-5 space-y-2.5 text-left">
          <h1 className="text-[25px] font-medium text-[#1a1c1d] tracking-tight flex items-center gap-1.5 cursor-pointer hover:opacity-90">
            {storeName}
            <ChevronRight size={22} className="text-gray-400 stroke-[1.8] inline-block align-middle" />
          </h1>
          
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[13px] text-gray-600 font-light">
            <span className="bg-gray-100 text-gray-800 text-[11px] font-medium py-0.5 px-2 rounded-xs flex items-center gap-1">
              <Award size={12} className="text-gray-700" />
              Top Shop
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1 font-medium text-gray-800">
              <Star size={13} className="fill-black stroke-none" />
              4.9 (152 reviews)
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#22c55e] bg-[#f0fdf4] py-0.5 px-2.5 rounded-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
              </span>
              Updated 2 minutes ago
            </span>
          </div>

          <div className="text-[13px] text-gray-600 font-light space-y-1">
            <p>৳0 minimum <span className="text-gray-300 mx-1">·</span> Dhaka, Bangladesh</p>
            <p className="text-gray-500">
              Get live stock updates <span className="text-gray-300 mx-1">·</span> <span className="underline cursor-pointer font-medium text-black">Store details</span>
            </p>
          </div>
        </div>

        {/* 3. Search Input Box - Grey Pill Style */}
        <div className="mt-6">
          <div className="relative">
            <Search size={18} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 stroke-[1.5]" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${storeName}`}
              className="w-full bg-[#f6f6f7] py-3.5 pl-12 pr-4 rounded-full text-[13.5px] font-light border border-transparent focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-[#333333]"
            />
          </div>
        </div>

        {/* 4. Category Tabs Navigation - Text Underline Style */}
        <div className="mt-6 border-b border-gray-200">
          <div className="flex gap-6 overflow-x-auto pb-0 scrollbar-hide -mx-5 px-5">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`py-3 text-[14.5px] font-light whitespace-nowrap relative transition-colors ${
                  selectedBrand === brand 
                    ? 'text-black font-medium' 
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {brand}
                {selectedBrand === brand && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Products Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-medium text-[#1a1c1d]">
              All products
            </h2>
            <button className="w-9 h-9 rounded-full bg-[#f6f6f7] flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition-all">
              <SlidersHorizontal size={14} className="stroke-[2]" />
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3 stroke-[1.2]" />
              <p className="text-gray-400 font-light text-sm">No in-stock products found matching your filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredProducts.map((product) => {
                const isLiked = !!likedProducts[product.id.toString()];
                const activeVariants = product.variants?.filter(v => v.quantity > 0) || [];
                const isOutOfStock = activeVariants.length === 0;
                const defaultVariant = activeVariants[0] || product.variants?.[0];
                const totalStock = activeVariants.reduce((sum, v) => sum + v.quantity, 0);

                return (
                  <motion.div 
                    key={product.id}
                    layout
                    className={`group flex flex-col bg-white hover:border-[#020302] border-b border-gray-600 overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-300 text-left ${
                      isOutOfStock ? 'opacity-70' : ''
                    }`}
                  >
                    {/* Image Container with aspect-[5/5] */}
                    <div className="aspect-[5/5] relative overflow-hidden bg-[#f5f3f3]">
                      <img 
                        src={product.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300&auto=format'} 
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Heart Top-Right Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(product.id);
                        }}
                        className="absolute top-4 right-4 bg-white/85 backdrop-blur-md p-2 rounded-full hover:bg-white shadow-xs transition-all z-10 active:scale-90"
                      >
                        <Heart 
                          size={14} 
                          className={isLiked ? "fill-[#ba1a1a] text-[#ba1a1a]" : "text-[#5e5e5d] stroke-[2]"} 
                        />
                      </button>

                      {/* Dynamic Badging */}
                      {isOutOfStock ? (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="bg-[#ba1a1a] text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-full shadow-md">
                            Out of Stock
                          </span>
                        </div>
                      ) : (
                        <>
                          {/* Bestseller Badge */}
                          {product.id === 1 && (
                            <div className="absolute top-4 left-4 bg-[#020302] text-white text-[9px] px-2.5 py-1 rounded-sm font-bold uppercase tracking-wider">
                              Bestseller
                            </div>
                          )}
                          
                          {/* New Arrival Badge */}
                          {(product.id === 2 || product.id === 3) && (
                            <div className="absolute top-4 left-4 bg-[#020302] text-white text-[9px] px-2.5 py-1 rounded-sm font-bold uppercase tracking-wider">
                              New Arrival
                            </div>
                          )}
                        </>
                      )}

                      {/* White circular floating plus (+) button on bottom right */}
                      {!isOutOfStock && defaultVariant && (
                        <a 
                          href={getWhatsAppLink(product, defaultVariant)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center text-black shadow-lg hover:bg-gray-50 active:scale-90 transition-all z-10 border border-[#efeded]"
                        >
                          <span className="text-xl font-light leading-none">+</span>
                        </a>
                      )}
                    </div>

                    {/* Details Container with p-5 padding */}
                    <div className="p-5 flex flex-col gap-2.5 flex-grow justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <p className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-widest leading-none">
                            {product.brand}
                          </p>
                          
                          {/* Symmetrical dynamic urgency alerts */}
                          {totalStock > 0 && totalStock <= 3 && (
                            <span className="text-[9px] font-bold text-[#ba1a1a] bg-[#fdf2f2] px-1.5 py-0.5 rounded-xs leading-none">
                              ⚠️ Only {totalStock} left
                            </span>
                          )}
                          {product.id === 3 && totalStock > 3 && (
                            <span className="text-[9px] font-bold text-[#002f6c] bg-[#e6f0fa] px-1.5 py-0.5 rounded-xs leading-none">
                              ✨ Recently added
                            </span>
                          )}
                        </div>
                        <h3 className="text-[16px] font-light text-[#020302] group-hover:text-neutral-700 transition-colors tracking-tight leading-snug line-clamp-1 mt-0.5">
                          {product.name}
                        </h3>
                      </div>

                      {/* Price Section */}
                      <p className="text-[14px] font-bold text-[#020302] tracking-tight leading-none">
                        {(() => {
                          const prices = product.variants?.map(v => v.sellingPrice) || [];
                          if (prices.length === 0) return 'MSRP N/A';
                          const min = Math.min(...prices);
                          const max = Math.max(...prices);
                          return min === max ? `৳${min.toLocaleString()}` : `৳${min.toLocaleString()} - ৳${max.toLocaleString()}`;
                        })()}
                      </p>

                      {/* Variant Pills Section */}
                      {product.variants && product.variants.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-[#efeded]">
                          {product.variants.map((variant) => (
                            <span 
                              key={variant.id} 
                              className="text-[12px] text-[#5e5e5d] px-2 py-0.5 bg-[#f5f3f3] border border-[#c7c7bf]/50 font-medium"
                            >
                              {variant.color} {variant.ram.replace('GB', '')}/{variant.storage.replace('GB', '')}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* One-tap WhatsApp inquiry button */}
                      {!isOutOfStock && defaultVariant && (
                        <a
                          href={getWhatsAppInquiryLink(product, defaultVariant)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-3 w-full py-2 bg-[#020302] hover:bg-neutral-800 text-white text-center text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all select-none border border-transparent"
                        >
                          <MessageCircle size={13} className="fill-white stroke-none" />
                          Ask if available
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 6. Curated Footer Tag */}
      <div className="mt-20 py-8 border-t border-gray-100 flex flex-col items-center justify-center gap-1.5 text-xs text-gray-400 select-none">
        <div className="flex items-center gap-1">
          <span className="font-serif font-black tracking-widest uppercase text-gray-500 text-[10px]">{storeName}</span>
          <span>|</span>
          <span className="font-light">curated by Zenvy</span>
        </div>
        <p className="text-[10px] font-light text-gray-300">Live Inventory Catalog Hub</p>
      </div>

      {/* 7. Merchant WhatsApp hotline query bar */}
      <div className="fixed bottom-5 right-0 z-40 px-5">
        <div className="max-w-[180px] mx-auto">
          <a 
            href={`https://api.whatsapp.com/send?phone=${encodeURIComponent((whatsAppNumber || phoneNumber).replace(/[^0-9+]/g, ''))}&text=${encodeURIComponent(`Hello ${storeName}! I am browsing your public inventory catalog and wanted to inquire about smartphones.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#111112] hover:bg-[#1a1a1b] text-white py-1.5 px-3 rounded-2xl flex items-center justify-between shadow-2xl transition-all border border-white/10 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-shopify-green flex items-center justify-center text-white shadow-lg">
                <MessageCircle size={18} className="fill-white stroke-none" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider leading-none">Chat with</p>
                <p className="text-[13px] font-medium text-white tracking-tight mt-1">Store Owner</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* 8. Sticky Bottom Mobile Navigation Bar */}
      {/* <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2.5 px-6 flex items-center justify-between z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => setActiveBottomNav('Home')}
          className={`flex flex-col items-center gap-1 ${activeBottomNav === 'Home' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Home size={20} className={activeBottomNav === 'Home' ? 'stroke-[2.5]' : 'stroke-[1.5]'} />
          <span className="text-[9.5px] font-light leading-none">Home</span>
        </button>

        <button 
          onClick={() => setActiveBottomNav('Browse')}
          className={`flex flex-col items-center gap-1 ${activeBottomNav === 'Browse' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Search size={20} className={activeBottomNav === 'Browse' ? 'stroke-[2.5]' : 'stroke-[1.5]'} />
          <span className="text-[9.5px] font-light leading-none">Browse</span>
        </button>

        <button 
          onClick={() => setActiveBottomNav('Cart')}
          className={`flex flex-col items-center gap-1 ${activeBottomNav === 'Cart' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <ShoppingBag size={20} className={activeBottomNav === 'Cart' ? 'stroke-[2.5]' : 'stroke-[1.5]'} />
          <span className="text-[9.5px] font-light leading-none">Cart</span>
        </button>

        <button 
          onClick={() => setActiveBottomNav('Orders')}
          className={`flex flex-col items-center gap-1 ${activeBottomNav === 'Orders' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Package size={20} className={activeBottomNav === 'Orders' ? 'stroke-[2.5]' : 'stroke-[1.5]'} />
          <span className="text-[9.5px] font-light leading-none">Orders</span>
        </button>

        <button 
          onClick={() => setActiveBottomNav('Profile')}
          className={`flex flex-col items-center gap-1 ${activeBottomNav === 'Profile' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <User size={20} className={activeBottomNav === 'Profile' ? 'stroke-[2.5]' : 'stroke-[1.5]'} />
          <span className="text-[9.5px] font-light leading-none">Profile</span>
        </button>
      </div> */}
      {/* 9. Symmetrical Variant Selection Inquiry Modal (Exactly as Requested!) */}
      <AnimatePresence>
        {inquiryProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInquiryProduct(null)}
              className="absolute inset-0 bg-[#020302]/60 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative w-full max-w-sm bg-white border-2 border-black p-6 flex flex-col gap-4.5 shadow-[8px_8px_0px_rgba(0,0,0,1)] z-10 text-left rounded-none"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-widest leading-none">
                    {inquiryProduct.brand}
                  </p>
                  <h3 className="text-lg font-bold text-[#020302] tracking-tight leading-snug">
                    {inquiryProduct.name}
                  </h3>
                </div>
                <button
                  onClick={() => setInquiryProduct(null)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black cursor-pointer"
                >
                  <X size={16} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Title Section */}
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                  Select Variant to Inquire
                </p>
                <p className="text-[12px] text-gray-500 font-light leading-relaxed">
                  Choose the specific variant you wish to ask about on WhatsApp:
                </p>
              </div>

              {/* Variants List */}
              <div className="flex flex-col gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                {inquiryProduct.variants?.map((variant) => {
                  const hasStock = variant.quantity > 0;
                  return (
                    <a
                      key={variant.id}
                      href={getWhatsAppInquiryLink(inquiryProduct, variant)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setInquiryProduct(null)}
                      className={`flex items-center justify-between p-3.5 border border-gray-200 hover:border-black bg-white hover:bg-gray-50 transition-all group ${
                        !hasStock ? "opacity-40 pointer-events-none" : ""
                      }`}
                    >
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-[13.5px] font-bold text-black leading-none">
                          {variant.color} · {variant.ram.replace('GB', '')}/{variant.storage.replace('GB', '')}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 leading-none">
                          <span className="text-[12.5px] font-bold text-black">
                            ৳{variant.sellingPrice.toLocaleString()}
                          </span>
                          <span className="text-gray-300 text-[10px]">|</span>
                          {variant.quantity <= 3 ? (
                            <span className="text-[9.5px] font-bold text-[#ba1a1a]">
                              Only {variant.quantity} left
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-semibold text-[#22c55e]">
                              In Stock ({variant.quantity})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#f6f6f7] group-hover:bg-[#22c55e] flex items-center justify-center text-gray-500 group-hover:text-white transition-all">
                        <MessageCircle size={14} className="fill-current stroke-none" />
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Footer Notice */}
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-[10.5px] text-gray-400 font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
                Instantly opens WhatsApp with dynamic pre-filled text.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
