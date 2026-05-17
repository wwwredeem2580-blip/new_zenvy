"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  Smartphone, 
  Camera,
  Plus,
  Trash2,
  X
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
  if (name.includes('black') || name.includes('dark')) return '#1a1c1d';
  if (name.includes('white') || name.includes('milk')) return '#ffffff';
  if (name.includes('blue') || name.includes('ocean')) return '#3b82f6';
  if (name.includes('green') || name.includes('emerald')) return '#22c55e';
  if (name.includes('gold') || name.includes('sunset')) return '#eab308';
  if (name.includes('gray') || name.includes('grey') || name.includes('silver') || name.includes('titanium')) return '#cbd5e1';
  if (name.includes('purple') || name.includes('lavender')) return '#a855f7';
  if (name.includes('red')) return '#ef4444';
  if (name.includes('orange')) return '#f97316';
  if (name.includes('pink')) return '#ec4899';
  return '#737373';
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
    brand: initialProduct?.brand || '',
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
          sku: '',
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
            sku: '',
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

  const handleSubmit = () => {
    onSuccess({
      id: initialProduct?.id || Date.now(),
      name: formData.name || searchQuery,
      brand: formData.brand || 'Generic',
      stock: formData.variants.reduce((sum, v) => sum + v.quantity, 0),
      status: initialProduct?.status || 'Published',
      image: formData.variants[0]?.image || initialProduct?.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format',
      lowStockThreshold: formData.lowStockThreshold,
      variants: formData.variants,
      description: formData.description,
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

  const navItems = [
    'Basic information',
    'Images and videos',
    'Product options',
    'Product details',
    'Inventory',
    'Pricing and taxes',
    'Shipping',
    'Product Organization',
    'Product settings'
  ];

  return (
    <div className="flex-1 bg-[#f1f2f4] overflow-y-auto relative h-full flex flex-col">
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-[60] border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 flex items-center gap-1.5 transition-colors">
            <ChevronRight size={16} className="rotate-180" />
            <span className="text-xs font-medium">Products</span>
          </button>
          <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
          <h1 className="text-sm font-sans font-bold text-[#1a1c1d]">New product</h1>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={handleSubmit}
            disabled={!formData.name && !searchQuery}
            className="bg-[#1a1c1d] text-white px-4 py-2 rounded-sm font-bold text-[12px] hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-black/10"
          >
            Publish product
          </button>
        </div>
      </header>

      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-5xl flex gap-12">
          <div className="flex-1 space-y-6 pb-20">
            <section id="basic-information" className="bg-white overflow-hidden">
              <div className="p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-sans font-medium text-[#1a1c1d] mb-1">Basic information</h2>
                  <p className="text-[13px] text-gray-500 font-light">Build buyer confidence with a clear, detailed product listing.</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="text-[12px] font-bold text-gray-600">Name</label>
                       <span className="text-[10px] font-bold text-gray-400">{formData.name.length}/60</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowSuggestions(true);
                          const brand = BRANDS.find(b => new RegExp(b, 'i').test(e.target.value)) || '';
                          setFormData({ ...formData, name: e.target.value, brand });
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Make your name concise and searchable"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-[14px] font-medium outline-none focus:ring-2 focus:ring-[#5438ff]/10 focus:border-[#5438ff]/40 transition-all"
                      />
                      <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && searchQuery && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 pt-4 right-0 top-full mt-1 border  bg-white shadow-xl border-b border-gray-200 overflow-hidden z-[70]"
                          >
                            {suggestions.map((m, i) => (
                              <div 
                                key={i} 
                                onClick={() => handleSelectModel(m)}
                                className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer border-b border-gray-100 last:border-none group"
                              >
                                <div className="flex items-center gap-3">
                                  <Smartphone size={16} className="text-gray-400" />
                                  <span className="text-[13px] font-medium text-[#1a1c1d]">{m.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-[#5438ff] uppercase tracking-wider">{m.brand}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                     <div className="flex justify-between items-center mb-2">
                       <label className="text-[12px] font-bold text-gray-600">Description</label>
                       <span className="text-[10px] font-bold text-gray-400">{formData.description.length}/3000</span>
                    </div>
                    <textarea 
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell buyers the materials and details that make this product stand out"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-[14px] font-medium outline-none focus:ring-2 focus:ring-[#5438ff]/10 focus:border-[#5438ff]/40 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section id="images-and-videos" className="bg-white overflow-hidden">
               <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-sans font-medium text-[#1a1c1d] mb-1">Images</h2>
                    <p className="text-[12px] text-gray-500 font-light max-w-lg leading-relaxed">
                      Ensure your images have a neutral background.
                      <span className="ml-1 text-[#5438ff] underline cursor-pointer">Review guidelines</span>
                    </p>
                  </div>
                  <button className="text-[12px] ml-4 font-medium text-[#5438ff] hover:underline">Edit images</button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                   <div className="aspect-square bg-[#f6f6f7] rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gray-300 transition-all">
                      <Camera size={20} className="text-gray-400" />
                      <span className="text-[11px] font-bold text-gray-400">Add</span>
                   </div>
                   {[...Array(2)].map((_, i) => (
                     <div key={i} className="aspect-square bg-[#fcfcfc] rounded-lg border border-gray-100 flex items-center justify-center">
                        <Camera size={18} className="text-gray-200" />
                     </div>
                   ))}
                </div>

                <div className="space-y-4">
                  <p className="text-[12px] font-medium text-gray-500">Drag and drop, paste, or browse to upload images</p>
                  <input 
                    type="text" 
                    placeholder="Press Ctrl+V to paste an image or image URL"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-400 outline-none"
                  />
                </div>
               </div>
            </section>

            <section id="product-options" className="bg-white overflow-hidden relative">
               <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-sans font-medium text-[#1a1c1d] mb-1">Product options *</h2>
                      <p className="text-[13px] text-gray-500 font-light">Manage any variations of this product—like sizes, colors, or specifications.</p>
                    </div>
                    {formData.variants.length > 0 && (
                      <button 
                        onClick={() => setIsVariantModalOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1c1d] hover:bg-black text-white rounded text-xs font-bold transition-all shadow-md shadow-black/5"
                      >
                        <Plus size={14} className="stroke-[2.5]" />
                        <span>Add Variants</span>
                      </button>
                    )}
                  </div>

                  {formData.variants.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-400">
                        <Plus size={20} />
                      </div>
                      <h3 className="text-sm font-bold text-[#1a1c1d] mb-1">No variants created yet</h3>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6 leading-relaxed">
                        Add options like color swatches, RAM, and storage presets to generate variants for this smartphone.
                      </p>
                      <button 
                        onClick={() => setIsVariantModalOpen(true)}
                        className="px-6 py-2.5 bg-[#1a1c1d] hover:bg-black text-white rounded text-xs font-bold transition-all shadow-md shadow-black/5"
                      >
                        Add Variants
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.variants.map((v) => (
                        <div 
                          key={v.id} 
                          className="bg-white border border-gray-300 p-4 md:p-5 flex gap-4 items-start relative hover:shadow-[0_6px_24px_rgba(0,0,0,0.02)] transition-all group"
                        >
                          {/* Variant Photo Picker */}
                          <div className="relative flex-shrink-0">
                            <div 
                              onClick={() => setActiveImagePickerId(activeImagePickerId === v.id ? null : v.id)}
                              className="w-16 h-16 bg-gray-50 border border-gray-400 flex flex-col items-center justify-center cursor-pointer group/img hover:bg-gray-100 hover:border-gray-300 transition-all overflow-hidden relative"
                            >
                              {v.image ? (
                                <img src={v.image} alt={v.color} className="w-full h-full object-cover" />
                              ) : (
                                <>
                                  <Camera size={18} className="text-gray-400 group-hover/img:text-gray-650 transition-colors" />
                                  <span className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-wider text-center">Add Photo</span>
                                </>
                              )}
                            </div>

                            {/* Tactile Popover Image Picker */}
                            <AnimatePresence>
                              {activeImagePickerId === v.id && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 5 }}
                                  className="absolute left-0 mt-2 p-3 bg-white border border-gray-300 shadow-xl z-[90] w-64 text-left"
                                >
                                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-100">
                                    <span className="text-[11px] font-bold text-neutral-600">Select Variant Photo</span>
                                    <button onClick={() => setActiveImagePickerId(null)} className="text-gray-400 hover:text-neutral-900">
                                      <X size={12} />
                                    </button>
                                  </div>

                                  <div className="mb-3">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Preset Mocks</p>
                                    <div className="flex gap-2">
                                      {PRESET_MOCK_IMAGES.map((preset, idx) => (
                                        <button
                                          key={idx}
                                          onClick={() => {
                                            updateVariant(v.id, 'image', preset.url);
                                            setActiveImagePickerId(null);
                                          }}
                                          className="w-10 h-10 rounded border border-gray-100 overflow-hidden hover:border-neutral-900 transition-all bg-[#fcfcfc]"
                                          title={preset.label}
                                        >
                                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Custom Image URL</p>
                                    <div className="flex gap-1.5">
                                      <input 
                                        type="text" 
                                        placeholder="Paste https://..." 
                                        value={customImageUrl}
                                        onChange={(e) => setCustomImageUrl(e.target.value)}
                                        className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded text-[11px] outline-none"
                                      />
                                      <button
                                        onClick={() => {
                                          if (customImageUrl.trim()) {
                                            updateVariant(v.id, 'image', customImageUrl.trim());
                                            setCustomImageUrl('');
                                          }
                                          setActiveImagePickerId(null);
                                        }}
                                        className="px-2.5 py-1.5 bg-neutral-950 hover:bg-black text-white text-[10px] font-bold rounded"
                                      >
                                        Set
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Details Column */}
                          <div className="flex-1 min-w-0">
                            {/* 1st Line: Variant Swatch + Name & Delete Action */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span 
                                  className="w-4 h-4 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: getColorHex(v.color) }}
                                  title={v.color}
                                />
                                <div className="truncate">
                                  <h4 className="text-[13px] font-normal text-gray-900 leading-snug truncate">{v.color}</h4>
                                  <p className="text-[11px] text-gray-500 font-medium tracking-wider mt-0.5">{v.ram} RAM / {v.storage} ROM</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => removeVariant(v.id)}
                                className="text-gray-400 hover:text-red-650 p-1.5 rounded hover:bg-red-50 transition-all flex-shrink-0"
                                title="Delete Variant"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            {/* 2nd Line: Buying Price */}
                            <div className="mt-3">
                              <label className="block text-[13px] font-medium text-gray-500  mb-1">Buying Price</label>
                              <input 
                                type="text" 
                                placeholder="e.g. 15000"
                                value={v.buyingPrice || ''}
                                onChange={(e) => updateVariant(v.id, 'buyingPrice', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#f6f6f7] border border-gray-100 rounded-md text-xs font-semibold outline-none focus:ring-1 focus:ring-gray-200"
                              />
                            </div>
                            <div className="mt-3">
                              <label className="block text-[13px] font-medium text-gray-500  mb-1">Selling Price</label>
                              <input 
                                type="text" 
                                placeholder="e.g. 20000"
                                value={v.sellingPrice || ''}
                                onChange={(e) => updateVariant(v.id, 'sellingPrice', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#f6f6f7] border border-gray-100 rounded-md text-xs font-semibold outline-none focus:ring-1 focus:ring-gray-200"
                              />
                            </div>
                            <div className="mt-3">
                              <label className="block text-[13px] font-medium text-gray-500  mb-1">Stock</label>
                              <input 
                                type="text" 
                                placeholder="e.g. 10"
                                value={v.quantity || ''}
                                onChange={(e) => updateVariant(v.id, 'quantity', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#f6f6f7] border border-gray-100 rounded-md text-xs font-semibold outline-none focus:ring-1 focus:ring-gray-200"
                              />
                            </div>

                            {/* 3rd Line: Pricing & Stock Grid */}
                            {/* <div className="grid grid-cols-3 gap-2 mt-3">
                              <div>
                                <label className="block text-[9px] font-black text-gray-450 uppercase tracking-widest mb-1 truncate">Wholesale</label>
                                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-[#f6f6f7] rounded-lg">
                                  <span className="text-[10px] font-bold text-gray-400">৳</span>
                                  <input 
                                    type="number" 
                                    placeholder="0"
                                    value={v.buyingPrice || ''}
                                    onChange={(e) => updateVariant(v.id, 'buyingPrice', parseInt(e.target.value) || 0)}
                                    className="w-full bg-transparent text-xs font-bold outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[9px] font-black text-gray-455 uppercase tracking-widest mb-1 truncate">Retail</label>
                                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-[#f6f6f7] rounded-lg">
                                  <span className="text-[10px] font-bold text-gray-400">৳</span>
                                  <input 
                                    type="number" 
                                    placeholder="0"
                                    value={v.sellingPrice || ''}
                                    onChange={(e) => updateVariant(v.id, 'sellingPrice', parseInt(e.target.value) || 0)}
                                    className="w-full bg-transparent text-xs font-bold outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[9px] font-black text-gray-455 uppercase tracking-widest mb-1 truncate text-center">Stock</label>
                                <input 
                                  type="number" 
                                  placeholder="0"
                                  value={v.quantity}
                                  onChange={(e) => updateVariant(v.id, 'quantity', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1.5 bg-[#f6f6f7] rounded-lg text-xs font-bold outline-none text-center"
                                />
                              </div>
                            </div> */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
               </div>

               {/* ==================== CREATE VARIANT MODAL ==================== */}
               <AnimatePresence>
                 {isVariantModalOpen && (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm"
                   >
                     <motion.div 
                       initial={{ scale: 0.95, y: 15 }}
                       animate={{ scale: 1, y: 0 }}
                       exit={{ scale: 0.95, y: 15 }}
                       className="bg-white w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                     >
                       {/* Modal Header */}
                       <div className="px-6 py-4 border-b-2 border-gray-300 flex items-center justify-between bg-gray-50/50">
                         <div>
                           <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wider">Add Product Variants</h3>
                           <p className="text-[11px] text-gray-800 mt-0.5 font-light">Select colors and memory sizes to cross-generate</p>
                         </div>
                         <button 
                           onClick={() => setIsVariantModalOpen(false)}
                           className="p-1.5 text-gray-400 hover:text-neutral-900 rounded-full hover:bg-gray-100 transition-colors"
                         >
                           <X size={16} />
                         </button>
                       </div>

                       {/* Modal Body (Scrollable) */}
                       <div className="p-6 space-y-6 overflow-y-auto flex-1">
                         {/* Step 1: Color Visual Swatches */}
                         <div className="space-y-3">
                           <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-widest">Step 1: Select Color (Swatch - 1 at max)</label>
                           <div className="flex flex-wrap gap-2">
                             {/* Static Presets */}
                             {COLORS.map(color => {
                               const isSelected = selectedModalColor === color;
                               return (
                                 <button
                                   key={color}
                                   onClick={() => setSelectedModalColor(isSelected ? null : color)}
                                   className={`flex items-center gap-2 px-3 py-1.5 border border-gray-300 transition-all text-xs font-semibold
                                     ${isSelected 
                                       ? 'bg-neutral-900 text-white border-neutral-900' 
                                       : 'bg-gray-50 text-gray-500 border-gray-150 hover:bg-gray-100'}`}
                                 >
                                   <span 
                                     className="w-4.5 h-4.5 rounded-full border border-gray-300 flex-shrink-0"
                                     style={{ backgroundColor: getColorHex(color) }}
                                   />
                                   <span>{color}</span>
                                 </button>
                               );
                             })}

                             {/* Custom Added Colors */}
                             {customColorsList.map(color => {
                               const isSelected = selectedModalColor === color;
                               return (
                                 <button
                                   key={color}
                                   onClick={() => setSelectedModalColor(isSelected ? null : color)}
                                   className={`flex items-center gap-2 px-3 py-1.5 border border-gray-300 transition-all text-xs font-semibold
                                     ${isSelected 
                                       ? 'bg-neutral-900 text-white border-neutral-900' 
                                       : 'bg-gray-50 text-gray-500 border-gray-150 hover:bg-gray-100'}`}
                                 >
                                   <span 
                                     className="w-4.5 h-4.5 rounded-full border border-gray-350 flex-shrink-0"
                                     style={{ backgroundColor: getColorHex(color) }}
                                   />
                                   <span>{color}</span>
                                 </button>
                               );
                             })}

                             {/* Custom Color Creator Input */}
                             {showCustomColorInput ? (
                               <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-300 px-2.5 py-1">
                                 <input 
                                   type="text" 
                                   placeholder="e.g. Titanium Gold"
                                   value={customColorName}
                                   onChange={(e) => setCustomColorName(e.target.value)}
                                   className="text-xs bg-transparent outline-none w-28 font-medium"
                                   onKeyDown={(e) => e.key === 'Enter' && addCustomColor()}
                                   autoFocus
                                 />
                                 <button 
                                   onClick={addCustomColor}
                                   className="text-[10px] font-black uppercase text-primary-500 hover:text-primary-600"
                                 >
                                   Add
                                 </button>
                                 <button 
                                   onClick={() => setShowCustomColorInput(false)}
                                   className="text-gray-400 hover:text-gray-600"
                                 >
                                   <X size={12} />
                                 </button>
                               </div>
                             ) : (
                               <button
                                 onClick={() => setShowCustomColorInput(true)}
                                 className="flex items-center gap-1 px-3.5 py-1.5 bg-white border border-dashed border-gray-300 hover:border-gray-400 rounded-full text-xs text-gray-500 font-bold transition-all"
                               >
                                 <Plus size={12} />
                                 <span>Custom Color</span>
                               </button>
                             )}
                           </div>
                         </div>

                         {/* Step 2: Tabbed RAM/Storage Presets */}
                         <div className="space-y-4">
                           <label className="block text-[10px] font-medium text-gray-600 uppercase tracking-widest">Step 2: Select Memory Sizes</label>
                           
                           {/* Choice Tabs */}
                           <div className="flex border-b border-gray-300">
                             <button
                               onClick={() => setVariantSelectionMethod('combo')}
                               className={`flex-1 py-3 text-center text-xs font-medium tracking-wider uppercase border-b-2 transition-all
                                 ${variantSelectionMethod === 'combo' ? 'border-[#1a1c1d] text-neutral-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                             >
                               Combo Selection (RAM + ROM)
                             </button>
                             <button
                               onClick={() => setVariantSelectionMethod('individual')}
                               className={`flex-1 py-3 text-center text-xs font-bold tracking-wider uppercase border-b-2 transition-all
                                 ${variantSelectionMethod === 'individual' ? 'border-[#1a1c1d] text-neutral-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                             >
                               Individual
                             </button>
                           </div>

                           {variantSelectionMethod === 'combo' ? (
                             /* RAM+ROM Combos */
                             <div className="grid grid-cols-2 gap-2 pt-2">
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
                                   <button
                                     key={idx}
                                     onClick={() => toggleComboSelection(combo)}
                                     className={`p-3 border border-gray-300 flex items-center justify-between transition-all text-left
                                       ${isSelected 
                                         ? 'bg-neutral-900 border-neutral-900 text-white shadow-md' 
                                         : 'bg-gray-50 border-gray-300 hover:bg-gray-100 text-neutral-700'}`}
                                   >
                                     <span className="text-xs font-bold">{combo.ram} + {combo.storage}</span>
                                     <span className={`text-[9px] font-normal uppercase px-1.5 py-0.5 rounded ${
                                       isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-900'
                                     }`}>
                                       Preset
                                     </span>
                                   </button>
                                 );
                               })}
                             </div>
                           ) : (
                             /* Individual Selectors */
                             <div className="space-y-4 pt-2">
                               <div className="space-y-2">
                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Select RAM</span>
                                 <div className="flex flex-wrap gap-1.5">
                                   {RAM_OPTIONS.map(ram => {
                                     const isSelected = selectedRams.includes(ram);
                                     return (
                                       <button
                                         key={ram}
                                         onClick={() => toggleSelection(ram, selectedRams, setSelectedRams)}
                                         className={`px-3 py-1.5 border border-gray-300 text-xs font-bold transition-all
                                           ${isSelected 
                                             ? 'bg-neutral-900 border-neutral-900 text-white' 
                                             : 'bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-500'}`}
                                       >
                                         {ram}
                                       </button>
                                     );
                                   })}
                                 </div>
                                </div>

                                <div className="space-y-2">
                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Select Storage</span>
                                 <div className="flex flex-wrap gap-1.5">
                                   {STORAGE_OPTIONS.map(storage => {
                                     const isSelected = selectedStorages.includes(storage);
                                     return (
                                       <button
                                         key={storage}
                                         onClick={() => toggleSelection(storage, selectedStorages, setSelectedStorages)}
                                         className={`px-3 py-1.5 border border-gray-300 text-xs font-bold transition-all
                                           ${isSelected 
                                             ? 'bg-neutral-900 border-neutral-900 text-white' 
                                             : 'bg-gray-50 border-gray-300 hover:bg-gray-300 text-gray-500'}`}
                                       >
                                         {storage}
                                       </button>
                                     );
                                   })}
                                 </div>
                                </div>
                             </div>
                           )}
                         </div>
                       </div>

                       {/* Modal Footer */}
                       <div className="px-6 py-4 border-t-2 border-gray-300 flex items-center justify-between bg-gray-50/50">
                         {(() => {
                           const totalCount = selectedModalColor ? (
                             variantSelectionMethod === 'combo' 
                               ? selectedCombos.length 
                               : (selectedRams.length * selectedStorages.length)
                           ) : 0;
                           return (
                             <span className="text-xs font-medium text-gray-500">
                               Selected: <strong className="text-brand-500">{totalCount} variants</strong> to create
                             </span>
                           );
                         })()}
                         
                         <div className="flex gap-2">
                           <button 
                             onClick={() => setIsVariantModalOpen(false)}
                             className="px-4 py-2 border border-gray-200 text-gray-500 hover:text-neutral-900 rounded font-bold text-xs hover:bg-gray-50 transition-colors"
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
                             className="px-4 py-2 bg-brand-500 hover:bg-brand-700 text-white rounded font-bold text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                           >
                             Create Variants
                           </button>
                         </div>
                       </div>
                     </motion.div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </section>
          </div>

          <div className="w-64 hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <nav className="space-y-4">
                {navItems.map((item) => (
                  <button 
                    key={item}
                    onClick={() => setActiveSection(item)}
                    className={`block w-full text-left text-[13px] font-medium transition-all
                      ${activeSection === item ? 'text-[#1a1c1d] font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {item}
                  </button>
                ))}
              </nav>

              <div className="pt-8 border-t border-gray-200">
                 <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Stock Settings</h3>
                 <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-2">Low stock alert</label>
                      <input 
                        type="number" 
                        value={formData.lowStockThreshold}
                        onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })}
                        className="w-full bg-gray-50 px-3 py-2 rounded-lg text-sm font-bold border-none"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Get notified when stock is below this value.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
