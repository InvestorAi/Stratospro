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
  ChevronRight
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
  orderBy 
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";

interface Brand {
  id: string;
  name: string;
  niche: string;
  status: 'active' | 'archived' | 'draft';
  reach: number;
  audience: string;
  ownerId: string;
  createdAt: any;
}

export default function BrandManager({ user }: { user: any }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    niche: "",
    status: "active" as 'active' | 'archived' | 'draft',
    reach: 0,
    audience: ""
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
      console.error("Error fetching brands:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const brandData = {
        ...formData,
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

      closeModal();
    } catch (error) {
      console.error("Error saving brand:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to retire this brand strategy?")) return;
    try {
      await deleteDoc(doc(db, "brands", id));
    } catch (error) {
      console.error("Error deleting brand:", error);
    }
  };

  const openModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        niche: brand.niche,
        status: brand.status,
        reach: brand.reach,
        audience: brand.audience
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: "",
        niche: "",
        status: "active",
        reach: 0,
        audience: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
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
                    <div className="w-12 h-12 nm-inset rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-orange-600 transition-colors">
                      <Globe className="w-6 h-6" />
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

                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 mt-6 shadow-2xl shadow-slate-950/30 hover:bg-orange-600 transition-all active:scale-95"
                >
                  <Save className="w-5 h-5" />
                  Save Identity Configuration
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

