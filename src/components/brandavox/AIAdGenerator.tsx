import React, { useState } from "react";
import { 
  Sparkles, 
  Target, 
  Users, 
  MessageSquare, 
  Copy, 
  RotateCcw, 
  Send,
  CheckCircle2,
  Zap,
  ArrowRight,
  Monitor,
  Smartphone,
  Layout,
  Type,
  PenTool,
  Layers,
  Video
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

interface AdVariation {
  id: string;
  headline: string;
  body: string;
  cta: string;
  platform: string;
}

export default function AIAdGenerator() {
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [voice, setVoice] = useState("bold");
  const [platform, setPlatform] = useState("meta");
  const [variationCount, setVariationCount] = useState(3);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['single-image']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<AdVariation[]>([]);

  const formats = [
    { id: 'single-image', label: 'Single Image', icon: Layout },
    { id: 'carousel', label: 'Carousel', icon: Layers },
    { id: 'video-copy', label: 'Video Scrip/Copy', icon: Video },
    { id: 'stories', label: 'Stories', icon: Smartphone },
  ];

  const toggleFormat = (id: string) => {
    setSelectedFormats(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const generateCopy = () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      const newVariations: AdVariation[] = [];
      const formatLabels = selectedFormats.length > 0 ? selectedFormats : ['single-image'];
      
      for (let i = 0; i < variationCount; i++) {
        const format = formatLabels[i % formatLabels.length];
        newVariations.push({
          id: `${Date.now()}-${i}`,
          platform: platform,
          headline: i % 2 === 0 ? "Stop Guessing, Start Scaling." : `Revolutionize Your ${goal || 'Marketing'}`,
          body: i % 2 === 0 
            ? `Attention ${audience || 'marketers'}: Our new neural framework is here to disrupt your current workflow. Achieve ${goal || '10x growth'} without the manual overhead.`
            : `Unleash the power of AI for ${audience || 'your team'}. Scale ${goal || 'your results'} with minimal effort and maximum precision. Format: ${format}`,
          cta: i % 2 === 0 ? "Deploy AI Now" : "Request Access",
        });
      }
      setVariations(newVariations);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="animate-in fade-in duration-500 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Pane */}
        <div className="lg:col-span-5 space-y-6">
           <div className="nm-flat p-8 rounded-[2.5rem] space-y-8">
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                       <Target className="w-3 h-3" /> Campaign Objective
                    </label>
                    <input 
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="e.g. 10x ROI for SaaS expansion"
                      className="w-full p-4 nm-inset rounded-2xl bg-slate-50 dark:bg-black/20 text-xs font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                       <Users className="w-3 h-3" /> Target Segment
                    </label>
                    <input 
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="e.g. Agency Founders, CTOs"
                      className="w-full p-4 nm-inset rounded-2xl bg-slate-50 dark:bg-black/20 text-xs font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Brand Voice</label>
                       <select 
                         value={voice}
                         onChange={(e) => setVoice(e.target.value)}
                         className="w-full p-4 nm-inset rounded-2xl bg-slate-50 dark:bg-black/20 text-xs font-black uppercase outline-none"
                       >
                          <option value="bold">Bold & Disruptive</option>
                          <option value="minimal">Minimalist</option>
                          <option value="technical">Technical/Expert</option>
                          <option value="empathetic">Empathetic</option>
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Node</label>
                       <select 
                         value={platform}
                         onChange={(e) => setPlatform(e.target.value)}
                         className="w-full p-4 nm-inset rounded-2xl bg-slate-50 dark:bg-black/20 text-xs font-black uppercase outline-none"
                       >
                          <option value="meta">Meta (FB/IG)</option>
                          <option value="google">Google Search</option>
                          <option value="linkedin">LinkedIn Ads</option>
                          <option value="twitter">X/Twitter</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Variation Pulse</label>
                       <span className="text-[10px] font-black text-orange-600">{variationCount} Variants</span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="10"
                      value={variationCount}
                      onChange={(e) => setVariationCount(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ad Blueprint Formats</label>
                    <div className="grid grid-cols-2 gap-3">
                       {formats.map((f) => {
                         const Icon = f.icon;
                         const active = selectedFormats.includes(f.id);
                         return (
                           <button
                             key={f.id}
                             onClick={() => toggleFormat(f.id)}
                             className={cn(
                               "p-3 rounded-xl border flex items-center gap-3 transition-all",
                               active 
                               ? "bg-orange-600 border-orange-600 text-white shadow-lg" 
                               : "nm-flat border-transparent text-slate-400 hover:text-slate-600"
                             )}
                           >
                              <Icon className="w-4 h-4" />
                              <span className="text-[9px] font-black uppercase tracking-tighter">{f.label}</span>
                           </button>
                         );
                       })}
                    </div>
                 </div>
              </div>

              <button 
                onClick={generateCopy}
                disabled={isGenerating}
                className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                 {isGenerating ? (
                   <>
                     <RotateCcw className="w-4 h-4 animate-spin" />
                     Synthesizing Neural Copy...
                   </>
                 ) : (
                   <>
                     <Sparkles className="w-4 h-4" />
                     Generate Ad Variations
                   </>
                 )}
              </button>
           </div>

           <div className="nm-flat p-6 rounded-[2rem] border border-orange-500/10 flex items-center gap-4 bg-orange-50/30 dark:bg-orange-950/10">
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white shrink-0">
                 <Zap className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase leading-relaxed">
                 Pro Tip: Provide specific ROI metrics for your goal to help the AI generate more grounded, persuasive copy.
              </p>
           </div>
        </div>

        {/* Output Pane */}
        <div className="lg:col-span-7 space-y-6">
           <AnimatePresence mode="popLayout">
              {variations.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                   {variations.map((v, i) => (
                     <motion.div 
                       key={v.id}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.1 }}
                       className="nm-flat p-8 rounded-[3rem] space-y-6 group relative"
                     >
                        <div className="flex justify-between items-center">
                           <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[8px] font-black uppercase tracking-widest">
                              Variation 0{i + 1} • {v.platform}
                           </span>
                           <div className="flex gap-2">
                              <button className="p-3 nm-button rounded-xl text-slate-400 hover:text-orange-600 transition-all">
                                 <Copy className="w-4 h-4" />
                              </button>
                              <button className="p-3 nm-button rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                                 <Send className="w-4 h-4" />
                              </button>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Headline</p>
                              <h4 className="text-xl font-black text-slate-950 dark:text-white uppercase leading-tight">{v.headline}</h4>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Primary Text</p>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                                 "{v.body}"
                              </p>
                           </div>
                           <div className="space-y-1 pt-4">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Call to Action</p>
                              <div className="inline-flex items-center gap-2 px-6 py-3 nm-flat rounded-xl text-[10px] font-black uppercase text-orange-600">
                                 {v.cta} <ArrowRight className="w-3 h-3" />
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                </div>
              ) : (
                <div className="nm-flat p-20 rounded-[4rem] flex flex-col items-center justify-center text-center space-y-6">
                   <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-black/20 flex items-center justify-center text-slate-300">
                      <Layout className="w-12 h-12" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black uppercase text-slate-400">Awaiting Generation</h3>
                      <p className="text-xs font-bold text-slate-500 max-w-xs">Input your campaign vectors to synthesize creative variations.</p>
                   </div>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
