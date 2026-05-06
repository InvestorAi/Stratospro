import React, { useState } from "react";
import { Globe, Users, Briefcase, Plus, MoreVertical, ExternalLink, Globe2, ShieldCheck, Mail, Phone, LayoutGrid, Rocket, Target, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Brand {
  id: string;
  name: string;
  niche: string;
  status: 'active' | 'onboarding' | 'suspended';
  reach: string;
  audience: string;
}

export default function BrandManager() {
  const [brands, setBrands] = useState<Brand[]>([
    { id: '1', name: 'Lumina Digital', niche: 'Fintech', status: 'active', reach: '500K+', audience: 'Gens Z Engineers' },
    { id: '2', name: 'EcoVibe', niche: 'Skincare', status: 'active', reach: '120K+', audience: 'Organic Lifers' },
    { id: '3', name: 'AeroJets', niche: 'Travel', status: 'onboarding', reach: '0', audience: 'Luxury Travelers' },
  ]);

  const [activeSegment, setActiveSegment] = useState<'entities' | 'pipeline'>('entities');

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Empire Hub</h2>
          <p className="text-slate-500 font-bold">Strategic orchestration of global entities and unified onboarding.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setActiveSegment(activeSegment === 'entities' ? 'pipeline' : 'entities')}
             className="px-6 py-3 nm-button rounded-xl text-slate-500 font-bold transition-all hover:text-orange-600 flex items-center gap-2"
           >
             {activeSegment === 'entities' ? <Target className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
             {activeSegment === 'entities' ? 'Pipeline View' : 'Entity View'}
           </button>
           <button className="flex items-center gap-2 px-8 py-3 nm-button rounded-xl text-orange-600 font-black shadow-lg shadow-orange-600/10">
             <Plus className="w-5 h-5" /> Start New Onboarding
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Onboarding/Outbounding Pipeline Column */}
        <div className="lg:col-span-1 space-y-6">
           <div className="nm-flat p-6 rounded-[2rem] border border-orange-100 dark:border-orange-500/10">
              <h3 className="text-sm font-black uppercase tracking-widest text-orange-600 mb-6 flex items-center gap-2">
                 <Rocket className="w-4 h-4" /> Operations Pipeline
              </h3>
              <div className="space-y-4">
                 {[
                   { label: "Outbounding", status: "Active", count: 12, icon: ArrowUpRight, color: 'text-blue-500' },
                   { label: "Onboarding", status: "Review", count: 4, icon: ArrowDownLeft, color: 'text-emerald-500' },
                   { label: "Strategic Review", status: "Stalled", count: 2, icon: Target, color: 'text-amber-500' },
                 ].map((op, i) => (
                   <div key={i} className="nm-inset p-4 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-400">
                         <span>{op.status}</span>
                         <op.icon className={`w-3 h-3 ${op.color}`} />
                      </div>
                      <div className="flex justify-between items-end">
                         <p className="text-xs font-black uppercase text-slate-900 dark:text-white">{op.label}</p>
                         <p className="text-lg font-black text-orange-600">{op.count}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-4 nm-button rounded-2xl font-black text-[10px] uppercase text-orange-600">View Global Pipeline</button>
           </div>

           <div className="nm-flat p-6 rounded-[2rem] border border-slate-100 dark:border-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white mb-6">Pipeline Trends</h3>
              <div className="h-24 w-full nm-inset rounded-xl flex items-center justify-center">
                 <p className="text-[10px] font-bold text-slate-400 italic">Predictive Analytics Overlay</p>
              </div>
           </div>
        </div>

        {/* Brand/Pipeline Main Display */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex gap-4 pb-4 overflow-x-auto">
            {['All Portfolios', 'High Reach', 'New Wave', 'Under Review'].map((filter, i) => (
              <button key={i} className={`px-6 py-3 rounded-xl nm-button font-bold whitespace-nowrap transition-all ${i === 0 ? 'text-orange-600 nm-inset' : 'text-slate-500 hover:text-orange-600'}`}>
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence>
              {brands.map((brand, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={brand.id}
                  className="nm-flat p-8 rounded-[2.5rem] space-y-6 relative group border border-slate-100 dark:border-white/5"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 rounded-2xl nm-inset flex items-center justify-center text-2xl font-black text-orange-600">
                      {brand.name[0]}
                    </div>
                    <div className="flex gap-2">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        brand.status === 'active' ? 'bg-orange-100 dark:bg-orange-950 text-orange-600' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                      }`}>
                        {brand.status}
                      </div>
                      <button className="p-2 nm-button rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">{brand.name}</h3>
                    <p className="text-sm font-bold text-slate-400">{brand.niche} • Strategic Infrastructure</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="nm-inset p-4 rounded-2xl space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Reached</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white tracking-widest">{brand.reach}</p>
                    </div>
                    <div className="nm-inset p-4 rounded-2xl space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Focus Group</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white tracking-widest">{brand.audience.split(' ')[0]}</p>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button className="flex-1 py-4 nm-button rounded-2xl font-bold flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
                      <Globe2 className="w-4 h-4" /> Hub 
                    </button>
                    <button className="flex-1 py-4 nm-button rounded-2xl font-bold flex items-center justify-center gap-2 text-orange-600">
                      <ShieldCheck className="w-4 h-4" /> Control
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Corporate Compliance & Services Context */}
      <div className="nm-flat p-10 rounded-[3rem] border border-orange-100 dark:border-orange-900/20 bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-900 dark:to-orange-900/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-xl nm-button flex items-center justify-center text-orange-600">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Legal & Financial Backbone</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Managing 500+ accounts requires multi-continental compliance. StratOS automates brand identity design protection, legal documentation, and cross-border invoicing through unified Nerve nodes.
            </p>
            <div className="flex gap-6 pt-4">
               <div className="flex items-center gap-2 font-bold text-slate-500">
                 <Mail className="w-5 h-5 text-orange-600" /> 24 Client Requests
               </div>
               <div className="flex items-center gap-2 font-bold text-slate-500">
                 <Phone className="w-5 h-5 text-orange-600" /> High-Priority Hubs
               </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             {[
               { icon: Globe, label: "Server Nodes", val: "14 Clusters", color: "text-blue-500" },
               { icon: Briefcase, label: "Contract Vault", val: "100% Secure", color: "text-amber-500" },
               { icon: ShieldCheck, label: "Risk Mitigation", val: "Tier 1", color: "text-orange-500" },
               { icon: Users, label: "Strategic Partners", val: "48 Groups", color: "text-rose-500" },
             ].map((item, i) => (
               <div key={i} className="nm-inset p-6 rounded-3xl space-y-2">
                 <item.icon className={`w-6 h-6 ${item.color}`} />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{item.label}</p>
                 <p className="text-xl font-black text-slate-950 dark:text-white">{item.val}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
