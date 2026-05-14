import React, { useState, useMemo } from "react";
import { 
  Twitter, 
  Instagram, 
  Linkedin, 
  Facebook,
  Music2,
  TrendingUp, 
  Zap, 
  Flame, 
  Activity, 
  Calendar,
  Clock,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

interface Post {
  id: string;
  platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok';
  content: string;
  timestamp: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  isViral: boolean;
  engagementRate: number;
}

interface Competitor {
  id: string;
  name: string;
  handle: string;
  postsPerWeek: number;
  platformDistribution: { platform: string; count: number }[];
  recentPosts: Post[];
}

const mockCompetitors: Competitor[] = [
  {
    id: '1',
    name: 'Nexus Rivals',
    handle: '@nexusrvals',
    postsPerWeek: 42,
    platformDistribution: [
      { platform: 'twitter', count: 28 },
      { platform: 'instagram', count: 10 },
      { platform: 'linkedin', count: 4 },
      { platform: 'facebook', count: 6 },
      { platform: 'tiktok', count: 12 },
    ],
    recentPosts: [
      {
        id: 'p1',
        platform: 'twitter',
        content: "Just launched our new neural framework. The engagement is through the roof! #AI #Innovation",
        timestamp: '2h ago',
        engagement: { likes: 1200, comments: 45, shares: 320 },
        isViral: true,
        engagementRate: 8.5
      },
      {
        id: 'p2',
        platform: 'tiktok',
        content: "Neural Framework Reveal ⚡️ #techtok #automation #future",
        timestamp: '3h ago',
        engagement: { likes: 5400, comments: 230, shares: 890 },
        isViral: true,
        engagementRate: 15.2
      },
      {
        id: 'p_fb_1',
        platform: 'facebook',
        content: "Our latest case study on how agency 'Alpha' scaled 10x using our platform. Full link in bio. #Growth",
        timestamp: '4h ago',
        engagement: { likes: 320, comments: 15, shares: 42 },
        isViral: false,
        engagementRate: 1.8
      },
      {
        id: 'p2_old',
        platform: 'instagram',
        content: "Our team working late to bring you the best experience. 🚀",
        timestamp: '5h ago',
        engagement: { likes: 850, comments: 12, shares: 5 },
        isViral: false,
        engagementRate: 2.1
      },
      {
        id: 'p3',
        platform: 'linkedin',
        content: "Why B2B marketing is shifting towards emotional storytelling. Direct insights from our CMO.",
        timestamp: '1d ago',
        engagement: { likes: 450, comments: 88, shares: 120 },
        isViral: false,
        engagementRate: 5.2
      }
    ]
  },
  {
    id: '2',
    name: 'Alpha Agency',
    handle: '@alpha_hq',
    postsPerWeek: 15,
    platformDistribution: [
      { platform: 'twitter', count: 5 },
      { platform: 'instagram', count: 8 },
      { platform: 'linkedin', count: 2 },
    ],
    recentPosts: [
      {
        id: 'p4',
        platform: 'instagram',
        content: "The future of branding is decentralized. Do you agree?",
        timestamp: '10h ago',
        engagement: { likes: 2400, comments: 340, shares: 1100 },
        isViral: true,
        engagementRate: 12.4
      }
    ]
  }
];

export default function CompetitorContentTracker() {
  const [selectedCompId, setSelectedCompId] = useState(mockCompetitors[0].id);
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok'>('all');

  const selectedComp = useMemo(() => 
    mockCompetitors.find(c => c.id === selectedCompId) || mockCompetitors[0],
    [selectedCompId]
  );

  const filteredPosts = useMemo(() => 
    selectedComp.recentPosts.filter(p => filterPlatform === 'all' || p.platform === filterPlatform),
    [selectedComp, filterPlatform]
  );

  const viralPosts = useMemo(() => 
    selectedComp.recentPosts.filter(p => p.isViral),
    [selectedComp]
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Content Surveillance</h2>
          <p className="text-slate-500 font-bold">Automated rival content tracking and viral pattern analysis.</p>
        </div>
        
        <div className="flex gap-4">
           <div className="nm-flat p-1 rounded-xl flex gap-1">
              {mockCompetitors.map((c) => (
                <button 
                  key={c.id}
                  onClick={() => setSelectedCompId(c.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    selectedCompId === c.id ? "bg-orange-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {c.name}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Summary & Viral */}
        <div className="lg:col-span-4 space-y-8">
           {/* Posting Frequency Card */}
           <div className="nm-flat p-8 rounded-[2.5rem] space-y-6">
              <div className="flex justify-between items-center">
                 <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-600" /> Pulse Analysis
                 </h4>
                 <span className="text-[10px] font-black text-emerald-500 uppercase">Active Agent</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="nm-inset p-4 rounded-2xl bg-white dark:bg-black/20">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Posts / Week</p>
                    <h3 className="text-2xl font-black text-slate-950 dark:text-white">{selectedComp.postsPerWeek}</h3>
                 </div>
                 <div className="nm-inset p-4 rounded-2xl bg-white dark:bg-black/20">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Impact Velocity</p>
                    <h3 className="text-2xl font-black text-indigo-600">High</h3>
                 </div>
              </div>

              <div className="space-y-3">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Distribution</p>
                 <div className="space-y-2">
                    {selectedComp.platformDistribution.map((dist) => (
                      <div key={dist.platform} className="space-y-1">
                         <div className="flex justify-between text-[9px] font-black uppercase">
                            <span>{dist.platform}</span>
                            <span>{dist.count}</span>
                         </div>
                         <div className="h-1.5 w-full nm-inset bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                dist.platform === 'twitter' ? 'bg-sky-400' : 
                                dist.platform === 'instagram' ? 'bg-pink-500' : 
                                dist.platform === 'facebook' ? 'bg-blue-600' :
                                dist.platform === 'tiktok' ? 'bg-black' : 'bg-blue-700'
                              )} 
                              style={{ width: `${(dist.count / selectedComp.postsPerWeek) * 100}%` }} 
                            />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Viral Spotlight */}
           <div className="nm-flat p-8 rounded-[2.5rem] bg-orange-600 text-white space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Flame className="w-32 h-32 rotate-12" />
              </div>
              
              <div className="relative z-10">
                 <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Viral Spotlight
                 </h4>
                 <p className="text-[10px] font-black text-orange-200 uppercase tracking-widest mt-1">High Engagement Anomalies</p>
              </div>

              <div className="space-y-4 relative z-10">
                 {viralPosts.length > 0 ? viralPosts.map((post) => (
                   <div key={post.id} className="nm-inset p-4 rounded-2xl bg-black/20 border border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-2">
                            {post.platform === 'twitter' && <Twitter className="w-3 h-3" />}
                            {post.platform === 'instagram' && <Instagram className="w-3 h-3" />}
                            {post.platform === 'linkedin' && <Linkedin className="w-3 h-3" />}
                            {post.platform === 'facebook' && <Facebook className="w-3 h-3" />}
                            {post.platform === 'tiktok' && <Music2 className="w-3 h-3" />}
                            <span className="text-[8px] font-black uppercase">{post.platform}</span>
                         </div>
                         <span className="px-2 py-0.5 bg-orange-500 rounded-full text-[7px] font-black uppercase tracking-tighter">VIRAL: {post.engagementRate}% ER</span>
                      </div>
                      <p className="text-[11px] font-medium leading-tight line-clamp-2 italic">"{post.content}"</p>
                      <div className="flex justify-between items-center pt-2 border-t border-white/10">
                         <div className="flex gap-3 text-[9px] font-black">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.engagement.likes}</span>
                            <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> {post.engagement.shares}</span>
                         </div>
                         <button className="text-[8px] font-black uppercase hover:underline">Replicate Strategy</button>
                      </div>
                   </div>
                 )) : (
                   <p className="text-[10px] font-medium text-orange-100">No anomalous spikes detected in the last scan.</p>
                 )}
              </div>
           </div>
        </div>

        {/* Right Column: Feed Monitoring */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex justify-between items-center px-4">
              <div className="flex flex-wrap gap-4">
                 {['all', 'twitter', 'instagram', 'linkedin', 'facebook', 'tiktok'].map((p) => (
                   <button 
                     key={p}
                     onClick={() => setFilterPlatform(p as any)}
                     className={cn(
                       "text-[10px] font-black uppercase tracking-widest transition-all",
                       filterPlatform === p ? "text-orange-600 border-b-2 border-orange-600 pb-1" : "text-slate-400 hover:text-slate-600"
                     )}
                   >
                     {p}
                   </button>
                 ))}
              </div>
              <div className="nm-inset px-4 py-2 rounded-xl bg-slate-50 dark:bg-black/20 flex items-center gap-3">
                 <Search className="w-3 h-3 text-slate-400" />
                 <input placeholder="Search content vectors..." className="bg-transparent border-none focus:ring-0 text-[9px] font-black uppercase w-48" />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                 {filteredPosts.map((post) => (
                   <motion.div 
                     key={post.id}
                     layout
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.98 }}
                     className="nm-flat p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-transparent hover:border-orange-500/10 transition-all group"
                   >
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-2xl flex items-center justify-center text-white",
                              post.platform === 'twitter' ? 'bg-sky-400 shadow-sky-400/20' : 
                              post.platform === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 
                              post.platform === 'linkedin' ? 'bg-blue-700 shadow-blue-700/20' :
                              post.platform === 'facebook' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-black shadow-slate-900/40'
                            )}>
                               {post.platform === 'twitter' && <Twitter className="w-5 h-5" />}
                               {post.platform === 'instagram' && <Instagram className="w-5 h-5" />}
                               {post.platform === 'linkedin' && <Linkedin className="w-5 h-5" />}
                               {post.platform === 'facebook' && <Facebook className="w-5 h-5" />}
                               {post.platform === 'tiktok' && <Music2 className="w-5 h-5" />}
                            </div>
                            <div>
                               <h5 className="text-[10px] font-black uppercase text-slate-950 dark:text-white leading-none mb-1">{selectedComp.name}</h5>
                               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <Clock className="w-2 h-2" /> {post.timestamp}
                               </span>
                            </div>
                         </div>
                         {post.isViral && (
                            <div className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[8px] font-black uppercase animate-pulse">
                               Viral Alert
                            </div>
                         )}
                      </div>

                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-6 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                         {post.content}
                      </p>

                      <div className="grid grid-cols-3 gap-2 mb-6">
                         {[
                           { icon: Heart, val: post.engagement.likes, label: 'L' },
                           { icon: MessageCircle, val: post.engagement.comments, label: 'C' },
                           { icon: Share2, val: post.engagement.shares, label: 'S' },
                         ].map((item, i) => (
                           <div key={i} className="nm-inset p-3 rounded-2xl bg-slate-50 dark:bg-black/10 flex flex-col items-center">
                              <item.icon className="w-3 h-3 text-slate-400 mb-1" />
                              <span className="text-[10px] font-black">{item.val}</span>
                           </div>
                         ))}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                         <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-slate-400">Eng Rate</span>
                            <span className="text-[10px] font-black text-emerald-500">{post.engagementRate}%</span>
                         </div>
                         <button className="p-3 nm-button rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                            <ExternalLink className="w-4 h-4" />
                         </button>
                      </div>
                   </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
