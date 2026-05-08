import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, Zap, BrainCircuit, Rocket } from 'lucide-react';

interface SmartUpgradeModalProps {
  onClose: () => void;
  onUpgrade: () => void;
  usageAnalysis?: string;
}

export default function SmartUpgradeModal({ onClose, onUpgrade, usageAnalysis }: SmartUpgradeModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="nm-flat p-12 rounded-[4rem] max-w-2xl w-full relative overflow-hidden bg-white dark:bg-slate-950 border-2 border-orange-600/30"
      >
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-600/10 rounded-full blur-[100px]" />
        
        <div className="text-center space-y-8 relative z-10">
          <div className="w-20 h-20 bg-orange-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-orange-600/40">
             <Rocket className="w-10 h-10 text-white animate-pulse" />
          </div>
          
          <div className="space-y-4">
             <h2 className="text-4xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">Command <span className="text-orange-600">Upgrade</span></h2>
             <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
               Your current nerve usage suggests you're ready for Pro Studio. Unlock 300 requests/min and AES-256 E2E across your entire empire.
             </p>
          </div>

          <div className="nm-inset p-6 rounded-3xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 text-left">
             <div className="flex items-center gap-3 mb-3">
                <BrainCircuit className="w-4 h-4 text-orange-600" />
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Nerver Intelligence Analysis</span>
             </div>
             <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic">
               "{usageAnalysis || "Platform detected heavy creative synthesis. Pro Studio would reduce latency by 85% and double your 8K rendering throughput."}"
             </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="p-4 nm-button rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-[10px] font-black uppercase">AES-256 E2E Chat</span>
             </div>
             <div className="p-4 nm-button rounded-2xl flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-[10px] font-black uppercase">Gemini-2.0 Neural</span>
             </div>
          </div>

          <div className="space-y-4 pt-4">
             <button 
               onClick={onUpgrade}
               className="w-full py-6 bg-orange-600 text-white rounded-3xl font-black uppercase text-sm tracking-widest shadow-xl shadow-orange-600/30 hover:scale-[1.02] transition-all"
             >
               Activate Pro Studio ($49/mo)
             </button>
             <button 
               onClick={onClose}
               className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
             >
               Return to Nerve Center
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
