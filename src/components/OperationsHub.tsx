import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import BrandLogo from "./BrandLogo";
import { 
  FileText, 
  Download, 
  Share2, 
  History, 
  CreditCard, 
  ShieldCheck, 
  Globe, 
  Printer, 
  MoreVertical, 
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Trash2,
  Banknote,
  Building,
  RefreshCw,
  Target,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BrandavoxAI } from "../lib/ai/gemini-engine";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface OperationDoc {
  id: string;
  client: string;
  type: string;
  amount: string;
  status: string;
  createdAt: any;
  items?: string;
  dueDate?: string;
  bankDetails?: string;
}

export default function OperationsHub({ user, activeBrand }: { user: any, activeBrand?: any }) {
  const [activeTab, setActiveTab] = useState('invoices');
  const [docs, setDocs] = useState<OperationDoc[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAutoresponder, setShowAutoresponder] = useState(false);
  const [autoResponse, setAutoResponse] = useState("");
  const [showDocModal, setShowDocModal] = useState(false);
  
  // Create Doc Form State
  const [docForm, setDocForm] = useState({
    client: "",
    amount: "",
    type: "Invoice",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: "",
    bankDetails: "Nexus Bank • IBAN: NX88 2000 4400 9900"
  });

  useEffect(() => {
    if (!user || user.uid === 'guest-user') {
      setDocs([
        { id: '901', client: 'Nexus Alpha', type: 'Invoice', amount: '$4,200.00', status: 'paid', createdAt: { toDate: () => new Date() } },
        { id: '902', client: 'EcoVibe Marketing', type: 'Receipt', amount: '$1,500.00', status: 'confirmed', createdAt: { toDate: () => new Date() } },
      ]);
      return;
    }

    const q = query(collection(db, "operations"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as OperationDoc[];
      setDocs(docList);
    }, (err) => handleFirestoreError(err, OperationType.LIST, "operations"));

    return () => unsubscribe();
  }, [user]);

  const generateDocument = async () => {
    if (!user || !docForm.client) return;
    setIsGenerating(true);
    try {
      const data = {
        ...docForm,
        status: docForm.type === 'Invoice' ? 'pending' : 'paid',
        ownerId: user.uid,
        brandId: activeBrand?.id || 'default',
        brandName: activeBrand?.name || 'Brandavox Global',
        createdAt: serverTimestamp()
      };

      if (user.uid !== 'guest-user') {
        await addDoc(collection(db, "operations"), data);
      } else {
        setDocs([{ id: `mock_${Date.now()}`, ...data, createdAt: { toDate: () => new Date() } }, ...docs]);
      }
      setShowDocModal(false);
      setDocForm({ 
        client: "", 
        amount: "", 
        type: "Invoice", 
        items: "", 
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bankDetails: docForm.bankDetails 
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const runAutoresponder = async (doc: OperationDoc) => {
    setIsGenerating(true);
    try {
      const prompt = `Act as a senior business operations strategist. 
        Context: 
        - Brand: ${activeBrand?.name || 'Brandavox'}
        - Niche: ${activeBrand?.niche || 'Digital Solutions'}
        - Client: ${doc.client}
        - Document: ${doc.type} (${doc.amount})
        - Current Status: ${doc.status}

        Task: 
        1. Generate 3 technical and high-impact follow-up questions for the client to ensure complete satisfaction.
        2. Draft a professional, premium-grade email reply/receipt confirmation branded with "${activeBrand?.name || 'Brandavox'}".
        3. Provide a Strategic Next Step for the relationship.

        Format: 
        - USE MARKDOWN for clarity.
        - Include sections: [FOLLOW-UP QUESTIONS], [BRANDED COMMUNICATION], [STRATEGIC ADVICE].`;
      
      const response = await BrandavoxAI.generateContent(prompt);
      setAutoResponse(typeof response === 'string' ? response : (response as any).text || "Neural logic stream failed. Retry sequence.");
      setShowAutoresponder(true);
    } catch (e) {
      console.error(e);
      setAutoResponse("Connection to Neural Brain disrupted. Please re-initiate uplink.");
      setShowAutoresponder(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm("Permanently wipe this financial record?")) return;
    try {
      if (user.uid !== 'guest-user') {
        await deleteDoc(doc(db, "operations", id));
      } else {
        setDocs(docs.filter(d => d.id !== id));
      }
    } catch (e) { console.error(e); }
  };

  const downloadAsPDF = (docData: OperationDoc) => {
    const doc = new jsPDF();
    const brandName = activeBrand?.name || "Brandavox Global";
    const brandNiche = activeBrand?.niche || "Digital Solutions";
    
    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(brandName.toUpperCase(), 20, 25);
    
    doc.setFontSize(10);
    doc.text(brandNiche.toUpperCase(), 20, 32);
    
    doc.setFontSize(30);
    doc.setTextColor(255, 255, 255, 0.1);
    doc.text(docData.type.toUpperCase(), 200, 30, { align: 'right' });
    
    // Client Info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(docData.client, 20, 62);
    
    // Date Info
    doc.setFont("helvetica", "bold");
    doc.text("DATE:", 140, 55);
    doc.setFont("helvetica", "normal");
    doc.text(docData.createdAt ? new Date(docData.createdAt.toDate?.() || docData.createdAt).toLocaleDateString() : new Date().toLocaleDateString(), 140, 62);
    
    if (docData.dueDate) {
      doc.setFont("helvetica", "bold");
      doc.text("DUE DATE:", 140, 72);
      doc.setFont("helvetica", "normal");
      doc.text(docData.dueDate, 140, 79);
    }
    
    doc.setFont("helvetica", "bold");
    doc.text("DOCUMENT ID:", 20, 72);
    doc.setFont("helvetica", "normal");
    doc.text(`#${docData.id.slice(-8).toUpperCase()}`, 20, 79);
    
    // Items Table
    const items = docData.items ? docData.items.split('\n').map(line => {
      const [desc, val] = line.split(':').map(s => s.trim());
      return [desc || "Service Description", val || docData.amount];
    }) : [["Standard Service Fee", docData.amount]];
    
    autoTable(doc, {
      startY: 95,
      head: [['Description', 'Amount']],
      body: items,
      headStyles: { fillColor: [234, 88, 12] }, // orange-600
      styles: { font: "helvetica", fontSize: 9 },
    });
    
    // Footer / Bank Details
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL VALUATION:", 140, finalY + 20);
    doc.setFontSize(16);
    doc.setTextColor(234, 88, 12);
    doc.text(docData.amount, 140, finalY + 30);
    
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT INSTRUMENT:", 20, finalY + 50);
    doc.setFont("helvetica", "normal");
    doc.text(docData.bankDetails || "Contact support for details.", 20, finalY + 55);
    
    doc.save(`${docData.type}_${docData.client.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 text-left">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Operations Hub</h2>
          <p className="text-slate-500 font-bold">Neural financial infrastructure & autonomous billing.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 nm-button rounded-xl text-slate-500 font-bold">
             <History className="w-5 h-5" /> Audit
           </button>
           <button 
             onClick={() => setShowDocModal(true)}
             className="flex items-center gap-2 px-8 py-3 nm-button rounded-xl text-orange-600 font-black hover:scale-105 transition-all"
           >
             <Plus className="w-5 h-5" /> Generate Document
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Document Generator Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="nm-flat p-8 rounded-[3rem] border border-slate-100 dark:border-white/5">
             <div className="flex flex-wrap gap-4 mb-8">
                {['invoices', 'receipts', 'reports'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab ? 'nm-inset text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {tab}
                  </button>
                ))}
             </div>

             <div className="space-y-4">
                {docs.filter(d => activeTab.includes(d.type.toLowerCase())).map((doc, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={doc.id} 
                    className="p-6 nm-inset rounded-[2rem] flex items-center justify-between group hover:border-orange-500/20 border border-transparent transition-all"
                  >
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl nm-button flex items-center justify-center text-orange-600">
                           <FileText className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <p className="font-black text-xs text-slate-900 dark:text-white uppercase truncate max-w-[150px]">#{doc.id.slice(-4)} • {doc.client}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${doc.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                 {doc.status}
                              </span>
                           </div>
                           <p className="text-lg font-black tracking-tight">{doc.amount}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             {doc.createdAt ? new Date(doc.createdAt.toDate?.() || doc.createdAt).toLocaleDateString() : '...'}
                           </p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => runAutoresponder(doc)}
                          className="p-3 nm-button rounded-xl text-orange-600 hover:scale-110 transition-transform"
                          title="Neural Follow-up"
                        >
                          <Zap className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => downloadAsPDF(doc)}
                          className="p-3 nm-button rounded-xl text-slate-400 hover:text-orange-600 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => deleteDocument(doc.id)}
                          className="p-3 nm-button rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                  </motion.div>
                ))}
             </div>
          </div>

          {/* Letterhead Preview */}
          <div className="nm-flat p-10 rounded-[3rem] bg-white dark:bg-[#1e1e24] border-4 border-slate-100 dark:border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8">
                <Globe className="w-16 h-16 text-slate-100 dark:text-white/5" />
             </div>
             <div className="space-y-12">
                <div className="flex justify-between items-start">
                   <div className="space-y-4">
                      {activeBrand ? (
                        <div className="flex items-center gap-4">
                           <div className="w-20 h-20 nm-button rounded-2xl flex items-center justify-center text-orange-600 bg-white">
                             <Target className="w-10 h-10" />
                           </div>
                           <div>
                              <h4 className="text-2xl font-black uppercase tracking-tighter">{activeBrand.name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeBrand.niche} • Corporate Division</p>
                           </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <BrandLogo size="lg" className="w-20 h-20 rounded-[2.5rem]" />
                          <h4 className="text-xl font-black uppercase tracking-tighter text-slate-400">SELECT BRAND IDENTITY</h4>
                        </div>
                      )}
                   </div>
                   <div className="text-right">
                      <h4 className="text-4xl font-black text-slate-200 dark:text-white/10 uppercase tracking-widest">OFFICIAL DOC</h4>
                   </div>
                </div>

                <div className="h-px w-full bg-slate-100 dark:bg-white/10" />

                <div className="grid grid-cols-3 gap-12">
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Operational Node</p>
                        <p className="text-sm font-bold text-slate-950 dark:text-white">{user?.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Bank Instrument</p>
                        <p className="text-xs font-mono text-slate-500">{docForm.bankDetails}</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase text-orange-600">Sync Pipeline</p>
                        <p className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                           <Calendar className="w-4 h-4" /> Due: {docForm.dueDate}
                        </p>
                      </div>
                   </div>
                   <div className="text-right space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Total Valuation</p>
                      <p className="text-4xl font-black text-orange-600 tracking-tighter">${docForm.amount || '--.--'}</p>
                   </div>
                </div>
             </div>

                <div className="pt-12 flex justify-between items-end">
                   <div className="flex gap-4">
                      <button className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">Export Letterhead</button>
                      <button className="px-8 py-4 nm-button rounded-2xl font-black text-xs uppercase text-slate-400">Settings</button>
                   </div>
                   <div className="flex items-center gap-2 font-bold text-emerald-500 animate-pulse">
                      <ShieldCheck className="w-4 h-4" /> Secure Logic Verified
                   </div>
                </div>
             </div>
          </div>


        {/* Financial Intelligence Feed */}
        <div className="space-y-8">
           <div className="nm-flat p-8 rounded-[2.5rem]">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                 <CreditCard className="w-4 h-4 text-orange-600" /> Neural Treasury
              </h3>
              <div className="space-y-4">
                 {[
                   { label: "Billed Items", count: docs.length, icon: CheckCircle2, color: 'text-emerald-500' },
                   { label: "Pending Units", count: docs.filter(d=>d.status==='pending').length, icon: Clock, color: 'text-amber-500' },
                   { label: "Security Layer", count: "AES-256", icon: ShieldCheck, color: 'text-blue-500' },
                 ].map((stat, i) => (
                   <div key={i} className="nm-inset p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <stat.icon className={`w-4 h-4 ${stat.color}`} />
                         <span className="text-xs font-bold text-slate-500">{stat.label}</span>
                      </div>
                      <span className="text-lg font-black text-slate-950 dark:text-white">{stat.count}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="nm-flat p-8 rounded-[2.5rem] bg-slate-950 text-white border border-orange-500/20">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white font-black italic">A</div>
                 <div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-white">Autoresponder</h4>
                    <p className="text-[10px] font-bold text-orange-500 italic">Financial Neural System</p>
                 </div>
              </div>
              <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic mb-8">
                {isGenerating ? "Synthesizing follow-up logic..." : "The Neural Autoresponder is standing by to generate professional sequences for your billing and documents."}
              </p>
              <button className="w-full py-4 bg-orange-600 rounded-2xl font-black text-xs uppercase text-white shadow-lg shadow-orange-600/20 hover:scale-105 transition-all">Review Hub</button>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showAutoresponder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={()=>setShowAutoresponder(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl nm-flat bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-white/10 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-4 mb-8">
                   <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-xl">
                      <Sparkles className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter">Neural Follow-up Gen</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tracking-widest">Logic Synthesized</p>
                   </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-left font-medium text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-white/5 p-8 rounded-3xl nm-inset shadow-inner">
                  <ReactMarkdown>{autoResponse}</ReactMarkdown>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                   <button className="py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Copy to Clipboard</button>
                   <button onClick={()=>setShowAutoresponder(false)} className="py-4 nm-button rounded-2xl font-black uppercase text-xs tracking-widest text-slate-500">Close Engine</button>
                </div>
             </motion.div>
          </div>
        )}

        {showDocModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={()=>setShowDocModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg nm-flat bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-white/10 text-left overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-600/5 rounded-full blur-3xl" />
                <div className="flex items-center gap-4 mb-10 relative z-10">
                   <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-xl shadow-orange-600/20">
                      <Plus className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter">Premium Doc Forge</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tracking-widest">Neural Billing Engine</p>
                   </div>
                </div>
                <div className="space-y-6 relative z-10">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Doc Type</label>
                        <select 
                          value={docForm.type}
                          onChange={e => setDocForm({...docForm, type: e.target.value})}
                          className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent focus:ring-2 focus:ring-orange-500/20 border-none transition-all"
                        >
                          <option value="Invoice">Premium Invoice</option>
                          <option value="Receipt">Official Receipt</option>
                          <option value="Report">Strategic Report</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Valuation ($)</label>
                        <input 
                          value={docForm.amount}
                          onChange={e => setDocForm({...docForm, amount: e.target.value})}
                          placeholder="e.g. 5,000.00"
                          className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none placeholder:text-slate-400"
                        />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Due Date</label>
                      <input 
                        type="date"
                        value={docForm.dueDate}
                        onChange={e => setDocForm({...docForm, dueDate: e.target.value})}
                        className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Client Identity</label>
                      <input 
                        value={docForm.client}
                        onChange={e => setDocForm({...docForm, client: e.target.value})}
                        placeholder="e.g. Nexus Global Corp"
                        className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none placeholder:text-slate-400"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Bank Instrument Details</label>
                      <input 
                        value={docForm.bankDetails}
                        onChange={e => setDocForm({...docForm, bankDetails: e.target.value})}
                        className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Itemized Breakdown</label>
                      <textarea 
                        value={docForm.items}
                        onChange={e => setDocForm({...docForm, items: e.target.value})}
                        placeholder="Detailed deliverables..."
                        className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none min-h-[80px]"
                      />
                   </div>
                   <button 
                     onClick={generateDocument}
                     disabled={isGenerating}
                     className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4 px-4"
                   >
                     {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : "Deploy Neural Document"}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
