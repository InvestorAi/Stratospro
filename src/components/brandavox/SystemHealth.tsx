import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Cpu, 
  Database, 
  Zap, 
  Layers, 
  Server, 
  Globe, 
  ShieldCheck, 
  Clock, 
  BarChart3,
  RefreshCcw,
  ArrowUpRight,
  Wifi,
  HardDrive
} from "lucide-react";
import { motion } from "motion/react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from "../../lib/utils";

interface Metrics {
  uptime: number;
  memory: {
    heapTotal: string;
    heapUsed: string;
    rss: string;
  };
  queue: {
    length: number;
    processed: number;
  };
  cache: {
    size: number;
    remaining: number;
  };
}

interface NodeStatus {
  status: string;
  node: string;
  scaling: string;
  loadBalancer: string;
  database: {
    primary: string;
    replicas: number;
    region: string;
  };
}

export default function SystemHealth() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [nodeStatus, setNodeStatus] = useState<NodeStatus | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'vitality' | 'infrastructure' | 'queues'>('vitality');

  const fetchMetrics = async () => {
    try {
      const [mRes, hRes] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/health')
      ]);
      const mData = await mRes.json();
      const hData = await hRes.json();
      
      setMetrics(mData);
      setNodeStatus(hData);
      
      setHistory(prev => {
        const next = [...prev, {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          used: parseInt(mData.memory.heapUsed),
          queue: mData.queue.length
        }].slice(-20);
        return next;
      });
    } catch (err) {
      console.error("Failed to fetch system metrics", err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const timer = setInterval(fetchMetrics, 3000);
    return () => clearInterval(timer);
  }, []);

  const triggerJob = async () => {
    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'NEURAL_SYNTHESIS', data: { intensity: 'high' } })
      });
      fetchMetrics();
    } catch (err) {
      console.error("Failed to trigger job", err);
    }
  };

  if (!metrics || !nodeStatus) return (
    <div className="flex items-center justify-center h-[50vh]">
       <RefreshCcw className="w-8 h-8 animate-spin text-orange-600" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 text-left">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Infrastructure Core</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Matrix Vitality & Scaling Controls</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={triggerJob}
             className="px-8 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/30 hover:scale-105 transition-all flex items-center gap-3"
           >
             <Zap className="w-4 h-4" /> Inject High Load Job
           </button>
           <button className="p-4 nm-button rounded-2xl text-slate-400">
             <RefreshCcw className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Real-time Vitality Monitor */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="nm-flat p-8 rounded-[2.5rem] space-y-4">
                <div className="flex justify-between items-start">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                      <Cpu className="w-6 h-6" />
                   </div>
                   <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-100 px-2 py-1 rounded">Optimal</span>
                </div>
                <div>
                   <h4 className="text-3xl font-black">{metrics.memory.heapUsed}<span className="text-lg font-bold text-slate-400">/{metrics.memory.heapTotal}</span></h4>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Heap Allocation</p>
                </div>
             </div>

             <div className="nm-flat p-8 rounded-[2.5rem] space-y-4">
                <div className="flex justify-between items-start">
                   <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                      <Layers className="w-6 h-6" />
                   </div>
                   <span className="text-[8px] font-black uppercase text-orange-500 bg-orange-100 px-2 py-1 rounded">Processing</span>
                </div>
                <div>
                   <h4 className="text-3xl font-black">{metrics.queue.length}<span className="text-lg font-bold text-slate-400"> Active</span></h4>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Background Job Queue</p>
                </div>
             </div>

             <div className="nm-flat p-8 rounded-[2.5rem] space-y-4">
                <div className="flex justify-between items-start">
                   <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 text-sky-600 flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                   </div>
                   <span className="text-[8px] font-black uppercase text-sky-500 bg-sky-100 px-2 py-1 rounded">Hit Rate 94%</span>
                </div>
                <div>
                   <h4 className="text-3xl font-black">{metrics.cache.size}<span className="text-lg font-bold text-slate-400"> Nodes</span></h4>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Adaptive LRU Cache</p>
                </div>
             </div>
          </div>

          <div className="nm-flat p-10 rounded-[3.5rem] space-y-8">
             <div className="flex justify-between items-center">
                <div className="space-y-1">
                   <h4 className="text-2xl font-black uppercase tracking-tight">Neural Vitality Graph</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Real-time memory & queue synchronization</p>
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-600" />
                      <span className="text-[10px] font-black uppercase">Heap Memory</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-600" />
                      <span className="text-[10px] font-black uppercase">Queue Depth</span>
                   </div>
                </div>
             </div>

             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorQueue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.1} />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        fontSize: '10px',
                        fontWeight: 900,
                        textTransform: 'uppercase'
                      }} 
                    />
                    <Area 
                      type="stepAfter" 
                      dataKey="used" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorUsed)" 
                      isAnimationActive={false}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="queue" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorQueue)" 
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Infrastructure Sidebar */}
        <div className="space-y-8">
           <div className="nm-flat p-8 rounded-[3rem] space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Configuration</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <Server className="w-4 h-4 text-orange-600" />
                       <span className="text-xs font-black uppercase tracking-tighter">Active Instance</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-500">{nodeStatus.node}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <Globe className="w-4 h-4 text-orange-600" />
                       <span className="text-xs font-black uppercase tracking-tighter">Deployment</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase">Cloud Run</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="w-4 h-4 text-orange-600" />
                       <span className="text-xs font-black uppercase tracking-tighter">Availability</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase">99.99% E2E</span>
                 </div>
              </div>
              <div className="h-px bg-slate-100 dark:bg-white/5" />
              <button className="w-full py-4 nm-button bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                 View Global Logs
              </button>
           </div>

           <div className="nm-flat p-8 rounded-[3rem] space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Database Ecosystem</h4>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="p-3 nm-inset rounded-xl">
                       <Database className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-tight">Main Cluster</p>
                       <p className="text-xs font-bold text-slate-400">Firestore Ent.</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                       <span>Replica Synchronization</span>
                       <span className="text-emerald-500">Async-High</span>
                    </div>
                    <div className="flex gap-1.5">
                       {[...Array(nodeStatus.database.replicas)].map((_, i) => (
                         <div key={i} className="h-2 flex-1 nm-inset rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 1, delay: i * 0.2 }}
                              className="h-full bg-emerald-500" 
                            />
                         </div>
                       ))}
                       <div className="h-2 flex-1 nm-inset rounded-full bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <p className="text-[8px] font-black text-slate-400 uppercase text-center mt-2">Active Multi-Regional Replicas</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
