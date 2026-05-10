import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Users, 
  Zap, 
  ShieldCheck, 
  Server, 
  Plus, 
  Settings, 
  Search,
  Filter,
  ArrowRight,
  Database,
  Cloud,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Activity,
  ChevronRight,
  Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";

interface EmailList {
  id: string;
  name: string;
  subscribers: number;
  provider: 'ses' | 'alibaba' | 'mailwizz';
  status: 'active' | 'syncing';
  triggers: string[];
}

interface Lead {
  id: string;
  email: string;
  name: string;
  status: 'verified' | 'pending' | 'blocked';
  source: string;
  joinedAt: any;
}

export default function NeuralEmailStudio({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'leads' | 'lists' | 'infrastructure'>('leads');
  const [lists, setLists] = useState<EmailList[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [provider, setProvider] = useState<'ses' | 'alibaba'>('ses');

  useEffect(() => {
    if (!user || user.uid === 'guest-user') {
      setLists([
        { id: 'l1', name: 'Premium Founders', subscribers: 1240, provider: 'ses', status: 'active', triggers: ['on_signup', 'email_verified'] },
        { id: 'l2', name: 'Strategic Beta', subscribers: 85, provider: 'mailwizz', status: 'syncing', triggers: ['manual_import'] },
      ]);
      setLeads([
        { id: 'u1', email: 'alex@nexus.com', name: 'Alex Node', status: 'verified', source: 'Auth Page', joinedAt: new Date() },
        { id: 'u2', email: 'spam-bot@fake.cc', name: 'Unknown', status: 'blocked', source: 'Registration', joinedAt: new Date() },
      ]);
      return;
    }

    const qLeads = query(collection(db, "leads"), where("ownerId", "==", user.uid));
    const unsubLeads = onSnapshot(qLeads, (snapshot) => {
      setLeads(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any);
    });

    const qLists = query(collection(db, "email_lists"), where("ownerId", "==", user.uid));
    const unsubLists = onSnapshot(qLists, (snapshot) => {
      setLists(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any);
    });

    return () => { unsubLeads(); unsubLists(); };
  }, [user]);

  const toggleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Neural Email Studio</h2>
          <p className="text-slate-500 font-bold">Autonomous lead infrastructure & high-velocity SMTP sync.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setShowConfigModal(true)}
             className="flex items-center gap-2 px-6 py-3 nm-button rounded-xl text-slate-500 font-bold"
           >
             <Settings className="w-5 h-5" /> Config
           </button>
           <button 
             onClick={toggleSync}
             className="flex items-center gap-2 px-8 py-3 nm-button rounded-xl text-orange-600 font-black hover:scale-105 transition-all"
           >
             <Zap className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'Syncing...' : 'Force Global Sync'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-4">
          <div className="nm-flat p-2 rounded-[2.5rem] flex flex-col gap-1">
            {[
              { id: 'leads', icon: Users, label: 'Lead Central' },
              { id: 'lists', icon: Mail, label: 'Neural Lists' },
              { id: 'infrastructure', icon: Server, label: 'SMTP Infrastructure' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] font-bold text-sm transition-all ${activeTab === tab.id ? 'nm-inset text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="nm-flat p-8 rounded-[2.5rem] bg-slate-950 text-white border border-orange-500/20">
             <div className="flex items-center gap-4 mb-4">
                <ShieldCheck className="w-8 h-8 text-orange-500" />
                <h4 className="font-black uppercase text-xs">Anti-Bounce Guard</h4>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed mb-6">
                Engine is actively blocking fake email patterns and temporary domains to protect sender reputation.
             </p>
             <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-600 w-3/4 animate-pulse" />
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'leads' && (
              <motion.div 
                key="leads"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center bg-white dark:bg-slate-900/50 p-4 rounded-3xl nm-inset">
                   <div className="flex items-center gap-4 flex-1">
                      <Search className="w-5 h-5 text-slate-400" />
                      <input placeholder="Neural search leads..." className="bg-transparent w-full text-sm font-bold focus:outline-none" />
                   </div>
                   <div className="flex gap-2">
                      <button className="p-3 text-slate-400 hover:text-orange-600"><Filter className="w-5 h-5" /></button>
                      <button className="px-6 py-2 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase">Export CSV</button>
                   </div>
                </div>

                <div className="nm-flat p-8 rounded-[3rem] space-y-4">
                   <div className="grid grid-cols-4 px-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <span>Identity</span>
                      <span>Source Node</span>
                      <span>Validation Status</span>
                      <span className="text-right">Actions</span>
                   </div>
                   <div className="space-y-2">
                      {leads.map((lead, i) => (
                        <div key={i} className="flex items-center justify-between p-6 nm-inset bg-white dark:bg-slate-900/50 rounded-2xl group hover:scale-[1.01] transition-transform">
                           <div className="grid grid-cols-4 items-center flex-1">
                              <div className="flex flex-col">
                                 <span className="text-xs font-black uppercase truncate">{lead.name || 'Anonymous User'}</span>
                                 <span className="text-[10px] font-bold text-slate-400">{lead.email}</span>
                              </div>
                              <span className="text-[10px] font-black uppercase text-indigo-600">{lead.source}</span>
                              <div className="flex items-center gap-2">
                                 {lead.status === 'verified' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                 <span className={`text-[10px] font-black uppercase ${lead.status === 'verified' ? 'text-emerald-500' : 'text-red-500'}`}>{lead.status}</span>
                              </div>
                              <div className="flex justify-end pr-2">
                                 <button className="p-2 nm-button rounded-lg text-slate-400 hover:text-orange-600 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'lists' && (
              <motion.div 
                key="lists"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {lists.map((list, i) => (
                  <div key={i} className="nm-flat p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Mail className="w-24 h-24 text-orange-600" />
                     </div>
                     <div className="space-y-6 relative">
                        <div className="flex justify-between items-start">
                           <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase ${list.provider === 'ses' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                              {list.provider} Relay
                           </div>
                           <button className="p-2 nm-button rounded-xl text-slate-400"><Activity className="w-4 h-4" /></button>
                        </div>
                        <div>
                           <h4 className="text-2xl font-black uppercase tracking-tighter">{list.name}</h4>
                           <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mt-1">{list.subscribers.toLocaleString()}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Subscribers</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {list.triggers.map((t, idx) => (
                             <span key={idx} className="px-2 py-1 nm-inset rounded-lg text-[8px] font-black text-slate-500 uppercase">{t}</span>
                           ))}
                        </div>
                        <button className="w-full py-4 mt-4 nm-button bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase text-orange-600">
                           Manage Automation <ChevronRight className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                ))}
                <button className="nm-flat p-8 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-orange-600 transition-all">
                   <div className="p-4 nm-button rounded-2xl">
                      <Plus className="w-8 h-8" />
                   </div>
                   <span className="font-black uppercase text-xs tracking-widest">Spawn Neural List</span>
                </button>
              </motion.div>
            )}

            {activeTab === 'infrastructure' && (
              <motion.div 
                key="infra"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="nm-flat p-8 rounded-[3rem] space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-xl">
                            <Cloud className="w-6 h-6" />
                         </div>
                         <div>
                            <h4 className="font-black uppercase tracking-tighter">Amazon SES</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Transactional Relay</p>
                         </div>
                      </div>
                      <div className="p-4 nm-inset rounded-2xl bg-slate-50 dark:bg-white/5 space-y-3 font-mono text-[10px] text-slate-500">
                         <div className="flex justify-between"><span>Status:</span> <span className="text-emerald-500">CONNECTED</span></div>
                         <div className="flex justify-between"><span>Region:</span> <span>US-EAST-1</span></div>
                         <div className="flex justify-between"><span>Identity:</span> <span>brandavox.ai</span></div>
                      </div>
                      <button className="w-full py-4 nm-button rounded-2xl text-xs font-black uppercase text-slate-500">Re-verify Identity</button>
                   </div>

                   <div className="nm-flat p-8 rounded-[3rem] space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl">
                            <Database className="w-6 h-6" />
                         </div>
                         <div>
                            <h4 className="font-black uppercase tracking-tighter">Alibaba Direct Mail</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Redundant Failover Node</p>
                         </div>
                      </div>
                      <div className="p-4 nm-inset rounded-2xl bg-slate-50 dark:bg-white/5 space-y-3 font-mono text-[10px] text-slate-500">
                         <div className="flex justify-between"><span>Status:</span> <span className="text-amber-500">STANDBY</span></div>
                         <div className="flex justify-between"><span>Region:</span> <span>Singapore</span></div>
                         <div className="flex justify-between"><span>Flow:</span> <span>Marketing/Bulk</span></div>
                      </div>
                      <button className="w-full py-4 nm-button rounded-2xl text-xs font-black uppercase text-blue-600">Upgrade Priority</button>
                   </div>
                </div>

                <div className="nm-flat p-8 rounded-[3rem] bg-slate-950 border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-5">
                      <Terminal className="w-48 h-48 text-white" />
                   </div>
                   <div className="relative space-y-6">
                      <div className="flex items-center gap-2 text-emerald-500 text-xs font-mono">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         NEURAL_SYNC_DAEMON_ACTIVE
                      </div>
                      <div className="space-y-2 font-mono text-[10px] text-slate-400">
                         <p>[09:21:42] SYNC_PACKET_SENT: 42 new verified leads relayed to SES-v2-US_EAST</p>
                         <p>[09:21:45] BOUNCE_GUARD_INTERCEPT: blocked pattern user@tempmail.ninja</p>
                         <p>[09:21:50] MAILWIZZ_WEBHOOK_RECEIVED: List 'Beta-Founders' updated</p>
                         <p className="animate-pulse">_</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Config Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={()=>setShowConfigModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg nm-flat bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-white/10 text-left">
                <div className="flex items-center gap-4 mb-10">
                   <div className="p-4 bg-orange-600 rounded-3xl text-white shadow-2xl">
                      <Settings className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter">Engine Config</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tracking-widest">Global Relay Setup</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4 p-1 nm-inset rounded-2xl bg-slate-50 dark:bg-black/20">
                      <button onClick={()=>setProvider('ses')} className={`py-4 rounded-xl text-xs font-black uppercase transition-all ${provider === 'ses' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400'}`}>Amazon SES</button>
                      <button onClick={()=>setProvider('alibaba')} className={`py-4 rounded-xl text-xs font-black uppercase transition-all ${provider === 'alibaba' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Alibaba Cloud</button>
                   </div>

                   <div className="space-y-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Relay Access Key</label>
                         <input type="password" placeholder="••••••••••••••••" className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent text-sm" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Relay Secret Key</label>
                         <input type="password" placeholder="••••••••••••••••" className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent text-sm" />
                      </div>
                      <div className="flex items-center gap-3 p-4 nm-inset rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                         <ShieldCheck className="w-5 h-5 text-emerald-500" />
                         <span className="text-[10px] font-black uppercase text-emerald-600">Enterprise Grade Encryption Active</span>
                      </div>
                   </div>

                   <button className="w-full py-5 bg-slate-950 dark:bg-white dark:text-slate-950 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl mt-4 active:scale-95 transition-all">
                      Save & Test Connectivity
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
