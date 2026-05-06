/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { auth, db, signInWithPopup, googleProvider, onSnapshot, doc, getDoc, setDoc } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  Image as ImageIcon, 
  Globe, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  PenTool,
  BrainCircuit,
  BarChart3,
  Users,
  Search,
  FileText,
  Mic2,
  Video
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "./types";

// Components
import Dashboard from "./components/Dashboard";
import ContentPlanner from "./components/ContentPlanner";
import AICreativeStudio from "./components/AICreativeStudio";
import ChatRoom from "./components/ChatRoom";
import ProfessionalEditor from "./components/ProfessionalEditor";
import PortfolioBuilder from "./components/PortfolioBuilder";
import BrandManager from "./components/BrandManager";
import AnalyticsHub from "./components/AnalyticsHub";
import OperationsHub from "./components/OperationsHub";
import LandingPage from "./components/LandingPage";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        if (u) {
          const userDoc = await getDoc(doc(db, "users", u.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: u.uid,
              email: u.email || "",
              displayName: u.displayName,
              photoURL: u.photoURL,
              role: "owner",
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, "users", u.uid), newProfile);
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        console.log("Auth loading finished");
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogin = () => signInWithPopup(auth, googleProvider).catch(err => console.error("Login Error:", err));
  const handleLogout = () => {
    auth.signOut();
    setIsGuest(false);
  };

  const handleDemoMode = () => {
    setIsGuest(true);
    setProfile({
      uid: "guest-user",
      email: "guest@example.com",
      displayName: "Guest Strategist",
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150",
      role: "owner",
      createdAt: new Date().toISOString()
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen font-sans">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent"
        />
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <LandingPage 
        onLogin={handleLogin} 
        onEnterDemo={handleDemoMode}
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />
    );
  }

  const menuItems = [
    { id: "dashboard", label: "Operations Hub", icon: LayoutDashboard },
    { id: "ai_studio_image", label: "8K Image Engine", icon: ImageIcon, tool: 'image' },
    { id: "ai_studio_voice", label: "Neural Voice Lab", icon: Mic2, tool: 'voice' },
    { id: "ai_studio_video", label: "Video Forge Lab", icon: Video, tool: 'video' },
    { id: "ai_studio_identity", label: "Brand Identity", icon: Sparkles, tool: 'identity' },
    { id: "editor", label: "Photoshop Pro", icon: PenTool },
    { id: "chat", label: "Designer Chat", icon: MessageSquare },
    { id: "planner", label: "Strategy Planner", icon: Calendar },
    { id: "agency", label: "Brand Empire", icon: Globe },
    { id: "portfolio", label: "8K Portfolio", icon: Globe },
    { id: "analytics", label: "Deep Insights", icon: BarChart3 },
    { id: "team", label: "Force Multiplier", icon: Users },
  ];

  const handleNavigate = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative inset-y-0 left-0 w-72 flex-shrink-0 nm-flat m-4 rounded-[2.5rem] flex flex-col items-center py-10 z-50 transition-transform duration-300 transform lg:translate-x-0 border border-slate-100 dark:border-white/5",
        isSidebarOpen ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0"
      )}>
        <div className="px-6 mb-12 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 dark:bg-orange-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-2xl">Σ</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-950 dark:text-white uppercase transition-colors">StratOS</span>
        </div>

        <nav className="flex-1 w-full px-4 space-y-3 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 group",
                  active 
                    ? (item.id === 'dashboard' ? "nm-inset text-orange-600 dark:text-orange-400" : "nm-inset text-orange-600 dark:text-orange-400")
                    : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", active ? "opacity-100" : "opacity-50")} />
                <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 w-full mt-auto space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
           <button
             onClick={() => setDarkMode(!darkMode)}
             className="w-full flex items-center justify-center gap-4 py-4 nm-button rounded-2xl group"
           >
             {darkMode ? (
               <><Sun className="w-5 h-5 text-amber-500" /><span className="text-sm font-bold">Light Mode</span></>
             ) : (
               <><Moon className="w-5 h-5 text-indigo-500" /><span className="text-sm font-bold">Dark Mode</span></>
             )}
           </button>
           <button
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-4 py-4 px-6 nm-button text-red-500 rounded-2xl group"
           >
             <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" />
             <span className="font-semibold text-sm">Logout</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 relative bg-white dark:bg-slate-950">
        <header className="flex flex-col lg:flex-row justify-between items-center mb-8 sticky top-0 z-30 py-4 gap-6 backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden nm-button p-3 rounded-xl text-slate-950 dark:text-orange-500"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <div className="flex-1 lg:flex-none">
              <h2 className="text-xl lg:text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
              <p className="text-[10px] lg:text-xs text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] font-black italic">StratOS • Nerve System</p>
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search your Empire (Brands, Campaigns, Assets)..." 
              className="w-full pl-12 pr-6 py-4 nm-inset rounded-2xl bg-transparent font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-orange-600/20 transition-all border-none"
            />
            <div className="absolute right-4 inset-y-0 flex items-center gap-2">
               <span className="px-2 py-0.5 nm-button rounded-lg text-[8px] font-black text-slate-400 uppercase">⌘ K</span>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="nm-button p-3 rounded-full hidden md:flex"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-[120px]">{profile?.displayName}</p>
                <p className="text-[9px] font-bold text-orange-600 uppercase tracking-widest">{profile?.role}</p>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="nm-inset p-0.5 rounded-full w-10 h-10 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all cursor-pointer relative group"
              >
                <img src={profile?.photoURL ?? undefined} alt="avatar" className="w-full h-full object-cover rounded-full" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "dashboard" && <Dashboard user={profile} onNavigate={handleNavigate} />}
            {activeTab === "agency" && <BrandManager />}
            {activeTab === "planner" && <ContentPlanner user={profile} />}
            {activeTab.startsWith("ai_studio") && (
              <AICreativeStudio 
                user={profile}
                onNavigate={handleNavigate} 
                initialTool={menuItems.find(m => m.id === activeTab)?.tool as any} 
              />
            )}
            {activeTab === "editor" && <ProfessionalEditor onNavigate={handleNavigate} />}
            {activeTab === "chat" && <ChatRoom user={profile} />}
            {activeTab === "operations" && <OperationsHub />}
            {activeTab === "portfolio" && <PortfolioBuilder />}
            {activeTab === "analytics" && <AnalyticsHub />}
             {activeTab === "team" && (
              <div className="nm-flat p-8 rounded-3xl h-96 flex items-center justify-center">
                <p className="text-xl font-bold text-slate-400">Team Collaboration Workspace</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <footer className="mt-24 pt-12 pb-12 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left mb-12">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Core Services</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <li>AI Content Generation</li>
                <li>8K Image & Video Synthesis</li>
                <li>Professional Media Editing</li>
                <li>Strategic Content Planning</li>
                <li>Global Multi-User Chat</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Creative OS Tools</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <li>Automated Social Scheduler</li>
                <li>Pro-Grade Vector Editor</li>
                <li>Brand Portfolio Builder</li>
                <li>Real-time Growth Analytics</li>
                <li>Cross-Platform Insights</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Enterprise</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <li>API Integration Hub</li>
                <li>Team Workspace Management</li>
                <li>Advanced Security AES-256</li>
                <li>Custom 8K Prompt Engine</li>
                <li>Dedicated Creative Support</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Productivity</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <li>Smart Calendar Sync</li>
                <li>Automated Invoicing Pro</li>
                <li>Secure Asset Storage</li>
                <li>Client Collaboration Portal</li>
                <li>One-Click Portfolio Live</li>
              </ul>
            </div>
          </div>

          <div className="nm-inset p-8 rounded-[2.5rem] w-full max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-600 dark:bg-orange-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">Σ</span>
              </div>
              <span className="text-lg font-black tracking-tighter text-slate-950 dark:text-white">StratOS Creative Studio</span>
            </div>
            <p className="font-medium text-slate-600 dark:text-slate-400 max-w-2xl mx-auto italic">
              "Empowering the next generation of digital masters with unified creative intelligence and professional-grade operational tools."
            </p>
            <div className="flex flex-wrap justify-center gap-8 pt-4">
              <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 underline uppercase tracking-widest transition-colors">Terms of Service</a>
              <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 underline uppercase tracking-widest transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 underline uppercase tracking-widest transition-colors">Support Center</a>
              <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 underline uppercase tracking-widest transition-colors">Developer API</a>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300 font-mono pt-6">© 2026 StratOS Software Group. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
