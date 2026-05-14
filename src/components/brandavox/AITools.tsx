import React, { useState } from "react";
import { 
  Sparkles, 
  BrainCircuit, 
  MessageSquare, 
  Hash, 
  Video, 
  Palette, 
  Settings,
  Zap,
  CheckCircle2,
  Share2,
  Layout,
  BarChart3,
  Globe,
  PenTool,
  Clock,
  ArrowRight,
  RefreshCw,
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import AIAdGenerator from "./AIAdGenerator";

type ToolType = 'captions' | 'hashtags' | 'strategy' | 'script' | 'branding' | 'viral' | 'ads';

interface AIResult {
  title: string;
  content: string;
  tags?: string[];
}

export default function AITools() {
  const [activeTool, setActiveTool] = useState<ToolType>('captions');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);

  const tools = [
    { id: 'captions', label: 'Caption Gen', icon: MessageSquare, desc: 'Generate scroll-stopping captions tuned to brand voice.' },
    { id: 'hashtags', label: 'Hashtag Hub', icon: Hash, desc: 'Real-time trending hashtag neural injection.' },
    { id: 'strategy', label: 'Strategy Map', icon: BrainCircuit, desc: 'AI-generated 30-day content pillars and strategy.' },
    { id: 'script', label: 'Video Scripts', icon: Video, desc: 'High-retention hooks and scripts for Reels/TikTok.' },
    { id: 'branding', label: 'Brand Voice', icon: Palette, desc: 'Train AI on your specific brand tone and terminology.' },
    { id: 'ads', label: 'Ad Velocity', icon: Layout, desc: 'High-converting neural ad copy for Meta, LinkedIn, and Google.' },
    { id: 'viral', label: 'Viral Predictor', icon: Zap, desc: 'Predict engagement potential before you publish.' },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setResult({
        title: activeTool === 'captions' ? 'Option 1: The Minimalist Hook' : 'Neural Content Matrix V1',
        content: activeTool === 'captions' 
          ? "The difference between good and great design is intentionality. 🛠️✨ We don't just build, we craft experiences that resonate. What are you building today?\n\n#Minimalism #DesignThinking #Brandavox"
          : "30-Day Strategy: Focus on 3 core pillars: Educational (40%), Community (30%), and Behind-the-Scenes (30%). Release 2 Reels weekly with high-impact hooks.",
        tags: ['#FutureOfDesign', '#AIDesign', '#SaaS']
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">AI Content Factory</h2>
          <p className="text-slate-500 font-bold">Unified creative intelligence for every platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tool Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-3">
            {tools.map(tool => {
              const Icon = tool.icon;
              return (
                <button 
                  key={tool.id}
                  onClick={() => {
                    setActiveTool(tool.id as ToolType);
                    setResult(null);
                  }}
                  className={cn(
                    "w-full p-6 nm-flat rounded-[2.5rem] flex items-center gap-4 transition-all border border-transparent text-left",
                    activeTool === tool.id ? "nm-inset border-orange-500/20" : "hover:scale-[1.02]"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                    activeTool === tool.id ? "bg-orange-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "text-sm font-black uppercase tracking-tight",
                      activeTool === tool.id ? "text-orange-600 dark:text-white" : "text-slate-500"
                    )}>{tool.label}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-tight line-clamp-1">{tool.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="nm-flat p-8 rounded-[3rem] bg-indigo-900/10 border border-indigo-500/20">
             <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-indigo-500" />
                <h5 className="text-[10px] font-black uppercase text-indigo-500">PRO FEATURE</h5>
             </div>
             <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-relaxed">
                Connect your social accounts to unlock <strong>Neural Performance Prediction</strong>.
             </p>
          </div>
        </div>

        {/* Workspace Area */}
        <div className="lg:col-span-3 space-y-8">
          {activeTool === 'ads' ? (
            <AIAdGenerator />
          ) : (
            <div className="nm-flat p-10 rounded-[3.5rem] relative overflow-hidden flex flex-col gap-8">
               <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="p-4 bg-slate-950 dark:bg-black/40 rounded-2xl text-white">
                        {tools.find(t => t.id === activeTool)?.icon && React.createElement(tools.find(t => t.id === activeTool)!.icon, { className: "w-6 h-6 text-orange-600" })}
                     </div>
                     <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">{tools.find(t => t.id === activeTool)?.label} Accelerator</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">High-fidelity creative synthesis</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                      <div className="nm-inset p-1 rounded-xl bg-slate-50 dark:bg-black/20 flex gap-1">
                        {['Creative', 'Formal', 'Gen-Z'].map(tone => (
                          <button key={tone} className="px-4 py-2 text-[8px] font-black uppercase text-slate-400 hover:text-orange-600">
                            {tone}
                          </button>
                        ))}
                      </div>
                  </div>
               </div>

               <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Synthesis Prompt / Context</label>
                     <textarea 
                       placeholder="Explain the topic, vibe, or current trend..."
                       className="w-full p-8 nm-inset rounded-[2.5rem] bg-white dark:bg-slate-900/50 font-bold text-sm min-h-[160px] focus:outline-none transition-all placeholder:text-slate-300"
                     />
                  </div>
                  
                  <div className="flex justify-between items-center">
                     <div className="flex gap-4">
                        <button className="px-6 py-3 nm-button rounded-xl text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
                           <Globe className="w-4 h-4" /> Localized
                        </button>
                        <button className="px-6 py-3 nm-button rounded-xl text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
                           <Palette className="w-4 h-4" /> Brand Profile
                        </button>
                     </div>
                     <button 
                       onClick={handleGenerate}
                       disabled={isGenerating}
                       className="px-12 py-5 bg-orange-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-orange-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                     >
                       {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                       {isGenerating ? 'Synthesizing...' : 'Propagate Creation'}
                     </button>
                  </div>
               </div>

               <AnimatePresence>
                  {result && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="mt-8 p-10 nm-inset rounded-[3rem] bg-white dark:bg-slate-900 border border-emerald-500/10 space-y-6"
                    >
                      <div className="flex justify-between items-center">
                         <h5 className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Matrix Output Staged
                         </h5>
                         <div className="flex gap-2">
                            <button className="p-3 nm-button rounded-xl text-slate-400 hover:text-orange-600"><Copy className="w-4 h-4" /></button>
                            <button className="p-3 nm-button rounded-xl text-slate-400 hover:text-indigo-600"><Share2 className="w-4 h-4" /></button>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-xl font-black">{result.title}</h4>
                         <div className="p-8 nm-flat dark:bg-black/20 rounded-2xl">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {result.content}
                            </p>
                         </div>
                      </div>
                      <div className="flex justify-between items-center pt-4">
                         <div className="flex gap-2">
                            {result.tags?.map((t, i) => (
                              <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase">{t}</span>
                            ))}
                         </div>
                         <button className="px-8 py-3 nm-button bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                            Inject into Planner
                         </button>
                      </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
