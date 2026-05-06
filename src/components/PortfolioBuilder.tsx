import React, { useState } from "react";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  ExternalLink, 
  Plus, 
  Palette, 
  Layout, 
  ShoppingBag, 
  Zap, 
  Component, 
  ChevronRight,
  Globe,
  Settings,
  Eye,
  Rocket,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function PortfolioBuilder() {
  const [activeTab, setActiveTab] = useState<'sites' | 'funnels' | 'ecommerce'>('sites');

  const platforms = [
    { id: '1', name: 'Corporate Nerve', type: 'Landing Page', status: 'Live', visitors: '1.2k' },
    { id: '2', name: 'Product Launch Q4', type: 'Sales Funnel', status: 'Draft', visitors: '0' },
    { id: '3', name: 'Design Assets Store', type: 'E-commerce', status: 'Maintenance', visitors: '400' },
  ];

  const templates = [
    { name: "The Minimalist", type: "Landing Page", icon: Layout, color: "text-blue-500" },
    { name: "Velocity Funnel", type: "Sales Funnel", icon: Zap, color: "text-orange-500" },
    { name: "Digital Emporium", type: "E-commerce", icon: ShoppingBag, color: "text-emerald-500" },
    { name: "One-Page Wonder", type: "Sales Page", icon: Target, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-8 h-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Portfolio Nerve</h2>
          <p className="text-slate-500 font-bold">Constructing high-conversion digital portals with unified intelligence.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 nm-button rounded-xl text-slate-500 font-bold transition-all hover:text-orange-600">
             <Settings className="w-5 h-5" /> Global CDN
           </button>
           <button className="flex items-center gap-2 px-8 py-3 nm-button rounded-xl text-orange-600 font-black shadow-lg shadow-orange-600/10">
             <Rocket className="w-5 h-5" /> Deploy New Portal
           </button>
        </div>
      </div>

      {/* Builder Categories */}
      <div className="flex gap-4 p-2 nm-inset rounded-[2rem] w-fit">
        {[
          { id: 'sites', label: 'Landing Pages', icon: Layout },
          { id: 'funnels', label: 'Sales Funnels', icon: Zap },
          { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'nm-button bg-white dark:bg-slate-900 border border-orange-500/20 text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor Preview Area */}
        <div className="lg:col-span-2 space-y-8">
           <div className="nm-flat p-4 rounded-[3rem] border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex justify-between items-center px-4 py-2 mb-4 bg-white/50 dark:bg-black/20 rounded-2xl">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                 </div>
                 <div className="flex gap-4 items-center">
                    <div className="flex p-1 nm-inset rounded-xl">
                       <button className="p-2 text-orange-600"><Monitor className="w-4 h-4" /></button>
                       <button className="p-2 text-slate-400"><Tablet className="w-4 h-4" /></button>
                       <button className="p-2 text-slate-400"><Smartphone className="w-4 h-4" /></button>
                    </div>
                    <button className="p-3 nm-button rounded-xl text-slate-500"><Eye className="w-4 h-4" /></button>
                    <button className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase">Publish</button>
                 </div>
              </div>

              <div className="aspect-video w-full rounded-[2rem] overflow-hidden relative group nm-inset bg-white dark:bg-slate-950 flex shadow-inner">
                 <div className="m-auto text-center space-y-4">
                    <div className="w-20 h-20 nm-button rounded-[2rem] mx-auto flex items-center justify-center">
                       <Component className="w-10 h-10 text-orange-600 animate-spin-slow" />
                    </div>
                    <p className="font-black text-2xl uppercase tracking-tighter text-slate-300">Live Visual Orchestrator</p>
                    <p className="text-xs text-slate-400 font-bold italic">Drag & drop elements onto the canvas to construct your empire.</p>
                 </div>
                 <div className="absolute top-1/2 left-8 -translate-y-1/2 w-48 space-y-4 opacity-40 group-hover:opacity-100 transition-opacity">
                    {['Navbar', 'Hero Section', 'Pricing Table', 'Footer'].map(block => (
                      <div key={block} className="p-4 nm-button rounded-2xl text-[10px] font-black uppercase text-center cursor-move">{block}</div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Quick Stats Block */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Active Nodes", val: "24 Servers", icon: Globe },
                { label: "Avg. Conversion", val: "4.82%", icon: Target },
                { label: "Asset Resolution", val: "8K Ready", icon: Palette },
              ].map((stat, i) => (
                <div key={i} className="nm-flat p-6 rounded-[2rem] flex items-center gap-4">
                   <div className="p-3 nm-inset rounded-2xl text-orange-600"><stat.icon className="w-5 h-5" /></div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 leading-none">{stat.label}</p>
                      <p className="text-lg font-black text-slate-950 dark:text-white leading-tight">{stat.val}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Templates & Side Tools */}
        <div className="space-y-8">
           <div className="nm-flat p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white mb-6 flex items-center gap-2">
                 <Palette className="w-4 h-4 text-orange-600" /> Smart Templates
              </h3>
              <div className="space-y-4">
                 {templates.map((tpl, i) => (
                   <button key={i} className="w-full p-4 nm-button rounded-2xl flex items-center justify-between group transition-all hover:scale-102">
                      <div className="flex items-center gap-4">
                         <div className={`p-2 rounded-lg nm-inset ${tpl.color}`}><tpl.icon className="w-4 h-4" /></div>
                         <div className="text-left">
                            <p className="text-xs font-black uppercase text-slate-900 dark:text-white">{tpl.name}</p>
                            <p className="text-[9px] font-bold text-slate-400">{tpl.type}</p>
                         </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                   </button>
                 ))}
              </div>
           </div>

           <div className="nm-flat p-8 rounded-[2.5rem] border border-orange-100 dark:border-orange-950/20 bg-orange-50/20 dark:bg-orange-950/5">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-2xl nm-button flex items-center justify-center bg-orange-600 text-white font-black">AI</div>
                 <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">Venture AI</h4>
                    <p className="text-[10px] font-bold text-orange-600 italic">Predictive Growth Engine</p>
                 </div>
              </div>
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic mb-6">
                 "Based on your niche (Fintech), we suggest adding a multi-currency checkout block to increase conversions by 14%."
              </p>
              <button className="w-full py-4 nm-button rounded-2xl font-black text-xs uppercase text-orange-600">Apply Strategic AI Advice</button>
           </div>
        </div>
      </div>
    </div>
  );
}
