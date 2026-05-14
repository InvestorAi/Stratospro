import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Globe, 
  Users, 
  BarChart3, 
  Activity, 
  X,
  Save,
  ShieldCheck,
  Briefcase,
  MapPin,
  ChevronRight,
  Upload,
  CheckCircle2,
  ImagePlus,
  Wand2,
  Sparkles,
  BrainCircuit,
  Download,
  FileText,
  RefreshCw,
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  serverTimestamp,
  orderBy,
  getDoc,
  handleFirestoreError,
  OperationType,
  db
} from "../lib/firebase";
import { auth } from "../lib/firebase";
import { BrandavoxAI } from "../lib/ai/gemini-engine";
import { jsPDF } from "jspdf";
import { cn } from "../lib/utils";

interface Brand {
  id: string;
  name: string;
  niche: string;
  status: 'active' | 'archived' | 'draft';
  reach: number;
  audience: string;
  logoUrl?: string;
  colorPalette?: string[];
  typography?: string;
  logoUsage?: string;
  strategicNotes?: string;
  ownerId: string;
  createdAt: any;
}

export default function BrandManager({ user, onBrandSelect, activeBrand }: { user: any, onBrandSelect?: (brand: Brand) => void, activeBrand?: any }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(activeBrand?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSuccessScreen, setIsSuccessScreen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  useEffect(() => {
    if (activeBrand?.id) {
      setActiveBrandId(activeBrand.id);
    }
  }, [activeBrand]);
  
  const selectBrand = (brand: Brand | null) => {
    setActiveBrandId(brand?.id || null);
    if (onBrandSelect) {
      onBrandSelect(brand as any);
    }
  };
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    niche: "",
    status: "active" as 'active' | 'archived' | 'draft',
    reach: 0,
    audience: "",
    logoUrl: "",
    colorPalette: "",
    typography: "",
    logoUsage: "",
    strategicNotes: ""
  });

  useEffect(() => {
    // Only fetch from Firestore if we have a real user (not guest)
    if (!user || user.uid === 'guest-user') {
      if (user?.uid === 'guest-user') {
        // Mock data for demo mode
        setBrands([
          {
            id: 'mock-1',
            name: 'Nexus Alpha',
            niche: 'Luxury Tech',
            status: 'active',
            reach: 250000,
            audience: 'Gen Z',
            ownerId: 'guest-user',
            createdAt: { toDate: () => new Date() }
          }
        ]);
        setLoading(false);
      }
      return;
    }

    const q = query(
      collection(db, "brands"),
      where("ownerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const brandList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Brand[];
      setBrands(brandList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "brands");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const brandData = {
        name: formData.name,
        niche: formData.niche,
        status: formData.status,
        reach: formData.reach,
        audience: formData.audience,
        logoUrl: formData.logoUrl,
        colorPalette: formData.colorPalette.split(',').map(c => c.trim()).filter(c => c.startsWith('#')),
        typography: formData.typography,
        logoUsage: formData.logoUsage,
        strategicNotes: formData.strategicNotes,
        ownerId: user.uid,
        updatedAt: serverTimestamp()
      };

      if (editingBrand) {
        await updateDoc(doc(db, "brands", editingBrand.id), brandData);
      } else {
        await addDoc(collection(db, "brands"), {
          ...brandData,
          createdAt: serverTimestamp()
        });
      }

      setIsSuccessScreen(true);
      
      const timer = setTimeout(() => {
        closeModal();
      }, 3000);
      return () => clearTimeout(timer);
    } catch (error) {
      handleFirestoreError(error, editingBrand ? OperationType.UPDATE : OperationType.CREATE, editingBrand ? `brands/${editingBrand.id}` : "brands");
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, logoUrl: base64 }));
        setLogoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to retire this brand strategy?")) return;
    try {
      await deleteDoc(doc(db, "brands", id));
      if (id === activeBrandId) {
        selectBrand(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `brands/${id}`);
    }
  };

  const openModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setLogoPreview(brand.logoUrl || null);
      setFormData({
        name: brand.name,
        niche: brand.niche,
        status: brand.status,
        reach: brand.reach,
        audience: brand.audience,
        logoUrl: brand.logoUrl || "",
        colorPalette: brand.colorPalette?.join(', ') || "",
        typography: brand.typography || "",
        logoUsage: brand.logoUsage || "",
        strategicNotes: brand.strategicNotes || ""
      });
    } else {
      setEditingBrand(null);
      setLogoPreview(null);
      setFormData({
        name: "",
        niche: "",
        status: "active",
        reach: 0,
        audience: "",
        logoUrl: "",
        colorPalette: "",
        typography: "",
        logoUsage: "",
        strategicNotes: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleGenerateGuidelines = async (brand: Brand) => {
    setGeneratingAI(true);
    setAiReport(null);
    try {
      const promptParts: any[] = [
        { text: `You are a Senior Strategic Brand Consultant at a world-class agency. 
        Your task is to develop a COMPREHENSIVE Brand Identity & Strategy Handbook for the following brand entity.
        
        BRAND INTEL:
        - Entity Name: ${brand.name}
        - Industry Vertical: ${brand.niche}
        - Core Target Demographic: ${brand.audience}
        - Strategic Color Spectrum: ${brand.colorPalette?.join(', ') || 'Auto-defined by vision model'}
        - Typographic Foundation: ${brand.typography || 'Agency recommended'}
        - Existing Constraints: ${brand.logoUsage || 'Greenfield project'}
        - Strategic Notes: ${brand.strategicNotes || 'N/A'}

        HANDBOOK STRUCTURE (Markdown Format):
        # 1. CORE BRAND ESSENCE
        - Mission & Vision: Define the philosophical "Why" behind the brand.
        - Strategic Positioning: Unique Value Proposition (UVP) in 2 sharp sentences.
        - Brand Archetype: Identify specify archetype (e.g. Hero, Creator, Explorer) and how it manifests.

        # 2. VISUAL PROTOCOLS
        - The Architecture of Spacing: Precise rules for logo clear space based on the letter 'X' from the logo.
        - Misuse Guard: List 5 specific UI/Print misuses to avoid (skewing, transparency violations, etc.).
        - Color Psychology: A technical deep dive into why these colors work for the ${brand.audience} and suggested HEX codes for accents.
        - Type Hierarchies: Specific pairings for H1, H2, and body copy.

        # 3. THE BRAND VOICE
        - Auditory Signature: How the brand sounds in written/spoken media.
        - Lexicon: 10 words the brand ALWAYS uses vs 10 words it NEVER uses.

        # 4. DIGITAL & SOCIAL ECOSYSTEM
        - Content Pillars: 3 main topics the brand should own.
        - Engagement Rules: How to respond to customers.

        # 5. ENTERPRISE COHESION CHECKLIST
        - A final 7-point technical checklist for launch readiness.

        TONE: Authoritative, elite, technical, and visionary. Use deep design theory and marketing psychology terms.` }
      ];

      if (brand.logoUrl && brand.logoUrl.startsWith('data:image')) {
        const mimeType = brand.logoUrl.split(';')[0].split(':')[1];
        const base64Data = brand.logoUrl.split(',')[1];
        promptParts.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
      }

      const report = await BrandavoxAI.generateContent(promptParts, "flash");
      setAiReport(report);
      
      // Optionally auto-save some of this back to the brand if it's much better
      if (brand.id !== 'mock-1' && !brand.logoUsage) {
        await updateDoc(doc(db, "brands", brand.id), {
          logoUsage: report.substring(0, 500) + '...', // Just a teaser or snippet
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("AI Guidelines Generation Error:", error);
    } finally {
      setGeneratingAI(false);
    }
  };

  const downloadGuidelines = (brand: Brand) => {
    if (!aiReport) return;
    
    const doc = new jsPDF();
    const splitTitle = doc.splitTextToSize(`${brand.name} - Official Brand Guidelines`, 180);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(splitTitle, 20, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated by Brandavox AI on ${new Date().toLocaleDateString()}`, 20, 35);
    
    const splitContent = doc.splitTextToSize(aiReport.replace(/#/g, ''), 170); // Simple markdown to text conversion
    doc.setFontSize(11);
    doc.text(splitContent, 20, 50);
    
    doc.save(`${brand.name}_Guidelines.pdf`);
  };

  const downloadMarkdown = (brand: Brand) => {
    if (!aiReport) return;
    const element = document.createElement("a");
    const file = new Blob([aiReport], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${brand.name.toLowerCase().replace(/\s+/g, '_')}_guidelines.md`;
    document.body.appendChild(element);
    element.click();
  };

  const copyToClipboard = () => {
    if (!aiReport) return;
    navigator.clipboard.writeText(aiReport);
    alert("Brand Guidelines copied to clipboard!");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setIsSuccessScreen(false);
    setLogoPreview(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4">
      {/* Platform Context */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Management
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">My Brand Empire</h1>
              <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
            </div>
            <p className="text-slate-500 font-medium">{user?.email} • Enterprise Platform</p>
            <p className="text-[10px] text-slate-300 font-mono mt-1">ID: {user?.uid.substring(0, 12)}</p>
          </div>

          <div className="w-full md:w-64 space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Quick Switcher</label>
            <div className="relative group">
              <select 
                value={activeBrandId || ""}
                onChange={(e) => {
                  const brand = brands.find(b => b.id === e.target.value);
                  selectBrand(brand || null);
                }}
                className="w-full nm-inset p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-orange-600 appearance-none bg-transparent cursor-pointer focus:outline-none"
              >
                <option value="">Select Brand...</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-orange-600 transition-colors">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="nm-flat p-6 rounded-3xl flex items-center gap-4 group hover:scale-[1.02] transition-transform">
          <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Units</p>
            <h3 className="text-2xl font-black text-slate-900">{brands.filter(b => b.status === 'active').length}</h3>
          </div>
        </div>
        
        <div className="nm-flat p-6 rounded-3xl flex items-center gap-4 group hover:scale-[1.02] transition-transform">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reach</p>
            <h3 className="text-2xl font-black text-slate-900">
              {(brands.reduce((acc, curr) => acc + (curr.reach || 0), 0) / 1000).toFixed(1)}k
            </h3>
          </div>
        </div>

        <div className="nm-flat p-6 rounded-3xl flex items-center gap-4 group hover:scale-[1.02] transition-transform">
          <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategies</p>
            <h3 className="text-2xl font-black text-slate-900">{brands.length}</h3>
          </div>
        </div>
      </div>

      {/* Brand Guidelines Quick View */}
      <AnimatePresence>
        {activeBrandId && brands.find(b => b.id === activeBrandId) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="nm-flat rounded-[2.5rem] overflow-hidden bg-slate-900 text-white border border-orange-500/20"
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 nm-inset rounded-2xl flex items-center justify-center bg-slate-800 p-2 overflow-hidden border border-white/5">
                    {brands.find(b => b.id === activeBrandId)?.logoUrl ? (
                      <img src={brands.find(b => b.id === activeBrandId)?.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Globe className="w-8 h-8 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{brands.find(b => b.id === activeBrandId)?.name} Guidelines</h2>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Active Strategic Identity</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      const brand = brands.find(b => b.id === activeBrandId);
                      if (brand) handleGenerateGuidelines(brand);
                    }}
                    disabled={generatingAI}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                      generatingAI ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-orange-600 text-white hover:scale-105 shadow-xl shadow-orange-600/30"
                    )}
                  >
                    {generatingAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {generatingAI ? "Analyzing Assets..." : "Generate AI Portfolio"}
                  </button>
                  <button onClick={() => setActiveBrandId(null)} className="p-3 nm-button rounded-2xl bg-slate-800 hover:bg-slate-700 transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              {aiReport ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="nm-inset bg-slate-800/30 p-8 rounded-[2rem] border border-white/5 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/20 rounded-xl">
                        <BrainCircuit className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500">Neural Intelligence Output</h4>
                        <p className="text-[10px] text-slate-400 font-bold">Comprehensive Brand Strategy Blueprint Generated</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={copyToClipboard}
                        className="nm-button bg-slate-800 text-slate-400 p-3 rounded-xl hover:text-white transition-colors"
                        title="Copy to Clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          const brand = brands.find(b => b.id === activeBrandId);
                          if (brand) downloadMarkdown(brand);
                        }}
                        className="nm-button bg-slate-800 text-slate-400 p-3 rounded-xl hover:text-white transition-colors"
                        title="Download as Markdown"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          const brand = brands.find(b => b.id === activeBrandId);
                          if (brand) downloadGuidelines(brand);
                        }}
                        className="nm-button bg-orange-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-orange-600/20"
                      >
                        <Download className="w-4 h-4" /> Export PDF
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-[400px] overflow-y-auto pr-4 custom-scrollbar text-slate-300 font-medium text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {aiReport}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic group-hover:text-orange-400 transition-colors cursor-default">
                      Generated by Brandavox Vision Model 3.1 • Confidence Score: 98%
                    </p>
                    <button 
                      onClick={() => setAiReport(null)}
                      className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <X className="w-3 h-3" /> Dismiss Report
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-orange-600" /> Color Palette
                  </p>
                  <div className="flex gap-2">
                    {brands.find(b => b.id === activeBrandId)?.colorPalette?.map((color, i) => (
                      <div key={i} className="group relative flex-1">
                        <div className="h-12 rounded-xl border border-white/10 shadow-lg" style={{ backgroundColor: color }} />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-xl">
                          <span className="text-[8px] font-mono font-bold">{color}</span>
                        </div>
                      </div>
                    )) || <p className="text-xs text-slate-500 italic">No colors defined</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Plus className="w-4 h-4 text-orange-600" /> Typography
                  </p>
                  <p className="text-sm font-bold text-slate-200 bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                    {brands.find(b => b.id === activeBrandId)?.typography || "No typography guidelines provided"}
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Upload className="w-4 h-4 text-orange-600" /> Logo Usage
                  </p>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed bg-slate-800/50 p-4 rounded-2xl border border-white/5 h-24 overflow-y-auto">
                    {brands.find(b => b.id === activeBrandId)?.logoUsage || "No usage protocols defined"}
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-600" /> Strategic Notes
                  </p>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed bg-slate-800/50 p-4 rounded-2xl border border-white/5 h-24 overflow-y-auto">
                    {brands.find(b => b.id === activeBrandId)?.strategicNotes || "No strategic notes defined"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Main Content Area */}
      <div className="nm-flat rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-black text-slate-900">Brand Portfolios</h2>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-orange-600/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Brand
          </button>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Syncing Data...</p>
            </div>
          ) : brands.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="nm-inset w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <Briefcase className="w-10 h-10" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active brands found</p>
              <button 
                onClick={() => openModal()}
                className="text-orange-600 font-black text-sm flex items-center gap-2 mx-auto"
              >
                Launch your first brand <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {brands.map((brand) => (
                <div 
                  key={brand.id}
                  className="nm-flat p-6 rounded-3xl flex items-center justify-between group hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 nm-inset rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-orange-600 transition-colors overflow-hidden bg-slate-50 dark:bg-black/20">
                      {brand.logoUrl ? (
                         <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-cover" />
                      ) : (
                         <Globe className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 tracking-tight">{brand.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{brand.niche || "Global Sector"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Growth Reach</p>
                      <p className="text-sm font-black text-slate-900">{(brand.reach / 1000).toFixed(1)}k</p>
                    </div>
                    
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      brand.status === 'active' ? "bg-emerald-50 text-emerald-600" :
                      brand.status === 'draft' ? "bg-amber-50 text-amber-600" :
                      "bg-slate-100 text-slate-400"
                    )}>
                      {brand.status}
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => {
                          const isCurrentlyActive = brand.id === activeBrandId;
                          selectBrand(isCurrentlyActive ? null : brand);
                        }}
                        className={cn(
                          "p-3 rounded-xl nm-button transition-all",
                          activeBrandId === brand.id ? "text-orange-600 ring-2 ring-orange-500 shadow-orange-500/20" : "text-slate-400 hover:text-orange-600"
                        )}
                        title={activeBrandId === brand.id ? "Minimize Guidelines" : "Inspect Guidelines"}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openModal(brand)}
                        className="p-3 hover:bg-white rounded-xl nm-button text-indigo-600"
                        title="Edit Strategy"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(brand.id)}
                        className="p-3 hover:bg-white rounded-xl nm-button text-rose-600"
                        title="Retire Brand"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg nm-flat p-8 rounded-[3rem] overflow-hidden border border-white/5"
            >
              <AnimatePresence mode="wait">
                {isSuccessScreen ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-12 text-center space-y-6"
                  >
                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identity Secured</h3>
                      <p className="text-slate-500 font-medium mt-2">
                        {editingBrand ? "Brand parameters updated successfully." : "New brand entity successfully registered."}
                      </p>
                    </div>
                    <button 
                      onClick={closeModal}
                      className="nm-button px-12 py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-colors"
                    >
                      Complete Protocol
                    </button>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Auto-redirecting in 3 seconds...</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                          {editingBrand ? "Update Strategy" : "Initialize Identity"}
                        </h3>
                        <p className="text-sm font-bold text-slate-400">Configure your strategic asset parameters</p>
                      </div>
                      <button onClick={closeModal} className="p-3 nm-button rounded-2xl hover:bg-slate-50 transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="flex justify-center mb-8">
                        <div className="relative group">
                          <div className="w-28 h-28 nm-inset rounded-[2rem] flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/5 hover:border-orange-500/50 transition-colors bg-slate-50/30 dark:bg-black/20 relative">
                              {logoPreview ? (
                                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                              ) : (
                                <ImagePlus className="w-10 h-10 text-slate-300 dark:text-slate-800" />
                              )}
                          </div>
                          <label className="absolute -bottom-2 -right-2 p-2.5 bg-slate-900 dark:bg-orange-600 text-white rounded-2xl shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all z-10">
                              <Upload className="w-4 h-4" />
                              <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleLogoChange} />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Brand Identity Name</label>
                        <input 
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g. Nexus Core"
                          className="w-full nm-inset p-5 rounded-3xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-600/10 placeholder:text-slate-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Sector / Niche</label>
                          <input 
                            value={formData.niche}
                            onChange={e => setFormData({...formData, niche: e.target.value})}
                            placeholder="Tech, Luxury..."
                            className="w-full nm-inset p-5 rounded-3xl font-bold text-slate-900 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Operational State</label>
                          <select 
                            value={formData.status}
                            onChange={e => setFormData({...formData, status: e.target.value as any})}
                            className="w-full nm-inset p-5 rounded-3xl font-bold text-slate-900 focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="active text-emerald-600">Active</option>
                            <option value="draft text-amber-600">Drafting</option>
                            <option value="archived text-slate-600">Archived</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Reach Metric</label>
                          <input 
                            type="number"
                            value={formData.reach}
                            onChange={e => setFormData({...formData, reach: parseInt(e.target.value) || 0})}
                            placeholder="Cumulative followers"
                            className="w-full nm-inset p-5 rounded-3xl font-bold text-slate-900 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Primary Target</label>
                          <input 
                            value={formData.audience}
                            onChange={e => setFormData({...formData, audience: e.target.value})}
                            placeholder="Gen Z, Enterprise..."
                            className="w-full nm-inset p-5 rounded-3xl font-bold text-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="nm-inset p-5 rounded-3xl space-y-4">
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4" /> Strategic Guidelines
                        </p>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Primary Color Palette (Hex, comma separated)</label>
                          <input 
                            value={formData.colorPalette}
                            onChange={e => setFormData({...formData, colorPalette: e.target.value})}
                            placeholder="#FF5500, #1A1A1A..."
                            className="w-full nm-inset p-4 rounded-2xl font-mono text-xs font-bold text-slate-900 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Typography Setup</label>
                          <input 
                            value={formData.typography}
                            onChange={e => setFormData({...formData, typography: e.target.value})}
                            placeholder="Inter (Sans), JetBrains Mono (Code)..."
                            className="w-full nm-inset p-4 rounded-2xl font-bold text-slate-900 focus:outline-none text-xs"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Logo Usage Protocols</label>
                          <textarea 
                            value={formData.logoUsage}
                            onChange={e => setFormData({...formData, logoUsage: e.target.value})}
                            placeholder="Usage guidelines, spacing, clear space..."
                            className="w-full nm-inset p-4 rounded-2xl font-medium text-slate-900 focus:outline-none text-xs h-24 resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Strategic Notes</label>
                          <textarea 
                            value={formData.strategicNotes}
                            onChange={e => setFormData({...formData, strategicNotes: e.target.value})}
                            placeholder="Market positioning, unique angles, brand story focus..."
                            className="w-full nm-inset p-4 rounded-2xl font-medium text-slate-900 focus:outline-none text-xs h-12 resize-none"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 mt-6 shadow-2xl shadow-slate-950/30 hover:bg-orange-600 transition-all active:scale-95"
                      >
                        <Save className="w-5 h-5" />
                        Save Identity Configuration
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

