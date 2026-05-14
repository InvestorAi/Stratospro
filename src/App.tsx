/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { auth, db, signInWithPopup, googleProvider, onSnapshot, doc, getDoc, setDoc, handleFirestoreError, OperationType, query, collection, where, updateDoc } from "./lib/firebase";
import { orderBy, limit } from "firebase/firestore";
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
  Clock,
  PenTool,
  BrainCircuit,
  BarChart3,
  Users,
  Search,
  FileText,
  Mic2,
  Video,
  Layout,
  Scissors,
  Mail,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Phone,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Target,
  Layers,
  Bell,
  Eye,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "./types";
import BrandLogo from "./components/BrandLogo";

// Components
import Dashboard from "./components/Dashboard";
import ContentPlanner from "./components/ContentPlanner";
import AICreativeStudio from "./components/AICreativeStudio";
import SecureChatRoom from "./components/SecureChatRoom";
import ProfessionalEditor from "./components/ProfessionalEditor";
import PortfolioBuilder from "./components/PortfolioBuilder";
import BrandManager from "./components/BrandManager";
import AnalyticsHub from "./components/AnalyticsHub";
import OperationsHub from "./components/OperationsHub";
import NeuralEmailStudio from "./components/NeuralEmailStudio";
import LandingPage from "./components/LandingPage";
import CommandPalette from "./components/CommandPalette";
import LegalPages from "./components/LegalPages";

// Brandavox Modules
import ClientManagement from "./components/brandavox/ClientManagement";
import AITools from "./components/brandavox/AITools";
import SocialInbox from "./components/brandavox/SocialInbox";
import BillingReporting from "./components/brandavox/BillingReporting";
import ClientOnboarding from "./components/brandavox/ClientOnboarding";
import CompetitorIntelligence from "./components/brandavox/CompetitorIntelligence";
import CompetitorComparison from "./components/brandavox/CompetitorComparison";
import NeuralAlertHub from "./components/brandavox/NeuralAlertHub";
import CompetitorContentTracker from "./components/brandavox/CompetitorContentTracker";
import SystemHealth from "./components/brandavox/SystemHealth";

import { EncryptionService } from "./lib/security/encryption";
const ROOM_KEY = "NEXURA_GLOBAL_NERVE_SECURE";

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeBrand, setActiveBrand] = useState<any>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [brands, setBrands] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile || profile.uid === 'guest-user') {
      if (profile?.uid === 'guest-user') {
        setRecentActivities([
          { id: 'm1', senderName: 'System', text: 'Neural Interface calibrating...', timestamp: new Date() },
          { id: 'm2', senderName: 'Nerve-AI', text: 'Standby for global sync.', timestamp: new Date() }
        ]);
      }
      return;
    }

    const q = query(
      collection(db, "chats", "global-nerve", "messages"),
      orderBy("timestamp", "desc"),
      limit(4)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => {
        const data = doc.data();
        let text = data.text;
        if (data.isEncrypted) {
          try {
            text = EncryptionService.decrypt(data.cipherText || "", ROOM_KEY);
          } catch (e) {
            text = "[[ENCRYPTED]]";
          }
        }
        return {
          id: doc.id,
          ...data,
          text: text ? (text.length > 50 ? text.substring(0, 50) + '...' : text) : '...'
        };
      });
      setRecentActivities(activities);
    });

    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    if (!profile || profile.uid === 'guest-user') {
      if (profile?.uid === 'guest-user') {
        setBrands([
          { id: 'mock-1', name: 'Nexus Alpha', niche: 'Luxury Tech', status: 'active' }
        ]);
      }
      return;
    }

    const q = query(collection(db, "brands"), where("ownerId", "==", profile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const brandList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBrands(brandList);
      // Auto-select first brand if none active
      if (!activeBrand && brandList.length > 0) {
        setActiveBrand(brandList[0]);
      }
    });

    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        if (u) {
          const userDocPath = `users/${u.uid}`;
          let userDoc;
          try {
            userDoc = await getDoc(doc(db, "users", u.uid));
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, userDocPath);
            return;
          }

          if (userDoc?.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile(data);
            if (!data.whatsapp) {
              setShowWhatsAppModal(true);
            }
          } else {
            const newProfile: UserProfile = {
              uid: u.uid,
              email: u.email || "",
              displayName: u.displayName,
              photoURL: u.photoURL,
              role: "owner",
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(doc(db, "users", u.uid), newProfile);
              setShowWhatsAppModal(true);
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, userDocPath);
              return;
            }
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
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

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/internal-error') {
        alert("Authentication failed. This may be due to a network issue or browser blocks. Please try refreshing or check if popups are enabled.");
      } else {
        alert(`Login failed: ${err.message}`);
      }
    }
  };

  const handleSocialLogin = async (platform: string) => {
    try {
      const response = await fetch(`/api/auth/url?platform=${platform}`);
      const { url } = await response.json();
      
      const width = 600, height = 700;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      
      window.open(url, `Auth_${platform}`, `width=${width},height=${height},left=${left},top=${top}`);
    } catch (err) {
      console.error("Social login failed:", err);
    }
  };

  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Security: In a real app, verify event.origin
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && !user && !isGuest) {
        const { platform, username, token, followers } = event.data;
        
        // Mock a login based on the social data
        setIsGuest(true);
        setProfile({
          uid: `social-${platform}-${username}`,
          email: `${username}@${platform}.com`,
          displayName: `${username} (${platform})`,
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
          role: "owner",
          createdAt: new Date().toISOString()
        });
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [user, isGuest]);

  const handleLogout = () => {
    auth.signOut();
    setIsGuest(false);
  };

  const handleDemoMode = () => {
    setIsGuest(true);
    setUser(null);
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
        onSocialLogin={handleSocialLogin}
        onEnterDemo={handleDemoMode}
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />
    );
  }

  const menuItems = [
    { id: "dashboard", label: "Neural Dashboard", icon: LayoutDashboard },
    { id: "onboarding", label: "Client Quest", icon: Rocket, badge: 'AUTO', badgeColor: 'bg-orange-100 text-orange-600' },
    { id: "clients", label: "Client Empire", icon: Users, badge: 'PRO', badgeColor: 'bg-indigo-100 text-indigo-600' },
    { id: "competitors", label: "Market Intel", icon: Target, badge: 'NEW', badgeColor: 'bg-rose-100 text-rose-600' },
    { id: "surveillance", label: "Neural Surveillance", icon: Eye, badge: 'LIVE', badgeColor: 'bg-emerald-100 text-emerald-600' },
    { id: "alerts", label: "Neural Alerts", icon: Bell, badge: '4', badgeColor: 'bg-rose-500 text-white shadow-lg' },
    { id: "comparison", label: "Rival Benchmarks", icon: Layers, badge: 'PRO', badgeColor: 'bg-blue-100 text-blue-600' },
    { id: "planner", label: "Content Planner", icon: Calendar },
    { id: "infrastructure", label: "Neural Matrix Vitals", icon: Activity, badge: 'CORE', badgeColor: 'bg-emerald-100 text-emerald-600' },
    { id: "inbox", label: "Social Inbox", icon: MessageSquare, badge: 'NEW', badgeColor: 'bg-orange-100 text-orange-600' },
    { id: "divider1", label: "AI Intelligence", isDivider: true },
    { id: "ai_toolkit", label: "AI Content Factory", icon: Sparkles, badge: 'AUTO', badgeColor: 'bg-emerald-100 text-emerald-600' },
    { id: "ai_studio_image", label: "8K Image Lab", icon: ImageIcon, tool: 'image' },
    { id: "ai_studio_video", label: "Motion Labs", icon: Video, tool: 'video', badge: 'PRO', badgeColor: 'bg-orange-100 text-orange-600' },
    { id: "divider2", label: "Management", isDivider: true },
    { id: "email_studio", label: "Email Studio", icon: Mail },
    { id: "billing", label: "Finance & Ledger", icon: BarChart3 },
    { id: "team", label: "Agency Team", icon: Users },
    { id: "divider3", label: "Legacy Hubs", isDivider: true },
    { id: "portfolio", label: "My Portfolio", icon: Rocket },
    { id: "agency", label: "Brand Identity", icon: Globe },
    { id: "editor", label: "Photo Studio", icon: PenTool },
  ];

  const handleNavigate = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  const mainDashboard = (
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

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        animate={{ 
          width: isSidebarCollapsed ? 96 : 320,
          x: isSidebarOpen ? 0 : (window.innerWidth < 1024 ? -400 : 0)
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed lg:relative inset-y-0 left-0 flex-shrink-0 nm-flat lg:m-4 rounded-r-[2.5rem] lg:rounded-[2.5rem] flex flex-col items-center py-10 z-50 border border-slate-100 dark:border-white/5 overflow-hidden bg-white dark:bg-slate-900",
          !isSidebarOpen && "lg:flex"
        )}
      >
        <div className={cn("px-6 mb-12 flex items-center gap-3 w-full justify-center transition-all relative", isSidebarCollapsed ? "flex-col" : "flex-row")}>
          <BrandLogo size={isSidebarCollapsed ? "sm" : "lg"} />
          {!isSidebarCollapsed && (
            <span className="text-2xl font-black tracking-tighter text-slate-950 dark:text-white uppercase truncate">Brandavox</span>
          )}
          
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute right-4 top-0 p-2 nm-button rounded-xl text-slate-400 hover:text-red-500 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-24 nm-button p-2 rounded-full z-[60] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-orange-600 hover:scale-110 transition-transform shadow-xl"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        <nav className="flex-1 w-full px-4 space-y-2 overflow-y-auto custom-scrollbar pt-4 overflow-x-hidden">
          {/* Project History Button - Highlighted */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center justify-between gap-4 py-4 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20 mb-6 group transition-all active:scale-95 overflow-hidden",
              isSidebarCollapsed ? "px-0 justify-center" : "px-6"
            )}
          >
            <div className="flex items-center gap-3 min-w-max">
              <div className="p-1.5 bg-white/20 rounded-full shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              {!isSidebarCollapsed && <span className="font-bold text-sm whitespace-nowrap">Project History</span>}
            </div>
            {!isSidebarCollapsed && <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-black">0</span>}
          </button>

          {menuItems.map((item) => {
            if (item.isDivider) {
              return !isSidebarCollapsed && (
                <div key={item.id} className="pt-6 pb-2 px-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    {item.label}
                  </p>
                </div>
              );
            }

            const Icon = item.icon!;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between py-3.5 rounded-2xl transition-all duration-200 group cursor-pointer overflow-hidden",
                  active 
                    ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white"
                    : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400",
                  isSidebarCollapsed ? "px-0 justify-center" : "px-6"
                )}
                title={item.label}
              >
                <div className="flex items-center gap-4 min-w-max">
                  <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110 shrink-0", active ? "opacity-100" : "opacity-60")} />
                  {!isSidebarCollapsed && <span className="font-bold text-sm tracking-tight whitespace-nowrap">{item.label}</span>}
                </div>
                {item.badge && !isSidebarCollapsed && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-lg text-[9px] font-black transition-opacity",
                    item.badgeColor || "bg-slate-100 text-slate-500"
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className={cn("px-4 w-full mt-auto space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800", isSidebarCollapsed && "px-2")}>
           <button
             onClick={() => setDarkMode(!darkMode)}
             className={cn("w-full flex items-center gap-4 py-4 nm-button rounded-2xl group transition-all", isSidebarCollapsed ? "justify-center" : "justify-center")}
           >
             {darkMode ? (
               <><Sun className="w-5 h-5 text-amber-500" />{!isSidebarCollapsed && <span className="text-sm font-bold">Light Mode</span>}</>
             ) : (
               <><Moon className="w-5 h-5 text-indigo-500" />{!isSidebarCollapsed && <span className="text-sm font-bold">Dark Mode</span>}</>
             )}
           </button>
           <button
             onClick={handleLogout}
             className={cn("w-full flex items-center gap-4 py-4 nm-button text-red-500 rounded-2xl group transition-all", isSidebarCollapsed ? "justify-center" : "px-6 justify-center")}
           >
             <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" />
             {!isSidebarCollapsed && <span className="font-semibold text-sm">Logout</span>}
           </button>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 relative bg-white dark:bg-slate-950">
        <header className="flex flex-col lg:flex-row justify-between items-center mb-8 sticky top-0 z-30 py-4 gap-6 backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden nm-button p-3 rounded-xl text-slate-950 dark:text-orange-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1 lg:flex-none">
              <h2 className="text-xl lg:text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                {menuItems.find(m => m.id === activeTab)?.label}
                {activeBrand && (
                  <span className="text-[10px] bg-orange-600 text-white px-3 py-1 rounded-full tracking-widest font-black flex items-center gap-1.5 ml-2">
                    <Sparkles className="w-2.5 h-2.5" />
                    {activeBrand.name}
                  </span>
                )}
              </h2>
              <p className="text-[10px] lg:text-xs text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] font-black italic">Brandavox AI • Intelligence Hub</p>
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl relative group flex items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
              </div>
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search your Empire (Brands, Campaigns, Assets)..." 
                className="w-full pl-12 pr-6 py-4 nm-inset rounded-2xl bg-transparent font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-orange-600/20 transition-all border-none"
              />
              <div className="absolute right-4 inset-y-0 flex items-center gap-2">
                 <span className="px-2 py-0.5 nm-button rounded-lg text-[8px] font-black text-slate-400 uppercase">⌘ K</span>
              </div>
            </div>

            {/* Global Brand Selector */}
            <div className="hidden xl:flex items-center gap-2 nm-button p-1 rounded-2xl">
              <select 
                value={activeBrand?.id || ""}
                onChange={(e) => {
                  const brand = brands.find(b => b.id === e.target.value);
                  setActiveBrand(brand || null);
                }}
                className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 cursor-pointer pl-4 pr-10 py-2 appearance-none"
              >
                <option value="">Select Brand Identity</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              <div className="absolute right-3 pointer-events-none opacity-40">
                <Globe className="w-3 h-3" />
              </div>
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
             {activeTab === "dashboard" && (
               <div className="space-y-8">
                 {/* Modern Recent Activity Section */}
                 <div className="nm-flat p-8 rounded-[3rem] border border-orange-500/10 mb-8 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="flex justify-between items-center mb-8">
                       <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
                             <Activity className="w-5 h-5 text-orange-600 animate-pulse" /> Recent Network Activity
                          </h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time transmissions from Global Nerve</p>
                       </div>
                       <button 
                         onClick={() => setActiveTab('inbox')} 
                         className="nm-button px-4 py-2 rounded-xl text-[9px] font-black uppercase text-orange-600 transition-all hover:scale-105"
                       >
                         View All Broadcasts
                       </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                       {recentActivities.map((activity, idx) => (
                          <motion.div 
                            key={activity.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ 
                              y: -4, 
                              scale: 1.02,
                              transition: { duration: 0.2 }
                            }}
                            className="nm-flat p-6 rounded-3xl border border-transparent hover:border-orange-500/20 bg-white dark:bg-slate-900/50 transition-all group/card cursor-pointer"
                          >
                             <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col">
                                   <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{activity.senderName}</span>
                                   <div className="h-0.5 w-4 bg-orange-600/30 rounded-full mt-1 group-hover/card:w-8 transition-all" />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                   <Clock className="w-2.5 h-2.5" />
                                   {activity.timestamp ? (activity.timestamp.toDate ? activity.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : '...'}
                                </span>
                             </div>
                             <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 line-clamp-2 leading-snug group-hover/card:text-slate-950 dark:group-hover:text-white transition-colors">
                                {activity.text}
                             </p>
                          </motion.div>
                       ))}
                       {recentActivities.length === 0 && (
                          <div className="col-span-full py-12 text-center">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listening for incoming data streams...</p>
                          </div>
                       )}
                    </div>
                 </div>

                 <Dashboard user={profile} onNavigate={handleNavigate} />
               </div>
             )}
            {activeTab === "onboarding" && <ClientOnboarding />}
            {activeTab === "clients" && <ClientManagement />}
            {activeTab === "ai_toolkit" && <AITools />}
            {activeTab === "inbox" && <SocialInbox />}
            {activeTab === "billing" && <BillingReporting />}
            {activeTab === "competitors" && <CompetitorIntelligence onNavigate={handleNavigate} />}
            {activeTab === "surveillance" && <CompetitorContentTracker />}
            {activeTab === "alerts" && <NeuralAlertHub />}
            {activeTab === "comparison" && <CompetitorComparison />}
            {activeTab === "agency" && <BrandManager user={profile} onBrandSelect={setActiveBrand} activeBrand={activeBrand} />}
            {activeTab === "planner" && <ContentPlanner user={profile} />}
            {activeTab === "infrastructure" && <SystemHealth />}
            {activeTab.startsWith("ai_studio") && (
              <AICreativeStudio 
                user={profile}
                activeBrand={activeBrand}
                onNavigate={handleNavigate} 
                initialTool={menuItems.find(m => m.id === activeTab)?.tool as any} 
              />
            )}
            {activeTab === "editor" && <ProfessionalEditor onNavigate={handleNavigate} />}
            {activeTab === "chat" && <SecureChatRoom user={profile} />}
            {activeTab === "operations" && <OperationsHub user={profile} activeBrand={activeBrand} />}
            {activeTab === "email_studio" && <NeuralEmailStudio user={profile} activeBrand={activeBrand} />}
            {activeTab === "portfolio" && <PortfolioBuilder />}
            {activeTab === "analytics" && <AnalyticsHub />}
             {activeTab === "team" && (
              <div className="nm-flat p-8 rounded-3xl h-96 flex items-center justify-center">
                <p className="text-xl font-bold text-slate-400">Team Collaboration Workspace</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <CommandPalette 
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={handleNavigate}
        />

        <AnimatePresence>
          {showWhatsAppModal && profile && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowWhatsAppModal(false)} 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                className="relative w-full max-w-lg nm-flat bg-white dark:bg-slate-950 p-12 rounded-[4rem] border border-orange-500/20 text-left overflow-hidden shadow-2xl"
              >
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl animate-pulse" />
                
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-orange-600 rounded-3xl text-white shadow-2xl shadow-orange-600/30">
                      <Phone className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter leading-tight">Elite Community Access</h3>
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-1">Automatic WhatsApp Synchronization</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                      "Founders and strategists who communicate in real-time scale 3x faster. Join our encrypted WhatsApp community for instant neural updates and collaborative scaling."
                    </p>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">WhatsApp Identity (Mobile Number)</label>
                       <div className="relative group">
                         <div className="absolute inset-y-0 left-5 flex items-center">
                            <span className="text-sm font-black text-slate-400">+</span>
                         </div>
                         <input 
                           type="tel"
                           value={whatsappNumber}
                           onChange={(e) => setWhatsappNumber(e.target.value)}
                           placeholder="1 234 567 890"
                           className="w-full nm-inset pl-10 pr-6 py-5 rounded-[2rem] font-black bg-transparent text-slate-900 dark:text-white border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-800 transition-all"
                         />
                       </div>
                    </div>

                    <div className="p-5 nm-inset rounded-3xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 space-y-3">
                       <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase text-slate-500">Automatic Group Induction</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase text-slate-500">24/7 Neural Support Access</span>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <button 
                         onClick={() => setShowWhatsAppModal(false)}
                         className="flex-1 py-5 nm-button rounded-[2rem] text-xs font-black uppercase text-slate-400 hover:text-slate-900 transition-all"
                       >
                         Skip Integration
                       </button>
                       <button 
                         onClick={async () => {
                           if (!whatsappNumber || !user) return;
                           try {
                             await updateDoc(doc(db, "users", user.uid), { whatsapp: whatsappNumber });
                             setProfile(prev => prev ? { ...prev, whatsapp: whatsappNumber } : null);
                             setShowWhatsAppModal(false);
                             alert("Welcome to the Brandavox Elite Community! Access link sent to your WhatsApp.");
                           } catch (e) {
                             console.error(e);
                           }
                         }}
                         className="flex-[2] py-5 bg-orange-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-orange-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                       >
                         Activate Neural Link <ArrowRight className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <footer className="mt-24 pt-12 pb-12 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left mb-12">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Premium Power</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium font-sans">
                <li>Neural Motion Ads (4K)</li>
                <li>Brand Mockups (8K)</li>
                <li>Dynamic Billboard Synthesis</li>
                <li>Storefront Photorealism</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs">AI Intelligence</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium font-sans">
                <li>Image Generation</li>
                <li>Voice Generation</li>
                <li>Video Generation</li>
                <li>Design Studio</li>
                <li>Neural Utils</li>
                <li>Brand Identity</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Creative Studio</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium font-sans">
                <li>Photo Editor</li>
                <li>Designer Chat</li>
                <li>Content Planner</li>
                <li>Portfolio Builder</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Management</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium font-sans">
                <li>Brand Manager</li>
                <li>My Portfolio</li>
                <li>Analytics Hub</li>
                <li>Team Space</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Productivity</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium font-sans">
                <li>Smart Calendar Sync</li>
                <li>Automated Invoicing Pro</li>
                <li>Secure Asset Storage</li>
                <li>Neural Firewall</li>
              </ul>
            </div>
          </div>

          <div className="nm-inset p-8 rounded-[2.5rem] w-full max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <BrandLogo size="md" />
              <span className="text-lg font-black tracking-tighter text-slate-950 dark:text-white uppercase">Brandavox AI Studio</span>
            </div>
            <p className="font-medium text-slate-600 dark:text-slate-400 max-w-2xl mx-auto italic">
              "Empowering the next generation of digital masters with unified creative intelligence and professional-grade operational tools."
            </p>
            <div className="flex flex-wrap justify-center gap-8 pt-4">
              <button onClick={() => setActiveTab('legal_terms')} className="text-xs font-bold text-slate-400 hover:text-slate-900 underline uppercase tracking-widest transition-colors">Terms of Service</button>
              <button onClick={() => setActiveTab('legal_privacy')} className="text-xs font-bold text-slate-400 hover:text-slate-900 underline uppercase tracking-widest transition-colors">Privacy Policy</button>
              <button onClick={() => setActiveTab('legal_about')} className="text-xs font-bold text-slate-400 hover:text-slate-900 underline uppercase tracking-widest transition-colors">About Us</button>
              <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 underline uppercase tracking-widest transition-colors">Support Center</a>
              <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 underline uppercase tracking-widest transition-colors">Developer API</a>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300 font-mono pt-6">© 2026 Brandavox AI. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );

  const renderLegalView = () => {
    const section = activeTab.split('_')[1] as any;
    return (
      <LegalPages 
        initialSection={section || 'about'} 
        onBack={() => setActiveTab('dashboard')} 
      />
    );
  };

  if (activeTab.startsWith('legal_')) {
    return renderLegalView();
  }

  return mainDashboard;
}
