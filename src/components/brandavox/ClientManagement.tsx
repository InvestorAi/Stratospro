import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  Globe, 
  Mail, 
  MessageSquare, 
  Calendar,
  Sparkles,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Music2,
  TrendingUp,
  BarChart3,
  Phone,
  User,
  Plus,
  Target,
  Shield,
  Activity,
  Trash2,
  X,
  Loader2,
  Bell,
  Eye,
  AlertCircle,
  Wand2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import Markdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  db, 
  auth, 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc,
  OperationType,
  handleFirestoreError
} from "../../lib/firebase";

interface SocialAccount {
  id?: string;
  clientId: string;
  platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'youtube';
  username: string;
  followerCount: number;
  accessToken: string;
  status: 'connected' | 'expired';
}

interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  budget: number;
  startDate: string;
  endDate?: string;
  createdAt: any;
}

interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  remindDaysBefore?: number;
  notificationSent?: boolean;
  createdAt: any;
}

interface Client {
  id: string;
  agencyId: string;
  name: string;
  companyName: string;
  website: string;
  email: string;
  phone: string;
  contactPerson: string;
  status: 'active' | 'onboarding' | 'paused';
  healthScore: number;
  revenue: number;
  socialAccounts?: SocialAccount[];
  performanceData?: { date: string; reached: number; engagement: number }[];
  createdAt: any;
}

const platformIcons = {
  twitter: <Twitter className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  tiktok: <Music2 className="w-4 h-4" />,
};

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'social' | 'performance' | 'projects'>('overview');
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardStep, setOnboardStep] = useState(1);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [recoverySuggestions, setRecoverySuggestions] = useState<string | null>(null);
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [aiStrategy, setAiStrategy] = useState<string | null>(null);

  const generateAIStrategy = async () => {
    if (!activeClient) return;
    setGeneratingStrategy(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Develop a high-performance content strategy for "${activeClient.name}". 
        Industry context: ${activeClient.companyName || 'Brand Excellence'}.
        Website focus: ${activeClient.website || 'Global Reach'}.
        
        Provide a concise strategic overview including:
        - Content Pillars
        - Target Audience Aesthetic (e.g. minimalist, brutalist, high-fidelity)
        - Priority Social Platforms
        - 3 Viral content hook patterns.
        
        Use high-performance, agency-forward terminology (Neural Engine, Aesthetic Extraction, Matrix Propagation).
        Return purely as Markdown.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      setAiStrategy(result.text || "Strategic synthesis failed.");
    } catch (error) {
       console.error(error);
       setAiStrategy("AI Node Offline.");
    } finally {
      setGeneratingStrategy(false);
    }
  };

  const generateRecoverySuggestions = async () => {
    if (!activeClient) return;
    setGeneratingSuggestions(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a high-level Strategic Brand Consultant for the Brandavox agency. 
        One of our clients, "${activeClient.name}" (${activeClient.companyName || 'No company info'}), has a declining health score of ${activeClient.healthScore}%. 
        Current Status: ${activeClient.status}.
        Active Projects: ${projects.length} campaign(s).
        
        Provide a concise, mission-critical recovery plan or outreach strategy to stabilize this relationship and improve their health score. 
        Include:
        1. 3 Immediate Tactical Actions (Outreach or Project management)
        2. 1 Strategic pivot suggestion.
        3. A professional but urgent email snippet for outreach.
        
        Keep the tone technical, high-performance, and agency-forward (using terms like 'Neural Sync', 'Matrix Alignment', 'Campaign Propagation' where appropriate).
        Format the response in Markdown.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      setRecoverySuggestions(result.text || "Systems fail to synthesize guidance. Manual intervention required.");
    } catch (error) {
      console.error("AI Error:", error);
      setRecoverySuggestions("Neural link interrupted. Strategic synthesis offline.");
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    description: "",
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending' as const,
    assignedTo: "",
    remindDaysBefore: 3
  });
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  const [clientForm, setClientForm] = useState({
    name: "",
    companyName: "",
    website: "",
    email: "",
    phone: "",
    contactPerson: "",
    status: "onboarding" as const,
  });

  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    status: "active" as Project['status'],
    budget: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const clientsQuery = query(
      collection(db, "clients"),
      where("agencyId", "==", auth.currentUser.uid)
    );

    const unsubClients = onSnapshot(clientsQuery, (snapshot) => {
      const clientData: Client[] = [];
      snapshot.forEach((doc) => {
        clientData.push({ id: doc.id, ...doc.data() } as Client);
      });
      setClients(clientData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "clients");
    });

    return () => unsubClients();
  }, []);

  useEffect(() => {
    if (!activeClient) {
      setProjects([]);
      return;
    }

    const projectsQuery = query(
      collection(db, "projects"),
      where("clientId", "==", activeClient.id)
    );

    const unsubProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectData: Project[] = [];
      snapshot.forEach((doc) => {
        projectData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projectData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "projects");
    });

    return () => unsubProjects();
  }, [activeClient]);

  useEffect(() => {
    if (!selectedProject) {
      setMilestones([]);
      return;
    }

    setLoadingMilestones(true);
    const milestonesQuery = query(
      collection(db, "projects", selectedProject.id, "milestones")
    );

    const unsubMilestones = onSnapshot(milestonesQuery, (snapshot) => {
      const milestoneData: Milestone[] = [];
      snapshot.forEach((doc) => {
        milestoneData.push({ id: doc.id, ...doc.data() } as Milestone);
      });
      // Sort by due date
      milestoneData.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      setMilestones(milestoneData);
      setLoadingMilestones(false);
      
      // Trigger reminders
      checkMilestoneReminders(milestoneData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `projects/${selectedProject.id}/milestones`);
      setLoadingMilestones(false);
    });

    return () => unsubMilestones();
  }, [selectedProject]);

  const checkMilestoneReminders = async (milestoneList: Milestone[]) => {
    if (!auth.currentUser || !selectedProject) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize today

    const remindersToTrigger = milestoneList.filter(milestone => {
      if (milestone.status === 'completed' || milestone.notificationSent) return false;
      
      const dueDate = new Date(milestone.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const threshold = milestone.remindDaysBefore || 3;
      return diffDays <= threshold && diffDays >= 0;
    });

    for (const milestone of remindersToTrigger) {
      try {
        const dueDate = new Date(milestone.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Create notification
        await addDoc(collection(db, "notifications"), {
          userId: auth.currentUser.uid,
          title: `Milestone Reminder: ${milestone.title}`,
          description: `Mission "${selectedProject.title}" waypoint "${milestone.title}" is due in ${diffDays} cycles. Assigned to: ${milestone.assignedTo || 'Neural Core'}.`,
          severity: 'warning',
          category: 'campaign',
          read: false,
          createdAt: serverTimestamp()
        });

        // Mark milestone as notified
        await updateDoc(doc(db, "projects", milestone.projectId, "milestones", milestone.id), {
          notificationSent: true
        });
      } catch (error) {
        console.error("Error triggering reminder:", error);
      }
    }
  };

  useEffect(() => {
    if (!activeClient) {
      setSocialAccounts([]);
      return;
    }

    const socialQuery = query(
      collection(db, "social_accounts"),
      where("clientId", "==", activeClient.id)
    );

    const unsubSocial = onSnapshot(socialQuery, (snapshot) => {
      const socialData: SocialAccount[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        socialData.push({ 
          id: doc.id, 
          ...data,
          // Handle field name variations between blueprint and local UI if needed
          followerCount: data.followers || 0 
        } as SocialAccount);
      });
      setSocialAccounts(socialData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "social_accounts");
    });

    return () => unsubSocial();
  }, [activeClient]);

  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      // Security check: only allow messages from our own origin
      if (typeof event.origin === 'string' && !event.origin.endsWith('.run.app') && !event.origin.includes('localhost')) {
         return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && activeClient && auth.currentUser) {
        const { platform, token, username, followers } = event.data;
        
        try {
          // Check if already exists then update, or add new
          const existing = socialAccounts.find(acc => acc.platform === platform);
          
          const accountData: any = {
            clientId: activeClient.id,
            agencyId: auth.currentUser.uid,
            platform,
            username,
            accessToken: token,
            status: 'connected',
            followers: followers || 0,
            updatedAt: serverTimestamp()
          };

          if (existing?.id) {
            await updateDoc(doc(db, "social_accounts", existing.id), accountData);
          } else {
            await addDoc(collection(db, "social_accounts"), accountData);
          }
          
          setConnectingPlatform(null);
        } catch (error) {
          console.error("Error saving social node:", error);
          setConnectingPlatform(null);
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [activeClient, socialAccounts]);

  const connectSocialNode = async (platform: string) => {
    if (!activeClient) return;
    setConnectingPlatform(platform);
    
    try {
      const response = await fetch(`/api/auth/url?platform=${platform}`);
      if (!response.ok) throw new Error('System error retrieving OAuth gateway');
      const { url } = await response.json();

      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        url,
        `brandavox_${platform}_auth`,
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
      );
    } catch (error) {
      console.error(error);
      setConnectingPlatform(null);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      const newClient = {
        ...clientForm,
        agencyId: auth.currentUser.uid,
        healthScore: 100,
        revenue: 0,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "clients"), newClient);
      setShowOnboardModal(false);
      setOnboardStep(1);
      setClientForm({
        name: "",
        companyName: "",
        website: "",
        email: "",
        phone: "",
        contactPerson: "",
        status: "onboarding",
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "clients");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient) return;

    try {
      const newProject = {
        ...projectForm,
        clientId: activeClient.id,
        agencyId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "projects"), newProject);
      setShowProjectModal(false);
      setIsEditingProject(false);
      setProjectForm({
        title: "",
        description: "",
        status: "active",
        budget: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "projects");
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      const updatedProject = {
        ...projectForm,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(db, "projects", selectedProject.id), updatedProject);
      setShowProjectModal(false);
      setIsEditingProject(false);
      setSelectedProject({ ...selectedProject, ...projectForm });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${selectedProject.id}`);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await deleteDoc(doc(db, "clients", id));
      if (activeClient?.id === id) setActiveClient(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clients/${id}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Terminate this mission? Data will be purged from the matrix.")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      const newMilestone = {
        ...milestoneForm,
        projectId: selectedProject.id,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "projects", selectedProject.id, "milestones"), newMilestone);
      setShowMilestoneForm(false);
      setMilestoneForm({
        title: "",
        description: "",
        dueDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        assignedTo: "",
        remindDaysBefore: 3
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `projects/${selectedProject.id}/milestones`);
    }
  };

  const handleUpdateMilestoneStatus = async (id: string, newStatus: Milestone['status']) => {
    if (!selectedProject) return;
    try {
      await updateDoc(doc(db, "projects", selectedProject.id, "milestones", id), {
        status: newStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${selectedProject.id}/milestones/${id}`);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!selectedProject || !confirm("Delete this milestone?")) return;
    try {
      await deleteDoc(doc(db, "projects", selectedProject.id, "milestones", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${selectedProject.id}/milestones/${id}`);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">
            {activeClient ? "Brand Intelligence" : "Client Empire"}
          </h2>
          <p className="text-slate-500 font-bold">
            {activeClient ? `Managing mission parameters for ${activeClient.name}` : "Manage high-value brands, onboarding pipelines, and client health."}
          </p>
        </div>
        <div className="flex gap-4">
          {activeClient && (
            <button 
              onClick={() => setActiveClient(null)}
              className="flex items-center gap-2 px-8 py-4 nm-button rounded-2xl font-black transition-all hover:scale-105"
            >
              <Users className="w-5 h-5" /> Back to Matrix
            </button>
          )}
          <button 
            onClick={() => setShowOnboardModal(true)}
            className="flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-2xl font-black transition-all hover:scale-105 shadow-xl shadow-orange-600/20"
          >
            <UserPlus className="w-5 h-5" /> Onboard New Client
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!activeClient ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="nm-inset p-4 rounded-2xl bg-white dark:bg-slate-900 flex items-center gap-3 w-full max-w-md">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  placeholder="Filter brands by name or domain..." 
                  className="bg-transparent border-none focus:ring-0 text-xs font-bold w-full" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 nm-flat p-2 rounded-2xl">
                <span className="text-[10px] font-black uppercase text-slate-400 px-4">System Node Status:</span>
                <div className="flex gap-1 h-2">
                  {clients.map((c, i) => (
                    <div key={i} className={cn("w-1 h-full rounded-full", c.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500')} />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredClients.map(client => (
                <motion.button 
                  key={client.id}
                  layoutId={`client-${client.id}`}
                  onClick={() => {
                    setActiveClient(client);
                    setActiveTab('overview');
                    setRecoverySuggestions(null);
                    setAiStrategy(null);
                  }}
                  className="w-full text-left nm-flat p-8 rounded-[3.5rem] flex flex-col gap-6 transition-all hover:scale-[1.02] border border-transparent hover:border-orange-500/10 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-20 h-20 nm-inset rounded-[2rem] flex items-center justify-center text-3xl font-black text-orange-600 bg-white dark:bg-slate-900 group-hover:nm-flat transition-all">
                      {client.name.charAt(0)}
                    </div>
                    <div className={cn(
                      "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      client.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      client.status === 'paused' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    )}>
                      {client.status}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-2xl font-black uppercase tracking-tight">{client.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{client.companyName || client.website}</p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-slate-300 uppercase">Health Score</p>
                      <p className="font-black text-emerald-500">{client.healthScore}%</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-slate-300 uppercase">MRR Growth</p>
                      <p className="font-black text-slate-950 dark:text-white">${client.revenue?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <button className="w-full py-4 nm-button rounded-2xl text-[10px] font-black uppercase tracking-widest text-orange-600 transition-all group-hover:bg-orange-600 group-hover:text-white">
                    Enter Node Intelligence
                  </button>
                </motion.button>
              ))}
              
              {filteredClients.length === 0 && (
                <div className="col-span-full p-20 text-center nm-inset rounded-[4rem] space-y-6">
                  <div className="w-24 h-24 nm-flat rounded-full mx-auto flex items-center justify-center text-slate-200">
                    <Search className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Search Result Void</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No brand identities found matching "{searchTerm}" in the current matrix.</p>
                  </div>
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="px-8 py-3 nm-button rounded-xl text-[10px] font-black uppercase text-orange-600"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Header Profile */}
            <div className="nm-flat p-10 rounded-[3.5rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Briefcase className="w-48 h-48" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    <div className="flex items-center gap-8">
                      <div className="w-24 h-24 nm-inset rounded-[2rem] flex items-center justify-center text-4xl font-black text-orange-600 bg-white dark:bg-slate-900 shadow-inner">
                        {activeClient.name.charAt(0)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">{activeClient.name}</h3>
                          <span className={cn(
                            "px-4 py-1 rounded-full text-[10px] font-black uppercase",
                            activeClient.status === 'active' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                          )}>
                            {activeClient.status}
                          </span>
                          <button 
                            onClick={() => setActiveTab('projects')}
                            className="px-4 py-1 nm-button rounded-full text-[9px] font-black uppercase text-indigo-600 hover:text-orange-600 transition-colors flex items-center gap-2 ml-2"
                          >
                            <Briefcase className="w-3 h-3" /> View Projects
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-6">
                          {activeClient.website && (
                            <a href={`https://${activeClient.website}`} target="_blank" className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-orange-600 transition-colors">
                              <Globe className="w-4 h-4" /> {activeClient.website}
                            </a>
                          )}
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Mail className="w-4 h-4" /> {activeClient.email}
                          </span>
                          {activeClient.phone && (
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Phone className="w-4 h-4" /> {activeClient.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button className="p-4 nm-button rounded-2xl text-slate-400 hover:text-orange-600 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button className="p-4 nm-button rounded-2xl text-slate-400 hover:text-red-500 transition-colors" onClick={() => handleDeleteClient(activeClient.id)}>
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button className="p-4 nm-button rounded-2xl text-slate-400 hover:text-orange-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-slate-100 dark:border-white/5 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Score</p>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-emerald-500">{activeClient.healthScore}%</span>
                        <div className="flex-1 h-2 nm-inset rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-1000" 
                            style={{ width: `${activeClient.healthScore}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Identity</p>
                      <h4 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-orange-600" />
                        {activeClient.contactPerson || "No generic human linked"}
                      </h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Status</p>
                      <h4 className="text-3xl font-black text-slate-950 dark:text-white">${(activeClient.revenue || 0).toLocaleString()}<span className="text-lg text-slate-400">/mo</span></h4>
                    </div>
                  </div>
                </div>

            {/* Local Navigation */}
            <div className="overflow-x-auto scrollbar-none">
              <div className="flex gap-4 p-2">
                 {[
                   { id: 'overview', label: 'Strategy Overview', icon: Sparkles },
                   { id: 'projects', label: 'Campaign Matrix', icon: Briefcase },
                   { id: 'social', label: 'Linked Accounts', icon: Globe },
                   { id: 'performance', label: 'Social Vitality', icon: TrendingUp },
                 ].map(tab => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={cn(
                       "px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                       activeTab === tab.id ? "bg-orange-600 text-white shadow-xl shadow-orange-600/30" : "nm-flat text-slate-400 hover:text-slate-600 shadow-sm"
                     )}
                   >
                     <tab.icon className="w-4 h-4" />
                     {tab.label}
                   </button>
                 ))}
              </div>
            </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                   {activeTab === 'overview' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                        {activeClient.healthScore < 70 && (
                          <div className="md:col-span-2 nm-flat p-8 rounded-[3rem] border border-rose-500/20 bg-rose-50/30 dark:bg-rose-900/10 space-y-6">
                            <div className="flex justify-between items-center">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 nm-inset rounded-xl flex items-center justify-center text-rose-600 bg-white dark:bg-slate-900">
                                     <AlertCircle className="w-5 h-5" />
                                  </div>
                                  <div>
                                     <h4 className="font-black uppercase text-sm tracking-tight text-rose-600">Neural Recovery Autoresponder</h4>
                                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Health score critical: Under 70% threshold</p>
                                  </div>
                               </div>
                               <button 
                                onClick={generateRecoverySuggestions}
                                disabled={generatingSuggestions}
                                className="px-6 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                               >
                                {generatingSuggestions ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Wand2 className="w-3 h-3" />
                                )}
                                Synthesize Guidance
                               </button>
                            </div>

                            {recoverySuggestions && (
                              <div className="p-8 nm-inset bg-white dark:bg-black/40 rounded-[2rem] text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed markdown-body">
                                <Markdown>{recoverySuggestions}</Markdown>
                              </div>
                            )}

                            {!recoverySuggestions && !generatingSuggestions && (
                              <div className="py-6 text-center nm-inset bg-white/50 rounded-2xl opacity-60">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Initiate synthesis for automated strategic interventions</p>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="nm-flat p-8 rounded-[3rem] space-y-6">
                           <div className="flex justify-between items-center">
                              <h4 className="font-black uppercase text-sm tracking-tight">AI Content Strategy</h4>
                              <button 
                                onClick={generateAIStrategy}
                                disabled={generatingStrategy}
                                className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                              >
                                {generatingStrategy && <Loader2 className="w-3 h-3 animate-spin" />}
                                {aiStrategy ? 'Regenerate' : 'Synthesize Strategy'}
                              </button>
                           </div>
                           <div className="p-6 nm-inset bg-slate-50 dark:bg-black/20 rounded-2xl space-y-4">
                              {aiStrategy ? (
                                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 markdown-body leading-relaxed">
                                  <Markdown>{aiStrategy}</Markdown>
                                </div>
                              ) : generatingStrategy ? (
                                <div className="py-10 flex flex-col items-center justify-center gap-4 text-slate-400">
                                   <Sparkles className="w-8 h-8 animate-pulse text-orange-500" />
                                   <p className="text-[10px] font-black uppercase tracking-widest">Extracting Brand Identity...</p>
                                </div>
                              ) : (
                                <>
                                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 italic">
                                    "{activeClient.name.includes('Tech') ? 'Focus on high-fidelity visual storytelling with a minimalist Gen-Z aesthetic.' : 'Build a community around sustainable luxury with technical transparency.'} Priority platforms: TikTok & Instagram Reels."
                                  </p>
                                  <ul className="space-y-2">
                                    {['Emotional Connection', 'Tech-Forward Branding', 'Viral Hook Patterns'].map((tag, i) => (
                                      <li key={i} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                                        <Sparkles className="w-3 h-3 text-orange-500" /> {tag}
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}
                           </div>
                        </div>

                        <div className="nm-flat p-8 rounded-[3rem] space-y-6">
                           <div className="flex justify-between items-center">
                              <h4 className="font-black uppercase text-sm tracking-tight">Active Projects</h4>
                              <button 
                                onClick={() => setActiveTab('projects')}
                                className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline"
                              >
                                View Full Matrix
                              </button>
                           </div>
                           <div className="space-y-4">
                              {projects.slice(0, 3).map((project, i) => (
                                <div key={i} className="flex items-center justify-between p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900 border border-slate-50 dark:border-white/5">
                                   <div className="space-y-0.5">
                                      <p className="text-[10px] font-black uppercase tracking-tight line-clamp-1">{project.title}</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">${project.budget.toLocaleString()} • {project.status}</p>
                                   </div>
                                   <button 
                                     onClick={() => {
                                      setSelectedProject(project);
                                      setActiveTab('projects');
                                     }}
                                     className="p-2 nm-button rounded-lg text-orange-600"
                                   >
                                      <Eye className="w-4 h-4" />
                                   </button>
                                </div>
                              ))}
                              {projects.length === 0 && (
                                <p className="text-[10px] font-black text-slate-400 uppercase italic text-center py-4">No active missions in matrix</p>
                              )}
                              {projects.length > 3 && (
                                <p className="text-[9px] font-black text-slate-400 uppercase text-center">+ {projects.length - 3} additional projects</p>
                              )}
                           </div>
                        </div>

                        <div className="nm-flat p-8 rounded-[3rem] space-y-6">
                           <div className="flex justify-between items-center">
                              <h4 className="font-black uppercase text-sm tracking-tight">Onboarding Timeline</h4>
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Deploying</span>
                           </div>
                           <div className="space-y-4">
                              {[
                                { title: 'Identity Extraction', status: 'complete' },
                                { title: 'Neural Matrix Sync', status: 'complete' },
                                { title: 'Strategy Synthesis', status: 'active' },
                                { title: 'Launch Propagation', status: 'pending' },
                              ].map((step, i) => (
                                <div key={i} className="flex items-center gap-4">
                                   <div className={cn(
                                     "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                                     step.status === 'complete' ? "bg-emerald-500 border-emerald-500 text-white" : 
                                     step.status === 'active' ? "border-orange-500 text-orange-500" : "border-slate-200"
                                   )}>
                                      {step.status === 'complete' && <CheckCircle2 className="w-2.5 h-2.5" />}
                                   </div>
                                   <span className={cn(
                                     "text-[10px] font-black uppercase",
                                     step.status === 'pending' ? "text-slate-300" : "text-slate-700 dark:text-slate-300"
                                   )}>{step.title}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   )}

                   {activeTab === 'projects' && (
                     <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center">
                           <h4 className="text-xl font-black uppercase tracking-tighter">Campaign Matrix</h4>
                           <button 
                             onClick={() => setShowProjectModal(true)}
                             className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                           >
                             <Plus className="w-4 h-4" /> Initiate Project
                           </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {projects.map(project => (
                             <div key={project.id} className="nm-flat p-8 rounded-[2.5rem] space-y-4 group relative">
                                <div className="flex justify-between items-start">
                                   <div className="space-y-1">
                                      <h5 className="text-lg font-black uppercase leading-none">{project.title}</h5>
                                      <div className="flex items-center gap-3 mt-1">
                                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                           <Calendar className="w-3 h-3" /> {project.startDate}
                                         </p>
                                         {project.endDate && (
                                           <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                                             <Clock className="w-3 h-3" /> Due: {project.endDate}
                                           </p>
                                         )}
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                     <span className={cn(
                                       "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border flex items-center gap-1.5",
                                       project.status === 'active' ? "bg-emerald-100 text-emerald-600 border-emerald-200" : 
                                       project.status === 'completed' ? "bg-indigo-100 text-indigo-600 border-indigo-200" : 
                                       project.status === 'cancelled' ? "bg-rose-100 text-rose-600 border-rose-200" : "bg-amber-100 text-amber-600 border-amber-200"
                                     )}>
                                       {project.status === 'active' && <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />}
                                       {project.status}
                                     </span>
                                     <button 
                                       onClick={() => handleDeleteProject(project.id)}
                                       className="p-2 nm-inset rounded-lg text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                     >
                                       <Trash2 className="w-3 h-3" />
                                     </button>
                                   </div>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{project.description}</p>
                                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                                   <div className="space-y-0.5">
                                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Allocated Budget</p>
                                      <p className="font-black text-slate-950 dark:text-white">${project.budget.toLocaleString()}</p>
                                   </div>
                                   <button 
                                     onClick={() => setSelectedProject(project)}
                                     className="text-[9px] font-black uppercase text-orange-600 hover:underline"
                                   >
                                     View Intel
                                   </button>
                                </div>
                             </div>
                           ))}
                           {projects.length === 0 && (
                             <div className="md:col-span-2 p-20 nm-inset rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                <Briefcase className="w-12 h-12" />
                                <div className="space-y-1">
                                   <p className="font-black uppercase tracking-tight">Zero Project footprint</p>
                                   <p className="text-[10px] font-bold uppercase tracking-widest">Initiate a new campaign to begin tracking delivery cycles.</p>
                                </div>
                             </div>
                           )}
                        </div>
                     </div>
                   )}

                   {activeTab === 'social' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                        {socialAccounts.map((acc, i) => (
                          <div key={i} className="nm-flat p-8 rounded-[2.5rem] space-y-4 group">
                             <div className="flex justify-between items-start">
                                <div className={cn(
                                  "p-4 rounded-2xl text-white",
                                  acc.platform === 'twitter' ? 'bg-sky-400' : 
                                  acc.platform === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 
                                  acc.platform === 'linkedin' ? 'bg-indigo-700' : 
                                  acc.platform === 'tiktok' ? 'bg-black' : 'bg-blue-600'
                                )}>
                                   {platformIcons[acc.platform as keyof typeof platformIcons]}
                                </div>
                                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                                   <MoreVertical className="w-4 h-4" />
                                </button>
                             </div>
                             <div>
                                <h4 className="text-xl font-black uppercase leading-none">{acc.username}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{acc.followerCount.toLocaleString()} Followers</p>
                             </div>
                             <div className="pt-4 flex justify-between items-center">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                  acc.status === 'connected' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                                )}>
                                   {acc.status === 'connected' ? 'Connected' : 'Expired'}
                                </span>
                                <button className="text-[9px] font-black uppercase text-indigo-600 hover:underline">Manage Node</button>
                             </div>
                          </div>
                        ))}
                        
                        {/* Platform Connection Map */}
                        {['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok'].filter(p => !socialAccounts.find(a => a.platform === p)).map(p => (
                          <button 
                            key={p}
                            onClick={() => connectSocialNode(p)}
                            disabled={connectingPlatform === p}
                            className="nm-flat p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-3 hover:border-orange-500/30 transition-all opacity-60 hover:opacity-100 group"
                          >
                             <div className={cn(
                               "w-12 h-12 rounded-full nm-inset flex items-center justify-center transition-colors shadow-inner",
                               connectingPlatform === p ? "text-orange-600 animate-spin" : "text-slate-300 group-hover:text-orange-600"
                             )}>
                                {connectingPlatform === p ? <Loader2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">Sync {p}</p>
                                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Protocol V4.2</p>
                             </div>
                          </button>
                        ))}
                     </div>
                   )}

                   {activeTab === 'performance' && (
                     <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="nm-flat p-10 rounded-[3.5rem] space-y-8">
                           <div className="flex justify-between items-center">
                              <div className="space-y-1">
                                 <h4 className="text-2xl font-black uppercase tracking-tight">Neural Vitality Scan</h4>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Aggregate reach vs synthetic engagement</p>
                              </div>
                              <div className="flex gap-4">
                                 <div className="nm-inset px-6 py-3 rounded-2xl text-[10px] font-black uppercase text-emerald-500">
                                    +12.4% vs prev week
                                 </div>
                              </div>
                           </div>
                           
                           <div className="h-[300px] w-full mt-4">
                              {(activeClient.performanceData || []).length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={activeClient.performanceData}>
                                    <defs>
                                      <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                      </linearGradient>
                                      <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.1} />
                                    <XAxis 
                                      dataKey="date" 
                                      axisLine={false} 
                                      tickLine={false} 
                                      tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                                    />
                                    <YAxis hide />
                                    <Tooltip 
                                      contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        borderRadius: '16px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontSize: '10px',
                                        fontWeight: 900,
                                        textTransform: 'uppercase'
                                      }} 
                                    />
                                    <Area 
                                      type="monotone" 
                                      dataKey="reached" 
                                      stroke="#f97316" 
                                      strokeWidth={4}
                                      fillOpacity={1} 
                                      fill="url(#colorReach)" 
                                    />
                                    <Area 
                                      type="monotone" 
                                      dataKey="engagement" 
                                      stroke="#6366f1" 
                                      strokeWidth={4}
                                      fillOpacity={1} 
                                      fill="url(#colorEng)" 
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="h-full flex items-center justify-center text-slate-300 font-black uppercase text-xs tracking-widest italic">
                                   Synthesizing initial data matrix...
                                </div>
                              )}
                           </div>
                           
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                              {[
                                { label: 'Peak Reach', val: (activeClient.performanceData || []).length > 0 ? '8.1k' : '0', icon: TrendingUp },
                                { label: 'Avg Engagement', val: (activeClient.performanceData || []).length > 0 ? '4.2k' : '0', icon: BarChart3 },
                                { label: 'Active Nodes', val: (activeClient.socialAccounts || []).length.toString(), icon: Globe },
                                { label: 'Viral Probable', val: 'Low', icon: Sparkles },
                              ].map((stat, i) => (
                                <div key={i} className="nm-inset p-5 rounded-2xl flex flex-col gap-1">
                                   <stat.icon className="w-4 h-4 text-orange-600 mb-2" />
                                   <span className="text-[8px] font-black text-slate-400 uppercase leading-none">{stat.label}</span>
                                   <span className="text-xl font-black text-slate-950 dark:text-white leading-none">{stat.val}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboardModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowOnboardModal(false);
                setOnboardStep(1);
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="nm-flat bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-10 relative z-10 overflow-y-auto max-h-[90vh] scrollbar-none"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Client Onboarding</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(step => (
                      <div 
                        key={step} 
                        className={cn(
                          "h-1 rounded-full transition-all duration-500",
                          onboardStep === step ? "w-8 bg-orange-600" : "w-4 bg-slate-200 dark:bg-slate-700"
                        )} 
                      />
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowOnboardModal(false);
                    setOnboardStep(1);
                  }} 
                  className="p-3 nm-inset rounded-xl hover:text-orange-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                if (onboardStep < 3) {
                  e.preventDefault();
                  setOnboardStep(onboardStep + 1);
                } else {
                  handleCreateClient(e);
                }
              }} className="space-y-8">
                {onboardStep === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <div className="md:col-span-2">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Step 01: Core Identity Extraction</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Brand Name</label>
                      <input 
                        required
                        value={clientForm.name}
                        onChange={e => setClientForm({...clientForm, name: e.target.value})}
                        className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="e.g. Nike Alpha"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Legal Entity</label>
                      <input 
                        value={clientForm.companyName}
                        onChange={e => setClientForm({...clientForm, companyName: e.target.value})}
                        className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="e.g. Nike, Inc."
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Human Liaison (Primary Contact)</label>
                      <input 
                        required
                        value={clientForm.contactPerson}
                        onChange={e => setClientForm({...clientForm, contactPerson: e.target.value})}
                        className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="John Doe"
                      />
                    </div>
                  </motion.div>
                )}

                {onboardStep === 2 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <div className="md:col-span-2">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Step 02: Digital Connectivity</p>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Digital HQ (Website)</label>
                      <input 
                        required
                        value={clientForm.website}
                        onChange={e => setClientForm({...clientForm, website: e.target.value})}
                        className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="nike.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Primary Intel Email</label>
                      <input 
                        required
                        type="email"
                        value={clientForm.email}
                        onChange={e => setClientForm({...clientForm, email: e.target.value})}
                        className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="contact@brand.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Comms Line (Phone)</label>
                      <input 
                        value={clientForm.phone}
                        onChange={e => setClientForm({...clientForm, phone: e.target.value})}
                        className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </motion.div>
                )}

                {onboardStep === 3 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Step 03: Protocol Finalization</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Initial System Status</label>
                      <select 
                        value={clientForm.status}
                        onChange={e => setClientForm({...clientForm, status: e.target.value as any})}
                        className="w-full nm-inset p-4 rounded-2xl font-bold bg-white dark:bg-slate-900 border-none focus:ring-2 focus:ring-orange-500/20 text-sm"
                      >
                        <option value="onboarding">Onboarding</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                      </select>
                    </div>
                    
                    <div className="nm-inset p-6 rounded-[2rem] bg-slate-50 dark:bg-black/20 space-y-4">
                      <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">Deployment Summary</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Brand</p>
                          <p className="text-xs font-black uppercase">{clientForm.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Liaison</p>
                          <p className="text-xs font-black uppercase">{clientForm.contactPerson}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-4 pt-6">
                  {onboardStep > 1 && (
                    <button 
                      type="button" 
                      onClick={() => setOnboardStep(onboardStep - 1)}
                      className="flex-1 py-5 nm-button rounded-[2rem] font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
                    >
                      Step Back
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="flex-[2] py-5 bg-orange-600 text-white rounded-[2rem] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-orange-600/20"
                  >
                    {onboardStep < 3 ? "Next Sequence" : "Propagate to Matrix"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Initiation Modal */}
      <AnimatePresence>
        {showProjectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowProjectModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="nm-flat bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-10 relative z-10"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black uppercase tracking-tighter">{isEditingProject ? "Edit Mission" : "Initiate Campaign"}</h3>
                <button 
                  onClick={() => {
                    setShowProjectModal(false);
                    setIsEditingProject(false);
                  }} 
                  className="p-3 nm-inset rounded-xl hover:text-orange-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={isEditingProject ? handleUpdateProject : handleCreateProject} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Project Title</label>
                  <input 
                    required
                    value={projectForm.title}
                    onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                    className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Q3 Performance Overhaul"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Intel Roadmap (Description)</label>
                  <textarea 
                    value={projectForm.description}
                    onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                    className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none focus:ring-2 focus:ring-orange-500/20 min-h-[100px]"
                    placeholder="Strategic neural sync for market expansion..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Allocated Capital ($)</label>
                    <input 
                      type="number"
                      required
                      value={projectForm.budget}
                      onChange={e => setProjectForm({...projectForm, budget: Number(e.target.value)})}
                      className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Mission Status</label>
                    <select 
                      value={projectForm.status}
                      onChange={e => setProjectForm({...projectForm, status: e.target.value as any})}
                      className="w-full nm-inset p-4 rounded-2xl font-bold bg-white dark:bg-slate-900 border-none focus:ring-2 focus:ring-orange-500/20 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="on-hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Deployment Date</label>
                    <input 
                      type="date"
                      required
                      value={projectForm.startDate}
                      onChange={e => setProjectForm({...projectForm, startDate: e.target.value})}
                      className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Final Deadline</label>
                    <input 
                      type="date"
                      value={projectForm.endDate}
                      onChange={e => setProjectForm({...projectForm, endDate: e.target.value})}
                      className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent border-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl">
                  {isEditingProject ? "Update Mission" : "Deploy Mission"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Detail Intel View */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, x: 20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.95, opacity: 0, x: 20 }}
              className="nm-flat bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[4rem] relative z-10 overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-auto md:max-h-[85vh]"
            >
              {/* Mission Sidebar */}
              <div className="w-full md:w-80 bg-slate-50 dark:bg-black/20 p-10 flex flex-col gap-8 border-r border-slate-100 dark:border-white/5">
                <div className="space-y-4">
                  <div className="w-16 h-16 nm-inset rounded-2xl flex items-center justify-center text-orange-600 bg-white dark:bg-slate-900">
                    <Target className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mission Code</p>
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-none">{selectedProject.title}</h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="nm-inset p-6 rounded-2xl space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Shield className="w-3 h-3 text-indigo-500" /> Operational Status
                    </p>
                    <span className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                      selectedProject.status === 'active' ? "bg-emerald-100 text-emerald-600 border-emerald-200" : 
                      selectedProject.status === 'completed' ? "bg-indigo-100 text-indigo-600 border-indigo-200" : 
                      selectedProject.status === 'cancelled' ? "bg-rose-100 text-rose-600 border-rose-200" : "bg-amber-100 text-amber-600 border-amber-200"
                    )}>
                      {selectedProject.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {selectedProject.status}
                    </span>
                  </div>

                  <div className="nm-inset p-6 rounded-2xl space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-3 h-3 text-orange-500" /> Capital Allocation
                    </p>
                    <p className="text-2xl font-black text-slate-950 dark:text-white">${selectedProject.budget.toLocaleString()}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Synchronized via Ledger V1</p>
                  </div>
                </div>

                <div className="mt-auto space-y-4">
                   <button 
                    onClick={() => {
                      setProjectForm({
                        title: selectedProject.title,
                        description: selectedProject.description,
                        status: selectedProject.status,
                        budget: selectedProject.budget,
                        startDate: selectedProject.startDate,
                        endDate: selectedProject.endDate || "",
                      });
                      setIsEditingProject(true);
                      setShowProjectModal(true);
                    }}
                    className="w-full py-4 nm-button rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition-colors"
                   >
                     Edit Mission Parameters
                   </button>
                   <button 
                    onClick={() => setSelectedProject(null)}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                   >
                     Close Intelligence
                   </button>
                </div>
              </div>

              {/* Mission Content */}
              <div className="flex-1 p-10 md:p-16 overflow-y-auto scrollbar-none text-left space-y-12 bg-white dark:bg-slate-900">
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-orange-600">Mission Roadmap</h4>
                  <p className="text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    "{selectedProject.description || "No neural roadmap provided for this mission sequence."}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Temporal Telemetry</h5>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 nm-inset rounded-2xl bg-slate-50 dark:bg-black/10">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-black uppercase">Initiation Date</span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{selectedProject.startDate}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 nm-inset rounded-2xl bg-slate-50 dark:bg-black/10">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-rose-500" />
                          <span className="text-xs font-black uppercase">Mission Deadline</span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{selectedProject.endDate || "Unlimited Propagation"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mission Milestones</h5>
                      <button 
                        onClick={() => setShowMilestoneForm(true)}
                        className="p-2 nm-button rounded-lg text-orange-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-none p-1">
                      <AnimatePresence mode="popLayout">
                        {showMilestoneForm && (
                          <motion.form 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleCreateMilestone}
                            className="p-6 nm-flat rounded-3xl bg-slate-50 dark:bg-black/20 space-y-4 mb-4 border border-orange-500/20"
                          >
                            <input 
                              required
                              placeholder="Milestone Title"
                              value={milestoneForm.title}
                              onChange={e => setMilestoneForm({...milestoneForm, title: e.target.value})}
                              className="w-full bg-transparent border-none focus:ring-0 text-xs font-black uppercase"
                            />
                            <textarea 
                              placeholder="Description"
                              value={milestoneForm.description}
                              onChange={e => setMilestoneForm({...milestoneForm, description: e.target.value})}
                              className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-medium"
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400 ml-2">Assigned Agent (Email/Name)</label>
                                <input 
                                  placeholder="e.g. j.doe@agency.ai"
                                  value={milestoneForm.assignedTo}
                                  onChange={e => setMilestoneForm({...milestoneForm, assignedTo: e.target.value})}
                                  className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-bold uppercase nm-inset p-2 rounded-xl"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400 ml-2">Reminder Buffer (Days)</label>
                                <input 
                                  type="number"
                                  value={milestoneForm.remindDaysBefore}
                                  onChange={e => setMilestoneForm({...milestoneForm, remindDaysBefore: Number(e.target.value)})}
                                  className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-bold uppercase nm-inset p-2 rounded-xl"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <input 
                                type="date"
                                required
                                value={milestoneForm.dueDate}
                                onChange={e => setMilestoneForm({...milestoneForm, dueDate: e.target.value})}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase"
                              />
                              <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase">Add</button>
                              <button type="button" onClick={() => setShowMilestoneForm(false)} className="text-[10px] font-black uppercase text-slate-400">Cancel</button>
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>

                      {milestones.length > 0 ? milestones.map(milestone => (
                        <div key={milestone.id} className="p-6 nm-flat rounded-[2rem] border border-slate-50 dark:border-white/5 space-y-3 group">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h6 className="text-[10px] font-black uppercase tracking-tight flex items-center gap-2">
                                {milestone.status === 'completed' ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <div className={cn(
                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                    milestone.status === 'in-progress' ? "bg-orange-500 animate-pulse" : "bg-slate-300"
                                  )} />
                                )}
                                {milestone.title}
                              </h6>
                              <div className="flex items-center gap-3">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{milestone.dueDate}</p>
                                {milestone.assignedTo && (
                                  <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                                    <User className="w-2 h-2" /> {milestone.assignedTo}
                                  </p>
                                )}
                                {milestone.notificationSent && (
                                  <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                    <Bell className="w-2 h-2" /> Notified
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <select 
                                value={milestone.status}
                                onChange={e => handleUpdateMilestoneStatus(milestone.id, e.target.value as any)}
                                className="bg-transparent border-none focus:ring-0 text-[8px] font-black uppercase text-slate-400 p-0"
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In-Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                              <button 
                                onClick={() => handleDeleteMilestone(milestone.id)}
                                className="p-1 hover:text-rose-500 text-slate-300 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          {milestone.description && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic line-clamp-2">{milestone.description}</p>
                          )}
                        </div>
                      )) : !showMilestoneForm && (
                        <div className="py-10 text-center nm-inset rounded-[2rem] opacity-40">
                           <p className="text-[10px] font-black uppercase tracking-widest">No milestones defined</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Real-time Mission Logs</h5>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded bg-orange-100 text-orange-600 uppercase tracking-widest animate-pulse">Live Tracking</span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { time: '2 hours ago', event: 'Neural matrix recalibrated for target demographic Alpha.', icon: Sparkles },
                      { time: '1 day ago', event: 'Initial content propagation phase completed with 12% boost in reach.', icon: TrendingUp },
                      { time: '3 days ago', event: 'Mission parameters successfully deployed to client node.', icon: Target },
                    ].map((log, i) => (
                      <div key={i} className="flex gap-4 p-6 nm-inset rounded-3xl bg-slate-50 dark:bg-black/5">
                        <div className="w-10 h-10 nm-flat rounded-xl shrink-0 flex items-center justify-center text-orange-600">
                          <log.icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.time}</p>
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{log.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
