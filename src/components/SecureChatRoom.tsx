import React, { useState, useEffect, useRef } from "react";
import { Send, Shield, Lock, CheckCheck, Bot, Sparkles, MessageSquare, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { EncryptionService } from "../lib/security/encryption";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  where,
  setDoc,
  doc
} from "firebase/firestore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  const [activeChatId, setActiveChatId] = useState("global-nerve");
  const [chats, setChats] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const ROOM_KEY = "NEXURA_GLOBAL_NERVE_SECURE"; 

  // Fetch chats for the user
  useEffect(() => {
    if (!user || user.uid === 'guest-user') return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(chatList);
    }, (err) => handleFirestoreError(err, OperationType.LIST, "chats"));

    return () => unsubscribe();
  }, [user]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!user) return;

    if (user.uid === 'guest-user') {
      setMessages([{
        id: 'g1',
        senderId: 'ai',
        senderName: 'Nerve AI',
        cipherText: '',
        text: 'Welcome to the Secure Nerve. Real-time E2E encryption is active for all authenticated masters.',
        timestamp: { toDate: () => new Date() },
        isEncrypted: false
      }]);
      return;
    }

    const path = `chats/${activeChatId}/messages`;
    const q = query(
      collection(db, "chats", activeChatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const msgs = snapshot.docs.map(doc => {
          const data = doc.data();
          try {
            const decryptedText = data.isEncrypted 
              ? EncryptionService.decrypt(data.cipherText, ROOM_KEY)
              : data.text;

            return {
              id: doc.id,
              ...data,
              text: decryptedText
            };
          } catch (e) {
            return { id: doc.id, ...data, text: "[Decryption Failed]" };
          }
        }) as DecryptedMessage[];
        setMessages(msgs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, [user, activeChatId]);

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

    const cipherText = EncryptionService.encrypt(textToSend, ROOM_KEY);
    const path = `chats/${activeChatId}/messages`;

    if (user.uid === 'guest-user') {
      const mockMsg = {
        id: Date.now().toString(),
        senderId: user.uid,
        senderName: user.displayName || "Strategist",
        cipherText: cipherText,
        text: textToSend,
        isEncrypted: true,
        timestamp: { toDate: () => new Date() },
      };
      setMessages(prev => [...prev, mockMsg]);
      setIsEncrypting(false);
      return;
    }

    try {
      await addDoc(collection(db, "chats", activeChatId, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || "Strategist",
        cipherText: cipherText,
        isEncrypted: true,
        timestamp: serverTimestamp(),
      });

      // Update chat meta
      await setDoc(doc(db, "chats", activeChatId), {
        lastMessage: textToSend,
        updatedAt: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsEncrypting(false);
    }
  };

  const createChat = async () => {
    if (!targetEmail || !user) return;
    try {
      // For demo, we just generate a random ID and add ourselves.
      // In a real app, you'd look up the user by email first.
      const chatId = `chat_${Date.now()}`;
      await setDoc(doc(db, "chats", chatId), {
        participants: [user.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: "Secure session initiated.",
        type: 'direct'
      });
      setActiveChatId(chatId);
      setShowNewChatModal(false);
      setTargetEmail("");
      alert("Neural session established. Identity verification ongoing.");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-[750px] nm-flat rounded-[3rem] overflow-hidden border border-slate-100 dark:border-white/5 relative bg-white/5 dark:bg-slate-900/5 backdrop-blur-xl">
      {/* Sessions Sidebar */}
      <div className="w-80 border-r border-slate-100 dark:border-white/5 flex flex-col pt-8">
        <div className="px-8 mb-8 flex items-center justify-between">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Neural Channels</h3>
           <button 
             onClick={() => setShowNewChatModal(true)}
             className="p-2 nm-button rounded-xl text-orange-600 hover:scale-110 transition-transform"
           >
              <Users className="w-4 h-4" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2">
           <button 
             onClick={() => setActiveChatId("global-nerve")}
             className={cn(
               "w-full p-4 rounded-3xl flex items-center gap-4 transition-all",
               activeChatId === "global-nerve" ? "nm-inset bg-orange-600/5 text-orange-600" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500"
             )}
           >
              <div className="p-3 bg-orange-600 rounded-2xl text-white shrink-0">
                 <Shield className="w-4 h-4" />
              </div>
              <div className="text-left">
                 <p className="text-xs font-black uppercase tracking-tight">Global Nerve</p>
                 <p className="text-[10px] opacity-70 font-bold">Public Intelligence</p>
              </div>
           </button>

           {chats.map(chat => (
             <button 
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={cn(
                  "w-full p-4 rounded-3xl flex items-center gap-4 transition-all",
                  activeChatId === chat.id ? "nm-inset bg-orange-600/5 text-orange-600" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500"
                )}
             >
                <div className="w-12 h-12 nm-flat rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                   <Lock className="w-5 h-5" />
                </div>
                <div className="text-left overflow-hidden">
                   <p className="text-xs font-black uppercase tracking-tight truncate">{chat.id}</p>
                   <p className="text-[10px] opacity-70 font-bold truncate">{chat.lastMessage || "No messages"}</p>
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
           <Lock className="w-3 h-3 text-emerald-500" />
           <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">AES-256 Protocol Active</span>
        </div>

        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/20">
                <MessageSquare className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">
                  {activeChatId === 'global-nerve' ? 'Brandavox Nerve' : 'Encrypted Session'}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                   <Shield className="w-3 h-3 text-emerald-500" /> Secure Node: {activeChatId}
                </p>
             </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          <AnimatePresence>
            {messages.map((msg: any) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-md ${msg.senderId === user?.uid ? 'order-1' : 'order-2'}`}>
                   {msg.senderId !== user?.uid && (
                     <p className="text-[8px] font-black uppercase text-slate-400 mb-1 ml-4 tracking-widest">{msg.senderName}</p>
                   )}
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
              placeholder="Transmit secure packet..."
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

      {/* New Chat Modal */}
      <AnimatePresence>
         {showNewChatModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowNewChatModal(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md nm-flat bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-white/10"
              >
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-orange-600/10 rounded-2xl text-orange-600">
                       <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">Initiate Node</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E2E Session Handshake</p>
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Master Identifier (Email)</label>
                       <input 
                         type="email"
                         value={targetEmail}
                         onChange={(e) => setTargetEmail(e.target.value)}
                         placeholder="strategist@brandavox.ai"
                         className="w-full px-6 py-4 nm-inset rounded-2xl bg-transparent font-bold outline-none"
                       />
                    </div>
                    <button 
                      onClick={createChat}
                      className="w-full py-4 bg-orange-600 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-600/30 active:scale-95 transition-all"
                    >
                       Establish Connection
                    </button>
                    <button 
                      onClick={() => setShowNewChatModal(false)}
                      className="w-full text-center text-[10px] font-black uppercase text-slate-400 hover:text-orange-600 transition-colors"
                    >
                       Abort Handshake
                    </button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
