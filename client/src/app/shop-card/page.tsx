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
  User
} from 'lucide-react';
import { Product } from '@/types/zenvy';

export default function PublicShopCard() {
  const [storeName, setStoreName] = useState('Zenvy Store');
  const [storeDesc, setStoreDesc] = useState('Premium Smartphone Distribution Outlet');
  const [phoneNumber, setPhoneNumber] = useState('+8801712345678');
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({});
  const [activeBottomNav, setActiveBottomNav] = useState('Home');

  // Hydrate states from localStorage on public view mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('zenvy_storeName');
      const savedDesc = localStorage.getItem('zenvy_storeDesc');
      const savedPhone = localStorage.getItem('zenvy_phone');
      const savedProducts = localStorage.getItem('zenvy_productList');

      if (savedName) setStoreName(savedName);
      if (savedDesc) setStoreDesc(savedDesc);
      if (savedPhone) setPhoneNumber(savedPhone);
      
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
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    const targetPhone = cleanPhone.startsWith('+') ? cleanPhone : `+880${cleanPhone.replace(/^0/, '')}`;
    const text = `Hello ${storeName}! I saw your public inventory catalog and am interested in: \n\n*${product.brand} ${product.name}*\nVariant: ${selectedVariant.color} (${selectedVariant.ram}/${selectedVariant.storage})\nPrice: Tk ${selectedVariant.sellingPrice.toLocaleString()}\n\nIs this variant still available for purchase? Thank you!`;
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
      <div className="relative h-64 md:h-80 bg-gray-100 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1200&auto=format" 
          alt="Store Banner"
          className="w-full h-full object-cover"
        />
        
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
            <div className="grid grid-cols-2 gap-x-4 gap-y-8">
              {filteredProducts.map((product) => {
                const isLiked = !!likedProducts[product.id.toString()];
                const activeVariants = product.variants?.filter(v => v.quantity > 0) || [];
                const isOutOfStock = activeVariants.length === 0;
                const defaultVariant = activeVariants[0] || product.variants?.[0];

                return (
                  <motion.div 
                    key={product.id}
                    layout
                    className={`flex flex-col text-left group cursor-pointer ${
                      isOutOfStock ? 'opacity-70' : ''
                    }`}
                  >
                    {/* Image Panel with rounded-2xl */}
                    <div className="relative pt-[115%] bg-[#f8f9fa] rounded-2xl overflow-hidden mb-3.5 shadow-xs border border-gray-100">
                      <img 
                        src={product.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300&auto=format'} 
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Heart Top-Right Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(product.id);
                        }}
                        className="absolute top-3.5 right-3.5 z-10 active:scale-90 transition-transform"
                      >
                        {isLiked ? (
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <Heart size={14} className="fill-red-500 text-red-500" />
                          </div>
                        ) : (
                          <Heart size={20} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] stroke-[2]" />
                        )}
                      </button>

                      {/* Bestseller Badge (Top-Left Rectangular) */}
                      {(product.id === 1 || product.id === 3) && (
                        <span className="absolute top-3.5 left-3.5 bg-white text-black text-[10px] font-medium py-1 px-2.5 rounded-sm shadow-xs tracking-wide">
                          Bestseller
                        </span>
                      )}

                      {/* Out of Stock Overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-full shadow-md">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {/* White circular floating plus (+) button on bottom right */}
                      {!isOutOfStock && defaultVariant && (
                        <a 
                          href={getWhatsAppLink(product, defaultVariant)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-3.5 right-3.5 w-9 h-9 bg-white rounded-full flex items-center justify-center text-black shadow-lg hover:bg-gray-50 active:scale-90 transition-all z-10"
                        >
                          <span className="text-xl font-light leading-none">+</span>
                        </a>
                      )}
                    </div>

                    {/* Flat details below image */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">
                        {product.brand}
                      </p>
                      <h3 className="text-[13.5px] font-light text-gray-800 leading-snug line-clamp-1">
                        {product.name}
                      </h3>
                      
                      {/* Price Section */}
                      <div className="flex items-baseline gap-1.5 pt-0.5">
                        <span className="text-[14px] font-medium text-black">
                          {defaultVariant ? `৳${defaultVariant.sellingPrice.toLocaleString()}` : 'Contact Shop'}
                        </span>
                        {product.id === 1 && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ৳42,000
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 6. Faire Curated Footer Tag */}
      <div className="mt-20 py-8 border-t border-gray-100 flex flex-col items-center justify-center gap-1.5 text-xs text-gray-400 select-none">
        <div className="flex items-center gap-1">
          <span className="font-serif font-black tracking-widest uppercase text-gray-500 text-[10px]">FAIRE</span>
          <span>|</span>
          <span className="font-light">curated by Zenvy</span>
        </div>
        <p className="text-[10px] font-light text-gray-300">Live Inventory Catalog Hub</p>
      </div>

      {/* 7. Merchant WhatsApp hotline query bar */}
      <div className="fixed bottom-20 left-0 right-0 z-40 px-5">
        <div className="max-w-md mx-auto">
          <a 
            href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber.replace(/[^0-9+]/g, ''))}&text=${encodeURIComponent(`Hello ${storeName}! I am browsing your public inventory catalog and wanted to inquire about smartphones.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#111112] hover:bg-[#1a1a1b] text-white py-3.5 px-5 rounded-2xl flex items-center justify-between shadow-2xl transition-all border border-white/10 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-shopify-green flex items-center justify-center text-white shadow-lg">
                <MessageCircle size={18} className="fill-white stroke-none" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider leading-none">Direct Hotline</p>
                <p className="text-[13px] font-medium text-white tracking-tight mt-1">Inquire to Store Owner</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-shopify-green font-medium uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
              Ask Queries
              <ChevronRight size={13} />
            </div>
          </a>
        </div>
      </div>

      {/* 8. Sticky Bottom Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2.5 px-6 flex items-center justify-between z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
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
      </div>
    </div>
  );
}
