import React, { useState } from "react";
import { 
  Rocket, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Globe, 
  Users, 
  Zap, 
  ShieldCheck,
  Layout,
  Briefcase,
  Sparkles,
  Command,
  Activity,
  AlertTriangle,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
  status: 'complete' | 'current' | 'upcoming';
  icon: any;
}

export default function ClientOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [formData, setFormData] = useState({
    mission: "",
    persona: "",
    website: "",
    syncedPlatforms: [] as string[],
  });

  const isStep1Ready = formData.mission.length > 10 && formData.persona.length > 10;
  const isStep2Ready = formData.syncedPlatforms.length >= 2;
  const isStep3Ready = true; // Auto-generated
  const isStep4Ready = true;

  const isCurrentStepReady = 
    currentStep === 1 ? isStep1Ready : 
    currentStep === 2 ? isStep2Ready : 
    currentStep === 3 ? isStep3Ready : 
    isStep4Ready;
  
  const steps: Step[] = [
    { id: 1, title: 'Identity Extraction', description: 'Brand voice, visuals, and mission analysis.', status: currentStep > 1 ? 'complete' : (currentStep === 1 ? 'current' : 'upcoming'), icon: Sparkles },
    { id: 2, title: 'Neural Matrix Sync', description: 'Connecting social accounts and lead sources.', status: currentStep > 2 ? 'complete' : (currentStep === 2 ? 'current' : 'upcoming'), icon: Zap },
    { id: 3, title: 'Strategy Synthesis', description: 'AI-generated 90-day growth roadmap.', status: currentStep > 3 ? 'complete' : (currentStep === 3 ? 'current' : 'upcoming'), icon: Command },
    { id: 4, title: 'Launch Propagation', description: 'Initial campaign deployment and tracking.', status: currentStep > 4 ? 'complete' : (currentStep === 4 ? 'current' : 'upcoming'), icon: Rocket },
  ];

  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-8 animate-in zoom-in duration-500">
         <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="w-16 h-16" />
         </div>
         <div className="space-y-4">
            <h2 className="text-5xl font-black uppercase tracking-tighter">Mission Accomplished</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">The brand matrix is fully initialized and operational.</p>
         </div>
         <div className="flex justify-center gap-6 pt-10">
            <button className="px-10 py-5 nm-button rounded-3xl text-xs font-black uppercase tracking-widest text-orange-600">Download Strategy PDF</button>
            <button className="px-10 py-5 bg-slate-950 text-white rounded-3xl text-xs font-black uppercase tracking-widest shadow-xl">Go to Client Dashboard</button>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700 text-left">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-200 dark:border-orange-500/20">
          <Rocket className="w-3 h-3" /> Mission Control
        </div>
        <h2 className="text-5xl font-black tracking-tighter uppercase text-slate-950 dark:text-white leading-tight">Client Onboarding <span className="text-orange-600">Quest</span></h2>
        <p className="text-slate-500 font-bold max-w-2xl mx-auto">Welcome to the Brandavox intelligence pipeline. Follow the sequence to initialize brand dominance.</p>
      </div>

      {/* Global Progress Indicator */}
      <div className="nm-flat p-8 rounded-[2.5rem] space-y-6">
         <div className="flex justify-between items-center px-4">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/30">
                  <Activity className="w-4 h-4" />
               </div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Initialization Velocity</span>
            </div>
            <div className="text-right">
               <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest leading-none block">{Math.round((currentStep / steps.length) * 100)}% Matrix Sync</span>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Phase {currentStep} of {steps.length}</p>
            </div>
         </div>
         <div className="relative pt-2">
            <div className="h-3 w-full nm-inset rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                 className="h-full bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.6)]" 
               />
            </div>
            {/* Phase Markers */}
            <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1 pointer-events-none">
               {steps.map((s, i) => (
                 <div key={s.id} className="flex flex-col items-center">
                    <div className={cn(
                      "w-1.5 h-6 rounded-full transition-all duration-500",
                      currentStep > i ? "bg-orange-600" : "bg-slate-300 dark:bg-slate-700"
                    )} />
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Step Progress */}
        <div className="lg:col-span-4 space-y-4">
          <div className="nm-flat p-8 rounded-[3.5rem] space-y-8">
            {steps.map((step, i) => (
              <div key={step.id} className="relative">
                {i < steps.length - 1 && (
                  <div className={cn(
                    "absolute left-6 top-12 bottom-0 w-1 rounded-full",
                    step.status === 'complete' ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800"
                  )} />
                )}
                <div className="flex gap-6 relative z-10">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all",
                    step.status === 'complete' ? "bg-emerald-500 text-white" : 
                    step.status === 'current' ? (isCurrentStepReady ? "bg-orange-600 text-white scale-110 shadow-orange-600/30" : "bg-amber-500 text-white scale-110") : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    {step.status === 'complete' ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={cn(
                        "text-sm font-black uppercase tracking-tight",
                        step.status === 'upcoming' ? "text-slate-400" : "text-slate-950 dark:text-white"
                      )}>{step.title}</h4>
                      {step.status === 'current' && !isCurrentStepReady && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Input Required" />
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase leading-tight mt-1">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="nm-flat p-8 rounded-[3rem] bg-indigo-600 text-white overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                <ShieldCheck className="w-24 h-24" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">INTELLIGENCE STATUS</p>
             <h3 className="text-xl font-black uppercase leading-none mb-4 whitespace-pre-line">
                {currentStep === 1 ? (isStep1Ready ? "Neural Lock\nVerified" : "Syncing Brand\nPulse...") : 
                 currentStep === 2 ? (isStep2Ready ? "Network Nodes\nOptimized" : "Calibrating\nFrequencies...") :
                 currentStep === 3 ? "Strategy\nSynthesis..." : "Propagation\nLaunch Sequence"}
             </h3>
             <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: isCurrentStepReady ? "100%" : "30%" }}
                  className={cn(
                    "h-full bg-white transition-all duration-700",
                    isCurrentStepReady ? "opacity-100" : "animate-pulse"
                  )} 
                />
             </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="lg:col-span-8">
           <AnimatePresence mode="wait">
              <motion.div 
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="nm-flat p-12 rounded-[4rem] min-h-[500px] flex flex-col"
              >
                {currentStep === 1 && (
                  <div className="space-y-8 flex-1">
                    <div className="flex justify-between items-start">
                       <div className="space-y-1 text-left">
                          <h3 className="text-3xl font-black uppercase tracking-tighter">Identity Extraction</h3>
                          <p className="text-xs font-bold text-slate-500 uppercase">Input existing assets to train the Brandavox Neural Engine.</p>
                       </div>
                       <div className={cn(
                         "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                         isStep1Ready ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                       )}>
                          {isStep1Ready ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
                          {isStep1Ready ? "Neural Lock Achieved" : "Syncing Required"}
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <div className="flex justify-between items-center px-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Company Mission</label>
                             <span className={cn("text-[9px] font-bold uppercase", formData.mission.length > 10 ? "text-emerald-500" : "text-slate-300")}>
                                {formData.mission.length}/10 min
                             </span>
                          </div>
                          <div className={cn(
                             "relative nm-inset rounded-3xl bg-white dark:bg-slate-900 transition-all duration-300",
                             formData.mission.length > 10 ? "ring-2 ring-emerald-500/30" : ""
                          )}>
                             <textarea 
                               value={formData.mission}
                               onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                               placeholder="What drives this brand?" 
                               className="w-full p-8 bg-transparent border-none focus:ring-0 text-sm font-bold min-h-[160px] leading-relaxed" 
                             />
                             {formData.mission.length > 10 && (
                               <div className="absolute top-4 right-4 text-emerald-500">
                                  <CheckCircle2 className="w-4 h-4" />
                               </div>
                             )}
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center px-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Persona</label>
                             <span className={cn("text-[9px] font-bold uppercase", formData.persona.length > 10 ? "text-emerald-500" : "text-slate-300")}>
                                {formData.persona.length}/10 min
                             </span>
                          </div>
                          <div className={cn(
                             "relative nm-inset rounded-3xl bg-white dark:bg-slate-900 transition-all duration-300",
                             formData.persona.length > 10 ? "ring-2 ring-emerald-500/30" : ""
                          )}>
                             <textarea 
                               value={formData.persona}
                               onChange={(e) => setFormData(prev => ({ ...prev, persona: e.target.value }))}
                               placeholder="Describe the ideal customer..." 
                               className="w-full p-8 bg-transparent border-none focus:ring-0 text-sm font-bold min-h-[160px] leading-relaxed" 
                             />
                             {formData.persona.length > 10 && (
                               <div className="absolute top-4 right-4 text-emerald-500">
                                  <CheckCircle2 className="w-4 h-4" />
                               </div>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="nm-inset p-8 rounded-3xl bg-slate-50 dark:bg-black/20 text-center space-y-4 border-2 border-dashed border-slate-200 dark:border-white/5">
                        <Globe className="w-10 h-10 text-slate-300 mx-auto" />
                        <div>
                           <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Crawl Existing Digital Empire</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase">Input website URL for autonomous extraction</p>
                        </div>
                        <input placeholder="https://example.com" className="w-full max-w-sm mx-auto p-4 nm-flat rounded-xl bg-white dark:bg-slate-900 text-center font-bold text-xs" />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-10 flex-1 text-center py-12">
                    <div className="relative inline-block">
                       <Zap className={cn(
                         "w-24 h-24 mx-auto transition-all duration-700",
                         isStep2Ready ? "text-orange-600 scale-125 drop-shadow-[0_0_20px_rgba(234,88,12,0.4)]" : "text-slate-300 animate-pulse"
                       )} />
                       {isStep2Ready && (
                         <motion.div 
                           initial={{ scale: 0 }}
                           animate={{ scale: 1 }}
                           className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-slate-950"
                         >
                            <CheckCircle2 className="w-4 h-4" />
                         </motion.div>
                       )}
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black uppercase tracking-tighter">Neural Matrix Sync</h3>
                       <p className="text-sm font-bold text-slate-500 uppercase">Synchronize at least <span className="text-orange-600">2 platforms</span> to stabilize the brand signal.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 max-w-2xl mx-auto">
                       {['Meta', 'X (Twitter)', 'LinkedIn', 'TikTok', 'Instagram', 'Pinterest'].map(platform => {
                         const isSynced = formData.syncedPlatforms.includes(platform);
                         return (
                          <button 
                            key={platform} 
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                syncedPlatforms: isSynced 
                                  ? prev.syncedPlatforms.filter(p => p !== platform)
                                  : [...prev.syncedPlatforms, platform]
                              }))
                            }}
                            className={cn(
                              "px-10 py-6 rounded-3xl flex flex-col items-center gap-4 transition-all duration-300 group",
                              isSynced ? "nm-inset text-orange-600" : "nm-flat text-slate-400 hover:text-slate-600"
                            )}
                          >
                             <div className={cn(
                               "w-4 h-4 rounded-full border-4 transition-all",
                               isSynced ? "bg-orange-600 border-orange-200" : "bg-slate-200 border-slate-100"
                             )} />
                             <span className="font-black uppercase text-xs tracking-[0.2em]">{platform}</span>
                          </button>
                         );
                       })}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-8 flex-1">
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black uppercase tracking-tighter">Strategy Synthesis</h3>
                       <p className="text-sm font-bold text-slate-500 uppercase">Our AI is drafting the initial 90-day trajectory.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="p-8 nm-inset rounded-[2.5rem] bg-white dark:bg-slate-950 space-y-4">
                          <h4 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Target Content Pillars</h4>
                          <div className="space-y-3">
                             {['Product Education', 'Community Spotlights', 'Industry Disruptors'].map((pillar, i) => (
                               <div key={i} className="flex items-center gap-3 p-3 nm-flat rounded-xl">
                                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                  <span className="text-xs font-bold uppercase">{pillar}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                       <div className="p-8 nm-inset rounded-[2.5rem] bg-white dark:bg-slate-950 space-y-4">
                          <h4 className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Growth Velocity Goals</h4>
                          <div className="space-y-4">
                             <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase">Engagement</span>
                                <span className="text-xl font-black text-orange-600">+120%</span>
                             </div>
                             <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-600 w-3/4" />
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-8 flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                       <Rocket className="w-12 h-12" />
                    </div>
                    <div className="space-y-3">
                       <h3 className="text-4xl font-black uppercase tracking-tighter">Launch Propagation Ready</h3>
                       <p className="text-sm font-bold text-slate-500 uppercase max-w-md">Final confirmation for matrix deployment. All systems are green for initial campaign activation.</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 w-full max-w-lg mt-8">
                       {[
                         { label: 'Latency', val: '14ms', icon: Zap },
                         { label: 'Integrity', val: '99.9%', icon: ShieldCheck },
                         { label: 'Reach', val: 'Global', icon: Globe },
                       ].map((stat, i) => (
                         <div key={i} className="p-4 nm-inset rounded-2xl space-y-1">
                            <stat.icon className="w-3 h-3 text-orange-600 mx-auto mb-1" />
                            <p className="text-[8px] font-black uppercase text-slate-400">{stat.label}</p>
                            <p className="text-xs font-black">{stat.val}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-100 dark:border-white/5">
                   <button 
                     onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                     disabled={currentStep === 1}
                     className="px-8 py-4 nm-button rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 disabled:opacity-30"
                   >
                     Previous Phase
                   </button>
                   {!isCurrentStepReady ? (
                     <div className="flex items-center gap-4 px-8 py-5 nm-inset rounded-3xl text-amber-600/50">
                        <Lock className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initialization Pending</span>
                     </div>
                   ) : (
                     <button 
                       onClick={() => currentStep === 4 ? setIsCompleted(true) : setCurrentStep(prev => prev + 1)}
                       className="px-12 py-4 bg-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-600/30 flex items-center gap-3 hover:scale-105 transition-all group"
                     >
                       {currentStep === 4 ? 'Complete Initialization' : 'Next Propagation Step'}
                       <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </button>
                   )}
                </div>
              </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
