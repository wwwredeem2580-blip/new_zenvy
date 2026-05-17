"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Bell, 
  Home, 
  Package, 
  Tag as TagIcon, 
  MoreHorizontal,
  Plus,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Layers,
  Filter,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from 'lucide-react';
import { useZenvy } from '@/context/ZenvyContext';
import { SidebarSection, SidebarItem, SidebarSubItem, NavItem } from '@/components/SidebarComponents';
import NewProductScreen from '@/components/NewProductScreen';
import { Product } from '@/types/zenvy';

export default function DashboardPage() {
  const { storeName } = useZenvy();
  const [activeTab, setActiveTab] = useState('Home');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeProductFilter, setActiveProductFilter] = useState('All');
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [productList, setProductList] = useState<Product[]>([
    { id: 1, name: "Mountain Bike XT-200 | Professional Grade Racing Component", stock: 12, status: 'Published', image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=200&auto=format' },
    { id: 2, name: "Cycling Helmet Pro (Matte Black Edition)", stock: 45, status: 'Published', image: 'https://images.unsplash.com/photo-1544133782-00994967396c?q=80&w=200&auto=format' },
    { id: 3, name: "Leather Saddle S3 - Ergonomic Touring", stock: 0, status: 'Draft', image: 'https://images.unsplash.com/photo-1510211513233-a8ef8e367464?q=80&w=200&auto=format' },
    { id: 4, name: "Carbon Fiber Frame Set 54cm", stock: 3, status: 'Published', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=200&auto=format' },
    { id: 5, name: "Wireless Bike Computer with GPS Tracking", stock: 24, status: 'Published', image: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?q=80&w=200&auto=format' },
    { id: 6, name: "Test Product - Gold Edition", stock: 8, status: 'Published', image: 'https://images.unsplash.com/photo-1512412086892-424a12e140ef?q=80&w=200&auto=format' },
  ]);

  const steps = [
    { label: "Add your first product", completed: isCreatingProduct || productList.length > 6, onClick: () => setIsCreatingProduct(true) },
    { label: "Add a custom domain", completed: false },
    { label: "Customize your online store", completed: false },
    { label: "Set your shipping rates", completed: false },
    { label: "Name your store", completed: true },
    { label: "Set up Shopify Payments", completed: false },
  ];

  const handleProductAdded = (newProduct: Product) => {
    setProductList([newProduct, ...productList]);
    setShowSuccessOverlay(true);
    setIsCreatingProduct(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen bg-[#f6f6f7] font-sans overflow-hidden"
    >
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-full p-6 pb-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="w-9 h-9 bg-shopify-green rounded-xl flex items-center justify-center shadow-lg shadow-shopify-green/20">
            <span className="font-bold text-white text-xs">
               {storeName ? storeName.substring(0, 2).toUpperCase() : 'ZN'}
            </span>
          </div>
          <h2 className="text-lg font-sans font-bold text-[#1a1c1d] tracking-tight">{storeName ? storeName : 'My Store'}</h2>
        </div>

        {/* Desktop Search Bar */}
        <div className="relative mb-8 pt-2">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={16} strokeWidth={2.5} />
          </div>
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-[#f6f6f7] py-2.5 pl-10 pr-10 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all border-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border border-gray-200 rounded text-[9px] font-bold text-gray-400 bg-white">
            ⌘ K
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto -mx-2 px-2">
          <SidebarSection title="General">
            <SidebarItem icon={Home} label="Home" active={activeTab === 'Home'} onClick={() => setActiveTab('Home')} />
            <SidebarItem icon={TagIcon} label="Products" active={activeTab === 'Products'} onClick={() => setActiveTab('Products')} hasMore />
            <SidebarItem icon={Package} label="Orders" active={activeTab === 'Orders'} onClick={() => setActiveTab('Orders')} badge="12" />
          </SidebarSection>

          <SidebarSection title="Favorites" collapsible defaultOpen>
            <SidebarSubItem label="Sales analytics" />
            <SidebarSubItem label="Inventory reports" />
          </SidebarSection>

          <SidebarSection title="Management">
            <SidebarItem icon={Bell} label="Notifications" onClick={() => {}} />
            <SidebarItem icon={Search} label="Analytics" onClick={() => {}} hasMore />
            <SidebarItem icon={MoreHorizontal} label="Settings" onClick={() => {}} />
          </SidebarSection>
        </nav>

        {/* User Profile Mini */}
        <div className="py-6 border-t border-gray-50 -mx-6 px-6 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-50 flex items-center justify-center text-gray-400">
              <Plus size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
               <p className="text-sm font-bold text-[#1a1c1d] truncate">{storeName || 'My Store'}</p>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Premium Plan</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {isCreatingProduct ? (
          <NewProductScreen 
            onBack={() => setIsCreatingProduct(false)} 
            onSuccess={handleProductAdded}
          />
        ) : (
          <>
            {/* Success Overlay */}
            <AnimatePresence>
              {showSuccessOverlay && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-serif font-black text-[#1a1c1d] mb-2">Product Added!</h2>
                    <p className="text-gray-500 mb-8 font-medium">Your new product is live and ready for customers.</p>
                    <div className="space-y-3">
                      <button 
                        onClick={() => {
                          setShowSuccessOverlay(false);
                          setIsCreatingProduct(true);
                        }}
                        className="w-full py-4 bg-[#5438ff] text-white rounded-xl font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                      >
                        Add Another Product
                      </button>
                      <button 
                        onClick={() => {
                          setShowSuccessOverlay(false);
                          setActiveTab('Products');
                        }}
                        className="w-full py-4 bg-gray-50 text-gray-500 rounded-xl font-bold border border-gray-100 hover:bg-gray-100 transition-all"
                      >
                        Go to Inventory
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <header className="bg-white px-4 md:px-8 pt-12 md:pt-8 pb-4 flex items-center justify-between sticky top-0 z-10 border-b lg:border-none border-gray-100">
              <div className="lg:hidden w-8 h-8 bg-shopify-green rounded-lg flex items-center justify-center font-bold text-white text-[12px]">
                {storeName ? storeName.substring(0, 2).toUpperCase() : 'MS'}
              </div>
              <h1 className="text-lg md:text-xl font-sans font-semibold text-[#1a1c1d] md:font-serif md:text-2xl lg:text-3xl">
                {activeTab}
              </h1>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center bg-[#f6f6f7] px-3 py-1.5 rounded-full text-xs font-bold text-gray-500 border border-gray-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-shopify-green mr-2 animate-pulse"></span>
                  LIVE STORE
                </div>
                <button className="p-2 hover:bg-gray-50 rounded-full transition-colors relative">
                   <Bell size={22} className="text-[#1a1c1d] stroke-[1.5]" />
                   <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 md:px-10 py-6 scroll-smooth">
              <div className="w-full max-w-5xl mx-auto">
                {activeTab === 'Home' && (
                  <div className="space-y-6">
                    <div className="lg:hidden relative">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 stroke-[2]" />
                      <input 
                        type="text" 
                        placeholder="Go to..." 
                        className="w-full bg-[#eeeeef] py-3.5 pl-12 pr-4 rounded-xl text-[15px] border-none outline-none text-gray-500 font-medium"
                      />
                    </div>

                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="bg-white p-4 md:p-6  border border-gray-100 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-1">
                           <div className="w-8 h-8 rounded-full border-2 border-white bg-shopify-green flex items-center justify-center">
                              <Sparkles size={14} className="text-white fill-white" />
                           </div>
                        </div>
                        <div>
                           <p className="text-[14px] md:text-base font-bold text-[#1a1c1d]">Special promotion active</p>
                           <p className="text-[12px] md:text-sm text-gray-400 font-medium">Select a plan to get your first month for $1.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="hidden md:inline text-xs font-bold text-[#1a1c1d] hover:underline uppercase tracking-wider">Details</span>
                         <ChevronRight size={18} className="text-gray-400" />
                      </div>
                    </motion.div>

                    {/* Summary Stats Grid */}
                    <div className="bg-white border border-gray-100 overflow-hidden">
                      <div className="p-4 px-6 flex items-center justify-between border-b border-gray-100">
                        <span className="text-[14px] font-bold text-[#1a1c1d] tracking-tight">Summary</span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4">
                        {/* Stat 1: Total products in stock */}
                        <div className="p-6 border-r border-b border-gray-100 md:border-b-0">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Products in stock</p>
                          <div className="flex items-baseline justify-between">
                            <span className="text-xl md:text-2xl font-bold font-sans text-[#1a1c1d]">124</span>
                            <span className="flex items-center text-[9px] md:text-[11px] font-bold text-green-500 gap-0.5">
                              <ArrowUpRight size={12} className="stroke-[2.5]" />
                              <span>+8.2%</span>
                            </span>
                          </div>
                        </div>

                        {/* Stat 2: Total stock value in BDT */}
                        <div className="p-6 border-b border-gray-100 md:border-b-0 md:border-r">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Stock value</p>
                          <div className="flex items-baseline justify-between">
                            <span className="text-xl md:text-2xl font-bold font-sans text-[#1a1c1d]">
                              <span className="text-gray-600 font-normal mr-1">৳</span>42,800
                            </span>
                            <span className="flex items-center text-[9px] md:text-[11px] font-bold text-green-500 gap-0.5">
                              <ArrowUpRight size={12} className="stroke-[2.5]" />
                              <span>+12.4%</span>
                            </span>
                          </div>
                        </div>

                        {/* Stat 3: Units sold this month */}
                        <div className="p-6 border-r border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Units sold this month</p>
                          <div className="flex items-baseline justify-between">
                            <span className="text-xl md:text-2xl font-bold font-sans text-[#1a1c1d]">86</span>
                            <span className="flex items-center text-[9px] md:text-[11px] font-bold text-green-500 gap-0.5">
                              <ArrowUpRight size={12} className="stroke-[2.5]" />
                              <span>+15.1%</span>
                            </span>
                          </div>
                        </div>

                        {/* Stat 4: Revenue this month */}
                        <div className="p-6">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Revenue this month</p>
                          <div className="flex items-baseline justify-between">
                            <span className="text-xl md:text-2xl font-bold font-sans text-[#1a1c1d]">
                              <span className="text-gray-600 font-normal mr-1">৳</span>28,450
                            </span>
                            <span className="flex items-center text-[9px] md:text-[11px] font-bold text-green-500 gap-0.5">
                              <ArrowUpRight size={12} className="stroke-[2.5]" />
                              <span>+22.3%</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Running Low Warning Section */}
                    <div className="bg-brand-card p-6 border border-brand-divider rounded-3xl flex flex-col gap-5 relative overflow-hidden">
                      {/* Top Header */}
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={15} className="text-primary-500 stroke-[2.5]" />
                        <h4 className="text-[12px] font-bold text-brand-700 uppercase tracking-wider font-sans">Running Low</h4>
                      </div>
                      
                      {/* Middle Section: Image + Text */}
                      <div className="flex items-start md:items-center gap-4">
                        {/* Product Image */}
                        <div className="w-12 h-12 rounded-xl border border-brand-divider overflow-hidden flex-shrink-0 bg-white">
                          <img 
                            src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=120&auto=format&fit=crop&q=80" 
                            alt="CozyCotton Hoodie" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        
                        <p className="text-neutral-700 text-[13px] md:text-[14px] leading-relaxed">
                          Our <span className="text-neutral-900 font-bold hover:underline cursor-pointer">CozyCotton Hoodie</span> is <span className="text-warning-700 font-medium">running low on stock</span>. Reorder soon to avoid stockouts, with only <span className="whitespace-nowrap inline-block bg-warning-50 text-warning-800 px-2 py-0.5 rounded-lg font-bold text-[11px] border border-warning-200">4 units left</span>.
                        </p>
                      </div>
                      
                      {/* Bottom Action Buttons */}
                      <div className="flex items-center gap-2.5">
                        <button className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-neutral-0 rounded-md text-[12px] font-bold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm">
                          Restock Product
                        </button>
                        <button className="px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-md text-[12px] font-bold transition-all hover:scale-[1.01] active:scale-[0.99]">
                          Ignore
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div className="bg-brand-card p-0 border border-brand-divider rounded-3xl flex flex-col gap-5 relative overflow-hidden">
                        <div className="p-8 pb-0">
                          <div className="flex items-baseline justify-between mb-2">
                            <h3 className="font-sans font-bold text-[#1a1c1d] text-xl md:text-2xl">Get ready to sell</h3>
                            <button className="text-[10px] md:text-xs font-bold text-gray-400 hover:text-[#1a1c1d] transition-colors uppercase tracking-widest">Hide guide</button>
                          </div>
                          <p className="text-[12px] md:text-sm text-[#616a75] mb-8 font-normal">Follow these steps to launch your dream brand today.</p>
                          
                          <div className="w-full h-1.5 bg-gray-100 rounded-full relative mb-10 overflow-hidden">
                            <div 
                              className="absolute left-0 top-0 h-full bg-shopify-green transition-all duration-1000 ease-out" 
                              style={{ width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-col bg-gray-50/30">
                          {steps.map((step, i) => (
                            <div key={i} 
                              onClick={() => step.onClick?.()}
                              className="flex items-center justify-between py-6 px-8 border-t border-gray-50 hover:bg-white cursor-pointer transition-all group"
                            >
                              <div className="flex items-center gap-6">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500
                                  ${step.completed ? 'bg-shopify-green border-shopify-green scale-110 shadow-lg shadow-shopify-green/20' : 'border-gray-200 border-dashed group-hover:border-shopify-green'}`}
                                >
                                  {step.completed ? (
                                    <CheckCircle2 size={12} className="text-[#1a1a1a]" />
                                  ) : (
                                     <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-shopify-green transition-colors" />
                                  )}
                                </div>
                                <span className={`text-[15px] tracking-tight font-medium ${step.completed ? 'text-[#8c9196] line-through' : 'text-[#303030]'}`}>
                                  {step.label}
                                </span>
                              </div>
                              <ChevronRight size={18} className="text-gray-200 group-hover:text-[#1a1c1d] group-hover:translate-x-1 transition-all" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* <div className="bg-white p-6 md:p-12 border border-gray-100 text-center relative overflow-hidden mb-12">
                      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Sparkles size={400} />
                         </div>
                      </div>
                      <div className="flex justify-center mb-10">
                         <div className="relative group">
                            <div className="absolute inset-0 bg-shopify-green blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <Sparkles size={56} className="text-[#f7b614] fill-[#f7b614] relative z-10 animate-bounce transition-all duration-1000" />
                         </div>
                      </div>
                      <h3 className="text-2xl md:text-4xl font-sans font-medium mb-6 text-[#1a1c1d] tracking-tight leading-tight">Build your dream <br className="hidden md:block" />business for <span className="text-shopify-green italic">100 tk</span> / month</h3>
                      <p className="text-[#616a75] text-[16px] md:text-lg mb-12 px-2 md:px-16 leading-relaxed max-w-2xl mx-auto">
                        Subscribe to get your first month for 100 tk. Join the thousands of successful brands and creators who chose Zenvy to scale their vision.
                      </p>
                      <button className="w-full max-w-md mx-auto py-5 bg-[#1a1c1d] text-white rounded-2xl font-bold text-[16px] transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-black/10 flex items-center justify-center gap-3">
                        <span>Unlock Full Access</span>
                        <ArrowRight size={20} />
                      </button>
                    </div> */}
                  </div>
                )}

                {activeTab === 'Products' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[11px] font-black text-shopify-green uppercase tracking-[0.2em] mb-1">Out of stock</p>
                        <p className="text-2xl font-serif font-black">{productList.filter(p => p.stock === 0).length}</p>
                      </div>
                      <div className="md:col-span-3 flex justify-end">
                        <button 
                          onClick={() => setIsCreatingProduct(true)}
                          className="bg-[#5438ff] text-white px-6 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#5438ff]/10"
                        >
                          <Plus size={18} strokeWidth={3} />
                          <span>Add product</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="flex border-b border-gray-100 px-6">
                        {['All', 'Published', 'Unpublished', 'Drafts'].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveProductFilter(tab)}
                            className={`py-4 px-4 text-xs font-bold uppercase tracking-widest transition-all relative
                              ${activeProductFilter === tab ? 'text-[#1a1c1d]' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{tab}</span>
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-500">
                                {tab === 'All' ? productList.length : tab === 'Published' ? productList.filter(p => p.status === 'Published').length : 0}
                              </span>
                            </div>
                            {activeProductFilter === tab && (
                              <motion.div layoutId="product-tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a1c1d]" />
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative flex-1 w-full max-w-sm">
                          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Search products" 
                            className="w-full bg-[#f6f6f7] py-2.5 pl-10 pr-4 rounded-xl text-[13px] font-medium border-none outline-none focus:ring-1 focus:ring-gray-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-100 rounded-xl text-[11px] font-bold uppercase tracking-widest text-[#1a1c1d] hover:bg-gray-50 transition-colors">
                            <ArrowRight size={14} className="rotate-90" />
                            <span>Sort: A-Z</span>
                          </button>
                          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-100 rounded-xl text-[11px] font-bold uppercase tracking-widest text-[#1a1c1d] hover:bg-gray-50 transition-colors">
                            <Filter size={14} />
                            <span>Filter</span>
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50/50 border-y border-gray-100">
                              <th className="p-4 pl-6 w-10">
                                <input type="checkbox" className="rounded border-gray-300 text-shopify-green focus:ring-shopify-green" />
                              </th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Image</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Product Name</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Availability</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                              <th className="p-4 pr-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {productList.filter(p => {
                              if (activeProductFilter === 'All') return true;
                              if (activeProductFilter === 'Published') return p.status === 'Published';
                              if (activeProductFilter === 'Drafts') return p.status === 'Draft';
                              return true;
                            }).filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                              <motion.tr 
                                key={product.id} 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                              >
                                <td className="p-4 pl-6">
                                  <input type="checkbox" className="rounded border-gray-300 text-shopify-green focus:ring-shopify-green" />
                                </td>
                                <td className="p-4">
                                  <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden shadow-sm bg-white">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                  </div>
                                </td>
                                <td className="p-4 max-w-xs">
                                  <div className="flex flex-col">
                                    <span className="text-[14px] font-bold text-[#1a1c1d] group-hover:text-shopify-green transition-colors leading-tight">
                                      {product.name}
                                    </span>
                                    <button className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-shopify-green font-bold uppercase tracking-widest mt-2 transition-colors w-fit">
                                      <ExternalLink size={12} className="stroke-[2.5]" />
                                      <span>Preview</span>
                                    </button>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`text-[13px] font-bold ${product.stock > 0 ? 'text-[#1a1c1d]' : 'text-red-500'}`}>
                                    {product.stock > 0 ? 'Available' : 'Out of stock'}
                                    <span className="text-gray-400 ml-1 font-medium">({product.stock})</span>
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase
                                    ${product.status === 'Published' 
                                      ? 'bg-[#f0edff] text-[#5438ff]' 
                                      : 'bg-[#fef4e6] text-[#b45d00]'}`}
                                  >
                                    {product.status}
                                  </span>
                                </td>
                                <td className="p-4 pr-6 text-right">
                                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1a1c1d] transition-all">
                                    <Layers size={16} />
                                  </button>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </main>

            {/* Mobile Footer Navigation */}
            <div className="lg:hidden bg-white border-t border-gray-100 px-8 py-3 flex items-center justify-between sticky bottom-0 w-full z-10">
              <NavItem icon={Home} label="Home" active={activeTab === 'Home'} onClick={() => setActiveTab('Home')} />
              <NavItem icon={Package} label="Orders" active={activeTab === 'Orders'} onClick={() => setActiveTab('Orders')} />
              <NavItem icon={TagIcon} label="Products" active={activeTab === 'Products'} onClick={() => setActiveTab('Products')} />
              <NavItem icon={MoreHorizontal} label="More" active={activeTab === 'More'} onClick={() => setActiveTab('More')} />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
