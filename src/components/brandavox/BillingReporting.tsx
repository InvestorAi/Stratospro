import React, { useState } from "react";
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  Download, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  CreditCard,
  DollarSign,
  PieChart,
  Calendar,
  Search,
  Filter,
  Sparkles,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { name: 'Jan', revenue: 4000, target: 4400 },
  { name: 'Feb', revenue: 3000, target: 4400 },
  { name: 'Mar', revenue: 5000, target: 4400 },
  { name: 'Apr', revenue: 4500, target: 4400 },
  { name: 'May', revenue: 6000, target: 4400 },
  { name: 'Jun', revenue: 7500, target: 4400 },
];

export default function BillingReporting() {
  const [activeTab, setActiveTab] = useState<'billing' | 'reporting'>('billing');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Financial Intelligence</h2>
          <p className="text-slate-500 font-bold">Manage agency revenue, invoices, and automated reporting studio.</p>
        </div>
        <div className="nm-flat p-1 rounded-2xl flex">
          <button 
            onClick={() => setActiveTab('billing')}
            className={cn(
              "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'billing' ? "nm-inset text-orange-600" : "text-slate-400"
            )}
          >
            Ledger & Invoices
          </button>
          <button 
            onClick={() => setActiveTab('reporting')}
            className={cn(
              "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'reporting' ? "nm-inset text-indigo-600" : "text-slate-400"
            )}
          >
            Insights & Reporting
          </button>
        </div>
      </div>

      {activeTab === 'billing' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { label: 'Pending Payouts', value: '$12,450.00', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/5' },
                 { label: 'Settled this Month', value: '$24,800.50', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                 { label: 'Outstanding Debt', value: '$1,200.00', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/5' },
               ].map((stat, i) => (
                 <div key={i} className="nm-flat p-8 rounded-[2.5rem] flex items-center gap-6">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", stat.bg)}>
                       <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                       <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
                    </div>
                 </div>
               ))}
            </div>

            {/* Invoices List */}
            <div className="nm-flat p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 overflow-hidden">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tighter">Recent Ledger Transactions</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Automatic sync with Stripe & Wise</p>
                  </div>
                  <div className="flex gap-4">
                     <button className="px-6 py-3 nm-button rounded-xl text-orange-600 font-black text-xs uppercase tracking-widest flex items-center gap-3">
                        <Plus className="w-4 h-4" /> Create Invoice
                     </button>
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="border-b border-slate-100 dark:border-white/5">
                       <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Invoice ID</th>
                       <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Client Empire</th>
                       <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Amount</th>
                       <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Status</th>
                       <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Due Date</th>
                       <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                     {[
                       { id: 'INV-40221', client: 'TechCorp Solutions', amount: '$4,500.00', status: 'Settled', statusColor: 'emerald', date: 'Oct 12, 2026' },
                       { id: 'INV-40222', client: 'Nova Beauty', amount: '$2,400.00', status: 'Pending', statusColor: 'amber', date: 'Oct 24, 2026' },
                       { id: 'INV-40223', client: 'Green Earth', amount: '$3,000.00', status: 'Overdue', statusColor: 'rose', date: 'Oct 01, 2026' },
                       { id: 'INV-40224', client: 'Future Labs', amount: '$1,200.00', status: 'Draft', statusColor: 'slate', date: 'Nov 05, 2026' },
                     ].map((inv, i) => (
                       <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                         <td className="py-6 px-4 font-black text-xs text-slate-400 tracking-widest">{inv.id}</td>
                         <td className="py-6 px-4">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-orange-600/10 text-orange-600 flex items-center justify-center text-[10px] font-black">
                                  {inv.client.charAt(0)}
                               </div>
                               <span className="font-bold text-sm tracking-tight">{inv.client}</span>
                            </div>
                         </td>
                         <td className="py-6 px-4 font-black text-sm">{inv.amount}</td>
                         <td className="py-6 px-4 text-left">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5",
                              inv.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                              inv.statusColor === 'amber' ? 'bg-amber-100 text-amber-600' :
                              inv.statusColor === 'rose' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                            )}>
                               <div className={cn("w-1 h-1 rounded-full", `bg-${inv.statusColor}-600`)} />
                               {inv.status}
                            </span>
                         </td>
                         <td className="py-6 px-4 text-[10px] font-bold text-slate-400 uppercase">{inv.date}</td>
                         <td className="py-6 px-4">
                            <div className="flex gap-2">
                               <button className="p-2 nm-button rounded-lg text-slate-400 hover:text-orange-600 transition-colors"><Download className="w-4 h-4" /></button>
                               <button className="p-2 nm-button rounded-lg text-slate-400 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8 text-left">
             <div className="nm-flat p-8 rounded-[3rem] space-y-8 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <CreditCard className="w-24 h-24 rotate-12" />
                </div>
                <div className="space-y-1 relative z-10">
                   <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Total Pipeline Value</h4>
                   <h3 className="text-4xl font-black tracking-tighter">$142,500.00</h3>
                </div>
                <div className="space-y-4 relative z-10">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Annual Goal Progress</span>
                      <span className="text-orange-500">68%</span>
                   </div>
                   <div className="h-2 w-full nm-inset bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-600 w-[68%]" />
                   </div>
                </div>
                <button className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl relative z-10 hover:scale-[1.02] active:scale-95 transition-all">
                  Forecast Strategy
                </button>
             </div>

             <div className="nm-flat p-8 rounded-[3rem] space-y-6">
                <h4 className="text-sm font-black uppercase tracking-tight">Revenue Vectors</h4>
                <div className="space-y-4">
                   {[
                     { label: 'Retainers', value: '72%', color: 'bg-indigo-500' },
                     { label: 'Setup Fees', value: '18%', color: 'bg-orange-500' },
                     { label: 'AI Assets', value: '10%', color: 'bg-emerald-500' },
                   ].map((v, i) => (
                     <div key={i} className="flex items-center gap-4">
                        <div className={cn("w-2 h-8 rounded-full", v.color)} />
                        <div className="flex-1">
                           <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                              <span>{v.label}</span>
                              <span className="text-slate-400">{v.value}</span>
                           </div>
                           <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={cn("h-full", v.color)} style={{ width: v.value }} />
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 nm-flat p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 min-h-[450px]">
                 <div className="flex justify-between items-center mb-10">
                    <div>
                      <h4 className="text-2xl font-black uppercase tracking-tighter">Engagement Velocity</h4>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Growth Analytics Studio</p>
                    </div>
                    <div className="flex gap-2">
                       <button className="px-5 py-2 nm-inset text-[10px] font-black uppercase rounded-lg text-indigo-600">6 Months</button>
                    </div>
                 </div>
                 <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis dataKey="name" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} />
                        <YAxis fontSize={10} fontWeight={900} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                        <Area type="step" dataKey="target" stroke="#ea580c" strokeWidth={1} strokeDasharray="5 5" fillOpacity={0} />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="nm-flat p-8 rounded-[3rem] bg-indigo-600 text-white relative overflow-hidden group">
                    <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                       <Sparkles className="w-48 h-48" />
                    </div>
                    <div className="relative z-10 space-y-6">
                       <h4 className="text-xl font-black uppercase tracking-tighter leading-none">Automated Client Reporting</h4>
                       <p className="text-[10px] font-bold text-indigo-100 uppercase leading-relaxed italic opacity-80">
                          "Generate a 20-page strategic performance report in 4 seconds with AI synthesis."
                       </p>
                       <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3">
                          <BarChart3 className="w-4 h-4" /> Start Studio
                       </button>
                    </div>
                 </div>

                 <div className="nm-flat p-8 rounded-[3rem] space-y-6">
                    <h4 className="text-sm font-black uppercase tracking-tight">Active Insight Matrix</h4>
                    <div className="space-y-4">
                       {[
                         { icon: Globe, label: 'Global Reach', value: '+142%', trend: 'up' },
                         { icon: PieChart, label: 'Share of Voice', value: '28.4%', trend: 'up' },
                         { icon: TrendingUp, label: 'Growth Curve', value: 'Exponential', trend: 'up' },
                       ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shadow-inner">
                                  <item.icon className="w-4 h-4 text-slate-400" />
                               </div>
                               <span className="text-[10px] font-black uppercase text-slate-500">{item.label}</span>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-black">{item.value}</p>
                               <span className="text-[8px] font-black text-emerald-500 uppercase flex items-center gap-0.5 justify-end"><ArrowUpRight className="w-2 h-2" /> 12%</span>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
