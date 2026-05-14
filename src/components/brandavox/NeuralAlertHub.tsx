import React, { useState, useEffect } from "react";
import { 
  Bell, 
  ShieldAlert, 
  Zap, 
  TrendingUp, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Flame, 
  Target,
  ArrowUpRight,
  Settings2,
  Eye,
  Share2,
  Trash2,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { 
  db, 
  auth, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  OperationType,
  handleFirestoreError
} from "../../lib/firebase";

type AlertSeverity = 'critical' | 'warning' | 'info';
type AlertCategory = 'viral' | 'campaign' | 'growth' | 'system' | 'project';

interface NeuralAlert {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory | string;
  title: string;
  source: string;
  description: string;
  time: string;
  read: boolean;
  impactScore: number;
}

export default function NeuralAlertHub() {
  const [alerts, setAlerts] = useState<NeuralAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | AlertSeverity>('all');

  useEffect(() => {
    if (!auth.currentUser) return;

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(notificationsQuery, (snapshot) => {
      const alertData: NeuralAlert[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        alertData.push({
          id: doc.id,
          severity: data.severity as AlertSeverity,
          category: data.category || 'system',
          title: data.title,
          source: 'Neural Node',
          description: data.description,
          time: data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000).toLocaleTimeString() : 'Recent',
          read: data.read || false,
          impactScore: data.severity === 'critical' ? 95 : data.severity === 'warning' ? 75 : 45
        });
      });
      
      // Sort by time
      alertData.sort((a, b) => b.id.localeCompare(a.id)); // Simple sort if metadata not enough or use createdAt
      
      setAlerts(alertData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "notifications");
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredAlerts = alerts.filter(a => activeFilter === 'all' || a.severity === activeFilter);

  const markAllRead = async () => {
    for (const alert of alerts) {
      if (!alert.read) {
        try {
          await updateDoc(doc(db, "notifications", alert.id), { read: true });
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Neural Alert Hub</h2>
          <p className="text-slate-500 font-bold">Autonomous monitoring of global creative nodes and competitor vectors.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="nm-flat p-1 rounded-xl flex gap-1">
              {['all', 'critical', 'warning', 'info'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f as any)}
                  className={cn(
                    "px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    activeFilter === f ? "nm-inset text-orange-600" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {f}
                </button>
              ))}
           </div>
           <button 
             onClick={markAllRead}
             className="px-6 py-3 nm-button rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-orange-600"
           >
              Propagate Read Status
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Alerts Matrix */}
        <div className="lg:col-span-8 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => (
              <motion.div 
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "nm-flat p-8 rounded-[2.5rem] border border-transparent transition-all hover:scale-[1.01] flex gap-6 group relative overflow-hidden",
                  !alert.read && "border-orange-500/20 shadow-orange-500/5",
                  alert.severity === 'critical' && "bg-rose-50/10 dark:bg-rose-950/5"
                )}
              >
                {!alert.read && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-600" />
                )}
                
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white",
                  alert.severity === 'critical' ? 'bg-rose-600' : 
                  alert.severity === 'warning' ? 'bg-amber-500' : 'bg-indigo-600'
                )}>
                  {alert.category === 'viral' && <Flame className="w-8 h-8" />}
                  {alert.category === 'campaign' && <Target className="w-8 h-8" />}
                  {alert.category === 'growth' && <TrendingUp className="w-8 h-8" />}
                  {alert.category === 'system' && <Zap className="w-8 h-8" />}
                  {alert.category === 'project' && <Briefcase className="w-8 h-8" />}
                  {(!['viral', 'campaign', 'growth', 'system', 'project'].includes(alert.category)) && <Bell className="w-8 h-8" />}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={cn(
                          "px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                          alert.severity === 'critical' ? 'bg-rose-100 text-rose-600' : 
                          alert.severity === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                        )}>
                          {alert.severity} • {alert.category}
                        </span>
                        <span className="text-[10px] font-black uppercase text-slate-400">{alert.source}</span>
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tight">{alert.title}</h4>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Impact Velocity</p>
                       <div className="flex items-center gap-2">
                          <span className="text-sm font-black">{alert.impactScore}</span>
                          <div className="w-20 h-2 nm-inset bg-slate-100 rounded-full overflow-hidden">
                             <div 
                               className={cn("h-full", alert.impactScore > 80 ? 'bg-rose-500' : 'bg-indigo-500')} 
                               style={{ width: `${alert.impactScore}%` }} 
                             />
                          </div>
                       </div>
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl italic">
                    "{alert.description}"
                  </p>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-6">
                       <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {alert.time}
                       </span>
                       <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Deep Dive Analysis
                       </button>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-3 nm-button rounded-xl text-slate-400 hover:text-orange-600 transition-all">
                          <Share2 className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => deleteAlert(alert.id)}
                        className="p-3 nm-button rounded-xl text-slate-400 hover:text-rose-600 transition-all"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center nm-inset rounded-[3rem] opacity-40">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Neutral Monitoring Active - Zero Anomalies Detected</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Configuration Pane */}
        <div className="lg:col-span-4 space-y-8">
           <div className="nm-flat p-10 rounded-[3.5rem] bg-slate-950 text-white space-y-8 relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 opacity-10">
                 <Settings2 className="w-48 h-48" />
              </div>
              
              <div className="relative z-10 space-y-2">
                 <h3 className="text-2xl font-black uppercase tracking-tighter">Alert Synthesis</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Configure neural response thresholds</p>
              </div>

              <div className="space-y-6 relative z-10">
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                       <span>Engagement Threshold</span>
                       <span className="text-orange-500">2.5x Normal</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full">
                       <div className="h-full bg-orange-600 w-3/4" />
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                       <span>Growth Anomaly Sensitivity</span>
                       <span className="text-indigo-400">High (90%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full">
                       <div className="h-full bg-indigo-500 w-[90%]" />
                    </div>
                 </div>

                 <div className="space-y-4 pt-4">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Channels</h5>
                    <div className="grid grid-cols-2 gap-3">
                       {['E-mail', 'Slack', 'WhatsApp', 'Push'].map(ch => (
                         <div key={ch} className="px-4 py-3 nm-flat bg-white/5 rounded-xl flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase">{ch}</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <button className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl relative z-10 hover:scale-[1.02] active:scale-95 transition-all">
                 Commit Threshold Config
              </button>
           </div>

           <div className="nm-flat p-8 rounded-[3rem] space-y-6">
              <h4 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-rose-600">
                 <ShieldAlert className="w-4 h-4" /> Pending Threats
              </h4>
              <div className="space-y-4">
                 <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                    AI detected <strong className="text-slate-950 dark:text-white">3 high-probability ad launches</strong> in the next 48 hours based on competitor pattern analysis.
                 </p>
                 <button className="w-full py-4 nm-inset rounded-2xl text-[9px] font-black uppercase border border-rose-500/10 text-rose-600">
                    Deploy Counter-Strategy
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
