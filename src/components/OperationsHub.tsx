import React, { useState } from "react";
import { 
  FileText, 
  Download, 
  Share2, 
  History, 
  CreditCard, 
  ShieldCheck, 
  Globe, 
  Printer, 
  MoreVertical, 
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function OperationsHub() {
  const [activeDoc, setActiveDoc] = useState('invoices');

  const docs = [
    { id: '901', client: 'Lumina Digital', type: 'Invoice', amount: '$4,200.00', status: 'paid', date: 'May 04, 2026' },
    { id: '902', client: 'EcoVibe Marketing', type: 'Receipt', amount: '$1,500.00', status: 'confirmed', date: 'May 03, 2026' },
    { id: '903', client: 'AeroJets Travel', type: 'Invoice', amount: '$12,800.00', status: 'pending', date: 'May 05, 2026' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Operations Hub</h2>
          <p className="text-slate-500 font-bold">Financial infrastructure, report generation, and secure documentation.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 nm-button rounded-xl text-slate-500 font-bold">
             <History className="w-5 h-5" /> Audit Log
           </button>
           <button className="flex items-center gap-2 px-8 py-3 nm-button rounded-xl text-orange-600 font-black">
             <Plus className="w-5 h-5" /> Generate Document
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document Generator Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="nm-flat p-8 rounded-[3rem] border border-slate-100 dark:border-white/5">
             <div className="flex gap-4 mb-8">
                {['invoices', 'receipts', 'reports', 'forms'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveDoc(tab)}
                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeDoc === tab ? 'nm-inset text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {tab}
                  </button>
                ))}
             </div>

             <div className="space-y-4">
                {docs.filter(d => activeDoc.includes(d.type.toLowerCase())).map((doc, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={doc.id} 
                    className="p-6 nm-inset rounded-[2rem] flex items-center justify-between group hover:border-orange-500/20 border border-transparent transition-all"
                  >
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl nm-button flex items-center justify-center text-orange-600">
                           <FileText className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <p className="font-black text-xs text-slate-900 dark:text-white uppercase">#{doc.id} • {doc.client}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${doc.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                 {doc.status}
                              </span>
                           </div>
                           <p className="text-lg font-black tracking-tight">{doc.amount}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.date}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button className="p-3 nm-button rounded-xl text-slate-400 hover:text-orange-600 transition-colors"><Download className="w-5 h-5" /></button>
                        <button className="p-3 nm-button rounded-xl text-slate-400 hover:text-orange-600 transition-colors"><Share2 className="w-5 h-5" /></button>
                        <button className="p-3 nm-button rounded-xl text-slate-400"><MoreVertical className="w-5 h-5" /></button>
                     </div>
                  </motion.div>
                ))}
             </div>
          </div>

          {/* Letterhead Preview Placeholder */}
          <div className="nm-flat p-10 rounded-[3rem] bg-white dark:bg-[#1e1e24] border-4 border-slate-100 dark:border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8">
                <Globe className="w-16 h-16 text-slate-100 dark:text-white/5" />
             </div>
             <div className="space-y-12">
                <div className="flex justify-between items-start">
                   <div className="space-y-2">
                      <div className="w-20 h-20 nm-inset rounded-[2rem] flex items-center justify-center text-3xl font-black text-orange-600">S</div>
                      <h4 className="text-xl font-black uppercase tracking-tighter">StratOS Strategic Hub</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Operations Division • Site B-14</p>
                   </div>
                   <div className="text-right">
                      <h4 className="text-4xl font-black text-slate-200 dark:text-white/10 uppercase tracking-widest">INVOICE</h4>
                   </div>
                </div>

                <div className="h-px w-full bg-slate-100 dark:bg-white/10" />

                <div className="grid grid-cols-2 gap-12">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Billed To</p>
                      <p className="text-lg font-black underline decoration-orange-500">Lumina Digital Global</p>
                      <p className="text-xs font-medium text-slate-500">14 Nerve Way, Neo-Tokyo Node<br/>Unit 409-B, Strategic Dist.</p>
                   </div>
                   <div className="text-right space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Amount Due</p>
                      <p className="text-4xl font-black text-orange-600">$4,200.00</p>
                   </div>
                </div>

                <div className="pt-12 flex justify-between items-end">
                   <div className="flex gap-4">
                      <button className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">Download PDF</button>
                      <button className="px-8 py-4 nm-button rounded-2xl font-black text-xs uppercase text-slate-400">Print Copy</button>
                   </div>
                   <div className="flex items-center gap-2 font-bold text-emerald-500 animate-pulse">
                      <ShieldCheck className="w-4 h-4" /> Secure Blockchain Verification Complete
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Financial Intelligence Feed */}
        <div className="space-y-8">
           <div className="nm-flat p-8 rounded-[2.5rem]">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                 <CreditCard className="w-4 h-4 text-orange-600" /> Payment Velocity
              </h3>
              <div className="space-y-4">
                 {[
                   { label: "Successful Payments", count: 142, icon: CheckCircle2, color: 'text-emerald-500' },
                   { label: "Pending Approvals", count: 8, icon: Clock, color: 'text-amber-500' },
                   { label: "Chargeback Protection", count: "100%", icon: ShieldCheck, color: 'text-blue-500' },
                 ].map((stat, i) => (
                   <div key={i} className="nm-inset p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <stat.icon className={`w-4 h-4 ${stat.color}`} />
                         <span className="text-xs font-bold text-slate-500">{stat.label}</span>
                      </div>
                      <span className="text-lg font-black text-slate-950 dark:text-white">{stat.count}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="nm-flat p-8 rounded-[2.5rem] bg-slate-950 text-white border border-orange-500/20">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white font-black italic">!</div>
                 <div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-white">Ops Alert</h4>
                    <p className="text-[10px] font-bold text-orange-500 italic">Financial Nerve System</p>
                 </div>
              </div>
              <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic mb-8">
                 "3 invoices are reaching net-30 terms. AI Autoresponder has initiated automated 'Soft Follow-up' sequences for Lumina & Vibe."
              </p>
              <button className="w-full py-4 bg-orange-600 rounded-2xl font-black text-xs uppercase text-white shadow-lg shadow-orange-600/20 hover:scale-105 transition-all">Review Escalations</button>
           </div>
        </div>
      </div>
    </div>
  );
}
