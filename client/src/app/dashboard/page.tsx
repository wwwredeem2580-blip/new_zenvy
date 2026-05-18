"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
  CheckSquare,
  Settings,
  BarChart3,
  HelpCircle,
  User
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
  const { storeName, setStoreName, storeLocation, setStoreLocation, whatsAppNumber, setWhatsAppNumber } = useZenvy();
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
      if (['Home', 'Products', 'Orders', 'Notifications', 'Settings'].includes(formatted)) {
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
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [activeProductFilter, setActiveProductFilter] = useState('All');
  const [previewingProduct, setPreviewingProduct] = useState<Product | null>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Settings page state variables
  const [settingsShopName, setSettingsShopName] = useState(storeName || 'The Curator Shop');
  const [settingsLocation, setSettingsLocation] = useState(storeLocation || 'London, United Kingdom');
  const [settingsPhone, setSettingsPhone] = useState('+44 20 7946 0958');
  const [settingsWhatsApp, setSettingsWhatsApp] = useState(whatsAppNumber || '');
  const [settingsLowStockThreshold, setSettingsLowStockThreshold] = useState(10);
  const [settingsSmsAlerts, setSettingsSmsAlerts] = useState(true);
  const [settingsInAppAlerts, setSettingsInAppAlerts] = useState(false);
  const [settingsLogo, setSettingsLogo] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuBa57kiXc7qcfwueIRVjI60qXnR6i4vEl2uIBNUoni4KLDMS_0WJDFeHRWXQ98aNylSe5CrZMilF7dAHlkpjSEo2IGayEmUsKK-p4MoAEXvEHVQGHzEnO48N74InWKqKUcTl_zbfESZaPZr_u2MvDGoOEJZ5DUb6OofjRNFid5aXnPSXJcdMy3DKBX41lDORELk8Jp9U0oLAnCPuUYpp5gWSdh-m5f2M7K_Jyl6h-FHOtw43YkxQS5jQAyP18VCEeeuKpsXsasaJ4UG');

  useEffect(() => {
    if (storeName) {
      setSettingsShopName(storeName);
    }
  }, [storeName]);

  useEffect(() => {
    if (storeLocation) {
      setSettingsLocation(storeLocation);
    }
  }, [storeLocation]);

  useEffect(() => {
    if (whatsAppNumber) {
      setSettingsWhatsApp(whatsAppNumber);
    }
  }, [whatsAppNumber]);

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

  // Onboarding Checklist States
  const [onboardingDismissed, setOnboardingDismissed] = useState<boolean>(true);
  const [onboardingCollapsed, setOnboardingCollapsed] = useState<boolean>(false);
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);
  const [checklist, setChecklist] = useState({
    addFirstProduct: false,
    setUpShopProfile: false,
    seeShopCard: false,
    recordFirstSale: false,
    setLowStockAlert: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('zenvy_onboardingDismissed') === 'true';
      setOnboardingDismissed(dismissed);

      // Collapsible logic: default open on first visit, collapsed on subsequent visits
      const hasSeen = localStorage.getItem('zenvy_onboardingSeen') === 'true';
      const collapsedStored = localStorage.getItem('zenvy_onboardingCollapsed') === 'true';
      if (!hasSeen) {
        localStorage.setItem('zenvy_onboardingSeen', 'true');
        setOnboardingCollapsed(false);
      } else {
        setOnboardingCollapsed(collapsedStored);
      }

      const celebrated = localStorage.getItem('zenvy_onboardingCelebrated') === 'true';
      setHasCelebrated(celebrated);
    }
  }, []);

  const recalculateOnboarding = () => {
    if (typeof window !== 'undefined') {
      const addFirstProduct = localStorage.getItem('zenvy_checklist_addFirstProduct') === 'true' || productList.length > 5;
      
      const defaultLogo = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBa57kiXc7qcfwueIRVjI60qXnR6i4vEl2uIBNUoni4KLDMS_0WJDFeHRWXQ98aNylSe5CrZMilF7dAHlkpjSEo2IGayEmUsKK-p4MoAEXvEHVQGHzEnO48N74InWKqKUcTl_zbfESZaPZr_u2MvDGoOEJZ5DUb6OofjRNFid5aXnPSXJcdMy3DKBX41lDORELk8Jp9U0oLAnCPuUYpp5gWSdh-m5f2M7K_Jyl6h-FHOtw43YkxQS5jQAyP18VCEeeuKpsXsasaJ4UG';
      const setUpShopProfile = localStorage.getItem('zenvy_checklist_setUpShopProfile') === 'true' || settingsLogo !== defaultLogo || settingsWhatsApp.trim() !== '';
      
      const seeShopCard = localStorage.getItem('zenvy_checklist_seeShopCard') === 'true';
      
      const hasSale = recentActivities.some(a => a.type === 'sold') || localStorage.getItem('zenvy_checklist_recordFirstSale') === 'true';
      const recordFirstSale = addFirstProduct && hasSale;
      
      const setLowStockAlert = localStorage.getItem('zenvy_checklist_setLowStockAlert') === 'true' || settingsLowStockThreshold !== 10;

      setChecklist({
        addFirstProduct,
        setUpShopProfile,
        seeShopCard,
        recordFirstSale,
        setLowStockAlert,
      });
    }
  };

  useEffect(() => {
    recalculateOnboarding();
  }, [productList, recentActivities, settingsLogo, settingsWhatsApp, settingsLowStockThreshold]);

  useEffect(() => {
    const handleUpdate = () => {
      recalculateOnboarding();
    };
    window.addEventListener('zenvy_onboarding_update', handleUpdate);
    return () => window.removeEventListener('zenvy_onboarding_update', handleUpdate);
  }, [productList, recentActivities, settingsLogo, settingsWhatsApp, settingsLowStockThreshold]);

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalItems = 5;

  useEffect(() => {
    if (completedCount === 5 && !hasCelebrated) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      setHasCelebrated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('zenvy_onboardingCelebrated', 'true');
      }
    }
  }, [completedCount, hasCelebrated]);

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

  // Listen for Cmd+K / Ctrl+K global search shortcut and Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsGlobalSearchOpen(false);
        setGlobalSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global search filtering
  const filteredSearchProducts = globalSearchQuery.trim() === ''
    ? productList.slice(0, 3) // show first 3 items as suggestions when query is empty
    : productList.filter((product) => {
        const query = globalSearchQuery.toLowerCase();
        
        // Match brand or name
        const matchBrand = product.brand?.toLowerCase().includes(query) || false;
        const matchName = product.name.toLowerCase().includes(query);
        
        // Match any variant specs (color, ram, storage, sku)
        const matchVariants = product.variants?.some(v => 
          v.color.toLowerCase().includes(query) ||
          v.ram.toLowerCase().includes(query) ||
          v.storage.toLowerCase().includes(query) ||
          v.sku?.toLowerCase().includes(query)
        ) || false;
        
        return matchBrand || matchName || matchVariants;
      });

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
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#efeded] h-full z-20 flex-shrink-0 text-left select-none">
        <nav className="flex-grow overflow-y-auto min-h-0 pt-8">
          {/* General Section */}
          <div className="space-y-1">
            <p className="px-6 text-[10px] uppercase tracking-[0.16em] text-[#a3a3a3] font-bold mb-2.5">General</p>
            
            <button 
              onClick={() => handleTabChange('Home')}
              className={`w-full flex items-center gap-3.5 py-2.5 px-6 transition-all text-left cursor-pointer border-r-[3.5px] text-[13px] tracking-tight relative group ${
                activeTab === 'Home' 
                  ? 'text-[#020302] font-semibold bg-[#f4f4f5] border-[#020302]' 
                  : 'text-[#5e5e5d] hover:text-[#020302] hover:bg-[#f4f4f5]/30 border-transparent font-medium'
              }`}
            >
              <Home size={16} className={`stroke-[1.8] ${activeTab === 'Home' ? 'text-[#020302]' : 'text-[#5e5e5d] group-hover:text-[#020302]'}`} />
              <span>Home</span>
            </button>

            <button 
              onClick={() => handleTabChange('Products')}
              className={`w-full flex items-center gap-3.5 py-2.5 px-6 transition-all text-left cursor-pointer border-r-[3.5px] text-[13px] tracking-tight relative group ${
                activeTab === 'Products' 
                  ? 'text-[#020302] font-semibold bg-[#f4f4f5] border-[#020302]' 
                  : 'text-[#5e5e5d] hover:text-[#020302] hover:bg-[#f4f4f5]/30 border-transparent font-medium'
              }`}
            >
              <Package size={16} className={`stroke-[1.8] ${activeTab === 'Products' ? 'text-[#020302]' : 'text-[#5e5e5d] group-hover:text-[#020302]'}`} />
              <span>Products</span>
            </button>

            <button 
              onClick={() => handleTabChange('Orders')}
              className={`w-full flex items-center gap-3.5 py-2.5 px-6 transition-all text-left cursor-pointer border-r-[3.5px] text-[13px] tracking-tight relative group ${
                activeTab === 'Orders' 
                  ? 'text-[#020302] font-semibold bg-[#f4f4f5] border-[#020302]' 
                  : 'text-[#5e5e5d] hover:text-[#020302] hover:bg-[#f4f4f5]/30 border-transparent font-medium'
              }`}
            >
              <ShoppingBag size={16} className={`stroke-[1.8] ${activeTab === 'Orders' ? 'text-[#020302]' : 'text-[#5e5e5d] group-hover:text-[#020302]'}`} />
              <span>Orders</span>
              <span className="ml-auto bg-[#e0e7ff]/70 text-[#3730a3] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">12</span>
            </button>

            <button 
              onClick={handleOpenCheckout}
              className="w-full flex items-center gap-3.5 py-2.5 px-6 transition-all text-left cursor-pointer border-r-[3.5px] border-transparent text-[#5e5e5d] hover:text-[#020302] hover:bg-[#f4f4f5]/30 font-medium text-[13px] tracking-tight relative group"
            >
              <ShoppingBag size={16} className="stroke-[1.8] text-emerald-600" />
              <span>POS Terminal</span>
              <span className="ml-auto bg-emerald-50 text-emerald-700 text-[8px] px-1.5 py-0.5 rounded-[3px] font-bold uppercase tracking-wider">POS</span>
            </button>
          </div>

          {/* Favorites Section */}
          <div className="mt-8 space-y-1">
            <p className="px-6 text-[10px] uppercase tracking-[0.16em] text-[#a3a3a3] font-bold mb-2.5">Favorites</p>
            <button 
              onClick={() => {}}
              className="w-full text-left py-2 px-6 pl-[52px] text-[#5e5e5d] hover:text-[#020302] hover:bg-[#f4f4f5]/30 transition-colors text-[13px] font-medium tracking-tight cursor-pointer block"
            >
              Sales analytics
            </button>
            <button 
              onClick={() => {}}
              className="w-full text-left py-2 px-6 pl-[52px] text-[#5e5e5d] hover:text-[#020302] hover:bg-[#f4f4f5]/30 transition-colors text-[13px] font-medium tracking-tight cursor-pointer block"
            >
              Inventory reports
            </button>
          </div>

          {/* Management Section */}
          <div className="mt-8 space-y-1">
            <p className="px-6 text-[10px] uppercase tracking-[0.16em] text-[#a3a3a3] font-bold mb-2.5">Management</p>
            
            <button 
              onClick={() => handleTabChange('Notifications')}
              className={`w-full flex items-center gap-3.5 py-2.5 px-6 transition-all text-left cursor-pointer border-r-[3.5px] text-[13px] tracking-tight relative group ${
                activeTab === 'Notifications' 
                  ? 'text-[#020302] font-semibold bg-[#f4f4f5] border-[#020302]' 
                  : 'text-[#5e5e5d] hover:text-[#020302] hover:bg-[#f4f4f5]/30 border-transparent font-medium'
              }`}
            >
              <Bell size={16} className={`stroke-[1.8] ${activeTab === 'Notifications' ? 'text-[#020302]' : 'text-[#5e5e5d] group-hover:text-[#020302]'}`} />
              <span>Notifications</span>
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="ml-auto bg-[#ba1a1a]/10 text-[#ba1a1a] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {notifications.filter(n => n.unread).length}
                </span>
              )}
            </button>

            <button 
              onClick={() => {}}
              className="w-full flex items-center gap-3.5 py-2.5 px-6 transition-all text-left cursor-pointer border-r-[3.5px] border-transparent text-[#5e5e5d] hover:text-[#020302] hover:bg-[#f4f4f5]/30 font-medium text-[13px] tracking-tight relative group"
            >
              <BarChart3 size={16} className="stroke-[1.8] text-[#5e5e5d] group-hover:text-[#020302]" />
              <span>Analytics</span>
            </button>

            <button 
              onClick={() => handleTabChange('Settings')}
              className={`w-full flex items-center gap-3.5 py-2.5 px-6 transition-all text-left cursor-pointer border-r-[3.5px] text-[13px] tracking-tight relative group ${
                activeTab === 'Settings' 
                  ? 'text-[#020302] font-semibold bg-[#f4f4f5] border-[#020302]' 
                  : 'text-[#5e5e5d] hover:text-[#020302] hover:bg-[#f4f4f5]/30 border-transparent font-medium'
              }`}
            >
              <Settings size={16} className={`stroke-[1.8] ${activeTab === 'Settings' ? 'text-[#020302]' : 'text-[#5e5e5d] group-hover:text-[#020302]'}`} />
              <span>Settings</span>
            </button>
          </div>
        </nav>

        {/* Footer block */}
        <footer className="mt-auto border-t border-[#efeded] p-6 bg-white flex-shrink-0 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#020302] text-white flex items-center justify-center font-bold text-xs select-none">
              {storeName ? storeName.substring(0, 2).toUpperCase() : 'HW'}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#020302] leading-none font-bold truncate">{storeName || 'My Store'}</p>
              <p className="text-[8px] text-[#a3a3a3] font-bold uppercase tracking-widest mt-1">PREMIUM PLAN</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2.5 pt-2">
            <button className="w-full flex items-center gap-3.5 py-1 text-[#5e5e5d] hover:text-[#020302] transition-colors text-left text-[13px] font-medium tracking-tight cursor-pointer">
              <HelpCircle size={16} className="stroke-[1.8]" />
              <span>Support</span>
            </button>
            <button className="w-full flex items-center gap-3.5 py-1 text-[#5e5e5d] hover:text-[#020302] transition-colors text-left text-[13px] font-medium tracking-tight cursor-pointer">
              <User size={16} className="stroke-[1.8]" />
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
                <div 
                  onClick={() => setIsGlobalSearchOpen(true)}
                  className="hidden md:flex items-center relative w-64 cursor-pointer select-none"
                >
                  <Search size={14} className="absolute left-3 text-[#5e5e5d] opacity-60" />
                  <div className="w-full bg-[#f5f3f3] border border-transparent rounded-sm py-1.5 pl-9 pr-12 text-xs font-semibold text-[#5e5e5d]/60 hover:bg-[#efeded]/70 transition-all text-left">
                    Search inventory...
                  </div>
                  <div className="absolute right-2 px-1.5 py-0.5 border border-[#c7c7bf]/30 rounded-sm text-[8px] font-bold text-[#5e5e5d]/60 bg-white shadow-2xs pointer-events-none">
                    ⌘ K
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleShareShopCard}
                    className="flex items-center bg-[#f5f3f3] hover:bg-[#efeded] px-2.5 sm:px-3 py-1.5 rounded-sm text-[10px] font-bold text-[#020302] transition-colors cursor-pointer select-none gap-2 border border-transparent hover:border-[#dbdad9]"
                    title="Share Live Storefront Link"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="hidden sm:inline">LIVE STORE</span>
                    <Share2 size={11} className="text-[#5e5e5d] stroke-[2.5]" />
                  </button>
                  <button 
                    onClick={() => setIsGlobalSearchOpen(true)}
                    className="p-2 hover:bg-[#f5f3f3]/50 rounded-sm transition-all relative cursor-pointer md:hidden"
                    title="Quick Search"
                  >
                    <Search size={18} className="text-[#020302] stroke-[2]" />
                  </button>
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
                    </div>

                    {/* Onboarding Checklist Guide / Celebration Card */}
                    {!onboardingDismissed && (
                      <div className="bg-white border border-[#efeded] rounded-sm p-6 space-y-5 shadow-xs relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-radial-gradient(circle_at_top_right,rgba(0,0,0,0.02),transparent) pointer-events-none"></div>
                        {completedCount === 5 ? (
                          /* Celebration Mode Card */
                          <div className="flex flex-col items-center text-center py-6 px-4 space-y-4">
                            {/* Animated Big Checkmark Ring */}
                            <motion.div 
                              initial={{ scale: 0.8, rotate: -10 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 200 }}
                              className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-md"
                            >
                              <Check size={32} className="stroke-[3.5]" />
                            </motion.div>
                            
                            <div className="space-y-1">
                              <h3 className="text-lg font-bold text-[#020302] tracking-tight">Your shop is now ready on Zenvy! 🎉</h3>
                              <p className="text-xs text-[#5e5e5d] leading-relaxed max-w-md font-medium">
                                Congratulations! You have completed all onboarding setup steps. From now on, manage everything from stock, sales, to analytics all in one sleek place.
                              </p>
                            </div>
                            
                            <button
                              onClick={() => {
                                setOnboardingDismissed(true);
                                localStorage.setItem('zenvy_onboardingDismissed', 'true');
                                toast.success("Let's grow your business!");
                              }}
                              className="px-6 py-2.5 bg-[#020302] hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-xs active:scale-98 cursor-pointer"
                            >
                              Start Managing
                            </button>
                          </div>
                        ) : (
                          /* Standard Checklist Card */
                          <div className="space-y-4">
                            {/* Card Header */}
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-widest flex items-center gap-1.5 select-none">
                                  <Sparkles size={11} className="text-[#020302] fill-[#020302]/10" />
                                  Onboarding Guide
                                </p>
                                <h3 className="text-base font-bold text-[#020302] tracking-tight">Set up your premium storefront</h3>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => {
                                    const nextVal = !onboardingCollapsed;
                                    setOnboardingCollapsed(nextVal);
                                    localStorage.setItem('zenvy_onboardingCollapsed', String(nextVal));
                                  }}
                                  className="text-[10px] font-bold text-[#5e5e5d] hover:text-[#020302] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  {onboardingCollapsed ? 'Expand Checklist' : 'Collapse'}
                                </button>
                                
                                <button 
                                  onClick={() => {
                                    if (confirm('Are you sure you want to dismiss the onboarding guide permanently?')) {
                                      setOnboardingDismissed(true);
                                      localStorage.setItem('zenvy_onboardingDismissed', 'true');
                                      toast.info('Onboarding guide dismissed.');
                                    }
                                  }}
                                  className="text-[10px] font-bold text-[#ba1a1a]/80 hover:text-[#ba1a1a] uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                            
                            {/* Progress bar info */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#5e5e5d]">
                                <span>{completedCount} of {totalItems} completed</span>
                                <span>Total Time: Almost 5 Minutes</span>
                              </div>
                              <div className="w-full h-1.5 bg-[#f5f3f3] rounded-full overflow-hidden border border-[#efeded]">
                                <motion.div 
                                  className="h-full bg-[#020302] rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(completedCount / totalItems) * 100}%` }}
                                  transition={{ duration: 0.4, ease: 'easeOut' }}
                                />
                              </div>
                            </div>

                            {/* Checklist items list */}
                            <AnimatePresence initial={false}>
                              {!onboardingCollapsed && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="space-y-3 pt-2 overflow-hidden"
                                >
                                  
                                  {/* Item 1: Add first product */}
                                  <div className={`p-4 border rounded-sm flex items-start gap-4 transition-all ${
                                    checklist.addFirstProduct ? 'bg-[#fbf9f9] border-[#efeded]/70 opacity-70' : 'bg-white border-[#efeded] hover:border-[#dbdad9]'
                                  }`}>
                                    <div className="pt-0.5">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                        checklist.addFirstProduct ? 'bg-[#020302] border-[#020302] text-white' : 'border-[#c7c7bf] bg-white text-transparent'
                                      }`}>
                                        <Check size={12} className="stroke-[3]" />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${checklist.addFirstProduct ? 'line-through text-[#5e5e5d]/60' : 'text-[#020302]'}`}>
                                          Add your first product
                                        </h4>
                                        <span className="text-[10px] text-[#5e5e5d]/60 font-semibold">(2 Minutes)</span>
                                      </div>
                                      <p className="text-[11px] text-[#5e5e5d] font-medium leading-relaxed mt-0.5">
                                        Add your first smartphone with variants and prices. Try prefilling a Samsung Galaxy demo to skip the blank page paralysis.
                                      </p>
                                      {!checklist.addFirstProduct && (
                                        <button 
                                          onClick={() => router.push('/dashboard/products/new')}
                                          className="mt-2.5 px-3 h-[26px] bg-[#020302] hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-xs flex items-center justify-center transition-all cursor-pointer"
                                        >
                                          Start Adding
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Item 2: Set up shop profile */}
                                  <div className={`p-4 border rounded-sm flex items-start gap-4 transition-all ${
                                    checklist.setUpShopProfile ? 'bg-[#fbf9f9] border-[#efeded]/70 opacity-70' : 'bg-white border-[#efeded] hover:border-[#dbdad9]'
                                  }`}>
                                    <div className="pt-0.5">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                        checklist.setUpShopProfile ? 'bg-[#020302] border-[#020302] text-white' : 'border-[#c7c7bf] bg-white text-transparent'
                                      }`}>
                                        <Check size={12} className="stroke-[3]" />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${checklist.setUpShopProfile ? 'line-through text-[#5e5e5d]/60' : 'text-[#020302]'}`}>
                                          Set up your shop profile
                                        </h4>
                                        <span className="text-[10px] text-[#5e5e5d]/60 font-semibold">(1 Minute)</span>
                                      </div>
                                      <p className="text-[11px] text-[#5e5e5d] font-medium leading-relaxed mt-0.5">
                                        Your logo and WhatsApp hotline will make your generated invoices and public storefront catalog feel extremely professional.
                                      </p>
                                      {!checklist.setUpShopProfile && (
                                        <button 
                                          onClick={() => handleTabChange('Settings')}
                                          className="mt-2.5 px-3 h-[26px] bg-[#020302] hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-xs flex items-center justify-center transition-all cursor-pointer"
                                        >
                                          Configure Settings
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Item 3: See your shop card */}
                                  <div className={`p-4 border rounded-sm flex items-start gap-4 transition-all ${
                                    checklist.seeShopCard ? 'bg-[#fbf9f9] border-[#efeded]/70 opacity-70' : 'bg-white border-[#efeded] hover:border-[#dbdad9]'
                                  }`}>
                                    <div className="pt-0.5">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                        checklist.seeShopCard ? 'bg-[#020302] border-[#020302] text-white' : 'border-[#c7c7bf] bg-white text-transparent'
                                      }`}>
                                        <Check size={12} className="stroke-[3]" />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${checklist.seeShopCard ? 'line-through text-[#5e5e5d]/60' : 'text-[#020302]'}`}>
                                          See your shop card
                                        </h4>
                                        <span className="text-[10px] text-[#5e5e5d]/60 font-semibold">(30 Seconds)</span>
                                      </div>
                                      <p className="text-[11px] text-[#5e5e5d] font-medium leading-relaxed mt-0.5">
                                        Share this custom link with your customers — they can browse your active stock levels in real-time and query you directly.
                                      </p>
                                      <div className="flex gap-2 mt-2.5">
                                        <button 
                                          onClick={() => {
                                            const url = window.location.origin + '/shop-card';
                                            navigator.clipboard.writeText(url);
                                            toast.success('Shop link copied to clipboard!');
                                            localStorage.setItem('zenvy_checklist_seeShopCard', 'true');
                                            recalculateOnboarding();
                                            window.dispatchEvent(new Event('zenvy_onboarding_update'));
                                          }}
                                          className="px-3 h-[26px] bg-[#020302] hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-xs flex items-center justify-center transition-all cursor-pointer gap-1"
                                        >
                                          Copy Link
                                        </button>
                                        <button 
                                          onClick={() => {
                                            const url = window.location.origin + '/shop-card';
                                            window.open(url, '_blank');
                                            localStorage.setItem('zenvy_checklist_seeShopCard', 'true');
                                            recalculateOnboarding();
                                            window.dispatchEvent(new Event('zenvy_onboarding_update'));
                                          }}
                                          className="px-3 h-[26px] bg-white border border-[#efeded] hover:bg-neutral-50 text-[#020302] text-[9px] font-bold uppercase tracking-widest rounded-xs flex items-center justify-center transition-all cursor-pointer gap-1"
                                        >
                                          <ExternalLink size={10} />
                                          Preview
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Item 4: Record your first sale */}
                                  <div className={`p-4 border rounded-sm flex items-start gap-4 transition-all ${
                                    checklist.recordFirstSale ? 'bg-[#fbf9f9] border-[#efeded]/70 opacity-70' : 
                                    !checklist.addFirstProduct ? 'bg-neutral-50/50 border-[#efeded] opacity-50' : 'bg-white border-[#efeded] hover:border-[#dbdad9]'
                                  }`}>
                                    <div className="pt-0.5">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                        checklist.recordFirstSale ? 'bg-[#020302] border-[#020302] text-white' : 'border-[#c7c7bf] bg-white text-transparent'
                                      }`}>
                                        <Check size={12} className="stroke-[3]" />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${checklist.recordFirstSale ? 'line-through text-[#5e5e5d]/60' : 'text-[#020302]'}`}>
                                          Record your first sale
                                        </h4>
                                        <span className="text-[10px] text-[#5e5e5d]/60 font-semibold">(1 Minute)</span>
                                      </div>
                                      <p className="text-[11px] text-[#5e5e5d] font-medium leading-relaxed mt-0.5">
                                        Create a fast invoice for a customer. Send it to them via WhatsApp to experience the complete billing & transaction loop.
                                      </p>
                                      {!checklist.recordFirstSale && (
                                        <div className="mt-2.5 flex items-center gap-2">
                                          {checklist.addFirstProduct ? (
                                            <button 
                                              onClick={() => setPosCheckoutOpen(true)}
                                              className="px-3 h-[26px] bg-[#020302] hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-xs flex items-center justify-center transition-all cursor-pointer"
                                            >
                                              Open POS Terminal
                                            </button>
                                          ) : (
                                            <span className="text-[9px] font-bold text-neutral-400 bg-neutral-100 py-1 px-2.5 rounded-sm uppercase tracking-widest select-none">
                                              🔒 Add a product first
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Item 5: Set a low stock alert */}
                                  <div className={`p-4 border rounded-sm flex items-start gap-4 transition-all ${
                                    checklist.setLowStockAlert ? 'bg-[#fbf9f9] border-[#efeded]/70 opacity-70' : 'bg-white border-[#efeded] hover:border-[#dbdad9]'
                                  }`}>
                                    <div className="pt-0.5">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                        checklist.setLowStockAlert ? 'bg-[#020302] border-[#020302] text-white' : 'border-[#c7c7bf] bg-white text-transparent'
                                      }`}>
                                        <Check size={12} className="stroke-[3]" />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h4 className={`text-xs font-bold uppercase tracking-wider ${checklist.setLowStockAlert ? 'line-through text-[#5e5e5d]/60' : 'text-[#020302]'}`}>
                                          Set a low stock alert
                                        </h4>
                                        <span className="text-[10px] text-[#5e5e5d]/60 font-semibold">(30 Seconds)</span>
                                      </div>
                                      <p className="text-[11px] text-[#5e5e5d] font-medium leading-relaxed mt-0.5">
                                        Define warning thresholds for your products so Zenvy can alert you to restock items before they sell out.
                                      </p>
                                      {!checklist.setLowStockAlert && (
                                        <button 
                                          onClick={() => handleTabChange('Settings')}
                                          className="mt-2.5 px-3 h-[26px] bg-[#020302] hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-xs flex items-center justify-center transition-all cursor-pointer"
                                        >
                                          Set Threshold
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Summary Stats Grid (Polaris-Style Flat Visuals) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 sm:gap-4">
                      {/* Stat 1: Stock Value */}
                      <div className="bg-white p-5 border border-[#efeded] shadow-2xs text-left hover:shadow-xs hover:border-[#dbdad9] transition-all">
                        <p className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-widest mb-1.5 font-sans">Stock Value</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl md:text-2xl font-bold text-[#020302] truncate max-w-full">
                            <span className="text-[13px] text-[#5e5e5d] font-semibold mr-0.5">৳</span>
                            {productList.reduce((sum, p) => sum + (p.variants?.reduce((vSum, v) => vSum + (v.sellingPrice * v.quantity), 0) || (p.stock * 32999)), 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Stat 2: Units Sold */}
                      <div className="bg-white p-5 border border-[#efeded] shadow-2xs text-left hover:shadow-xs hover:border-[#dbdad9] transition-all">
                        <p className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-widest mb-1.5 font-sans">Units Sold</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl md:text-2xl font-bold text-[#020302]">
                            {recentActivities.filter(a => a.type === 'sold').length + 8}
                          </span>
                        </div>
                      </div>

                      {/* Stat 3: Today Sales */}
                      <div className="bg-white p-5 border border-[#efeded] shadow-2xs text-left hover:shadow-xs hover:border-[#dbdad9] transition-all">
                        <p className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-widest mb-1.5 font-sans">Today Sales</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl md:text-2xl font-bold text-[#020302] truncate max-w-full font-sans">
                            <span className="text-[13px] text-[#5e5e5d] font-semibold mr-0.5">৳</span>
                            {((recentActivities.filter(a => a.type === 'sold' && (a.time.includes('min') || a.time.includes('hr') || a.time.includes('sec'))).length + 1) * 32999).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Stat 4: Low Stock Count */}
                      <div className="bg-white p-5 border border-[#efeded] shadow-2xs text-left hover:shadow-xs hover:border-[#dbdad9] transition-all">
                        <p className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-widest mb-1.5 font-sans">Low Stock Count</p>
                        <div className="flex items-baseline justify-between font-sans">
                          <span className={`text-xl md:text-2xl font-bold ${
                            productList.filter(p => {
                              if (p.variants && p.variants.length > 0) {
                                return p.variants.some(v => v.quantity <= (p.lowStockThreshold || 4));
                              }
                              return p.stock <= (p.lowStockThreshold || 4);
                            }).length > 0 ? 'text-[#b45309]' : 'text-[#020302]'
                          }`}>
                            {productList.filter(p => {
                              if (p.variants && p.variants.length > 0) {
                                return p.variants.some(v => v.quantity <= (p.lowStockThreshold || 4));
                              }
                              return p.stock <= (p.lowStockThreshold || 4);
                            }).length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Intelligent Stock Alert Panel */}
                    {(() => {
                      const lowStockProducts = productList.filter(p => {
                        if (p.variants && p.variants.length > 0) {
                          return p.variants.some(v => v.quantity <= (p.lowStockThreshold || 4));
                        }
                        return p.stock <= (p.lowStockThreshold || 4);
                      });
                      const alertProduct = lowStockProducts[0] || null;

                      if (alertProduct) {
                        // Find the variant or the product itself with the lowest quantity
                        let lowestVariant: any = null;
                        let lowestQty = 999;
                        if (alertProduct.variants && alertProduct.variants.length > 0) {
                          alertProduct.variants.forEach(v => {
                            if (v.quantity <= (alertProduct.lowStockThreshold || 4) && v.quantity < lowestQty) {
                              lowestQty = v.quantity;
                              lowestVariant = v;
                            }
                          });
                        } else {
                          lowestQty = alertProduct.stock;
                        }

                        const urgencyText = lowestQty === 0 ? 'Out of stock!' : `Only ${lowestQty} left`;
                        const displayName = lowestVariant 
                          ? `${alertProduct.name} ${lowestVariant.color} ${lowestVariant.ram}/${lowestVariant.storage}`
                          : alertProduct.name;

                        return (
                          <div className="bg-[#FFF9EB] p-4 border border-[#FBEAC1] rounded-sm flex items-center justify-between gap-4 text-left">
                            <div className="flex items-center gap-3.5 min-w-0">
                              {/* Product Thumbnail */}
                              <img 
                                src={alertProduct.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=120&auto=format"} 
                                alt={alertProduct.name} 
                                className="w-12 h-12 rounded-xs border border-[#efeded] object-cover bg-white shrink-0 shadow-2xs" 
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1 text-[#b45309] font-bold text-xs">
                                  <span>⚠</span>
                                  <span>{urgencyText}</span>
                                </div>
                                <h4 className="text-[13px] font-semibold text-[#020302] font-sans truncate mt-0.5">
                                  {displayName}
                                </h4>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => {
                                router.push(`/dashboard/products/edit?id=${alertProduct.id}`);
                              }}
                              className="bg-[#020302] hover:bg-neutral-800 text-white py-1.5 px-4 rounded-sm text-xs font-bold transition-all uppercase tracking-wider shrink-0 cursor-pointer active:scale-98"
                            >
                              Restock
                            </button>
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
                            <span className="bg-white border border-[#cbf5da] text-green-700 text-[10px] font-bold py-1 px-2.5 rounded-sm uppercase tracking-wider shadow-2xs">
                              All Swatches Good
                            </span>
                          </div>
                        );
                      }
                    })()}

                    {/* Recent Activity Feed - Elegant Timeline layout */}
                    <div className="bg-white border border-[#efeded] rounded-sm shadow-2xs overflow-hidden text-left p-6 space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-[#efeded]">
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

                      {/* Timeline List */}
                      <div className="relative pl-6 space-y-6">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-1.5 top-2.5 bottom-2.5 w-[1.5px] bg-[#efeded]" />

                        {recentActivities.slice(0, 5).map((item, i) => {
                          let title = 'Activity logged';
                          let dotColor = 'bg-gray-400 ring-gray-100/55';
                          
                          if (item.type === 'added') {
                            title = 'Added stock';
                            dotColor = 'bg-emerald-500 ring-emerald-100';
                          } else if (item.type === 'sold') {
                            title = 'Sold';
                            dotColor = 'bg-blue-500 ring-blue-100';
                          } else if (item.type === 'edited') {
                            title = 'Price updated';
                            dotColor = 'bg-amber-500 ring-amber-100';
                          }

                          return (
                            <div key={i} className="relative flex items-start justify-between gap-4 text-left group">
                              {/* Timeline Dot */}
                              <div className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full ring-4 ${dotColor} transition-transform group-hover:scale-110`} />
                              
                              <div className="min-w-0">
                                <h5 className="text-[13px] font-bold text-[#020302] leading-none font-sans">
                                  {title}
                                </h5>
                                <p className="text-xs text-gray-500 font-light mt-1.5 leading-snug">
                                  {item.text} <span className="text-gray-300 mx-1.5">·</span> {item.product}
                                </p>
                              </div>

                              <span className="text-[11px] text-gray-400 font-light whitespace-nowrap shrink-0">
                                {item.time}
                              </span>
                            </div>
                          );
                        })}
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

                    {/* Search Bar - Moat Typo Tolerant Quick Filter */}
                    <div className="relative w-full max-w-md mb-6">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5e5e5d] opacity-60" />
                      <input 
                        type="text" 
                        placeholder="Search model, brand, color, storage (e.g. 'blue 256')..." 
                        className="w-full bg-[#f5f3f3] border-none rounded-sm py-3 pl-10 pr-4 text-xs font-semibold text-[#020302] placeholder-[#5e5e5d]/60 focus:outline-none focus:ring-1 focus:ring-[#efeded] font-sans"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Filters & Tabs */}
                    <div className="flex flex-col md:flex-row justify-between items-center border-b border-[#efeded] mb-8 gap-4 w-full">
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
                        .filter(p => {
                          if (!searchTerm.trim()) return true;
                          const query = searchTerm.toLowerCase();
                          const keywords = query.split(/\s+/).filter(Boolean);
                          
                          const isFuzzyMatch = (target: string, kw: string) => {
                            target = target.toLowerCase();
                            kw = kw.toLowerCase();
                            if (target.includes(kw) || kw.includes(target)) return true;
                            if (kw.length >= 3) {
                              let dist = 0;
                              let i = 0, j = 0;
                              while (i < target.length && j < kw.length) {
                                if (target[i] !== kw[j]) {
                                  dist++;
                                  if (dist > 1) return false;
                                  if (target[i+1] === kw[j]) i++;
                                  else if (target[i] === kw[j+1]) j++;
                                  else { i++; j++; }
                                } else {
                                  i++; j++;
                                }
                              }
                              dist += (target.length - i) + (kw.length - j);
                              return dist <= 1;
                            }
                            return false;
                          };

                          return keywords.every(kw => {
                            const brandMatch = p.brand && isFuzzyMatch(p.brand, kw);
                            const nameMatch = isFuzzyMatch(p.name, kw);
                            const variantMatch = p.variants?.some(v => 
                              isFuzzyMatch(v.color, kw) ||
                              isFuzzyMatch(v.ram, kw) ||
                              isFuzzyMatch(v.storage, kw) ||
                              (v.sku && isFuzzyMatch(v.sku, kw))
                            );
                            return brandMatch || nameMatch || variantMatch;
                          });
                        })
                        .map((product) => (
                          <motion.div 
                            key={product.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-[#efeded] p-4 flex flex-col md:flex-row gap-8 items-start group hover:border-black transition-all duration-350 shadow-2xs hover:shadow-xs animate-none"
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
                            <div className="flex-1 flex flex-col justify-between w-full min-w-0">
                              <div className="flex flex-col lg:flex-row justify-between gap-6 items-start w-full">
                                {/* Left part: Product Brand, Name, Stock, and Price */}
                                <div className="space-y-1 text-left min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400">
                                      {product.brand || 'Smartphone'}
                                    </span>
                                    <span className="text-neutral-300 text-xs">•</span>
                                    {/* Stock Badge */}
                                    {(() => {
                                      const threshold = product.lowStockThreshold || 4;
                                      const isOutOfStock = product.stock === 0;
                                      const isLowStock = product.stock > 0 && product.stock <= threshold;

                                      if (isOutOfStock) {
                                        return <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 font-sans">Out of stock</span>;
                                      } else if (isLowStock) {
                                        return <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1 font-sans">Low stock</span>;
                                      } else {
                                        return <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 font-sans">{product.stock} in stock</span>;
                                      }
                                    })()}
                                  </div>

                                  <h3 className="text-[17px] font-bold text-black tracking-tight leading-snug font-sans truncate">
                                    {product.name}
                                  </h3>
                                  
                                  <p className="text-black font-extrabold text-base tracking-tight font-sans mt-1">
                                    {(() => {
                                      const prices = product.variants?.map(v => v.sellingPrice) || [];
                                      if (prices.length === 0) return '৳ MSRP N/A';
                                      const min = Math.min(...prices);
                                      const max = Math.max(...prices);
                                      const minK = min >= 1000 ? `${(min / 1000).toFixed(0)}k` : min.toLocaleString();
                                      const maxK = max >= 1000 ? `${(max / 1000).toFixed(0)}k` : max.toLocaleString();
                                      return min === max ? `৳${minK}` : `৳${minK} – ৳${maxK}`;
                                    })()}
                                  </p>
                                </div>

                                {/* Right part: Variants & Stock (Accordion / Badges) */}
                                <div className="flex-1 max-w-md w-full text-left">
                                  <p className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 mb-2 font-sans">Variants & Stock</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {product.variants && product.variants.length > 0 ? (
                                      product.variants.map((variant) => {
                                        const threshold = product.lowStockThreshold || 4;
                                        const isOutOfStock = variant.quantity === 0;
                                        const isLowStock = variant.quantity > 0 && variant.quantity <= threshold;

                                        return (
                                          <span 
                                            key={variant.id} 
                                            className={`px-2.5 py-0.5 text-[11px] font-medium border transition-all font-sans
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
                                            className={`px-2.5 py-0.5 text-[11px] font-medium border rounded-sm transition-all font-sans
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
                              </div>

                              {/* Action Row */}
                              <div className="flex flex-wrap gap-2.5 mt-4 pt-4 border-t border-[#efeded] w-full">
                                <button 
                                  onClick={() => handleMarkAsSoldClick(product)}
                                  disabled={product.stock === 0}
                                  className={`text-[11px] font-bold uppercase tracking-wider px-6 py-2 transition-all duration-200 cursor-pointer active:scale-97 rounded-xs font-sans
                                    ${product.stock === 0 
                                      ? 'bg-neutral-100 text-neutral-450 border border-neutral-200 cursor-not-allowed line-through' 
                                      : 'bg-[#020302] hover:bg-neutral-800 text-white shadow-2xs'}`}
                                >
                                  Sell
                                </button>
                                <button 
                                  onClick={() => router.push(`/dashboard/products/edit?id=${product.id}`)}
                                  className="bg-white hover:bg-neutral-50 text-[#020302] border border-[#efeded] text-[11px] font-bold uppercase tracking-wider px-5 py-2 transition-all duration-200 cursor-pointer active:scale-97 shadow-2xs rounded-xs font-sans"
                                >
                                  + Stock
                                </button>
                                <button 
                                  onClick={() => router.push(`/dashboard/products/edit?id=${product.id}`)}
                                  className="bg-white hover:bg-neutral-50 text-[#020302] border border-[#efeded] text-[11px] font-bold uppercase tracking-wider px-5 py-2 transition-all duration-200 cursor-pointer active:scale-97 shadow-2xs rounded-xs font-sans"
                                >
                                  Manage
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

                {activeTab === 'Settings' && (
                  <div className="space-y-12 text-left py-2 max-w-4xl mx-auto">
                    {/* Page Header */}
                    <div>
                      <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-[#020302] mb-2 font-sans">Settings</h2>
                      <p className="text-sm text-[#5e5e5d] font-semibold leading-relaxed">Manage your boutique's presence, inventory logic, and personal preferences.</p>
                    </div>

                    {/* Section 1: Shop Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                      <div className="col-span-1 space-y-1">
                        <h3 className="text-[13px] font-bold text-[#020302] uppercase tracking-wider">Shop Information</h3>
                        <p className="text-xs text-[#5e5e5d] opacity-75 font-semibold">Your public store identity and contact details.</p>
                      </div>
                      
                      <div className="col-span-2 bg-white border border-[#efeded] p-6 md:p-8 rounded-sm space-y-6">
                        {/* Logo Upload */}
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-[#f5f3f3] border border-[#efeded] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                            {settingsLogo ? (
                              <img src={settingsLogo} alt="Shop Logo" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-[#5e5e5d]">Logo</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5 items-start">
                            <button 
                              onClick={() => {
                                const url = prompt('Enter the image URL for your shop logo:', settingsLogo);
                                if (url) {
                                  setSettingsLogo(url);
                                  toast.success('Shop logo updated!');
                                }
                              }}
                              className="bg-[#020302] text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer rounded-xs"
                            >
                              Change Logo
                            </button>
                            <p className="text-[10px] text-[#5e5e5d] opacity-60 font-medium">JPG, PNG or SVG. Max 2MB.</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-[#5e5e5d] uppercase tracking-widest block">Shop Name</label>
                            <input 
                              type="text" 
                              className="w-full bg-[#fbf9f9] border border-[#efeded] p-3 text-xs font-semibold text-[#020302] focus:outline-none focus:ring-1 focus:ring-[#020302] rounded-sm"
                              value={settingsShopName}
                              onChange={(e) => setSettingsShopName(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-[#5e5e5d] uppercase tracking-widest block">Location</label>
                            <input 
                              type="text" 
                              className="w-full bg-[#fbf9f9] border border-[#efeded] p-3 text-xs font-semibold text-[#020302] focus:outline-none focus:ring-1 focus:ring-[#020302] rounded-sm"
                              value={settingsLocation}
                              onChange={(e) => setSettingsLocation(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-[#5e5e5d] uppercase tracking-widest block">Phone Number</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                className="w-full bg-[#fbf9f9] border border-[#efeded] p-3 text-xs font-semibold text-[#020302] focus:outline-none focus:ring-1 focus:ring-[#020302] rounded-sm"
                                value={settingsPhone}
                                onChange={(e) => setSettingsPhone(e.target.value)}
                              />
                              <button 
                                onClick={() => toast.success('Phone verification code sent to ' + settingsPhone)}
                                className="bg-[#f5f3f3] border border-[#efeded] hover:bg-[#efeded] px-4 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-sm whitespace-nowrap cursor-pointer"
                              >
                                Edit & Verify
                              </button>
                            </div>
                            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5 mt-1 select-none">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                              Verified Phone Number
                            </p>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-[#5e5e5d] uppercase tracking-widest block">WhatsApp Number</label>
                            <input 
                              type="text" 
                              className="w-full bg-[#fbf9f9] border border-[#efeded] p-3 text-xs font-semibold text-[#020302] focus:outline-none focus:ring-1 focus:ring-[#020302] rounded-sm"
                              placeholder="e.g. +8801700000000"
                              value={settingsWhatsApp}
                              onChange={(e) => setSettingsWhatsApp(e.target.value)}
                            />
                            <p className="text-[9px] text-[#5e5e5d]/60 font-medium">Used as the contact/inquiry trigger on your public shop card catalog.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#efeded]" />

                    {/* Section 2: Inventory Logic */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="col-span-1 space-y-1">
                        <h3 className="text-[13px] font-bold text-[#020302] uppercase tracking-wider">Inventory Logic</h3>
                        <p className="text-xs text-[#5e5e5d] opacity-75 font-semibold">Control how your stock levels are managed and reported.</p>
                      </div>
                      
                      <div className="col-span-2 bg-white border border-[#efeded] p-6 md:p-8 rounded-sm">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-[#5e5e5d] uppercase tracking-widest block">Default Low Stock Threshold</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="number" 
                              className="w-24 bg-[#fbf9f9] border border-[#efeded] p-3 text-xs font-bold text-[#020302] focus:outline-none focus:ring-1 focus:ring-[#020302] rounded-sm"
                              value={settingsLowStockThreshold}
                              onChange={(e) => setSettingsLowStockThreshold(Number(e.target.value))}
                            />
                            <span className="text-xs font-semibold text-[#5e5e5d]">units remaining</span>
                          </div>
                          <p className="text-[10px] text-[#5e5e5d] opacity-60 font-medium pt-1">
                            This threshold will be applied to all new and existing product listings unless overridden manually.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#efeded]" />

                    {/* Section 3: Notifications */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="col-span-1 space-y-1">
                        <h3 className="text-[13px] font-bold text-[#020302] uppercase tracking-wider">Notifications</h3>
                        <p className="text-xs text-[#5e5e5d] opacity-75 font-semibold">Choose how you wish to be notified about shop events.</p>
                      </div>
                      
                      <div className="col-span-2 bg-white border border-[#efeded] p-6 md:p-8 rounded-sm space-y-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-[#020302] uppercase tracking-wider">SMS Alerts</h4>
                            <p className="text-[10px] text-[#5e5e5d] opacity-60 font-medium">Get instant low-stock texts for urgent replenishment.</p>
                          </div>
                          <button 
                            onClick={() => setSettingsSmsAlerts(!settingsSmsAlerts)}
                            className={`w-10 h-5.5 rounded-full relative transition-colors duration-300 cursor-pointer ${
                              settingsSmsAlerts ? 'bg-[#020302]' : 'bg-neutral-300'
                            }`}
                          >
                            <span className={`absolute top-0.75 left-0.75 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                              settingsSmsAlerts ? 'translate-x-4.5' : 'translate-x-0'
                            }`}></span>
                          </button>
                        </div>

                        <div className="border-t border-[#efeded]" />

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-[#020302] uppercase tracking-wider">In-app Alerts</h4>
                            <p className="text-[10px] text-[#5e5e5d] opacity-60 font-medium">Summary of stock movements in your dashboard.</p>
                          </div>
                          <button 
                            onClick={() => setSettingsInAppAlerts(!settingsInAppAlerts)}
                            className={`w-10 h-5.5 rounded-full relative transition-colors duration-300 cursor-pointer ${
                              settingsInAppAlerts ? 'bg-[#020302]' : 'bg-neutral-300'
                            }`}
                          >
                            <span className={`absolute top-0.75 left-0.75 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                              settingsInAppAlerts ? 'translate-x-4.5' : 'translate-x-0'
                            }`}></span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#efeded]" />

                    {/* Section 4: Danger Zone */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="col-span-1 space-y-1">
                        <h3 className="text-[13px] font-bold text-[#ba1a1a] uppercase tracking-wider">Danger Zone</h3>
                        <p className="text-xs text-[#5e5e5d] opacity-75 font-semibold">Account termination actions. This cannot be undone.</p>
                      </div>
                      
                      <div className="col-span-2 bg-red-50/20 border border-red-100 p-6 md:p-8 rounded-sm space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wider">Delete Shop Account</h4>
                          <p className="text-[10px] text-red-700/80 font-medium mt-1 leading-relaxed">
                            Permanently remove your boutique, all inventory data, and transaction history from the Merchant Portal. This action is irreversible.
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            if (confirm('WARNING: Are you absolutely sure you want to delete your boutique? This action cannot be undone.')) {
                              toast.error('Account deletion is not permitted in demo mode.');
                            }
                          }}
                          className="bg-[#ba1a1a] text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer rounded-xs"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-[#efeded]">
                      <button 
                        onClick={() => {
                          setSettingsShopName(storeName || 'The Curator Shop');
                          setSettingsLocation(storeLocation || 'London, United Kingdom');
                          setSettingsPhone('+44 20 7946 0958');
                          setSettingsWhatsApp(whatsAppNumber || '');
                          setSettingsLowStockThreshold(10);
                          setSettingsSmsAlerts(true);
                          setSettingsInAppAlerts(false);
                          setSettingsLogo('https://lh3.googleusercontent.com/aida-public/AB6AXuBa57kiXc7qcfwueIRVjI60qXnR6i4vEl2uIBNUoni4KLDMS_0WJDFeHRWXQ98aNylSe5CrZMilF7dAHlkpjSEo2IGayEmUsKK-p4MoAEXvEHVQGHzEnO48N74InWKqKUcTl_zbfESZaPZr_u2MvDGoOEJZ5DUb6OofjRNFid5aXnPSXJcdMy3DKBX41lDORELk8Jp9U0oLAnCPuUYpp5gWSdh-m5f2M7K_Jyl6h-FHOtw43YkxQS5jQAyP18VCEeeuKpsXsasaJ4UG');
                          toast.info('Settings discarded.');
                        }}
                        className="bg-white border border-[#efeded] hover:bg-[#f5f3f3] px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-xs cursor-pointer"
                      >
                        Discard Changes
                      </button>
                      <button 
                        onClick={() => {
                          if (!settingsShopName.trim()) {
                            toast.error('Shop name cannot be blank.');
                            return;
                          }
                          setStoreName(settingsShopName);
                          setStoreLocation(settingsLocation);
                          setWhatsAppNumber(settingsWhatsApp);
                          
                          // Mark onboarding item 2 "setUpShopProfile" as completed if either logo changed or WhatsApp added
                          const defaultLogo = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBa57kiXc7qcfwueIRVjI60qXnR6i4vEl2uIBNUoni4KLDMS_0WJDFeHRWXQ98aNylSe5CrZMilF7dAHlkpjSEo2IGayEmUsKK-p4MoAEXvEHVQGHzEnO48N74InWKqKUcTl_zbfESZaPZr_u2MvDGoOEJZ5DUb6OofjRNFid5aXnPSXJcdMy3DKBX41lDORELk8Jp9U0oLAnCPuUYpp5gWSdh-m5f2M7K_Jyl6h-FHOtw43YkxQS5jQAyP18VCEeeuKpsXsasaJ4UG';
                          if (settingsLogo !== defaultLogo || settingsWhatsApp.trim() !== '') {
                            localStorage.setItem('zenvy_checklist_setUpShopProfile', 'true');
                            window.dispatchEvent(new Event('zenvy_onboarding_update'));
                          }
                          
                          // Mark onboarding item 5 "setLowStockAlert" as completed if lowStockThreshold was saved or modified
                          localStorage.setItem('zenvy_checklist_setLowStockAlert', 'true');
                          window.dispatchEvent(new Event('zenvy_onboarding_update'));

                          toast.success('Merchant settings updated successfully!');
                        }}
                        className="bg-[#020302] text-white hover:bg-neutral-900 px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-xs cursor-pointer shadow-xs"
                      >
                        Save Settings
                      </button>
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
                onClick={() => handleTabChange('Settings')}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'Settings' ? 'text-[#020302] font-bold' : 'text-[#5e5e5d] opacity-60 font-semibold'
                }`}
              >
                <MoreHorizontal size={18} className="stroke-[2.2]" />
                <span className="text-[10px]">Settings</span>
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

        {isGlobalSearchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 md:pt-24 px-4 animate-in fade-in duration-150">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsGlobalSearchOpen(false);
                setGlobalSearchQuery('');
              }}
              className="absolute inset-0 bg-[#020302]/40 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-white border border-[#efeded] shadow-2xl flex flex-col max-h-[75vh] overflow-hidden z-10"
            >
              {/* Search input header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#efeded] bg-white shrink-0">
                <Search size={18} className="text-[#5e5e5d] opacity-50 shrink-0" />
                <input 
                  id="global-search-input"
                  type="text" 
                  placeholder="Search products, brands, variants..." 
                  className="flex-1 bg-transparent border-none text-[13px] font-sans font-medium text-[#020302] placeholder-[#5e5e5d]/60 focus:outline-none focus:ring-0"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  autoFocus
                />
                
                <div className="flex items-center gap-2 shrink-0 select-none">
                  <div className="hidden sm:block px-1.5 py-0.5 border border-[#c7c7bf]/30 rounded-xs text-[8px] font-bold text-[#5e5e5d]/60 bg-[#f5f3f3]">
                    ESC
                  </div>
                  <button 
                    onClick={() => {
                      setIsGlobalSearchOpen(false);
                      setGlobalSearchQuery('');
                    }}
                    className="p-1 hover:bg-[#f5f3f3]/70 rounded-full transition-colors"
                  >
                    <X size={15} className="text-[#5e5e5d]" />
                  </button>
                </div>
              </div>

              {/* Results Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fbf9f9]">
                {globalSearchQuery.trim() === '' && (
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#a3a3a3] font-bold px-1 mb-2">Quick Suggestions</p>
                )}

                {filteredSearchProducts.length > 0 ? (
                  filteredSearchProducts.map((product) => {
                    const isLowStock = product.stock <= (product.lowStockThreshold || 4);
                    
                    return (
                      <div 
                        key={product.id}
                        className="bg-white border border-[#efeded] rounded-sm p-4 hover:border-[#c7c7bf] transition-all flex flex-col gap-3 group/item text-left animate-in fade-in duration-100"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-row items-center gap-3">
                            <img 
                              src={product.image || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format&fit=crop"} 
                              alt={product.name}
                              className="w-10 h-10 rounded-xs border border-[#efeded] object-cover bg-[#fbf9f9] flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs uppercase tracking-widest text-[#a3a3a3] font-bold">
                                  {product.brand || 'ZENVY'}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-[#efeded]"></span>
                                {/* <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] ${
                                  product.stock === 0 
                                    ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                    : isLowStock 
                                      ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                }`}>
                                  {product.stock === 0 ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Active'}
                                </span> */}
                              </div>
                              <h4 className="text-[13px] font-semibold text-[#020302] font-sans mt-0.5 truncate leading-snug">
                                {product.name}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setIsGlobalSearchOpen(false);
                                handleTabChange('Products');
                                setSearchTerm(product.name);
                              }}
                              className="py-1 px-2.5 rounded-xs border border-[#efeded] hover:border-[#020302] hover:bg-[#020302] hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider text-[#5e5e5d] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => {
                                setIsGlobalSearchOpen(false);
                                setActiveMarkSoldProduct(product);
                              }}
                              className="py-1 px-2.5 rounded-xs bg-[#020302] hover:bg-neutral-800 text-white transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Sell
                            </button>
                          </div>
                        </div>

                        {/* Variants Specs Table */}
                        {product.variants && product.variants.length > 0 ? (
                          <div className="border-t border-[#efeded]/80 pt-3 space-y-1.5">
                            <div className="grid grid-cols-12 text-[9px] uppercase tracking-wider font-bold text-[#a3a3a3] px-2 mb-1">
                              <div className="col-span-5 text-left">Variant Spec</div>
                              <div className="col-span-3 text-center">Stock Quantity</div>
                              <div className="col-span-4 text-right">Selling Price</div>
                            </div>
                            
                            {product.variants.map((v) => {
                              const variantLow = v.quantity <= (product.lowStockThreshold || 4);
                              return (
                                <div 
                                  key={v.id} 
                                  className="grid grid-cols-12 items-center justify-between text-xs py-2 px-2.5 rounded-xs bg-[#fbf9f9] border border-[#efeded] hover:border-[#dbdad9] transition-colors gap-2 text-left"
                                >
                                  <div className="col-span-5 flex items-center gap-1.5 min-w-0">
                                    <span className="font-semibold text-[#020302] truncate">{v.color}</span>
                                    <span className="text-gray-300 select-none text-[10px] font-light">|</span>
                                    <span className="text-gray-500 font-medium shrink-0">{v.ram}/{v.storage}</span>
                                  </div>
                                  <div className="col-span-3 text-center">
                                    <span className={`font-semibold px-2 py-0.5 rounded-sm text-[10px] ${
                                      v.quantity === 0 
                                        ? 'bg-rose-50 text-rose-600'
                                        : variantLow 
                                          ? 'bg-amber-50 text-amber-600'
                                          : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {v.quantity} units
                                    </span>
                                  </div>
                                  <div className="col-span-4 text-right font-bold text-[#020302] font-sans">
                                    {v.sellingPrice.toLocaleString()} BDT
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="border-t border-[#efeded]/80 pt-3 flex items-center justify-between text-xs py-2 px-2.5 rounded-xs bg-[#fbf9f9] border border-[#efeded]">
                            <span className="text-gray-500 font-medium">Standard Spec</span>
                            <div className="flex items-center gap-4">
                              <span className={`font-semibold px-2 py-0.5 rounded-sm text-[10px] ${
                                product.stock === 0 
                                  ? 'bg-rose-50 text-rose-600'
                                  : isLowStock 
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-gray-100 text-gray-600'
                              }`}>
                                {product.stock} units
                              </span>
                              <span className="font-bold text-[#020302] font-sans">
                                {product.variants?.[0]?.sellingPrice?.toLocaleString() || '32,999'} BDT
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                      <Search size={20} className="text-gray-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-[#020302] font-sans">No products found</h4>
                    <p className="text-xs text-gray-500 font-light mt-1 max-w-sm">
                      We couldn't find any inventory item matching <span className="font-semibold text-gray-700">"{globalSearchQuery}"</span>. Try adjusting your spelling or brand.
                    </p>
                    <button 
                      onClick={() => {
                        setIsGlobalSearchOpen(false);
                        handleTabChange('Products');
                      }}
                      className="mt-4 py-2 px-4 bg-[#020302] hover:bg-neutral-800 text-white rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Add New Product
                    </button>
                  </div>
                )}
              </div>
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
