"use client";

import React, { useState, useEffect } from 'react';
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
  ArrowUpDown,
  AlertTriangle,
  Receipt,
  Share2,
  Minus,
  X,
  ShoppingBag,
  MessageCircle,
  Check,
  Trash2,
  Globe,
  GlobeLock,
  WebhookIcon,
  EarthIcon,
  CheckSquare
} from 'lucide-react';
import { useZenvy } from '@/context/ZenvyContext';
import { SidebarSection, SidebarItem, SidebarSubItem, NavItem } from '@/components/SidebarComponents';
import ProductDetailsScreen from '@/components/ProductDetailsScreen';
import { Product } from '@/types/zenvy';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Suspense } from 'react';
import POSCheckoutModal from '@/components/POSCheckoutModal';
import MarkSoldModal from '@/components/MarkSoldModal';
import InvoiceSuccessModal from '@/components/InvoiceSuccessModal';

import confetti from 'canvas-confetti';

function DashboardContent() {
  const { storeName } = useZenvy();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('Home');
  const [notificationFilter, setNotificationFilter] = useState('All');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'inventory',
      unread: true,
      title: 'Low Stock Alert',
      message: 'Samsung Galaxy A35 5G is running low (2 units left). Please review your replenishment settings.',
      time: '2 mins ago',
      actionText: 'Restock Now'
    },
    {
      id: 2,
      type: 'sales',
      unread: false,
      title: 'Sale Confirmed',
      message: 'New order #8492 for 3x iPhone 15 Pro Max. Shipping label is ready for generation.',
      time: '45 mins ago'
    },
    {
      id: 3,
      type: 'sales',
      unread: false,
      title: 'Product Published',
      message: "'Minimalist Ceramic Vessel' is now live in your store and visible to all wholesale buyers.",
      time: '3 hours ago'
    },
    {
      id: 4,
      type: 'account',
      unread: true,
      title: 'System Update',
      message: 'Your monthly performance report for last month is ready to view. Your sales grew by 14%.',
      time: 'Yesterday',
      actionText: 'View Report'
    },
    {
      id: 5,
      type: 'inventory',
      unread: false,
      title: 'Inventory Restocked',
      message: "Bulk shipment of 'Hand-blown Glass Carafe' has been received and added to your active inventory.",
      time: 'Monday',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=100&auto=format'
    }
  ]);

  // Sync activeTab with URL search parameters on mount / changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const formatted = tabParam.charAt(0).toUpperCase() + tabParam.slice(1).toLowerCase();
      if (['Home', 'Products', 'Orders', 'Notifications'].includes(formatted)) {
        setActiveTab(formatted);
      }
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab.toLowerCase());
    router.push(`?${params.toString()}`);
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [activeProductFilter, setActiveProductFilter] = useState('All');
  const [previewingProduct, setPreviewingProduct] = useState<Product | null>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Mark as Sold & Invoice Generator State Variables
  const [activeMarkSoldProduct, setActiveMarkSoldProduct] = useState<Product | null>(null);
  const [selectedMarkSoldVariant, setSelectedMarkSoldVariant] = useState<any | null>(null);
  const [soldQty, setSoldQty] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>('');
  const [invoiceSaleData, setInvoiceSaleData] = useState<any | null>(null);

  // Native POS checkout terminal states
  const [posCheckoutOpen, setPosCheckoutOpen] = useState<boolean>(false);
  const [posStep, setPosStep] = useState<number>(1);
  const [posCart, setPosCart] = useState<Array<{ product: Product, variant: any, quantity: number, overridePrice: number }>>([]);
  const [posSearch, setPosSearch] = useState<string>('');
  const [posBuyerName, setPosBuyerName] = useState<string>('');
  const [posDiscountType, setPosDiscountType] = useState<'flat' | 'percent'>('flat');
  const [posDiscountValue, setPosDiscountValue] = useState<number>(0);
  const [posSuccessData, setPosSuccessData] = useState<any | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | number | null>(null);
  const [recentActivities, setRecentActivities] = useState([
    { type: 'added',  text: 'Added 5 units',   product: 'Samsung A35 Blue 8/256',        time: '2 min ago'  },
    { type: 'sold',   text: 'Marked sold',     product: 'iPhone 15 Black 128GB',          time: '18 min ago' },
    { type: 'added',  text: 'Added 12 units',  product: 'Redmi Note 13 White 6/128',      time: '1 hr ago'   },
    { type: 'sold',   text: 'Marked sold',     product: 'Samsung S24 Violet 8/256',       time: '2 hr ago'   },
    { type: 'edited', text: 'Price updated',   product: 'Oppo Reno 11 Sky Blue',          time: '3 hr ago'   },
    { type: 'sold',   text: 'Marked sold',     product: 'iPhone 14 Midnight 256GB',       time: '5 hr ago'   },
    { type: 'added',  text: 'Added 8 units',   product: 'Xiaomi 14T Pro Black 12/512',    time: 'Yesterday'  },
    { type: 'edited', text: 'Stock adjusted',  product: 'Nothing Phone 2a White',         time: 'Yesterday'  },
    { type: 'sold',   text: 'Marked sold',     product: 'OnePlus 12 Silky Black',         time: 'Yesterday'  },
    { type: 'added',  text: 'Added 20 units',  product: 'Realme GT 6T Racing Yellow',     time: '2 days ago' },
  ]);
  const [productList, setProductList] = useState<Product[]>([
    { 
      id: 1, 
      name: "Galaxy A35 5G", 
      brand: "Samsung",
      stock: 19, 
      status: 'Published', 
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=200&auto=format',
      lowStockThreshold: 5,
      description: "Samsung Galaxy A35 5G features a premium glass back, standard 120Hz Super AMOLED display, and a powerful triple camera setup. Ideal for smooth multitasking and premium mobile photography.",
      history: [
        { text: "Added 15 units — Black 8/128 — May 15", type: 'add' },
        { text: "Added 4 units — Blue 8/256 — May 15", type: 'add' },
        { text: "Sold 1 unit — Blue 8/256 — May 16", type: 'sell' }
      ],
      variants: [
        { id: 'v1_1', color: 'Blue', ram: '8GB', storage: '256GB', quantity: 4, buyingPrice: 32000, sellingPrice: 38500 },
        { id: 'v1_2', color: 'Black', ram: '8GB', storage: '128GB', quantity: 15, buyingPrice: 28000, sellingPrice: 34000 },
        { id: 'v1_3', color: 'White', ram: '6GB', storage: '128GB', quantity: 0, buyingPrice: 26000, sellingPrice: 31000 }
      ]
    },
    { 
      id: 2, 
      name: "Redmi Note 13 Pro", 
      brand: "Xiaomi",
      stock: 14, 
      status: 'Published', 
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=200&auto=format',
      lowStockThreshold: 4,
      description: "Redmi Note 13 Pro boasts an ultra-clear 200MP camera with OIS, 120Hz AMOLED display, and a large 5000mAh battery with 67W turbo charging. Beautiful Forest Green back.",
      history: [
        { text: "Added 12 units — Forest Green 8/256 — May 14", type: 'add' },
        { text: "Added 2 units — Ocean Blue 12/512 — May 15", type: 'add' }
      ],
      variants: [
        { id: 'v2_1', color: 'Forest Green', ram: '8GB', storage: '256GB', quantity: 12, buyingPrice: 24000, sellingPrice: 29500 },
        { id: 'v2_2', color: 'Ocean Blue', ram: '12GB', storage: '512GB', quantity: 2, buyingPrice: 29000, sellingPrice: 35000 },
        { id: 'v2_3', color: 'Stealth Black', ram: '8GB', storage: '256GB', quantity: 0, buyingPrice: 24000, sellingPrice: 29500 }
      ]
    },
    { 
      id: 3, 
      name: "iPhone 15 Pro Max", 
      brand: "Apple",
      stock: 9, 
      status: 'Published', 
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=200&auto=format',
      lowStockThreshold: 3,
      description: "The peak of iPhone design. Built with aerospace-grade titanium, featuring the revolutionary A17 Pro chip, custom Action button, and the most powerful iPhone camera system ever.",
      history: [
        { text: "Added 8 units — Natural Titanium 8/256 — May 14", type: 'add' },
        { text: "Added 1 unit — Blue Titanium 8/512 — May 15", type: 'add' }
      ],
      variants: [
        { id: 'v3_1', color: 'Natural Titanium', ram: '8GB', storage: '256GB', quantity: 8, buyingPrice: 125000, sellingPrice: 145000 },
        { id: 'v3_2', color: 'Blue Titanium', ram: '8GB', storage: '512GB', quantity: 1, buyingPrice: 140000, sellingPrice: 165000 },
        { id: 'v3_3', color: 'Black Titanium', ram: '8GB', storage: '256GB', quantity: 0, buyingPrice: 125000, sellingPrice: 145000 }
      ]
    },
    { 
      id: 4, 
      name: "OnePlus 12", 
      brand: "OnePlus",
      stock: 15, 
      status: 'Published', 
      image: 'https://images.unsplash.com/photo-1610945415295-d9bcf067e59c?q=80&w=200&auto=format',
      lowStockThreshold: 5,
      description: "OnePlus 12 redefines flagship performance with the Snapdragon 8 Gen 3, a gorgeous 2K orient-peaking display, and custom fourth-generation Hasselblad Camera for mobile.",
      history: [
        { text: "Added 10 units — Flowy Emerald 16/512 — May 14", type: 'add' },
        { text: "Added 5 units — Silky Black 12/256 — May 15", type: 'add' }
      ],
      variants: [
        { id: 'v4_1', color: 'Flowy Emerald', ram: '16GB', storage: '512GB', quantity: 10, buyingPrice: 68000, sellingPrice: 79000 },
        { id: 'v4_2', color: 'Silky Black', ram: '12GB', storage: '256GB', quantity: 5, buyingPrice: 60000, sellingPrice: 69000 }
      ]
    },
    { 
      id: 5, 
      name: "Nothing Phone (2a)", 
      brand: "Nothing",
      stock: 2, 
      status: 'Draft', 
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format',
      lowStockThreshold: 3,
      description: "Uniquely designed Nothing Phone (2a) features the signature Glyph Interface, highly-optimized custom Dimensity 7200 Pro processor, and a gorgeous, clean Nothing OS UI.",
      history: [
        { text: "Added 2 units — Dark Grey 12/256 — May 15", type: 'add' }
      ],
      variants: [
        { id: 'v5_1', color: 'Milk White', ram: '8GB', storage: '128GB', quantity: 0, buyingPrice: 31000, sellingPrice: 36000 },
        { id: 'v5_2', color: 'Dark Grey', ram: '12GB', storage: '256GB', quantity: 2, buyingPrice: 36000, sellingPrice: 42000 }
      ]
    }
  ]);

  const steps = [
    { label: "Add your first product", completed: productList.length > 5, onClick: () => router.push('/dashboard/products/new') },
    { label: "Add a custom domain", completed: false },
    { label: "Customize your online store", completed: false },
    { label: "Set your shipping rates", completed: false },
    { label: "Name your store", completed: true },
    { label: "Set up Shopify Payments", completed: false },
  ];

  // Load from localStorage on client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zenvy_productList');
      if (saved) {
        try {
          setProductList(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Save to localStorage when productList changes
  useEffect(() => {
    if (typeof window !== 'undefined' && productList.length > 0) {
      localStorage.setItem('zenvy_productList', JSON.stringify(productList));
    }
  }, [productList]);

  const handleMarkAsSoldClick = (product: Product) => {
    setActiveMarkSoldProduct(product);






  };

  const handleOpenCheckout = () => {
    setPosCheckoutOpen(true);
  };

  const handleShareShopCard = () => {
    setShowShareModal(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen bg-[#fbf9f9] text-[#1b1c1c] font-sans overflow-hidden"
    >
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#efeded] h-full z-20 flex-shrink-0">
        <div className="pt-10 px-6 mb-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#020302] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
              {storeName ? storeName.substring(0, 2).toUpperCase() : 'HW'}
            </div>
            <div className="min-w-0">
              <h1 className="text-[14px] font-bold leading-tight text-[#020302] truncate">Zenvy</h1>
              <p className="text-[9px] uppercase tracking-widest text-[#5e5e5d] opacity-60 font-bold mt-0.5">SS26 Collection</p>
            </div>
          </div>
        </div>

        <nav className="flex-grow overflow-y-auto min-h-0">
          <div className="px-4 mb-6 flex-shrink-0">
            <button 
              onClick={() => router.push('/dashboard/products/new')}
              className="w-full bg-[#020302] hover:bg-neutral-900 text-white py-3 px-4 rounded-sm text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="space-y-1">
            <p className="px-6 text-[9px] uppercase tracking-[0.2em] text-[#5e5e5d] mb-2 opacity-50 font-bold">General</p>
            <button 
              onClick={() => handleTabChange('Home')}
              className={`w-full flex items-center gap-3 py-3 px-6 transition-all text-left cursor-pointer border-r-2 text-xs font-semibold ${
                activeTab === 'Home' 
                  ? 'text-[#020302] font-bold bg-[#f5f3f3] border-[#020302]' 
                  : 'text-[#5e5e5d] hover:bg-[#f5f3f3]/50 border-transparent font-medium'
              }`}
            >
              <Home size={16} className="stroke-[2]" />
              <span>Home</span>
            </button>

            <button 
              onClick={() => handleTabChange('Products')}
              className={`w-full flex items-center gap-3 py-3 px-6 transition-all text-left cursor-pointer border-r-2 text-xs font-semibold ${
                activeTab === 'Products' 
                  ? 'text-[#020302] font-bold bg-[#f5f3f3] border-[#020302]' 
                  : 'text-[#5e5e5d] hover:bg-[#f5f3f3]/50 border-transparent font-medium'
              }`}
            >
              <Package size={16} className="stroke-[2]" />
              <span>Products</span>
            </button>

            <button 
              onClick={() => handleTabChange('Orders')}
              className={`w-full flex items-center gap-3 py-3 px-6 transition-all text-left cursor-pointer border-r-2 text-xs font-semibold ${
                activeTab === 'Orders' 
                  ? 'text-[#020302] font-bold bg-[#f5f3f3] border-[#020302]' 
                  : 'text-[#5e5e5d] hover:bg-[#f5f3f3]/50 border-transparent font-medium'
              }`}
            >
              <ShoppingBag size={16} className="stroke-[2]" />
              <span>Orders</span>
              <span className="ml-auto bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">12</span>
            </button>

            <button 
              onClick={handleOpenCheckout}
              className="w-full flex items-center gap-3 py-3 px-6 text-[#5e5e5d] hover:bg-[#f5f3f3]/50 border-transparent transition-all text-left cursor-pointer border-r-2 text-xs font-semibold font-medium"
            >
              <ShoppingBag size={16} className="stroke-[2] text-emerald-600" />
              <span>POS Checkout</span>
              <span className="ml-auto bg-emerald-50 text-emerald-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">POS</span>
            </button>
          </div>

          <div className="mt-6">
            <p className="px-6 text-[9px] uppercase tracking-[0.2em] text-[#5e5e5d] mb-2 opacity-50 font-bold">Favorites</p>
            <div className="space-y-1">
              <button 
                onClick={() => {}}
                className="w-full text-left font-semibold text-[#5e5e5d] hover:text-[#020302] py-2 px-6 transition-colors text-xs cursor-pointer block font-medium"
              >
                Sales analytics
              </button>
              <button 
                onClick={() => {}}
                className="w-full text-left font-semibold text-[#5e5e5d] hover:text-[#020302] py-2 px-6 transition-colors text-xs cursor-pointer block font-medium"
              >
                Inventory reports
              </button>
            </div>
          </div>

          <div className="mt-6">
            <p className="px-6 text-[9px] uppercase tracking-[0.2em] text-[#5e5e5d] mb-2 opacity-50 font-bold">Management</p>
            <div className="space-y-1">
              <button 
                onClick={() => handleTabChange('Notifications')}
                className={`w-full flex items-center gap-3 py-3 px-6 transition-all text-left cursor-pointer border-r-2 text-xs font-semibold ${
                  activeTab === 'Notifications' 
                    ? 'text-[#020302] font-bold bg-[#f5f3f3] border-[#020302]' 
                    : 'text-[#5e5e5d] hover:bg-[#f5f3f3]/50 border-transparent font-medium'
                }`}
              >
                <Bell size={16} className="stroke-[2]" />
                <span>Notifications</span>
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="ml-auto bg-[#ba1a1a] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                    {notifications.filter(n => n.unread).length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => {}}
                className="w-full flex items-center gap-3 text-[#5e5e5d] hover:bg-[#f5f3f3]/50 py-3 px-6 transition-all text-left text-xs cursor-pointer font-semibold font-medium"
              >
                <Layers size={16} className="stroke-[2]" />
                <span>Analytics</span>
              </button>
              <button 
                onClick={() => {}}
                className="w-full flex items-center gap-3 text-[#5e5e5d] hover:bg-[#f5f3f3]/50 py-3 px-6 transition-all text-left text-xs cursor-pointer font-semibold font-medium"
              >
                <MoreHorizontal size={16} className="stroke-[2]" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </nav>

        <footer className="mt-auto border-t border-[#efeded] p-6 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded bg-[#020302] text-white flex items-center justify-center font-bold text-xs">
              {storeName ? storeName.substring(0, 2).toUpperCase() : 'HW'}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#020302] leading-none font-bold truncate">{storeName || 'My Store'}</p>
              <p className="text-[9px] text-[#5e5e5d] opacity-60 uppercase tracking-tighter mt-1 font-semibold">Premium Plan</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button className="flex items-center gap-3 text-[#5e5e5d] hover:text-[#020302] transition-colors text-left text-xs cursor-pointer font-semibold font-medium">
              <svg className="w-4 h-4 stroke-[2] text-[#5e5e5d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Support</span>
            </button>
            <button className="flex items-center gap-3 text-[#5e5e5d] hover:text-[#020302] transition-colors text-left text-xs cursor-pointer font-semibold font-medium">
              <svg className="w-4 h-4 stroke-[2] text-[#5e5e5d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Account</span>
            </button>
          </div>
        </footer>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {previewingProduct ? (
          <ProductDetailsScreen 
            product={previewingProduct}
            onBack={() => setPreviewingProduct(null)}
            onEdit={(prod) => {
              router.push(`/dashboard/products/edit?id=${prod.id}`);
            }}
            onUpdateStock={(productId, variantId, newQty, historyLogText, logType) => {
              // 1. Update quantities in product list state
              setProductList(prevList => prevList.map(p => {
                if (p.id === productId) {
                  const updatedVariants = p.variants?.map(v => 
                    v.id === variantId ? { ...v, quantity: newQty } : v
                  ) || [];
                  const newTotalStock = updatedVariants.reduce((sum, v) => sum + v.quantity, 0);
                  const updatedProduct = {
                    ...p,
                    variants: updatedVariants,
                    stock: newTotalStock,
                    history: [
                      { text: historyLogText, type: logType },
                      ...(p.history || [])
                    ]
                  };
                  // Keep active preview state updated live too!
                  setPreviewingProduct(updatedProduct);
                  return updatedProduct;
                }
                return p;
              }));

              // 2. Add dynamic entry to dashboard bottom activity feed
              const targetProduct = productList.find(p => p.id === productId);
              const targetVariant = targetProduct?.variants?.find(v => v.id === variantId);
              if (targetProduct && targetVariant) {
                const activityText = logType === 'add' ? `Added stock` : `Marked sold`;
                const productDetail = `${targetProduct.brand} ${targetProduct.name} ${targetVariant.color} ${targetVariant.ram}/${targetVariant.storage} (Qty: ${newQty})`;
                setRecentActivities(prev => [
                  { 
                    type: logType === 'add' ? 'added' : 'sold', 
                    text: activityText, 
                    product: productDetail, 
                    time: 'Just now' 
                  },
                  ...prev
                ].slice(0, 10));
              }
            }}
            onDeleteProduct={(productId) => {
              setProductList(prev => prev.filter(p => p.id !== productId));
              setPreviewingProduct(null);
            }}
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
                    className="bg-white p-10 max-w-sm w-full text-center shadow-2xl"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-sans font-medium text-[#1a1c1d] mb-2">Product Added!</h2>
                    <p className="text-gray-500 mb-8 font-light text-sm">Your new product is live and ready for customers.</p>
                    <div className="space-y-3">
                      <button 
                        onClick={() => {
                          setShowSuccessOverlay(false);
                          router.push('/dashboard/products/new');
                        }}
                        className="w-full text-sm py-4 bg-[#5438ff] text-white font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                      >
                        Add Another Product
                      </button>
                      <button 
                        onClick={() => {
                          setShowSuccessOverlay(false);
                          handleTabChange('Products');
                        }}
                        className="w-full py-4 text-sm bg-gray-50 text-gray-500 font-bold border border-gray-300 hover:bg-gray-100 transition-all"
                      >
                        Go to Inventory
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Modular Modals */}
            <POSCheckoutModal
              isOpen={posCheckoutOpen}
              onClose={() => setPosCheckoutOpen(false)}
              productList={productList}
              setProductList={setProductList}
              setRecentActivities={setRecentActivities}
              storeName={storeName}
            />

            <MarkSoldModal
              isOpen={!!activeMarkSoldProduct}
              onClose={() => setActiveMarkSoldProduct(null)}
              product={activeMarkSoldProduct}
              setProductList={setProductList}
              setRecentActivities={setRecentActivities}
              storeName={storeName}
              onSaleRecorded={(invoice) => setInvoiceSaleData(invoice)}
            />

            <InvoiceSuccessModal
              isOpen={!!invoiceSaleData}
              onClose={() => setInvoiceSaleData(null)}
              invoiceData={invoiceSaleData}
            />

            <header className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-[#efeded]">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-[#020302]">
                  {activeTab}
                </h1>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center relative w-64">
                  <Search size={14} className="absolute left-3 text-[#5e5e5d] opacity-60" />
                  <input 
                    type="text" 
                    placeholder="Search inventory..." 
                    className="w-full bg-[#f5f3f3] border-none rounded-sm py-1.5 pl-9 pr-12 text-xs font-semibold text-[#020302] placeholder-[#5e5e5d]/60 focus:outline-none focus:ring-1 focus:ring-[#efeded]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute right-2 px-1.5 py-0.5 border border-[#c7c7bf]/30 rounded-sm text-[8px] font-bold text-[#5e5e5d]/60 bg-white shadow-2xs pointer-events-none select-none">
                    ⌘ K
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center bg-[#f5f3f3] px-3 py-1.5 rounded-sm text-[10px] font-bold text-[#5e5e5d]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                    LIVE STORE
                  </div>
                  <button 
                    onClick={() => handleTabChange('Notifications')}
                    className="p-2 hover:bg-[#f5f3f3]/50 rounded-sm transition-all relative cursor-pointer"
                  >
                    <Bell size={18} className="text-[#020302] stroke-[2]" />
                    {notifications.filter(n => n.unread).length > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#ba1a1a] rounded-full"></span>
                    )}
                  </button>
                  <div className="w-8 h-8 rounded-full border-2 border-purple-400 flex items-center justify-center font-bold text-md border border-[#efeded] select-none">
                    {storeName ? storeName.substring(0, 1).toUpperCase() : 'M'}
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 md:px-10 py-6 scroll-smooth">
              <div className="w-full max-w-5xl mx-auto">
                {activeTab === 'Home' && (
                  <div className="space-y-6 text-left">
                    
                    {/* Welcome Greeting Header */}
                    <div className="flex flex-col gap-1 pb-1">
                      <h2 className="text-xl md:text-2xl font-medium text-[#020302] tracking-tight font-sans">
                        {(() => {
                          const hour = new Date().getHours();
                          if (hour < 12) return 'Good morning';
                          if (hour < 17) return 'Good afternoon';
                          return 'Good evening';
                        })()}, Merchant
                      </h2>
                      <p className="text-xs text-[#5e5e5d] font-semibold leading-relaxed">
                        Here is a live performance snapshot for your storefront today.
                      </p>
                    </div>

                    {/* Share Shop Card Hero Banner - Elegant Marketing card */}
                    <motion.div 
                      whileHover={{ y: -1.5 }}
                      onClick={handleShareShopCard}
                      className="bg-[#020302] p-6 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-5 cursor-pointer shadow-lg shadow-black/5 relative overflow-hidden group border border-[#efeded]/10"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent)] pointer-events-none"></div>
                      
                      <div className="flex items-start gap-4 relative z-10">
                        {/* Curved Mini Seal Logo Overlay */}
                        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/15 flex items-center justify-center relative select-none flex-shrink-0">
                          {/* <svg viewBox="0 0 100 100" className="w-full h-full p-0.5 animate-[spin_35s_linear_infinite]">
                            <path id="miniPath" d="M 20,50 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0" fill="none" />
                            <text className="text-[9px] font-bold fill-white/60 tracking-[0.16em] uppercase">
                              <textPath href="#miniPath" startOffset="50%" textAnchor="middle">
                                {storeName ? storeName.substring(0, 8) : 'HW'} · CATALOG ·
                              </textPath>
                            </text>
                          </svg> */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <EarthIcon size={39} className="text-white fill-white/10" />
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-[15px] font-bold text-white tracking-tight flex items-center gap-2">
                            Live Storefront is Active 
                            <span className="bg-[#21c563] text-white text-[9px] font-medium uppercase tracking-wider py-0.5 px-2 rounded-[3px]">
                              ONLINE
                            </span>
                          </p>
                          <p className="text-xs text-gray-300 font-medium leading-relaxed max-w-md">
                            Anyone visiting your storefront can view live catalog quantities & inquire instantly via WhatsApp.
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareShopCard();
                        }}
                        className="bg-white hover:bg-neutral-50 text-black py-3 px-5 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-2 self-start md:self-auto shadow-md transition-all active:scale-98 relative z-10 cursor-pointer"
                      >
                        <Share2 size={13} className="stroke-[2.5]" />
                        Get Share Link
                      </button>
                    </motion.div>

                    {/* Summary Stats Grid (Polaris-Style Flat Visuals) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 sm:gap-4">
                      {/* Stat 1: Products in Stock */}
                      <div className="bg-white p-5 border border-[#efeded] rounded-sm shadow-2xs text-left hover:shadow-xs hover:border-[#dbdad9] transition-all">
                        <p className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-widest mb-1.5">Products in stock</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl md:text-2xl font-bold text-[#020302]">
                            {productList.reduce((sum, p) => sum + p.stock, 0)}
                          </span>
                          <span className="sm:flex hidden items-center text-[10px] font-bold text-emerald-600 gap-0.5">
                            <ArrowUpRight size={11} className="stroke-[2.5]" />
                            <span>+4.2%</span>
                          </span>
                        </div>
                      </div>

                      {/* Stat 2: Total Stock Value */}
                      <div className="bg-white p-5 border border-[#efeded] rounded-sm shadow-2xs text-left hover:shadow-xs hover:border-[#dbdad9] transition-all">
                        <p className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-widest mb-1.5">Asset Stock Value</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl md:text-2xl font-bold text-[#020302] truncate max-w-full">
                            <span className="text-[13px] text-[#5e5e5d] font-semibold mr-0.5">৳</span>
                            {productList.reduce((sum, p) => sum + (p.variants?.reduce((vSum, v) => vSum + (v.sellingPrice * v.quantity), 0) || 0), 0).toLocaleString()}
                          </span>
                          <span className="sm:flex hidden items-center text-[10px] font-bold text-emerald-600 gap-0.5">
                            <ArrowUpRight size={11} className="stroke-[2.5]" />
                            <span>+8.1%</span>
                          </span>
                        </div>
                      </div>

                      {/* Stat 3: Units Sold */}
                      <div className="bg-white p-5 border border-[#efeded] rounded-sm shadow-2xs text-left hover:shadow-xs hover:border-[#dbdad9] transition-all">
                        <p className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-widest mb-1.5">Units Sold (May)</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl md:text-2xl font-bold text-[#020302]">
                            {recentActivities.filter(a => a.type === 'sold').length + 8}
                          </span>
                          <span className="sm:flex hidden items-center text-[10px] font-bold text-emerald-600 gap-0.5">
                            <ArrowUpRight size={11} className="stroke-[2.5]" />
                            <span>+15.2%</span>
                          </span>
                        </div>
                      </div>

                      {/* Stat 4: Revenue */}
                      <div className="bg-white p-5 border border-[#efeded] rounded-sm shadow-2xs text-left hover:shadow-xs hover:border-[#dbdad9] transition-all">
                        <p className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-widest mb-1.5">Estimated Revenue</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl md:text-2xl font-bold text-[#020302] truncate max-w-full">
                            <span className="text-[13px] text-[#5e5e5d] font-semibold mr-0.5">৳</span>
                            {((recentActivities.filter(a => a.type === 'sold').length + 8) * 35000).toLocaleString()}
                          </span>
                          <span className="sm:flex hidden items-center text-[10px] font-bold text-emerald-600 gap-0.5">
                            <ArrowUpRight size={11} className="stroke-[2.5]" />
                            <span>+19.8%</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Intelligent Stock Alert Panel */}
                    {(() => {
                      const lowStockProducts = productList.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 4));
                      const alertProduct = lowStockProducts[0] || null;

                      if (alertProduct) {
                        return (
                          <div className="bg-[#FFF9EB] p-5 border border-[#FBEAC1] rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
                            <div className="flex items-start gap-4">
                              {/* Thumbnail */}
                              <div className="w-12 h-12 rounded-sm border border-[#FBEAC1] overflow-hidden flex-shrink-0 bg-white shadow-2xs">
                                <img 
                                  src={alertProduct.image || "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=120&auto=format"} 
                                  alt={alertProduct.name} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle size={14} className="text-[#b45309] stroke-[2.5]" />
                                  <h4 className="text-[10px] font-bold text-[#b45309] uppercase tracking-widest">Inventory Running Low</h4>
                                </div>
                                <p className="text-gray-700 text-[13px] font-light leading-relaxed max-w-lg">
                                  Your smartphone model <span className="font-semibold text-black">{alertProduct.brand} {alertProduct.name}</span> is low on stock. Restock soon to prevent catalog shortages.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-auto">
                              <span className="bg-white border border-[#FBEAC1] text-[#b45309] text-xs font-bold py-1.5 px-3 rounded-sm shadow-2xs">
                                {alertProduct.stock} left
                              </span>
                              <button 
                                onClick={() => {
                                  router.push(`/dashboard/products/edit?id=${alertProduct.id}`);
                                }}
                                className="bg-[#eab308] hover:bg-[#ca8a04] text-white py-1.5 px-4 rounded-sm text-xs font-bold transition-colors shadow-2xs cursor-pointer active:scale-98"
                              >
                                Restock
                              </button>
                            </div>
                          </div>
                        );
                      } else {
                        // All stock fully healthy! Show gorgeous verified safe banner
                        return (
                          <div className="bg-[#f4fcf7] p-5 border border-[#cbf5da] rounded-sm flex items-center justify-between gap-4 text-left">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 flex-shrink-0">
                                <Check size={18} className="stroke-[3]" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-green-700 uppercase tracking-widest">Inventory Stable</h4>
                                <p className="text-gray-600 text-xs font-light mt-0.5">
                                  All active swatches are fully stocked above low-level thresholds. No warnings.
                                </p>
                              </div>
                            </div>
                            <span className="bg-white border border-green-250 text-green-700 text-[10px] font-bold py-1 px-2.5 rounded-sm uppercase tracking-wider shadow-2xs">
                              All Swatches Good
                            </span>
                          </div>
                        );
                      }
                    })()}

                    {/* Recent Activity Feed - Elegant Timeline layout */}
                    <div className="bg-white border border-[#efeded] rounded-sm shadow-2xs overflow-hidden text-left">
                      {/* Header */}
                      <div className="flex items-center justify-between px-6 py-5 border-b border-[#efeded]">
                        <div>
                          <h3 className="font-[400] text-[#020302] text-[18px]">Recent Log Activity</h3>
                          <p className="text-[11px] text-[#5e5e5d] opacity-60 mt-0.5 font-semibold">Real-time chronicle of stock operations</p>
                        </div>
                        <button 
                          onClick={() => handleTabChange('Products')}
                          className="text-[10px] font-bold text-[#5e5e5d] hover:text-black uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          View products
                        </button>
                      </div>

                      {/* Timeline log feed */}
                      <div className="divide-y divide-[#efeded]">
                        {recentActivities.slice(0, 5).map((item, i) => (
                          <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-[#f5f3f3]/50 transition-colors">
                            <div className="flex items-center gap-3.5 min-w-0">
                              {/* Status dot indicator */}
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                item.type === 'sold' ? 'bg-blue-500' :
                                item.type === 'added' ? 'bg-emerald-500' : 'bg-[#c7c7bf]'
                              }`} />
                              
                              <div className="min-w-0">
                                <p className="text-[13px] font-light text-gray-800 leading-snug truncate">
                                  <span className="font-semibold text-black">{item.text}</span>
                                  <span className="text-gray-300 mx-2">|</span>
                                  <span className="text-gray-500">{item.product}</span>
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                              <span className={`hidden sm:inline-block text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                                item.type === 'sold' ? 'bg-blue-50 text-blue-600' :
                                item.type === 'added' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#f5f3f3] text-gray-600'
                              }`}>
                                {item.type === 'sold' ? 'Sale' : item.type === 'added' ? 'Supply' : 'Update'}
                              </span>
                              <span className="text-[11px] text-gray-400 font-light whitespace-nowrap">{item.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {activeTab === 'Products' && (
                  <div className="space-y-8 text-left py-2">
                    
                    {/* Header Section */}
                    <div className="flex flex-col hidden md:flex md:flex-row justify-between items-end gap-6 mb-0 md:mb-12">
                      <div>
                        <h3 className="font-[400] text-[#020302] text-[24px]">Products</h3>
                        <p className="text-[14px] text-[#5e5e5d] opacity-60 mt-0.5 font-light">Manage your products and inventory</p>
                      </div>
                      <button 
                        onClick={() => router.push('/dashboard/products/new')}
                        className="bg-[#020302] text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-98"
                      >
                        <Plus size={14} className="stroke-[3]" /> 
                        <span>Add Product</span>
                      </button>
                    </div>

                    {/* Filters & Tabs */}
                    <div className="flex flex-col md:flex-row justify-between items-center border-b border-[#efeded] mb-8 gap-4">
                      <div className="flex gap-8">
                        {[
                          { id: 'All', label: 'All', count: productList.length },
                          { id: 'Low Stock', label: 'Low Stock', count: productList.filter(p => {
                              const threshold = p.lowStockThreshold || 4;
                              const hasLowStockVariant = p.variants?.some(v => v.quantity > 0 && v.quantity <= threshold);
                              return hasLowStockVariant || (p.stock > 0 && p.stock <= threshold);
                            }).length 
                          },
                          { id: 'Out of Stock', label: 'Out of Stock', count: productList.filter(p => {
                              const allVariantsOut = p.variants && p.variants.length > 0 ? p.variants.every(v => v.quantity === 0) : false;
                              return p.stock === 0 || allVariantsOut;
                            }).length 
                          }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveProductFilter(tab.id)}
                            className={`pb-4 text-[11px] font-bold uppercase tracking-widest transition-all relative cursor-pointer
                              ${activeProductFilter === tab.id 
                                ? 'text-black border-b-2 border-black' 
                                : 'text-neutral-500 hover:text-black'}`}
                          >
                            <span>{tab.label} ({tab.count})</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-4 pb-4">
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-[#efeded] px-4 py-2 hover:bg-neutral-50 transition-colors cursor-pointer rounded-sm">
                          <ArrowUpDown size={12} className="text-[#5e5e5d]" />
                          <span>Sort: A-Z</span>
                        </button>
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-[#efeded] px-4 py-2 hover:bg-neutral-50 transition-colors cursor-pointer rounded-sm">
                          <Filter size={12} className="text-[#5e5e5d]" />
                          <span>Filter</span>
                        </button>
                      </div>
                    </div>

                    {/* Vertical Product List */}
                    <div className="space-y-4">
                      {productList
                        .filter(p => {
                          if (activeProductFilter === 'All') return true;
                          if (activeProductFilter === 'Low Stock') {
                            const threshold = p.lowStockThreshold || 4;
                            const hasLowStockVariant = p.variants?.some(v => v.quantity > 0 && v.quantity <= threshold);
                            return hasLowStockVariant || (p.stock > 0 && p.stock <= threshold);
                          }
                          if (activeProductFilter === 'Out of Stock') {
                            const allVariantsOut = p.variants && p.variants.length > 0 ? p.variants.every(v => v.quantity === 0) : false;
                            return p.stock === 0 || allVariantsOut;
                          }
                          return true;
                        })
                        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand?.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((product) => (
                          <motion.div 
                            key={product.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-[#efeded] p-6 flex flex-col md:flex-row gap-8 items-start group hover:border-black transition-all duration-350 shadow-2xs hover:shadow-xs"
                          >
                            {/* Product Image Thumbnail */}
                            <div className="w-full md:w-32 h-32 bg-[#f5f3f3] flex items-center justify-center overflow-hidden border border-[#efeded] flex-shrink-0">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                              />
                            </div>

                            {/* Details layout */}
                            <div className="flex-1 flex flex-col md:flex-row justify-between w-full gap-6">
                              <div className="space-y-1.5 text-left">
                                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400">
                                  {product.brand || 'Smartphone'}
                                </span>
                                <h3 className="text-[17px] font-light text-black tracking-tight leading-snug group-hover:text-[#5438ff] transition-colors">
                                  {product.name}
                                </h3>
                                <p className="text-black font-semibold text-sm">
                                  {(() => {
                                    const prices = product.variants?.map(v => v.sellingPrice) || [];
                                    if (prices.length === 0) return 'MSRP N/A';
                                    const min = Math.min(...prices);
                                    const max = Math.max(...prices);
                                    return min === max ? `৳${min.toLocaleString()}` : `৳${min.toLocaleString()} - ৳${max.toLocaleString()}`;
                                  })()}
                                </p>
                              </div>

                              <div className="flex-1 max-w-md text-left">
                                <p className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 mb-3">Variants & Stock</p>
                                <div className="flex flex-wrap gap-2">
                                  {product.variants && product.variants.length > 0 ? (
                                    product.variants.map((variant) => {
                                      const threshold = product.lowStockThreshold || 4;
                                      const isOutOfStock = variant.quantity === 0;
                                      const isLowStock = variant.quantity > 0 && variant.quantity <= threshold;

                                      return (
                                        <span 
                                          key={variant.id} 
                                          className={`px-3 py-1 text-[11px] font-medium border transition-all
                                            ${isOutOfStock 
                                              ? 'bg-[#f5f3f3] border-[#efeded] text-neutral-400 opacity-55 italic' 
                                              : isLowStock 
                                                ? 'bg-amber-50 border-amber-200 text-amber-700 font-semibold' 
                                                : 'bg-[#f5f3f3] border-[#efeded] text-neutral-800'}`}
                                        >
                                          {variant.color} {variant.ram.replace('GB', '')}/{variant.storage.replace('GB', '')} ({variant.quantity})
                                        </span>
                                      );
                                    })
                                  ) : (
                                    (() => {
                                      const threshold = product.lowStockThreshold || 4;
                                      const isOutOfStock = product.stock === 0;
                                      const isLowStock = product.stock > 0 && product.stock <= threshold;

                                      return (
                                        <span 
                                          className={`px-3 py-1 text-[11px] font-medium border rounded-sm transition-all
                                            ${isOutOfStock 
                                              ? 'bg-[#f5f3f3] border-[#efeded] text-neutral-400 opacity-55 italic' 
                                              : isLowStock 
                                                ? 'bg-rose-50 border-rose-250 text-rose-700 font-semibold' 
                                                : 'bg-[#f5f3f3] border-[#efeded] text-neutral-800'}`}
                                        >
                                          Total Stock ({product.stock})
                                        </span>
                                      );
                                    })()
                                  )}
                                </div>
                              </div>

                              <div className="flex md:flex-col gap-2 justify-end items-stretch md:w-32">
                                <button 
                                  onClick={() => setPreviewingProduct(product)}
                                  className="text-[9px] font-bold uppercase tracking-widest border-[1.85px] border-[#777776] px-4 py-2 hover:bg-black hover:text-white hover:border-black transition-all cursor-pointer text-center"
                                >
                                  Preview
                                </button>
                                <button 
                                  onClick={() => router.push(`/dashboard/products/edit?id=${product.id}`)}
                                  className="text-[9px] font-bold uppercase tracking-widest border border-gray-400 px-4 py-2 hover:bg-black hover:text-white hover:border-black transition-all cursor-pointer text-center"
                                >
                                  Modify
                                </button>
                                <button 
                                  onClick={() => handleMarkAsSoldClick(product)}
                                  disabled={product.stock === 0}
                                  className={`text-[9px] flex gap-2 items-center border-[1.85px] border-[#ba1a1a] font-bold uppercase tracking-widest transition-colors py-2 px-3 text-center cursor-pointer
                                    ${product.stock === 0 
                                      ? 'text-neutral-350 line-through cursor-not-allowed' 
                                      : 'text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white'}`}
                                >
                                  Mark Sold <CheckSquare size={14} strokeWidth={1}/>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}

                {activeTab === 'Orders' && (
                  <div className="space-y-8 text-left py-2">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                      <div>
                        <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-[#020302] mb-2">Orders</h2>
                        <p className="text-sm text-[#5e5e5d] font-semibold leading-relaxed">View and track wholesale orders placed by your retail clients.</p>
                      </div>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-4">
                      {[
                        { id: '#8492', client: 'Alex Merchant', items: '3x iPhone 15 Pro Max', total: '৳435,000', status: 'Processing', date: '45 mins ago' },
                        { id: '#8491', client: 'Zenith Retail', items: '5x Galaxy A35 5G', total: '৳192,500', status: 'Shipped', date: '3 hours ago' },
                        { id: '#8490', client: 'Dhaka Gadgets', items: '2x OnePlus 12', total: '৳158,000', status: 'Delivered', date: 'Yesterday' },
                        { id: '#8489', client: 'Apex Mobile', items: '10x Redmi Note 13 Pro', total: '৳295,000', status: 'Delivered', date: '2 days ago' }
                      ].map((order) => (
                        <div key={order.id} className="bg-white border border-[#efeded] p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-black transition-all">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-[#020302]">{order.id}</span>
                              <span className={`text-[9px] font-bold uppercase tracking-widest py-0.5 px-2 rounded-xs ${
                                order.status === 'Processing' 
                                  ? 'bg-amber-50 text-amber-700' 
                                  : order.status === 'Shipped' 
                                    ? 'bg-blue-50 text-blue-700' 
                                    : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-[#020302]">{order.client}</p>
                            <p className="text-xs text-[#5e5e5d] mt-1">{order.items}</p>
                          </div>
                          <div className="text-left md:text-right shrink-0">
                            <p className="text-sm font-bold text-black">{order.total}</p>
                            <p className="text-[10px] text-[#5e5e5d] opacity-60 mt-1 font-medium">{order.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'Notifications' && (
                  <div className="space-y-8 text-left py-2">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                      <div>
                        <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-[#020302] mb-2">Notifications</h2>
                        <p className="text-sm text-[#5e5e5d] font-semibold leading-relaxed">Manage your stock alerts, sales updates, and system messages.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                        }}
                        className="px-6 py-2.5 border border-[#020302] text-[#020302] hover:bg-[#f5f3f3] transition-colors text-xs font-bold tracking-widest uppercase cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-8 mb-8 border-b border-[#efeded]">
                      {['All', 'Inventory', 'Sales', 'Account'].map((cat) => {
                        const isActive = notificationFilter === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setNotificationFilter(cat)}
                            className={`pb-4 text-[11px] font-bold uppercase tracking-widest transition-all relative cursor-pointer ${
                              isActive 
                                ? 'text-black border-b-2 border-black' 
                                : 'text-[#5e5e5d] hover:text-[#020302]'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-4">
                      {notifications.filter(n => {
                        if (notificationFilter === 'All') return true;
                        return n.type.toLowerCase() === notificationFilter.toLowerCase();
                      }).length === 0 ? (
                        <div className="bg-white border border-[#efeded] p-12 text-center text-sm text-[#5e5e5d]">
                          No notifications found in this category.
                        </div>
                      ) : (
                        notifications.filter(n => {
                          if (notificationFilter === 'All') return true;
                          return n.type.toLowerCase() === notificationFilter.toLowerCase();
                        }).map((notif) => (
                          <div 
                            key={notif.id}
                            className={`group p-6 border transition-all duration-300 flex gap-6 items-start ${
                              notif.unread 
                                ? 'bg-white border-[#c7c7bf] hover:border-[#020302]' 
                                : 'bg-[#f5f3f3] border-transparent hover:bg-[#efeded]'
                            }`}
                          >
                            {/* Left Status Icon */}
                            <div className="flex-shrink-0 w-12 h-12 bg-white border border-[#c7c7bf] flex items-center justify-center">
                              {notif.image ? (
                                <img src={notif.image} className="w-full h-full object-cover" alt="Product thumbnail" />
                              ) : notif.type === 'inventory' ? (
                                <AlertTriangle size={18} className="text-[#ba1a1a]" />
                              ) : notif.type === 'sales' ? (
                                <Receipt size={18} className="text-[#020302]" />
                              ) : (
                                <Globe size={18} className="text-[#020302]" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {notif.unread && <span className="w-1.5 h-1.5 bg-[#ba1a1a] rounded-full"></span>}
                                <h3 className={`text-xs font-bold uppercase tracking-wider ${notif.unread ? 'text-[#020302]' : 'text-[#5e5e5d]'}`}>
                                  {notif.title}
                                </h3>
                                <span className="text-[10px] text-[#5e5e5d] opacity-60 ml-auto font-medium">{notif.time}</span>
                              </div>
                              
                              <p className={`text-sm leading-relaxed ${notif.actionText ? 'mb-4' : ''} ${notif.unread ? 'text-[#020302]' : 'text-[#5e5e5d]'}`}>
                                {notif.message}
                              </p>

                              {notif.actionText && (
                                <button 
                                  onClick={() => {
                                    if (notif.actionText === 'Restock Now') {
                                      handleTabChange('Products');
                                    } else {
                                      alert('Performance Report is ready! Sales grew by 14% this month.');
                                    }
                                  }}
                                  className="px-5 py-2.5 bg-[#020302] text-white hover:bg-neutral-900 transition-colors text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                                >
                                  {notif.actionText}
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </main>

            {/* Mobile Footer Navigation */}
            <div className="lg:hidden bg-white border-t border-[#efeded] px-6 py-3 flex items-center justify-between sticky bottom-0 w-full z-10 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
              <button 
                onClick={() => setActiveTab('Home')}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'Home' ? 'text-[#020302] font-bold' : 'text-[#5e5e5d] opacity-60 font-semibold'
                }`}
              >
                <Home size={18} className="stroke-[2.2]" />
                <span className="text-[10px]">Home</span>
              </button>

              <button 
                onClick={() => setActiveTab('Orders')}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer relative ${
                  activeTab === 'Orders' ? 'text-[#020302] font-bold' : 'text-[#5e5e5d] opacity-60 font-semibold'
                }`}
              >
                <ShoppingBag size={18} className="stroke-[2.2]" />
                <span className="text-[10px]">Orders</span>
                <span className="absolute -top-1 -right-2 bg-blue-50 text-blue-600 text-[8px] px-1 rounded-full font-bold">12</span>
              </button>
              
              {/* Central Floating Navigation Twin Buttons */}
              <div className="relative -mt-6 flex items-center gap-2 flex-shrink-0">
                {/* Floating Plus Button (Add Product) */}
                <button 
                  onClick={() => router.push('/dashboard/products/new')}
                  className="w-11 h-11 bg-[#020302] hover:bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-black/10 hover:scale-[1.08] active:scale-[0.95] transition-all border-[3px] border-white cursor-pointer"
                  aria-label="Add Product"
                >
                  <Plus size={18} className="stroke-[3]" />
                </button>

                {/* Floating Shopping Bag Button (Complete Sale / Checkout) */}
                <button 
                  onClick={handleOpenCheckout}
                  className="w-11 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/10 hover:scale-[1.08] active:scale-[0.95] transition-all border-[3px] border-white cursor-pointer"
                  aria-label="Complete Sale (POS)"
                >
                  <ShoppingBag size={16} className="stroke-[2.5]" />
                </button>
              </div>
              
              <button 
                onClick={() => setActiveTab('Products')}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'Products' ? 'text-[#020302] font-bold' : 'text-[#5e5e5d] opacity-60 font-semibold'
                }`}
              >
                <Package size={18} className="stroke-[2.2]" />
                <span className="text-[10px]">Products</span>
              </button>

              <button 
                onClick={() => setActiveTab('More')}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'More' ? 'text-[#020302] font-bold' : 'text-[#5e5e5d] opacity-60 font-semibold'
                }`}
              >
                <MoreHorizontal size={18} className="stroke-[2.2]" />
                <span className="text-[10px]">More</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 8. Share Shop Card Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-gray-100 flex flex-col p-6 text-center space-y-6"
            >
              {/* Top Graphic Indicator */}
              <div className="w-16 h-16 bg-shopify-green/10 rounded-3xl flex items-center justify-center text-shopify-green mx-auto shadow-inner shadow-shopify-green/5">
                <Sparkles size={26} className="fill-shopify-green animate-pulse" />
              </div>

              <div>
                <h3 className="text-xl font-sans font-medium text-[#1a1c1d] tracking-tight">Your Shop Card is Live!</h3>
                <p className="text-xs text-gray-600 font-light mt-1.5 leading-relaxed px-4">
                  Anyone visiting this link can view your live in-stock inventory & inquire instantly via WhatsApp.
                </p>
              </div>

              {/* URL Display Card */}
              <div className="bg-[#f6f6f7] p-3 rounded-2xl flex items-center justify-between gap-3 border border-gray-100">
                <div className="flex-1 overflow-hidden pl-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-left">Public URL</p>
                  <p className="text-xs font-semibold text-gray-700 truncate text-left mt-0.5 select-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/shop-card` : 'https://zenvy.com/shop-card'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    const link = typeof window !== 'undefined' ? `${window.location.origin}/shop-card` : '';
                    if (link) {
                      navigator.clipboard.writeText(link);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                      if (typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(80);
                      }
                    }
                  }}
                  className={`py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shrink-0 ${
                    copiedLink 
                      ? 'bg-shopify-green text-white shadow-md' 
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {copiedLink ? <CheckCircle2 size={13} /> : <Share2 size={13} />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* WhatsApp Sharing Card */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a 
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! Check out my live smartphone shop catalog on Zenvy Store here: ${typeof window !== 'undefined' ? `${window.location.origin}/shop-card` : ''}. Tap to see active inventory in real-time!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#25D366]/10"
                >
                  <MessageCircle size={15} className="fill-white stroke-none" />
                  <span>Share WhatsApp</span>
                </a>
                
                <a 
                  href="/shop-card"
                  target="_blank"
                  className="bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-gray-200"
                >
                  <ExternalLink size={14} />
                  <span>Open Page</span>
                </a>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest pt-2 hover:underline"
              >
                Close Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#fbf9f9]">
        <div className="text-sm font-light text-[#5e5e5d] animate-pulse">Loading dashboard...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
