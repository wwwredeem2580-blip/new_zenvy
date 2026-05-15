"use client";

import React, { useState } from 'react';
import { Search, User, ShoppingBag, Minus, Plus, Facebook, Twitter, MessageCircle, LayoutDashboard, FileText, Image as ImageIcon, Calendar, Settings, LogOut, Send, Hash, Clock, Globe, Shield, ChevronRight, Menu, X, Bold, Italic, Link as LinkIcon, List, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

// --- Types ---
interface NewsArticle {
  id: string;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  isBreaking?: boolean;
  gallery?: string[];
}

const CATEGORIES = [
  { id: 'all', name: 'সব খবর' },
  { id: 'politics', name: 'রাজনীতি' },
  { id: 'national', name: 'জাতীয়' },
  { id: 'economy', name: 'অর্থনীতি' },
  { id: 'sports', name: 'খেলাধুলা' },
  { id: 'entertainment', name: 'বিনোদন' }
];

const NEWS_DATA: NewsArticle[] = [
  {
    id: '1',
    title: 'স্থানীয় নির্বাচনের তফসিল ঘোষণা হতে পারে আগামী সপ্তাহে',
    category: 'রাজনীতি',
    image: 'https://picsum.photos/seed/politics-1/800/600',
    excerpt: 'নির্বাচন কমিশন সচিব জানিয়েন, নির্বাচনের যাবতীয় প্রস্তুতি সম্পন্ন করা হয়েছে। আগামী বুধবার সংবাদ সম্মেলনের মাধ্যমে চূড়ান্ত সিদ্ধান্ত জানানো হবে।',
    content: `নির্বাচন কমিশন সচিব জানিয়েন, নির্বাচনের যাবতীয় প্রস্তুতি সম্পন্ন করা হয়েছে। আগামী বুধবার সংবাদ সম্মেলনের মাধ্যমে চূড়ান্ত সিদ্ধান্ত জানানো হবে। দেশের চলমান রাজনৈতিক পরিস্থিতিতে এই নির্বাচন অত্যন্ত গুরুত্বপূর্ণ হিসেবে দেখা হচ্ছে। সাধারণ ভোটারদের মধ্যে ব্যাপক উৎসাহ লক্ষ করা যাচ্ছে। 

তবে বিরোধী দলগুলো এখনো নির্বাচনে অংশগ্রহণের ব্যাপারে স্পষ্ট কোনো বার্তা দেয়নি। তারা বেশ কিছু দাবি পেশ করেছে যা এখনো অমীমাংসিত। পরিবেশ শান্ত রাখতে প্রশাসন বাড়তি নিরাপত্তা ব্যবস্থা গ্রহণ করেছে।`,
    author: 'প্রতিবেদক',
    date: '১৫ মে, ২০২৬',
    isBreaking: true
  },
  {
    id: '2',
    title: 'বিদ্যুৎ সংকটের সমাধানে নতুন পাওয়ার সোলার প্ল্যান্ট উদ্বোধন',
    category: 'জাতীয়',
    image: 'https://picsum.photos/seed/energy-1/800/600',
    excerpt: 'দেশের দক্ষিণ অঞ্চলে আজ দেশের বৃহত্তম সোলার প্ল্যান্টের উদ্বোধন করলেন প্রধানমন্ত্রী। এটি বিদ্যুৎ ঘাটতি কমাতে সহায়ক হবে।',
    content: 'দেশের দক্ষিণ অঞ্চলে আজ দেশের বৃহত্তম সোলার প্ল্যান্টের উদ্বোধন করলেন প্রধানমন্ত্রী। এটি বিদ্যুৎ ঘাটতি কমাতে সহায়ক হবে। দীর্ঘ দিনের বিদ্যুৎ সমস্যা সমাধানে এটি একটি বড় পদক্ষেপ। পরিবেশবান্ধব এই প্রকল্প ভবিষ্যতে আরও সম্প্রসারিত হবে বলে আশা করা হচ্ছে।',
    author: 'নিজস্ব প্রতিবেদক',
    date: '১৪ মে, ২০২৬'
  },
  {
    id: '3',
    title: 'বিশ্বকাপে বাংলাদেশের নতুন স্কোয়াড ঘোষণা, ফিরলেন অভিজ্ঞ খেলোয়াড়রা',
    category: 'খেলাধুলা',
    image: 'https://picsum.photos/seed/cricket-1/800/600',
    excerpt: 'আসন্ন টি-২০ বিশ্বকাপের জন্য ১৫ সদস্যের দল ঘোষণা করেছে বিসিবি। দলে বেশ কিছু চমকপ্রদ পরিবর্তন আনা হয়েছে।',
    content: 'আসন্ন টি-২০ বিশ্বকাপের জন্য ১৫ সদস্যের দল ঘোষণা করেছে বিসিবি। দলে বেশ কিছু চমকপ্রদ পরিবর্তন আনা হয়েছে। তরুণ খেলোয়াড়দের পাশাপাশি অভিজ্ঞদের ওপরও আস্থা রাখা হয়েছে। সমর্থকরা এই দল নিয়ে বেশ আশাবাদী।',
    author: 'ক্রীড়া প্রতিবেদক',
    date: '১৩ মে, ২০২৬'
  },
  {
    id: '4',
    title: 'ঢাকাই সিনেমায় ফিরছেন মেগাস্টার, নতুন ছবির শুটিং শুরু',
    category: 'বিনোদন',
    image: 'https://picsum.photos/seed/movie-1/800/600',
    excerpt: 'দীর্ঘ ৫ বছর পর বড় পর্দায় ফিরছেন জনপ্রিয় এই অভিনেতা। নতুন অ্যাকশন প্যাকেজ নিয়ে আসছেন তিনি।',
    content: 'দীর্ঘ ৫ বছর পর বড় পর্দায় ফিরছেন জনপ্রিয় এই অভিনেতা। নতুন অ্যাকশন প্যাকেজ নিয়ে আসছেন তিনি। সিনেমার নাম এখনো গোপন রাখা হলেও শুটিং লোকেশন এবং কাস্ট নিয়ে চলছে নানা জল্পনা। দর্শকরা অধীর আগ্রহে অপেক্ষা করছেন।',
    author: 'বিনোদন ডেস্ক',
    date: '১২ মে, ২০২৬'
  }
];

// --- Components ---

const AdBanner = ({ position, label = "বিজ্ঞাপন" }: { position: 'header' | 'sidebar' | 'inline', label?: string }) => (
  <div className={`bg-gray-100 border border-gray-200 flex flex-col items-center justify-center overflow-hidden relative group
    ${position === 'header' ? 'h-24 md:h-32 mb-8' : ''}
    ${position === 'sidebar' ? 'h-64 mb-6' : ''}
    ${position === 'inline' ? 'h-40 my-12' : ''}
  `}>
    <span className="absolute top-1 right-2 text-[9px] text-gray-400 uppercase font-bold tracking-tighter opacity-50 group-hover:opacity-100 transition-opacity">
      {label}
    </span>
    <div className="text-gray-300 font-bold text-xl md:text-3xl tracking-widest uppercase select-none p-4 text-center">
      এখানে আপনার বিজ্ঞাপন দিন
    </div>
  </div>
);

const BreakingNewsTicker = () => (
  <div className="bg-red-600 text-white py-2 flex items-center overflow-hidden border-b border-red-700">
    <div className="bg-red-800 px-4 py-1 font-bold text-xs uppercase tracking-widest z-10 whitespace-nowrap breaking-news-glow">
      ব্রেকিং নিউজ
    </div>
    <div className="flex-1 relative overflow-hidden">
      <motion.div 
        animate={{ x: [800, -1200] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="whitespace-nowrap flex gap-12 font-medium text-sm md:text-base pr-20"
      >
        {NEWS_DATA.filter(n => n.isBreaking).map(n => (
          <span key={n.id} className="cursor-pointer hover:underline">{n.title}</span>
        ))}
        {NEWS_DATA.map(n => (
          <span key={n.id} className="cursor-pointer hover:underline opacity-80">{n.title}</span>
        ))}
      </motion.div>
    </div>
  </div>
);

const Navbar = ({ categories, activeCategory, onHome, onSearch, onCategory, onAbout, onContact, onAdmin }: { 
  categories: { id: string, name: string }[],
  activeCategory: string,
  onHome: () => void, 
  onSearch: () => void,
  onCategory: (id: string) => void,
  onAbout: () => void,
  onContact: () => void,
  onAdmin: () => void
}) => (
  <div className="sticky top-0 z-50 bg-white shadow-sm lg:shadow-none">
    <div className="border-b border-gray-100 py-4 px-6 md:px-12 flex items-center justify-between">
      <button className="lg:hidden p-2" onClick={() => onCategory('all')}>
        <Menu className="w-6 h-6" />
      </button>

      <div 
        className="flex flex-col items-center cursor-pointer select-none"
        onClick={onHome}
      >
        <span className="text-2xl md:text-4xl font-black tracking-[-0.05em] uppercase leading-none">খবর ২৪</span>
        <div className="w-full h-1 bg-red-600 mt-1"></div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden lg:flex items-center gap-6 text-sm font-semibold uppercase tracking-widest">
          <button onClick={onHome} className="hover:text-red-600 transition-colors">হোম</button>
          <button onClick={onAbout} className="hover:text-red-600 transition-colors">আমাদের সম্পর্কে</button>
          <button onClick={onContact} className="hover:text-red-600 transition-colors">যোগাযোগ</button>
          <button onClick={onAdmin} className="hover:text-red-600 transition-colors bg-black text-white px-3 py-1 text-[10px]">ADMIN</button>
        </div>
        <div className="w-[1px] h-4 bg-gray-200 hidden md:block"></div>
        <Search className="w-5 h-5 cursor-pointer hover:text-red-600 transition-colors" onClick={onSearch} />
        <User className="w-5 h-5 cursor-pointer hover:text-red-600 transition-colors hidden sm:block" />
      </div>
    </div>
    
    <div className="hidden lg:flex justify-center border-b border-gray-100 py-3 gap-8 text-[13px] font-bold uppercase tracking-wider bg-gray-50/50">
      {categories.map(cat => (
        <button 
          key={cat.id} 
          className={`transition-all hover:text-red-600 underline-offset-8 ${activeCategory === cat.id ? 'text-red-600 underline' : 'hover:underline decoration-red-600'}`}
          onClick={() => onCategory(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  </div>
);

const NewsCard = ({ article, onClick, compact = false }: { article: NewsArticle, onClick: () => void, compact?: boolean }) => (
  <div 
    className={`group cursor-pointer flex flex-col gap-4 border-b border-gray-100 pb-8 last:border-0 ${compact ? 'md:flex-row md:items-start md:gap-6' : ''}`}
    onClick={onClick}
  >
    <div className={`relative overflow-hidden ${compact ? 'md:w-1/3' : 'w-full'}`}>
      <div className="aspect-[16/9] overflow-hidden">
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] px-2 py-0.5 uppercase tracking-widest font-bold">
        {article.category}
      </div>
    </div>
    <div className="flex flex-col gap-2 flex-1">
      <h3 className={`font-bold leading-snug group-hover:text-red-600 transition-colors ${compact ? 'text-lg' : 'text-2xl md:text-2xl'}`}>
        {article.title}
      </h3>
      <p className="text-gray-500 text-sm line-clamp-2 md:line-clamp-3 leading-relaxed">
        {article.excerpt}
      </p>
      <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2">
        <span className="font-semibold text-gray-600">{article.author}</span>
        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
        <span>{article.date}</span>
      </div>
    </div>
  </div>
);

const ArticleDetail = ({ article, onCategoryClick, newsList }: { article: NewsArticle, onCategoryClick: (id: string) => void, newsList: NewsArticle[] }) => {
  const gallery = article.gallery || [1, 2, 3, 4, 5, 6].map(i => `https://picsum.photos/seed/gallery-${i}/400/400`);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-12">
      <div className="w-full lg:w-2/3">
        <div className="mb-8">
          <button 
            onClick={() => onCategoryClick(article.category)}
            className="text-red-600 font-bold text-xs uppercase tracking-widest hover:underline mb-4 inline-block"
          >
            {article.category}
          </button>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 py-6 border-y border-gray-100 mb-8 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">{article.author}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">খবর২৪ প্রতিবেদক</span>
              </div>
            </div>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <div className="text-sm text-gray-500">
              {article.date} | আপডেট: ১০:৩০ এএম
            </div>
            <div className="flex-1"></div>
            <div className="flex gap-3">
               <button className="p-2 border border-gray-100 rounded-full hover:bg-blue-50 transition-all text-blue-600">
                 <Facebook className="w-4 h-4 fill-current" />
               </button>
               <button className="p-2 border border-gray-100 rounded-full hover:bg-blue-50 transition-all text-sky-500">
                 <Twitter className="w-4 h-4 fill-current" />
               </button>
               <button className="p-2 border border-gray-100 rounded-full hover:bg-green-50 transition-all text-green-600">
                 <MessageCircle className="w-4 h-4 fill-current" />
               </button>
            </div>
          </div>
        </div>

        <div className="relative aspect-video mb-12 overflow-hidden shadow-2xl">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-normal">
          {article.content.startsWith('<') ? (
            <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            article.content.split('\n\n').map((para, i) => (
              <div key={i}>
                <p className="mb-6">{para}</p>
                {i === 0 && <AdBanner position="inline" />}
              </div>
            ))
          )}
        </div>

        {/* Photo Gallery */}
        <div className="mt-16 pt-16 border-t border-gray-100">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <div className="w-1 h-6 bg-red-600"></div> গ্যালারি
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((img, i) => (
              <div key={i} className="aspect-square bg-gray-100 overflow-hidden cursor-pointer">
                <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Gallery" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="w-full lg:w-1/3 flex flex-col gap-12">
        <AdBanner position="sidebar" />
        
        <div>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-3 border-b border-black pb-2">
            সংশ্লিষ্ট সংবাদ
          </h3>
          <div className="flex flex-col gap-8">
            {newsList.filter(n => n.id !== article.id).slice(0, 5).map(n => (
              <div key={n.id} className="flex gap-4 group cursor-pointer" onClick={() => {}}>
                <div className="w-24 h-16 bg-gray-100 flex-shrink-0 overflow-hidden">
                  <img src={n.image} alt={n.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="font-bold text-sm leading-tight group-hover:text-red-600 transition-colors">
                  {n.title}
                </h4>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black text-white p-8">
          <h4 className="text-xl font-bold mb-4">আমাদের নিউজলেটার</h4>
          <p className="text-gray-400 text-sm mb-6">আপনার ইমেইলে সরাসরি খবর পান প্রতিদিন সকালে।</p>
          <div className="flex flex-col gap-3">
            <input type="email" placeholder="আপনার ইমেইল" className="bg-white/10 border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-red-600" />
            <button className="bg-red-600 py-3 font-bold uppercase tracking-widest text-xs">সাবস্ক্রাইব</button>
          </div>
        </div>
      </aside>
    </div>
  );
};

const AboutPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-20 text-center">
    <h1 className="text-5xl font-black mb-12 uppercase tracking-tighter">আমাদের সম্পর্কে</h1>
    <div className="prose prose-xl mx-auto text-gray-700 leading-relaxed font-light">
      <p className="mb-8">
        খবর২৪ বাংলাদেশের অগ্রগামী একটি ডিজিটাল নিউজ প্ল্যাটফর্ম। আমরা বিশ্বাস করি তথ্যের শক্তিতে এবং আমাদের মূল লক্ষ্য হলো সাধারণ মানুষের কাছে সত্য ও বস্তুনিষ্ঠ সংবাদ পৌঁছে দেওয়া।
      </p>
      <p className="mb-8">
        ২৪ ঘণ্টা আমরা কাজ করে যাই স্থানীয় থেকে আন্তর্জাতিক পর্যায়ের সব সংবাদ সবার আগে আপনার হাতে পৌঁছে দিতে। নির্ভীক সাংবাদিকতাই আমাদের মূল ভিত্তি।
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20">
      <div>
        <div className="text-4xl font-black text-red-600 mb-2">১০+</div>
        <div className="text-xs uppercase font-bold tracking-widest text-gray-400">অভিজ্ঞ সাংবাদিক</div>
      </div>
      <div>
        <div className="text-4xl font-black text-red-600 mb-2">২৫টি</div>
        <div className="text-xs uppercase font-bold tracking-widest text-gray-400">বিভাগীয় জেলা</div>
      </div>
      <div>
        <div className="text-4xl font-black text-red-600 mb-2">৫মিলিয়ন</div>
        <div className="text-xs uppercase font-bold tracking-widest text-gray-400">মাসিক পাঠক</div>
      </div>
    </div>
  </div>
);

const ContactPage = () => {
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-20">
      <div className="flex-1">
        <h1 className="text-5xl font-black mb-8 uppercase tracking-tighter">যোগাযোগ</h1>
        <p className="text-gray-600 mb-12 leading-relaxed">
          আপনার কোনো মন্তব্য, সংবাদ বা বিজ্ঞাপনের জন্য আমাদের সাথে যোগাযোগ করতে পারেন। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।
        </p>
        
        <div className="flex flex-col gap-6 text-sm">
          <div className="flex flex-col gap-1">
            <span className="font-bold uppercase tracking-widest text-gray-400 text-[10px]">অফিস</span>
            <span className="font-semibold">১২৩ মেইন রোড, ঢাকা, বাংলাদেশ</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold uppercase tracking-widest text-gray-400 text-[10px]">ইমেইল</span>
            <span className="font-semibold text-red-600">contact@khobor24.com</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold uppercase tracking-widest text-gray-400 text-[10px]">ফোন</span>
            <span className="font-semibold">+৮৮০ ১৭১২ ৩৪৫ ৬৭৮</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-8 md:p-12">
        {sent ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">✓</div>
            <h3 className="text-2xl font-bold mb-2">বার্তা পাঠানো হয়েছে</h3>
            <p className="text-gray-500">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করছি।</p>
          </div>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">নাম</label>
              <input type="text" className="bg-white border border-gray-200 p-4 focus:outline-none focus:border-red-600 transition-colors" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">ইমেইল</label>
              <input type="email" className="bg-white border border-gray-200 p-4 focus:outline-none focus:border-red-600 transition-colors" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">বার্তা</label>
              <textarea rows={4} className="bg-white border border-gray-200 p-4 focus:outline-none focus:border-red-600 transition-colors" required></textarea>
            </div>
            <button className="bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors">পাঠিয়ে দিন</button>
          </form>
        )}
      </div>
    </div>
  );
};

const Footer = ({ onHome }: { onHome: () => void }) => (
  <footer className="mt-24 px-6 md:px-12 py-16 bg-black text-white">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:justify-between items-start">
      <div className="flex flex-col gap-6 max-w-xs">
        <div 
          className="flex flex-col items-start cursor-pointer select-none"
          onClick={onHome}
        >
          <span className="text-3xl font-black tracking-[-0.05em] uppercase leading-none">খবর ২৪</span>
          <div className="w-full h-1 bg-red-600 mt-1"></div>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          সত্যের সন্ধানে অবিচল - আপনার এলাকার সর্বশেষ খবর সবার আগে পৌঁছে দেওয়াই আমাদের লক্ষ্য।
        </p>
      </div>

      <div className="grid grid-cols-2 gap-16">
        <div className="flex flex-col gap-4 text-sm font-semibold uppercase tracking-widest">
           <span className="text-gray-600 mb-2">বিভাগ</span>
           <button className="text-left hover:text-red-500">জাতীয়</button>
           <button className="text-left hover:text-red-500">রাজনীতি</button>
           <button className="text-left hover:text-red-500">খেলাধুলা</button>
           <button className="text-left hover:text-red-500">বিনোদন</button>
        </div>
        <div className="flex flex-col gap-4 text-sm font-semibold uppercase tracking-widest">
           <span className="text-gray-600 mb-2">কোম্পানি</span>
           <button className="text-left hover:text-red-500">আমাদের সম্পর্কে</button>
           <button className="text-left hover:text-red-500">যোগাযোগ</button>
           <button className="text-left hover:text-red-500">বিজ্ঞাপন</button>
           <button className="text-left hover:text-red-500">নীতিমালা</button>
        </div>
      </div>
    </div>
    
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 mt-24 pt-8 border-t border-white/10 justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest">
      <span>© ২০২৬ খোরর২৪ ডিজিটাল মিডিয়া লিমিটেড</span>
      <div className="flex gap-8">
        <a href="#" className="hover:text-white">গোপনীয়তা নীতি</a>
        <a href="#" className="hover:text-white">শর্তাবলী</a>
      </div>
    </div>
  </footer>
);

// --- Admin Components ---

const AdminSidebar = ({ activeTab, onTabChange, onExit }: { activeTab: string, onTabChange: (tab: string) => void, onExit: () => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard, group: 'MAIN' },
    { id: 'posts', label: 'POSTS', icon: FileText, group: 'OPERATIONS', active: true },
    { id: 'media', label: 'MEDIA', icon: ImageIcon, group: 'OPERATIONS' },
    { id: 'categories', label: 'CATEGORIES', icon: Hash, group: 'OPERATIONS' },
    { id: 'settings', label: 'SETTINGS', icon: Settings, group: 'SYSTEM' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-[calc(100vh-140px)] sticky top-20">
      <div className="flex-1 py-8 flex flex-col gap-8">
        {['MAIN', 'OPERATIONS', 'SYSTEM'].map(group => (
          <div key={group} className="px-6 flex flex-col gap-2">
            <span className="text-[10px] font-black tracking-[0.2em] text-gray-400 mb-2">{group}</span>
            {menuItems.filter(item => item.group === group).map(item => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-black text-white' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="p-6 border-t border-gray-100">
        <button 
          onClick={onExit}
          className="flex items-center gap-3 text-red-600 font-bold text-[10px] tracking-widest hover:translate-x-1 transition-transform"
        >
          <LogOut className="w-3 h-3" />
          EXIT PORTAL
        </button>
      </div>
    </aside>
  );
};

const PostPage = ({ newsList, onSavePost, existingCategories }: { newsList: NewsArticle[], onSavePost: (post: NewsArticle) => void, existingCategories: string[] }) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsArticle | null>(null);

  const handleEdit = (post: NewsArticle) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  return (
    <div className="flex-1 p-8 md:p-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">Posts.</h1>
            <p className="text-gray-400 font-medium">Manage your news articles and publications.</p>
          </div>
          <button 
            onClick={() => { setEditingPost(null); setShowEditor(true); }}
            className="bg-black text-white px-8 py-4 font-black text-xs tracking-widest hover:shadow-2xl transition-all active:scale-95 flex items-center gap-3"
          >
            <Plus className="w-4 h-4" />
            CREATE NEW POST
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
           <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search posts..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 text-sm focus:outline-none w-64" />
                </div>
              </div>
              <button className="text-xs font-bold text-gray-500 flex items-center gap-2 hover:text-black">
                FILTERS <ChevronRight className="w-3 h-3" />
              </button>
           </div>
           
           <div className="divide-y divide-gray-100">
             {newsList.map(post => (
               <div key={post.id} className="p-6 flex items-center gap-6 group hover:bg-gray-50 transition-colors">
                  <div className="w-20 h-14 bg-gray-100 overflow-hidden shrink-0">
                    <img src={post.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{post.category}</span>
                    <h4 className="font-bold text-sm leading-tight text-gray-900">{post.title}</h4>
                    <span className="text-[10px] text-gray-400 uppercase font-medium">{post.date} • {post.author}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">PUBLISHED</span>
                    <button 
                      onClick={() => handleEdit(post)}
                      className="p-2 text-gray-400 hover:text-black transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showEditor && (
          <PostEditor 
            article={editingPost || undefined}
            onClose={() => setShowEditor(false)} 
            onSave={(updatedPost) => {
              onSavePost(updatedPost);
              setShowEditor(false);
            }}
            existingCategories={existingCategories}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const PostEditor = ({ article, onClose, onSave, existingCategories }: { article?: NewsArticle, onClose: () => void, onSave: (post: NewsArticle) => void, existingCategories: string[] }) => {
  const [formData, setFormData] = useState({
    id: article?.id || '',
    title: article?.title || '',
    category: article?.category || 'রাজনীতি',
    content: article?.content || '',
    scheduled: false,
    date: article?.date || '2026-05-15',
    time: '10:30',
    image: article?.image || '',
    gallery: article?.gallery || [] as string[]
  });
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const handleAddGalleryImage = () => {
    const newImg = `https://picsum.photos/seed/${Math.random()}/800/600`;
    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, newImg]
    }));
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== idx)
    }));
  };

  const handlePublish = () => {
    const finalCategory = showCustomCategory ? customCategory : formData.category;
    if (!finalCategory) {
      alert("Please select or enter a category");
      return;
    }

    const publishedPost: NewsArticle = {
      id: formData.id || Math.random().toString(36).substr(2, 9),
      title: formData.title,
      category: finalCategory,
      content: formData.content,
      image: formData.image || 'https://picsum.photos/seed/default/800/600',
      excerpt: formData.content.substring(0, 150) + '...',
      author: article?.author || 'প্রতিবেদক',
      date: article?.date || '১৫ মে, ২০২৬',
      gallery: formData.gallery
    };
    onSave(publishedPost);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
    >
      <motion.div 
        initial={{ y: 50, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 50, scale: 0.95 }}
        className="bg-white w-full max-w-5xl h-full md:h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3">
               {article ? 'Edit Article' : 'Publish Article'}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Article Editor Prototype</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 flex flex-col gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TITLE</label>
                <input 
                  type="text" 
                  placeholder="Enter article headline..."
                  className="w-full text-3xl font-black border-none focus:ring-0 p-0 placeholder:text-gray-200"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CONTENT</label>
                <div className="border border-gray-100 rounded-lg">
                   <ReactQuill 
                    theme="snow"
                    value={formData.content}
                    onChange={val => setFormData({...formData, content: val})}
                    placeholder="Write your story here..."
                    className="publish-editor"
                   />
                </div>
              </div>

              {/* Gallery Manager */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PHOTO GALLERY</label>
                    <button 
                      onClick={handleAddGalleryImage}
                      className="text-[10px] font-black bg-gray-100 px-3 py-1 hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> ADD IMAGE
                    </button>
                 </div>
                 <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {formData.gallery.map((img, idx) => (
                      <div key={idx} className="aspect-square bg-gray-50 relative group border border-gray-100 overflow-hidden">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <button 
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1 right-1 bg-white/90 text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={handleAddGalleryImage}
                      className="aspect-square border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 hover:border-gray-200 hover:text-gray-400 transition-all"
                    >
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[8px] font-bold">UPLOAD</span>
                    </button>
                 </div>
              </div>
            </div>

            <aside className="w-full lg:w-72 flex flex-col gap-8">
              <div className="p-6 bg-gray-50/50 rounded-lg border border-gray-100 flex flex-col gap-6">
                 <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CATEGORY</label>
                      <button 
                        onClick={() => setShowCustomCategory(!showCustomCategory)}
                        className="text-[10px] font-bold text-red-600 hover:underline"
                      >
                        {showCustomCategory ? 'SELECT EXISTING' : 'CREATE NEW'}
                      </button>
                    </div>
                    
                    {showCustomCategory ? (
                      <input 
                        type="text"
                        placeholder="Enter category name..."
                        className="w-full bg-white border border-gray-200 p-3 text-xs font-bold focus:outline-none focus:border-red-600"
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                      />
                    ) : (
                      <select 
                        className="w-full bg-white border border-gray-200 p-3 text-xs font-bold"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        {existingCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    )}
                 </div>

                 <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">SCHEDULE POST</label>
                      <input 
                        type="checkbox" 
                        className="accent-black"
                        checked={formData.scheduled}
                        onChange={e => setFormData({...formData, scheduled: e.target.checked})}
                      />
                    </div>
                    {formData.scheduled && (
                      <div className="grid grid-cols-2 gap-2">
                        <input type="date" className="p-2 border border-gray-200 text-[10px] font-bold" value={formData.date} />
                        <input type="time" className="p-2 border border-gray-200 text-[10px] font-bold" value={formData.time} />
                      </div>
                    )}
                 </div>

                 <div className="pt-4 border-t border-gray-200 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold">
                       <ImageIcon className="w-4 h-4" />
                       FEATURED IMAGE
                    </div>
                    <div className="aspect-video bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-300 cursor-pointer hover:border-gray-400 transition-all relative overflow-hidden group">
                       {formData.image ? (
                         <img src={formData.image} className="w-full h-full object-cover" alt="Featured" />
                       ) : (
                         <Plus className="w-8 h-8" />
                       )}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({ ...prev, image: `https://picsum.photos/seed/${Math.random()}/1200/800` }));
                            }}
                            className="text-[10px] font-black text-white bg-white/20 px-3 py-1 backdrop-blur-sm"
                          >
                             CHANGE IMAGE
                          </button>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                 <button className="w-full py-4 bg-gray-100 text-gray-500 font-black text-[10px] tracking-widest uppercase hover:bg-gray-200 transition-colors">
                   SAVE AS DRAFT
                 </button>
                 <button 
                   onClick={handlePublish}
                   className="w-full py-4 bg-black text-white font-black text-[10px] tracking-widest uppercase hover:shadow-xl transition-all"
                 >
                   {article ? 'UPDATE NOW' : 'PUBLISH NOW'}
                 </button>
              </div>
            </aside>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [newsList, setNewsList] = useState<NewsArticle[]>(NEWS_DATA);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [view, setView] = useState<'home' | 'about' | 'contact' | 'admin'>('home');
  const [adminTab, setAdminTab] = useState('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const categoriesList = Array.from(new Set([
    ...CATEGORIES.slice(1).map(c => c.name),
    ...newsList.map(n => n.category)
  ]));

  const dynamicCategories = [
    { id: 'all', name: 'সব খবর' },
    ...categoriesList.map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name
    }))
  ];

  const filteredNews = newsList.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === dynamicCategories.find(c => c.id === activeCategory)?.name;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = newsList[0];

  const handleSavePost = (savedPost: NewsArticle) => {
    setNewsList(prev => {
      const exists = prev.find(p => p.id === savedPost.id);
      if (exists) {
        return prev.map(p => p.id === savedPost.id ? savedPost : p);
      }
      return [savedPost, ...prev];
    });
  };

  const handleHome = () => {
    setSelectedArticle(null);
    setActiveCategory('all');
    setView('home');
    setSearchQuery('');
    window.scrollTo(0, 0);
  };

  const handleCategory = (id: string) => {
    setActiveCategory(id);
    setSelectedArticle(null);
    setView('home');
    window.scrollTo(0, 0);
  };

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
    setView('home');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-red-600 selection:text-white">
      <BreakingNewsTicker />
      <Navbar 
        categories={dynamicCategories}
        activeCategory={activeCategory}
        onHome={handleHome}
        onSearch={() => setIsSearchOpen(!isSearchOpen)}
        onCategory={handleCategory}
        onAbout={() => { setView('about'); setSelectedArticle(null); window.scrollTo(0, 0); }}
        onContact={() => { setView('contact'); setSelectedArticle(null); window.scrollTo(0, 0); }}
        onAdmin={() => { setView('admin'); setSelectedArticle(null); window.scrollTo(0, 0); }}
      />
      
      {isSearchOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 border-b border-gray-100 p-6 flex justify-center"
        >
          <div className="max-w-2xl w-full relative">
            <input 
              autoFocus
              type="text" 
              placeholder="খবর খুঁজুন..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 px-6 py-4 rounded-full shadow-sm focus:outline-none focus:border-red-600 font-medium"
            />
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </motion.div>
      )}

      <main className="pb-20">
        <AnimatePresence mode="wait">
          {view === 'admin' ? (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col md:flex-row min-h-[calc(100vh-140px)]">
               <AdminSidebar activeTab={adminTab} onTabChange={setAdminTab} onExit={handleHome} />
               {adminTab === 'posts' && <PostPage newsList={newsList} onSavePost={handleSavePost} existingCategories={categoriesList} />}
               {adminTab !== 'posts' && (
                 <div className="flex-1 flex flex-col items-center justify-center p-20 text-gray-300">
                    <span className="text-4xl font-black italic mb-4">{adminTab.toUpperCase()} CONTENT MISSING</span>
                    <p className="text-xs font-bold tracking-widest">ONLY POSTS MODULE IS IMPLEMENTED IN THIS DUMMY VERSION</p>
                 </div>
               )}
            </motion.div>
          ) : view === 'about' ? (
            <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AboutPage />
            </motion.div>
          ) : view === 'contact' ? (
            <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ContactPage />
            </motion.div>
          ) : selectedArticle ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ArticleDetail 
                article={selectedArticle} 
                newsList={newsList}
                onCategoryClick={(catName) => {
                  const catId = CATEGORIES.find(c => c.name === catName)?.id || 'all';
                  handleCategory(catId);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-6 md:px-12 py-8"
            >
              <AdBanner position="header" />

              {activeCategory === 'all' && !searchQuery && (
                <div className="mb-20">
                  <div 
                    className="group cursor-pointer flex flex-col md:flex-row gap-12"
                    onClick={() => handleArticleClick(featuredArticle)}
                  >
                    <div className="w-full md:w-3/5 overflow-hidden relative">
                      <div className="aspect-[16/10] overflow-hidden">
                        <img 
                          src={featuredArticle.image} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                          alt="Hero"
                        />
                      </div>
                      <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1 text-xs font-bold uppercase tracking-widest shadow-xl">
                        ফিচারড
                      </div>
                    </div>
                    <div className="w-full md:w-2/5 flex flex-col justify-center gap-6">
                      <span className="text-red-600 font-bold text-xs uppercase tracking-widest">{featuredArticle.category}</span>
                      <h2 className="text-4xl md:text-5xl font-black leading-tight group-hover:text-red-600 transition-colors">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-gray-500 text-lg leading-relaxed">
                        {featuredArticle.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                        <span>{featuredArticle.author}</span>
                        <span>•</span>
                        <span>{featuredArticle.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-12">
                <div className="w-full lg:w-2/3">
                  <div className="flex items-center justify-between mb-10 border-b-2 border-black pb-2">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">
                      {searchQuery ? `অনুসন্ধান ফলাফল: ${searchQuery}` : activeCategory === 'all' ? 'সবশেষ সংবাদ' : CATEGORIES.find(c => c.id === activeCategory)?.name}
                    </h3>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {filteredNews.length} টি সংবাদ পাওয়া গেছে
                    </div>
                  </div>

                  <div className="flex flex-col gap-12">
                    {filteredNews.map((article, idx) => (
                      <div key={article.id}>
                        <NewsCard 
                          article={article} 
                          onClick={() => handleArticleClick(article)} 
                          compact={true}
                        />
                        {idx === 0 && <AdBanner position="inline" label="প্রযোজিত সংবাদ" />}
                      </div>
                    ))}
                    {filteredNews.length === 0 && (
                      <div className="py-20 text-center flex flex-col items-center gap-4">
                        <Search className="w-12 h-12 text-gray-200" />
                        <p className="text-xl font-bold text-gray-400 italic">দুঃখিত, কোনো সংবাদ পাওয়া যায়নি।</p>
                        <button onClick={handleHome} className="text-red-600 font-bold underline">সব সংবাদে ফিরে যান</button>
                      </div>
                    )}
                  </div>
                </div>

                <aside className="w-full lg:w-1/3 flex flex-col gap-12">
                   <div className="bg-gray-50 p-8 border border-gray-100">
                     <h4 className="font-bold border-b border-black pb-2 mb-6 uppercase tracking-widest text-sm">জনপ্রিয় সংবাদ</h4>
                     <div className="flex flex-col gap-6">
                        {newsList.slice(0, 3).map((n, i) => (
                          <div key={n.id} className="flex gap-4 group cursor-pointer" onClick={() => handleArticleClick(n)}>
                            <span className="text-3xl font-black text-gray-200 group-hover:text-red-600 transition-colors">০{i+1}</span>
                            <h5 className="font-bold text-sm leading-snug group-hover:underline">{n.title}</h5>
                          </div>
                        ))}
                     </div>
                   </div>

                   <AdBanner position="sidebar" />
                   
                   <div className="sticky top-28">
                     <h4 className="font-bold border-b border-black pb-2 mb-6 uppercase tracking-widest text-sm">যুক্ত হোন আমাদের সাথে</h4>
                     <div className="grid grid-cols-2 gap-3">
                        {['Facebook', 'YouTube', 'Twitter', 'Instagram'].map(social => (
                          <button key={social} className="border border-gray-100 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                            {social}
                          </button>
                        ))}
                     </div>
                   </div>
                </aside>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {view !== 'admin' && <Footer onHome={handleHome} />}
    </div>
  );
}
