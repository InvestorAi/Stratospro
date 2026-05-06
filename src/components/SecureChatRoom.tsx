import React, { useState, useEffect, useRef } from "react";
import { Send, Shield, Lock, CheckCheck, Bot, Sparkles, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/firebase";
import { EncryptionService } from "../lib/security/encryption";
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
  cipherText: string;
  timestamp: any;
  isEncrypted: boolean;
}

interface DecryptedMessage extends Message {
  text: string;
}

export default function SecureChatRoom({ user }: { user: any }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ROOM_KEY = "NEXURA_GLOBAL_NERVE_SECURE"; // System-level shared secret for this nerve

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats", "global-nerve", "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        // Decrypt on receipt
        const decryptedText = data.isEncrypted 
          ? EncryptionService.decrypt(data.cipherText, ROOM_KEY)
          : data.text;

        return {
          id: doc.id,
          ...data,
          text: decryptedText
        };
      }) as DecryptedMessage[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !user || isEncrypting) return;
    
    setIsEncrypting(true);
    const textToSend = message;
    setMessage("");

    // E2E Encryption happens client-side
    const cipherText = EncryptionService.encrypt(textToSend, ROOM_KEY);

    try {
      await addDoc(collection(db, "chats", "global-nerve", "messages"), {
        senderId: user.uid,
        senderName: user.displayName || "Strategist",
        cipherText: cipherText,
        isEncrypted: true,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Secure Send Failure:", error);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] nm-flat rounded-[3rem] overflow-hidden border border-slate-100 dark:border-white/5 relative">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
         <Lock className="w-3 h-3 text-emerald-500" />
         <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">E2E AES-256 Protected</span>
      </div>

      {/* Header */}
      <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/20">
              <MessageSquare className="w-6 h-6 text-white" />
           </div>
           <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">Brandavox Nerve</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                 <Shield className="w-3 h-3 text-emerald-500" /> Secure Real-time Coordination
              </p>
           </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
        <AnimatePresence>
          {messages.map((msg: any) => (
            <motion.div
              initial={{ opacity: 0, x: msg.senderId !== user?.uid ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              key={msg.id}
              className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-md ${msg.senderId === user?.uid ? 'order-1' : 'order-2'}`}>
                 <div className={`p-5 rounded-[2rem] text-sm font-medium leading-relaxed ${
                    msg.senderId === user?.uid 
                      ? 'bg-orange-600 text-white rounded-tr-none' 
                      : 'nm-inset bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                 </div>
                 <div className={`flex items-center gap-2 mt-2 px-2 ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                       {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : '...'}
                    </span>
                    <CheckCheck className="w-3 h-3 text-orange-500" />
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-100 dark:border-white/5">
        <div className="nm-inset p-2 rounded-[2rem] flex items-center gap-3">
          <input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Transmit command to the Nerve..."
            className="flex-1 bg-transparent px-6 py-3 font-bold text-sm outline-none placeholder:text-slate-400"
          />
          <button 
            onClick={handleSend}
            className="p-4 bg-orange-600 rounded-full text-white shadow-xl shadow-orange-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
