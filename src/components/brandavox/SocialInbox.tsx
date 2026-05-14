import React, { useState } from "react";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Send, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  Twitter, 
  Instagram, 
  Linkedin,
  Zap,
  Sparkles,
  Phone,
  Mail,
  User,
  Heart,
  Repeat
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

interface Connection {
  id: string;
  name: string;
  platform: 'twitter' | 'instagram' | 'linkedin';
  lastMessage: string;
  unread: boolean;
  time: string;
  type: 'message' | 'comment';
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // 0 to 100
  assignedTo?: string;
  priority: 'high' | 'medium' | 'low';
}

const mockConnections: Connection[] = [
  { id: '1', name: 'Felix Thorne', platform: 'twitter', lastMessage: 'Great content on the new neural studio!', unread: true, time: '2m', type: 'message', sentiment: 'positive', sentimentScore: 92, priority: 'high', assignedTo: 'Self' },
  { id: '2', name: 'Innovate Agency', platform: 'linkedin', lastMessage: 'Would love to discuss a partnership.', unread: false, time: '1h', type: 'message', sentiment: 'neutral', sentimentScore: 50, priority: 'low' },
  { id: '3', name: 'Sarah Miller', platform: 'instagram', lastMessage: 'This Reel is amazing! 👏', unread: true, time: '15m', type: 'comment', sentiment: 'positive', sentimentScore: 88, priority: 'medium' },
  { id: '4', name: 'Angry Bot', platform: 'twitter', lastMessage: 'Your tool is too expensive!!', unread: false, time: '4h', type: 'comment', sentiment: 'negative', sentimentScore: 12, priority: 'high' },
];

export default function SocialInbox() {
  const [activeChat, setActiveChat] = useState<Connection | null>(null);
  const [reply, setReply] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'sentiment'>('newest');

  const platformIcons = {
    twitter: <Twitter className="w-4 h-4 text-sky-500" />,
    instagram: <Instagram className="w-4 h-4 text-pink-500" />,
    linkedin: <Linkedin className="w-4 h-4 text-blue-700" />,
  };

  const filteredConnections = mockConnections
    .filter(conn => filterPlatform === 'all' || conn.platform === filterPlatform)
    .filter(conn => filterType === 'all' || conn.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'sentiment') {
        const score = { positive: 3, neutral: 2, negative: 1 };
        return score[b.sentiment] - score[a.sentiment];
      }
      return 0; // Default to natural order (which is newest in mock)
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Social Matrix Inbox</h2>
          <p className="text-slate-500 font-bold">Unify all comments, DMs, and mentions into a single neural feed.</p>
        </div>

        <div className="flex gap-4">
           {[
             { label: 'Avg Velocity', value: '14m', icon: Clock },
             { label: 'Resolution Rate', value: '98%', icon: CheckCircle2 },
             { label: 'High Priority', value: '4', icon: Zap },
           ].map((stat, i) => (
             <div key={i} className="nm-flat px-6 py-3 rounded-2xl flex items-center gap-3">
                <stat.icon className="w-4 h-4 text-orange-600" />
                <div>
                   <p className="text-[8px] font-black uppercase text-slate-400 leading-none">{stat.label}</p>
                   <p className="text-sm font-black mt-1 leading-none">{stat.value}</p>
                </div>
             </div>
           ))}
        </div>
        
        <div className="flex flex-wrap gap-3">
          {['all', 'twitter', 'instagram', 'linkedin'].map(p => (
            <button 
              key={p}
              onClick={() => setFilterPlatform(p)}
              className={cn(
                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                filterPlatform === p ? "bg-orange-600 text-white shadow-lg" : "nm-flat text-slate-400 hover:text-slate-600"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[700px]">
        {/* Thread List */}
        <div className="lg:col-span-1 nm-flat rounded-[3rem] overflow-hidden flex flex-col bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-white/5">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase tracking-widest text-orange-600">Active Signals</h4>
              <div className="flex gap-4">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase text-slate-400 p-0"
                >
                  <option value="newest">Newest</option>
                  <option value="sentiment">Sentiment</option>
                </select>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase text-slate-400 p-0"
                >
                  <option value="all">All Types</option>
                  <option value="message">Messages</option>
                  <option value="comment">Comments</option>
                </select>
              </div>
            </div>
            <div className="nm-inset p-3 rounded-xl bg-slate-50 dark:bg-black/20 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input placeholder="Search signals..." className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase w-full" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {filteredConnections.map(conn => (
              <button 
                key={conn.id}
                onClick={() => setActiveChat(conn)}
                className={cn(
                  "w-full p-4 rounded-3xl flex items-start gap-3 transition-all text-left group",
                  activeChat?.id === conn.id ? "nm-inset" : "hover:bg-slate-50 dark:hover:bg-white/5"
                )}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conn.name}`} alt="avatar" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-950 rounded-full shadow-sm border border-slate-100 dark:border-white/10">
                    {platformIcons[conn.platform]}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <div className="flex items-center gap-2">
                      <h5 className="text-[10px] font-black uppercase truncate">{conn.name}</h5>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[6px] font-black uppercase",
                        conn.type === 'message' ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                      )}>
                        {conn.type === 'message' ? 'DM' : 'CMT'}
                      </span>
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase">{conn.time}</span>
                  </div>
                  <p className={cn(
                    "text-[10px] truncate leading-none mb-2",
                    conn.unread ? "font-bold text-slate-900 dark:text-white" : "text-slate-500"
                  )}>
                    {conn.lastMessage}
                  </p>
                  <div className="flex items-center gap-2">
                     <span className={cn(
                       "px-2 py-0.5 rounded-md text-[7px] font-black uppercase",
                       conn.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-600' : 
                       conn.sentiment === 'negative' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                     )}>
                        {Math.round(conn.sentimentScore)}% {conn.sentiment}
                     </span>
                     {conn.assignedTo && (
                       <span className="px-2 py-0.5 bg-slate-100 rounded text-[7px] font-black uppercase text-slate-400">
                          @ {conn.assignedTo}
                       </span>
                     )}
                     {conn.unread && <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse ml-auto" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat / View Area */}
        <div className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-4 gap-0 nm-flat rounded-[3.5rem] overflow-hidden bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-white/5 relative shadow-2xl">
          {activeChat ? (
            <>
              <div className="xl:col-span-3 flex flex-col h-full border-r border-slate-100 dark:border-white/5">
                <AnimatePresence mode="wait">
                   <motion.div 
                     key={activeChat.id}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="flex flex-col h-full"
                   >
                     {/* Chat Header */}
                     <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.name}`} alt="avatar" />
                           </div>
                           <div>
                              <div className="flex items-center gap-3">
                                 <h3 className="text-xl font-black uppercase tracking-tight">{activeChat.name}</h3>
                                 <span className={cn(
                                   "px-2 py-0.5 rounded text-[8px] font-black uppercase",
                                   activeChat.priority === 'high' ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-500"
                                 )}>
                                   {activeChat.priority} Priority
                                 </span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600">
                                    {platformIcons[activeChat.platform]} {activeChat.platform}
                                 </div>
                                 <span className="text-slate-300">•</span>
                                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{activeChat.type}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <button className="p-4 nm-button rounded-2xl text-slate-400 hover:text-orange-600 transition-all"><User className="w-5 h-5" /></button>
                           <button className="p-4 nm-button rounded-2xl text-slate-400"><MoreVertical className="w-5 h-5" /></button>
                        </div>
                     </div>

                     {/* Messages Body */}
                     <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                        {/* The incoming message/comment */}
                        <div className="flex gap-6 max-w-2xl">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.name}`} alt="avatar" />
                           </div>
                           <div className="space-y-3">
                              <div className="nm-inset p-6 bg-white dark:bg-slate-900 rounded-[2rem] rounded-tl-none">
                                 <p className="text-sm font-medium leading-relaxed">{activeChat.lastMessage}</p>
                              </div>
                              <div className="flex items-center gap-6 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                 <span>{activeChat.platform.toUpperCase()} SIGNAL</span>
                                 <span className="flex items-center gap-1">
                                    SENTIMENT: 
                                    <span className={cn(
                                      "ml-1",
                                      activeChat.sentiment === 'positive' ? 'text-emerald-500' : 'text-rose-500'
                                    )}>{activeChat.sentiment} ({activeChat.sentimentScore}%)</span>
                                 </span>
                                 <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activeChat.time} AGO</span>
                              </div>
                           </div>
                        </div>
                        
                        {/* AI Suggested Response */}
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="ml-auto flex flex-row-reverse gap-6 max-w-2xl"
                        >
                           <div className="w-10 h-10 rounded-xl bg-orange-600 shrink-0 flex items-center justify-center text-white shadow-lg">
                              <Sparkles className="w-5 h-5" />
                           </div>
                           <div className="space-y-3 text-right">
                              <div className="nm-flat p-6 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-500/20 rounded-[2rem] rounded-tr-none">
                                 <p className="text-xs font-black text-orange-600 mb-2 uppercase tracking-widest flex items-center justify-end gap-2">
                                    <Zap className="w-3 h-3" /> AI Smart Reply Suggestion
                                 </p>
                                 <p className="text-sm font-medium leading-relaxed italic">
                                    {activeChat.sentiment === 'negative' 
                                      ? "We're sorry to hear that. How can we make it better? We're committed to high value."
                                      : `Thanks for the feedback, ${activeChat.name.split(' ')[0]}! We're constantly evolving the neural engine to reach new heights. Stay tuned for more 🚀`}
                                 </p>
                                 <div className="flex gap-2 justify-end mt-4">
                                    {['Professional', 'Witty', 'Brief'].map(tone => (
                                      <button key={tone} className="px-4 py-1.5 nm-button bg-white dark:bg-slate-900 rounded-lg text-[8px] font-black uppercase text-slate-500 hover:text-orange-600">{tone}</button>
                                    ))}
                                    <button className="px-6 py-1.5 nm-button bg-orange-600 text-white rounded-lg text-[8px] font-black uppercase shadow-sm">Apply</button>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     </div>

                     {/* Input Bar */}
                     <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
                        <div className="mx-auto max-w-4xl space-y-4">
                           <div className="flex gap-4">
                              <div className="flex-1 nm-inset p-1 rounded-3xl bg-white dark:bg-slate-900 flex items-center">
                                 <input 
                                   placeholder={`Reply to ${activeChat.name}...`}
                                   value={reply}
                                   onChange={(e) => setReply(e.target.value)}
                                   className="flex-1 bg-transparent border-none focus:ring-0 px-8 py-5 text-sm font-bold"
                                 />
                                 <div className="flex gap-2 pr-4">
                                    <button className="p-3 text-slate-400 hover:text-orange-600"><Heart className="w-5 h-5" /></button>
                                    <button className="p-3 text-slate-400 hover:text-indigo-600"><Repeat className="w-5 h-5" /></button>
                                 </div>
                              </div>
                              <button className="px-10 py-5 bg-orange-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-orange-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                 <Send className="w-5 h-5" /> Propagate
                              </button>
                           </div>
                        </div>
                     </div>
                   </motion.div>
                </AnimatePresence>
              </div>

              {/* Sidebar Actions Area */}
              <div className="xl:col-span-1 p-8 bg-white/30 dark:bg-black/10 flex flex-col gap-8 custom-scrollbar h-full overflow-y-auto">
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Neural Recommendations</h4>
                    <div className="space-y-3">
                       {[
                         { id: 1, label: 'Convert to Support Ticket', icon: Clock, color: 'text-indigo-500' },
                         { id: 2, label: 'Add to Positive Testimonials', icon: Heart, color: 'text-rose-500' },
                         { id: 3, label: 'Mark as High-Value Lead', icon: Zap, color: 'text-orange-500' },
                         { id: 4, label: 'Flag as Bot/Spam', icon: Repeat, color: 'text-slate-400' },
                       ].map(action => (
                         <button key={action.id} className="w-full p-4 nm-flat rounded-2xl flex items-center gap-3 hover:scale-[1.02] transition-transform text-left">
                            <action.icon className={cn("w-4 h-4", action.color)} />
                            <span className="text-[10px] font-black uppercase leading-tight">{action.label}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Collaborator Context</h4>
                    <div className="p-5 nm-inset rounded-2xl space-y-3">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase">
                          <span>Previous Engagement</span>
                          <span className="text-emerald-500">3 Interactions</span>
                       </div>
                       <div className="flex justify-between items-center text-[9px] font-black uppercase">
                          <span>Total Reach</span>
                          <span className="text-indigo-500">12k Followers</span>
                       </div>
                    </div>
                 </div>

                 <div className="mt-auto p-6 nm-flat bg-slate-950 text-white rounded-3xl space-y-4">
                    <p className="text-[8px] font-black uppercase text-orange-500">Insight Alpha</p>
                    <p className="text-[10px] font-bold leading-relaxed italic opacity-80">
                       "Users similar to {activeChat.name.split(' ')[0]} often convert to 'Pro' users after a personal outreach via LinkedIn."
                    </p>
                    <button className="w-full py-3 bg-white text-slate-950 rounded-xl text-[9px] font-black uppercase">Bridge to LinkedIn</button>
                 </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 space-y-6 opacity-30">
               <MessageSquare className="w-32 h-32" />
               <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Void of Communication</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">Select a signal from the matrix to begin neural propagation.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
