import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  LayoutDashboard, 
  Calendar, 
  Sparkles, 
  FileText, 
  PlusCircle, 
  Image as ImageIcon,
  ChevronRight,
  Command,
  ArrowRight,
  Zap
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  category: "Navigation" | "Actions";
  description?: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: LayoutDashboard, 
      category: "Navigation",
      description: "Return to your empire overview",
      shortcut: "G D",
      action: () => onNavigate("dashboard") 
    },
    { 
      id: "ai_studio", 
      label: "AI Studio", 
      icon: Sparkles, 
      category: "Navigation",
      description: "Open the neural creative lab",
      shortcut: "G S",
      action: () => onNavigate("ai_studio_image") 
    },
    { 
      id: "planner", 
      label: "Content Planner", 
      icon: Calendar, 
      category: "Navigation",
      description: "Manage your content schedule",
      shortcut: "G P",
      action: () => onNavigate("planner") 
    },
    { 
      id: "new_post", 
      label: "Create New Post", 
      icon: PlusCircle, 
      category: "Actions",
      description: "Draft a new social media entry",
      shortcut: "N P",
      action: () => { onNavigate("planner"); onClose(); } 
    },
    { 
      id: "gen_image", 
      label: "Generate Image", 
      icon: ImageIcon, 
      category: "Actions",
      description: "Launch neural image synthesizer",
      shortcut: "N I",
      action: () => { onNavigate("ai_studio_image"); onClose(); } 
    },
    { 
      id: "neural_prompt", 
      label: "Neural Prompting", 
      icon: FileText, 
      category: "Actions",
      description: "Design high-fidelity AI prompts",
      shortcut: "N T",
      action: () => { onNavigate("ai_studio_strategic"); onClose(); } 
    },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase()) || 
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="relative w-full max-w-2xl nm-flat bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center gap-4">
              <Search className="w-6 h-6 text-orange-600" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search commands, tools, assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-xl font-black text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 nm-inset rounded-lg text-[10px] font-black text-slate-400">ESC</span>
              </div>
            </div>

            <div 
              ref={listRef}
              className="max-h-[60vh] overflow-y-auto p-4 space-y-6 custom-scrollbar"
            >
              {filteredCommands.length > 0 ? (
                <>
                  {["Navigation", "Actions"].map(category => {
                    const categoryCommands = filteredCommands.filter(cmd => cmd.category === category);
                    if (categoryCommands.length === 0) return null;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <h4 className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                           <Zap className="w-3 h-3 text-orange-600" /> {category}
                        </h4>
                        <div className="space-y-1">
                          {categoryCommands.map((cmd) => {
                            const globalIndex = filteredCommands.indexOf(cmd);
                            const isSelected = globalIndex === selectedIndex;
                            const Icon = cmd.icon;

                            return (
                              <button
                                key={cmd.id}
                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                onClick={() => { cmd.action(); onClose(); }}
                                className={cn(
                                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                                  isSelected 
                                    ? "nm-inset bg-orange-600/5 dark:bg-orange-600/10 translate-x-1" 
                                    : "hover:bg-slate-50 dark:hover:bg-white/5"
                                )}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "p-3 rounded-xl transition-all",
                                    isSelected ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30" : "nm-button text-slate-400"
                                  )}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div className="text-left">
                                    <p className={cn("font-black text-sm", isSelected ? "text-orange-600 dark:text-orange-400" : "text-slate-900 dark:text-white")}>
                                      {cmd.label}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                      {cmd.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  {cmd.shortcut && (
                                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 hidden sm:block">
                                      {cmd.shortcut}
                                    </span>
                                  )}
                                  <ChevronRight className={cn("w-4 h-4 transition-all", isSelected ? "text-orange-600 translate-x-1" : "text-slate-300 opacity-0")} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="py-20 text-center space-y-4">
                   <div className="w-16 h-16 nm-inset rounded-3xl mx-auto flex items-center justify-center text-slate-300">
                     <Search className="w-8 h-8" />
                   </div>
                   <div>
                     <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Neural Scan Complete</p>
                     <p className="text-xs font-bold text-slate-500 italic mt-1">"Your request does not match any current operational nodes."</p>
                   </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                   <div className="nm-inset p-1.5 rounded-lg">
                      <ArrowRight className="w-3 h-3 text-slate-400 rotate-90" />
                   </div>
                   <span className="text-[10px] font-black text-slate-400 uppercase">Navigate</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="nm-inset px-2 py-1 rounded-lg">
                      <span className="text-[10px] font-black text-slate-400">ENTER</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Execute</span>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                  <Command className="w-3 h-3 text-orange-600" />
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Brandavox Command Center</span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
