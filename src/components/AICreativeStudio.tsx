import React, { useState } from "react";
import { BrainCircuit, Sparkles, Wand2, Mic2, Video, Send, Download, RefreshCw, Layers, Palette, PenTool, Info, FileAudio, Share2, FileVideo, Scissors, FileText, Monitor, Layout, Image as ImageIcon, Briefcase, Zap } from "lucide-react";
import { motion } from "motion/react";
import { BrandavoxAI } from "../lib/ai/gemini-engine";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import SmartUpgradeModal from "./SmartUpgradeModal";

interface AICreativeStudioProps {
  user: any;
  activeBrand?: any;
  onNavigate?: (tab: string) => void;
  initialTool?: 'content' | 'image' | 'video' | 'voice' | 'identity' | 'video_utils' | 'graphics' | 'strategic';
}

export default function AICreativeStudio({ user, activeBrand, onNavigate, initialTool }: AICreativeStudioProps) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<'content' | 'image' | 'video' | 'voice' | 'identity' | 'video_utils' | 'graphics' | 'strategic'>(initialTool || 'content');

  React.useEffect(() => {
    if (initialTool) {
      setActiveTool(initialTool);
      setResult(null);
    }
  }, [initialTool]);
  const [selectedAccent, setSelectedAccent] = useState("Nigerian (Naija) Standard");
  const [selectedTone, setSelectedTone] = useState("Professional Manager");
  const [selectedArchetype, setSelectedArchetype] = useState("The Hero");
  const [variationCount, setVariationCount] = useState(3);
  const [brandValues, setBrandValues] = useState("");
  const [brandVoice, setBrandVoice] = useState("Balanced & Professional");
  const [targetDemographics, setTargetDemographics] = useState("");
  const [isCloning, setIsCloning] = useState(false);
  const [cloneStatus, setCloneStatus] = useState<"idle" | "recording" | "analyzing" | "completed">("idle");
  const [cadence, setCadence] = useState(50);
  const [pitchValue, setPitchValue] = useState(50);
  const [emotionStrength, setEmotionStrength] = useState(70);
  const [pausing, setPausing] = useState(30);
  const [breathiness, setBreathiness] = useState(40);
  const [hoveredParam, setHoveredParam] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"mp3" | "wav" | "flac" | "video">("mp3");
  const [videoFormat, setVideoFormat] = useState<"mp4" | "webm">("mp4");
  const [videoResolution, setVideoResolution] = useState<"1080p" | "4K">("1080p");
  const [videoAspectRatio, setVideoAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [generateThumbnail, setGenerateThumbnail] = useState(false);
  const [brandMission, setBrandMission] = useState("");
  const [brandNiche, setBrandNiche] = useState("");
  const [creativeGoal, setCreativeGoal] = useState<string>("commercial");
  const [targetPlatform, setTargetPlatform] = useState<string>("youtube");
  const [autoUpscale, setAutoUpscale] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [imgExportFormat, setImgExportFormat] = useState<"png" | "jpg" | "webp">("png");
  const [imgCompression, setImgCompression] = useState(80);
  const [units, setUnits] = useState(3); // Starting with 3 free units
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [technicalSpecs, setTechnicalSpecs] = useState("");
  const [styleKeywords, setStyleKeywords] = useState("");

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

      // Only notify the Nerve if we have a real authenticated user
      if (user && user.uid !== 'guest-user') {
        await addDoc(collection(db, "chats", "global-nerve", "messages"), {
          senderId: user?.uid || "ai",
          senderName: user?.displayName || "Strategist",
          text: `🚀 [Neural System] Synced content ideas for: ${prompt.substring(0, 30)}...`,
          timestamp: serverTimestamp(),
          isEncrypted: false,
        });
      }

      if (!isPro) setUnits(prev => prev - 1);
    } catch (e) {
      console.error(e);
      setResult({ error: "Gemini Engine Failure" });
    }
    setGenerating(false);
  };

  const generateImage = async () => {
    if (!prompt || !checkLimits()) return;
    setGenerating(true);
    try {
      const data = await BrandavoxAI.generateImageBlueprint(
        `Concept: ${prompt}. Target Output: ${creativeGoal} for ${targetPlatform}. 
         Ensure the visual strategy considers the ${targetPlatform} layout requirements.`
      );
      const keyword = data.keywords[0] || creativeGoal || "abstract";
      
      const imageData = {
        ...data,
        isUpscaled: autoUpscale,
        url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=${autoUpscale ? '2048' : '1024'}&sig=${encodeURIComponent(keyword)}`,
        gen_id: `NEURAL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
      
      setResult(imageData);

      // Only notify the Nerve if we have a real authenticated user
      if (user && user.uid !== 'guest-user') {
        await addDoc(collection(db, "chats", "global-nerve", "messages"), {
          senderId: user?.uid || "ai",
          senderName: user?.displayName || "Strategist",
          text: `🎨 [Neural-VL] Synthesized 8K Vision: ${prompt.substring(0, 30)}...`,
          timestamp: serverTimestamp(),
          isEncrypted: false,
        });
      }

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
        `Analyze text for hyper-realistic vocal synthesis in ${selectedAccent} with a ${selectedTone} tone. 
        Input text: "${prompt}". 
        Strategic Parameters: 
        - Cadence/Speech Rate: ${cadence}/100 
        - Baseline Pitch: ${pitchValue}/100 
        - Emotional Resonance Strength: ${emotionStrength}/100
        - Pausing Naturalness: ${pausing}/100
        - Breathing Intensity: ${breathiness}/100
        
        Ensure the output captures hyper-realistic breathing patterns, accurate phonetics for the ${selectedAccent}, 
        and natural emotional inflections strictly aligned with these parameters. 
        Response must be JSON: cadence, pitch, timbre, emotional_profile, cloning_fidelity.`
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
      let systemPrompt = `Forge strategy for video production: "${prompt}". 
        Technical Requirements:
        - Export Format: ${videoFormat.toUpperCase()}
        - Target Resolution: ${videoResolution}
        - Aspect Ratio: ${videoAspectRatio === '16:9' ? '16:9 (Landscape)' : '9:16 (Vertical/Shorts)'}
        - Optimization: ${targetPlatform === 'youtube' ? 'YouTube Algorithm Optimization' : 'General Optimization'}
        - Visual Assets: ${generateThumbnail ? 'Generate YouTube Thumbnail blueprint' : 'Standard assets'}`;

      if (creativeGoal === 'motion_ad') {
        systemPrompt = `Act as a senior neural motion designer. Synthesize a PRODUCT MOTION AD strategy for: "${prompt}".
          Focus: 4K Photorealistic assembly/disassembly, liquid simulation, or dynamic part movement.
          Context: Product covers, burger assembly, mobile part explosion views.
          Resolution Required: ${videoResolution}. Format: ${videoFormat.toUpperCase()}.
          Response must include cinematic lighting rigs, motion path logic, and render pass details for high-end commercials.
          JSON schema: frame_rate, dynamics, motion_blur, render_pass_description, encoding_preset.`;
      } else {
        systemPrompt += `\nResponse must include optimized parameters for this format and resolution.
          JSON schema: frame_rate, dynamics, motion_blur, render_pass_description, encoding_preset.`;
      }

      const data = await BrandavoxAI.generateContent(systemPrompt);
      const width = videoAspectRatio === '16:9' ? 800 : 450;
      const height = videoAspectRatio === '16:9' ? 450 : 800;
      setResult({ 
        ...data, 
        type: 'video', 
        url: `https://picsum.photos/seed/${encodeURIComponent(prompt)}/${width}/${height}`, 
        format: videoFormat, 
        resolution: videoResolution,
        aspectRatio: videoAspectRatio,
        thumbnailGenerated: generateThumbnail
      });
      if (!isPro) setUnits(prev => prev - 1);
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const generateIdentity = async () => {
    if (!prompt || !checkLimits()) return;
    setGenerating(true);
    try {
      const data = await BrandavoxAI.generateContent(
        `Synthesize a complete Brand Identity matrix for: "${prompt}". 
        Strategic Context:
        - Primary Niche/Industry: ${brandNiche || "Not specified"}
        - Core Mission: ${brandMission || "Not specified"}
        - Strategic Archetype: ${selectedArchetype}
        - Brand Core Values: ${brandValues || "Not specified"}
        - Target Audience Demographics: ${targetDemographics || "Not specified"}
        - Brand Voice & Tone: ${brandVoice}
        
        Include:
        1. Brand Essence (Aligned with archetype and values)
        2. Primary Color Palette (Hex codes)
        3. ${variationCount} Alternative Palette Variations (Each variation should be a distinct array of 4-5 hex codes)
        4. Typography Pairings
        5. Market Positioning (Considering demographics)
        6. Unique Value Proposition
        7. Visual Language Strategy (Specific aesthetic recommendations to resonate with the target demographics)
        8. Voice & Tone Guidelines (Specific linguistic rules based on "${brandVoice}")
        9. Industry-Specific Moodboard Logic (Tailored for ${brandNiche})
        
        Response must be valid JSON and exactly follow this schema: { brand_essence: string, color_palette: string[], palette_variations: string[][], typography: string, market_positioning: string, uvp: string, visual_strategy: string, voice_guidelines: string, industry_logic: string }. 
        The palette_variations field MUST be an array containing exactly ${variationCount} sub-arrays of hex codes.`
      );
      setResult({ ...data, type: 'identity' });
      if (!isPro) setUnits(prev => prev - 1);
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const executeNeuralOperation = async (operationType: string) => {
    if (!prompt || !checkLimits()) return;
    setGenerating(true);
    try {
      let systemPrompt = `Neural Operation: ${operationType}. Input: "${prompt}". 
        Context: Goal: ${creativeGoal}, Platform: ${targetPlatform}.
        Synthesize professional parameters for this creative workflow.
        Response must be valid JSON including status (string), parameters (object), and suggested_direction (string).`;

      if (operationType === 'strategic') {
        if (creativeGoal === 'prompt_gen') {
          const fusionPrompt = `${prompt}${technicalSpecs ? ` | Technical Specs: ${technicalSpecs}` : ''}${styleKeywords ? ` | Style Keywords: ${styleKeywords}` : ''}`;
          systemPrompt = `You are an AI Prompt Engineer. Create a highly optimized, technical, and descriptive prompt for the following core concept: "${fusionPrompt}". 
            Ensure you explicitly incorporate the provided Technical Specs and Style Keywords into the resulting optimized prompt.
            Include keywords for lighting, composition, style, and technical specs (e.g., 8k, Octane Render).
            Response must be JSON: { status: string, parameters: { optimized_prompt: string, style_tags: string, negative_prompt: string }, suggested_direction: string }`;
        } else if (creativeGoal === 'script_summarize') {
          systemPrompt = `Analyze and summarize the following script or concept into a high-impact creative brief: "${prompt}".
            Response must be JSON: { status: string, parameters: { key_themes: string, target_hook: string, tone_analysis: string }, suggested_direction: string }`;
        }
      } else if (operationType === 'graphics') {
        const isPremiumMockup = ['packaging_mockup', 'mockup', 'packaging', 'billboard', 'storefront'].includes(creativeGoal);
        const isLogo = creativeGoal === 'logo';
        const isSocial = creativeGoal === 'social_post' || creativeGoal === 'thumbnail';
        const isAd = creativeGoal === 'ad_creative' || creativeGoal === 'ad';
        
        if (isLogo) {
          systemPrompt = `Act as a senior world-class brand identity designer. Create a professional LOGO SYMBOL & LOGOTYPE blueprint for: "${prompt}".
            Focus: Minimalism, scalability, golden ratio geometry, and timeless aesthetic.
            Include: Vector hierarchy, font pairings (one serif, one sans-serif), brand color symbolism, and negative space usage.
            Response must be JSON: { status: string, parameters: { vector_blueprint: string, typography_pairings: string, palette_psychology: string, construction_logic: string }, suggested_direction: string }`;
        } else if (isPremiumMockup) {
          systemPrompt = `Act as a senior high-end brand designer. Synthesize a PREMIUM 8K MOCKUP blueprint for ${creativeGoal.replace('_', ' ')} based on: "${prompt}".
             Focus: Hyper-realistic lighting, photorealistic textures (glass, matte, metallic), environment mapping, and client-ready presentation.
             Parameters: Detailed render layers, smart object placement for logos, material specs, and color finish (CMYK).
             Response must be JSON: { status: string, parameters: { canvas_size: string, mockup_render_spec: string, material_fidelity: string, logo_placement_logic: string }, suggested_direction: string }`;
        } else if (isSocial || isAd) {
          systemPrompt = `Act as a senior growth designer and viral marketing specialist. Synthesize a professional ${creativeGoal.replace('_', ' ')} blueprint for: "${prompt}".
             Focus: Psychologically optimized layout for high CTR, scroll-stopping visual hierarchy, and platform-native aesthetics (e.g., YouTube, Instagram, TikTok).
             Include: Typography tailored for mobile legibility, focal point positioning, "power words" placement, and optimized brand attribute integration.
             Response must be JSON: { status: string, parameters: { canvas_size: string, typography_pairings: string, palette_hex: string, visual_hierarchy_logic: string }, suggested_direction: string }`;
        } else {
          systemPrompt = `Act as a senior graphic designer. Synthesize a professional design blueprint for a ${creativeGoal.replace('_', ' ')} for the following concept: "${prompt}".
             Focus on ${targetPlatform} dimensions and best practices.
             Include: Recommended layer hierarchy, font pairings, primary skin tones or brand colors, and copy positioning.
             Response must be JSON: { status: string, parameters: { canvas_size: string, typography_pairings: string, palette_hex: string, layer_structure: string }, suggested_direction: string }`;
        }
      } else if (operationType === 'video_utils') {
        systemPrompt = `Act as a neural video analyst. Apply ${creativeGoal} logic to the following request/content: "${prompt}".
          Include: Extraction markers, summary insights, or transcript snippets based on the goal.
          Response must be JSON: { status: string, parameters: { operation_result: string, confidence_score: string, optimized_for: string }, suggested_direction: string }`;
      }

      const data = await BrandavoxAI.generateContent(systemPrompt);
      setResult({ ...data, type: operationType, tool: activeTool });
      if (!isPro) setUnits(prev => prev - 1);
    } catch (e) {
      console.error(e);
      setResult({ error: "Neural Engine Core Failure" });
    }
    setGenerating(false);
  };

  const handleGenerateMore = () => {
    if (activeTool === 'content') generateContent();
    else if (activeTool === 'image') generateImage();
    else if (activeTool === 'voice') generateVoice();
    else if (activeTool === 'video') generateVideo();
    else if (activeTool === 'identity') generateIdentity();
    else executeNeuralOperation(activeTool);
  };

  const simulateVoiceCloning = async () => {
    setCloneStatus("recording");
    await new Promise(r => setTimeout(r, 3000));
    setCloneStatus("analyzing");
    await new Promise(r => setTimeout(r, 2000));
    setCloneStatus("completed");
    setResult({
      type: 'voice',
      cloned: true,
      fidelity: "99.2%",
      params: { cadence: 45, pitch: 52, emotional_depth: "Deep" }
    });
  };

  const handleUpscaleImage = async () => {
    setIsUpscaling(true);
    // Simulate neural upscaling
    await new Promise(resolve => setTimeout(resolve, 2000));
    setResult((prev: any) => ({
      ...prev,
      isUpscaled: true,
      url: prev.url ? prev.url + "&w=2048" : prev.url // Just a way to change signal/size
    }));
    setIsUpscaling(false);
  };

  const handleImageExport = () => {
    if (!result?.url) return;
    setIsExporting(true);
    setTimeout(() => {
      alert(`Neural Studio: High-resolution ${imgExportFormat.toUpperCase()} asset synthesized with ${imgCompression}% quality and downloaded successfully.`);
      const link = document.createElement('a');
      link.href = result.url;
      link.referrerPolicy = "no-referrer";
      link.download = `brandavox-${result.gen_id || 'vision'}.${imgExportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 1000);
  };

  const handleShare = async () => {
    if (!result?.url) return;
    
    const shareData = {
      title: 'Neural Vision by Brandavox',
      text: `Synthesized with Brandavox AI Strategist: ${prompt.substring(0, 50)}...`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
      window.open(twitterUrl, '_blank');
    }
  };

  const handleExportVoice = async (format: string) => {
    setIsExporting(true);
    setExportFormat(format as any);
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(`Neural Studio: Vocal Master Waveform exported successfully as .${format.toUpperCase()}`);
    setIsExporting(false);
  };

  const VocalParameter = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 100, 
    tooltip, 
    id 
  }: { 
    label: string; 
    value: number; 
    onChange: (val: number) => void; 
    tooltip: string;
    id: string;
    min?: number;
    max?: number;
  }) => (
    <div className="space-y-3 group/param relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
          <div className="relative group/info">
            <Info className="w-3 h-3 text-slate-300 hover:text-orange-500 cursor-help transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-slate-900/95 backdrop-blur-md text-[10px] text-white rounded-lg opacity-0 group-hover/info:opacity-100 pointer-events-none transition-all duration-200 z-50 shadow-2xl border border-white/10 leading-tight">
              {tooltip}
            </div>
          </div>
        </div>
        <motion.div 
          initial={false}
          animate={{ x: [0, -2, 0] }}
          transition={{ duration: 0.2 }}
          className="px-2 py-0.5 nm-inset rounded-full bg-orange-600/5"
        >
          <span className="text-[10px] font-black text-orange-600">
            {value}%
          </span>
        </motion.div>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
          <motion.div 
            initial={false}
            animate={{ width: `${value}%` }}
            className="h-full bg-orange-600"
          />
        </div>
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute w-full h-1.5 bg-transparent rounded-lg appearance-none cursor-pointer accent-orange-600 z-10"
        />
        {/* Glow indicator */}
        <motion.div 
          animate={{ left: `${value}%` }}
          className="absolute w-4 h-4 rounded-full bg-orange-600/20 blur-md pointer-events-none -ml-2"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Smart Upgrade Modal Hook */}
      {showUpgradeModal && (
        <SmartUpgradeModal 
          usageAnalysis={`You have processed ${prompt.length} bytes of strategic intent. Neural patterns suggest a transition to Pro Studio for maximum E2E security.`}
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
      <div className="flex gap-4 overflow-x-auto pb-6 px-1 scrollbar-hide">
        {[
          { id: 'content', icon: BrainCircuit, label: 'Strategy Core', desc: 'Campaign Intelligence' },
          { id: 'image', icon: Wand2, label: '8K Vision', desc: 'Neural Image Gen' },
          { id: 'video', icon: Video, label: 'Motion Forge', desc: 'Movie & Ads Synth' },
          { id: 'voice', icon: Mic2, label: 'Voice Lab', desc: 'Vocal Master' },
          { id: 'graphics', icon: Layout, label: 'Design Studio', desc: 'Flyers & Thumbs' },
          { id: 'video_utils', icon: Scissors, label: 'Neural Utils', desc: 'Reels & Converter' },
          { id: 'identity', icon: Palette, label: 'Identity Hub', desc: 'Brand Matrix' },
          { id: 'strategic', icon: Zap, label: 'Neural Prompts', desc: 'Auto-Engine' },
        ].map(tool => (
          <button
            key={tool.id}
            onClick={() => { 
              setActiveTool(tool.id as any); 
              setResult(null); 
              if (tool.id === 'strategic') setCreativeGoal('prompt_gen');
              else if (tool.id === 'image') setCreativeGoal('commercial');
              else if (tool.id === 'video') setCreativeGoal('commercial');
              else if (tool.id === 'graphics') setCreativeGoal('logo');
              else if (tool.id === 'video_utils') setCreativeGoal('reels_cutter');
            }}
            className={`flex items-center gap-4 px-6 py-5 rounded-3xl whitespace-nowrap transition-all border ${
              activeTool === tool.id 
                ? 'nm-inset border-orange-500/30 text-orange-600 dark:text-orange-400' 
                : 'nm-flat border-transparent hover:scale-105 opacity-70 hover:opacity-100'
            }`}
          >
            <tool.icon className="w-6 h-6" />
            <div className="text-left">
              <span className="block font-black text-xs uppercase tracking-widest">{tool.label}</span>
              <span className="block text-[8px] font-bold opacity-60 uppercase tracking-tighter">{tool.desc}</span>
            </div>
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
                activeTool === 'voice' ? "Enter text for hyper-realistic vocal synthesis with traditional accents..." :
                activeTool === 'strategic' ? "Enter your core creative concept for neural prompt refinement (e.g. A futuristic luxury car in a desert)..." :
                activeTool === 'graphics' ? "Describe the graphic design needed (e.g. A minimalist logo for a tech startup)..." :
                activeTool === 'identity' ? "Describe your brand concept (e.g. A sustainable energy company for emerging markets)..." :
                "Enter details for neural synthesis..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          
          {activeTool === 'image' && (
            <div className="space-y-6">
              <div className="nm-flat p-6 rounded-3xl border border-orange-600/10 flex items-center justify-between group hover:border-orange-600/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-600/10 rounded-2xl text-orange-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Master Upscaling</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Auto-synthesize 8K resolution</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAutoUpscale(!autoUpscale)}
                  className={`w-14 h-7 rounded-full transition-all relative p-1 cursor-pointer ${autoUpscale ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <motion.div 
                    animate={{ x: autoUpscale ? 28 : 0 }}
                    className="w-5 h-5 rounded-full bg-white shadow-lg"
                  />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Export Ecosystem</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setTargetPlatform('photoshop')} className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all ${targetPlatform === 'photoshop' ? 'bg-orange-600 text-white' : 'nm-flat text-slate-400'}`}>Photoshop (PSD)</button>
                  <button onClick={() => setTargetPlatform('canva')} className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all ${targetPlatform === 'canva' ? 'bg-orange-600 text-white' : 'nm-flat text-slate-400'}`}>Canva (JSON)</button>
                </div>
              </div>
            </div>
          )}

          {activeTool === 'voice' && (
            <div className="space-y-6">
              {/* Cloning Control */}
              <div className="p-6 nm-flat rounded-3xl border border-orange-600/10 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                  <Mic2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">Neural Voice Cloning</h4>
                  <p className="text-xs text-slate-500 font-medium">Record a 5-second sample to clone your traditional accent.</p>
                </div>
                
                <button 
                  onClick={simulateVoiceCloning}
                  className={cn(
                    "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                    cloneStatus === "idle" ? "bg-slate-900 text-white hover:bg-orange-600" :
                    cloneStatus === "recording" ? "bg-red-600 text-white animate-pulse" :
                    cloneStatus === "analyzing" ? "bg-amber-500 text-white" :
                    "bg-emerald-600 text-white"
                  )}
                >
                  {cloneStatus === "idle" && "Start Training"}
                  {cloneStatus === "recording" && "Recording Sample..."}
                  {cloneStatus === "analyzing" && "Analyzing Neural Waves..."}
                  {cloneStatus === "completed" && "Clone Ready"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Global Voice Accent</label>
                  <select 
                    value={selectedAccent}
                    onChange={(e) => setSelectedAccent(e.target.value)}
                    className="w-full p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white border-none focus:ring-0 appearance-none cursor-pointer"
                  >
                    <optgroup label="Africa">
                      <option>Nigerian (Naija) Standard</option>
                      <option>Nigerian (Pidgin) Casual</option>
                      <option>Ghanaian Standard</option>
                      <option>Kenyan (English-Swahili)</option>
                      <option>South African (Ubuntu Tone)</option>
                    </optgroup>
                    <optgroup label="Global">
                      <option>United States (Natural Neutral)</option>
                      <option>United States (Professional/News)</option>
                      <option>United Kingdom (RP British)</option>
                      <option>United Kingdom (London Casual)</option>
                      <option>Canadian (Oshawa Style)</option>
                      <option>Australian (Outback Natural)</option>
                    </optgroup>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Vocal Tone & Personality</label>
                  <select 
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value)}
                    className="w-full p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white border-none focus:ring-0 appearance-none cursor-pointer"
                  >
                    <option value="Professional Manager">Professional (Corporate/News)</option>
                    <option value="Casual Friend">Casual (Podcast/Friendly)</option>
                    <option value="Emotional Storyteller">Emotional (Dramatic/Deep)</option>
                    <option value="Excited Marketer">Highly Energetic (Sales/Ads)</option>
                    <option value="Gentle Meditation">Calm & Zen (Soothing)</option>
                  </select>
                </div>
              </div>

              {/* Advanced Parameters */}
              <div className="p-8 nm-inset rounded-3xl space-y-8 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-white/5">
                <div className="space-y-6">
                  <VocalParameter 
                    id="cadence"
                    label="Speech Rate (WPM)"
                    value={cadence}
                    onChange={setCadence}
                    tooltip="Determines the words-per-minute (WPM) count. High values create energetic, fast-paced delivery typically used in fast-paced commercials, while low values result in a measured, calm pace for storytelling."
                  />
                  
                  <VocalParameter 
                    id="pitch"
                    label="Pitch"
                    value={pitchValue}
                    onChange={setPitchValue}
                    tooltip="Varies the fundamental frequency of the voice. Shift to higher values for a more youthful or urgent sound, or lower for a deep, authoritative, and grounded voice."
                  />

                  <VocalParameter 
                    id="emotion"
                    label="Emotional Resonance"
                    value={emotionStrength}
                    onChange={setEmotionStrength}
                    tooltip="Scales the intensity of the emotional character. High intensity adds dramatic inflections and soul, while low intensity maintains a steady, objective monotone."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <VocalParameter 
                      id="pausing"
                      label="Pausing"
                      value={pausing}
                      onChange={setPausing}
                      tooltip="Determines the frequency and duration of neural-calculated breath gaps."
                    />
                    <VocalParameter 
                      id="breathiness"
                      label="Breathiness"
                      value={breathiness}
                      onChange={setBreathiness}
                      tooltip="Controls the air-to-voice ratio in the synthetic vocal apparatus."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTool === 'graphics' && (
            <div className="space-y-6">
              <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Neural Design Presets</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 nm-inset rounded-2xl bg-white dark:bg-slate-900">
                      {[
                        { id: 'logo', label: 'Logo' },
                        { id: 'thumbnail', label: 'Thumbnail' },
                        { id: 'flyer', label: 'Flyer' },
                        { id: 'banner', label: 'Banner' },
                        { id: 'ad_creative', label: 'Ad Creative' },
                        { id: 'packaging_mockup', label: 'Packaging Mockup' },
                        { id: 'social_post', label: 'Social Media Post' },
                        { id: 'mockup', label: 'Mockup (Other)' }
                      ].map(preset => (
                        <button 
                          key={preset.id}
                          onClick={() => setCreativeGoal(preset.id)}
                          className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creativeGoal === preset.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:text-orange-600'}`}
                        >
                          {preset.label}
                        </button>
                      ))}
                  </div>
                </div>

              <div className="nm-inset p-4 rounded-[2rem] aspect-video bg-slate-900/5 dark:bg-slate-950/40 border border-orange-500/10 flex items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent opacity-50" />
                 <div className="z-10 text-center space-y-4">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 nm-flat rounded-2xl flex items-center justify-center mx-auto text-orange-600">
                       <Layout className="w-8 h-8" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Neural Canvas Ready</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Status: Standby for ${creativeGoal.toUpperCase()}</p>
                    </div>
                 </div>
                 {/* Design layer placeholders */}
                 <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="w-12 h-1 bg-orange-600/20 rounded-full" />
                    <div className="w-8 h-1 bg-orange-600/10 rounded-full" />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Master Export Protocol</label>
                <select 
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value)}
                  className="w-full p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white border-none focus:ring-0 appearance-none cursor-pointer"
                >
                  <option value="youtube">Digital (Standard Web Assets)</option>
                  <option value="instagram">Social Media (4:5 Portrait Grid)</option>
                  <option value="tiktok">Mobile Video (9:16 Vertical)</option>
                  <option value="canva">Canva Pro (Full JSON Project)</option>
                  <option value="photoshop">Adobe Photoshop (PSD + Smart Objects)</option>
                  <option value="pixellab">PixelLab Mobile (PLP + Raw Assets)</option>
                  <option value="print">High-Quality Print (CMYK / 300 DPI)</option>
                </select>
              </div>
              {['mockup', 'packaging', 'billboard', 'storefront'].includes(creativeGoal) && (
                <div className="nm-flat p-6 rounded-3xl border border-orange-600/10 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-600/10 rounded-2xl text-orange-600">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Premium {creativeGoal.replace('_', ' ')} Hub</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Synthesize 8K client-ready {creativeGoal} renders</p>
                    </div>
                  </div>
                  <button className="w-full py-3 nm-inset rounded-xl text-[10px] font-black uppercase tracking-widest text-orange-600">Upload Logo or Reference Picture</button>
                </div>
              )}
              {creativeGoal === 'ad' && (
                <div className="nm-flat p-6 rounded-3xl border border-orange-600/10 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-600/10 rounded-2xl text-orange-600">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Raw Video to Ads</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Synthesize professional commercials from raw footage</p>
                    </div>
                  </div>
                  <button className="w-full py-3 nm-inset rounded-xl text-[10px] font-black uppercase tracking-widest text-orange-600">Upload Raw Footage (MP4/MOV)</button>
                </div>
              )}
            </div>
          )}

          {activeTool === 'video_utils' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Neural Utility</label>
                <div className="grid grid-cols-2 gap-2 p-1 nm-inset rounded-2xl bg-white dark:bg-slate-900">
                  {['reels_cutter', 'summarizer', 'to_audio', 'to_text'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setCreativeGoal(type)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creativeGoal === type ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:text-orange-600'}`}
                    >
                      {type === 'reels_cutter' ? 'Reels Cut' : type === 'summarizer' ? 'Summarize' : type === 'to_audio' ? 'To Audio' : 'To Text'}
                    </button>
                  ))}
                </div>
              </div>

              {creativeGoal === 'reels_cutter' && (
                <div className="nm-flat p-6 rounded-3xl border border-emerald-500/20 bg-emerald-600/5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-600/20 rounded-2xl text-emerald-600">
                      <Scissors className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Neural Reels Cutter</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Generate viral clips with AI-powered hook detection</p>
                    </div>
                  </div>
                  <div className="p-4 nm-inset rounded-xl bg-white/50 dark:bg-black/20 border border-emerald-500/10">
                    <ul className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase space-y-1">
                      <li className="flex items-center gap-2">• Auto-detection of high-retention moments</li>
                      <li className="flex items-center gap-2">• Vertical 9:16 crop with smart tracking</li>
                      <li className="flex items-center gap-2">• Neural captioning & viral hook synthesis</li>
                    </ul>
                  </div>
                  <button className="w-full py-4 nm-button bg-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20">Upload Viral Potential (MP4/MOV)</button>
                </div>
              )}

              {creativeGoal !== 'reels_cutter' && (
                <div className="nm-flat p-6 rounded-3xl border border-orange-500/10 flex flex-col items-center gap-4 text-center">
                   <div className="w-12 h-12 bg-orange-600/10 rounded-full flex items-center justify-center text-orange-600">
                      <FileVideo className="w-6 h-6" />
                   </div>
                   <p className="text-[10px] font-black uppercase text-slate-500">Fast Neural Upload Enabled</p>
                   <button className="text-[10px] font-black text-orange-600 underline">Upload Source Media (MP4/MOV)</button>
                </div>
              )}
            </div>
          )}

          {activeTool === 'video' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Neural Mode</label>
                <div className="grid grid-cols-4 gap-2 p-1 nm-inset rounded-2xl bg-white dark:bg-slate-900">
                  <button 
                    onClick={() => setCreativeGoal('commercial')}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creativeGoal === 'commercial' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}
                  >
                    Ads
                  </button>
                  <button 
                    onClick={() => setCreativeGoal('motion_ad')}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creativeGoal === 'motion_ad' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}
                  >
                    Motion Ad
                  </button>
                  <button 
                    onClick={() => setCreativeGoal('cinematic')}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creativeGoal === 'cinematic' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}
                  >
                    Movie
                  </button>
                  <button 
                    onClick={() => setCreativeGoal('pic_to_video')}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creativeGoal === 'pic_to_video' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}
                  >
                    Pic-to-Vid
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Master Export Format</label>
                  <div className="nm-inset rounded-2xl bg-white dark:bg-slate-900 p-1 flex">
                    {(['mp4', 'webm'] as const).map((format) => (
                      <button
                        key={format}
                        onClick={() => setVideoFormat(format)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          videoFormat === format 
                            ? 'bg-orange-600 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-orange-600'
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Neural Resolution</label>
                  <div className="nm-inset rounded-2xl bg-white dark:bg-slate-900 p-1 flex">
                    {(['1080p', '4K'] as const).map((res) => (
                      <button
                        key={res}
                        onClick={() => setVideoResolution(res)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          videoResolution === res 
                            ? 'bg-orange-600 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-orange-600'
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="nm-flat p-6 rounded-3xl border border-orange-600/10 bg-white/30 dark:bg-black/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-600/10 rounded-xl text-orange-600">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">YouTube Optimization</h4>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-tight">Sync for growth algorithm</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-Thumb</span>
                    <button 
                      onClick={() => setGenerateThumbnail(!generateThumbnail)}
                      className={`w-10 h-5 rounded-full p-1 transition-all ${generateThumbnail ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                    >
                      <div className={`w-3 h-3 rounded-full bg-white transition-all transform ${generateThumbnail ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Platform Preset</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setVideoAspectRatio('16:9')}
                      className={`p-4 rounded-2xl flex flex-col items-center gap-3 transition-all ${videoAspectRatio === '16:9' ? 'nm-inset bg-orange-600/5 text-orange-600' : 'nm-flat text-slate-400'}`}
                    >
                      <div className="w-12 h-8 border-2 border-current rounded opacity-40 flex items-center justify-center">
                        <span className="text-[8px] font-black">16:9</span>
                      </div>
                      <span className="text-[10px] font-black uppercase">Standard (Landscape)</span>
                    </button>
                    <button 
                      onClick={() => setVideoAspectRatio('9:16')}
                      className={`p-4 rounded-2xl flex flex-col items-center gap-3 transition-all ${videoAspectRatio === '9:16' ? 'nm-inset bg-orange-600/5 text-orange-600' : 'nm-flat text-slate-400'}`}
                    >
                      <div className="w-8 h-12 border-2 border-current rounded opacity-40 flex items-center justify-center">
                        <span className="text-[8px] font-black rotate-90">9:16</span>
                      </div>
                      <span className="text-[10px] font-black uppercase">Shorts (Vertical)</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {creativeGoal === 'motion_ad' && (
                <div className="nm-flat p-8 rounded-3xl border border-orange-600/20 bg-orange-600/5 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-xl">
                         <Zap className="w-6 h-6" />
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tighter">4K Product Assembly Synth</h4>
                         <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Neural Product Motion Ads</p>
                      </div>
                   </div>
                   <div className="p-4 nm-inset rounded-2xl bg-white/50 dark:bg-black/20 text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                      Upload your product shots (PNG/JPG) to initiate the neural assembly sequences. Our engine handles:
                      <ul className="mt-2 space-y-1 text-orange-600">
                         <li>• Part Disassembly & Explosion Views</li>
                         <li>• Fluid Simulation & Label Wrapping</li>
                         <li>• Dynamic Cinematic Lighting Renders</li>
                      </ul>
                   </div>
                   <button className="w-full py-4 nm-button bg-orange-600 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-600/20">Upload Product Blueprints (PNG/MP4/OBJ)</button>
                </div>
              )}

              <div className="nm-flat p-6 rounded-3xl border border-orange-600/10 space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-600/10 rounded-2xl text-orange-600">
                        <FileVideo className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Neural Source</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Upload pictures or scripts for motion synth</p>
                      </div>
                    </div>
                    <div className="text-xs font-black text-orange-600">ACTIVE</div>
                 </div>
                 <button className="w-full py-3 nm-inset rounded-xl text-[10px] font-black uppercase tracking-widest text-orange-600">Upload Source (JPG/PNG/PDF/MP4)</button>
              </div>
            </div>
          )}

          {activeTool === 'strategic' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">
                  {creativeGoal === 'prompt_gen' ? 'Neural Prompt Architecture' : 'Strategic Analysis'}
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 nm-inset rounded-2xl bg-white dark:bg-slate-900">
                  {['prompt_gen', 'script_summarize'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setCreativeGoal(type)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creativeGoal === type ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:text-orange-600'}`}
                    >
                      {type === 'prompt_gen' ? 'Prompt Gen' : 'Script Sum'}
                    </button>
                  ))}
                </div>
              </div>

              {creativeGoal === 'prompt_gen' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Technical Specs</label>
                    <input 
                      type="text"
                      placeholder="e.g. 8k, Octane Render, Ray Tracing, Unreal Engine 5"
                      value={technicalSpecs}
                      onChange={(e) => setTechnicalSpecs(e.target.value)}
                      className="w-full p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white border-none focus:ring-0 text-sm placeholder:text-slate-400"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['8K', 'Octane Render', 'Unreal Engine 5', 'Ray Tracing', 'Macro Lens', 'DOF', 'Volumetric Lighting', 'Global Illumination', 'PBR Textures'].map(spec => (
                        <button 
                          key={spec}
                          onClick={() => setTechnicalSpecs(prev => prev.includes(spec) ? prev : prev ? `${prev}, ${spec}` : spec)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 hover:text-orange-600 transition-colors"
                        >
                          + {spec}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Style Keywords</label>
                    <input 
                      type="text"
                      placeholder="e.g. Cinematic, Photorealistic, Surreal, Cyberpunk"
                      value={styleKeywords}
                      onChange={(e) => setStyleKeywords(e.target.value)}
                      className="w-full p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white border-none focus:ring-0 text-sm placeholder:text-slate-400"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Cinematic', 'Photorealistic', 'Surreal', 'Cyberpunk', 'Hyper-realistic', 'Minimalist', 'Baroque', 'Synthwave', 'Futuristic', 'Organic'].map(style => (
                        <button 
                          key={style}
                          onClick={() => setStyleKeywords(prev => prev.includes(style) ? prev : prev ? `${prev}, ${style}` : style)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 hover:text-orange-600 transition-colors"
                        >
                          + {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 nm-flat rounded-2xl bg-orange-600/5 border border-orange-500/10">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                      Neural Fusion Active: These parameters will be automatically synthesized into your core vision for maximum fidelity.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {activeTool === 'identity' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Primary Niche</label>
                  </div>
                  <input 
                    type="text"
                    placeholder="e.g. Fintech, Luxury Fashion, SaaS"
                    value={brandNiche}
                    onChange={(e) => setBrandNiche(e.target.value)}
                    className="w-full p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white border-none focus:ring-0 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Brand Mission</label>
                  </div>
                  <input 
                    type="text"
                    placeholder="e.g. Revolutionizing credit access..."
                    value={brandMission}
                    onChange={(e) => setBrandMission(e.target.value)}
                    className="w-full p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white border-none focus:ring-0 text-sm"
                  />
                </div>
              </div>

               <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Brand Archetype</label>
                    <div className="relative group/info">
                      <Info className="w-3 h-3 text-slate-300 hover:text-orange-500 cursor-help transition-colors" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-[9px] text-white rounded-lg opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-white/10">
                        Archetypes define the 'soul' of your brand and dictate the emotional frequency of the generated identity.
                      </div>
                    </div>
                  </div>
                </div>
                <select 
                  value={selectedArchetype}
                  onChange={(e) => setSelectedArchetype(e.target.value)}
                  className="w-full p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white border-none focus:ring-0 appearance-none cursor-pointer"
                >
                  {[
                    "The Hero", "The Magician", "The Sage", "The Innocent", 
                    "The Rebel", "The Explorer", "The Ruler", "The Creator", 
                    "The Caregiver", "The Everyman", "The Jester", "The Lover"
                  ].map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <p className="text-[10px] font-medium text-slate-500 italic px-2">
                  {selectedArchetype === "The Hero" && "Courageous and determined. Solves problems with strength."}
                  {selectedArchetype === "The Magician" && "Visionary and transformative. Makes dreams a reality."}
                  {selectedArchetype === "The Sage" && "Wise and analytic. Providing truth and wisdom."}
                  {selectedArchetype === "The Innocent" && "Optimistic and pure. Seeking simplicity and safety."}
                  {selectedArchetype === "The Rebel" && "Revolutionary and disruptive. Breaking conventions."}
                  {selectedArchetype === "The Explorer" && "Independent and adventurous. Discovering new worlds."}
                  {selectedArchetype === "The Ruler" && "Authoritative and stable. Creating order and control."}
                  {selectedArchetype === "The Creator" && "Imaginative and artistic. Building something of value."}
                  {selectedArchetype === "The Caregiver" && "Nurturing and protector. Helping and serving others."}
                  {selectedArchetype === "The Everyman" && "Relatable and honest. Believing in equality for all."}
                  {selectedArchetype === "The Jester" && "Playful and humorous. Living in the moment."}
                  {selectedArchetype === "The Lover" && "Passionate and intimate. Seeking connection and beauty."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Neuro-Variations</label>
                    <div className="relative group/info">
                      <Info className="w-3 h-3 text-slate-300 hover:text-orange-500 cursor-help transition-colors" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-[9px] text-white rounded-lg opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-white/10">
                        The number of alternative color palettes to synthesize.
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-orange-600">{variationCount}</span>
                </div>
                <div className="relative h-6 flex items-center">
                  <input 
                    type="range" 
                    min="1" 
                    max="6" 
                    value={variationCount}
                    onChange={(e) => setVariationCount(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-600 z-10"
                  />
                  <div className="absolute w-full flex justify-between px-1 pointer-events-none">
                    {[1, 2, 3, 4, 5, 6].map(val => (
                      <div key={val} className={`w-0.5 h-1 ${variationCount >= val ? 'bg-orange-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Brand Core Values</label>
                  <div className="relative group/info">
                    <Info className="w-3 h-3 text-slate-300 hover:text-orange-500 cursor-help transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-[9px] text-white rounded-lg opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-white/10">
                      List the core values that define your brand (e.g., Sustainability, Innovation, Luxury).
                    </div>
                  </div>
                </div>
                <input 
                  type="text"
                  placeholder="e.g. Integrity, Boldness, Minimalist Efficiency"
                  value={brandValues}
                  onChange={(e) => setBrandValues(e.target.value)}
                  className="w-full p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white border-none focus:ring-0"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Brand Voice & Persona</label>
                  <div className="relative group/info">
                    <Info className="w-3 h-3 text-slate-300 hover:text-orange-500 cursor-help transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-[9px] text-white rounded-lg opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-white/10">
                      How your brand 'speaks' across all channels. Highly authoritative, playfully witty, or technically precise?
                    </div>
                  </div>
                </div>
                <select 
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  className="w-full p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white border-none focus:ring-0 appearance-none cursor-pointer"
                >
                  {[
                    "Playful & Witty", "Authoritative & Bold", "Minimalist & Clean", 
                    "Warm & Empathetic", "Technical & Precise", "Luxury & Sophisticated", 
                    "Rebellious & Disruptive", "Inspirational & Spiritual", "Balanced & Professional"
                  ].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400 font-sans tracking-widest">Target Demographics</label>
                  <div className="relative group/info">
                    <Info className="w-3 h-3 text-slate-300 hover:text-orange-500 cursor-help transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-[9px] text-white rounded-lg opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-white/10">
                      Select multiple segments or describe your audience. This precision dictates color psychology and syntax.
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Gen Z / Alpha", "Millennials (25-40)", "Luxury / HNWIs", 
                      "Urban Professionals", "Tech-Savvy Creatives", "Eco-Conscious", 
                      "Value-Focused Parents", "B2B Decision Makers"
                    ].map(chip => (
                      <button 
                        key={chip}
                        onClick={() => {
                          const segments = targetDemographics.split(',').map(s => s.trim()).filter(s => s);
                          if (segments.includes(chip)) {
                            setTargetDemographics(segments.filter(s => s !== chip).join(', '));
                          } else {
                            setTargetDemographics(prev => prev ? `${prev}, ${chip}` : chip);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${
                          targetDemographics.includes(chip) 
                            ? 'bg-orange-600 text-white shadow-lg' 
                            : 'nm-flat text-slate-500 hover:text-orange-600'
                        }`}
                      >
                        {targetDemographics.includes(chip) ? '✓ ' : '+ '}{chip}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    placeholder="Refine further: e.g. Freelancers in the gig economy earning $50k+..."
                    value={targetDemographics}
                    onChange={(e) => setTargetDemographics(e.target.value)}
                    className="w-full p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white border-none focus:ring-0 min-h-[100px] text-sm"
                  />
                </div>
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
                else executeNeuralOperation(activeTool);
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

            {result && ['graphics', 'video_utils', 'strategic'].includes(result.tool || activeTool) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="nm-inset p-8 rounded-3xl bg-slate-900/5 dark:bg-slate-900/40 border border-orange-600/10 relative overflow-hidden">
                  {!isPro && ['graphics', 'video_utils'].includes(activeTool) && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-10 rotate-12 select-none">
                      <div className="text-4xl font-black text-slate-500 uppercase tracking-widest">BRANDAVOX WATERMARK</div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-xl">
                      <Zap className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-widest">Neural Synthesis Complete</h4>
                      <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest">Operation: {result.type || creativeGoal}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-5 nm-flat rounded-2xl bg-white/50 dark:bg-black/20 border border-white/10">
                      <p className="text-sm font-bold leading-relaxed">{result.status || "Neural operation successfully verified by Gemini Engine."}</p>
                      {activeTool === 'strategic' && creativeGoal === 'prompt_gen' && result.parameters?.optimized_prompt && (
                        <div className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimized Prompt</label>
                            <div className="p-4 nm-inset rounded-xl bg-orange-600/5 font-mono text-xs text-orange-600 border border-orange-500/20 relative group">
                              {result.parameters.optimized_prompt}
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(result.parameters.optimized_prompt);
                                  alert("Prompt cloned to neural buffer.");
                                }}
                                className="absolute top-2 right-2 p-2 nm-button rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Layers className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {result.parameters.negative_prompt && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Negative Prompt</label>
                              <div className="p-3 nm-inset rounded-xl bg-red-600/5 font-mono text-[10px] text-red-600 border border-red-500/10">
                                {result.parameters.negative_prompt}
                              </div>
                            </div>
                          )}

                          {result.parameters.style_tags && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Style Matrix</label>
                              <div className="flex flex-wrap gap-2">
                                {(typeof result.parameters.style_tags === 'string' ? result.parameters.style_tags.split(',') : result.parameters.style_tags).map((tag: string) => (
                                  <span key={tag} className="px-2 py-1 bg-orange-600/10 text-orange-600 rounded-md text-[9px] font-bold uppercase">
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center italic">Optimized Neural Directives</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {result.parameters && Object.entries(result.parameters).map(([k, v]) => (
                        k !== 'optimized_prompt' && (
                          <div key={k} className="p-3 nm-inset rounded-xl bg-orange-600/5">
                            <p className="text-[8px] font-black uppercase text-slate-400 mb-1">{k.replace(/_/g, ' ')}</p>
                            <p className="text-xs font-black text-orange-600">{String(v)}</p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleGenerateMore}
                    className="py-4 nm-button rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 text-orange-600"
                  >
                    <RefreshCw className="w-4 h-4" /> Synthesize Again
                  </button>
                  <button 
                    onClick={() => {
                        const formats = isPro ? `RAW (${targetPlatform.toUpperCase()}), PSD, PNG` : 'PNG (Standard)';
                        alert(`Neural Archive: Digital asset dispatched to local storage in ${formats} format.`);
                    }}
                    className="py-4 nm-flat bg-orange-600 rounded-2xl font-black text-xs uppercase text-white flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Export Assets {isPro ? `(${targetPlatform.toUpperCase()})` : ''}
                  </button>
                </div>
              </motion.div>
            )}

            {result && activeTool === 'content' && Array.isArray(result) && (
              <div className="space-y-6">
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
                <button 
                  onClick={handleGenerateMore}
                  disabled={generating}
                  className="w-full py-4 nm-button rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 text-orange-600 hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                  Generate More Variations
                </button>
              </div>
            )}

            {result && activeTool === 'image' && !result.error && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="nm-inset p-4 rounded-3xl bg-slate-950 group relative overflow-hidden cursor-crosshair">
                  <img 
                    src={result.url || undefined} 
                    alt="Generated" 
                    className="w-full h-auto rounded-2xl shadow-inner shadow-orange-600/20 transition-transform duration-700 group-hover:scale-105" 
                  />
                  {!isPro && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center rotate-[-30deg] opacity-20 overflow-hidden select-none">
                      <div className="text-[100px] font-black text-white whitespace-nowrap uppercase tracking-[1em]">
                        BRANDAVOX FREE · BRANDAVOX FREE · BRANDAVOX FREE
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <p className="text-white text-xs font-black uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      Neural Vision Synthesized
                    </p>
                    <p className="text-slate-300 text-[10px] font-bold mt-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                      HDR Engine v4.2 · Ultra-High Fidelity
                    </p>
                  </div>
                  <div className="absolute top-6 right-6 flex flex-col gap-2 items-end z-10">
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

                <div className="grid grid-cols-2 gap-4">
                   <button 
                    disabled={isUpscaling || result.isUpscaled}
                    onClick={handleUpscaleImage}
                    className="py-4 nm-button rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 text-orange-600 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isUpscaling ? <RefreshCw className="animate-spin w-4 h-4" /> : "Neural Upscale 8K"}
                  </button>
                  <button 
                    disabled={generating}
                    onClick={handleGenerateMore}
                    className="py-4 nm-button rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 text-orange-600 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                    Generate More
                  </button>
                </div>

                <div className="nm-flat p-4 rounded-2xl bg-white/30 dark:bg-black/10 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Export Format</label>
                      <select 
                        value={imgExportFormat}
                        onChange={(e) => setImgExportFormat(e.target.value as any)}
                        className="w-full p-2 nm-inset rounded-xl bg-transparent font-black text-[10px] uppercase text-slate-600 dark:text-slate-300 border-none outline-none appearance-none cursor-pointer"
                      >
                        <option value="png" className="bg-slate-900">PNG (Lossless)</option>
                        <option value="jpg" className="bg-slate-900">JPG (Standard)</option>
                        <option value="webp" className="bg-slate-900">WebP (Optimized)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Quality</label>
                        <span className="text-[9px] font-black text-orange-600">{imgCompression}%</span>
                      </div>
                      <input 
                        type="range"
                        min="10"
                        max="100"
                        value={imgCompression}
                        onChange={(e) => setImgCompression(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-600 mt-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    disabled={isExporting}
                    onClick={handleImageExport}
                    className="flex-1 py-4 nm-button rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 text-slate-900 dark:text-white hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isExporting ? <RefreshCw className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4" />}
                    Download {imgExportFormat.toUpperCase()}
                  </button>
                  <button 
                    onClick={() => {
                       const formats = {
                         canva: 'Canva Project (JSON)',
                         photoshop: 'Photoshop PSD (Neural Layers)',
                         pixellab: 'PixelLab PLP Matrix',
                       }[targetPlatform] || 'High-Res Package';
                       alert(`Neural Export: Sythesized professional raw files (${isPro ? (formats + ' (PSD, AI, CANVA, PLP)') : 'PNG only - Upgrade for Raw Source Files'}).`);
                    }}
                    className="flex-1 py-4 nm-inset rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 text-white bg-orange-600 border border-orange-500/20 hover:scale-105 transition-all"
                  >
                    <Layers className="w-4 h-4" /> Export Protocol {targetPlatform === 'photoshop' ? '(PSD)' : targetPlatform === 'pixellab' ? '(PLP)' : ''}
                  </button>
                </div>
                  <button 
                    onClick={() => onNavigate?.('editor')}
                    className="flex-1 py-4 nm-inset rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 text-white bg-orange-600 shadow-lg shadow-orange-600/20 hover:scale-[1.02] transition-all"
                  >
                    <PenTool className="w-4 h-4" /> Edit in Pro Studio
                  </button>
              </motion.div>
            )}

            {result && activeTool === 'video' && result.frame_rate && (
               <div className="space-y-6">
                 <div className={`nm-inset p-2 rounded-2xl overflow-hidden relative group cursor-pointer ${result.aspectRatio === '9:16' ? 'aspect-[9/16] max-w-[300px] mx-auto' : 'aspect-video'}`}>
                    <img src={result.url} className="w-full h-full object-cover blur-[2px]" />
                    {!isPro && (
                      <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center rotate-[-15deg] opacity-20 overflow-hidden select-none">
                        <div className="text-[60px] font-black text-white whitespace-nowrap uppercase tracking-[0.5em]">
                          BRANDAVOX PREVIEW
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                       <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30">
                          <RefreshCw className="w-8 h-8 text-white animate-spin-slow" />
                       </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 z-10">
                       <p className="text-[10px] font-black uppercase text-orange-500">Video Render Engine · {result.frame_rate} · {result.resolution} · {result.format?.toUpperCase()} · {result.aspectRatio}</p>
                       {result.thumbnailGenerated && (
                         <p className="text-[8px] font-black text-emerald-500 uppercase mt-1">✓ YouTube Thumbnail Matrix Generated</p>
                       )}
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

                 <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleGenerateMore}
                    className="py-4 nm-button rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 text-orange-600"
                  >
                    <RefreshCw className="w-4 h-4" /> Synthesize Again
                  </button>
                  <button 
                    onClick={() => alert(`Neural Archive: Video project exported as ${videoFormat.toUpperCase()} (${videoResolution}).`)}
                    className="py-4 nm-flat bg-orange-600 rounded-2xl font-black text-xs uppercase text-white flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Export Video
                  </button>
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

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center mb-2">Export Master Configuration</h4>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { id: 'mp3', label: 'Master MP3', icon: FileAudio },
                            { id: 'wav', label: 'Lossless WAV', icon: FileAudio },
                            { id: 'flac', label: 'Pro FLAC', icon: FileAudio },
                            { id: 'video', label: 'Video Script', icon: FileVideo }
                          ].map(format => (
                            <button 
                              key={format.id}
                              disabled={isExporting}
                              onClick={() => handleExportVoice(format.id)}
                              className="nm-button p-4 rounded-xl flex flex-col items-center gap-2 group hover:scale-105 transition-all disabled:opacity-50"
                            >
                               <format.icon className="w-5 h-5 text-slate-400 group-hover:text-orange-600" />
                               <span className="text-[8px] font-black uppercase tracking-tighter">{format.label}</span>
                            </button>
                          ))}
                       </div>
                       
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      disabled={generating}
                      onClick={handleGenerateMore}
                      className="w-full nm-button p-5 rounded-2xl flex items-center justify-center gap-3 bg-white text-slate-950 hover:scale-[1.02] transition-all disabled:opacity-50 mt-4"
                    >
                      <RefreshCw className={`w-5 h-5 text-orange-600 ${generating ? "animate-spin" : ""}`} />
                      <span className="font-black text-xs uppercase tracking-widest text-slate-900">Generate More</span>
                    </button>
                    <button 
                      disabled={generating}
                      onClick={generateVoice}
                      className="w-full nm-button p-5 rounded-2xl flex items-center justify-center gap-3 bg-white text-slate-950 hover:scale-[1.02] transition-all disabled:opacity-50 mt-4"
                    >
                      <RefreshCw className={`w-5 h-5 text-orange-600 ${generating ? "animate-spin" : ""}`} />
                      <span className="font-black text-xs uppercase tracking-widest text-slate-900">Regenerate</span>
                    </button>
                  </div>
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

                     <div className="mt-8 space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Primary Spectrum</p>
                          <div className="flex gap-2">
                            {result.color_palette && Array.isArray(result.color_palette) && result.color_palette.map((color: string, i: number) => (
                              <div key={i} className="flex-1 group relative">
                                <div className="h-12 rounded-xl border border-white/10" style={{ backgroundColor: color }} />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="bg-black/50 text-white text-[8px] font-mono px-1 rounded">{color}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {result.palette_variations && Array.isArray(result.palette_variations) && (
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Neural Variations</p>
                            <div className="space-y-2">
                              {result.palette_variations.map((palette: any, idx: number) => (
                                <div key={idx} className="flex gap-2 h-4">
                                  {Array.isArray(palette) ? palette.map((c: string, ci: number) => (
                                    <div key={ci} className="flex-1 rounded-sm" style={{ backgroundColor: c }} />
                                  )) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.uvp && (
                          <div className="nm-inset p-4 rounded-2xl bg-orange-600/5 border border-orange-600/10">
                            <p className="text-[10px] font-black text-orange-500 uppercase mb-1">Unique Value Proposition</p>
                            <p className="text-sm font-bold text-white italic">"{result.uvp}"</p>
                          </div>
                        )}

                        {result.visual_strategy && (
                          <div className="nm-inset p-4 rounded-2xl bg-slate-900 border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Visual Language Recommendation</p>
                            <p className="text-xs font-medium text-slate-300 leading-relaxed">
                              {result.visual_strategy}
                            </p>
                          </div>
                        )}

                        {result.voice_guidelines && (
                          <div className="nm-inset p-4 rounded-2xl bg-orange-600/5 border border-orange-600/10">
                            <p className="text-[10px] font-black text-orange-600 uppercase mb-1 tracking-widest">Voice & Tone Guardrails</p>
                            <p className="text-xs font-medium text-slate-300 leading-relaxed italic">
                              {result.voice_guidelines}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-8 flex gap-4">
                        <button 
                          onClick={handleGenerateMore}
                          disabled={generating}
                          className="flex-1 py-4 bg-white/5 nm-button rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 text-orange-600 hover:scale-[1.02] transition-all disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                          Generate More
                        </button>
                        <button 
                          onClick={() => alert("Brand Identity Kit (PDF/Assets) synthesized and ready for dispatch.")}
                          className="flex-[2] py-4 bg-orange-600 rounded-2xl font-black text-xs uppercase shadow-xl shadow-orange-600/30 hover:scale-[1.02] transition-all"
                        >
                          Download Brand Kit
                        </button>
                      </div>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
