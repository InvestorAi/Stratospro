import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Users, 
  Zap, 
  ShieldCheck, 
  Server, 
  Plus, 
  Settings, 
  Search,
  Filter,
  ArrowRight,
  Database,
  Cloud,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Activity,
  ChevronRight,
  Terminal,
  Workflow,
  MousePointerClick,
  BarChart3,
  Split,
  RefreshCw,
  Clock,
  Send,
  Upload,
  FileJson,
  FileSpreadsheet,
  AlertCircle,
  Rocket,
  MessageSquare,
  Heart,
  Repeat,
  Share2,
  Twitter,
  Linkedin,
  Instagram,
  UserPlus,
  Calendar,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType, collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, deleteDoc, updateDoc, getDocs } from "../lib/firebase";
import { cn } from "../lib/utils";
import Papa from "papaparse";

interface EmailList {
  id: string;
  name: string;
  subscribers: number;
  provider: 'ses' | 'alibaba' | 'mailwizz';
  status: 'active' | 'syncing';
  triggers: string[];
}

interface Lead {
  id: string;
  email: string;
  name: string;
  status: 'verified' | 'pending' | 'blocked';
  source: string;
  joinedAt: any;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  subjectB?: string;
  bodyB?: string;
  isABTest: boolean;
  testSubject?: boolean;
  testBody?: boolean;
  status: 'draft' | 'sent' | 'archived' | 'scheduled';
  scheduledAt?: any;
  metrics: {
    opens: number;
    clicks: number;
    bounces: number;
    opensB?: number;
    clicksB?: number;
  };
  createdAt: any;
}

interface AutomatedWorkflow {
  id: string;
  name: string;
  trigger: string; // Changed from union to string to allow custom triggers
  status: 'active' | 'paused';
  steps: {
    type: 'delay' | 'email';
    delayMs?: number;
    campaignId?: string;
  }[];
  createdAt: any;
}

interface SocialPost {
  id: string;
  platform: 'twitter' | 'linkedin' | 'instagram';
  content: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt?: any;
  metrics: {
    likes: number;
    shares: number;
    comments: number;
  };
  createdAt: any;
}

interface SocialAccount {
  id: string;
  platform: 'twitter' | 'linkedin' | 'instagram';
  username: string;
  status: 'connected' | 'expired';
  followers: number;
}

function calculateSignificance(metrics: EmailCampaign['metrics']) {
  const totalA = metrics.opens || 1;
  const totalB = metrics.opensB || 1;
  const clicksA = metrics.clicks;
  const clicksB = metrics.clicksB || 0;
  
  if (totalA + totalB < 50) return { score: 0, label: "Insufficient Data", level: 'low' };
  
  const rateA = clicksA / totalA;
  const rateB = clicksB / totalB;
  const diff = Math.abs(rateA - rateB);
  
  if (diff > 0.05) return { score: 98, label: "High Confidence", level: 'high' };
  if (diff > 0.02) return { score: 85, label: "Medium Confidence", level: 'med' };
  return { score: 45, label: "Stochastic Noise", level: 'low' };
}

export default function NeuralEmailStudio({ user, activeBrand }: { user: any, activeBrand?: any }) {
  const [activeTab, setActiveTab] = useState<'leads' | 'lists' | 'workflows' | 'campaigns' | 'social' | 'infrastructure'>('leads');
  const [lists, setLists] = useState<EmailList[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [workflows, setWorkflows] = useState<AutomatedWorkflow[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [provider, setProvider] = useState<'ses' | 'alibaba'>('ses');

  // Campaign Creation State
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isABMode, setIsABMode] = useState(false);
  const [testSubject, setTestSubject] = useState(false);
  const [testBody, setTestBody] = useState(false);
  const [campName, setCampName] = useState("");
  const [subjectA, setSubjectA] = useState("");
  const [bodyA, setBodyA] = useState("");
  const [subjectB, setSubjectB] = useState("");
  const [bodyB, setBodyB] = useState("");
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);
  const [editingCampId, setEditingCampId] = useState<string | null>(null);
  
  // Verification loading state
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [isBulking, setIsBulking] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // New lead entry state
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadName, setNewLeadName] = useState("");
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid' | 'suspicious'>('idle');
  const [isAddingLead, setIsAddingLead] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) return 'idle';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return 'invalid';
    
    const suspiciousDomains = ['test.com', 'example.com', 'temp.com', 'fake.com', 'trash.com', 'mailinator.com'];
    const domain = email.split('@')[1].toLowerCase();
    if (suspiciousDomains.some(d => domain.includes(d))) return 'suspicious';
    
    return 'valid';
  };

  useEffect(() => {
    setValidationStatus(validateEmail(newLeadEmail));
  }, [newLeadEmail]);

  const addSingleLead = async () => {
    if (validationStatus === 'invalid' || !newLeadEmail) return;
    setIsAddingLead(true);
    
    const leadData = {
      email: newLeadEmail,
      name: newLeadName || 'Potential Lead',
      status: validationStatus === 'suspicious' ? 'pending' : 'verified',
      source: 'Manual Entry',
      joinedAt: new Date()
    };

    if (user && user.uid !== 'guest-user') {
      try {
        await addDoc(collection(db, "leads"), {
          ...leadData,
          ownerId: user.uid,
          joinedAt: serverTimestamp()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, "leads");
      }
    } else {
      setLeads(prev => [{ ...leadData, id: Date.now().toString() } as Lead, ...prev]);
    }

    setNewLeadEmail("");
    setNewLeadName("");
    setIsAddingLead(false);
  };

  useEffect(() => {
    if (!user || user.uid === 'guest-user') {
      setLists([
        { id: 'l1', name: 'Premium Founders', subscribers: 1240, provider: 'ses', status: 'active', triggers: ['on_signup', 'email_verified'] },
        { id: 'l2', name: 'Strategic Beta', subscribers: 85, provider: 'mailwizz', status: 'syncing', triggers: ['manual_import'] },
      ]);
      setLeads([
        { id: 'u1', email: 'alex@nexus.com', name: 'Alex Node', status: 'verified', source: 'Auth Page', joinedAt: new Date() },
        { id: 'u2', email: 'spam-bot@fake.cc', name: 'Unknown', status: 'pending', source: 'Registration', joinedAt: new Date() },
      ]);
      setCampaigns([
        { 
          id: 'c1', 
          name: 'Q3 Launch Sequence', 
          subject: 'Welcome to the Nexus', 
          body: 'Hello Founders...', 
          isABTest: true, 
          subjectB: 'Exclusive Inside look at Nexus', 
          status: 'sent', 
          metrics: { opens: 450, clicks: 120, bounces: 5 },
          createdAt: new Date() 
        }
      ]);
      setWorkflows([
        { 
          id: 'w1', 
          name: 'Alpha Onboarding', 
          trigger: 'welcome', 
          status: 'active', 
          steps: [{ type: 'email', campaignId: 'c1' }, { type: 'delay', delayMs: 86400000 }], 
          createdAt: new Date() 
        }
      ]);
      setSocialAccounts([
        { id: 'sa1', platform: 'twitter', username: '@nexus_hq', status: 'connected', followers: 12400 },
        { id: 'sa2', platform: 'linkedin', username: 'Nexus AI', status: 'connected', followers: 5800 },
      ]);
      setSocialPosts([
        { 
          id: 'sp1', 
          platform: 'twitter', 
          content: 'The future of neural communication is here. Join the Nexus.', 
          status: 'published', 
          metrics: { likes: 450, shares: 120, comments: 24 },
          createdAt: new Date() 
        }
      ]);
      return;
    }

    const qLeads = query(collection(db, "leads"), where("ownerId", "==", user.uid));
    const unsubLeads = onSnapshot(qLeads, (snapshot) => {
      setLeads(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any);
    });

    const qLists = query(collection(db, "email_lists"), where("ownerId", "==", user.uid));
    const unsubLists = onSnapshot(qLists, (snapshot) => {
      setLists(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any);
    });

    const qCampaigns = query(collection(db, "email_campaigns"), where("ownerId", "==", user.uid));
    const unsubCampaigns = onSnapshot(qCampaigns, (snapshot) => {
      setCampaigns(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any);
    });

    const qWorkflows = query(collection(db, "automated_workflows"), where("ownerId", "==", user.uid));
    const unsubWorkflows = onSnapshot(qWorkflows, (snapshot) => {
      setWorkflows(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any);
    });

    const qSocialPosts = query(collection(db, "social_posts"), where("ownerId", "==", user.uid));
    const unsubSocialPosts = onSnapshot(qSocialPosts, (snapshot) => {
      setSocialPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any);
    });

    const qSocialAccounts = query(collection(db, "social_accounts"), where("ownerId", "==", user.uid));
    const unsubSocialAccounts = onSnapshot(qSocialAccounts, (snapshot) => {
      setSocialAccounts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any);
    });

    return () => { 
      unsubLeads(); 
      unsubLists(); 
      unsubCampaigns();
      unsubWorkflows();
      unsubSocialPosts();
      unsubSocialAccounts();
    };
  }, [user]);

  const toggleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const verifyEmail = async (leadId: string) => {
    setVerifyingId(leadId);
    // Simulate neural verification
    setTimeout(async () => {
      if (user && user.uid !== 'guest-user') {
        try {
          await updateDoc(doc(db, "leads", leadId), { status: 'verified' });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `leads/${leadId}`);
        }
      } else {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'verified' } : l));
      }
      setVerifyingId(null);
    }, 1500);
  };

  const addEmailList = async () => {
    if (user && user.uid !== 'guest-user') {
      try {
        await addDoc(collection(db, "email_lists"), {
          ownerId: user.uid,
          name: "New Strategic Segment",
          subscribers: 0,
          provider: 'ses',
          status: 'syncing',
          triggers: ['manual_import'],
          createdAt: serverTimestamp()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, "email_lists");
      }
    } else {
        const newList = { 
          id: Date.now().toString(), 
          name: "Guest Strategic Segment", 
          subscribers: 0, 
          provider: 'ses' as const, 
          status: 'active' as const, 
          triggers: ['manual_signup'] 
        };
        setLists(prev => [...prev, newList]);
    }
  };

  const spawnWorkflow = async (trigger: string) => {
    if (user && user.uid !== 'guest-user') {
      try {
        await addDoc(collection(db, "automated_workflows"), {
          ownerId: user.uid,
          name: `New ${trigger.replace('_', ' ')} Workflow`,
          trigger,
          status: 'paused',
          steps: [],
          createdAt: serverTimestamp()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, "automated_workflows");
      }
    }
  };

  const saveCampaign = async () => {
    if (!campName || !subjectA || !bodyA) return;
    setIsSavingCampaign(true);

    const campaignData = {
      name: campName,
      subject: subjectA,
      body: bodyA,
      subjectB: testSubject ? subjectB : undefined,
      bodyB: testBody ? bodyB : undefined,
      isABTest: testSubject || testBody,
      testSubject,
      testBody,
      status: 'draft' as const,
      metrics: { 
        opens: 0, 
        clicks: 0, 
        bounces: 0,
        opensB: (testSubject || testBody) ? 0 : undefined,
        clicksB: (testSubject || testBody) ? 0 : undefined
      },
      createdAt: new Date()
    };

    if (user && user.uid !== 'guest-user') {
      try {
        if (editingCampId) {
          await updateDoc(doc(db, "email_campaigns", editingCampId), {
            name: campaignData.name,
            subject: campaignData.subject,
            body: campaignData.body,
            subjectB: campaignData.subjectB || null,
            bodyB: campaignData.bodyB || null,
            isABTest: campaignData.isABTest,
            testSubject: campaignData.testSubject,
            testBody: campaignData.testBody
          });
        } else {
          await addDoc(collection(db, "email_campaigns"), {
            ...campaignData,
            ownerId: user.uid,
            createdAt: serverTimestamp()
          });
        }
      } catch (e) {
        handleFirestoreError(e, editingCampId ? OperationType.UPDATE : OperationType.CREATE, `email_campaigns/${editingCampId || ''}`);
      }
    } else {
      if (editingCampId) {
        setCampaigns(prev => prev.map(c => c.id === editingCampId ? { ...c, ...campaignData } : c));
      } else {
        setCampaigns(prev => [{ ...campaignData, id: Date.now().toString() } as EmailCampaign, ...prev]);
      }
    }

    // Reset
    setShowCampaignModal(false);
    setEditingCampId(null);
    setCampName("");
    setSubjectA("");
    setBodyA("");
    setSubjectB("");
    setBodyB("");
    setIsABMode(false);
    setTestSubject(false);
    setTestBody(false);
    setIsSavingCampaign(false);
  };

  const openCampaignModal = (abMode: boolean, existing?: EmailCampaign) => {
    if (existing) {
      setEditingCampId(existing.id);
      setCampName(existing.name);
      setSubjectA(existing.subject);
      setBodyA(existing.body);
      setSubjectB(existing.subjectB || "");
      setBodyB(existing.bodyB || "");
      setIsABMode(abMode || existing.isABTest);
      setTestSubject(existing.testSubject || false);
      setTestBody(existing.testBody || false);
    } else {
      setEditingCampId(null);
      setCampName("");
      setSubjectA("");
      setBodyA("");
      setSubjectB("");
      setBodyB("");
      setIsABMode(abMode);
      setTestSubject(abMode);
      setTestBody(abMode);
    }
    setShowCampaignModal(true);
  };

  const [bulkPreview, setBulkPreview] = useState<any[] | null>(null);
  const [bulkLeadsPreview, setBulkLeadsPreview] = useState<any[] | null>(null);

  const handleLeadBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsBulking(true);
    setBulkError(null);
    setBulkLeadsPreview(null);

    const processData = async (data: any[]) => {
      const validLeads = data.filter(item => {
        const email = item.email || item.Email || item.address;
        return email && validateEmail(email) !== 'invalid';
      }).map(lead => {
        const email = lead.email || lead.Email || lead.address;
        const name = lead.name || lead.Name || lead.full_name || 'Anonymous';
        return {
          email,
          name,
          validation: validateEmail(email),
          status: validateEmail(email) === 'suspicious' ? 'pending' : 'verified'
        };
      });
      
      if (validLeads.length === 0) {
        setBulkError("Validation Failed: No valid leads detected. Ensure your file has Email column.");
        setIsBulking(false);
        return;
      }

      setBulkLeadsPreview(validLeads);
      setIsBulking(false);
    };

    if (file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          await processData(Array.isArray(json) ? json : [json]);
        } catch {
          setBulkError("Parsing Error: Invalid JSON structure.");
          setIsBulking(false);
        }
      };
      reader.readAsText(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await processData(results.data);
        },
        error: () => {
          setBulkError("Parsing Error: Failure during CSV tokenization.");
          setIsBulking(false);
        }
      });
    }
  };

  const confirmLeadBulkUpload = async () => {
    if (!bulkLeadsPreview) return;
    setIsBulking(true);
    
    try {
      if (user && user.uid !== 'guest-user') {
        const promises = bulkLeadsPreview.map(lead => 
          addDoc(collection(db, "leads"), {
            ownerId: user.uid,
            name: lead.name,
            email: lead.email,
            status: lead.status,
            source: 'Bulk Neural Import',
            joinedAt: serverTimestamp()
          })
        );
        await Promise.all(promises);
      } else {
        const newLeads = bulkLeadsPreview.map((lead, i) => ({
          ...lead,
          id: `bulk-${Date.now()}-${i}`,
          source: 'Bulk Guest Import',
          joinedAt: new Date()
        }));
        setLeads(prev => [...newLeads, ...prev]);
      }
      setBulkLeadsPreview(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "leads_bulk_confirm");
    } finally {
      setIsBulking(false);
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsBulking(true);
    setBulkError(null);
    setBulkPreview(null);

    const processData = async (data: any[]) => {
      const validCampaigns = data.filter(item => {
        const hasHeader = (item.name || item.Name) && (item.subject || item.Subject) && (item.body || item.Body);
        return hasHeader;
      }).map(camp => {
        const name = camp.name || camp.Name;
        const subject = camp.subject || camp.Subject;
        const body = camp.body || camp.Body;
        const sendDate = camp.send_date || camp.SendDate || camp.scheduledAt;
        const status = camp.status || camp.Status || 'draft';
        
        return {
          name,
          subject,
          body,
          status,
          scheduledAt: sendDate ? new Date(sendDate) : null
        };
      });
      
      if (validCampaigns.length === 0) {
        setBulkError("Validation Failed: No valid campaigns detected. Required headers: name, subject, body.");
        setIsBulking(false);
        return;
      }

      setBulkPreview(validCampaigns);
      setIsBulking(false);
    };

    if (file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          await processData(Array.isArray(json) ? json : [json]);
        } catch {
          setBulkError("Parsing Error: Invalid JSON structure.");
          setIsBulking(false);
        }
      };
      reader.readAsText(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await processData(results.data);
        },
        error: () => {
          setBulkError("Parsing Error: Failure during CSV tokenization.");
          setIsBulking(false);
        }
      });
    }
  };

  const confirmBulkUpload = async () => {
    if (!bulkPreview) return;
    setIsBulking(true);
    
    try {
      if (user && user.uid !== 'guest-user') {
        const promises = bulkPreview.map(camp => 
          addDoc(collection(db, "email_campaigns"), {
            ownerId: user.uid,
            name: camp.name,
            subject: camp.subject,
            body: camp.body,
            isABTest: false,
            status: camp.scheduledAt ? 'scheduled' : camp.status,
            scheduledAt: camp.scheduledAt || null,
            metrics: { opens: 0, clicks: 0, bounces: 0 },
            createdAt: serverTimestamp()
          })
        );
        await Promise.all(promises);
      } else {
        const newCampaigns = bulkPreview.map((camp, i) => ({
          ...camp,
          id: `bulk-${Date.now()}-${i}`,
          metrics: { opens: 0, clicks: 0, bounces: 0 },
          createdAt: new Date(),
          isABTest: false,
          status: camp.scheduledAt ? 'scheduled' : camp.status
        }));
        setCampaigns(prev => [...prev, ...newCampaigns]);
      }
      setBulkPreview(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "email_campaigns_bulk_confirm");
    } finally {
      setIsBulking(false);
    }
  };

  const [customTrigger, setCustomTrigger] = useState("");
  const [isAddingCustomWorkflow, setIsAddingCustomWorkflow] = useState(false);
  const [showExternalEventHelp, setShowExternalEventHelp] = useState(false);

  const defaultTriggers = [
    { id: 'welcome', info: 'Triggered immediately when a new node joins your matrix.' },
    { id: 'abandoned_cart', info: 'Activates when a user leaves the nexus without completing a transaction.' },
    { id: 're_engagement', info: 'Targeted at dormant nodes that haven\'t interacted with recent transmissions.' }
  ];
  
  const currentListTriggers = lists.map(l => `list_join_${l.id}`);
  const customUsedTriggers = Array.from(new Set(workflows.map(wf => wf.trigger).filter(t => 
    !defaultTriggers.map(dt => dt.id).includes(t) && !currentListTriggers.includes(t)
  )));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Neural Email Studio</h2>
          <p className="text-slate-500 font-bold">Autonomous lead infrastructure & high-velocity SMTP sync.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setShowConfigModal(true)}
             className="flex items-center gap-2 px-6 py-3 nm-button rounded-xl text-slate-500 font-bold"
           >
             <Settings className="w-5 h-5" /> Config
           </button>
           <button 
             onClick={toggleSync}
             className={`flex items-center gap-2 px-8 py-3 nm-button rounded-xl font-black transition-all ${isSyncing ? 'text-orange-600 animate-pulse' : 'text-orange-600 hover:scale-105'}`}
           >
             <Zap className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'Syncing...' : 'Force Global Sync'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-4">
          <div className="nm-flat p-2 rounded-[2.5rem] flex flex-col gap-1">
            {[
              { id: 'leads', icon: Users, label: 'Lead Central' },
              { id: 'lists', icon: Mail, label: 'Neural Lists' },
              { id: 'workflows', icon: Workflow, label: 'Automations' },
              { id: 'campaigns', icon: Send, label: 'Campaigns' },
              { id: 'social', icon: Share2, label: 'Social Matrix' },
              { id: 'infrastructure', icon: Server, label: 'Infrastructure' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] font-bold text-sm transition-all ${activeTab === tab.id ? 'nm-inset text-orange-600 font-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="nm-flat p-8 rounded-[2.5rem] bg-slate-950 text-white border border-orange-500/20">
             <div className="flex items-center gap-4 mb-4">
                <ShieldCheck className="w-8 h-8 text-orange-500" />
                <h4 className="font-black uppercase text-xs">Anti-Bounce Guard</h4>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed mb-6">
                Engine is actively blocking fake email patterns and temporary domains to protect sender reputation.
             </p>
             <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-600 w-3/4 animate-pulse" />
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'leads' && (
              <motion.div 
                key="leads"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="md:col-span-2 flex justify-between items-center bg-white dark:bg-slate-900/50 p-4 rounded-3xl nm-inset">
                      <div className="flex items-center gap-4 flex-1">
                         <Search className="w-5 h-5 text-slate-400" />
                         <input placeholder="Neural search leads..." className="bg-transparent w-full text-sm font-bold focus:outline-none" />
                      </div>
                      <div className="flex gap-2">
                         <button className="p-3 text-slate-400 hover:text-orange-600"><Filter className="w-5 h-5" /></button>
                         <button className="px-6 py-2 bg-slate-900 dark:bg-black/40 text-white dark:text-slate-400 rounded-xl font-black text-[10px] uppercase">Export CSV</button>
                      </div>
                   </div>
                   
                   <div className="relative group">
                      <input 
                        type="file" 
                        accept=".csv, .json" 
                        onChange={handleLeadBulkUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <button className={cn(
                        "w-full h-full px-6 py-4 nm-button rounded-3xl text-[10px] font-black uppercase flex items-center justify-center gap-3 transition-all",
                        isBulking ? "text-orange-600 animate-pulse" : "text-indigo-600 hover:scale-[1.02]"
                      )}>
                        {isBulking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isBulking ? "Validating Nodes..." : "Bulk Neural Import"}
                      </button>
                   </div>
                </div>

                {/* Quick Add Node */}
                <div className="nm-flat p-10 rounded-[3.5rem] border border-orange-500/10 bg-slate-50/50 dark:bg-black/20 overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-8 opacity-5 text-orange-600">
                      <UserPlus className="w-32 h-32" />
                   </div>
                   
                   <div className="flex items-center gap-4 mb-8 relative z-10">
                      <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-xl shadow-orange-600/20">
                         <Plus className="w-5 h-5" />
                      </div>
                      <div>
                         <h5 className="font-black uppercase text-lg tracking-tighter leading-none mb-1">Lead Matrix Injection</h5>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Manual propagation with real-time neural validation</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                      <div className="md:col-span-5 space-y-2">
                         <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">Subscriber Identity (Email)</label>
                         <div className="relative">
                            <input 
                              placeholder="e.g. neumann@matrix.io" 
                              value={newLeadEmail}
                              onChange={(e) => setNewLeadEmail(e.target.value)}
                              className={cn(
                                "w-full p-5 nm-inset rounded-2xl bg-white dark:bg-slate-900 font-bold text-xs transition-all border-2",
                                validationStatus === 'valid' ? 'border-emerald-500/30' :
                                validationStatus === 'invalid' ? 'border-rose-500/30' :
                                validationStatus === 'suspicious' ? 'border-amber-500/30' : 'border-transparent'
                              )}
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                               {validationStatus === 'valid' && <CheckCircle2 className="w-4 h-4 text-emerald-500 drop-shadow-sm" />}
                               {validationStatus === 'invalid' && <XCircle className="w-4 h-4 text-rose-500 drop-shadow-sm" />}
                               {validationStatus === 'suspicious' && <AlertCircle className="w-4 h-4 text-amber-500 drop-shadow-sm" />}
                            </div>
                         </div>
                         <AnimatePresence mode="wait">
                            {validationStatus !== 'idle' && (
                              <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className={cn(
                                  "text-[8px] font-black uppercase tracking-widest px-4",
                                  validationStatus === 'valid' ? 'text-emerald-500' :
                                  validationStatus === 'invalid' ? 'text-rose-500' : 'text-amber-500'
                                )}
                              >
                                {validationStatus === 'valid' && "Neural Pattern Recognized"}
                                {validationStatus === 'invalid' && "Invalid Transmission Format"}
                                {validationStatus === 'suspicious' && "Disposable/Generic Node Detected"}
                              </motion.p>
                            )}
                         </AnimatePresence>
                      </div>

                      <div className="md:col-span-4 space-y-2">
                         <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">Display Alias (Optional)</label>
                         <input 
                           placeholder="e.g. John Doe" 
                           value={newLeadName}
                           onChange={(e) => setNewLeadName(e.target.value)}
                           className="w-full p-5 nm-inset rounded-2xl bg-white dark:bg-slate-900 font-bold text-xs"
                         />
                      </div>

                      <div className="md:col-span-3 flex items-end">
                         <button 
                           onClick={addSingleLead}
                           disabled={isAddingLead || validationStatus === 'invalid' || !newLeadEmail}
                           className="w-full py-5 nm-button bg-slate-950 dark:bg-orange-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02] active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                         >
                           {isAddingLead ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                           Inject Lead
                         </button>
                      </div>
                   </div>

                   {validationStatus === 'suspicious' && (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="mt-6 p-4 nm-inset bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-3"
                     >
                       <AlertCircle className="w-4 h-4 text-amber-500" />
                       <p className="text-[8px] font-black uppercase text-amber-600 tracking-tighter">
                         Caution: This identity uses a high-entropy or disposable domain. Automated flagging will remain 'Pending' until further behavioral analysis.
                       </p>
                     </motion.div>
                   )}
                </div>

                {bulkLeadsPreview && (
                   <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="nm-flat p-8 rounded-[3rem] border border-indigo-500/20 bg-indigo-500/5 space-y-6"
                   >
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg">
                              <ShieldCheck className="w-5 h-5" />
                           </div>
                           <div>
                              <h5 className="font-black uppercase text-sm tracking-tight leading-none mb-1">Lead Matrix Validated</h5>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{bulkLeadsPreview.length} Identities parsed through Neural Guard</p>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <button onClick={() => setBulkLeadsPreview(null)} className="px-6 py-2 nm-button rounded-xl text-[10px] font-black uppercase text-slate-400">Discard</button>
                           <button 
                             onClick={confirmLeadBulkUpload} 
                             disabled={isBulking}
                             className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-xl active:scale-95 transition-all"
                           >
                             {isBulking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                             Inject Matrix
                           </button>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                        {bulkLeadsPreview.map((lead, idx) => (
                          <div key={idx} className="p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900/50 flex flex-col gap-1">
                             <div className="flex justify-between items-start">
                                <span className={cn(
                                  "w-2 h-2 rounded-full mt-1",
                                  lead.validation === 'valid' ? 'bg-emerald-500' :
                                  lead.validation === 'suspicious' ? 'bg-amber-500' : 'bg-rose-500'
                                )} />
                                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{lead.validation}</span>
                             </div>
                             <p className="text-[10px] font-black uppercase truncate leading-none mt-1">{lead.name}</p>
                             <p className="text-[8px] font-bold text-slate-400 truncate">{lead.email}</p>
                          </div>
                        ))}
                     </div>
                   </motion.div>
                )}

                {bulkError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 nm-inset bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest">{bulkError}</p>
                    <button onClick={() => setBulkError(null)} className="ml-auto text-red-400 hover:text-red-600 transition-colors">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                <div className="nm-flat p-8 rounded-[3rem] space-y-4 overflow-hidden">
                   <div className="grid grid-cols-4 px-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <span>Identity</span>
                      <span>Source Node</span>
                      <span>Validation Status</span>
                      <span className="text-right">Actions</span>
                   </div>
                   <div className="space-y-2">
                      {leads.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 font-bold uppercase text-xs">No neural leads detected</div>
                      ) : leads.map((lead, i) => (
                        <div key={i} className="flex items-center justify-between p-6 nm-inset bg-white dark:bg-slate-900/50 rounded-2xl group hover:scale-[1.01] transition-transform">
                           <div className="grid grid-cols-4 items-center flex-1">
                              <div className="flex flex-col">
                                 <span className="text-xs font-black uppercase truncate">{lead.name || 'Anonymous User'}</span>
                                 <span className="text-[10px] font-bold text-slate-400">{lead.email}</span>
                              </div>
                              <span className="text-[10px] font-black uppercase text-indigo-600">{lead.source}</span>
                              <div className="flex items-center gap-2">
                                 {lead.status === 'verified' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
                                  lead.status === 'pending' ? <Clock className="w-4 h-4 text-amber-500 animate-pulse" /> :
                                  <XCircle className="w-4 h-4 text-red-500" />}
                                 <span className={`text-[10px] font-black uppercase ${
                                    lead.status === 'verified' ? 'text-emerald-500' : 
                                    lead.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                                 }`}>
                                    {lead.status}
                                 </span>
                              </div>
                              <div className="flex justify-end gap-2 pr-2">
                                 {lead.status === 'pending' && (
                                   <button 
                                     onClick={() => verifyEmail(lead.id)}
                                     disabled={verifyingId === lead.id}
                                     className="px-3 py-1 nm-button rounded-lg text-[8px] font-black uppercase text-orange-600 flex items-center gap-1"
                                   >
                                     {verifyingId === lead.id ? <RefreshCw className="w-2 h-2 animate-spin" /> : <ShieldCheck className="w-2 h-2" />}
                                     {verifyingId === lead.id ? 'Neural Check...' : 'Verify'}
                                   </button>
                                 )}
                                 <button className="p-2 nm-button rounded-lg text-slate-400 hover:text-orange-600 transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'lists' && (
              <motion.div 
                key="lists"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {lists.map((list, i) => (
                  <div key={i} className="nm-flat p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Mail className="w-24 h-24 text-orange-600" />
                     </div>
                     <div className="space-y-6 relative text-left">
                        <div className="flex justify-between items-start">
                           <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase ${list.provider === 'ses' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                              {list.provider} Relay
                           </div>
                           <button className="p-2 nm-button rounded-xl text-slate-400"><Activity className="w-4 h-4" /></button>
                        </div>
                        <div>
                           <h4 className="text-2xl font-black uppercase tracking-tighter">{list.name}</h4>
                           <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mt-1">{list.subscribers.toLocaleString()}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Subscribers</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {list.triggers.map((t, idx) => (
                             <span key={idx} className="px-2 py-1 nm-inset rounded-lg text-[8px] font-black text-slate-500 uppercase">{t}</span>
                           ))}
                        </div>
                        <button 
                          onClick={() => setActiveTab('workflows')}
                          className="w-full py-4 mt-4 nm-button bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase text-orange-600"
                        >
                           Manage Automation <ChevronRight className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                ))}
                <button 
                  onClick={addEmailList}
                  className="nm-flat p-8 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-orange-600 transition-all"
                >
                   <div className="p-4 nm-button rounded-2xl">
                      <Plus className="w-8 h-8" />
                   </div>
                   <span className="font-black uppercase text-xs tracking-widest">Spawn Neural List</span>
                </button>
              </motion.div>
            )}

            {activeTab === 'workflows' && (
              <motion.div 
                key="workflows"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="nm-flat p-8 rounded-[3rem] border border-orange-500/10 bg-slate-50/50 dark:bg-black/20">
                   <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                      <div>
                         <h4 className="text-2xl font-black uppercase tracking-tight">Automation Engine</h4>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Behavior-based trigger protocols & custom events</p>
                      </div>
                      <div className="flex gap-3">
                         <button 
                           onClick={() => setShowExternalEventHelp(!showExternalEventHelp)}
                           className="px-6 py-3 nm-button rounded-xl text-[10px] font-black uppercase text-indigo-600 flex items-center gap-2"
                         >
                           <Info className="w-4 h-4" /> Trigger API Guide
                         </button>
                      </div>
                   </div>

                   <div className="space-y-10">
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <Zap className="w-5 h-5 text-orange-600" />
                           <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">System Core Triggers</h5>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {defaultTriggers.map(trigger => (
                            <div key={trigger.id} className="relative group">
                              <button 
                                onClick={() => spawnWorkflow(trigger.id)}
                                className="px-6 py-4 nm-flat hover:nm-inset bg-white dark:bg-slate-900 rounded-2xl text-[10px] font-black uppercase text-orange-600 flex items-center gap-3 transition-all"
                              >
                                <Zap className="w-4 h-4" /> {trigger.id.replace('_', ' ')}
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center shadow-xl border border-white/10 uppercase">
                                {trigger.info}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                              </div>
                            </div>
                          ))}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <Users className="w-5 h-5 text-indigo-600" />
                           <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">List Membership Triggers</h5>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {lists.map(list => (
                            <div key={list.id} className="relative group">
                              <button 
                                onClick={() => spawnWorkflow(`list_join_${list.id}`)}
                                className="px-6 py-4 nm-flat hover:nm-inset bg-white dark:bg-slate-900 rounded-2xl text-[10px] font-black uppercase text-indigo-600 flex items-center gap-3 transition-all"
                              >
                                <Users className="w-4 h-4" /> Join: {list.name}
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center shadow-xl border border-white/10 uppercase">
                                Triggers when a lead is added to {list.name} list.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                              </div>
                            </div>
                          ))}
                          {lists.length === 0 && <p className="text-[10px] font-bold text-slate-400 uppercase italic">No active lists detected</p>}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <Terminal className="w-5 h-5 text-slate-500" />
                              <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Custom Action Traces</h5>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                           <div className="md:col-span-8 flex items-center gap-2 nm-inset p-1 rounded-[1.5rem] bg-white dark:bg-slate-900">
                             <input 
                               placeholder="Define action trace (e.g. video_watched, course_completed, button_click_hero)"
                               value={customTrigger}
                               onChange={(e) => setCustomTrigger(e.target.value)}
                               className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase px-6 py-4 w-full"
                             />
                           </div>
                           <div className="md:col-span-4">
                             <button 
                               onClick={() => {
                                 if (customTrigger) {
                                   spawnWorkflow(customTrigger);
                                   setCustomTrigger("");
                                 }
                               }}
                               disabled={!customTrigger}
                               className="w-full h-full py-4 nm-button bg-slate-950 dark:bg-orange-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                             >
                                <Plus className="w-4 h-4" /> Define New Trigger
                             </button>
                           </div>
                        </div>

                        {customUsedTriggers.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-4">
                             <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mr-2 self-center">Existing Traces:</span>
                             {customUsedTriggers.map(t => (
                               <button 
                                 key={t}
                                 onClick={() => spawnWorkflow(t)}
                                 className="px-3 py-1 nm-inset rounded-lg text-[9px] font-black text-slate-500 uppercase hover:text-orange-600 transition-colors"
                               >
                                 {t}
                               </button>
                             ))}
                          </div>
                        )}
                     </div>
                   </div>

                   <AnimatePresence>
                     {showExternalEventHelp && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden mt-8"
                       >
                         <div className="p-8 nm-inset rounded-3xl bg-slate-950 text-emerald-500 font-mono text-[10px] space-y-4">
                            <p className="font-black text-white uppercase tracking-widest opacity-60">/// Neural Trigger Integration Guide</p>
                            <p>To trigger a workflow from your app or external system, perform a POST request to our event endpoint or use the Neural SDK:</p>
                            <div className="bg-black/40 p-4 rounded-xl space-y-1">
                               <p className="text-slate-400">// Trigger identifying custom action</p>
                               <p>await Brandavox.triggerEvent('{`{action_trace}`}', {`{lead_email}`});</p>
                            </div>
                            <p className="text-slate-500">Example for 'video_watched':</p>
                            <div className="bg-black/40 p-4 rounded-xl">
                               <p>fetch('https://api.brandavox.ai/v1/trigger', {`{`}</p>
                               <p className="pl-4">method: 'POST',</p>
                               <p className="pl-4">body: JSON.stringify({`{`}</p>
                               <p className="pl-8">event: 'video_watched',</p>
                               <p className="pl-8">leadEmail: 'user@example.com'</p>
                               <p className="pl-4">{`}`})</p>
                               <p>{`}`});</p>
                            </div>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {workflows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map((wf, idx) => (
                    <div key={idx} className="nm-flat p-8 rounded-[3rem] group">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                             <div className={`p-3 rounded-2xl ${wf.trigger === 'welcome' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'}`}>
                                <Workflow className="w-5 h-5" />
                             </div>
                             <div>
                                <h5 className="font-black uppercase text-sm">{wf.name}</h5>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trigger: {wf.trigger}</span>
                             </div>
                          </div>
                          <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase ${wf.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                             {wf.status}
                          </div>
                       </div>
                       
                       <div className="space-y-2 mb-8">
                          {wf.steps.map((step, si) => (
                            <div key={si} className="p-4 nm-inset rounded-xl flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  {step.type === 'delay' ? <Clock className="w-4 h-4 text-slate-400" /> : <Mail className="w-4 h-4 text-orange-600" />}
                                  <span className="text-[10px] font-black uppercase text-slate-500">
                                     {step.type === 'delay' ? `Wait ${step.delayMs ? step.delayMs / 1000 / 3600 : 0} Hours` : `Send Campaign: ${campaigns.find(c => c.id === step.campaignId)?.name || 'Draft'}`}
                                  </span>
                               </div>
                            </div>
                          ))}
                          <button className="w-full py-3 nm-button border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-orange-600 transition-all flex items-center justify-center gap-2">
                             <Plus className="w-3 h-3" /> Insert Logic Node
                          </button>
                       </div>

                       <div className="flex gap-4">
                          <button className="flex-1 py-4 nm-button bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Configure Node</button>
                          <button className="p-4 nm-button rounded-2xl text-slate-400 hover:text-red-500"><XCircle className="w-5 h-5" /></button>
                       </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'campaigns' && (
              <motion.div 
                key="campaigns"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <h4 className="text-xl font-black uppercase tracking-tight">Campaign Matrix</h4>
                   <div className="flex flex-wrap gap-4">
                      <div className="relative group">
                        <input 
                          type="file" 
                          accept=".csv, .json" 
                          onChange={handleBulkUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button className={cn(
                          "px-6 py-2 nm-button rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all",
                          isBulking ? "text-orange-600 animate-pulse" : "text-slate-500 hover:text-orange-600"
                        )}>
                          {isBulking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {isBulking ? "Queueing Matrix..." : "Bulk Scheduler"}
                        </button>
                      </div>
                      <button 
                        onClick={() => openCampaignModal(false)}
                        className="px-6 py-2 nm-button rounded-xl text-[10px] font-black uppercase text-slate-900 dark:text-white"
                      >
                         Standard Sequence
                      </button>
                      <button 
                        onClick={() => openCampaignModal(true)}
                        className="px-6 py-2 nm-button bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2"
                      >
                         <Split className="w-4 h-4" /> Neural A/B Test
                      </button>
                   </div>
                </div>

                {bulkError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 nm-inset bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest">{bulkError}</p>
                    <button onClick={() => setBulkError(null)} className="ml-auto text-red-400 hover:text-red-600 transition-colors">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {bulkPreview && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="nm-flat p-8 rounded-[3rem] border border-emerald-500/20 bg-emerald-500/5 space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500 text-white rounded-xl">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-black uppercase text-sm">Matrix Ready for Deployment</h5>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{bulkPreview.length} Campaigns validated for injection</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setBulkPreview(null)}
                          className="px-6 py-2 nm-button rounded-xl text-[10px] font-black uppercase text-slate-400"
                        >
                          Discard
                        </button>
                        <button 
                          onClick={confirmBulkUpload}
                          disabled={isBulking}
                          className="px-8 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2"
                        >
                          {isBulking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                          Inject Matrix
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[200px] overflow-y-auto pr-4 custom-scrollbar">
                      {bulkPreview.map((camp, idx) => (
                        <div key={idx} className="p-4 nm-inset rounded-2xl bg-white dark:bg-slate-900/50 space-y-2">
                          <p className="text-[10px] font-black uppercase truncate">{camp.name}</p>
                          <div className="flex items-center gap-2">
                             <Clock className="w-3 h-3 text-slate-400" />
                             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                               {camp.scheduledAt ? camp.scheduledAt.toLocaleDateString() : 'Immediate Draft'}
                             </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="nm-flat p-8 rounded-[3rem] bg-slate-50 dark:bg-black/20 border border-white/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-500/20 rounded-xl">
                      <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Matrix Import Guide</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Support: CSV or JSON • Required Headers: name, subject, body</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {campaigns.map((camp, ci) => (
                    <div key={ci} className="nm-flat p-8 rounded-[3rem]">
                       <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 nm-inset bg-slate-50 dark:bg-black/20 rounded-[1.5rem] flex items-center justify-center">
                                <Mail className="w-8 h-8 text-orange-600" />
                             </div>
                             <div>
                                <h5 className="text-xl font-black uppercase tracking-tight cursor-pointer hover:text-orange-600 transition-colors" onClick={() => openCampaignModal(camp.isABTest, camp)}>{camp.name}</h5>
                                <div className="flex items-center gap-3">
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject: {camp.subject}</span>
                                   {camp.isABTest && (
                                     <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-[8px] font-black uppercase">A/B Testing Active</span>
                                   )}
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-6 lg:gap-10">
                             <div className="text-center">
                                <div className="text-2xl font-black uppercase text-indigo-600 leading-none mb-1">{camp.metrics.opens.toLocaleString()}</div>
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Opens</div>
                             </div>
                             <div className="text-center">
                                <div className="text-2xl font-black uppercase text-emerald-600 leading-none mb-1">{camp.metrics.clicks.toLocaleString()}</div>
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Clicks</div>
                             </div>
                             <div className="text-center">
                                <div className="text-2xl font-black uppercase text-rose-600 leading-none mb-1">{camp.metrics.bounces.toLocaleString()}</div>
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bounces</div>
                             </div>
                             <button className="p-4 nm-button rounded-2xl text-slate-400 hover:text-orange-600 transition-all hidden sm:block">
                                <BarChart3 className="w-5 h-5" />
                             </button>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="nm-inset p-6 bg-slate-50/50 dark:bg-black/10 rounded-2xl border border-orange-500/5">
                             <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-[10px]">A</div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Variant Alpha</span>
                             </div>
                             <p className="text-[10px] text-slate-400 line-clamp-3 italic mb-4">"{camp.body}"</p>
                             <div className="flex justify-between items-center py-2 border-t border-slate-200 dark:border-white/5">
                                <span className="text-[8px] font-black uppercase text-slate-400">Winning Chance</span>
                                <span className="text-[10px] font-black text-emerald-500">
                                   {camp.isABTest ? (calculateSignificance(camp.metrics).score > 0 ? "62%" : "CALCULATING...") : "100%"}
                                </span>
                             </div>
                          </div>
                          
                          {camp.isABTest ? (
                            <div className="nm-inset p-6 bg-slate-50/50 dark:bg-black/10 rounded-2xl border border-indigo-500/5">
                              <div className="flex items-center gap-2 mb-4">
                                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-[10px]">B</div>
                                  <span className="text-[10px] font-black uppercase tracking-widest">Variant Beta</span>
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-3 italic mb-4">"{camp.bodyB || 'Pending content generation...'}"</p>
                              <div className="flex justify-between items-center py-2 border-t border-slate-200 dark:border-white/5">
                                  <span className="text-[8px] font-black uppercase text-slate-400">Winning Chance</span>
                                  <span className="text-[10px] font-black text-slate-400">
                                     {calculateSignificance(camp.metrics).score > 0 ? "38%" : "PENDING"}
                                  </span>
                              </div>
                            </div>
                          ) : (
                            <div 
  onClick={() => openCampaignModal(true, camp)}
  className="nm-inset p-6 flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-slate-900/50 group hover:bg-slate-50 dark:hover:bg-black/30 transition-all cursor-pointer border border-dashed border-slate-200 dark:border-white/5"
>
                               <Plus className="w-6 h-6 text-slate-200 group-hover:text-orange-600 mb-2" />
                               <span className="text-[8px] font-black uppercase text-slate-400 group-hover:text-indigo-600">Upgrade to A/B Test</span>
                            </div>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'social' && (
              <motion.div 
                key="social"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Social Connect Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {socialAccounts.map((acc) => (
                    <div key={acc.id} className="nm-flat p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-4">
                      <div className={cn(
                        "p-4 rounded-2xl text-white shadow-lg",
                        acc.platform === 'twitter' ? 'bg-sky-500' : 
                        acc.platform === 'linkedin' ? 'bg-blue-700' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'
                      )}>
                        {acc.platform === 'twitter' && <Twitter className="w-6 h-6" />}
                        {acc.platform === 'linkedin' && <Linkedin className="w-6 h-6" />}
                        {acc.platform === 'instagram' && <Instagram className="w-6 h-6" />}
                      </div>
                      <div>
                        <h5 className="font-black uppercase text-xs tracking-tight">{acc.username}</h5>
                        <p className="text-xl font-black">{acc.followers.toLocaleString()}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Neural Reach</p>
                      </div>
                      <div className="ml-auto">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                    </div>
                  ))}
                  <button className="nm-flat p-6 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center gap-3 text-slate-400 hover:text-orange-600 transition-all group">
                     <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                     <span className="font-black uppercase text-[10px] tracking-widest">Connect Node</span>
                  </button>
                </div>

                {/* Drafting Node */}
                <div className="nm-flat p-8 rounded-[3rem] border border-orange-500/10 bg-slate-50/50 dark:bg-black/20">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-indigo-600 rounded-xl text-white">
                         <Share2 className="w-5 h-5" />
                      </div>
                      <div>
                         <h4 className="font-black uppercase text-sm tracking-tight leading-none mb-1">New Social Matrix Post</h4>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Cross-platform neural synchronization</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="nm-inset p-1 rounded-2xl bg-white dark:bg-slate-900 flex gap-1">
                         {['twitter', 'linkedin', 'instagram'].map((p) => (
                           <button 
                            key={p} 
                            className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                           >
                              {p === 'twitter' && <Twitter className="w-3 h-3" />}
                              {p === 'linkedin' && <Linkedin className="w-3 h-3" />}
                              {p === 'instagram' && <Instagram className="w-3 h-3" />}
                              {p}
                           </button>
                         ))}
                      </div>

                      <textarea 
                        placeholder="Project your thoughts into the matrix..." 
                        className="w-full nm-inset p-6 rounded-3xl bg-white dark:bg-slate-900 font-bold text-sm min-h-[120px] focus:outline-none"
                      />

                      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                         <div className="flex gap-4 w-full md:w-auto">
                            <button className="flex-1 md:flex-none px-6 py-3 nm-button rounded-xl text-[10px] font-black uppercase text-slate-500 flex items-center justify-center gap-2">
                               <Clock className="w-4 h-4" /> Schedule Node
                            </button>
                            <button className="flex-1 md:flex-none px-6 py-3 nm-button rounded-xl text-[10px] font-black uppercase text-slate-500 flex items-center justify-center gap-2">
                               <Upload className="w-4 h-4" /> Add Asset
                            </button>
                         </div>
                         <button className="w-full md:w-auto px-10 py-3 bg-orange-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-orange-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Rocket className="w-4 h-4" /> Propagate Now
                         </button>
                      </div>
                   </div>
                </div>

                {/* Published & Scheduled Feed */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-6">
                     <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Transmissions</h5>
                     <div className="flex gap-4">
                        <span className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-500"><CheckCircle2 className="w-3 h-3" /> Published</span>
                        <span className="flex items-center gap-1 text-[8px] font-black uppercase text-amber-500"><Clock className="w-3 h-3" /> Scheduled</span>
                     </div>
                  </div>

                  <div className="space-y-4">
                    {socialPosts.length === 0 ? (
                      <div className="p-12 nm-inset rounded-[2.5rem] text-center text-slate-400 font-bold uppercase text-xs">No active social nodes found</div>
                    ) : socialPosts.map((post) => (
                      <div key={post.id} className="nm-flat p-8 rounded-[2.5rem] border border-white/5">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                           <div className="flex items-start gap-6 flex-1">
                              <div className={cn(
                                "p-4 rounded-2xl text-white shadow-lg shrink-0",
                                post.platform === 'twitter' ? 'bg-sky-500' : 
                                post.platform === 'linkedin' ? 'bg-blue-700' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'
                              )}>
                                {post.platform === 'twitter' && <Twitter className="w-6 h-6" />}
                                {post.platform === 'linkedin' && <Linkedin className="w-6 h-6" />}
                                {post.platform === 'instagram' && <Instagram className="w-6 h-6" />}
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">"{post.content}"</p>
                                <div className="flex items-center gap-4">
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString()}
                                   </span>
                                   <span className={cn(
                                     "px-3 py-1 rounded-full text-[8px] font-black uppercase",
                                     post.status === 'published' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                   )}>
                                     {post.status}
                                   </span>
                                </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-6 lg:gap-10 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-white/5">
                             <div className="text-center">
                                <div className="flex items-center gap-1 text-xl font-black uppercase text-pink-600 leading-none mb-1">
                                   <Heart className="w-4 h-4 fill-pink-600" />
                                   {post.metrics.likes.toLocaleString()}
                                </div>
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Reactions</div>
                             </div>
                             <div className="text-center">
                                <div className="flex items-center gap-1 text-xl font-black uppercase text-indigo-600 leading-none mb-1">
                                   <Repeat className="w-4 h-4" />
                                   {post.metrics.shares.toLocaleString()}
                                </div>
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Neural Shares</div>
                             </div>
                             <div className="text-center">
                                <div className="flex items-center gap-1 text-xl font-black uppercase text-slate-900 dark:text-white leading-none mb-1">
                                   <MessageSquare className="w-4 h-4" />
                                   {post.metrics.comments.toLocaleString()}
                                </div>
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Engagements</div>
                             </div>
                             <button className="p-4 nm-button rounded-2xl text-slate-400 hover:text-orange-600 transition-all ml-4">
                                <ArrowRight className="w-5 h-5" />
                             </button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'infrastructure' && (
              <motion.div 
                key="infra"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="nm-flat p-8 rounded-[3rem] space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="p-4 bg-orange-600 rounded-2xl text-white shadow-xl">
                            <Cloud className="w-6 h-6" />
                         </div>
                         <div>
                            <h4 className="font-black uppercase tracking-tighter">Amazon SES</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Transactional Relay</p>
                         </div>
                      </div>
                      <div className="p-4 nm-inset rounded-2xl bg-slate-50 dark:bg-white/5 space-y-3 font-mono text-[10px] text-slate-500">
                         <div className="flex justify-between"><span>Status:</span> <span className="text-emerald-500 font-bold">CONNECTED</span></div>
                         <div className="flex justify-between"><span>Region:</span> <span>US-EAST-1</span></div>
                         <div className="flex justify-between"><span>Identity:</span> <span>brandavox.ai</span></div>
                      </div>
                      <button className="w-full py-4 nm-button rounded-2xl text-xs font-black uppercase text-slate-500">Re-verify Identity</button>
                   </div>

                   <div className="nm-flat p-8 rounded-[3rem] space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl">
                            <Database className="w-6 h-6" />
                         </div>
                         <div>
                            <h4 className="font-black uppercase tracking-tighter">Alibaba Direct Mail</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Redundant Failover Node</p>
                         </div>
                      </div>
                      <div className="p-4 nm-inset rounded-2xl bg-slate-50 dark:bg-white/5 space-y-3 font-mono text-[10px] text-slate-500">
                         <div className="flex justify-between"><span>Status:</span> <span className="text-amber-500 font-bold">STANDBY</span></div>
                         <div className="flex justify-between"><span>Region:</span> <span>Singapore</span></div>
                         <div className="flex justify-between"><span>Flow:</span> <span>Marketing/Bulk</span></div>
                      </div>
                      <button className="w-full py-4 nm-button rounded-2xl text-xs font-black uppercase text-blue-600">Upgrade Priority</button>
                   </div>
                </div>

                <div className="nm-flat p-8 rounded-[3rem] bg-slate-950 border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-5">
                      <Terminal className="w-48 h-48 text-white" />
                   </div>
                   <div className="relative space-y-6">
                      <div className="flex items-center gap-2 text-emerald-500 text-xs font-mono">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         NEURAL_SYNC_DAEMON_ACTIVE
                      </div>
                      <div className="space-y-2 font-mono text-[10px] text-slate-400 text-left">
                         <p>[09:21:42] SYNC_PACKET_SENT: 42 new verified leads relayed to SES-v2-US_EAST</p>
                         <p>[09:21:45] BOUNCE_GUARD_INTERCEPT: blocked pattern user@tempmail.ninja</p>
                         <p>[09:21:50] MAILWIZZ_WEBHOOK_RECEIVED: List 'Beta-Founders' updated</p>
                         <p className="animate-pulse">_</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Config Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={()=>setShowConfigModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg nm-flat bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-white/10 text-left">
                <div className="flex items-center gap-4 mb-10">
                   <div className="p-4 bg-orange-600 rounded-3xl text-white shadow-2xl">
                      <Settings className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter">Engine Config</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Global Relay Setup</p>
                   </div>
                   <button onClick={()=>setShowConfigModal(false)} className="ml-auto p-4 nm-button rounded-2xl text-slate-400"><XCircle className="w-6 h-6" /></button>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4 p-1 nm-inset rounded-2xl bg-slate-50 dark:bg-black/20">
                      <button onClick={()=>setProvider('ses')} className={`py-4 rounded-xl text-xs font-black uppercase transition-all ${provider === 'ses' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400'}`}>Amazon SES</button>
                      <button onClick={()=>setProvider('alibaba')} className={`py-4 rounded-xl text-xs font-black uppercase transition-all ${provider === 'alibaba' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Alibaba Cloud</button>
                   </div>

                   <div className="space-y-4">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2 mb-1 ml-4 group relative w-fit">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Relay Access Key</label>
                            <Info className="w-3 h-3 text-slate-400 cursor-help" />
                            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center shadow-xl border border-white/10 uppercase">
                              Credential provided by your SMTP host (AWS/Alibaba) to authenticate neural transmissions.
                              <div className="absolute top-full left-2 border-8 border-transparent border-t-slate-900" />
                            </div>
                         </div>
                         <input type="password" placeholder="••••••••••••••••" className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent text-sm" />
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2 mb-1 ml-4 group relative w-fit">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Relay Secret Key</label>
                            <Info className="w-3 h-3 text-slate-400 cursor-help" />
                            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center shadow-xl border border-white/10 uppercase">
                              Secure cryptographic key paired with your Access Key for verified relay access.
                              <div className="absolute top-full left-2 border-8 border-transparent border-t-slate-900" />
                            </div>
                         </div>
                         <input type="password" placeholder="••••••••••••••••" className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent text-sm" />
                      </div>
                      <div className="flex items-center gap-3 p-4 nm-inset rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                         <ShieldCheck className="w-5 h-5 text-emerald-500" />
                         <span className="text-[10px] font-black uppercase text-emerald-600">Enterprise Grade Encryption Active</span>
                      </div>
                   </div>

                   <button className="w-full py-5 bg-slate-950 dark:bg-white dark:text-slate-950 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl mt-4 active:scale-95 transition-all">
                      Save & Test Connectivity
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Campaign Creation Modal */}
      <AnimatePresence>
        {showCampaignModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={()=>setShowCampaignModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-4xl nm-flat bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[4rem] border border-white/10 text-left max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-4 mb-8">
                   <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-2xl">
                      <Send className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter">{isABMode ? 'Neural A/B Sequence' : 'Standard Sequence'}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Campaign Matrix Configuration</p>
                   </div>
                   <button onClick={()=>setShowCampaignModal(false)} className="ml-auto p-4 nm-button rounded-2xl text-slate-400 hover:text-red-500"><XCircle className="w-6 h-6" /></button>
                </div>

                <div className="space-y-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Campaign Reference Name</label>
                      <input 
                        value={campName}
                        onChange={(e)=>setCampName(e.target.value)}
                        placeholder="e.g. Q4 Growth Sprint - Variant Alpha" 
                        className="w-full nm-inset p-4 rounded-2xl font-bold bg-transparent text-sm mb-4" 
                      />
                   </div>

                   {isABMode && (
                     <div className="flex flex-wrap gap-4 p-4 nm-inset rounded-2xl bg-slate-50 dark:bg-black/10">
                        <div className="flex items-center gap-3 group relative">
                           <button 
                             onClick={() => setTestSubject(!testSubject)}
                             className={cn("p-2 rounded-lg transition-all", testSubject ? "bg-orange-600 text-white" : "nm-button text-slate-400")}
                           >
                              <CheckCircle2 className="w-4 h-4" />
                           </button>
                           <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1">
                             Test Subject Lines <Info className="w-3 h-3 opacity-50" />
                           </span>
                           <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center shadow-xl border border-white/10 uppercase">
                              Allows testing multiple subject lines to see which achieves a higher open rate.
                              <div className="absolute top-full left-4 border-8 border-transparent border-t-slate-900" />
                           </div>
                        </div>
                        <div className="flex items-center gap-3 group relative">
                           <button 
                             onClick={() => setTestBody(!testBody)}
                             className={cn("p-2 rounded-lg transition-all", testBody ? "bg-orange-600 text-white" : "nm-button text-slate-400")}
                           >
                              <CheckCircle2 className="w-4 h-4" />
                           </button>
                           <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1">
                             Test Body Content <Info className="w-3 h-3 opacity-50" />
                           </span>
                           <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center shadow-xl border border-white/10 uppercase">
                              Splits your audience to test different message bodies for optimized click-through rates.
                              <div className="absolute top-full left-4 border-8 border-transparent border-t-slate-900" />
                           </div>
                        </div>
                     </div>
                   )}

                   <div className={cn("grid gap-8", isABMode ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
                     {/* Variant A */}
                     <div className="space-y-4 p-6 nm-inset rounded-[2.5rem] bg-slate-50/50 dark:bg-black/10 border border-orange-500/10">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-[10px]">A</div>
                           <span className="text-[10px] font-black uppercase tracking-widest">Variant Alpha (Original)</span>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Email Subject</label>
                          <input 
                            value={subjectA}
                            onChange={(e)=>setSubjectA(e.target.value)}
                            placeholder="Hook line..." 
                            className="w-full nm-flat p-4 rounded-xl font-bold bg-white dark:bg-slate-900 text-xs" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Neural Content Body</label>
                          <textarea 
                            value={bodyA}
                            onChange={(e)=>setBodyA(e.target.value)}
                            placeholder="Enter the core message..." 
                            className="w-full nm-flat p-4 rounded-xl font-bold bg-white dark:bg-slate-900 text-xs min-h-[150px]" 
                          />
                        </div>
                     </div>

                     {/* Variant B */}
                     {isABMode && (
                        <div className="space-y-4 p-6 nm-inset rounded-[2.5rem] bg-slate-50/50 dark:bg-black/10 border border-indigo-500/10">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-[10px]">B</div>
                              <span className="text-[10px] font-black uppercase tracking-widest">Variant Beta (Variation)</span>
                           </div>
                           <div className="space-y-2 opacity-50 transition-opacity">
                             <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Email Subject {testSubject ? '(Testing)' : '(Inherited)'}</label>
                             <input 
                               value={testSubject ? subjectB : subjectA}
                               onChange={(e)=>setSubjectB(e.target.value)}
                               disabled={!testSubject}
                               placeholder="Alternative hook line..." 
                               className={cn("w-full nm-flat p-4 rounded-xl font-bold bg-white dark:bg-slate-900 text-xs", !testSubject && "grayscale opacity-50")} 
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Neural Content Body {testBody ? '(Testing)' : '(Inherited)'}</label>
                             <textarea 
                               value={testBody ? bodyB : bodyA}
                               onChange={(e)=>setBodyB(e.target.value)}
                               disabled={!testBody}
                               placeholder="Enter the alternative message..." 
                               className={cn("w-full nm-flat p-4 rounded-xl font-bold bg-white dark:bg-slate-900 text-xs min-h-[150px]", !testBody && "grayscale opacity-50")} 
                             />
                           </div>
                        </div>
                     )}
                   </div>

                   <button 
                     onClick={saveCampaign}
                     disabled={isSavingCampaign || !campName || !subjectA || !bodyA || (isABMode && testSubject && !subjectB) || (isABMode && testBody && !bodyB)}
                     className="w-full py-5 bg-orange-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl mt-4 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                   >
                      {isSavingCampaign ? <RefreshCw className="w-4 h-4 animate-spin" /> : editingCampId ? <CheckCircle2 className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
                      {editingCampId ? "Update Campaign Matrix" : "Deploy Matrix to Drafts"}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
