import React from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  FileLock2, 
  CreditCard, 
  Info, 
  ChevronLeft,
  Sparkles,
  Globe,
  Mail,
  MapPin
} from "lucide-react";
import BrandLogo from "./BrandLogo";

interface LegalPagesProps {
  initialSection?: 'about' | 'terms' | 'privacy' | 'payment';
  onBack: () => void;
}

export default function LegalPages({ initialSection = 'about', onBack }: LegalPagesProps) {
  const [activeSection, setActiveSection] = React.useState(initialSection);

  const sections = [
    { id: 'about', label: 'About Brandavox', icon: Info },
    { id: 'terms', label: 'Terms of Use', icon: ShieldCheck },
    { id: 'privacy', label: 'Privacy Policy', icon: FileLock2 },
    { id: 'payment', label: 'Payment Policy', icon: CreditCard },
  ];

  const content = {
    about: (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
        <div className="space-y-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-950 dark:text-white">The Neural Agency Standard</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
            "Brandavox AI wasn't built to follow trends; it was engineered to synthesize them."
          </p>
        </div>
        
        <div className="nm-flat p-10 rounded-[3rem] space-y-6">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Founded in 2024, Brandavox AI is a global leader in neural creative intelligence. We provide a unified operating system for social media managers, brands, and creative agencies who demand high-fidelity output and automated strategic foresight.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            <div className="space-y-3">
              <h4 className="text-sm font-black uppercase text-orange-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Our Vision
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                To democratize professional-grade AI creative tools and make global-scale brand management accessible to every strategist on the planet.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-black uppercase text-indigo-600 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Global Footprint
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                Operating across 4 continents with specialized neural nodes covering diverse cultural perspectives and regional voice accents.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="nm-inset p-8 rounded-3xl text-center space-y-2">
             <div className="text-2xl font-black text-slate-950 dark:text-white">12K+</div>
             <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Strategists</div>
          </div>
          <div className="nm-inset p-8 rounded-3xl text-center space-y-2">
             <div className="text-2xl font-black text-slate-950 dark:text-white">45M+</div>
             <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Synthesized Assets</div>
          </div>
          <div className="nm-inset p-8 rounded-3xl text-center space-y-2">
             <div className="text-2xl font-black text-slate-950 dark:text-white">99.9%</div>
             <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Neural Uptime</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-black uppercase tracking-tight">Contact HQ</h3>
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="p-3 nm-button rounded-xl text-orange-600">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Support</p>
                <p className="text-sm font-bold">hq@brandavox.ai</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 nm-button rounded-xl text-indigo-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Nodes</p>
                <p className="text-sm font-bold">Distributed / Remote First</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    terms: (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
        <div className="space-y-4 text-left">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-950 dark:text-white">Terms of Use</h2>
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">Last Updated: May 14, 2026</p>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-slate-950 dark:text-white">
              <span className="w-8 h-8 nm-inset rounded-lg flex items-center justify-center text-xs font-black">01</span>
              Acceptance of Matrix
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              By accessing or using the Brandavox AI Platform, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-slate-950 dark:text-white">
              <span className="w-8 h-8 nm-inset rounded-lg flex items-center justify-center text-xs font-black">02</span>
              Neural License
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Permission is granted to temporarily download one copy of the materials (information or software) on Brandavox AI's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
            <ul className="list-disc pl-10 space-y-2 text-xs font-bold text-slate-500">
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>Attempt to decompile or reverse engineer any software contained on Brandavox AI's website;</li>
              <li>Remove any copyright or other proprietary notations from the materials.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-slate-950 dark:text-white">
              <span className="w-8 h-8 nm-inset rounded-lg flex items-center justify-center text-xs font-black">03</span>
              Disclaimer
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
              The materials on Brandavox AI's website are provided on an 'as is' basis. Brandavox AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>
        </div>
      </div>
    ),
    privacy: (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
        <div className="space-y-4 text-left">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-950 dark:text-white">Privacy Architecture</h2>
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Last Updated: May 14, 2026</p>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-slate-950 dark:text-white text-left">
              <span className="w-8 h-8 nm-inset rounded-lg flex items-center justify-center text-xs font-black">01</span>
              Data Transmission
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              We collect information you provide directly to us when you create an account, use our services, or communicate with us. This may include your name, email address, payment information, and any neural content you upload or synthesize.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-slate-950 dark:text-white text-left">
              <span className="w-8 h-8 nm-inset rounded-lg flex items-center justify-center text-xs font-black">02</span>
              Neural Intelligence Usage
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              We use the information we collect to provide, maintain, and improve our services, including the training of our neural engines (strictly used in aggregate and anonymized forms to improve platform performance).
            </p>
          </section>

          <section className="space-y-4">
            <div className="nm-flat p-8 rounded-[3rem] bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20">
               <div className="flex items-center gap-4 mb-4">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  <h4 className="text-lg font-black uppercase tracking-tight text-indigo-600">AES-256 Protocol</h4>
               </div>
               <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                 All user data is encrypted at rest and in transit using military-grade AES-256 encryption. Your brand assets and neural blueprints are secured within isolated virtual containers.
               </p>
            </div>
          </section>
        </div>
      </div>
    ),
    payment: (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
        <div className="space-y-4 text-left">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-950 dark:text-white">Payment Ledger Policy</h2>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Financial Matrix Version 1.0</p>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-slate-950 dark:text-white text-left">
              <span className="w-8 h-8 nm-inset rounded-lg flex items-center justify-center text-xs font-black">01</span>
              Subscription Cycles
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Brandavox AI operates on a tiered subscription model. Billing is processed automatically on a 30-day cycle starting from your induction date. You may upgrade or downgrade your tier at any time via the Finance & Ledger hub.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="nm-flat p-8 rounded-[2.5rem] border border-orange-500/10">
               <h5 className="font-black text-orange-600 uppercase text-xs mb-4">Refund Protocol</h5>
               <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                 Neural consumption is non-reversible. We offer a 7-day technical satisfaction guarantee. If the platform fails to synthesize assets due to system errors, a pro-rated credit will be issued to your ledger.
               </p>
            </div>
            <div className="nm-flat p-8 rounded-[2.5rem] border border-emerald-500/10">
               <h5 className="font-black text-emerald-600 uppercase text-xs mb-4">Secure Gateway</h5>
               <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                 Payments are processed via encrypted neural gateways. We never store raw credit card data on our servers. All transactions are PCI-DSS Level 1 compliant.
               </p>
            </div>
          </div>

          <section className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-slate-950 dark:text-white text-left">
              <span className="w-8 h-8 nm-inset rounded-lg flex items-center justify-center text-xs font-black">02</span>
              Quotas & Overages
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Each tier includes a set amount of Neural Synthesis Units (NSUs). If you exceed your monthly quota, synthesis will be paused until the next cycle or until a manual NSU injection is purchased.
            </p>
          </section>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col text-left">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-100 dark:border-white/5 py-6 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-3 nm-button rounded-2xl text-slate-400 hover:text-orange-600 transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 transition-transform" />
            </button>
            <div className="flex items-center gap-3">
              <BrandLogo size="md" />
              <div className="hidden sm:block text-left">
                <h1 className="text-xl font-black tracking-tighter text-slate-950 dark:text-white uppercase leading-none">Brandavox AI</h1>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Intelligence Headquarters</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 p-1 nm-inset rounded-2xl bg-slate-50 dark:bg-black/20">
            {sections.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id as any)}
                  className={`px-6 py-2.5 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeSection === s.id 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 lg:gap-12 p-4 lg:p-12 relative">
        {/* Mobile Navigation / Progress */}
        <div className="lg:hidden flex overflow-x-auto gap-4 pb-8 scrollbar-none">
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id as any)}
                className={`px-6 py-3 rounded-2xl flex items-center gap-3 text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${
                  activeSection === s.id 
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
                  : "nm-flat text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4" /> {s.label}
              </button>
            );
          })}
        </div>

        {/* Sidebar Context */}
        <div className="hidden lg:block space-y-12 text-left">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-orange-600 tracking-[0.3em]">Directory</h4>
            <div className="space-y-3">
              {sections.map(s => {
                const Icon = s.icon;
                const active = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id as any)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                      active ? "nm-inset bg-slate-50 dark:bg-white/5 text-slate-950 dark:text-white" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg nm-flat ${active ? "text-orange-600" : "text-slate-300 group-hover:text-slate-500"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-tight">{s.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8 nm-flat rounded-[2.5rem] bg-orange-600 text-white space-y-4">
             <Sparkles className="w-10 h-10 animate-pulse" />
             <h5 className="text-lg font-black uppercase tracking-tighter leading-tight">Need Neural Support?</h5>
             <p className="text-[10px] font-bold text-orange-100 uppercase leading-relaxed">
               Our intelligence nodes are active 24/7. Connect with a strategist for deep integration queries.
             </p>
             <button className="w-full py-4 bg-white text-orange-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">
               Connect Liaison
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-16 pb-20">
          {content[activeSection as keyof typeof content]}
          
          <footer className="pt-20 border-t border-slate-100 dark:border-white/5 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3">
                <BrandLogo size="sm" />
                <span className="text-xs font-black tracking-tighter uppercase text-slate-400">© 2026 Brandavox AI</span>
              </div>
              <div className="flex gap-4">
                 <button className="p-2 nm-button rounded-lg text-slate-400 hover:text-orange-600">
                    <Globe className="w-4 h-4" />
                 </button>
                 <button className="p-2 nm-button rounded-lg text-slate-400 hover:text-indigo-600">
                    <Mail className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
