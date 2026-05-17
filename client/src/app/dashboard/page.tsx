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
  Trash2
} from 'lucide-react';
import { useZenvy } from '@/context/ZenvyContext';
import { SidebarSection, SidebarItem, SidebarSubItem, NavItem } from '@/components/SidebarComponents';
import NewProductScreen from '@/components/NewProductScreen';
import ProductDetailsScreen from '@/components/ProductDetailsScreen';
import { Product } from '@/types/zenvy';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';

export default function DashboardPage() {
  const { storeName } = useZenvy();
  const [activeTab, setActiveTab] = useState('Home');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeProductFilter, setActiveProductFilter] = useState('All');
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
    { label: "Add your first product", completed: isCreatingProduct || productList.length > 6, onClick: () => setIsCreatingProduct(true) },
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

  const handleProductAdded = (newProduct: Product) => {
    setProductList([newProduct, ...productList]);
    setShowSuccessOverlay(true);
    setIsCreatingProduct(false);
  };

  const handleMarkAsSoldClick = (product: Product) => {
    setActiveMarkSoldProduct(product);
    // Find the first variant with stock > 0, otherwise default to first variant
    const firstInStock = product.variants?.find(v => v.quantity > 0) || product.variants?.[0] || null;
    setSelectedMarkSoldVariant(firstInStock);
    setSoldQty(1);
    setBuyerName('');
    setInvoiceSaleData(null);
  };

  const handleConfirmSale = () => {
    if (!activeMarkSoldProduct || !selectedMarkSoldVariant) return;

    const qtyToDeduct = soldQty;
    const pId = activeMarkSoldProduct.id;
    const vId = selectedMarkSoldVariant.id;
    const customer = buyerName.trim() || 'Walk-in Customer';

    // 1. Mutate state productList: decrement variant quantity
    setProductList(prevList => prevList.map(p => {
      if (p.id === pId) {
        const updatedVariants = p.variants?.map(v => 
          v.id === vId ? { ...v, quantity: Math.max(0, v.quantity - qtyToDeduct) } : v
        ) || [];
        const newTotalStock = updatedVariants.reduce((sum, v) => sum + v.quantity, 0);
        
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const logText = `Sold ${qtyToDeduct} unit${qtyToDeduct > 1 ? 's' : ''} to ${customer} — ${selectedMarkSoldVariant.color} ${selectedMarkSoldVariant.ram}/${selectedMarkSoldVariant.storage} — ${dateStr}`;

        return {
          ...p,
          variants: updatedVariants,
          stock: newTotalStock,
          history: [
            { text: logText, type: 'sell' },
            ...(p.history || [])
          ]
        };
      }
      return p;
    }));

    // 2. Add dynamic entry to dashboard bottom activity feed
    const activityText = `Marked sold`;
    const productDetail = `${activeMarkSoldProduct.brand} ${activeMarkSoldProduct.name} ${selectedMarkSoldVariant.color} ${selectedMarkSoldVariant.ram}/${selectedMarkSoldVariant.storage} (Qty: ${qtyToDeduct})`;
    setRecentActivities(prev => [
      { 
        type: 'sold', 
        text: activityText, 
        product: productDetail, 
        time: 'Just now' 
      },
      ...prev
    ].slice(0, 10));

    // 3. Set invoice sale data for receipt modal
    const finalInvoice = {
      shopName: storeName || 'Zenvy Store',
      invoiceNumber: `ZN-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      buyerName: customer,
      productName: activeMarkSoldProduct.name,
      brandName: activeMarkSoldProduct.brand || 'Generic',
      variantColor: selectedMarkSoldVariant.color,
      variantSpecs: `${selectedMarkSoldVariant.ram}/${selectedMarkSoldVariant.storage}`,
      price: selectedMarkSoldVariant.sellingPrice,
      qty: qtyToDeduct,
      total: selectedMarkSoldVariant.sellingPrice * qtyToDeduct
    };
    setInvoiceSaleData(finalInvoice);

    // 4. Trigger confetti explosion for wow moment!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    // 5. Close mark sold modal
    setActiveMarkSoldProduct(null);
  };

  const generateBrandedInvoicePDF = (receipt: any) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const darkColor = [26, 28, 29]; // Clean charcoal black
    const greyColor = [100, 100, 105]; // Slate grey
    const lightBorder = [221, 221, 221]; // #dddddd dividers

    // --- 1. Elegant Minimalist Header ---
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.setTextColor(68, 68, 68);
    doc.text(`${receipt.shopName}.`, 15, 26);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
    doc.text("Premium Smartphone Distribution Outlet", 15, 32);
    doc.text("Dhaka, Bangladesh  |  Phone: 01712 345678  |  zenvy.com.bd", 15, 37);

    // Invoice Details (Right Aligned)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("INVOICE", 195, 26, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 85);
    doc.text(`Invoice Number: ${receipt.invoiceNumber}`, 195, 32, { align: "right" });
    doc.text(`Date: ${receipt.date}`, 195, 37, { align: "right" });
    doc.text(`Status: PAID`, 195, 42, { align: "right" });

    // --- 2. Billed To Block (Generous Spacing) ---
    let metaY = 58;
    
    // Left Column: Issued To
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("Issued To:", 15, metaY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
    doc.text(`Name: ${receipt.buyerName}`, 15, metaY + 6);
    doc.text("Type: Walk-in Customer", 15, metaY + 11);
    doc.text("Channel: Verified Smartphone Transaction", 15, metaY + 16);

    // Middle Column: Pay To
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("Pay To / Outlet:", 95, metaY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
    doc.text(`Outlet: ${receipt.shopName}`, 95, metaY + 6);
    doc.text("Phone: +8801712345678", 95, metaY + 11);
    doc.text("Website: zenvy.com.bd", 95, metaY + 16);

    // --- 3. Elegant Table Headers ---
    let yStart = metaY + 29;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Service / Device", 15, yStart);
    doc.text("Unit Price", 125, yStart, { align: "right" });
    doc.text("Duration / Qty", 155, yStart, { align: "right" });
    doc.text("Amount", 195, yStart, { align: "right" });

    // Thin stroke divider matching '#dddddd'
    doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
    doc.setLineWidth(0.4);
    doc.line(15, yStart + 3, 195, yStart + 3);

    let currentY = yStart + 3;

    receipt.items.forEach((item: any) => {
      currentY += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(68, 68, 68);
      const desc = item.description || `${item.brand || ''} ${item.name || ''} - ${item.color || ''} (${item.specs || ''})`.trim();
      doc.text(desc, 15, currentY);

      doc.text(`Tk ${item.price.toLocaleString()}`, 125, currentY, { align: "right" });
      doc.text(String(item.quantity), 155, currentY, { align: "right" });
      
      doc.text(`Tk ${item.total.toLocaleString()}`, 195, currentY, { align: "right" });
    });

    currentY += 6;
    // Bottom border under table rows
    doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
    doc.setLineWidth(0.4);
    doc.line(15, currentY, 195, currentY);

    // --- 4. Totals Area ---
    currentY += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(68, 68, 68);
    doc.text("Subtotal:", 135, currentY);
    doc.text(`Tk ${receipt.subtotal.toLocaleString()}`, 195, currentY, { align: "right" });

    if (receipt.discount > 0) {
      currentY += 6;
      doc.text("Discount:", 135, currentY);
      doc.text(`-Tk ${receipt.discount.toLocaleString()}`, 195, currentY, { align: "right" });
    }

    currentY += 7;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("Total Paid:", 135, currentY);
    doc.text(`Tk ${receipt.total.toLocaleString()}`, 195, currentY, { align: "right" });

    // --- 5. Clean Times-Italic Signature ---
    let signatureY = 222;
    const signName = receipt.shopName.split(' ')[0] || 'Zenvy';
    
    doc.setFont("times", "italic");
    doc.setFontSize(32);
    doc.setTextColor(0, 0, 0);
    doc.text(signName, 15, signatureY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("Authorized Representative", 15, signatureY + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
    doc.text(`Founder, ${receipt.shopName}`, 15, signatureY + 13);

    // --- 6. PAID Stamp Overlay (Slanted Indigo Ink Stamp) ---
    doc.setTextColor(90, 82, 213); // #5a52d5 matching SmartCAF color
    doc.setFont("times", "bold");
    doc.setFontSize(44);
    // Draw slanted text at x=142, y=signatureY + 2 with rotation angle 12 degrees
    doc.text("PAID", 142, signatureY + 2, { angle: 12 });

    // --- 7. Clean Monochromatic Footer ---
    doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(15, 262, 195, 262);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("Thank you for your purchase!", 15, 268);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
    doc.text("For support, warranties, or transaction inquiries, contact our customer helpdesk.", 15, 272);

    // Subtle powered by watermark
    doc.setFont("helvetica", "oblique");
    doc.setFontSize(7.5);
    doc.setTextColor(165, 165, 170);
    doc.text("Powered by StockNet - Premium Smartphone Terminal", 195, 268, { align: "right" });
    doc.text("zenvy.com.bd/stocknet", 195, 272, { align: "right" });

    doc.save(`${receipt.invoiceNumber}_invoice.pdf`);
  };

  const handleDownloadPDF = (data: any) => {
    // Map single variant invoice details to A4 invoice
    const A4Receipt = {
      shopName: data.shopName,
      invoiceNumber: data.invoiceNumber,
      date: data.date,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      buyerName: data.buyerName,
      items: [{
        description: `${data.brandName} ${data.productName} - ${data.variantColor} (${data.variantSpecs})`,
        quantity: data.qty,
        price: data.price,
        total: data.total
      }],
      subtotal: data.total,
      discount: 0,
      total: data.total
    };
    generateBrandedInvoicePDF(A4Receipt);
  };

  const handleShareWhatsApp = (data: any) => {
    const textMessage = `Hello ${data.buyerName},\n\nThank you for purchasing at ${data.shopName}!\nHere is your receipt details:\n\n*Invoice No:* ${data.invoiceNumber}\n*Date:* ${data.date}\n*Device:* ${data.brandName} ${data.productName} - ${data.variantColor} (${data.variantSpecs})\n*Quantity:* ${data.qty}\n*Price:* Tk ${data.price.toLocaleString()}\n*Total Amount:* *Tk ${data.total.toLocaleString()}*\n\nThank you for shopping with us! Have a wonderful day! 🌟`;
    const encodedText = encodeURIComponent(textMessage);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  const handleOpenCheckout = () => {
    setPosCheckoutOpen(true);
    setPosStep(1);
    setPosCart([]);
    setPosSearch('');
    setPosBuyerName('');
    setPosDiscountType('flat');
    setPosDiscountValue(0);
    setPosSuccessData(null);
    setExpandedProductId(null);
  };

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

  const handleUpdateCartItemQty = (variantId: string, qty: number, maxQty: number) => {
    const cleanQty = Math.max(1, Math.min(maxQty, qty));
    setPosCart(prevCart => prevCart.map(item => 
      item.variant.id === variantId ? { ...item, quantity: cleanQty } : item
    ));
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
      // Find all cart items for this product
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

    // 2. Prepends Bottom Feed dynamic activities
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
    setPosStep(3);
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
              <h1 className="text-[14px] font-bold leading-tight text-[#020302] truncate">Inventory Manager</h1>
              <p className="text-[9px] uppercase tracking-widest text-[#5e5e5d] opacity-60 font-bold mt-0.5">SS26 Collection</p>
            </div>
          </div>
        </div>

        <nav className="flex-grow overflow-y-auto min-h-0">
          <div className="px-4 mb-6 flex-shrink-0">
            <button 
              onClick={() => setIsCreatingProduct(true)}
              className="w-full bg-[#020302] hover:bg-neutral-900 text-white py-3 px-4 rounded-sm text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="space-y-1">
            <p className="px-6 text-[9px] uppercase tracking-[0.2em] text-[#5e5e5d] mb-2 opacity-50 font-bold">General</p>
            <button 
              onClick={() => setActiveTab('Home')}
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
              onClick={() => setActiveTab('Products')}
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
              onClick={() => setActiveTab('Orders')}
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
                onClick={() => {}}
                className="w-full flex items-center gap-3 text-[#5e5e5d] hover:bg-[#f5f3f3]/50 py-3 px-6 transition-all text-left text-xs cursor-pointer font-semibold font-medium"
              >
                <Bell size={16} className="stroke-[2]" />
                <span>Notifications</span>
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
        {isCreatingProduct || editingProduct ? (
          <NewProductScreen 
            onBack={() => {
              setIsCreatingProduct(false);
              setEditingProduct(null);
            }} 
            onSuccess={(updatedProduct) => {
              if (editingProduct) {
                setProductList(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
                setEditingProduct(null);
                if (previewingProduct && previewingProduct.id === updatedProduct.id) {
                  setPreviewingProduct(updatedProduct);
                }
              } else {
                handleProductAdded(updatedProduct);
              }
            }}
            initialProduct={editingProduct || undefined}
          />
        ) : previewingProduct ? (
          <ProductDetailsScreen 
            product={previewingProduct}
            onBack={() => setPreviewingProduct(null)}
            onEdit={(prod) => {
              setEditingProduct(prod);
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
                          setIsCreatingProduct(true);
                        }}
                        className="w-full text-sm py-4 bg-[#5438ff] text-white font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                      >
                        Add Another Product
                      </button>
                      <button 
                        onClick={() => {
                          setShowSuccessOverlay(false);
                          setActiveTab('Products');
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

            {/* Modal 1: Mark as Sold Dialog */}
            <AnimatePresence>
              {activeMarkSoldProduct && (
                <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
                  {/* Backdrop Click to Close */}
                  <div className="absolute inset-0" onClick={() => setActiveMarkSoldProduct(null)} />
                  
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="bg-white max-w-md w-full shadow-2xl relative text-left border border-gray-100 flex flex-col p-6 rounded-2xl overflow-hidden z-10"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                      <h3 className="text-base font-sans font-semibold text-[#1a1c1d] tracking-tight">Record Smartphone Sale</h3>
                      <button 
                        onClick={() => setActiveMarkSoldProduct(null)} 
                        className="text-gray-400 hover:text-neutral-900 transition-colors cursor-pointer p-1 hover:bg-neutral-50 rounded-full"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Product Specs Showcase */}
                    <div className="flex gap-3 bg-[#f6f6f7] border border-gray-100 p-3 mb-5 rounded-xl">
                      <div className="w-12 h-12 bg-white border border-gray-150 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img 
                          src={activeMarkSoldProduct.image} 
                          alt={activeMarkSoldProduct.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0 flex flex-col justify-center">
                        <h4 className="text-xs font-bold text-neutral-900 leading-snug">{activeMarkSoldProduct.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{activeMarkSoldProduct.brand}</p>
                      </div>
                    </div>

                    {/* Select Variant */}
                    <div className="space-y-2 mb-5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Select Sold Variant</label>
                      <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                        {activeMarkSoldProduct.variants?.map((v) => {
                          const isSelected = selectedMarkSoldVariant?.id === v.id;
                          const isOutOfStock = v.quantity === 0;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => {
                                setSelectedMarkSoldVariant(v);
                                setSoldQty(1); // reset qty limits
                              }}
                              className={`p-3 text-left border transition-all flex flex-col justify-between rounded-xl relative cursor-pointer h-[66px]
                                ${isOutOfStock 
                                  ? 'opacity-30 bg-[#f6f6f7] border-gray-100 cursor-not-allowed line-through' 
                                  : isSelected 
                                    ? 'border-black bg-black text-white shadow-sm' 
                                    : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-xs'}`}
                            >
                              <span className="text-xs font-bold truncate block w-full">{v.color}</span>
                              <span className={`text-[10px] font-semibold mt-0.5 block ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                {v.ram}/{v.storage} • {isOutOfStock ? '0 Stock' : `${v.quantity} Stock`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quantity and Buyer Fields */}
                    {selectedMarkSoldVariant && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Stepper */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Quantity</label>
                          <div className="flex items-center border border-gray-200 h-[42px] rounded-xl bg-white">
                            <button
                              type="button"
                              onClick={() => setSoldQty(q => Math.max(1, q - 1))}
                              className="w-10 h-full flex items-center justify-center hover:bg-neutral-50 text-neutral-800 transition-colors cursor-pointer"
                            >
                              <Minus size={12} strokeWidth={2.5} />
                            </button>
                            <span className="flex-1 text-center font-bold text-xs text-neutral-950">{soldQty}</span>
                            <button
                              type="button"
                              onClick={() => setSoldQty(q => Math.min(selectedMarkSoldVariant.quantity, q + 1))}
                              className="w-10 h-full flex items-center justify-center hover:bg-neutral-50 text-neutral-800 transition-colors cursor-pointer"
                            >
                              <Plus size={12} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>

                        {/* Buyer Name */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Buyer (Optional)</label>
                          <input
                            type="text"
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full border border-gray-200 px-3.5 h-[42px] text-xs font-semibold focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5 rounded-xl transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex gap-3.5 border-t border-gray-100 pt-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setActiveMarkSoldProduct(null)}
                        className="flex-1 py-3 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!selectedMarkSoldVariant || selectedMarkSoldVariant.quantity === 0}
                        onClick={handleConfirmSale}
                        className={`flex-1 py-3 text-xs text-white font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm text-center
                          ${(!selectedMarkSoldVariant || selectedMarkSoldVariant.quantity === 0)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-black hover:bg-neutral-900'}`}
                      >
                        Confirm Sale
                      </button>
                    </div>

                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Modal 2: Invoice Receipt Success Panel */}
            <AnimatePresence>
              {invoiceSaleData && (
                <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
                  {/* Backdrop Click to Close */}
                  <div className="absolute inset-0" onClick={() => setInvoiceSaleData(null)} />
                  
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="bg-white max-w-sm w-full shadow-2xl relative text-left border border-gray-100 flex flex-col p-6 rounded-2xl overflow-hidden z-10"
                  >
                    {/* Visual Success Icon */}
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 shadow-inner">
                      <CheckCircle2 size={24} className="stroke-[2.5]" />
                    </div>

                    <h3 className="text-base font-sans font-semibold text-neutral-900 text-center tracking-tight">Sale Recorded!</h3>
                    <p className="text-[11px] text-gray-500 text-center mt-1 font-light leading-relaxed">
                      Inventory has been adjusted. Print or share a digital receipt.
                    </p>

                    {/* Receipt Mock Paper Preview */}
                    <div className="my-5 p-4 bg-[#f8f8f9] rounded-2xl border border-gray-150 font-mono text-[10px] text-neutral-800 space-y-3 relative overflow-hidden shadow-xs">
                      
                      {/* Receipt Header */}
                      <div className="text-center border-b border-dashed border-gray-200 pb-2.5">
                        <p className="font-bold text-xs uppercase tracking-widest text-neutral-900">{invoiceSaleData.shopName}</p>
                        <p className="text-[8px] text-gray-400 font-sans mt-0.5 uppercase tracking-wider">Smartphone Merchant Terminal</p>
                      </div>

                      {/* Info Block */}
                      <div className="space-y-0.5 text-neutral-600">
                        <p className="flex justify-between">
                          <span>Invoice No:</span>
                          <strong className="text-neutral-900 font-bold">{invoiceSaleData.invoiceNumber}</strong>
                        </p>
                        <p className="flex justify-between">
                          <span>Date:</span>
                          <span className="text-neutral-800">{invoiceSaleData.date}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Customer:</span>
                          <span className="text-neutral-800 truncate max-w-[150px]">{invoiceSaleData.buyerName}</span>
                        </p>
                      </div>

                      {/* Items block */}
                      <div className="border-t border-b border-dashed border-gray-200 py-2">
                        <div className="flex justify-between font-bold text-neutral-900 mb-1 text-[9px] uppercase tracking-wider">
                          <span>Item / Description</span>
                          <span>Qty / Total</span>
                        </div>
                        <div className="flex justify-between leading-snug">
                          <div className="truncate pr-3 max-w-[180px]">
                            <p className="font-bold text-neutral-950 text-[10px] truncate">{invoiceSaleData.brandName} {invoiceSaleData.productName}</p>
                            <p className="text-[8px] text-gray-400 italic">{invoiceSaleData.variantColor} • {invoiceSaleData.variantSpecs}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-neutral-950 font-bold">{invoiceSaleData.qty} x Tk {invoiceSaleData.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Grand Total */}
                      <div className="flex justify-between items-baseline font-bold text-xs text-neutral-950 pt-1">
                        <span>GRAND TOTAL:</span>
                        <span className="text-sm text-neutral-900 font-bold">Tk {invoiceSaleData.total.toLocaleString()}</span>
                      </div>

                      {/* Footer Message */}
                      <div className="text-center text-[8px] text-gray-400 pt-2 border-t border-dashed border-gray-200 italic">
                        Thank you for shopping with us!
                      </div>
                    </div>

                    {/* Actions Grid */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleDownloadPDF(invoiceSaleData)}
                        className="w-full py-3 bg-black hover:bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        <Receipt size={13} />
                        <span>Download PDF Receipt</span>
                      </button>
                      
                      <button
                        onClick={() => handleShareWhatsApp(invoiceSaleData)}
                        className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-[#25D366]/10"
                      >
                        <Share2 size={13} />
                        <span>Share via WhatsApp</span>
                      </button>

                      <button
                        onClick={() => setInvoiceSaleData(null)}
                        className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-[10px] font-bold uppercase tracking-wider transition-all rounded-xl cursor-pointer"
                      >
                        Done / Close
                      </button>
                    </div>

                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Modal 3: Complete Sale POS Checkout Drawer */}
            <AnimatePresence>
              {posCheckoutOpen && posStep === 1 && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#020302]/20 backdrop-blur-sm">
                  {/* Backdrop Close Click */}
                  <div className="absolute inset-0" onClick={() => setPosCheckoutOpen(false)} />

                  <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ type: "spring", stiffness: 350, damping: 35 }}
                    className="w-full max-w-2xl z-[210] flex flex-col font-sans text-on-surface"
                  >
                    {/* Step 1: Select Products */}
                    <div className="bg-[#fbf9f9] w-full max-h-[85vh] sm:max-h-[90vh] md:max-h-[850px] flex flex-col rounded-t-2xl sm:rounded-xl border-t sm:border border-[#c7c7bf] shadow-2xl overflow-hidden">
                      {/* Modal Header */}
                      <div className="px-4 pt-5 pb-3 sm:px-8 sm:pt-8 sm:pb-4 flex justify-between items-center shrink-0">
                        <h1 className="font-medium text-xl sm:text-2xl md:text-[32px] tracking-[0.01em] text-[#020302]">Select Products</h1>
                        <button 
                          type="button"
                          onClick={() => setPosCheckoutOpen(false)} 
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

                          return filtered.map(product => {
                            const isExpanded = expandedProductId === product.id;
                            const cartItemCount = posCart
                              .filter(item => item.product.id === product.id)
                              .reduce((sum, item) => sum + item.quantity, 0);

                            if (isExpanded) {
                              return (
                                <section key={product.id} className="bg-white border border-[#020302] rounded-xl overflow-hidden transition-all duration-300 ring-1 ring-[#020302]/10">
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
                                    {product.variants?.map(v => {
                                      const cartItem = posCart.find(item => item.variant.id === v.id);
                                      const itemQtyInCart = cartItem?.quantity || 0;
                                      const isOutOfStock = v.quantity === 0;

                                      if (isOutOfStock) {
                                        return (
                                          <div key={v.id} className="p-3 sm:p-4 bg-[#efeded] border border-[#c7c7bf] rounded-lg flex items-center justify-between opacity-50 cursor-not-allowed">
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
                                            className="p-3 sm:p-4 bg-[#1d1d1b] border border-[#020302] rounded-lg flex items-center justify-between cursor-pointer transition-all"
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
                                          className="p-3 sm:p-4 bg-[#fbf9f9] border border-[#c7c7bf] rounded-lg flex items-center justify-between hover:border-[#020302] cursor-pointer transition-all group"
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
                                className="p-4 sm:p-6 bg-white border border-[#c7c7bf] rounded-xl flex items-center gap-4 sm:gap-6 hover:bg-[#ffffff] hover:border-[#5e5e5d] transition-all cursor-pointer min-w-0"
                              >
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#fbf9f9] rounded-lg flex-shrink-0 border border-[#c7c7bf] overflow-hidden opacity-80">
                                  <img className="w-full h-full object-cover" src={product.image} alt={product.name} />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <div className="flex justify-between items-center gap-2">
                                    <h2 className="text-lg sm:text-[24px] font-normal tracking-[0.01em] text-[#020302] opacity-80 truncate">{product.name}</h2>
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
                            onClick={() => setPosCheckoutOpen(false)} 
                            className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg border border-[#020302] text-[#020302] text-xs sm:text-[14px] font-medium hover:bg-[#f5f3f3] transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button 
                            type="button"
                            disabled={posCart.length === 0}
                            onClick={() => setPosStep(2)} 
                            className={"px-4 py-2.5 sm:px-8 sm:py-2.5 rounded-lg text-xs sm:text-[14px] font-medium flex items-center gap-1 sm:gap-2 transition-all cursor-pointer " + (posCart.length === 0 ? "bg-[#c7c6c5] text-[#1b1c1c] cursor-not-allowed" : "bg-[#020302] text-white hover:opacity-90")}
                          >
                            Next: Customer Info
                            <ArrowRight size={16} className="sm:hidden" />
                            <ArrowRight size={18} className="hidden sm:block" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {posCheckoutOpen && posStep === 2 && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#020302]/20 backdrop-blur-sm">
                  {/* Backdrop Close Click */}
                  <div className="absolute inset-0" onClick={() => setPosCheckoutOpen(false)} />

                  <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ type: "spring", stiffness: 350, damping: 35 }}
                    className="w-full max-w-2xl z-[210] flex flex-col font-sans text-on-surface"
                  >
                    {/* Step 2: Configure Negotiation & Overrides */}
                    <div className="bg-[#fbf9f9] w-full max-h-[85vh] sm:max-h-[90vh] md:max-h-[850px] flex flex-col rounded-t-2xl sm:rounded-xl border-t sm:border border-[#c7c7bf] shadow-2xl overflow-hidden">
                      {/* Modal Header */}
                      <div className="px-4 pt-5 pb-3 sm:px-8 sm:py-6 border-b border-[#c7c7bf]/30 flex justify-between items-center shrink-0">
                        <div>
                          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-[#5e5e5d] mb-1">Step 2 of 3</p>
                          <h1 className="text-lg sm:text-[24px] font-medium tracking-tight text-[#020302]">Configure Negotiation &amp; Overrides</h1>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setPosCheckoutOpen(false)} 
                          className="p-1.5 sm:p-2 text-[#5e5e5d] hover:text-[#020302] rounded-full transition-all cursor-pointer shrink-0"
                        >
                          <X size={20} className="sm:hidden" />
                          <X size={24} className="hidden sm:block" />
                        </button>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 overflow-y-auto px-4 py-4 sm:p-8 space-y-6 sm:space-y-8 bg-[#ffffff]">
                        {/* Cart Items List */}
                        <div className="space-y-4">
                          {posCart.map((item, idx) => (
                            <div key={`${item.variant.id}-${idx}`} className="bg-[#fbf9f9] p-4 sm:p-6 border border-[#c7c7bf] rounded-lg">
                              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white border border-[#c7c7bf] rounded-lg overflow-hidden flex-shrink-0">
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
                        <button 
                          type="button"
                          onClick={() => setPosCheckoutOpen(false)}
                          className="px-6 py-2.5 sm:py-3 bg-white border border-[#020302] text-[#020302] text-xs sm:text-sm font-medium rounded-lg hover:bg-[#f5f3f3] transition-colors uppercase tracking-widest cursor-pointer text-center"
                        >
                          Save as Draft
                        </button>
                        <div className="flex gap-2 sm:gap-4">
                          <button 
                            type="button"
                            onClick={() => setPosStep(1)}
                            className="flex-1 sm:flex-initial px-6 py-2.5 sm:py-3 bg-white border border-[#c7c7bf] text-[#5e5e5d] text-xs sm:text-sm font-medium rounded-lg hover:border-[#020302] hover:text-[#020302] transition-all uppercase tracking-widest cursor-pointer text-center"
                          >
                            Back
                          </button>
                          <button 
                            type="button"
                            onClick={handleConfirmPOSSale}
                            className="flex-1 sm:flex-initial px-8 py-2.5 sm:py-3 bg-[#020302] text-white text-xs sm:text-sm font-medium rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest cursor-pointer text-center"
                          >
                            Continue to Payment
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {posCheckoutOpen && posStep === 3 && (
                <div className="fixed inset-0 bg-[#0c0d0f]/60 z-[200] flex justify-end backdrop-blur-sm">
                  {/* Backdrop Close Click */}
                  <div className="absolute inset-0" onClick={() => setPosCheckoutOpen(false)} />

                  <motion.div 
                    initial={{ x: "100%", opacity: 0.95 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0.95 }}
                    transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
                    className="bg-white w-full h-full md:max-w-lg lg:max-w-xl border-l border-neutral-100 shadow-3xl relative text-left overflow-hidden flex flex-col z-[210]"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 flex-shrink-0 bg-white">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em] block">Zenvy Terminal</span>
                        <h3 className="text-base font-sans font-semibold text-neutral-900 tracking-tight">Complete Customer Sale</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                          Step 0{posStep} / 03
                        </span>
                        <button 
                          onClick={() => setPosCheckoutOpen(false)} 
                          className="text-neutral-400 hover:text-neutral-900 transition-colors p-1.5 hover:bg-neutral-50 rounded-full cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Step 3: Success Confirmation and Invoice exports */}
                    {/* Step 3: Success Confirmation and Invoice exports */}
                    {posStep === 3 && posSuccessData && (
                      <div className="flex-1 flex flex-col justify-between p-6 bg-white overflow-y-auto">
                        <div className="flex flex-col items-center">
                          {/* Success Animated Checkmark */}
                          <div className="w-16 h-16 mt-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                            <CheckCircle2 size={34} className="stroke-[2.5]" />
                          </div>

                          <h3 className="text-base font-sans font-bold text-neutral-900 text-center uppercase tracking-widest">Sale Recorded Successfully!</h3>
                          <p className="text-xs text-neutral-400 text-center mt-1 font-light max-w-xs">
                            Smartphone stocks have been adjusted live. Branded designer invoice is prepared.
                          </p>

                          {/* Invoice Summary Box: Styled like a physical luxury designer boutique receipt ticket */}
                          <div className="my-6 p-6 bg-[#fafafa] rounded-2xl border border-neutral-200/80 font-mono text-[10px] text-neutral-800 space-y-4 max-w-sm w-full relative overflow-hidden shadow-xs">
                            
                            {/* Decorative Top cutouts */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-200 via-transparent to-transparent opacity-40" />

                            <div className="text-center border-b border-dashed border-neutral-300 pb-3">
                              <p className="font-serif font-black text-sm uppercase tracking-widest text-neutral-900">{posSuccessData.shopName}</p>
                              <p className="text-[8px] text-neutral-400 font-sans mt-1 uppercase tracking-[0.2em]">STOCKNET POS TICKET</p>
                            </div>

                            <div className="space-y-1 text-neutral-500">
                              <p className="flex justify-between">
                                <span>Invoice No:</span>
                                <strong className="text-neutral-900 font-bold">{posSuccessData.invoiceNumber}</strong>
                              </p>
                              <p className="flex justify-between">
                                <span>Date/Time:</span>
                                <span className="text-neutral-950 font-semibold">{posSuccessData.date} {posSuccessData.time}</span>
                              </p>
                              <p className="flex justify-between">
                                <span>Buyer Name:</span>
                                <span className="text-neutral-950 font-semibold truncate max-w-[150px]">{posSuccessData.buyerName}</span>
                              </p>
                            </div>

                            <div className="border-t border-b border-dashed border-neutral-300 py-3.5 space-y-2.5">
                              <div className="flex justify-between font-bold text-neutral-950 text-[9px] uppercase tracking-wider">
                                <span>Smartphone details</span>
                                <span>Total Price</span>
                              </div>
                              
                              {posSuccessData.items.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between leading-snug">
                                  <div className="truncate pr-3 max-w-[170px]">
                                    <p className="font-bold text-neutral-900 text-[10px] truncate">{item.brand} {item.name}</p>
                                    <p className="text-[8px] text-gray-400 italic mt-0.5">{item.color} • {item.specs}</p>
                                  </div>
                                  <div className="text-right flex-shrink-0 text-neutral-900 font-bold">
                                    <p>{item.quantity} x Tk {item.price.toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between text-xs font-semibold text-[#767676]">
                                <span>Subtotal:</span>
                                <span>Tk {posSuccessData.subtotal.toLocaleString()}</span>
                              </div>
                              {posSuccessData.discount > 0 && (
                                <div className="flex justify-between text-xs font-semibold text-red-500">
                                  <span>Applied Discount:</span>
                                  <span>-Tk {posSuccessData.discount.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-baseline font-bold text-xs text-neutral-950 pt-2 border-t border-dashed border-neutral-300">
                                <span>TOTAL VALUE PAID:</span>
                                <span className="text-sm text-neutral-950 font-bold">Tk {posSuccessData.total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions block */}
                        <div className="space-y-2 w-full mt-auto">
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => generateBrandedInvoicePDF(posSuccessData)}
                              className="py-3.5 bg-neutral-950 hover:bg-neutral-900 text-white font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer shadow-sm text-center"
                            >
                              <Receipt size={13} />
                              <span>Print Invoice PDF</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                // Background PDF compilation and WhatsApp link share
                                generateBrandedInvoicePDF(posSuccessData);
                                
                                const textMessage = `Hello ${posSuccessData.buyerName},\n\nThank you for purchasing at ${posSuccessData.shopName}!\nHere is your receipt details:\n\n*Invoice No:* ${posSuccessData.invoiceNumber}\n*Date:* ${posSuccessData.date} ${posSuccessData.time}\n\n*Items Purchased:* \n${posSuccessData.items.map((item: any) => `- *${item.brand} ${item.name}* (${item.color} ${item.specs}) x ${item.quantity} units @ Tk ${item.price.toLocaleString()}`).join('\n')}\n\n*Subtotal:* Tk ${posSuccessData.subtotal.toLocaleString()}\n*Discount Applied:* -Tk ${posSuccessData.discount.toLocaleString()}\n*Grand Total:* *Tk ${posSuccessData.total.toLocaleString()}*\n\nYour digital A4 Invoice PDF has been generated offline. Thank you for shopping with us! 🌟`;
                                const encodedText = encodeURIComponent(textMessage);
                                window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
                              }}
                              className="py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-[#25D366]/10 text-center"
                            >
                              <Share2 size={13} />
                              <span>WhatsApp Receipt</span>
                            </button>
                          </div>

                          <button
                            onClick={() => setPosCheckoutOpen(false)}
                            className="w-full py-3 bg-[#f8f8f9] hover:bg-[#f3f3f4] text-neutral-600 text-[10px] font-bold uppercase tracking-wider transition-all rounded-xl cursor-pointer text-center"
                          >
                            Return to Merchant Dashboard
                          </button>
                        </div>
                      </div>
                    )}

                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Header */}
            <header className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-[#efeded]">
              <div className="flex items-center gap-3">
                <div className="lg:hidden w-8 h-8 rounded-full bg-[#020302] flex items-center justify-center text-white font-bold text-xs">
                  {storeName ? storeName.substring(0, 2).toUpperCase() : 'HW'}
                </div>
                <h1 className="text-base font-bold text-[#020302]">
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
                  <button className="p-2 hover:bg-[#f5f3f3]/50 rounded-sm transition-all relative cursor-pointer">
                    <Bell size={18} className="text-[#020302] stroke-[2]" />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#ba1a1a] rounded-full"></span>
                  </button>
                  <div className="w-8 h-8 rounded-full bg-[#020302] flex items-center justify-center text-white font-bold text-xs border border-[#efeded] select-none">
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
                      <h2 className="text-xl md:text-2xl font-bold text-[#020302] tracking-tight font-sans">
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
                          <svg viewBox="0 0 100 100" className="w-full h-full p-0.5 animate-[spin_35s_linear_infinite]">
                            <path id="miniPath" d="M 20,50 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0" fill="none" />
                            <text className="text-[9px] font-bold fill-white/60 tracking-[0.16em] uppercase">
                              <textPath href="#miniPath" startOffset="50%" textAnchor="middle">
                                {storeName ? storeName.substring(0, 8) : 'HW'} · CATALOG ·
                              </textPath>
                            </text>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles size={16} className="text-white fill-white/10" />
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-[15px] font-bold text-white tracking-tight flex items-center gap-2">
                            Live Storefront is Active 
                            <span className="bg-white text-black text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-sm">
                              ONLINE
                            </span>
                          </p>
                          <p className="text-xs text-gray-300 font-medium leading-relaxed max-w-md">
                            Anyone visiting your storefront can view live catalog quantities & inquire instantly via WhatsApp. Zero downloads or logins required.
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Stat 1: Products in Stock */}
                      <div className="bg-white p-5 border border-[#efeded] rounded-sm shadow-2xs text-left hover:shadow-xs hover:border-[#dbdad9] transition-all">
                        <p className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-widest mb-1.5">Products in stock</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl md:text-2xl font-bold text-[#020302]">
                            {productList.reduce((sum, p) => sum + p.stock, 0)}
                          </span>
                          <span className="flex items-center text-[10px] font-bold text-emerald-600 gap-0.5">
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
                          <span className="flex items-center text-[10px] font-bold text-emerald-600 gap-0.5">
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
                          <span className="flex items-center text-[10px] font-bold text-emerald-600 gap-0.5">
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
                          <span className="flex items-center text-[10px] font-bold text-emerald-600 gap-0.5">
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
                                  setEditingProduct(alertProduct);
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
                          <h3 className="font-bold text-[#020302] text-[14px]">Recent Log Activity</h3>
                          <p className="text-[11px] text-[#5e5e5d] opacity-60 mt-0.5 font-semibold">Real-time chronicle of stock operations</p>
                        </div>
                        <button 
                          onClick={() => setActiveTab('Products')}
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

                    {/* Global Footer */}
                    <footer className="mt-8 pt-6 border-t border-[#efeded] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#5e5e5d] opacity-80 text-[11px] font-semibold">
                      <p>© 2026 Heritage Wholesale. All rights reserved.</p>
                      <div className="flex items-center gap-6">
                        <button className="hover:text-[#020302] transition-colors cursor-pointer bg-transparent border-none p-0">Privacy Policy</button>
                        <button className="hover:text-[#020302] transition-colors cursor-pointer bg-transparent border-none p-0">Terms of Service</button>
                        <button className="hover:text-[#020302] transition-colors cursor-pointer bg-transparent border-none p-0">Carbon Neutral Storefront</button>
                      </div>
                    </footer>

                  </div>
                )}

                {activeTab === 'Products' && (
                  <div className="space-y-8 text-left py-2">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                      <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl text-[#020302] font-light tracking-tight font-sans">
                          Products
                        </h1>
                        <p className="text-xs md:text-sm text-[#5e5e5d] font-semibold leading-relaxed max-w-xl">
                          Active Inventory: Manage smartphone models, colors, storage capacities, and sales pipelines.
                        </p>
                      </div>
                      <button 
                        onClick={() => setIsCreatingProduct(true)}
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
                            className="bg-white border border-[#efeded] p-6 flex flex-col md:flex-row gap-8 items-start group hover:border-black transition-all duration-350 rounded-sm shadow-2xs hover:shadow-xs"
                          >
                            {/* Product Image Thumbnail */}
                            <div className="w-full md:w-32 h-32 bg-[#f5f3f3] flex items-center justify-center overflow-hidden border border-[#efeded] rounded-sm flex-shrink-0">
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
                                          className={`px-3 py-1 text-[11px] font-medium border rounded-sm transition-all
                                            ${isOutOfStock 
                                              ? 'bg-[#f5f3f3] border-[#efeded] text-neutral-400 opacity-55 italic' 
                                              : isLowStock 
                                                ? 'bg-rose-50 border-rose-250 text-rose-700 font-semibold' 
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
                                  className="text-[9px] font-bold uppercase tracking-widest border border-[#efeded] px-4 py-2 hover:bg-black hover:text-white hover:border-black transition-all cursor-pointer rounded-sm text-center"
                                >
                                  Preview
                                </button>
                                <button 
                                  onClick={() => setEditingProduct(product)}
                                  className="text-[9px] font-bold uppercase tracking-widest border border-[#efeded] px-4 py-2 hover:bg-black hover:text-white hover:border-black transition-all cursor-pointer rounded-sm text-center"
                                >
                                  Modify Specs
                                </button>
                                <button 
                                  onClick={() => handleMarkAsSoldClick(product)}
                                  disabled={product.stock === 0}
                                  className={`text-[9px] font-bold uppercase tracking-widest transition-colors py-2 text-center rounded-sm cursor-pointer
                                    ${product.stock === 0 
                                      ? 'text-neutral-350 line-through cursor-not-allowed' 
                                      : 'text-[#5e5e5d] hover:text-[#ba1a1a]'}`}
                                >
                                  Mark Sold
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
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
                  onClick={() => setIsCreatingProduct(true)}
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
