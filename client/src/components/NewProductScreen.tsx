"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  Smartphone, 
  Camera,
  Plus,
  Trash2,
  X,
  Layers,
  Sparkles,
  HelpCircle,
  Bell,
  Globe,
  Tag,
  Eye,
  AlertCircle
} from 'lucide-react';
import { PHONE_MODELS, BRANDS, COLORS, RAM_OPTIONS, STORAGE_OPTIONS } from '@/data/constants';
import { ProductVariant, ProductFormData } from '@/types/zenvy';

const PRESET_MOCK_IMAGES = [
  { label: 'Black Phone', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=200&auto=format' },
  { label: 'Blue Phone', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=200&auto=format' },
  { label: 'White Phone', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format' },
  { label: 'Titanium Phone', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=200&auto=format' }
];

const getColorHex = (colorName: string): string => {
  const name = colorName.toLowerCase();
  if (name.includes('black') || name.includes('dark')) return '#020302';
  if (name.includes('white') || name.includes('milk')) return '#ffffff';
  if (name.includes('blue') || name.includes('ocean')) return '#1d4ed8';
  if (name.includes('green') || name.includes('emerald')) return '#065f46';
  if (name.includes('gold') || name.includes('sunset')) return '#d97706';
  if (name.includes('gray') || name.includes('grey') || name.includes('silver') || name.includes('titanium')) return '#94a3b8';
  if (name.includes('purple') || name.includes('lavender')) return '#7e22ce';
  if (name.includes('red')) return '#dc2626';
  if (name.includes('orange')) return '#ea580c';
  if (name.includes('pink')) return '#db2777';
  return '#777771';
};

export default function NewProductScreen({ 
  onBack, 
  onSuccess,
  initialProduct
}: { 
  onBack: () => void, 
  onSuccess: (product: any) => void,
  initialProduct?: any
}) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialProduct?.name || '',
    brand: initialProduct?.brand || 'Smartphones',
    description: initialProduct?.description || '',
    variants: initialProduct?.variants || [],
    lowStockThreshold: initialProduct?.lowStockThreshold || 2,
  });

  const [searchQuery, setSearchQuery] = useState(initialProduct?.name || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSection, setActiveSection] = useState('Basic information');

  // Variant Creator Modal & Inputs
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedModalColor, setSelectedModalColor] = useState<string | null>(null);
  const [selectedCombos, setSelectedCombos] = useState<{ ram: string; storage: string }[]>([]);
  const [selectedRams, setSelectedRams] = useState<string[]>([]);
  const [selectedStorages, setSelectedStorages] = useState<string[]>([]);
  const [variantSelectionMethod, setVariantSelectionMethod] = useState<'combo' | 'individual'>('combo');

  // Custom Swatch color state
  const [customColorName, setCustomColorName] = useState('');
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [customColorsList, setCustomColorsList] = useState<string[]>([]);

  // Individual image popover selection states
  const [activeImagePickerId, setActiveImagePickerId] = useState<string | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Organization Tags State
  const [tagInput, setTagInput] = useState('');
  const [tagsList, setTagsList] = useState<string[]>(initialProduct?.tags || ['Electronics', 'Premium']);

  // Product status state
  const [productStatus, setProductStatus] = useState<string>(initialProduct?.status || 'Draft');

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const toggleComboSelection = (combo: { ram: string; storage: string }) => {
    const isSelected = selectedCombos.some(c => c.ram === combo.ram && c.storage === combo.storage);
    if (isSelected) {
      setSelectedCombos(selectedCombos.filter(c => !(c.ram === combo.ram && c.storage === combo.storage)));
    } else {
      setSelectedCombos([...selectedCombos, combo]);
    }
  };

  const addCustomColor = () => {
    if (customColorName.trim()) {
      const formatted = customColorName.trim();
      if (!COLORS.includes(formatted) && !customColorsList.includes(formatted)) {
        setCustomColorsList([...customColorsList, formatted]);
      }
      setSelectedModalColor(formatted);
      setCustomColorName('');
      setShowCustomColorInput(false);
    }
  };

  const generateVariants = () => {
    if (!selectedModalColor) return;
    const generated: ProductVariant[] = [];
    const color = selectedModalColor;
    
    if (variantSelectionMethod === 'combo') {
      selectedCombos.forEach(combo => {
        const id = `${color}-${combo.ram}-${combo.storage}`;
        const existing = formData.variants.find(v => v.id === id);
        generated.push(existing || {
          id,
          color,
          ram: combo.ram,
          storage: combo.storage,
          quantity: 10,
          buyingPrice: 0,
          sellingPrice: 0,
          sku: `SKU-${color.substring(0,3).toUpperCase()}-${combo.ram}-${combo.storage}`.replace(/\s+/g, ''),
          image: ''
        });
      });
    } else {
      selectedRams.forEach(ram => {
        selectedStorages.forEach(storage => {
          const id = `${color}-${ram}-${storage}`;
          const existing = formData.variants.find(v => v.id === id);
          generated.push(existing || {
            id,
            color,
            ram,
            storage,
            quantity: 10,
            buyingPrice: 0,
            sellingPrice: 0,
            sku: `SKU-${color.substring(0,3).toUpperCase()}-${ram}-${storage}`.replace(/\s+/g, ''),
            image: ''
          });
        });
      });
    }

    if (generated.length > 0) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, ...generated].filter((v, index, self) => 
          self.findIndex(t => t.id === v.id) === index
        )
      }));
    }

    setSelectedModalColor(null);
    setSelectedCombos([]);
    setSelectedRams([]);
    setSelectedStorages([]);
    setIsVariantModalOpen(false);
  };

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== id)
    }));
  };

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === id ? { ...v, [field]: value } : v)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !tagsList.includes(tagInput.trim())) {
      setTagsList([...tagsList, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(t => t !== tagToRemove));
  };

  const handleSubmit = () => {
    onSuccess({
      id: initialProduct?.id || Date.now(),
      name: formData.name || searchQuery,
      brand: formData.brand || 'Generic',
      stock: formData.variants.reduce((sum, v) => sum + v.quantity, 0),
      status: productStatus,
      image: formData.variants[0]?.image || initialProduct?.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format',
      lowStockThreshold: formData.lowStockThreshold,
      variants: formData.variants,
      description: formData.description,
      tags: tagsList,
      history: initialProduct?.history || [
        { text: `Product created — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, type: 'add' }
      ]
    });
  };

  const suggestions = PHONE_MODELS.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.brand.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handleSelectModel = (model: typeof PHONE_MODELS[0]) => {
    setFormData({ ...formData, name: model.name, brand: model.brand });
    setSearchQuery(model.name);
    setShowSuggestions(false);
  };

  return (
    <div className="flex-1 bg-[#fbf9f9] overflow-y-auto relative h-full flex flex-col font-sans text-[#1b1c1c]">
      
      {/* breadcrumbs header */}
      <header className="fixed top-0 right-0 left-0 z-50 bg-white flex justify-between items-center w-full px-6 md:px-12 h-16 border-b border-[#c7c7bf]">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg tracking-[0.2em] text-[#020302]">LUMINA</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-[#5e5e5d] hover:text-[#020302] transition-colors cursor-pointer">
            <Bell size={18} />
          </button>
          <button className="text-[#5e5e5d] hover:text-[#020302] transition-colors cursor-pointer">
            <HelpCircle size={18} />
          </button>
          <div className="h-8 w-8 rounded-full bg-[#e3e2e2] border border-[#c7c7bf] overflow-hidden">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxS3fgVQieR93hzActmRc81VSfMJ7305idtuLG9zhTlzTTjmiI52ZfzFnuyJUjD8gSiOntzF4Q9DK5iOZyGLILkzZUG5Rw6IBCh5FqFnlG7P-oA1OLkVE8wjhRpWy0fsP1vGN9auUoyLYv2hMffal-BluaMsS-hgydklG11BvHIEz8_HLZ1Qi7l2AGG4zJK-0QEj_c8e4P3e9g559KyWPCIzyP0zKnHEkMQAQrNWfrlA43kUactZJU7JKPWWfOOCtGhW1KLsgA0DIA" alt="Owner Profile" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 pt-24 px-6 md:px-12 max-w-[1440px] mx-auto w-full pb-20">
        
        {/* Breadcrumb & Main Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#c7c7bf]/20 pb-8">
          <div className="space-y-3">
            <nav className="flex items-center gap-2 text-[#5e5e5d] text-xs font-bold uppercase tracking-[0.15em]">
              <button onClick={onBack} className="hover:text-[#020302] transition-colors flex items-center gap-1">
                <span>Products</span>
              </button>
              <ChevronRight size={12} className="text-[#5e5e5d]" />
              <span className="text-[#020302] font-semibold">{initialProduct ? 'Edit product' : 'New product'}</span>
            </nav>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#020302]">
              {initialProduct ? 'Edit Product' : 'Create Product'}
            </h1>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setProductStatus('Draft');
                handleSubmit();
              }}
              className="px-6 h-[48px] border border-[#777771] text-[#020302] bg-white hover:bg-[#f5f3f3] transition-colors text-xs font-bold tracking-widest uppercase cursor-pointer"
            >
              Save Draft
            </button>
            <button 
              onClick={() => {
                setProductStatus('Published');
                handleSubmit();
              }}
              disabled={!formData.name && !searchQuery}
              className="px-6 h-[48px] bg-[#020302] hover:bg-[#868582] text-white transition-colors text-xs font-bold tracking-widest uppercase disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              {initialProduct ? 'Update Product' : 'Publish Product'}
            </button>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Main Form column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Section 1: Basic Information */}
            <section className="p-8 bg-[#f5f3f3] rounded-xl border border-[#c7c7bf] space-y-6">
              <div>
                <h2 className="text-xl font-medium text-[#020302] mb-1.5">Basic information</h2>
                <p className="text-sm text-[#5e5e5d]">Build buyer confidence with a clear, detailed product listing.</p>
              </div>
              
              <div className="space-y-6">
                
                {/* Product Name Input with Suggestions Popover */}
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-[#020302] uppercase tracking-widest">Name</label>
                    <span className="text-[11px] font-bold text-[#5e5e5d]">{(formData.name || searchQuery).length}/60</span>
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                      const brand = BRANDS.find(b => new RegExp(b, 'i').test(e.target.value)) || 'Smartphones';
                      setFormData({ ...formData, name: e.target.value, brand });
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="e.g. Aura Ultra Phone X"
                    className="w-full bg-white border border-[#c7c7bf] focus:border-[#020302] focus:ring-0 px-4 py-3 text-sm font-medium rounded-lg transition-all outline-none"
                  />
                  
                  {/* Luxury suggestions dropdown */}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && searchQuery && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#c7c7bf] shadow-xl z-55 overflow-hidden rounded-xl"
                      >
                        {suggestions.map((m, i) => (
                          <div 
                            key={i} 
                            onClick={() => handleSelectModel(m)}
                            className="p-4 hover:bg-[#f5f3f3] flex items-center justify-between cursor-pointer border-b border-[#c7c7bf]/30 last:border-none transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <Smartphone size={16} className="text-[#5e5e5d] group-hover:text-[#020302] transition-colors" />
                              <span className="text-sm font-medium text-[#020302]">{m.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-[#020302] uppercase tracking-widest bg-[#efeded] px-2 py-0.5 rounded">{m.brand}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-[#020302] uppercase tracking-widest">Description</label>
                    <span className="text-[11px] font-bold text-[#5e5e5d]">{formData.description.length}/3000</span>
                  </div>
                  <textarea 
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the craftsmanship, materials, and unique flagship features..."
                    className="w-full bg-white border border-[#c7c7bf] focus:border-[#020302] focus:ring-0 px-4 py-3 text-sm font-medium rounded-lg transition-all outline-none resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Images Upload & Guidelines */}
            <section className="p-8 bg-[#f5f3f3] rounded-xl border border-[#c7c7bf] space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-medium text-[#020302] mb-1.5">Images</h2>
                  <p className="text-sm text-[#5e5e5d]">Ensure your images have a neutral backdrop.</p>
                </div>
                <div className="flex gap-4">
                  <a href="#" className="text-xs font-bold text-[#020302] underline underline-offset-4 hover:opacity-70 uppercase tracking-wider">Review guidelines</a>
                  <a href="#" className="text-xs font-bold text-[#020302] underline underline-offset-4 hover:opacity-70 uppercase tracking-wider">Edit images</a>
                </div>
              </div>

              {/* Drag and Drop Container */}
              <div className="border-2 border-dashed border-[#c7c7bf] rounded-xl p-12 flex flex-col items-center justify-center bg-white/40 hover:bg-white transition-colors cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-[#efeded] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Plus size={24} className="text-[#020302]" />
                </div>
                <p className="text-sm font-semibold text-[#020302] mb-1 text-center">Drag and drop, paste, or browse to upload images</p>
                <p className="text-xs text-[#5e5e5d] text-center">Supports JPG, PNG, and WebP (up to 10MB)</p>
              </div>

              {/* URL image paste box */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#020302] uppercase tracking-widest">Image Source Link (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Paste direct URL to mock image..." 
                  className="w-full bg-white border border-[#c7c7bf] focus:border-[#020302] px-4 py-2.5 rounded-lg text-xs"
                />
              </div>
            </section>

            {/* Section 3: Product Options / Variants */}
            <section className="p-8 bg-[#f5f3f3] rounded-xl border border-[#c7c7bf] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium text-[#020302] mb-1.5">Product options *</h2>
                  <p className="text-sm text-[#5e5e5d]">Manage any variations of this product—like sizes, colors, or specifications.</p>
                </div>
                {formData.variants.length > 0 && (
                  <button 
                    onClick={() => setIsVariantModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#020302] hover:bg-[#868582] text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <Plus size={14} className="stroke-[2.5]" />
                    <span>Add Variants</span>
                  </button>
                )}
              </div>

              {formData.variants.length === 0 ? (
                /* Empty state */
                <div className="bg-white rounded-lg border border-[#c7c7bf] p-12 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f5f3f3] mb-4 text-[#5e5e5d]">
                    <Layers size={20} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#020302] mb-1 font-medium">No variants created yet</h3>
                  <p className="text-xs text-[#5e5e5d] max-w-sm mx-auto mb-8 leading-relaxed">
                    Add options like color swatches, RAM, and storage presets to generate variants for this smartphone.
                  </p>
                  <button 
                    onClick={() => setIsVariantModalOpen(true)}
                    className="px-8 h-[48px] bg-[#020302] text-white hover:bg-[#868582] transition-colors text-xs font-bold tracking-widest uppercase cursor-pointer"
                  >
                    Add Variants
                  </button>
                </div>
              ) : (
                /* Interactive Variants Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.variants.map((v) => (
                    <div 
                      key={v.id}
                      className="bg-white border border-[#c7c7bf] p-5 rounded-xl flex gap-4 items-start relative hover:shadow-lg transition-all"
                    >
                      {/* Image Selector Block */}
                      <div className="relative shrink-0">
                        <div 
                          onClick={() => setActiveImagePickerId(activeImagePickerId === v.id ? null : v.id)}
                          className="w-16 h-16 bg-[#fbf9f9] border border-[#c7c7bf] flex flex-col items-center justify-center cursor-pointer hover:bg-[#efeded] hover:border-[#020302] transition-all overflow-hidden rounded-lg relative"
                        >
                          {v.image ? (
                            <img src={v.image} alt={v.color} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <Camera size={16} className="text-[#5e5e5d]" />
                              <span className="text-[8px] font-bold text-[#5e5e5d] mt-1 uppercase tracking-wider text-center">Add Photo</span>
                            </>
                          )}
                        </div>

                        {/* Image picker popover overlay */}
                        <AnimatePresence>
                          {activeImagePickerId === v.id && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute left-0 mt-2 p-4 bg-white border border-[#c7c7bf] shadow-xl z-55 w-64 rounded-xl text-left"
                            >
                              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#c7c7bf]/20">
                                <span className="text-xs font-bold text-[#020302]">Select Variant Photo</span>
                                <button onClick={() => setActiveImagePickerId(null)} className="text-[#5e5e5d] hover:text-[#020302]">
                                  <X size={14} />
                                </button>
                              </div>

                              {/* Presets */}
                              <div className="mb-4">
                                <p className="text-[9px] font-bold text-[#5e5e5d] uppercase tracking-wider mb-2">Preset Mocks</p>
                                <div className="flex gap-2">
                                  {PRESET_MOCK_IMAGES.map((preset, idx) => (
                                    <button 
                                      key={idx}
                                      onClick={() => {
                                        updateVariant(v.id, 'image', preset.url);
                                        setActiveImagePickerId(null);
                                      }}
                                      className="w-10 h-10 rounded border border-[#c7c7bf]/40 overflow-hidden hover:border-[#020302] bg-[#fbf9f9] cursor-pointer"
                                    >
                                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Custom URL */}
                              <div>
                                <p className="text-[9px] font-bold text-[#5e5e5d] uppercase tracking-wider mb-2">Custom Image URL</p>
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Paste URL..." 
                                    value={customImageUrl}
                                    onChange={(e) => setCustomImageUrl(e.target.value)}
                                    className="flex-1 px-2.5 py-1.5 bg-[#fbf9f9] border border-[#c7c7bf] rounded text-xs outline-none focus:border-[#020302]"
                                  />
                                  <button 
                                    onClick={() => {
                                      if (customImageUrl.trim()) {
                                        updateVariant(v.id, 'image', customImageUrl.trim());
                                        setCustomImageUrl('');
                                      }
                                      setActiveImagePickerId(null);
                                    }}
                                    className="px-3 py-1.5 bg-[#020302] hover:bg-[#868582] text-white text-[10px] font-bold rounded cursor-pointer"
                                  >
                                    Set
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Info & Inputs Column */}
                      <div className="flex-1 min-w-0">
                        {/* Swatch & Title & Delete */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span 
                              className="w-4 h-4 rounded-full border border-[#c7c7bf] shrink-0"
                              style={{ backgroundColor: getColorHex(v.color) }}
                            />
                            <div className="truncate">
                              <h4 className="text-sm font-semibold text-[#020302] truncate">{v.color}</h4>
                              <p className="text-xs text-[#5e5e5d] tracking-wide mt-0.5">{v.ram} RAM / {v.storage} ROM</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeVariant(v.id)}
                            className="text-[#5e5e5d] hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Interactive Pricing inputs */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div>
                            <label className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-wider block mb-1">Buying (Tk)</label>
                            <input 
                              type="number" 
                              placeholder="0"
                              value={v.buyingPrice || ''}
                              onChange={(e) => updateVariant(v.id, 'buyingPrice', parseFloat(e.target.value) || 0)}
                              className="w-full bg-[#fbf9f9] border border-[#c7c7bf] focus:border-[#020302] px-3 py-2 rounded-lg text-xs font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-wider block mb-1">Selling (Tk)</label>
                            <input 
                              type="number" 
                              placeholder="0"
                              value={v.sellingPrice || ''}
                              onChange={(e) => updateVariant(v.id, 'sellingPrice', parseFloat(e.target.value) || 0)}
                              className="w-full bg-[#fbf9f9] border border-[#c7c7bf] focus:border-[#020302] px-3 py-2 rounded-lg text-xs font-semibold outline-none"
                            />
                          </div>
                        </div>

                        {/* Stock Input */}
                        <div className="mt-3">
                          <label className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-wider block mb-1">Initial Stock</label>
                          <input 
                            type="number" 
                            placeholder="10"
                            value={v.quantity}
                            onChange={(e) => updateVariant(v.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full bg-[#fbf9f9] border border-[#c7c7bf] focus:border-[#020302] px-3 py-2 rounded-lg text-xs font-semibold outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Right Sidebar column */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Status Card */}
            <div className="p-8 bg-[#f5f3f3] rounded-xl border border-[#c7c7bf] space-y-6">
              <h3 className="text-xs font-bold text-[#020302] uppercase tracking-widest">Product Status</h3>
              <div className="space-y-4">
                <div className="relative">
                  <select 
                    value={productStatus}
                    onChange={(e) => setProductStatus(e.target.value)}
                    className="w-full bg-white border border-[#c7c7bf] focus:border-[#020302] focus:ring-0 px-4 py-3.5 text-sm font-semibold rounded-lg outline-none cursor-pointer"
                  >
                    <option value="Draft">🔴 Draft</option>
                    <option value="Published">🟢 Published</option>
                  </select>
                </div>
                <p className="text-xs text-[#5e5e5d] leading-relaxed">
                  Draft products are hidden from search and checkout flows until published live.
                </p>
              </div>
            </div>

            {/* Category / Tags Organization Card */}
            <div className="p-8 bg-[#f5f3f3] rounded-xl border border-[#c7c7bf] space-y-6">
              <h3 className="text-xs font-bold text-[#020302] uppercase tracking-widest">Organization</h3>
              
              <div className="space-y-4">
                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#020302]">Category</label>
                  <select 
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-white border border-[#c7c7bf] focus:border-[#020302] focus:ring-0 px-4 py-3 text-sm rounded-lg cursor-pointer"
                  >
                    <option value="Smartphones">Smartphones</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Audio">Audio</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                {/* Tags Management */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#020302]">Tags</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add keywords..." 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 bg-white border border-[#c7c7bf] focus:border-[#020302] px-4 py-2.5 text-xs rounded-lg outline-none"
                    />
                    <button 
                      onClick={addTag}
                      className="px-3 bg-[#020302] text-white hover:bg-[#868582] text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {tagsList.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-[#efeded] border border-[#c7c7bf]/30 rounded-full text-xs font-semibold text-[#020302] flex items-center gap-1.5"
                      >
                        <span>{tag}</span>
                        <button onClick={() => removeTag(tag)} className="text-[#5e5e5d] hover:text-[#020302] cursor-pointer">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic SEO Realtime Preview Card */}
            <div className="p-8 bg-[#f5f3f3] rounded-xl border border-[#c7c7bf] space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-[#020302] uppercase tracking-widest">SEO Preview</h3>
                <span className="text-[10px] font-bold text-[#5e5e5d] uppercase flex items-center gap-1"><Globe size={11} /> Live</span>
              </div>
              <div className="space-y-2 bg-white p-4 border border-[#c7c7bf]/30 rounded-lg">
                <p className="text-[#1a0dab] text-sm font-semibold leading-tight font-medium hover:underline cursor-pointer truncate">
                  {searchQuery || "Product Name"} | LUMINA Marketplace
                </p>
                <p className="text-[#006621] text-xs font-normal">
                  https://lumina.com/products/{(searchQuery || "new-product").toLowerCase().replace(/\s+/g, '-')}
                </p>
                <p className="text-[#5e5e5d] text-xs leading-relaxed line-clamp-2">
                  {formData.description || "The description of your product will appear here in search engine results once you publish it..."}
                </p>
              </div>
            </div>

            {/* Low stock alert alert threshold setting */}
            <div className="p-8 bg-[#f5f3f3] rounded-xl border border-[#c7c7bf] space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-[#5e5e5d]" />
                <h3 className="text-xs font-bold text-[#020302] uppercase tracking-widest">Stock Alert</h3>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#5e5e5d] block">Notify at or below units:</label>
                <input 
                  type="number" 
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-[#c7c7bf] focus:border-[#020302] px-4 py-3 rounded-lg text-sm font-semibold"
                />
                <p className="text-[10px] text-[#5e5e5d] italic">Ensure system prompts you inside sidebar filters.</p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ==================== ADD PRODUCT VARIANTS MODAL OVERLAY ==================== */}
      <AnimatePresence>
        {isVariantModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-[#020302]/40 backdrop-blur-sm">
            {/* Backdrop Close Click */}
            <div className="absolute inset-0" onClick={() => setIsVariantModalOpen(false)} />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-2xl max-h-[921px] z-[260] overflow-hidden rounded-xl shadow-2xl flex flex-col border border-[#c7c7bf]"
            >
              {/* Modal Header */}
              <header className="p-8 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold text-[#020302]">Add Product Variants</h2>
                  <button 
                    onClick={() => setIsVariantModalOpen(false)}
                    className="text-[#5e5e5d] hover:text-[#020302] transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm text-[#5e5e5d]">Select colors and memory sizes to cross-generate</p>
              </header>

              {/* Modal Body (Scrollable) */}
              <div className="p-8 pt-4 overflow-y-auto no-scrollbar space-y-8 flex-1 max-h-[550px]">
                
                {/* Step 1: Color Selection */}
                <section className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="text-xs font-bold text-[#020302] uppercase tracking-widest">Select Color</h3>
                    <span className="text-xs text-[#5e5e5d] italic">Select 1 at max</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Render presets */}
                    {COLORS.map(color => {
                      const isSelected = selectedModalColor === color;
                      return (
                        <div 
                          key={color}
                          onClick={() => setSelectedModalColor(isSelected ? null : color)}
                          className={`p-3 border flex flex-col items-center gap-2 cursor-pointer transition-all rounded-lg
                            ${isSelected 
                              ? 'border-[#020302] bg-[#f5f3f3] ring-2 ring-[#020302] ring-offset-2' 
                              : 'border-[#c7c7bf] hover:border-[#5e5e5d] bg-white'}`}
                        >
                          <span 
                            className="w-8 h-8 rounded-full border border-[#c7c7bf]"
                            style={{ backgroundColor: getColorHex(color) }}
                          />
                          <span className={`text-xs font-medium ${isSelected ? 'text-[#020302]' : 'text-[#5e5e5d]'}`}>
                            {color}
                          </span>
                        </div>
                      );
                    })}

                    {/* CustomAdded Colors list */}
                    {customColorsList.map(color => {
                      const isSelected = selectedModalColor === color;
                      return (
                        <div 
                          key={color}
                          onClick={() => setSelectedModalColor(isSelected ? null : color)}
                          className={`p-3 border flex flex-col items-center gap-2 cursor-pointer transition-all rounded-lg
                            ${isSelected 
                              ? 'border-[#020302] bg-[#f5f3f3] ring-2 ring-[#020302] ring-offset-2' 
                              : 'border-[#c7c7bf] hover:border-[#5e5e5d] bg-white'}`}
                        >
                          <span 
                            className="w-8 h-8 rounded-full border border-[#c7c7bf]"
                            style={{ backgroundColor: getColorHex(color) }}
                          />
                          <span className="text-xs font-medium text-[#020302]">{color}</span>
                        </div>
                      );
                    })}

                    {/* Custom Color Creator Input Swatch */}
                    {showCustomColorInput ? (
                      <div className="border border-[#c7c7bf] p-3 flex flex-col items-center justify-center gap-2 bg-white rounded-lg">
                        <input 
                          type="text" 
                          placeholder="Titanium Gold..." 
                          value={customColorName}
                          onChange={(e) => setCustomColorName(e.target.value)}
                          className="w-full text-xs text-center border-b border-[#c7c7bf] outline-none"
                          onKeyDown={(e) => e.key === 'Enter' && addCustomColor()}
                          autoFocus
                        />
                        <button 
                          onClick={addCustomColor}
                          className="text-[10px] font-bold uppercase text-[#020302] hover:opacity-75"
                        >
                          Confirm
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setShowCustomColorInput(true)}
                        className="border border-dashed border-[#c7c7bf] hover:border-[#5e5e5d] p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-white rounded-lg group"
                      >
                        <div className="w-8 h-8 rounded-full border border-dashed border-[#c7c7bf] flex items-center justify-center text-[#5e5e5d] group-hover:text-[#020302]">
                          <Plus size={14} />
                        </div>
                        <span className="text-xs text-[#5e5e5d]">Custom Color</span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Step 2: Memory Sizes Selection */}
                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-[#020302] uppercase tracking-widest">Select Memory Sizes</h3>
                  
                  {/* Option Tabs */}
                  <div className="flex border-b border-[#c7c7bf]">
                    <button 
                      onClick={() => setVariantSelectionMethod('combo')}
                      className={`px-6 py-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer
                        ${variantSelectionMethod === 'combo' ? 'border-[#020302] text-[#020302]' : 'border-transparent text-[#5e5e5d] hover:text-[#020302]'}`}
                    >
                      Combo Selection (RAM + ROM)
                    </button>
                    <button 
                      onClick={() => setVariantSelectionMethod('individual')}
                      className={`px-6 py-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer
                        ${variantSelectionMethod === 'individual' ? 'border-[#020302] text-[#020302]' : 'border-transparent text-[#5e5e5d] hover:text-[#020302]'}`}
                    >
                      Individual
                    </button>
                  </div>

                  {/* Combo Grid */}
                  {variantSelectionMethod === 'combo' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { ram: '6GB', storage: '128GB' },
                        { ram: '8GB', storage: '128GB' },
                        { ram: '8GB', storage: '256GB' },
                        { ram: '12GB', storage: '256GB' },
                        { ram: '12GB', storage: '512GB' },
                        { ram: '16GB', storage: '512GB' },
                      ].map((combo, idx) => {
                        const isSelected = selectedCombos.some(c => c.ram === combo.ram && c.storage === combo.storage);
                        return (
                          <div 
                            key={idx}
                            onClick={() => toggleComboSelection(combo)}
                            className={`relative flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors
                              ${isSelected 
                                ? 'border-[#020302] bg-[#f5f3f3] font-bold' 
                                : 'border-[#c7c7bf] bg-white hover:border-[#5e5e5d]'}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                isSelected ? 'border-[#020302] bg-[#020302] text-white' : 'border-[#c7c7bf]'
                              }`}>
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </span>
                              <span className={`text-sm font-semibold ${isSelected ? 'text-[#020302]' : 'text-[#5e5e5d]'}`}>
                                {combo.ram} + {combo.storage}
                              </span>
                            </div>
                            <span className="bg-[#efeded] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#5e5e5d] border border-[#c7c7bf]/30 font-bold rounded">
                              Preset
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Individual RAM/ROM Selections */
                    <div className="space-y-6 pt-2">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-wider block">Select RAM</span>
                        <div className="flex flex-wrap gap-2">
                          {RAM_OPTIONS.map(ram => {
                            const isSelected = selectedRams.includes(ram);
                            return (
                              <button 
                                key={ram}
                                onClick={() => toggleSelection(ram, selectedRams, setSelectedRams)}
                                className={`px-4 py-2 border text-xs font-bold transition-all rounded-lg cursor-pointer
                                  ${isSelected 
                                    ? 'bg-[#020302] border-[#020302] text-white' 
                                    : 'bg-white border-[#c7c7bf] hover:border-[#5e5e5d] text-[#5e5e5d]'}`}
                              >
                                {ram}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-[#5e5e5d] uppercase tracking-wider block">Select Storage</span>
                        <div className="flex flex-wrap gap-2">
                          {STORAGE_OPTIONS.map(storage => {
                            const isSelected = selectedStorages.includes(storage);
                            return (
                              <button 
                                key={storage}
                                onClick={() => toggleSelection(storage, selectedStorages, setSelectedStorages)}
                                className={`px-4 py-2 border text-xs font-bold transition-all rounded-lg cursor-pointer
                                  ${isSelected 
                                    ? 'bg-[#020302] border-[#020302] text-white' 
                                    : 'bg-white border-[#c7c7bf] hover:border-[#5e5e5d] text-[#5e5e5d]'}`}
                              >
                                {storage}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                </section>
              </div>

              {/* Modal Footer */}
              <footer className="p-8 pt-6 border-t border-[#c7c7bf] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#020302] flex items-center gap-1.5">
                    Selected: <span className="font-bold">
                      {selectedModalColor ? (
                        variantSelectionMethod === 'combo' 
                          ? selectedCombos.length 
                          : (selectedRams.length * selectedStorages.length)
                      ) : 0} variants
                    </span> to create
                  </span>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      setSelectedModalColor(null);
                      setSelectedCombos([]);
                      setSelectedRams([]);
                      setSelectedStorages([]);
                      setIsVariantModalOpen(false);
                    }}
                    className="flex-1 sm:flex-none h-12 px-8 border border-[#020302] text-[#020302] font-bold text-xs bg-white hover:bg-[#f5f3f3] uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={generateVariants}
                    disabled={
                      !selectedModalColor || (
                        variantSelectionMethod === 'combo' 
                          ? selectedCombos.length === 0 
                          : (selectedRams.length === 0 || selectedStorages.length === 0)
                      )
                    }
                    className="flex-1 sm:flex-none h-12 px-8 bg-[#020302] hover:bg-[#868582] text-white font-bold text-xs uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Create Variants
                  </button>
                </div>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
