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
  AlertTriangle,
  Receipt,
  Share2,
  Minus,
  X,
  ShoppingBag,
  MessageCircle,
  Check
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
            <SidebarItem icon={ShoppingBag} label="Complete Sale (POS)" active={false} onClick={handleOpenCheckout} badge="POS" />
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
                <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-xs">
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white max-w-md w-full border border-gray-300 shadow-2xl p-6 relative text-left"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-150 pb-3.5 mb-5">
                      <h3 className="text-[13px] font-sans font-bold text-neutral-900 uppercase tracking-widest">Record Smartphone Sale</h3>
                      <button 
                        onClick={() => setActiveMarkSoldProduct(null)} 
                        className="text-gray-400 hover:text-neutral-900 transition-colors cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Product Specs Showcase */}
                    <div className="flex gap-3 bg-neutral-50 border border-gray-200 p-3 mb-5 rounded-sm">
                      <div className="w-12 h-12 bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                        <img 
                          src={activeMarkSoldProduct.image} 
                          alt={activeMarkSoldProduct.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-neutral-900 leading-snug">{activeMarkSoldProduct.name}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{activeMarkSoldProduct.brand}</p>
                      </div>
                    </div>

                    {/* Select Variant */}
                    <div className="space-y-2 mb-5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Select Sold Variant</label>
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
                              className={`p-3 text-left border transition-all flex flex-col justify-between rounded-sm relative cursor-pointer
                                ${isOutOfStock 
                                  ? 'opacity-40 bg-neutral-50 border-neutral-200 cursor-not-allowed' 
                                  : isSelected 
                                    ? 'border-neutral-950 bg-neutral-950 text-white' 
                                    : 'border-gray-300 bg-white hover:border-gray-400'}`}
                            >
                              <span className="text-xs font-bold truncate block w-full">{v.color}</span>
                              <span className="text-[10px] opacity-75 font-semibold mt-1 block">
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
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Quantity</label>
                          <div className="flex items-center border border-gray-300 h-[42px] rounded-sm">
                            <button
                              type="button"
                              onClick={() => setSoldQty(q => Math.max(1, q - 1))}
                              className="w-10 h-full flex items-center justify-center hover:bg-neutral-50 text-neutral-800 transition-colors cursor-pointer"
                            >
                              <Minus size={12} strokeWidth={2.5} />
                            </button>
                            <span className="flex-1 text-center font-bold text-sm text-neutral-950">{soldQty}</span>
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
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Buyer (Optional)</label>
                          <input
                            type="text"
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full border border-gray-300 px-3 h-[42px] text-xs font-semibold focus:outline-none focus:border-neutral-900 rounded-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex gap-3.5 border-t border-gray-150 pt-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setActiveMarkSoldProduct(null)}
                        className="flex-1 py-3 text-xs border border-gray-350 hover:bg-gray-50 text-neutral-850 font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!selectedMarkSoldVariant || selectedMarkSoldVariant.quantity === 0}
                        onClick={handleConfirmSale}
                        className={`flex-1 py-3 text-xs text-white font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer shadow-md shadow-brand-100/10
                          ${(!selectedMarkSoldVariant || selectedMarkSoldVariant.quantity === 0)
                            ? 'bg-neutral-350 cursor-not-allowed opacity-50 shadow-none'
                            : 'bg-[#5438ff] hover:bg-[#4324ff]'}`}
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
                <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-xs">
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white max-w-sm w-full border border-gray-300 shadow-2xl p-6 relative text-left"
                  >
                    {/* Visual Green Badge */}
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                      <CheckCircle2 size={28} />
                    </div>

                    <h3 className="text-base font-sans font-bold text-neutral-900 text-center uppercase tracking-wider">Sale Recorded!</h3>
                    <p className="text-[11px] text-neutral-500 text-center mt-1 font-light leading-relaxed">
                      Inventory has been adjusted. Print or share a digital receipt.
                    </p>

                    {/* Receipt Mock Paper Preview */}
                    <div className="my-5 p-4 border border-dashed border-gray-300 bg-neutral-50 font-mono text-[10px] text-neutral-800 space-y-3 shadow-inner relative overflow-hidden">
                      
                      {/* Receipt Header */}
                      <div className="text-center border-b border-dashed border-gray-300 pb-2">
                        <p className="font-bold text-xs uppercase tracking-widest text-neutral-900">{invoiceSaleData.shopName}</p>
                        <p className="text-[8px] text-gray-500 font-sans mt-0.5 uppercase tracking-wider">Smartphone Merchant Terminal</p>
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
                      <div className="border-t border-b border-dashed border-gray-300 py-2">
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
                        className="w-full py-3 bg-neutral-950 hover:bg-black text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-sm transition-all cursor-pointer shadow-md"
                      >
                        <Receipt size={13} />
                        <span>Download PDF Receipt</span>
                      </button>
                      
                      <button
                        onClick={() => handleShareWhatsApp(invoiceSaleData)}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-sm transition-all cursor-pointer shadow-md shadow-green-600/10"
                      >
                        <Share2 size={13} />
                        <span>Share via WhatsApp</span>
                      </button>

                      <button
                        onClick={() => setInvoiceSaleData(null)}
                        className="w-full py-2.5 bg-gray-50 text-gray-500 border border-gray-300 hover:bg-gray-100 text-[10px] font-bold uppercase tracking-wider transition-all rounded-sm cursor-pointer"
                      >
                        Done / Close
                      </button>
                    </div>

                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Modal 3: Complete Sale POS Checkout Bottom Sheet */}
            <AnimatePresence>
              {posCheckoutOpen && (
                <div className="fixed inset-0 bg-black/60 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-xs">
                  {/* Backdrop Close Click */}
                  <div className="absolute inset-0" onClick={() => setPosCheckoutOpen(false)} />

                  <motion.div 
                    initial={{ y: "100%", opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0.5 }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    className="bg-white w-full h-[92vh] md:h-[85vh] md:max-w-2xl border-t md:border border-gray-300 shadow-2xl relative text-left md:rounded-lg overflow-hidden flex flex-col z-[210]"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 flex-shrink-0 bg-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                          <ShoppingBag size={16} />
                        </div>
                        <div>
                          <h3 className="text-[14px] font-sans font-bold text-neutral-900 uppercase tracking-widest">Zenvy POS Terminal</h3>
                          <p className="text-[12px] text-gray-500 font-normal mt-0.5">Step {posStep} of 3: {posStep === 1 ? 'Build Customer Cart' : posStep === 2 ? 'Sale Details & Negotiations' : 'Receipt Invoice Generation'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setPosCheckoutOpen(false)} 
                        className="text-gray-400 hover:text-neutral-900 transition-colors p-1.5 hover:bg-neutral-50 rounded-full cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Step 1: Product Selection */}
                    {posStep === 1 && (
                      <div className="flex-1 flex flex-col min-h-0 bg-neutral-50">
                        {/* Search Block */}
                        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                              <Search size={16} />
                            </span>
                            <input
                              type="text"
                              autoFocus
                              value={posSearch}
                              onChange={(e) => setPosSearch(e.target.value)}
                              placeholder="Search brand, model name, color swatch..."
                              className="w-full bg-[#f6f6f7] py-3 pl-10 pr-4 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all border border-transparent focus:border-emerald-500"
                            />
                            {posSearch && (
                              <button 
                                onClick={() => setPosSearch('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neutral-900"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* In-stock Products List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                          {(() => {
                            const query = posSearch.toLowerCase().trim();
                            // Filter products: must be in stock and match search query
                            const filtered = productList.filter(p => {
                              if (p.stock === 0) return false;
                              
                              const matchProduct = p.name.toLowerCase().includes(query) || (p.brand || '').toLowerCase().includes(query);
                              if (matchProduct) return true;

                              // Also match variant descriptions (like "Black", "256GB")
                              const matchVariants = p.variants?.some(v => 
                                (v.color || '').toLowerCase().includes(query) || 
                                (v.storage || '').toLowerCase().includes(query) ||
                                (v.ram || '').toLowerCase().includes(query)
                              );
                              return matchVariants;
                            });

                            if (filtered.length === 0) {
                              return (
                                <div className="text-center py-12 text-gray-400">
                                  <AlertTriangle size={32} className="mx-auto mb-2 opacity-55" />
                                  <p className="text-xs font-bold uppercase tracking-wider">No matching smartphone in stock</p>
                                </div>
                              );
                            }

                            return filtered.map(product => {
                              const isExpanded = expandedProductId === product.id;
                              // Count of variants of this product in the cart
                              const cartItemCount = posCart
                                .filter(item => item.product.id === product.id)
                                .reduce((sum, item) => sum + item.quantity, 0);

                              return (
                                <div 
                                  key={product.id}
                                  className={`bg-white border border-gray-300 overflow-hidden transition-all duration-200 
                                    ${isExpanded ? 'border-neutral-300 ring-1 ring-neutral-300/5' : 'border-gray-300 hover:border-gray-300'}`}
                                >
                                  {/* Product Card Top bar */}
                                  <div 
                                    onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                                    className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                                  >
                                    <div className="flex items-center gap-3">
                                      {/* Thumbnail */}
                                      <div className="w-10 h-10 bg-neutral-50 border border-gray-150 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-semibold text-neutral-900 leading-snug">{product.name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-[10px] text-gray-500 font-normal uppercase tracking-wider">{product.brand}</span>
                                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                          <span className="text-[12px] text-emerald-600 font-medium uppercase tracking-wider">{product.stock} <span className='text-[10px]'>in stock</span></span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action items indicators */}
                                    <div className="flex items-center gap-3">
                                      {cartItemCount > 0 && (
                                        <span className="bg-emerald-600 text-white text-[9px] font-light px-2 py-0.5 rounded-xs uppercase tracking-wider shadow-sm">
                                          {cartItemCount} selected
                                        </span>
                                      )}
                                      <ChevronRight 
                                        size={16} 
                                        className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-neutral-800' : ''}`} 
                                      />
                                    </div>
                                  </div>

                                  {/* Product Card Inline Expandable Swatches */}
                                  {isExpanded && (
                                    <div className="border-t border-gray-150 bg-neutral-50 px-4 py-3.5 space-y-3">
                                      <span className="text-[9px] font-normal text-gray-700 uppercase tracking-widest block">Choose Color/Storage Variant</span>
                                      <div className="grid grid-cols-2 gap-2">
                                        {product.variants?.map(v => {
                                          const cartItem = posCart.find(item => item.variant.id === v.id);
                                          const itemQtyInCart = cartItem?.quantity || 0;
                                          const isOutOfStock = v.quantity === 0;

                                          return (
                                            <div
                                              key={v.id}
                                              className="relative"
                                            >
                                              <button
                                                type="button"
                                                disabled={isOutOfStock}
                                                onClick={() => handleAddToCart(product, v)}
                                                className={`w-full p-2.5 text-left border rounded-md transition-all flex flex-col justify-between cursor-pointer relative h-[68px]
                                                  ${isOutOfStock 
                                                    ? 'opacity-40 bg-neutral-100 border-neutral-200 cursor-not-allowed' 
                                                    : itemQtyInCart > 0 
                                                      ? 'border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50' 
                                                      : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                              >
                                                <span className="text-sm font-medium text-neutral-900 truncate block pr-8">{v.color}</span>
                                                <span className="text-[11px] text-gray-700 font-normal block mt-1">
                                                  {v.ram}/{v.storage} • {isOutOfStock ? '0 Stock' : `${v.quantity} Stock`}
                                                </span>

                                                {/* Qty count indicators on active swatches */}
                                                {itemQtyInCart > 0 && (
                                                  <span className="absolute top-1.5 right-1.5 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm">
                                                    x{itemQtyInCart}
                                                  </span>
                                                )}
                                              </button>

                                              {/* Remove Badge Button */}
                                              {itemQtyInCart > 0 && (
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveFromCart(v.id);
                                                  }}
                                                  className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-650 transition-colors shadow-sm cursor-pointer border border-white"
                                                  title="Click to remove"
                                                >
                                                  <X size={10} strokeWidth={3} />
                                                </button>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                      <p className="text-[8px] text-gray-400 italic">Tip: Tap swatches again to increase sold counts. Press red (x) button to remove variant.</p>
                                    </div>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>

                        {/* Cart running summary bar */}
                        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0 space-y-3">
                          {posCart.length > 0 && (
                            <div className="text-[10px] text-gray-600 bg-neutral-50 px-3 py-2 border border-gray-150 rounded-md font-semibold leading-relaxed">
                              <span className="font-bold text-neutral-900 uppercase tracking-widest block text-[9px] mb-1">Selected Cart Items:</span>
                              <div className="truncate max-w-[500px]">
                                {posCart.map(item => `${item.product.name} (${item.variant.color} x${item.quantity})`).join(', ')}
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            disabled={posCart.length === 0}
                            onClick={() => setPosStep(2)}
                            className={`w-full py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest text-center transition-all cursor-pointer shadow-md
                              ${posCart.length === 0
                                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                                : 'bg-[#5438ff] hover:bg-[#4324ff] text-white'}`}
                          >
                            Done — {posCart.reduce((sum, item) => sum + item.quantity, 0)} Items Selected
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Sale Summary and Details */}
                    {posStep === 2 && (
                      <div className="flex-1 flex flex-col min-h-0 bg-neutral-50">
                        {/* Cart List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">Configure Negotiation & Overrides</span>
                          
                          {posCart.map((item, idx) => (
                            <div 
                              key={`${item.variant.id}-${idx}`}
                              className="bg-white border border-gray-300 p-3.5 flex items-center justify-between"
                            >
                              <div className="min-w-0 pr-4 flex-1">
                                <h4 className="text-sm font-medium text-neutral-900 truncate leading-snug">{item.product.name}</h4>
                                <p className="text-[10px] text-gray-600 uppercase font-medium tracking-wider mt-0.5">{item.product.brand} • {item.variant.color} ({item.variant.ram}/{item.variant.storage})</p>
                                
                                {/* Inline Editable Price Toggle */}
                                <div className="mt-2.5 flex items-center gap-1.5">
                                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Unit Price:</span>
                                  <div className="relative flex items-center">
                                    <span className="text-xs font-bold text-neutral-900 mr-1">Tk</span>
                                    <input
                                      type="number"
                                      value={item.overridePrice}
                                      onChange={(e) => handleUpdateCartItemPrice(item.variant.id, Number(e.target.value))}
                                      className="border-b border-gray-300 focus:border-neutral-900 w-24 text-xs font-bold text-neutral-950 focus:outline-none bg-transparent py-0.5 px-1"
                                      title="Negotiated custom price overrides"
                                    />
                                  </div>
                                </div>
                                <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1 py-0.5 rounded ml-1 font-semibold uppercase tracking-wide">MSRP Tk {item.variant.sellingPrice.toLocaleString()}</span>
                              </div>

                              {/* Stepper Quantity control */}
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <div className="flex items-center border border-gray-350 h-[34px] rounded-md overflow-hidden bg-white">
                                  <button
                                    type="button"
                                    onClick={() => handleDecrementFromCart(item.variant.id)}
                                    className="w-8 h-full flex items-center justify-center hover:bg-neutral-50 text-neutral-800 transition-colors cursor-pointer"
                                  >
                                    <Minus size={11} strokeWidth={2.5} />
                                  </button>
                                  <span className="w-8 text-center font-bold text-xs text-neutral-950">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(item.product, item.variant)}
                                    className="w-8 h-full flex items-center justify-center hover:bg-neutral-50 text-neutral-800 transition-colors cursor-pointer"
                                  >
                                    <Plus size={11} strokeWidth={2.5} />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromCart(item.variant.id)}
                                  className="text-[9px] text-red-500 hover:text-red-650 font-bold uppercase tracking-wider"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Sale Details Inputs */}
                        <div className="bg-white border-t border-gray-200 p-4 space-y-4 flex-shrink-0">
                          {/* Buyer Name & Discount */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Buyer Name */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Customer Name</label>
                              <input
                                type="text"
                                value={posBuyerName}
                                onChange={(e) => setPosBuyerName(e.target.value)}
                                placeholder="Customer name (optional)"
                                className="w-full border border-gray-300 px-3 h-[42px] text-xs font-semibold focus:outline-none focus:border-neutral-900 rounded-lg"
                              />
                            </div>

                            {/* Discount Picker */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Discount</label>
                                {/* Toggle buttons flat vs % */}
                                <div className="flex bg-neutral-100 rounded-md p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPosDiscountType('flat');
                                      setPosDiscountValue(0);
                                    }}
                                    className={`px-2 py-0.5 text-[12px] font-bold rounded uppercase tracking-wider cursor-pointer transition-all
                                      ${posDiscountType === 'flat' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                                  >
                                    Tk
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPosDiscountType('percent');
                                      setPosDiscountValue(0);
                                    }}
                                    className={`px-3 py-0.5 text-[12px] font-bold rounded uppercase tracking-wider cursor-pointer transition-all
                                      ${posDiscountType === 'percent' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                                  >
                                    %
                                  </button>
                                </div>
                              </div>

                              <div className="relative">
                                <input
                                  type="number"
                                  value={posDiscountValue || ''}
                                  onChange={(e) => setPosDiscountValue(Number(e.target.value))}
                                  placeholder={posDiscountType === 'flat' ? 'BDT flat discount' : 'Percentage %'}
                                  className="w-full border border-gray-300 pl-3 pr-8 h-[42px] text-xs font-semibold focus:outline-none focus:border-neutral-900 rounded-lg"
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                                  {posDiscountType === 'flat' ? 'Tk' : '%'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Calculations breakdown block */}
                          <div className="bg-neutral-50 border border-gray-200 p-4.5 rounded-lg space-y-2">
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
                                <>
                                  <div className="flex justify-between text-xs font-medium text-gray-500">
                                    <span>Subtotal:</span>
                                    <span className="font-bold text-neutral-900">Tk {subtotal.toLocaleString()}</span>
                                  </div>
                                  {discount > 0 && (
                                    <div className="flex justify-between text-xs font-medium text-red-500">
                                      <span>Discount:</span>
                                      <span className="font-bold">-Tk {discount.toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                                    <span className="text-xs font-bold text-neutral-900 uppercase tracking-widest">GRAND TOTAL:</span>
                                    <span className="text-xl font-black text-[#5438ff]">Tk {grandTotal.toLocaleString()}</span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setPosStep(1)}
                              className="flex-1 py-2 text-xs border border-gray-300 hover:bg-gray-50 text-neutral-750 font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer text-center"
                            >
                              Go Back
                            </button>
                            <button
                              type="button"
                              onClick={handleConfirmPOSSale}
                              className="flex-1 py-2 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer shadow-md shadow-emerald-600/10 text-center"
                            >
                              Confirm Sale
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Success Confirmation and Invoice exports */}
                    {posStep === 3 && posSuccessData && (
                      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-white overflow-y-auto">
                        {/* Success Animated Checkmark */}
                        <div className="w-16 h-16 mt-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                          <CheckCircle2 size={38} className="stroke-[2.5]" />
                        </div>

                        <h3 className="text-lg font-sans font-bold text-neutral-900 text-center uppercase tracking-wider">Sale Recorded Successfully!</h3>
                        <p className="text-xs text-neutral-500 text-center mt-1.5 font-medium max-w-sm">
                          Smartphone stock quantities have been adjusted. A branded premium invoice slip is ready.
                        </p>

                        {/* Invoice Summary Box */}
                        <div className="my-6 p-5 border border-dashed border-gray-300 bg-neutral-50 font-mono text-xs text-neutral-800 space-y-4 max-w-sm w-full shadow-inner rounded-md">
                          <div className="text-center border-b border-dashed border-gray-300 pb-2.5">
                            <p className="font-bold text-sm uppercase tracking-widest text-neutral-950">{posSuccessData.shopName}</p>
                            <p className="text-[9px] text-gray-500 mt-0.5 uppercase tracking-widest">STOCKNET TERMINAL SALE</p>
                          </div>

                          <div className="space-y-1 text-neutral-600">
                            <p className="flex justify-between">
                              <span>Invoice No:</span>
                              <strong className="text-neutral-950 font-bold">{posSuccessData.invoiceNumber}</strong>
                            </p>
                            <p className="flex justify-between">
                              <span>Date/Time:</span>
                              <span className="text-neutral-900 font-semibold">{posSuccessData.date} {posSuccessData.time}</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Customer:</span>
                              <span className="text-neutral-900 font-semibold truncate max-w-[170px]">{posSuccessData.buyerName}</span>
                            </p>
                          </div>

                          <div className="border-t border-b border-dashed border-gray-300 py-3 space-y-2">
                            <div className="flex justify-between font-bold text-neutral-950 text-[10px] uppercase tracking-wider">
                              <span>Item description</span>
                              <span>Qty / Total</span>
                            </div>
                            
                            {posSuccessData.items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between leading-snug">
                                <div className="truncate pr-3 max-w-[190px]">
                                  <p className="font-bold text-neutral-900 text-[11px] truncate">{item.brand} {item.name}</p>
                                  <p className="text-[9px] text-gray-400 italic">{item.color} • {item.specs}</p>
                                </div>
                                <div className="text-right flex-shrink-0 text-neutral-950 font-bold">
                                  <p>{item.quantity} x Tk {item.price.toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-xs font-semibold text-neutral-600">
                              <span>Subtotal:</span>
                              <span>Tk {posSuccessData.subtotal.toLocaleString()}</span>
                            </div>
                            {posSuccessData.discount > 0 && (
                              <div className="flex justify-between text-xs font-semibold text-red-500">
                                <span>Discount:</span>
                                <span>-Tk {posSuccessData.discount.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-baseline font-bold text-sm text-neutral-950 pt-1.5 border-t border-dashed border-gray-250">
                              <span>GRAND TOTAL:</span>
                              <span className="text-base text-neutral-950 font-black">Tk {posSuccessData.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions block */}
                        <div className="space-y-2.5 max-w-sm w-full">
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => generateBrandedInvoicePDF(posSuccessData)}
                              className="py-2 bg-neutral-950 hover:bg-black text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-sm transition-all cursor-pointer shadow-md"
                            >
                              <Receipt size={13} />
                              <span>Generate Invoice</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                // Background PDF compilation and WhatsApp link share
                                generateBrandedInvoicePDF(posSuccessData);
                                
                                const textMessage = `Hello ${posSuccessData.buyerName},\n\nThank you for purchasing at ${posSuccessData.shopName}!\nHere is your receipt details:\n\n*Invoice No:* ${posSuccessData.invoiceNumber}\n*Date:* ${posSuccessData.date} ${posSuccessData.time}\n\n*Items Purchased:* \n${posSuccessData.items.map((item: any) => `- *${item.brand} ${item.name}* (${item.color} ${item.specs}) x ${item.quantity} units @ Tk ${item.price.toLocaleString()}`).join('\n')}\n\n*Subtotal:* Tk ${posSuccessData.subtotal.toLocaleString()}\n*Discount Applied:* -Tk ${posSuccessData.discount.toLocaleString()}\n*Grand Total:* *Tk ${posSuccessData.total.toLocaleString()}*\n\nYour digital A4 Invoice PDF has been generated offline. Thank you for shopping with us! 🌟`;
                                const encodedText = encodeURIComponent(textMessage);
                                window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
                              }}
                              className="py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-sm transition-all cursor-pointer shadow-md shadow-green-600/10"
                            >
                              <Share2 size={13} />
                              <span>Share on WhatsApp</span>
                            </button>
                          </div>

                          <button
                            onClick={() => setPosCheckoutOpen(false)}
                            className="w-full py-3 bg-gray-50 text-gray-500 border border-gray-300 hover:bg-gray-100 text-[10px] font-bold uppercase tracking-wider transition-all rounded-lg cursor-pointer text-center"
                          >
                            Done, go back to dashboard
                          </button>
                        </div>
                      </div>
                    )}

                  </motion.div>
                </div>
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
                  <div className="space-y-6 text-left">
                    
                    {/* Welcome Greeting Header */}
                    <div className="flex flex-col gap-1 pb-1">
                      <h2 className="text-xl md:text-2xl font-medium text-[#1a1c1d] tracking-tight">
                        {(() => {
                          const hour = new Date().getHours();
                          if (hour < 12) return 'Good morning';
                          if (hour < 17) return 'Good afternoon';
                          return 'Good evening';
                        })()}, {storeName || 'Merchant'}
                      </h2>
                      <p className="text-xs text-gray-500 font-light leading-relaxed">
                        Here is a live performance snapshot for your smartphone storefront today.
                      </p>
                    </div>

                    {/* Share Shop Card Hero Banner - Elegant Marketing card */}
                    <motion.div 
                      whileHover={{ y: -1.5 }}
                      onClick={handleShareShopCard}
                      className="bg-gradient-to-br from-[#0c0d0f] via-[#16171a] to-[#0a0a0c] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 cursor-pointer shadow-lg shadow-black/5 border border-white/5 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-shopify-green/10 via-transparent to-transparent pointer-events-none"></div>
                      
                      <div className="flex items-start gap-4 relative z-10">
                        {/* Curved Mini Seal Logo Overlay */}
                        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative select-none flex-shrink-0">
                          <svg viewBox="0 0 100 100" className="w-full h-full p-0.5 animate-[spin_35s_linear_infinite]">
                            <path id="miniPath" d="M 20,50 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0" fill="none" />
                            <text className="text-[9px] font-bold fill-white/60 tracking-[0.16em] uppercase">
                              <textPath href="#miniPath" startOffset="50%" textAnchor="middle">
                                {storeName ? storeName.substring(0, 8) : 'ZENVY'} · CATALOG ·
                              </textPath>
                            </text>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles size={16} className="text-white fill-white/10" />
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-[15px] font-medium text-white tracking-tight flex items-center gap-2">
                            Live Storefront is Active 
                            <span className="bg-[#ccff00] text-black text-[9px] font-bold uppercase tracking-wider py-0.5 px-2.5 rounded-sm">
                              ONLINE
                            </span>
                          </p>
                          <p className="text-xs text-gray-400 font-light leading-relaxed max-w-md">
                            Anyone visiting your storefront can view live catalog quantities & inquire instantly via WhatsApp. Zero downloads or logins required.
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareShopCard();
                        }}
                        className="bg-white hover:bg-gray-50 text-black py-3 px-5 text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 self-start md:self-auto shadow-md transition-all active:scale-98 relative z-10"
                      >
                        <Share2 size={13} className="stroke-[2.5]" />
                        Get Share Link
                      </button>
                    </motion.div>

                    {/* Summary Stats Grid (Polaris-Style Flat Visuals) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Stat 1: Products in Stock */}
                      <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.015)] text-left hover:shadow-md transition-shadow">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Products in stock</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl md:text-2xl font-medium text-[#1a1c1d]">
                            {productList.reduce((sum, p) => sum + p.stock, 0)}
                          </span>
                          <span className="flex items-center text-[10px] font-bold text-green-500 gap-0.5">
                            <ArrowUpRight size={11} className="stroke-[2.5]" />
                            <span>+4.2%</span>
                          </span>
                        </div>
                      </div>

                      {/* Stat 2: Total Stock Value */}
                      <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.015)] text-left hover:shadow-md transition-shadow">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Asset Stock Value</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl md:text-2xl font-medium text-[#1a1c1d] truncate max-w-full">
                            <span className="text-[13px] text-gray-400 font-light mr-0.5">৳</span>
                            {productList.reduce((sum, p) => sum + (p.variants?.reduce((vSum, v) => vSum + (v.sellingPrice * v.quantity), 0) || 0), 0).toLocaleString()}
                          </span>
                          <span className="flex items-center text-[10px] font-bold text-green-500 gap-0.5">
                            <ArrowUpRight size={11} className="stroke-[2.5]" />
                            <span>+8.1%</span>
                          </span>
                        </div>
                      </div>

                      {/* Stat 3: Units Sold */}
                      <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.015)] text-left hover:shadow-md transition-shadow">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Units Sold (May)</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl md:text-2xl font-medium text-[#1a1c1d]">
                            {recentActivities.filter(a => a.type === 'sold').length + 8}
                          </span>
                          <span className="flex items-center text-[10px] font-bold text-green-500 gap-0.5">
                            <ArrowUpRight size={11} className="stroke-[2.5]" />
                            <span>+15.2%</span>
                          </span>
                        </div>
                      </div>

                      {/* Stat 4: Revenue */}
                      <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.015)] text-left hover:shadow-md transition-shadow">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Estimated Revenue</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl md:text-2xl font-medium text-[#1a1c1d] truncate max-w-full">
                            <span className="text-[13px] text-gray-400 font-light mr-0.5">৳</span>
                            {((recentActivities.filter(a => a.type === 'sold').length + 8) * 35000).toLocaleString()}
                          </span>
                          <span className="flex items-center text-[10px] font-bold text-green-500 gap-0.5">
                            <ArrowUpRight size={11} className="stroke-[2.5]" />
                            <span>+19.8%</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Intelligent Stock Alert Panel */}
                    {(() => {
                      // Dynamically scan productList for items below threshold
                      const lowStockProducts = productList.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 4));
                      const alertProduct = lowStockProducts[0] || null;

                      if (alertProduct) {
                        return (
                          <div className="bg-[#fdf6e8] p-5 border border-[#ffeec8] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
                            <div className="flex items-start gap-4">
                              {/* Thumbnail */}
                              <div className="w-12 h-12 rounded-xl border border-[#ffe399] overflow-hidden flex-shrink-0 bg-white shadow-xs">
                                <img 
                                  src={alertProduct.image || "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=120&auto=format"} 
                                  alt={alertProduct.name} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle size={14} className="text-warning-500 stroke-[2.5]" />
                                  <h4 className="text-[11px] font-bold text-warning-700 uppercase tracking-widest">Inventory Running Low</h4>
                                </div>
                                <p className="text-gray-700 text-[13px] font-light leading-relaxed max-w-lg">
                                  Your smartphone model <span className="font-medium text-black">{alertProduct.brand} {alertProduct.name}</span> is low on stock. Restock soon to prevent catalog shortages.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-auto">
                              <span className="bg-white border border-[#ffe399] text-warning-700 text-xs font-bold py-1.5 px-3 rounded-md shadow-xs">
                                {alertProduct.stock} left
                              </span>
                              <button 
                                onClick={() => {
                                  setEditingProduct(alertProduct);
                                }}
                                className="bg-[#e69800] hover:bg-[#c46c00] text-white py-1.5 px-4 rounded-md text-xs font-medium transition-colors shadow-xs"
                              >
                                Restock
                              </button>
                            </div>
                          </div>
                        );
                      } else {
                        // All stock fully healthy! Show gorgeous verified safe banner
                        return (
                          <div className="bg-[#f4fcf7] p-5 border border-[#cbf5da] rounded-2xl flex items-center justify-between gap-4 text-left">
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
                            <span className="bg-white border border-green-200 text-green-700 text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider shadow-xs">
                              All Swatches Good
                            </span>
                          </div>
                        );
                      }
                    })()}

                    {/* Recent Activity Feed - Elegant Timeline layout */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.01)] overflow-hidden text-left">
                      {/* Header */}
                      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                        <div>
                          <h3 className="font-medium text-[#1a1c1d] text-[15px]">Recent Log Activity</h3>
                          <p className="text-[11px] text-gray-400 mt-0.5 font-light">Real-time chronicle of stock operations</p>
                        </div>
                        <button 
                          onClick={() => setActiveTab('Products')}
                          className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors"
                        >
                          View products
                        </button>
                      </div>

                      {/* Timeline log feed */}
                      <div className="divide-y divide-gray-50">
                        {recentActivities.slice(0, 5).map((item, i) => (
                          <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50/50 transition-colors">
                            <div className="flex items-center gap-3.5 min-w-0">
                              {/* Status dot indicator */}
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                item.type === 'sold' ? 'bg-[#5438ff]' :
                                item.type === 'added' ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                              
                              <div className="min-w-0">
                                <p className="text-[13px] font-light text-gray-800 leading-snug truncate">
                                  <span className="font-medium text-black">{item.text}</span>
                                  <span className="text-gray-300 mx-2">|</span>
                                  <span className="text-gray-500">{item.product}</span>
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                              <span className={`hidden sm:inline-block text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                                item.type === 'sold' ? 'bg-blue-50 text-[#5438ff]' :
                                item.type === 'added' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
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
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3 flex justify-end">
                        <button 
                          onClick={() => setIsCreatingProduct(true)}
                          className="bg-[#5438ff] hidden text-white px-6 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#5438ff]/10"
                        >
                          <Plus size={18} strokeWidth={3} />
                          <span>Add product</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden">
                      {/* Product Status Tabs */}
                      <div className="flex border-b border-gray-100 px-4">
                        {['All', 'Low Stock', 'Out of Stock'].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveProductFilter(tab)}
                            className={`py-4 px-1.5 text-[10px] whitespace-nowrap font-bold uppercase tracking-widest transition-all relative
                              ${activeProductFilter === tab ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{tab}</span>
                              <span className="bg-neutral-50 border border-brand-divider px-1.5 py-0.5 rounded text-[10px] font-bold text-neutral-500">
                                {tab === 'All' ? productList.length : 
                                 tab === 'Low Stock' ? productList.filter(p => {
                                    const threshold = p.lowStockThreshold || 5;
                                    const hasLowStockVariant = p.variants?.some(v => v.quantity > 0 && v.quantity <= threshold);
                                    return hasLowStockVariant || (p.stock > 0 && p.stock <= threshold);
                                 }).length : 
                                 tab === 'Out of Stock' ? productList.filter(p => {
                                    const allVariantsOut = p.variants && p.variants.length > 0 ? p.variants.every(v => v.quantity === 0) : false;
                                    return p.stock === 0 || allVariantsOut;
                                 }).length : 0}
                              </span>
                            </div>
                            {activeProductFilter === tab && (
                              <motion.div layoutId="product-tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Search & Action Controls */}
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

                      {/* Cards Container */}
                      <div className="p-4 md:p-6 flex flex-col gap-3.5">
                        {productList.filter(p => {
                          if (activeProductFilter === 'All') return true;
                          if (activeProductFilter === 'Low Stock') {
                            const threshold = p.lowStockThreshold || 5;
                            const hasLowStockVariant = p.variants?.some(v => v.quantity > 0 && v.quantity <= threshold);
                            return hasLowStockVariant || (p.stock > 0 && p.stock <= threshold);
                          }
                          if (activeProductFilter === 'Out of Stock') {
                            const allVariantsOut = p.variants && p.variants.length > 0 ? p.variants.every(v => v.quantity === 0) : false;
                            return p.stock === 0 || allVariantsOut;
                          }
                          return true;
                        }).filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                          <motion.div 
                            key={product.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-brand-divider p-4 md:p-5 flex gap-4 items-start relative hover:shadow-[0_4px_20px_rgba(0,0,0,0.015)] transition-all group"
                          >
                            {/* Product Image Thumbnail */}
                            <div className="w-16 h-16 border border-brand-divider overflow-hidden flex-shrink-0 bg-neutral-50 shadow-sm">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>

                            {/* Details Column */}
                            <div className="flex-1 min-w-0">
                              {/* 1st Line: Model Name & Brand */}
                              <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-neutral-900 leading-snug group-hover:text-primary-500 transition-colors">
                                  {product.name}
                                </span>
                                {product.brand && (
                                  <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                                    {product.brand}
                                  </span>
                                )}
                              </div>

                              {/* 2nd Line: Variant Chips with Smart Threshold Colors */}
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {product.variants && product.variants.length > 0 ? (
                                  product.variants.map((variant) => {
                                    const threshold = product.lowStockThreshold || 5;
                                    const isOutOfStock = variant.quantity === 0;
                                    const isLowStock = variant.quantity > 0 && variant.quantity <= threshold;

                                    let chipClass = "bg-neutral-50 text-neutral-600 border-brand-divider";
                                    if (isOutOfStock) {
                                      chipClass = "bg-neutral-50 text-neutral-400 border-neutral-200";
                                    } else if (isLowStock) {
                                      chipClass = "bg-red-50 text-red-700 border-red-200";
                                    }

                                    return (
                                      <span 
                                        key={variant.id} 
                                        className={`text-[12px] font-normal px-2.5 py-1 flex items-center gap-1.5 border transition-all ${chipClass}`}
                                      >
                                        <span>
                                          {variant.color} {variant.ram.replace('GB', '')}/{variant.storage.replace('GB', '')}
                                        </span>
                                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                                          isOutOfStock ? 'bg-neutral-100 text-neutral-400' :
                                          isLowStock ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-primary-600'
                                        }`}>
                                          {variant.quantity}
                                        </span>
                                      </span>
                                    );
                                  })
                                ) : (
                                  /* Fallback if no specific variants list exists */
                                  (() => {
                                    const threshold = product.lowStockThreshold || 5;
                                    const isOutOfStock = product.stock === 0;
                                    const isLowStock = product.stock > 0 && product.stock <= threshold;

                                    let chipClass = "bg-neutral-50 text-neutral-600 border-brand-divider";
                                    if (isOutOfStock) {
                                      chipClass = "bg-neutral-50 text-neutral-400 border-neutral-200";
                                    } else if (isLowStock) {
                                      chipClass = "bg-red-50 text-red-700 border-red-200";
                                    }

                                    return (
                                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border ${chipClass}`}>
                                        <span>Total Stock</span>
                                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                                          isOutOfStock ? 'bg-neutral-100 text-neutral-400' :
                                          isLowStock ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-primary-600'
                                        }`}>
                                          {product.stock}
                                        </span>
                                      </span>
                                    );
                                  })()
                                )}
                              </div>

                              {/* 3rd Line: Preview Action & Status Indicator */}
                              <div className="flex items-center justify-between mt-4 pt-1.5 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => setPreviewingProduct(product)}
                                    className="flex items-center gap-1 text-[10px] text-primary-500 hover:text-primary-600 font-bold uppercase tracking-widest transition-colors"
                                  >
                                    <ExternalLink size={12} className="stroke-[2.5]" />
                                    <span>Preview</span>
                                  </button>

                                  <button 
                                    onClick={() => handleMarkAsSoldClick(product)}
                                    disabled={product.stock === 0}
                                    className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors rounded-xs
                                      ${product.stock === 0 
                                        ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed line-through' 
                                        : 'bg-[#5438ff] text-white hover:bg-[#4324ff]'}`}
                                  >
                                    <Plus size={10} className="stroke-[3]" />
                                    <span>Mark Sold</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </main>

            {/* Mobile Footer Navigation */}
            <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-2 flex items-center justify-between sticky bottom-0 w-full z-10 gap-1.5">
              <NavItem icon={Home} label="Home" active={activeTab === 'Home'} onClick={() => setActiveTab('Home')} />
              <NavItem icon={Package} label="Orders" active={activeTab === 'Orders'} onClick={() => setActiveTab('Orders')} />
              
              {/* Central Floating Navigation Twin Buttons */}
              <div className="relative -mt-6 flex items-center gap-2 flex-shrink-0">
                {/* Floating Plus Button (Add Product) */}
                <button 
                  onClick={() => setIsCreatingProduct(true)}
                  className="w-11 h-11 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center shadow-md shadow-primary-500/20 hover:scale-[1.08] active:scale-[0.95] transition-all border-[3px] border-white cursor-pointer"
                  aria-label="Add Product"
                >
                  <Plus size={18} className="stroke-[3]" />
                </button>

                {/* Floating Shopping Bag Button (Complete Sale / Checkout) */}
                <button 
                  onClick={handleOpenCheckout}
                  className="w-11 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-md shadow-emerald-600/20 hover:scale-[1.08] active:scale-[0.95] transition-all border-[3px] border-white cursor-pointer"
                  aria-label="Complete Sale (POS)"
                >
                  <ShoppingBag size={16} className="stroke-[2.5]" />
                </button>
              </div>
              
              <NavItem icon={TagIcon} label="Products" active={activeTab === 'Products'} onClick={() => setActiveTab('Products')} />
              <NavItem icon={MoreHorizontal} label="More" active={activeTab === 'More'} onClick={() => setActiveTab('More')} />
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
