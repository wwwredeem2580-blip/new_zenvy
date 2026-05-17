"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  Smartphone, 
  Camera
} from 'lucide-react';
import { PHONE_MODELS, BRANDS, COLORS, RAM_OPTIONS, STORAGE_OPTIONS } from '@/data/constants';
import { ProductVariant, ProductFormData } from '@/types/zenvy';

export default function NewProductScreen({ onBack, onSuccess }: { onBack: () => void, onSuccess: (product: any) => void }) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    brand: '',
    description: '',
    variants: [],
    lowStockThreshold: 2,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState('Basic information');

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  useEffect(() => {
    if (selectedColors.length > 0 && selectedRam.length > 0 && selectedStorage.length > 0) {
      const newVariants: ProductVariant[] = [];
      selectedColors.forEach(color => {
        selectedRam.forEach(ram => {
          selectedStorage.forEach(storage => {
            const existing = formData.variants.find(v => v.id === `${color}-${ram}-${storage}`);
            newVariants.push(existing || {
              id: `${color}-${ram}-${storage}`,
              color,
              ram,
              storage,
              quantity: 0,
              buyingPrice: 0,
              sellingPrice: 0,
            });
          });
        });
      });
      setFormData(prev => ({ ...prev, variants: newVariants }));
    } else {
      setFormData(prev => ({ ...prev, variants: [] }));
    }
  }, [selectedColors, selectedRam, selectedStorage]);

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === id ? { ...v, [field]: value } : v)
    }));
  };

  const handleSubmit = () => {
    onSuccess({
      id: Date.now(),
      name: formData.name || searchQuery,
      stock: formData.variants.reduce((sum, v) => sum + v.quantity, 0),
      status: 'Published',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format',
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
      <header className="bg-white px-8 py-3 flex items-center justify-between sticky top-0 z-[60] border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 flex items-center gap-1.5 transition-colors">
            <ChevronRight size={16} className="rotate-180" />
            <span className="text-xs font-bold">Products</span>
          </button>
          <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
          <h1 className="text-lg font-serif font-black text-[#1a1c1d]">New product</h1>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="text-[13px] font-bold text-gray-500 hover:text-[#1a1c1d] transition-colors underline underline-offset-4 decoration-gray-200">Save as draft</button>
          <button 
            onClick={handleSubmit}
            disabled={!formData.name && !searchQuery}
            className="bg-[#1a1c1d] text-white px-6 py-2.5 rounded-lg font-bold text-[13px] hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-black/10"
          >
            Publish product
          </button>
        </div>
      </header>

      <div className="flex-1 flex justify-center p-8">
        <div className="w-full max-w-5xl flex gap-12">
          <div className="flex-1 space-y-6 pb-20">
            <section id="basic-information" className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-serif font-black text-[#1a1c1d] mb-1">Basic information</h2>
                  <p className="text-[13px] text-gray-500 font-medium">Build buyer confidence with a clear, detailed product listing.</p>
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
                            className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[70]"
                          >
                            {suggestions.map((m, i) => (
                              <div 
                                key={i} 
                                onClick={() => handleSelectModel(m)}
                                className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer border-b border-gray-50 last:border-none group"
                              >
                                <div className="flex items-center gap-3">
                                  <Smartphone size={16} className="text-gray-400" />
                                  <span className="text-[14px] font-bold text-[#1a1c1d]">{m.name}</span>
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

            <section id="images-and-videos" className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
               <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-serif font-black text-[#1a1c1d] mb-1">Images</h2>
                    <p className="text-[12px] text-gray-500 font-medium max-w-lg leading-relaxed">
                      Ensure your images have a neutral background, are cropped to fill the square, and include all product options.
                      <span className="ml-1 text-[#5438ff] underline cursor-pointer">Review guidelines</span>
                    </p>
                  </div>
                  <button className="text-[12px] font-bold text-[#5438ff] hover:underline">Edit images</button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                   <div className="aspect-square bg-[#f6f6f7] rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gray-300 transition-all">
                      <Camera size={20} className="text-gray-400" />
                      <span className="text-[11px] font-bold text-gray-400">Add</span>
                   </div>
                   {[...Array(9)].map((_, i) => (
                     <div key={i} className="aspect-square bg-[#fcfcfc] rounded-lg border border-gray-100 flex items-center justify-center">
                        <Camera size={18} className="text-gray-200" />
                     </div>
                   ))}
                </div>

                <div className="space-y-4">
                  <p className="text-[12px] font-bold text-gray-500">Drag and drop, paste, or browse to upload images</p>
                  <input 
                    type="text" 
                    placeholder="Press Ctrl+V to paste an image or image URL"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] italic text-gray-400 outline-none"
                  />
                </div>
               </div>
            </section>

            <section id="product-options" className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
               <div className="p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-serif font-black text-[#1a1c1d] mb-1">Product options *</h2>
                    <p className="text-[13px] text-gray-500 font-medium">Manage any variations of this product—like sizes, colors, or specifications.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input 
                        type="radio" 
                        name="hasOptions" 
                        className="w-4 h-4 text-[#5438ff] focus:ring-[#5438ff]/20" 
                        checked={formData.variants.length > 0}
                        readOnly
                      />
                      <span className="text-[14px] font-bold text-[#1a1c1d]">This product has options</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input 
                        type="radio" 
                        name="hasOptions" 
                        className="w-4 h-4 text-[#5438ff] focus:ring-[#5438ff]/20" 
                        checked={formData.variants.length === 0}
                        readOnly
                      />
                      <span className="text-[14px] font-bold text-[#1a1c1d]">This product doesn't have options</span>
                    </label>
                  </div>

                  <div className="pt-6 space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Colors</label>
                          <div className="flex flex-wrap gap-1.5">
                            {COLORS.slice(0, 5).map(color => (
                              <button 
                                key={color}
                                onClick={() => toggleSelection(color, selectedColors, setSelectedColors)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border
                                  ${selectedColors.includes(color) 
                                    ? 'bg-[#1a1c1d] text-white border-[#1a1c1d]' 
                                    : 'bg-gray-50 text-gray-500 border-gray-100'}`}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                           <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">RAM Size</label>
                           <div className="flex flex-wrap gap-1.5">
                              {RAM_OPTIONS.map(ram => (
                                <button 
                                  key={ram}
                                  onClick={() => toggleSelection(ram, selectedRam, setSelectedRam)}
                                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border
                                    ${selectedRam.includes(ram) 
                                      ? 'bg-[#5438ff]/10 text-[#5438ff] border-[#5438ff]/40' 
                                      : 'bg-gray-50 text-gray-500 border-gray-100'}`}
                                >
                                  {ram}
                                </button>
                              ))}
                           </div>
                        </div>
                        <div>
                           <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Storage</label>
                           <div className="flex flex-wrap gap-1.5">
                              {STORAGE_OPTIONS.map(storage => (
                                <button 
                                  key={storage}
                                  onClick={() => toggleSelection(storage, selectedStorage, setSelectedStorage)}
                                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border
                                    ${selectedStorage.includes(storage) 
                                      ? 'bg-[#5438ff]/10 text-[#5438ff] border-[#5438ff]/40' 
                                      : 'bg-gray-50 text-gray-500 border-gray-100'}`}
                                >
                                  {storage}
                                </button>
                              ))}
                           </div>
                        </div>
                     </div>

                     {formData.variants.length > 0 && (
                        <div className="overflow-x-auto border border-gray-100 rounded-xl">
                          <table className="w-full text-left">
                            <thead className="bg-[#fcfcfc] border-b border-gray-100">
                              <tr>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Photo</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Buying Price</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Selling Price</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {formData.variants.map((v) => (
                                <tr key={v.id}>
                                  <td className="p-4">
                                     <div className="w-8 h-8 rounded bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
                                        <Camera size={12} />
                                     </div>
                                  </td>
                                  <td className="p-4">
                                     <p className="text-[13px] font-bold text-[#1a1c1d] leading-tight">{v.color} / {v.ram} / {v.storage}</p>
                                  </td>
                                  <td className="p-4 w-32">
                                     <div className="flex items-center gap-1 px-2 py-1.5 bg-[#f6f6f7] rounded-lg">
                                        <span className="text-[11px] font-bold text-gray-400">৳</span>
                                        <input 
                                          type="number" 
                                          className="w-full bg-transparent text-[13px] font-bold outline-none" 
                                          value={v.buyingPrice || ''}
                                          onChange={(e) => updateVariant(v.id, 'buyingPrice', parseInt(e.target.value) || 0)}
                                        />
                                     </div>
                                  </td>
                                  <td className="p-4 w-32">
                                     <div className="flex items-center gap-1 px-2 py-1.5 bg-[#f6f6f7] rounded-lg">
                                        <span className="text-[11px] font-bold text-gray-400">৳</span>
                                        <input 
                                          type="number" 
                                          className="w-full bg-transparent text-[13px] font-bold outline-none" 
                                          value={v.sellingPrice || ''}
                                          onChange={(e) => updateVariant(v.id, 'sellingPrice', parseInt(e.target.value) || 0)}
                                        />
                                     </div>
                                  </td>
                                  <td className="p-4 w-24">
                                     <input 
                                       type="number" 
                                       className="w-full px-2 py-1.5 bg-[#f6f6f7] rounded-lg text-[13px] font-bold outline-none" 
                                       value={v.quantity || ''}
                                       onChange={(e) => updateVariant(v.id, 'quantity', parseInt(e.target.value) || 0)}
                                     />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                     )}
                  </div>
               </div>
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
