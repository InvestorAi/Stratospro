import React, { useState } from "react";
import { 
  ShieldAlert, 
  Search, 
  TrendingUp, 
  Zap, 
  Layout, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye,
  Globe,
  Plus,
  RefreshCw,
  MoreVertical,
  Activity,
  Flame,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

interface Competitor {
  id: string;
  name: string;
  handle: string;
  platform: 'twitter' | 'instagram' | 'linkedin';
  followers: number;
  growthRate: number;
  avgEngagement: number;
  viralScore: number;
}

const mockCompetitors: Competitor[] = [
  { id: '1', name: 'Nexus Competitor', handle: '@nexus_rival', platform: 'twitter', followers: 154000, growthRate: 12.4, avgEngagement: 3.2, viralScore: 88 },
  { id: '2', name: 'Alpha Agency', handle: 'alpha_hq', platform: 'instagram', followers: 89000, growthRate: -2.1, avgEngagement: 4.8, viralScore: 45 },
  { id: '3', name: 'Future Global', handle: 'future-global', platform: 'linkedin', followers: 42000, growthRate: 24.8, avgEngagement: 5.1, viralScore: 92 },
];

const growthData = [
  { name: 'W1', competitor: 4000, market: 2400 },
  { name: 'W2', competitor: 3000, market: 1398 },
  { name: 'W3', competitor: 2000, market: 9800 },
  { name: 'W4', competitor: 2780, market: 3908 },
  { name: 'W5', competitor: 1890, market: 4800 },
  { name: 'W6', competitor: 2390, market: 3800 },
];

interface CompetitorIntelligenceProps {
  onNavigate?: (tab: string) => void;
}

export default function CompetitorIntelligence({ onNavigate }: CompetitorIntelligenceProps) {
  const [activeComp, setActiveComp] = useState<Competitor | null>(mockCompetitors[0]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Market Intelligence Hub</h2>
          <p className="text-slate-500 font-bold">Autonomous competitor tracking and viral post detection matrix.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSync}
            className="px-6 py-4 nm-flat rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest text-orange-600 hover:scale-105 transition-all"
          >
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} /> 
            {isSyncing ? 'Synchronizing Nodes...' : 'Neural Scan Platform'}
          </button>
          <button className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:scale-105 transition-all flex items-center gap-3">
             <Plus className="w-5 h-5" /> Add Competitor Node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Competitor List */}
        <div className="lg:col-span-1 space-y-4">
           <div className="p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input placeholder="Filter rivals..." className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase w-full" />
           </div>
           
           <div className="space-y-3">
              {mockCompetitors.map(comp => (
                <button 
                  key={comp.id}
                  onClick={() => setActiveComp(comp)}
                  className={cn(
                    "w-full p-6 nm-flat rounded-[2.5rem] flex flex-col gap-3 transition-all border border-transparent text-left",
                    activeComp?.id === comp.id ? "nm-inset border-orange-500/20" : "hover:scale-[1.02]"
                  )}
                >
                  <div className="flex justify-between items-start">
                     <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-black shadow-inner">
                        {comp.name.charAt(0)}
                     </div>
                     <div className={cn(
                       "flex items-center gap-1 text-[9px] font-black uppercase",
                       comp.growthRate > 0 ? "text-emerald-500" : "text-rose-500"
                     )}>
                        {comp.growthRate > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(comp.growthRate)}%
                     </div>
                  </div>
                  <div>
                     <h4 className="text-sm font-black uppercase tracking-tight">{comp.name}</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{comp.handle}</p>
                  </div>
                </button>
              ))}
           </div>
        </div>

        {/* Intelligence Details */}
        <div className="lg:col-span-3 space-y-8">
           {activeComp ? (
             <AnimatePresence mode="wait">
                <motion.div 
                  key={activeComp.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                   {/* Main Stats Banner */}
                   <div className="nm-flat p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-5">
                         <ShieldAlert className="w-48 h-48" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Follower Cloud</p>
                            <h3 className="text-4xl font-black tracking-tighter">{(activeComp.followers / 1000).toFixed(1)}K</h3>
                            <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                               <TrendingUp className="w-3 h-3" /> Growth High
                            </span>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Avg Engagement</p>
                            <h3 className="text-4xl font-black tracking-tighter">{activeComp.avgEngagement}%</h3>
                            <div className="h-1.5 w-full nm-inset rounded-full bg-slate-100 dark:bg-slate-900 mt-2">
                               <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${activeComp.avgEngagement * 10}%` }} />
                            </div>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Viral Velocity</p>
                            <h3 className="text-4xl font-black tracking-tighter">{activeComp.viralScore}</h3>
                            <span className="text-[10px] font-black text-orange-600 uppercase flex items-center gap-1">
                               <Zap className="w-3 h-3" /> Extreme Risk
                            </span>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scan Health</p>
                            <div className="flex items-center gap-3 pt-2">
                               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                               <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">Active Node</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Analysis Section */}
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Detection Feed */}
                      <div className="nm-flat p-8 rounded-[3rem] space-y-6">
                         <div className="flex justify-between items-center px-2">
                            <h4 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                               <Flame className="w-4 h-4 text-orange-600" /> Viral Detection Feed
                            </h4>
                            <div className="flex gap-4">
                               <button 
                                 onClick={() => onNavigate?.('alerts')}
                                 className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
                               >
                                 View All Alerts
                               </button>
                               <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-orange-600 transition-colors">See Ad Library</button>
                            </div>
                         </div>
                         
                         <div className="space-y-4">
                            {[
                              { label: 'High Engagement Alert', content: 'Our rival just posted a case study with 4.5x normal engagement.', time: '14m ago', status: 'critical' },
                              { label: 'Ad Campaign Launched', content: 'Detected 12 new creative variants in Meta Ad Library.', time: '2h ago', status: 'alert' },
                              { label: 'Trend Shift Detected', content: 'Competitor pivot detected: increased focus on EdTech content.', time: '3h ago', status: 'info' },
                            ].map((alert, i) => (
                              <div key={i} className="nm-inset p-5 rounded-2xl bg-white dark:bg-black/20 border border-slate-100 dark:border-white/5 flex gap-4">
                                 <div className={cn(
                                   "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center",
                                   alert.status === 'critical' ? 'bg-rose-100 text-rose-600' : 
                                   alert.status === 'alert' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                 )}>
                                    <Activity className="w-5 h-5" />
                                 </div>
                                 <div className="space-y-1">
                                    <h5 className="text-[10px] font-black uppercase leading-none">{alert.label}</h5>
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">{alert.content}</p>
                                    <span className="text-[8px] font-black text-slate-400 uppercase">{alert.time}</span>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Growth Matrix */}
                      <div className="nm-flat p-8 rounded-[3rem] space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <h4 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                               <Target className="w-4 h-4 text-indigo-600" /> Growth Trajectory
                            </h4>
                            <span className="px-3 py-1 nm-inset rounded-lg text-[8px] font-black uppercase text-indigo-600">Weekly Pulse</span>
                        </div>
                        <div className="h-64 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={growthData}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                 <XAxis dataKey="name" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} />
                                 <Tooltip />
                                 <Bar dataKey="competitor" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={24} />
                                 <Bar dataKey="market" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={24} />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-8 pt-4">
                           <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-indigo-600" />
                              <span className="text-[10px] font-black uppercase text-slate-400">Target Rival</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-orange-600" />
                              <span className="text-[10px] font-black uppercase text-slate-400">Market Average</span>
                           </div>
                        </div>
                      </div>
                   </div>

                   {/* Ad Library Monitor */}
                   <div className="nm-flat p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5">
                      <div className="flex justify-between items-center mb-8">
                         <div>
                            <h4 className="text-xl font-black uppercase tracking-tighter">Meta Ad Matrix Monitor</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Real-time surveillance of active campaign nodes</p>
                         </div>
                         <button className="p-4 nm-button rounded-2xl text-slate-400 hover:text-indigo-600">
                            <Layout className="w-5 h-5" />
                         </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {[1, 2, 3].map(i => (
                           <div key={i} className="nm-inset p-2 rounded-[2rem] bg-white dark:bg-black/20 group">
                              <div className="aspect-[4/5] rounded-[1.8rem] bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">STAGED CREATIVE</p>
                                    <h5 className="text-sm font-black text-white uppercase leading-tight">Optimization variant {i} detected</h5>
                                 </div>
                                 <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">ACTIVE</div>
                              </div>
                              <div className="p-6 space-y-3">
                                 <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Estimated Reach</span>
                                    <span className="text-xs font-black">2.4M - 5M</span>
                                 </div>
                                 <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Creative Score</span>
                                    <div className="flex gap-1">
                                       {[1, 2, 3, 4, 5].map(star => (
                                         <div key={star} className={cn("w-1.5 h-1.5 rounded-full", star <= 4 ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-800")} />
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </motion.div>
             </AnimatePresence>
           ) : (
             <div className="h-[600px] nm-flat rounded-[3.5rem] flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                <Target className="w-24 h-24 text-slate-200" />
                <div className="space-y-2">
                   <h3 className="text-2xl font-black uppercase tracking-tighter">Strategic Identification Required</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Initialize a competitor monitor from the matrix to begin surveillance.</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function CartesianGrid(props: any) {
  const { strokeDasharray, vertical, strokeOpacity } = props;
  return (
    <g>
      {/* Simulation of a grid since full Recharts setup is complex for small snippets */}
    </g>
  );
}
