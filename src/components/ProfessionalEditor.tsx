import React, { useState } from "react";
import { 
  Layers, 
  Square, 
  Type, 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  Undo, 
  Redo, 
  Palette, 
  Scissors, 
  Maximize, 
  Zap, 
  Sparkles, 
  SunMedium, 
  Focus, 
  Aperture,
  MessageSquare,
  Send,
  Pen,
  Brush,
  Eraser,
  Crop,
  Wind,
  Layout
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProfessionalEditorProps {
  onNavigate?: (tab: string) => void;
}

export default function ProfessionalEditor({ onNavigate }: ProfessionalEditorProps) {
  const [activeLayer, setActiveLayer] = useState(0);
  const [layers, setLayers] = useState([
    { id: 0, name: "Background (8K)", type: "image", visible: true },
    { id: 1, name: "Product Focus", type: "mask", visible: true },
    { id: 2, name: "Brand Typography", type: "text", visible: true },
  ]);

  const [activeTool, setActiveTool] = useState("select");
  const [isPro, setIsPro] = useState(false);

  const neuralFilters = [
    { name: "Neural BG Removal", icon: Scissors, desc: "Alpha-channel isolation", pro: false },
    { name: "8K Upscale", icon: Maximize, desc: "Detail reconstruction", pro: true },
    { name: "Color Grading", icon: Palette, desc: "LUT matching", pro: false },
    { name: "Scene Relighting", icon: SunMedium, desc: "Dynamic shadows", pro: true },
    { name: "Product Mockup", icon: Layout, desc: "3D Perspective warp", pro: true },
    { name: "Restoration", icon: Wind, desc: "Damage recovery", pro: true },
  ];

  const handleExport = () => {
    if (!isPro) {
      alert("Pro Studio subscription required for 8K Master Export.");
      return;
    }
    // real export logic here
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button className="px-4 py-2 nm-button rounded-xl text-[10px] font-black uppercase text-orange-600">File</button>
            <button className="px-4 py-2 nm-button rounded-xl text-[10px] font-black uppercase text-slate-500">Edit</button>
            <button className="px-4 py-2 nm-button rounded-xl text-[10px] font-black uppercase text-slate-500">Image</button>
            <button 
              onClick={() => onNavigate?.('ai_studio_image')}
              className="px-4 py-2 nm-button rounded-xl text-[10px] font-black uppercase text-orange-600 flex items-center gap-2"
            >
              <Sparkles className="w-3 h-3" /> AI Synth
            </button>
          </div>
         <div className="flex gap-3">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-2 nm-button rounded-xl text-orange-600 font-black text-xs uppercase"
            >
               <Download className="w-4 h-4" /> Export 8K
            </button>
         </div>
      </div>
      
      <div className="flex h-[calc(100vh-18rem)] gap-6 overflow-hidden">
      {/* Tool Sidebar */}
      <div className="w-20 nm-flat rounded-[2.5rem] flex flex-col items-center py-8 gap-3 border border-slate-100 dark:border-white/5 shrink-0">
        {[
          { id: 'select', icon: Focus, title: 'Select' },
          { id: 'pen', icon: Pen, title: 'Vector Pen' },
          { id: 'brush', icon: Brush, title: 'Neural Brush' },
          { id: 'eraser', icon: Eraser, title: 'Smart Eraser' },
          { id: 'crop', icon: Crop, title: 'Aspect Crop' },
          { id: 'shapes', icon: Square, title: 'Geometric' },
          { id: 'text', icon: Type, title: 'Typography' },
          { id: 'fx', icon: Sparkles, title: 'Neural FX' },
          { id: 'palette', icon: Palette, title: 'Color' },
        ].map((tool) => (
          <button 
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={tool.title}
            className={`p-3.5 rounded-2xl transition-all ${activeTool === tool.id ? 'nm-inset text-orange-600' : 'nm-button text-slate-400 hover:text-slate-600'}`}
          >
            <tool.icon className="w-5 h-5" />
          </button>
        ))}
        <div className="flex-1" />
        <button className="p-3 nm-button rounded-xl text-slate-400 hover:text-orange-600"><Undo className="w-4 h-4" /></button>
        <button className="p-3 nm-button rounded-xl text-slate-400 hover:text-orange-600"><Redo className="w-4 h-4" /></button>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 nm-inset rounded-[3rem] bg-slate-100 dark:bg-slate-900 border-8 border-white dark:border-[#1e1e24] shadow-2xl relative overflow-hidden flex items-center justify-center p-12">
        <div className="absolute top-6 left-6 flex gap-4">
           <div className="px-4 py-2 nm-button rounded-xl text-[10px] font-black uppercase text-slate-500 tracking-widest bg-white/50 backdrop-blur-md">Canvas: 7680 x 4320 (8K)</div>
           <div className="px-4 py-2 nm-button rounded-xl text-[10px] font-black uppercase text-emerald-500 tracking-widest bg-white/50 backdrop-blur-md italic">Hardware Accel: ON</div>
        </div>

        <motion.div 
          className="w-full max-w-3xl aspect-[16/9] nm-flat bg-white dark:bg-black rounded-xl overflow-hidden relative group"
          whileHover={{ scale: 1.01 }}
        >
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="p-12 border-2 border-dashed border-orange-500/30 rounded-2xl flex flex-col items-center gap-4">
                <Sparkles className="w-12 h-12 text-orange-500 animate-pulse" />
                <p className="font-black text-xl text-white uppercase tracking-tighter mix-blend-difference">Awaiting Neural Input</p>
             </div>
          </div>
        </motion.div>

        {/* Floating Tooltips */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-white/20 dark:bg-black/20 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
           <button className="px-6 py-3 nm-button rounded-xl font-black text-xs text-orange-600">EXPORT 8K</button>
           <button className="px-6 py-3 nm-button rounded-xl font-black text-xs text-white">SAVE PROJECT</button>
        </div>
      </div>

      {/* Properties & Layers Pane */}
      <div className="w-80 space-y-6 flex flex-col overflow-y-auto pr-2 shrink-0">
        {/* Adjustments Pane */}
        <div className="nm-flat p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shrink-0">
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white mb-6 flex items-center gap-2">
              <SunMedium className="w-4 h-4 text-orange-600" /> Pro Adjustments
           </h3>
           <div className="space-y-6">
              {[
                { label: "Exposure", val: 0.4 },
                { label: "Contrast", val: -0.2 },
                { label: "Saturation", val: 1.2 },
                { label: "Vibrance", val: 0.8 },
              ].map((adj, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                      <span>{adj.label}</span>
                      <span className="text-orange-600">{(adj.val * 100).toFixed(0)}%</span>
                   </div>
                   <div className="relative h-1.5 nm-inset rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.abs(adj.val * 100)}%` }}
                        className="absolute inset-y-0 left-0 bg-orange-600"
                      />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Neural Engine Pane */}
        <div className="nm-flat p-6 rounded-[2.5rem] border border-orange-100 dark:border-orange-500/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-600" /> Neural Filters
          </h3>
          <div className="grid grid-cols-2 gap-3">
             {neuralFilters.map((filter, i) => (
               <button 
                key={i} 
                onClick={() => { if(filter.pro && !isPro) alert("Upgrade to Pro Studio to unlock this filter."); }}
                className="p-4 nm-button rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-all text-center relative overflow-hidden group"
               >
                  {filter.pro && !isPro && (
                    <div className="absolute top-1 right-1">
                      <Sparkles className="w-3 h-3 text-orange-600 animate-pulse" />
                    </div>
                  )}
                  <filter.icon className={`w-5 h-5 ${filter.pro && !isPro ? 'text-slate-300' : 'text-slate-600 dark:text-orange-400'}`} />
                  <p className={`text-[9px] font-black uppercase leading-tight ${filter.pro && !isPro ? 'text-slate-400' : ''}`}>{filter.name}</p>
                  {filter.pro && !isPro && (
                    <span className="text-[7px] font-black text-orange-600 mt-1 uppercase tracking-tighter">Pro Only</span>
                  )}
               </button>
             ))}
          </div>
        </div>

        {/* Layers Pane */}
        <div className="nm-flat p-6 rounded-[2.5rem] flex flex-col h-[50%]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-600" /> Layer Stack
            </h3>
            <button className="p-2 nm-button rounded-lg text-orange-600"><Layers className="w-3 h-3" /></button>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
             {layers.map((layer, i) => (
               <div 
                key={layer.id} 
                onClick={() => setActiveLayer(i)}
                className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${activeLayer === i ? 'nm-inset border border-orange-500/20' : 'nm-flat hover:bg-slate-50 dark:hover:bg-white/5'}`}
               >
                  <div className="w-10 h-10 rounded-lg nm-inset bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {layer.type === 'image' && <ImageIcon className="w-4 h-4 text-blue-500" />}
                    {layer.type === 'mask' && <Aperture className="w-4 h-4 text-emerald-500" />}
                    {layer.type === 'text' && <Type className="w-4 h-4 text-orange-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-slate-800 dark:text-white truncate">{layer.name}</p>
                    <p className="text-[8px] font-bold text-slate-400">Opacity: 100%</p>
                  </div>
                  <button className="text-slate-300 hover:text-rose-500"><Trash2 className="w-3 h-3" /></button>
               </div>
             ))}
          </div>
        </div>

        {/* Pro Editor Mini-Chat */}
        <div className="nm-flat p-6 rounded-[2.5rem] flex flex-col flex-1 min-h-[300px]">
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-600" /> Designer Chat
           </h3>
           <div className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2">
              <div className="flex justify-start">
                 <div className="max-w-[80%] nm-button p-3 rounded-2xl rounded-tl-none">
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Client: "Can we try the 8K upscale on the logo?"</p>
                 </div>
              </div>
              <div className="flex justify-end">
                 <div className="max-w-[80%] nm-button bg-orange-600 p-3 rounded-2xl rounded-tr-none text-white">
                    <p className="text-[10px] font-bold">You: "Processing neural upscale now. 98% complete."</p>
                 </div>
              </div>
           </div>
           <div className="relative">
              <input 
                type="text" 
                placeholder="Message team..." 
                className="w-full nm-inset p-4 pr-12 rounded-2xl text-[10px] font-bold bg-transparent outline-none border-none dark:text-white"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 nm-button p-2 rounded-xl text-orange-600">
                 <Send className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
      </div>
    </div>
  );
}
