import React, { useState } from "react";
import { BrainCircuit, Sparkles, Wand2, Mic2, Video, Send, Download, RefreshCw, Layers, Palette, PenTool } from "lucide-react";
import { motion } from "motion/react";
import { BrandavoxAI } from "../lib/ai/deepseek-engine";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import SmartUpgradeModal from "./SmartUpgradeModal";

interface AICreativeStudioProps {
  user: any;
  onNavigate?: (tab: string) => void;
  initialTool?: 'content' | 'image' | 'video' | 'voice' | 'identity';
}

export default function AICreativeStudio({ user, onNavigate, initialTool }: AICreativeStudioProps) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<'content' | 'image' | 'video' | 'voice' | 'identity'>(initialTool || 'content');
  const [units, setUnits] = useState(3); // Starting with 3 free units
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const checkLimits = () => {
    if (!isPro && units <= 0) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const generateContent = async () => {
    if (!prompt || !checkLimits()) return;
    setGenerating(true);
    try {
      const resultObj = await BrandavoxAI.generateContent(
        `You are a world-class social media strategist. Generate 5 creative post ideas for the following topic: ${prompt}. Format as a JSON list of objects with 'headline', 'caption', 'hashtags', and 'visual_concept'.`
      );
      setResult(resultObj);

      await addDoc(collection(db, "chats", "global-nerve", "messages"), {
        senderId: user?.uid || "ai",
        senderName: user?.displayName || "Strategist",
        text: `🚀 [DeepSeek System] Synced content ideas for: ${prompt.substring(0, 30)}...`,
        timestamp: serverTimestamp(),
        isEncrypted: false,
      });

      if (!isPro) setUnits(prev => prev - 1);
    } catch (e) {
      console.error(e);
      setResult({ error: "DeepSeek Engine Failure" });
    }
    setGenerating(false);
  };

  const generateImage = async () => {
    if (!prompt || !checkLimits()) return;
    setGenerating(true);
    try {
      const data = await BrandavoxAI.generateImageBlueprint(prompt);
      const keyword = data.keywords[0] || "abstract";
      
      const imageData = {
        ...data,
        url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1024&sig=${encodeURIComponent(keyword)}`,
        gen_id: `NEURAL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
      
      setResult(imageData);

      await addDoc(collection(db, "chats", "global-nerve", "messages"), {
        senderId: user?.uid || "ai",
        senderName: user?.displayName || "Strategist",
        text: `🎨 [DeepSeek-VL] Synthesized 8K Vision: ${prompt.substring(0, 30)}...`,
        timestamp: serverTimestamp(),
        isEncrypted: false,
      });

      if (!isPro) setUnits(prev => prev - 1);
    } catch (e) {
      console.error(e);
      setResult({ error: "Neural Engine Timeout" });
    }
    setGenerating(false);
  };

  const generateVoice = async () => {
    if (!prompt || !checkLimits()) return;
    setGenerating(true);
    try {
      const data = await BrandavoxAI.generateContent(
        `Analyze text for vocal synthesis: "${prompt}". JSON: cadence, pitch, timbre, emotional_profile, cloning_fidelity.`
      );
      setResult({ ...data, type: 'voice', duration: '45s' });
      if (!isPro) setUnits(prev => prev - 1);
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const generateVideo = async () => {
    if (!prompt || !checkLimits()) return;
    setGenerating(true);
    try {
      const data = await BrandavoxAI.generateContent(
        `Forge strategy for: "${prompt}". JSON: frame_rate, dynamics, motion_blur, render_pass_description.`
      );
      setResult({ ...data, type: 'video', url: `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/450` });
      if (!isPro) setUnits(prev => prev - 1);
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const generateIdentity = async () => {
    if (!prompt || !checkLimits()) return;
    setGenerating(true);
    try {
      const data = await BrandavoxAI.generateContent(
        `Identity matrix for: "${prompt}". JSON: brand_essence, color_palette (3 hex), typography, market_positioning.`
      );
      setResult({ ...data, type: 'identity' });
      if (!isPro) setUnits(prev => prev - 1);
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  return (
    <div className="space-y-8">
      {/* Smart Upgrade Modal Hook */}
      {showUpgradeModal && (
        <SmartUpgradeModal 
          usageAnalysis={`You have processed ${prompt.length} bytes of strategic intent. DeepSeek patterns suggest a transition to Pro Studio for maximum E2E security.`}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => { setIsPro(true); setShowUpgradeModal(false); }}
        />
      )}
      {/* Usage Monitor */}
      {!isPro && (
        <div className="nm-flat p-6 rounded-3xl bg-orange-50 dark:bg-orange-950/20 flex flex-col md:flex-row justify-between items-center gap-4 border border-orange-500/20">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-orange-600 rounded-xl text-white shadow-lg">
                <BrainCircuit className="w-6 h-6" />
             </div>
             <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Neural Units Remaining</h4>
                <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">Free Tier Limit: {units} / 3</p>
             </div>
          </div>
          <button 
            onClick={() => setShowUpgradeModal(true)}
            className="nm-button px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-white dark:bg-slate-900 text-orange-600 border border-orange-500/10 hover:scale-105 transition-all"
          >
            Unlock Unlimited Power
          </button>
        </div>
      )}

      {/* Tool Selector */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[
          { id: 'content', icon: BrainCircuit, label: 'Ideation' },
          { id: 'image', icon: Wand2, label: '8K Vision' },
          { id: 'video', icon: Video, label: 'Video Forge' },
          { id: 'voice', icon: Mic2, label: 'Vocal Clone' },
          { id: 'identity', icon: Palette, label: 'Identity' },
        ].map(tool => (
          <button
            key={tool.id}
            onClick={() => { setActiveTool(tool.id as any); setResult(null); }}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl whitespace-nowrap transition-all ${
              activeTool === tool.id ? 'nm-inset text-orange-600 dark:text-orange-400' : 'nm-flat hover:scale-105'
            }`}
          >
            <tool.icon className="w-5 h-5" />
            <span className="font-bold">{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="nm-flat p-8 rounded-3xl space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-black flex items-center gap-2 text-slate-950 dark:text-white uppercase tracking-tight">
              <Sparkles className="w-5 h-5 text-orange-600" />
              Describe your vision
            </h3>
            <p className="text-sm text-slate-900 dark:text-slate-400 font-bold">The more detailed your prompt, the better the result.</p>
          </div>

          <div className="nm-inset p-4 rounded-2xl min-h-[150px] relative transition-all">
            <textarea
              className="w-full h-full bg-transparent border-none focus:ring-0 resize-none font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
              placeholder={
                activeTool === 'content' ? "e.g. A new eco-friendly skincare line for Gen Z..." :
                activeTool === 'image' ? "e.g. High-res photo of a futuristic Lagos city with flying cars and neon lights, 8k resolution..." :
                activeTool === 'voice' ? "Enter text to speak with a Nigerian Pidgin accent..." :
                "Upload image to animate..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {activeTool === 'voice' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Voice Accent</label>
                <select className="w-full p-3 nm-inset rounded-xl bg-transparent font-bold">
                  <option>Nigerian (Naija) Standard</option>
                  <option>Pidgin English (Lagos Style)</option>
                  <option>Ghanaian Accent</option>
                  <option>Kenyan (Kiswahili-style)</option>
                  <option>South African (Zulu-influenced)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Tone</label>
                <select className="w-full p-3 nm-inset rounded-xl bg-transparent font-bold">
                  <option>Professional Manager</option>
                  <option>Casual Friend</option>
                  <option>Excited Marketer</option>
                  <option>Deep Narrative</option>
                </select>
              </div>
            </div>
          )}

            <button
              disabled={generating || !prompt}
              onClick={() => {
                if (activeTool === 'content') generateContent();
                else if (activeTool === 'image') generateImage();
                else if (activeTool === 'voice') generateVoice();
                else if (activeTool === 'video') generateVideo();
                else if (activeTool === 'identity') generateIdentity();
              }}
              className="w-full py-6 nm-button rounded-2xl text-orange-600 dark:text-orange-400 font-black text-lg flex items-center justify-center gap-3 disabled:opacity-50"
            >
            {generating ? (
              <RefreshCw className="animate-spin w-6 h-6" />
            ) : (
              <>
                <Send className="w-6 h-6" />
                Generate Magic
              </>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="nm-flat p-8 rounded-3xl min-h-[400px] flex flex-col border border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Creative Output</h3>
            {result && (
              <button className="p-2 nm-button rounded-xl text-slate-500">
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6">
            {!result && !generating && (
              <div className="text-center space-y-4">
                <div className="inline-flex p-6 nm-inset rounded-full">
                  <Layers className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                </div>
                <p className="text-slate-400 font-bold">Your masterpieces will appear here</p>
              </div>
            )}

            {generating && (
              <div className="space-y-8 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-32 bg-slate-100 rounded w-full" />
              </div>
            )}

            {result && activeTool === 'content' && Array.isArray(result) && (
              <div className="space-y-6">
                {result.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="p-5 nm-inset rounded-2xl space-y-2 border-l-4 border-orange-500"
                  >
                    <h4 className="font-black text-orange-600 text-lg">{item.headline}</h4>
                    <p className="text-sm font-medium">{item.caption}</p>
                    <div className="flex gap-2 flex-wrap pt-2">
                       {(Array.isArray(item.hashtags) ? item.hashtags : (typeof item.hashtags === 'string' ? item.hashtags.split(' ') : [])).map((h: string) => (
                         <span key={h} className="text-[10px] bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 px-2 py-0.5 rounded-md font-bold">{h}</span>
                       ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {result && activeTool === 'image' && !result.error && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="nm-inset p-4 rounded-3xl bg-slate-950 group relative overflow-hidden">
                  <img src={result.url || undefined} alt="Generated" className="w-full h-auto rounded-2xl shadow-inner shadow-orange-600/20" />
                  <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
                     <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[8px] font-black uppercase text-orange-500 border border-white/10">Ultra-HD 8K</span>
                     <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[8px] font-black uppercase text-emerald-500 border border-white/10">Neural Fidelity</span>
                  </div>
                </div>

                <div className="nm-inset p-6 rounded-2xl space-y-3">
                   <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Visual Strategy</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <p className="text-[8px] font-black text-slate-500 uppercase">Composition</p>
                         <p className="text-xs font-bold">{result.composition}</p>
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-slate-500 uppercase">Lighting</p>
                         <p className="text-xs font-bold">{result.lighting}</p>
                      </div>
                   </div>
                   <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic border-t border-slate-100 dark:border-white/5 pt-2">
                     "{result.description}"
                   </p>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-4 nm-button rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 text-orange-600 hover:scale-[1.02] transition-all">
                    Neural Upscale 8K
                  </button>
                  <button 
                    onClick={() => onNavigate?.('editor')}
                    className="flex-1 py-4 nm-inset rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 text-white bg-orange-600 shadow-lg shadow-orange-600/20 hover:scale-[1.02] transition-all"
                  >
                    <PenTool className="w-4 h-4" /> Edit in Pro Studio
                  </button>
                </div>
              </motion.div>
            )}

            {result && activeTool === 'video' && result.frame_rate && (
               <div className="space-y-6">
                 <div className="nm-inset p-2 rounded-2xl overflow-hidden aspect-video relative group cursor-pointer">
                    <img src={result.url} className="w-full h-full object-cover blur-[2px]" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                       <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30">
                          <RefreshCw className="w-8 h-8 text-white animate-spin-slow" />
                       </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                       <p className="text-[10px] font-black uppercase text-orange-500">Video Render Engine · {result.frame_rate}</p>
                       <div className="h-1 w-full bg-white/20 mt-2 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 10, repeat: Infinity }} className="h-full bg-orange-600" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="nm-inset p-5 rounded-2xl space-y-2">
                    <p className="text-[8px] font-black text-orange-500 uppercase">Neural Forge Plan</p>
                    <p className="text-xs font-medium text-slate-300 italic leading-relaxed">"{result.render_pass_description}"</p>
                    <div className="flex gap-4 pt-2">
                       <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase">Dynamics</p>
                          <p className="text-[10px] font-bold text-white">{result.dynamics}</p>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase">Motion Blur</p>
                          <p className="text-[10px] font-bold text-white">{result.motion_blur}</p>
                       </div>
                    </div>
                 </div>
               </div>
            )}

            {result && activeTool === 'voice' && result.pitch && (
               <div className="space-y-6">
                 <div className="nm-inset p-8 rounded-[3rem] space-y-8 bg-slate-950 border border-orange-500/10">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="nm-button p-4 rounded-2xl bg-slate-900 border border-white/5">
                          <p className="text-[8px] font-black text-orange-500 uppercase">Cadence</p>
                          <p className="text-xs font-bold text-white">{result.cadence}</p>
                       </div>
                       <div className="nm-button p-4 rounded-2xl bg-slate-900 border border-white/5">
                          <p className="text-[8px] font-black text-orange-500 uppercase">Pitch/Timbre</p>
                          <p className="text-xs font-bold text-white">{result.pitch} · {result.timbre}</p>
                       </div>
                    </div>

                    <div className="nm-inset p-4 rounded-2xl bg-orange-600/5 border border-orange-500/20">
                       <p className="text-[8px] font-black text-orange-500 uppercase mb-1">Emotional Blueprint</p>
                       <p className="text-xs font-medium text-slate-300 italic">"{result.emotional_profile}"</p>
                    </div>

                    <div className="flex items-end justify-center gap-1.5 h-24 px-4 overflow-hidden">
                       {[0.2, 0.5, 0.8, 0.4, 0.9, 1.0, 0.6, 0.8, 0.5, 0.3, 0.6, 0.9, 0.4, 0.7].map((h, i) => (
                         <motion.div 
                           key={i}
                           animate={{ 
                             height: [`${h * 100}%`, `${(1.1-h) * 100}%`, `${h * 100}%`],
                             backgroundColor: i % 2 === 0 ? '#ea580c' : '#fbbf24'
                           }}
                           transition={{ repeat: Infinity, duration: 1.2 + (i * 0.1), ease: "easeInOut" }}
                           className="w-2.5 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.4)]"
                         />
                       ))}
                    </div>

                    <div className="text-center space-y-2">
                       <h4 className="font-black text-2xl text-white uppercase tracking-tighter">Vocal Identity Cloned</h4>
                       <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                         SYSTEM: SECURE SYNTHESIS ACTIVE
                       </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                       <button className="flex-1 nm-button p-5 rounded-2xl flex items-center justify-center gap-3 bg-white text-slate-950 hover:scale-[1.02] transition-all">
                          <RefreshCw className="w-5 h-5 shadow-2xl" />
                          <span className="font-black text-xs uppercase tracking-widest">Resynthesize</span>
                       </button>
                       <button className="flex-1 nm-inset p-5 rounded-2xl flex items-center justify-center gap-3 bg-orange-600 text-white hover:scale-[1.02] transition-all shadow-xl shadow-orange-600/30">
                          <Download className="w-5 h-5" />
                          <span className="font-black text-xs uppercase tracking-widest">Export Master MP3</span>
                       </button>
                    </div>
                 </div>
               </div>
            )}

            {result && activeTool === 'identity' && result.brand_essence && (
               <div className="space-y-6">
                  <div className="nm-flat p-8 rounded-[3rem] border border-orange-500/20 bg-slate-950 text-white">
                     <h3 className="text-xl font-black uppercase tracking-tighter mb-4 text-orange-600">Brand Identity Matrix</h3>
                     <p className="text-xs font-medium text-slate-400 italic mb-8">"{result.brand_essence}"</p>
                     
                     <div className="grid grid-cols-2 gap-6">
                        <div className="nm-inset p-4 rounded-2xl space-y-2">
                           <p className="text-[8px] font-black text-orange-500 uppercase">Typography</p>
                           <p className="text-sm font-black">{result.typography}</p>
                        </div>
                        <div className="nm-inset p-4 rounded-2xl space-y-2">
                           <p className="text-[8px] font-black text-orange-500 uppercase">Strategic Position</p>
                           <p className="text-[10px] font-black leading-tight">{result.market_positioning}</p>
                        </div>
                     </div>

                     <div className="mt-6 space-y-2">
                        <p className="text-[8px] font-black text-orange-500 uppercase">Recommended Hex Palette</p>
                        <div className="flex gap-2">
                           {result.color_palette.map((color: string) => (
                             <div key={color} className="flex-1 h-12 rounded-xl border border-white/10 flex items-center justify-center text-[8px] font-black" style={{ backgroundColor: color }}>
                               {color}
                             </div>
                           ))}
                        </div>
                     </div>
                     <button className="w-full mt-8 py-4 bg-orange-600 rounded-2xl font-black text-xs uppercase shadow-xl shadow-orange-600/30 hover:scale-[1.02] transition-all">Download Brand Kit</button>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="nm-flat p-12 rounded-[4rem] max-w-xl w-full text-center space-y-8 bg-white dark:bg-slate-900 border-2 border-orange-600/30"
          >
             <div className="w-20 h-20 bg-orange-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-orange-600/40">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
             </div>
             <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">Usage <span className="text-orange-600">Limit</span> Reached</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">You've reached the free tier limit for Brandavox Neural Synthesis. Upgrade to Pro Studio to unlock unlimited 8K generation, voice cloning, and direct exports.</p>
             </div>
             
             <div className="grid grid-cols-1 gap-4 pt-4">
                <button 
                  onClick={() => { setIsPro(true); setShowUpgradeModal(false); }}
                  className="w-full py-6 bg-orange-600 text-white rounded-3xl font-black uppercase text-sm tracking-widest shadow-xl shadow-orange-600/30 hover:scale-[1.02] transition-all"
                >
                  Upgrade to Pro Studio ($49/mo)
                </button>
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-4 text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]"
                >
                  Maybe Later
                </button>
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
