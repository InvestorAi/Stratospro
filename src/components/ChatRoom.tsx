import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Phone, Video, MoreVertical, Search, CheckCheck, Smile, Mic, Bot, Sparkles, Download, FileText, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  type?: 'text' | 'file' | 'voice';
}

export default function ChatRoom({ user }: { user: any }) {
  const [isAiActive, setIsAiActive] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load messages in real-time
  useEffect(() => {
    const q = query(
      collection(db, "chats", "global-nerve", "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    
    const textToSend = message;
    setMessage("");

    try {
      await addDoc(collection(db, "chats", "global-nerve", "messages"), {
        senderId: user.uid,
        senderName: user.displayName || "Strategist",
        text: textToSend,
        timestamp: serverTimestamp(),
        type: 'text'
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "...";
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] nm-flat rounded-[3rem] overflow-hidden border border-slate-100 dark:border-white/5">
      {/* Sidebar - Contacts */}
      <div className="w-80 lg:w-96 border-r border-slate-100 dark:border-white/5 flex flex-col bg-slate-50/50 dark:bg-slate-900/30">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-black uppercase text-slate-950 dark:text-white tracking-widest leading-none">Nerve Center</h3>
             <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Empire Contacts..." 
              className="w-full pl-10 pr-4 py-3 nm-inset rounded-xl bg-transparent text-sm font-bold placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {[
            { name: "Lumina Digital (CEO)", last: "Ready for the 8K assets?", time: "2m", active: true },
            { name: "EcoVibe Marketing", last: "Invoice #902 paid.", time: "1h", active: false },
            { name: "Global Operations", last: "New onboarding request.", time: "3h", active: false },
          ].map((contact, i) => (
            <div key={i} className={`p-4 rounded-3xl flex items-center gap-4 cursor-pointer transition-all ${contact.active ? 'nm-inset bg-white dark:bg-slate-900 border border-orange-500/20' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}>
              <div className="w-12 h-12 rounded-2xl nm-button flex items-center justify-center font-black text-orange-600">
                {contact.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-black text-xs text-slate-950 dark:text-white truncate uppercase">{contact.name}</p>
                  <span className="text-[10px] font-bold text-slate-400">{contact.time}</span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 truncate">{contact.last}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full nm-button flex items-center justify-center text-orange-600 font-black">L</div>
              <div>
                <p className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight">Lumina Digital CEO</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Now • Global Hub</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              {/* AI Autoresponder Switch */}
              <div className="flex items-center gap-3 px-4 py-2 nm-button rounded-2xl border border-orange-100 dark:border-orange-500/20">
                <Bot className={`w-4 h-4 ${isAiActive ? 'text-orange-600' : 'text-slate-400'}`} />
                <span className="text-[11px] font-black uppercase text-slate-500">AI NERVE</span>
                <button 
                  onClick={() => setIsAiActive(!isAiActive)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${isAiActive ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <motion.div 
                    animate={{ x: isAiActive ? 22 : 4 }}
                    className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm" 
                  />
                </button>
              </div>

              <div className="h-8 w-px bg-slate-100 dark:bg-white/5 mx-2" />
              
              <button className="p-3 nm-button rounded-xl text-slate-500 hover:text-orange-600 transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-3 nm-button rounded-xl text-slate-500 hover:text-orange-600 transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-3 nm-button rounded-xl text-slate-500">
                <MoreVertical className="w-5 h-5" />
              </button>
           </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                initial={{ opacity: 0, x: msg.senderId !== user?.uid ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={msg.id}
                className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-md ${msg.senderId === user?.uid ? 'order-1' : 'order-2'}`}>
                   {msg.senderId !== user?.uid && (
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">{msg.senderName}</p>
                   )}
                  <div className={`p-5 rounded-[2rem] text-sm font-medium leading-relaxed ${
                    msg.senderId === user?.uid 
                      ? 'bg-orange-600 text-white rounded-tr-none shadow-xl shadow-orange-600/10' 
                      : 'nm-inset bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-2 mt-2 px-2 ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase italic">{formatTime(msg.timestamp)}</span>
                    {msg.senderId === user?.uid && <CheckCheck className="w-3 h-3 text-orange-500" />}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isAiActive && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end italic">
                <div className="flex items-center gap-2 px-6 py-2 nm-inset rounded-full text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50/50 dark:bg-orange-950/20">
                   <Sparkles className="w-3 h-3 animate-pulse" /> AI is monitoring this nerve...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-white/5">
          <div className="nm-inset rounded-[2rem] bg-white dark:bg-slate-950 p-2 flex items-center gap-2">
            <button className="p-3 nm-button rounded-2xl text-slate-400 hover:text-orange-600">
               <Paperclip className="w-5 h-5" />
            </button>
            <input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              type="text" 
              placeholder={isAiActive ? "AI Autoresponder is active..." : "Type your strategic update..."}
              className="flex-1 bg-transparent border-none outline-none px-4 py-2 font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <button className="p-3 text-slate-400 hover:text-orange-600">
               <Smile className="w-5 h-5" />
            </button>
            <button className="p-3 text-slate-400 hover:text-orange-600">
               <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSend}
              className="p-4 bg-orange-600 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
               <Send className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex justify-center gap-8 mt-4">
             <button className="text-[10px] font-black uppercase text-slate-400 hover:text-orange-600 flex items-center gap-1">
               <FileText className="w-3 h-3" /> Gen. Form
             </button>
             <button className="text-[10px] font-black uppercase text-slate-400 hover:text-orange-600 flex items-center gap-1">
               <Globe className="w-3 h-3" /> Gen. Invoice
             </button>
             <button className="text-[10px] font-black uppercase text-slate-400 hover:text-orange-600 flex items-center gap-1">
               <Download className="w-3 h-3" /> Gen. Receipt
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
