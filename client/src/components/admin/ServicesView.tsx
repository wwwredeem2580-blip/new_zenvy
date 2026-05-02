"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  FileText, 
  Clock, 
  CreditCard,
  AlertCircle,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { adminApi } from '@/lib/api/adminApi';
import { toast } from 'sonner';

interface RequiredDocument {
  label: string;
  required: boolean;
  instruction?: string;
}

interface SubService {
  _id?: string;
  name: string;
  price: number;
  duration: string;
  requiredDocuments: RequiredDocument[];
}

interface IService {
  _id?: string;
  id: string; // Slug/Internal ID
  name: string;
  icon: string;
  subservices: SubService[];
}

export function ServicesView() {
  const [categories, setCategories] = useState<IService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState<IService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.listServices();
      if (response.success) {
        setCategories(response.services);
      }
    } catch (err: any) {
      toast.error("Failed to load services");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCategory = async (category: IService) => {
    try {
      const response = await adminApi.createUpdateService(category);
      if (response.success) {
        toast.success(category._id ? "Service category updated" : "Service category created");
        setIsModalOpen(false);
        setEditingCategory(null);
        loadServices();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entire service category and all its subservices?")) return;
    try {
      const categoryToDelete = categories.find(c => c._id === id || c.id === id);
      if(categoryToDelete) {
          const response = await adminApi.deleteService(categoryToDelete.id);
          if (response.success) {
            toast.success("Service category deleted");
            loadServices();
          }
      }
    } catch (err: any) {
      toast.error("Failed to delete category");
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subservices.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 border border-black/5 rounded-sm shadow-sm">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Service Catalog.</h2>
          <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Manage categories, subservices, and document requirements</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={14} />
            <input 
              type="text"
              placeholder="Filter services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/[0.02] border border-black/5 rounded-sm text-xs font-bold focus:bg-white focus:ring-0 focus:border-black transition-all"
            />
          </div>
          <button 
            onClick={() => {
              setEditingCategory({
                id: `category-${Date.now()}`,
                name: "",
                icon: "FolderOpen",
                subservices: []
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
          >
            <Plus size={14} /> Add Category
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[400px] flex flex-col items-center justify-center bg-white border border-black/5 rounded-sm gap-4">
          <Loader2 className="animate-spin text-black/10" size={32} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Loading services...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="h-[400px] flex flex-col items-center justify-center bg-white border border-black/5 rounded-sm gap-4 text-center">
          <div className="w-16 h-16 bg-black/[0.02] rounded-sm flex items-center justify-center text-black/10">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">No services found</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Try adjusting your search filters</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((category) => (
            <motion.div 
              key={category._id || category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-black/5 rounded-sm overflow-hidden"
            >
              {/* Category Header */}
              <div className="p-6 bg-black/[0.02] border-b border-black/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white border border-black/5 rounded-sm flex items-center justify-center text-black/40">
                     <FolderOpen size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">{category.name}</h3>
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">ID: {category.id} • {category.subservices.length} Subservices</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setEditingCategory(category);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 transition-colors"
                  >
                    <Edit3 size={14} /> Edit Category
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(category._id! || category.id)}
                    className="p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-sm transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Subservices Grid */}
              <div className="p-6">
                 {category.subservices.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.subservices.map((sub, idx) => (
                        <div key={idx} className="border border-black/5 rounded-sm p-6 space-y-4 hover:border-black/20 transition-colors">
                           <div>
                              <h4 className="font-bold text-sm tracking-tight">{sub.name}</h4>
                              <div className="flex gap-4 mt-2">
                                <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">€{sub.price}</span>
                                <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">{sub.duration}</span>
                              </div>
                           </div>
                           
                           <div className="space-y-2 pt-4 border-t border-black/5">
                              <p className="text-[8px] font-bold uppercase tracking-widest text-black/40">Requirements</p>
                              <div className="space-y-1.5">
                                {sub.requiredDocuments.length > 0 ? (
                                  sub.requiredDocuments.slice(0, 3).map((rd, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[10px] font-bold text-black/60">
                                      <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${rd.required ? 'bg-indigo-500' : 'bg-black/20'}`} />
                                      <span>
                                         {rd.label}
                                         {rd.instruction && <span className="block text-[8px] text-black/40 font-medium mt-0.5">{rd.instruction}</span>}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">None</span>
                                )}
                                {sub.requiredDocuments.length > 3 && (
                                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">+ {sub.requiredDocuments.length - 3} more</p>
                                )}
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                 ) : (
                    <div className="py-8 text-center">
                       <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">No subservices defined yet.</p>
                    </div>
                 )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {isModalOpen && editingCategory && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-black/5 flex justify-between items-center bg-black/[0.01]">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight">{editingCategory._id ? "Edit Service Category" : "New Service Category"}</h3>
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Define category details and its subservices</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-sm transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Category Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-black/60 border-b border-black/5 pb-2">Category Settings</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Category Name</label>
                      <input 
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                        placeholder="e.g. Visti / Visa"
                        className="w-full px-4 py-3 bg-black/[0.02] border border-black/5 rounded-sm text-xs font-bold focus:bg-white focus:ring-0 focus:border-black transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Category ID (Slug)</label>
                      <input 
                        type="text"
                        value={editingCategory.id}
                        onChange={(e) => setEditingCategory({...editingCategory, id: e.target.value})}
                        placeholder="e.g. visti"
                        disabled={!!editingCategory._id}
                        className="w-full px-4 py-3 bg-black/[0.02] border border-black/5 rounded-sm text-xs font-bold focus:bg-white focus:ring-0 focus:border-black transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Subservices Manager */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-black/5 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-black/60">Subservices</h4>
                    <button 
                      onClick={() => {
                        const subs = [...editingCategory.subservices, { name: "", price: 0, duration: "", requiredDocuments: [] }];
                        setEditingCategory({...editingCategory, subservices: subs});
                      }}
                      className="flex items-center gap-2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest hover:text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-sm"
                    >
                      <Plus size={12} /> Add Subservice
                    </button>
                  </div>
                  
                  <div className="space-y-8">
                    {editingCategory.subservices.map((sub, sIdx) => (
                      <div key={sIdx} className="p-6 bg-white border border-black/10 rounded-sm shadow-sm space-y-6 relative">
                        <button 
                          onClick={() => {
                            const subs = [...editingCategory.subservices];
                            subs.splice(sIdx, 1);
                            setEditingCategory({...editingCategory, subservices: subs});
                          }}
                          className="absolute top-4 right-4 p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-sm transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pr-12">
                           <div className="space-y-2 md:col-span-1">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Name</label>
                             <input 
                               type="text"
                               value={sub.name}
                               onChange={(e) => {
                                 const subs = [...editingCategory.subservices];
                                 subs[sIdx].name = e.target.value;
                                 setEditingCategory({...editingCategory, subservices: subs});
                               }}
                               placeholder="e.g. Tourist Visa"
                               className="w-full px-4 py-2 bg-black/[0.02] border border-black/5 rounded-sm text-xs font-bold focus:bg-white focus:ring-0 focus:border-black transition-all"
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Price (€)</label>
                             <input 
                               type="number"
                               value={sub.price}
                               onChange={(e) => {
                                 const subs = [...editingCategory.subservices];
                                 subs[sIdx].price = parseFloat(e.target.value) || 0;
                                 setEditingCategory({...editingCategory, subservices: subs});
                               }}
                               className="w-full px-4 py-2 bg-black/[0.02] border border-black/5 rounded-sm text-xs font-bold focus:bg-white focus:ring-0 focus:border-black transition-all"
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Duration</label>
                             <input 
                               type="text"
                               value={sub.duration}
                               onChange={(e) => {
                                 const subs = [...editingCategory.subservices];
                                 subs[sIdx].duration = e.target.value;
                                 setEditingCategory({...editingCategory, subservices: subs});
                               }}
                               placeholder="e.g. 5 Days"
                               className="w-full px-4 py-2 bg-black/[0.02] border border-black/5 rounded-sm text-xs font-bold focus:bg-white focus:ring-0 focus:border-black transition-all"
                             />
                           </div>
                        </div>

                        {/* Document Requirements for this Subservice */}
                        <div className="bg-black/[0.02] p-4 rounded-sm space-y-4 border border-black/5">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">Required Documents</span>
                              <button 
                                onClick={() => {
                                  const subs = [...editingCategory.subservices];
                                  subs[sIdx].requiredDocuments.push({ label: "", required: true, instruction: "" });
                                  setEditingCategory({...editingCategory, subservices: subs});
                                }}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-black/60 hover:text-black uppercase tracking-widest"
                              >
                                <Plus size={12} /> Add Document
                              </button>
                           </div>
                           
                           <div className="space-y-3">
                              {sub.requiredDocuments.map((doc, dIdx) => (
                                 <div key={dIdx} className="flex gap-4 items-start bg-white p-3 rounded-sm border border-black/5">
                                    <div className="flex-1 space-y-3">
                                       <div className="grid grid-cols-3 gap-3">
                                          <div className="col-span-2">
                                            <input 
                                              type="text"
                                              value={doc.label}
                                              onChange={(e) => {
                                                const subs = [...editingCategory.subservices];
                                                subs[sIdx].requiredDocuments[dIdx].label = e.target.value;
                                                setEditingCategory({...editingCategory, subservices: subs});
                                              }}
                                              placeholder="Document Label (e.g. Passport Copy)"
                                              className="w-full px-3 py-2 bg-black/[0.02] border border-transparent rounded-sm text-xs font-bold focus:bg-white focus:border-black/10 transition-all"
                                            />
                                          </div>
                                          <div className="col-span-1">
                                            <button 
                                              onClick={() => {
                                                const subs = [...editingCategory.subservices];
                                                subs[sIdx].requiredDocuments[dIdx].required = !doc.required;
                                                setEditingCategory({...editingCategory, subservices: subs});
                                              }}
                                              className={`w-full h-full rounded-sm text-[10px] font-bold uppercase tracking-widest border transition-all ${doc.required ? 'bg-black text-white border-black' : 'bg-white text-black/40 border-black/10 hover:border-black/30'}`}
                                            >
                                              {doc.required ? "Mandatory" : "Optional"}
                                            </button>
                                          </div>
                                       </div>
                                       <div>
                                         <input 
                                           type="text"
                                           value={doc.instruction || ""}
                                           onChange={(e) => {
                                             const subs = [...editingCategory.subservices];
                                             subs[sIdx].requiredDocuments[dIdx].instruction = e.target.value;
                                             setEditingCategory({...editingCategory, subservices: subs});
                                           }}
                                           placeholder="Instruction / Tip (Optional)"
                                           className="w-full px-3 py-2 bg-black/[0.02] border border-transparent rounded-sm text-[10px] font-medium focus:bg-white focus:border-black/10 transition-all"
                                         />
                                       </div>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        const subs = [...editingCategory.subservices];
                                        subs[sIdx].requiredDocuments.splice(dIdx, 1);
                                        setEditingCategory({...editingCategory, subservices: subs});
                                      }}
                                      className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors mt-0.5"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                 </div>
                              ))}
                              {sub.requiredDocuments.length === 0 && (
                                <p className="text-[10px] text-center font-bold uppercase tracking-widest text-black/20 py-2">No documents required.</p>
                              )}
                           </div>
                        </div>
                      </div>
                    ))}
                    {editingCategory.subservices.length === 0 && (
                      <div className="py-12 border-2 border-dashed border-black/10 rounded-sm flex flex-col items-center justify-center gap-3 bg-black/[0.02]">
                        <FolderOpen size={24} className="text-black/20" />
                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest text-center px-8">Add a subservice to this category</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-black/5 bg-black/[0.01] flex justify-end gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSaveCategory(editingCategory)}
                  className="px-10 py-3 bg-black text-white rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
                >
                  Save Category
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
