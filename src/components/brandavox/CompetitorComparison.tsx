import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert,
  Bell,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Activity,
  Plus,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Music2,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line,
  CartesianGrid
} from "recharts";

const comparisonData = [
  { name: 'Jan', MyBrand: 4000, Rival_A: 2400, Rival_B: 2400 },
  { name: 'Feb', MyBrand: 3000, Rival_A: 1398, Rival_B: 2210 },
  { name: 'Mar', MyBrand: 2000, Rival_A: 9800, Rival_B: 2290 },
  { name: 'Apr', MyBrand: 2780, Rival_A: 3908, Rival_B: 2000 },
  { name: 'May', MyBrand: 1890, Rival_A: 4800, Rival_B: 2181 },
  { name: 'Jun', MyBrand: 2390, Rival_A: 3800, Rival_B: 2500 },
  { name: 'Jul', MyBrand: 3490, Rival_A: 4300, Rival_B: 2100 },
];

const alerts = [
  { id: 1, type: 'critical', title: 'Viral Threshold Breached', content: 'Rival A engagement spikes 300% on new Reel.', time: '2m ago' },
  { id: 2, type: 'warning', title: 'Ad Strategy Shift', content: 'Future Global increased ad spend in "Enterprise" category.', time: '1h ago' },
  { id: 3, type: 'info', title: 'Follower Milestone', content: 'Alpha Agency reached 100k followers on Instagram.', time: '4h ago' },
];

const competitors = [
  { 
    id: 'MyBrand', 
    name: 'My Brand', 
    type: 'internal',
    socials: [
      { platform: 'twitter', handle: '@mybrand', icon: Twitter },
      { platform: 'instagram', handle: 'mybrand_hq', icon: Instagram },
      { platform: 'linkedin', handle: 'my-brand-inc', icon: Linkedin },
    ]
  },
  { 
    id: 'Rival_A', 
    name: 'Rival A', 
    type: 'competitor',
    socials: [
      { platform: 'twitter', handle: '@rival_a', icon: Twitter },
      { platform: 'facebook', handle: 'rival.a.global', icon: Facebook },
      { platform: 'linkedin', handle: 'rival-a-corp', icon: Linkedin },
    ]
  },
  { 
    id: 'Rival_B', 
    name: 'Rival B', 
    type: 'competitor',
    socials: [
      { platform: 'instagram', handle: 'rival_b_official', icon: Instagram },
      { platform: 'tiktok', handle: '@rival_b_tok', icon: Music2 },
    ]
  }
];

export default function CompetitorComparison() {
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>(['Rival_A', 'Rival_B']);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Side-by-Side Intelligence</h2>
          <p className="text-slate-500 font-bold">Direct performance benchmarking against market leaders.</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-4 nm-flat rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest text-orange-600 hover:scale-105 transition-all">
              <Plus className="w-4 h-4" /> Add Benchmarking Node
           </button>
        </div>
      </div>

      {/* Competitor Detail Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {competitors.map((comp) => (
           <div key={comp.id} className="nm-flat p-6 rounded-[2.5rem] flex flex-col gap-4 border border-transparent hover:border-orange-500/10 transition-colors">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-xl font-black uppercase leading-tight">{comp.name}</h3>
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                      comp.type === 'internal' ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"
                    )}>
                       {comp.type === 'internal' ? 'Target Node' : 'Competitor Matrix'}
                    </span>
                 </div>
                 <div className="nm-inset p-2 rounded-xl text-slate-400">
                    <Globe className="w-4 h-4" />
                 </div>
              </div>
              
              <div className="flex gap-2">
                 {comp.socials.map((social, i) => (
                   <a 
                     key={i} 
                     href={
                       social.platform === 'twitter' ? `https://twitter.com/${social.handle.replace('@', '')}` :
                       social.platform === 'instagram' ? `https://instagram.com/${social.handle.replace('@', '')}` :
                       social.platform === 'linkedin' ? `https://linkedin.com/company/${social.handle.replace('@', '')}` :
                       social.platform === 'facebook' ? `https://facebook.com/${social.handle.replace('@', '')}` :
                       `https://tiktok.com/${social.handle.startsWith('@') ? social.handle : '@' + social.handle}`
                     } 
                     target="_blank"
                     rel="noreferrer"
                     title={`${social.platform}: ${social.handle}`}
                     className="p-3 nm-button rounded-xl text-slate-400 hover:text-orange-600 transition-all flex items-center justify-center"
                   >
                      <social.icon className="w-4 h-4" />
                   </a>
                 ))}
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Comparison Dashboard */}
        <div className="lg:col-span-8 space-y-8">
           {/* Metric Cards Comparison */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Follower Growth', myBrand: '+12.4%', rivalA: '+8.2%', rivalB: '-1.5%', icon: TrendingUp },
                { label: 'Engagement Rate', myBrand: '4.8%', rivalA: '3.2%', rivalB: '5.1%', icon: Zap },
                { label: 'Content Velocity', myBrand: '12/wk', rivalA: '8/wk', rivalB: '15/wk', icon: Activity },
              ].map((metric, i) => (
                <div key={i} className="nm-flat p-8 rounded-[3rem] space-y-6 relative overflow-hidden">
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{metric.label}</h4>
                      <metric.icon className="w-4 h-4 text-slate-300" />
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <span className="text-[8px] font-black uppercase text-slate-400">My Brand</span>
                         <span className="text-xl font-black text-orange-600 leading-none">{metric.myBrand}</span>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                         <div className="flex justify-between text-[8px] font-black uppercase">
                            <span className="text-indigo-600">Rival A</span>
                            <span className="text-slate-500">{metric.rivalA}</span>
                         </div>
                         <div className="flex justify-between text-[8px] font-black uppercase">
                            <span className="text-rose-500">Rival B</span>
                            <span className="text-slate-500">{metric.rivalB}</span>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {/* Performance Timeline */}
           <div className="nm-flat p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 min-h-[450px]">
              <div className="flex justify-between items-center mb-10 text-left">
                 <div>
                    <h4 className="text-2xl font-black uppercase tracking-tighter">Growth Trajectory Matrix</h4>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Multi-competitor performance synthesis</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 nm-inset rounded-xl">
                       <div className="w-2 h-2 rounded-full bg-orange-600" />
                       <span className="text-[9px] font-black uppercase text-slate-500">My Brand</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 nm-inset rounded-xl">
                       <div className="w-2 h-2 rounded-full bg-indigo-600" />
                       <span className="text-[9px] font-black uppercase text-slate-500">Rival A</span>
                    </div>
                 </div>
              </div>
              <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={comparisonData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                       <XAxis dataKey="name" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} />
                       <YAxis fontSize={10} fontWeight={900} tickLine={false} axisLine={false} />
                       <Tooltip 
                         contentStyle={{ 
                           backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                           borderRadius: '1rem', 
                           border: 'none', 
                           boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                           fontSize: '10px',
                           fontWeight: 'bold'
                         }} 
                       />
                       <Line 
                         type="monotone" 
                         dataKey="MyBrand" 
                         stroke="#ea580c" 
                         strokeWidth={4} 
                         dot={{ fill: '#ea580c', strokeWidth: 2, r: 4 }} 
                         activeDot={{ r: 8, strokeWidth: 0 }}
                       />
                       <Line 
                         type="monotone" 
                         dataKey="Rival_A" 
                         stroke="#4f46e5" 
                         strokeWidth={3} 
                         strokeDasharray="5 5"
                         dot={false}
                       />
                       <Line 
                         type="monotone" 
                         dataKey="Rival_B" 
                         stroke="#f43f5e" 
                         strokeWidth={3} 
                         strokeDasharray="3 3"
                         dot={false}
                       />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Alerting Matrix */}
        <div className="lg:col-span-4 space-y-8">
           <div className="nm-flat p-8 rounded-[3rem] space-y-8 h-full bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Bell className="w-32 h-32 rotate-12" />
              </div>
              
              <div className="space-y-2 relative z-10">
                 <h3 className="text-2xl font-black uppercase tracking-tighter">Intelligence Alerts</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time threat & opportunity detection</p>
              </div>

              <div className="space-y-4 relative z-10">
                 {alerts.map(alert => (
                   <motion.div 
                     key={alert.id}
                     whileHover={{ x: 5 }}
                     className="p-5 nm-inset rounded-2xl bg-black/40 border border-white/5 space-y-2 group cursor-pointer"
                   >
                      <div className="flex justify-between items-center">
                         <span className={cn(
                           "px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                           alert.type === 'critical' ? 'bg-rose-500 text-white' : 
                           alert.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white'
                         )}>
                            {alert.type}
                         </span>
                         <span className="text-[8px] font-black text-slate-500 uppercase">{alert.time}</span>
                      </div>
                      <h5 className="text-[11px] font-black uppercase group-hover:text-orange-500 transition-colors">{alert.title}</h5>
                      <p className="text-[11px] font-bold text-slate-400 leading-tight">{alert.content}</p>
                   </motion.div>
                 ))}
              </div>

              <div className="pt-8 relative z-10">
                 <button className="w-full py-5 nm-flat bg-orange-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-orange-600/30 hover:scale-[1.02] active:scale-95 transition-all">
                    Configure Notification Nodes
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
