import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Search, Download, Share2, Filter, Globe, Zap } from "lucide-react";
import { motion } from "motion/react";

const data = [
  { name: 'Jan', value: 400, growth: 240 },
  { name: 'Feb', value: 300, growth: 139 },
  { name: 'Mar', value: 600, growth: 380 },
  { name: 'Apr', value: 800, growth: 430 },
  { name: 'May', value: 900, growth: 600 },
];

const platformData = [
  { name: 'Twitter', value: 45 },
  { name: 'LinkedIn', value: 30 },
  { name: 'Instagram', value: 15 },
  { name: 'Others', value: 10 },
];

const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74'];

export default function AnalyticsHub() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase">Deep Analytics</h2>
          <p className="text-slate-500 font-bold">Uncovering subterranean growth patterns across your Empire.</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-3 nm-button rounded-xl flex items-center gap-2 font-bold text-slate-500">
             <Filter className="w-4 h-4" /> Dimension
           </button>
           <button className="px-8 py-3 bg-orange-600 text-white rounded-xl flex items-center gap-2 font-black shadow-lg">
             <Download className="w-5 h-5" /> Export Intelligence
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Analysis */}
        <div className="lg:col-span-2 nm-flat p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#1e1e24]">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-tight">Growth Velocity</h3>
              <div className="flex items-center gap-2 text-orange-500 font-black italic">
                <Zap className="w-4 h-4" /> +24% Acceleration
              </div>
           </div>
           <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                 <defs>
                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} />
                 <YAxis axisLine={false} tickLine={false} />
                 <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                 />
                 <Area type="monotone" dataKey="value" stroke="#ea580c" fillOpacity={1} fill="url(#colorValue)" strokeWidth={4} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Platform Share */}
        <div className="nm-flat p-8 rounded-[2.5rem] flex flex-col">
           <h3 className="text-xl font-black uppercase tracking-tight mb-8 text-center">Market Dominance</h3>
           <div className="h-64 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="grid grid-cols-2 gap-4 mt-4">
              {platformData.map((p, i) => (
                <div key={p.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs font-bold text-slate-500">{p.name}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Global Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Global Presence", val: "14 Countries", icon: Globe, detail: "Expanding to Asia Q3" },
          { label: "Audience Trust", val: "98.2%", icon: Zap, detail: "Based on sentiment AI" },
          { label: "Viral Prob.", val: "Low-Risk", icon: TrendingUp, detail: "Adaptive buffer active" },
          { label: "Data Quality", val: "Tier 1", icon: Users, detail: "No ghost identities" },
        ].map((card, i) => (
          <motion.div 
            whileHover={{ y: -5 }}
            key={i} 
            className="nm-inset p-8 rounded-[2rem] space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl nm-button flex items-center justify-center text-orange-600">
               <card.icon className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
               <h4 className="text-2xl font-black">{card.val}</h4>
            </div>
            <p className="text-[10px] font-bold text-slate-400 italic">{card.detail}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
