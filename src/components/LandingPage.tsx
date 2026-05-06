import React from "react";
import { 
  Sparkles, 
  BrainCircuit, 
  BarChart3, 
  PenTool, 
  Globe, 
  MessageSquare, 
  Calendar,
  Zap,
  ArrowRight,
  Shield,
  Layers,
  Rocket,
  Sun,
  Moon
} from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onLogin: () => void;
  onEnterDemo?: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function LandingPage({ onLogin, onEnterDemo, darkMode, setDarkMode }: LandingPageProps) {
  const navigateToDashboard = onLogin;
  const features = [
    {
      title: "8K Vision Engine",
      icon: BrainCircuit,
      desc: "Generate hyper-realistic 8K visuals with our proprietary neural engine. Text-to-masterpiece in seconds.",
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      title: "AI Voice & Audio",
      icon: MessageSquare,
      desc: "Synthetic vocal cloning and high-fidelity narration for brand identity. Cinematic audio from a prompt.",
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      title: "Photoshop Pro Studio",
      icon: PenTool,
      desc: "Advanced neural editing tools with non-destructive layers, smart filters, and vector precision.",
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      title: "Strategy Engine",
      icon: Calendar,
      desc: "Coordinate global campaigns with a predictive calendar that optimizes for every timezone.",
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      title: "Brand Empire Hub",
      icon: Globe,
      desc: "One-click deployment for stunning portfolios and multi-brand asset management.",
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      title: "Designer Multi-Chat",
      icon: MessageSquare,
      desc: "Secure team threads with bridge integration directly into the creative studio workspace.",
      color: "text-orange-600 dark:text-orange-400"
    }
  ];

  const pricingPlans = [
    {
      name: "Free Tier",
      price: "$0",
      description: "For creators starting their journey",
      features: [
        "10 Neural Syntheses / month",
        "Standard 4K Output",
        "Basic Voice Cloning",
        "Community Support"
      ],
      cta: "Get Started",
      highlight: false
    },
    {
      name: "Pro Studio",
      price: "$49",
      description: "For professionals scaling output",
      features: [
        "Unlimited Neural Syntheses",
        "Ultra-HD 8K Output",
        "Commercial Usage Rights",
        "Advanced Voice Lab",
        "Priority Support"
      ],
      cta: "Upgrade to Pro",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For global brand empires",
      features: [
        "Custom Model Training",
        "API Access (Neural Engine)",
        "Team Management Hub",
        "Dedicated Account Manager",
        "24/7 Concierge Support"
      ],
      cta: "Contact Sales",
      highlight: false
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-100 dark:border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg">
                 <span className="text-white font-bold text-xl font-mono">Σ</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-950 dark:text-white">StratOS</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={onLogin}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-orange-600 transition-colors flex items-center gap-2"
              >
                <BrainCircuit className="w-4 h-4" /> 8K Vision
              </button>
              <button 
                onClick={onLogin}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-orange-600 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Voice Lab
              </button>
              <button 
                onClick={onLogin}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-orange-600 transition-colors flex items-center gap-2"
              >
                <PenTool className="w-4 h-4" /> Pro Editor
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="nm-button p-2.5 rounded-full flex items-center justify-center transition-all hover:scale-110"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <button 
              onClick={onLogin}
              className="px-6 py-2.5 font-bold text-sm text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={onLogin}
              className="nm-button bg-orange-600 text-white px-8 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-orange-600/10"
            >
              Create Account
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
        {/* Abstract Background Orbs */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-orange-100/50 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 -left-20 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 nm-inset rounded-full text-xs font-bold text-slate-500 mb-4">
            <Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
            <span>VERSION 4.0 STABLE RELEASE</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] max-w-5xl mx-auto text-slate-950 dark:text-white">
            The <span className="text-orange-600">Nervous System</span> For Your Digital Empire.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-stone-400 max-w-2xl mx-auto font-medium leading-relaxed">
            StratOS is the professional-grade creative operating system for modern builders. 
            Unified AI, strategic planning, and performance analytics—all in one minimalist terminal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button 
              onClick={onLogin}
              className="group nm-button bg-orange-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg flex items-center gap-3 hover:scale-105 transition-all shadow-[0_20px_40px_-10px_rgba(234,88,12,0.3)]"
            >
              Initialize Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
            <button 
              onClick={onLogin}
              className="nm-button bg-white dark:bg-slate-900 text-slate-950 dark:text-white px-10 py-5 rounded-[2rem] font-black text-lg flex items-center gap-3 hover:scale-105 transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-white/5"
            >
              Access Engine
            </button>
          </div>
          
          <div className="flex flex-col items-center gap-6 pt-12">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-[#1e1e24] bg-slate-100 dark:bg-stone-800 overflow-hidden shadow-xl">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="user" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-white dark:border-[#1e1e24] bg-slate-950 flex items-center justify-center text-[10px] font-black text-white shadow-xl">
                12K+
              </div>
            </div>
            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Trusted by Top Strategists
            </p>
          </div>
        </motion.div>

        {/* Dashboard Mockup/Teaser */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-24 relative max-w-6xl mx-auto group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-indigo-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative nm-flat dark:bg-stone-900 border border-slate-100 dark:border-white/5 rounded-[3rem] p-4 lg:p-8 overflow-hidden aspect-[16/9]">
             <div className="w-full h-full bg-slate-50 dark:bg-stone-950 rounded-[2rem] overflow-hidden flex">
                {/* Sidebar Mock */}
                <div className="w-1/4 border-r border-slate-200 dark:border-stone-800 p-6 flex flex-col gap-4">
                   <div className="w-full h-8 bg-slate-200 dark:bg-stone-800 rounded-lg animate-pulse" />
                   <div className="w-3/4 h-6 bg-slate-200 dark:bg-stone-800 rounded-lg animate-pulse delay-75" />
                   <div className="w-full h-6 bg-slate-200 dark:bg-stone-800 rounded-lg animate-pulse delay-150" />
                   <div className="w-1/2 h-6 bg-slate-200 dark:bg-stone-800 rounded-lg animate-pulse delay-200" />
                </div>
                {/* Content Mock */}
                <div className="flex-1 p-8 space-y-8">
                  <div className="h-12 w-1/3 bg-slate-200 dark:bg-stone-800 rounded-xl animate-pulse" />
                  <div className="grid grid-cols-3 gap-6">
                    <div className="h-40 bg-slate-200 dark:bg-stone-800 rounded-2xl animate-pulse" />
                    <div className="h-40 bg-slate-200 dark:bg-stone-800 rounded-2xl animate-pulse delay-75" />
                    <div className="h-40 bg-slate-200 dark:bg-stone-800 rounded-2xl animate-pulse delay-150" />
                  </div>
                  <div className="h-64 w-full bg-slate-200 dark:bg-stone-800 rounded-[2.5rem] animate-pulse" />
                </div>
             </div>
             {/* Dynamic Badge */}
             <div className="absolute top-12 right-12 nm-button px-6 py-3 rounded-full flex items-center gap-2 bg-white dark:bg-[#1e1e24]">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
                <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">System Active</span>
             </div>
          </div>
        </motion.div>
      </section>

      {/* The Pillars */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-xs font-black text-orange-600 uppercase tracking-[0.3em]">The Toolkit</h2>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-orange-600 dark:text-orange-400">Everything, but <span className="italic">Elevated</span>.</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
             Why piece together a dozen tools when you can have one unified creative intelligence?
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={idx}
                variants={itemVariants}
                onClick={navigateToDashboard}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  boxShadow: darkMode 
                    ? "0 20px 40px -10px rgba(0,0,0,0.5)" 
                    : "0 20px 40px -10px rgba(0,0,0,0.05)"
                }}
                whileTap={{ scale: 0.98 }}
                className="nm-flat p-10 group cursor-pointer transition-all duration-300 rounded-[3rem] border border-transparent hover:border-slate-100"
              >
                <div className={`w-14 h-14 rounded-2xl nm-inset flex items-center justify-center mb-8 border border-white dark:border-white/5 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h4 className="text-2xl font-black mb-4 tracking-tight text-slate-900 dark:text-white uppercase">{feature.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-6 bg-slate-50 dark:bg-stone-900/5 transition-colors">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
             <h2 className="text-xs font-black text-orange-600 uppercase tracking-[0.4em]">Investment Tiers</h2>
             <h3 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-950 dark:text-white uppercase transition-colors">Scale Your <span className="text-orange-600 italic">Vision</span></h3>
             <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
               Choose the plan that matches your creative ambition. Upgrade anytime as your empire grows.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className={`nm-flat p-12 rounded-[4rem] flex flex-col justify-between space-y-12 relative overflow-hidden transition-all duration-300 ${plan.highlight ? 'border-2 border-orange-600 shadow-[0_0_50px_rgba(234,88,12,0.1)] bg-white dark:bg-slate-900/40' : 'bg-white dark:bg-slate-900/10'}`}
              >
                {plan.highlight && (
                  <div className="absolute top-8 right-[-35px] bg-orange-600 text-white text-[10px] font-black uppercase px-12 py-2 rotate-45">
                    Recommended
                  </div>
                )}
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-orange-600">{plan.name}</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-slate-950 dark:text-white">{plan.price}</span>
                      {plan.price !== "Custom" && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/ month</span>}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] pt-2">{plan.description}</p>
                  </div>

                  <ul className="space-y-4">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={onLogin}
                  className={`w-full py-6 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${plan.highlight ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/30 hover:scale-[1.02]' : 'nm-button bg-white dark:bg-slate-900 text-slate-950 dark:text-white hover:scale-[1.02]'}`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compelling Copy Section 1 */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="w-12 h-12 rounded-xl nm-button flex items-center justify-center text-orange-600">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-orange-600 dark:text-orange-400 text-center">
              A Base for Every <span className="italic">Campaign Weight</span>.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-200 font-medium">
              From solo entrepreneurs launching their first dream to global agencies managing 500+ accounts. 
              StratOS scales with you, providing the same high-fidelity performance whether you're scheduling one tweet or orchestrating a global rebranding.
            </p>
            <ul className="space-y-4">
              {[
                { label: "Zero-Latency Asset Sync", icon: Layers },
                { label: "Military Grade AES-256 Cloud Encryption", icon: Shield },
                { label: "Proprietery 8K Prompt Optimization", icon: Sparkles }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-sm font-bold tracking-tight text-slate-600 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-full nm-inset flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-orange-500" />
                  </div>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="nm-flat aspect-square rounded-[3rem] p-8 flex items-center justify-center relative">
            <div className="absolute inset-8 nm-inset rounded-[2.5rem] flex items-center justify-center text-8xl font-black text-slate-100 dark:text-white/5 select-none uppercase tracking-tighter">
              SCALABLE
            </div>
            <Rocket className="w-32 h-32 text-slate-900 dark:text-orange-400 relative z-10" />
          </div>
        </div>
      </section>

      {/* FAQ/Trust Section */}
      <section className="py-32 px-6 max-w-5xl mx-auto text-center space-y-16">
        <div className="space-y-4">
          <h2 className="text-xs font-black text-orange-600 uppercase tracking-[0.3em]">The Verdict</h2>
          <h3 className="text-5xl font-bold tracking-tighter text-orange-600 dark:text-orange-400">The Foundation for every <span className="italic">Creative Weather</span>.</h3>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium font-sans">
             Whether the market is booming or the algorithm is shifting, StratOS keeps you cushioned with adaptive intelligence.
          </p>
        </div>

        <div className="nm-inset p-12 rounded-[4rem] text-slate-900 dark:text-white space-y-8">
           <h4 className="text-3xl font-black italic">"StratOS changed how my brain processes digital strategy. I don't use 10 apps anymore. I just use the OS."</h4>
           <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full border-4 border-white dark:border-white/30 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="user" />
              </div>
              <div>
                <p className="font-black text-lg text-slate-950 dark:text-white">Felix Thorne</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Director, HyperContent Agency</p>
              </div>
           </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="pt-20 pb-40 px-6 border-t border-slate-100 dark:border-white/5 relative bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto text-center space-y-20">
          <div className="space-y-4">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-950 dark:text-white">Join the <span className="italic">Elite</span>.</h2>
            <p className="text-xl text-slate-400 dark:text-slate-400 font-medium italic">
              "The only limit is your prompt fidelity."
            </p>
          </div>

          <button 
            onClick={navigateToDashboard}
            className="nm-button px-20 py-8 rounded-[3rem] bg-white group relative overflow-hidden mx-auto block"
          >
            <div className="absolute inset-0 bg-slate-950 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 text-slate-950 group-hover:text-white font-black text-2xl tracking-tight flex items-center justify-center gap-4 transition-colors">
              Initialize StratOS <ArrowRight className="w-8 h-8" />
            </span>
          </button>

          {/* Tools Grid Directory */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto pt-20 border-t border-slate-100 dark:border-white/5 text-center justify-items-center">
             <div className="space-y-6 flex flex-col items-center">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Core Services</h5>
                <ul className="space-y-4 flex flex-col items-center">
                   <li><button onClick={onLogin} className="text-sm font-black text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase">8K Vision Engine</button></li>
                   <li><button onClick={onLogin} className="text-sm font-black text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase">Voice Synthesis</button></li>
                   <li><button onClick={onLogin} className="text-sm font-black text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase">Forge Video</button></li>
                </ul>
             </div>
             <div className="space-y-6 flex flex-col items-center">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Creative OS Tools</h5>
                <ul className="space-y-4 flex flex-col items-center">
                   <li><button onClick={onLogin} className="text-sm font-black text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase">Photoshop Pro</button></li>
                   <li><button onClick={onLogin} className="text-sm font-black text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase">Brand Manager</button></li>
                   <li><button onClick={onLogin} className="text-sm font-black text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase">Asset Portfolio</button></li>
                </ul>
             </div>
             <div className="space-y-6 flex flex-col items-center">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Enterprise</h5>
                <ul className="space-y-4 flex flex-col items-center">
                   <li><button onClick={onLogin} className="text-sm font-black text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase">Concept Planner</button></li>
                   <li><button onClick={onLogin} className="text-sm font-black text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase">Empire Analytics</button></li>
                   <li><button onClick={onLogin} className="text-sm font-black text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase">Team Threads</button></li>
                </ul>
             </div>
             <div className="space-y-6 flex flex-col items-center">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Productivity</h5>
                <ul className="space-y-4 flex flex-col items-center">
                   <li><button onClick={onLogin} className="text-sm font-black text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase">AES-256 Vault</button></li>
                   <li><button onClick={onLogin} className="text-sm font-black text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase">Neural Firewall</button></li>
                   <li><button onClick={onLogin} className="text-sm font-black text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase">Access Logs</button></li>
                </ul>
             </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em] pt-20 border-t border-slate-50 dark:border-white/5">
            <span className="hover:text-orange-600 transition-colors pointer-events-none">V4.0.2 Stable Build</span>
            <span className="hover:text-orange-600 transition-colors pointer-events-none">Latency: 24ms</span>
            <span className="hover:text-orange-600 transition-colors pointer-events-none">Uptime: 99.9%</span>
            <span className="hover:text-orange-600 transition-colors pointer-events-none">Encryption: AES-256</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
