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
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

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
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats", "global-nerve", "messages"),
      orderBy("timestamp", "desc"),
      limit(4)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => {
        const data = doc.data();
        const text = data.isEncrypted 
          ? EncryptionService.decrypt(data.cipherText || "", ROOM_KEY)
          : data.text;
          
        return {
          id: doc.id,
          ...data,
          text: text ? (text.length > 40 ? text.substring(0, 40) + '...' : text) : '[[ENCRYPTED]]'
        };
      });
      setRecentActivity(activities);
    });

    return () => unsubscribe();
  }, [user]);

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
                onClick={() => onNavigate?.('ai_studio')}
                className="nm-button px-6 py-4 rounded-2xl flex items-center gap-3 hover:scale-105 transition-all text-orange-600 bg-white dark:bg-slate-900"
              >
                <BrainCircuit className="w-5 h-5" />
                <span className="font-black text-xs uppercase tracking-widest">8K Image Lab</span>
              </button>
              <button 
                onClick={() => onNavigate?.('ai_studio')}
                className="nm-button px-6 py-4 rounded-2xl flex items-center gap-3 hover:scale-105 transition-all text-amber-600 bg-white dark:bg-slate-900"
              >
                <Mic2 className="w-5 h-5" />
                <span className="font-black text-xs uppercase tracking-widest">Voice Synthesis</span>
              </button>
              <button 
                onClick={() => onNavigate?.('editor')}
                className="nm-button px-6 py-4 rounded-2xl flex items-center gap-3 hover:scale-105 transition-all text-slate-950 dark:text-white bg-white dark:bg-slate-900"
              >
                <PenTool className="w-5 h-5" />
                <span className="font-black text-xs uppercase tracking-widest">Photoshop Pro</span>
              </button>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Reach", value: "1.2M", icon: Eye, color: "text-blue-500", trend: "+12%" },
          { label: "Engagement", value: "84.5K", icon: Target, color: "text-rose-500", trend: "+5.4%" },
          { label: "Active Clients", value: "12", icon: Users, color: "text-orange-500", trend: "+2" },
          { label: "Conversions", value: "3.4%", icon: TrendingUp, color: "text-amber-500", trend: "+0.8%" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="nm-flat p-6 rounded-3xl space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl nm-inset ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
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

        <div className="nm-flat p-8 rounded-3xl border border-slate-100 dark:border-white/5">
          <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight mb-6">Recent Campaigns</h3>
          <div className="space-y-6">
            {[
              { name: "Summer Launch", progress: 85, status: "Active", color: "bg-orange-600" },
              { name: "Brand Refresh", progress: 40, status: "Draft", color: "bg-amber-500" },
              { name: "Annual Gala", progress: 100, status: "Completed", color: "bg-orange-500" },
            ].map((c, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-black text-slate-900 dark:text-slate-100 uppercase">{c.name}</span>
                  <span className="text-slate-600 dark:text-slate-400 font-bold">{c.progress}%</span>
                </div>
                <div className="h-3 w-full nm-inset rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${c.progress}%` }}
                    className={`h-full ${c.color}`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Messages & Auto-deals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="nm-flat p-8 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase text-slate-950 dark:text-white tracking-tight">Nerve Activity</h3>
              <div className="flex gap-1">
                 {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
              </div>
            </div>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={item.id} 
                    className="nm-inset p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest truncate">{item.senderName}</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white tracking-tighter truncate">{item.text}</p>
                    </div>
                    <div className="text-[8px] font-black text-slate-400 uppercase whitespace-nowrap bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                       {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-12 space-y-4">
                     <Activity className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto animate-pulse" />
                     <p className="text-xs font-black text-slate-400 uppercase">Listening for Nerve activity...</p>
                  </div>
                )}
              </AnimatePresence>
              {recentActivity.length > 0 && (
                <button 
                  onClick={() => onNavigate?.('chat')}
                  className="w-full py-3 nm-button rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-orange-600 transition-colors"
                >
                  Join the Live Nerve
                </button>
              )}
            </div>
         </div>

         <div className="lg:col-span-2 nm-flat p-8 rounded-3xl relative overflow-hidden group">
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
