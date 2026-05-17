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
  TrendingUp
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
    <div className="min-h-screen bg-[#f5f5f7] font-sans antialiased text-[#1a1c1d] pb-24">
      {/* 1. Cover Photo Banner */}
      <div className="relative h-44 md:h-56 bg-gradient-to-r from-gray-900 via-gray-800 to-black overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-700/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 backdrop-blur-[1px]"></div>
      </div>

      {/* 2. Main Store Profile Container */}
      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-black/[0.03] border border-white">
          {/* Logo Badge Overlay */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-20 md:-mt-24 mb-6">
            <div className="w-24 h-24 rounded-3xl bg-shopify-green border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl font-bold font-serif select-none transform hover:rotate-3 transition-transform">
              {storeName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-shopify-green/10 text-shopify-green text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-full flex items-center gap-1 shadow-sm shadow-shopify-green/5">
                <Sparkles size={11} className="fill-shopify-green" />
                Top Shop
              </span>
              <span className="bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-full flex items-center gap-1">
                <Star size={11} className="fill-amber-500 stroke-none" />
                4.9 (184 reviews)
              </span>
            </div>
          </div>

          {/* Store Profile Info */}
          <div className="space-y-3 text-left">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#1a1c1d] tracking-tight flex items-center gap-2">
              {storeName}
              <Check size={18} className="text-white bg-blue-500 rounded-full p-0.5" />
            </h1>
            <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed">
              {storeDesc || 'Welcome to our premium online smartphone store. View our real-time in-stock catalog below.'}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-gray-50 text-xs text-gray-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-300" />
                Dhaka, Bangladesh
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-gray-300" />
                Live stock updates
              </span>
            </div>
          </div>
        </div>

        {/* 3. Search & Tabs */}
        <div className="mt-8 space-y-6">
          {/* Search Input Box */}
          <div className="relative shadow-md shadow-black/[0.01]">
            <Search size={18} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${storeName}...`}
              className="w-full bg-white py-4 pl-12 pr-4 rounded-2xl text-sm font-medium border border-gray-100 focus:outline-none focus:ring-2 focus:ring-shopify-green/20 focus:border-shopify-green transition-all"
            />
          </div>

          {/* Brands Tabs Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`py-2 px-5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                  selectedBrand === brand 
                    ? 'bg-black text-white shadow-black/10' 
                    : 'bg-white text-gray-500 hover:text-[#1a1c1d] border border-gray-100'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Products Grid */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#1a1c1d] uppercase tracking-wider font-sans">
              All Products ({filteredProducts.length})
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4 stroke-[1.2]" />
              <p className="text-gray-400 font-medium">No in-stock products found matching your filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product) => {
                const isLiked = !!likedProducts[product.id.toString()];
                const activeVariants = product.variants?.filter(v => v.quantity > 0) || [];
                const isOutOfStock = activeVariants.length === 0;
                
                // Set default variant as first in-stock variant, or first overall
                const defaultVariant = activeVariants[0] || product.variants?.[0];

                return (
                  <motion.div 
                    key={product.id}
                    layout
                    className={`bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative flex flex-col ${
                      isOutOfStock ? 'opacity-75' : ''
                    }`}
                  >
                    {/* Image & Badges */}
                    <div className="relative pt-[115%] bg-gray-50 overflow-hidden">
                      <img 
                        src={product.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300&auto=format'} 
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Heart Top-Right Button */}
                      <button 
                        onClick={() => toggleLike(product.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                      >
                        <Heart size={14} className={isLiked ? "fill-red-500 text-red-500" : ""} />
                      </button>

                      {/* Bestseller Left Badge */}
                      {(product.id === 1 || product.id === 3) && (
                        <span className="absolute top-3 left-3 bg-black/85 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg">
                          Bestseller
                        </span>
                      )}

                      {/* Out of Stock Mask */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px] flex items-center justify-center">
                          <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-full shadow-lg">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Card Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.brand}</p>
                        <h3 className="text-[13px] md:text-sm font-bold text-[#1a1c1d] leading-snug line-clamp-1 mt-0.5">{product.name}</h3>
                        
                        {/* Variant Pill Selector (if multiple exist) */}
                        {!isOutOfStock && product.variants && product.variants.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {product.variants.map((v: any) => {
                              const vOutStock = v.quantity === 0;
                              return (
                                <span 
                                  key={v.id}
                                  className={`text-[9px] font-bold py-0.5 px-2 rounded ${
                                    vOutStock 
                                      ? 'bg-gray-100 text-gray-400 line-through' 
                                      : 'bg-shopify-green/5 text-shopify-green border border-shopify-green/10'
                                  }`}
                                >
                                  {v.color} {v.ram}/{v.storage}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Selling Price</p>
                          <p className="text-[13px] md:text-[15px] font-bold text-[#1a1c1d] font-sans">
                            {defaultVariant ? `Tk ${defaultVariant.sellingPrice.toLocaleString()}` : 'Contact Shop'}
                          </p>
                        </div>
                        
                        {!isOutOfStock && defaultVariant && (
                          <a 
                            href={getWhatsAppLink(product, defaultVariant)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-shopify-green hover:bg-shopify-green/90 transition-colors flex items-center justify-center text-white shadow-md shadow-shopify-green/20"
                          >
                            <MessageCircle size={14} className="fill-white stroke-none" />
                          </a>
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

      {/* 5. Sticky Float Merchant WhatsApp Action Bar */}
      <div className="fixed bottom-6 left-0 right-0 z-40 px-4">
        <div className="max-w-md mx-auto">
          <a 
            href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber.replace(/[^0-9+]/g, ''))}&text=${encodeURIComponent(`Hello ${storeName}! I am browsing your public inventory catalog and wanted to inquire about smartphones.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#151516] hover:bg-[#202021] text-white py-4 px-6 rounded-2xl flex items-center justify-between shadow-2xl transition-all border border-white/10 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-shopify-green flex items-center justify-center text-white shadow-lg">
                <MessageCircle size={20} className="fill-white stroke-none" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Direct Hotline</p>
                <p className="text-[13px] font-bold text-white tracking-tight">Chat with store owner</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-shopify-green font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              Ask Queries
              <ChevronRight size={14} />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
