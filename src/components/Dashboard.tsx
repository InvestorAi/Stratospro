import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Target, 
  ArrowUpRight, 
  MessageCircle,
  BrainCircuit,
  Mic2,
  PenTool,
  Sparkles,
  Activity,
  BarChart3,
  Globe,
  Clock,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { cn } from "../lib/utils";

const mockData = [
  { name: "Mon", reach: 4000, engagement: 2400 },
  { name: "Tue", reach: 3000, engagement: 1398 },
  { name: "Wed", reach: 2000, engagement: 9800 },
  { name: "Thu", reach: 2780, engagement: 3908 },
  { name: "Fri", reach: 1890, engagement: 4800 },
  { name: "Sat", reach: 2390, engagement: 3800 },
  { name: "Sun", reach: 3490, engagement: 4300 },
];

import { generateInvoice } from "../lib/utils";

interface DashboardProps {
  user: UserProfile | null;
  onNavigate?: (tab: string) => void;
}

import { EncryptionService } from "../lib/security/encryption";

const ROOM_KEY = "NEXURA_GLOBAL_NERVE_SECURE";

export default function Dashboard({ user, onNavigate }: DashboardProps) {
  const handleAutoInvoice = () => {
    generateInvoice({
      name: "Tech Sam",
      email: "sam@techcorp.com",
      amount: "2,500.00",
      services: ["Social Media Management (Premium)", "4x AI Video Assets", "Monthly Reporting"]
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* AI Quick Actions Accelerator */}
      <div className="nm-flat p-8 rounded-[3rem] border border-orange-500/10 bg-slate-50 dark:bg-slate-900/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-orange-600 animate-pulse" /> Neural Accelerator
              </h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Instant Creative Synthesis Engine</p>
           </div>
           <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => onNavigate?.('ai_studio_content')}
                className="nm-button px-6 py-4 rounded-2xl flex items-center gap-3 hover:scale-105 transition-all text-indigo-600 bg-white dark:bg-slate-900"
              >
                <BrainCircuit className="w-5 h-5" />
                <span className="font-black text-xs uppercase tracking-widest">Content Generator</span>
              </button>
              <button 
                onClick={() => onNavigate?.('ai_studio_image')}
                className="nm-button px-6 py-4 rounded-2xl flex items-center gap-3 hover:scale-105 transition-all text-orange-600 bg-white dark:bg-slate-900"
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-black text-xs uppercase tracking-widest">8K Image Lab</span>
              </button>
              <button 
                onClick={() => onNavigate?.('ai_studio_voice')}
                className="nm-button px-6 py-4 rounded-2xl flex items-center gap-3 hover:scale-105 transition-all text-amber-600 bg-white dark:bg-slate-900"
              >
                <Mic2 className="w-5 h-5" />
                <span className="font-black text-xs uppercase tracking-widest">Voice Synthesis</span>
              </button>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
        {[
          { label: "Total Revenue", value: "₦21,177.5", icon: BarChart3, color: "bg-orange-600/10 text-orange-600", trend: "+12%" },
          { label: "Transactions", value: "845", icon: Activity, color: "bg-emerald-600/10 text-emerald-600", trend: "+5.4%" },
          { label: "My Brands", value: "12", icon: Globe, color: "bg-indigo-600/10 text-indigo-600", trend: "+2" },
          { label: "Neural Reach", value: "3.4M", icon: Sparkles, color: "bg-purple-600/10 text-purple-600", trend: "+0.8%" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="nm-flat p-6 rounded-3xl flex items-center gap-6"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
              {stat.trend && (
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 mt-1">
                   <ArrowUpRight className="w-3 h-3" /> {stat.trend}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 nm-flat p-8 rounded-3xl min-h-[400px] border border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Performance Overview</h3>
            <div className="flex gap-2">
               <button className="px-5 py-2 nm-inset text-xs font-black rounded-xl text-orange-600 dark:text-orange-400">7 Days</button>
               <button className="px-5 py-2 nm-button text-xs font-black rounded-xl opacity-50 dark:text-white text-slate-950">30 Days</button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }} 
                />
                <Bar dataKey="reach" fill="#ea580c" radius={[10, 10, 0, 0]} />
                <Bar dataKey="engagement" fill="#f97316" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="nm-flat p-8 rounded-3xl border border-slate-100 dark:border-white/5 flex flex-col">
          <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-6">Social Health</h3>
          <div className="space-y-6 flex-1">
            {[
              { platform: "Twitter", health: 92, status: "Peak", color: "text-sky-500" },
              { platform: "Instagram", health: 78, status: "Averaging", color: "text-pink-500" },
              { platform: "LinkedIn", health: 45, status: "Dip Detected", color: "text-blue-700" },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 nm-inset rounded-2xl">
                 <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", p.health > 80 ? "bg-emerald-500" : (p.health > 60 ? "bg-amber-500" : "bg-rose-500"))} />
                    <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">{p.platform}</span>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-black">{p.health}%</p>
                    <p className={cn("text-[8px] font-bold uppercase", p.color)}>{p.status}</p>
                 </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onNavigate?.('inbox')}
            className="w-full mt-6 py-4 nm-button rounded-2xl text-[10px] font-black uppercase text-orange-600 hover:scale-[1.02] transition-transform"
          >
            Optimize Engagement
          </button>
        </div>
      </div>

    {/* Lower Row: Velocity Analytics */}
      <div className="grid grid-cols-1 gap-8">
         <div className="nm-flat p-8 rounded-3xl relative overflow-hidden group">
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Campaign Velocity</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Growth Acceleration Track</p>
              </div>
              <button 
                onClick={handleAutoInvoice}
                className="nm-button px-6 py-3 rounded-xl text-orange-600 font-black text-xs uppercase"
              >
                Auto-Optimize
              </button>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', backgroundColor: '#1e1e24', color: '#fff' }}
                    itemStyle={{ color: '#ea580c' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#ea580c" 
                    strokeWidth={4} 
                    dot={false}
                    animateNewValues
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reach" 
                    stroke="#f97316" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600/0 via-orange-600 to-orange-600/0 opacity-20" />
         </div>
      </div>
    </div>
  );
}
