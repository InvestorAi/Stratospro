import React, { useState, useMemo, useEffect } from "react";
import { Plus, Twitter, Linkedin, Facebook, Instagram, Clock, Filter, ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileEdit, Sparkles, Search, X, LayoutDashboard, FileUp, CheckCircle2, Circle, AlertCircle, Trash2, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth, onSnapshot, collection, query, where, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "../lib/firebase";
import { cn } from "../lib/utils";

const INITIAL_POSTS = [
  { id: 1, day: 4, time: "09:00 AM", title: "Product Launch", platform: "Twitter", status: "Scheduled", description: "Exciting news about our new neural engine." },
  { id: 2, day: 7, time: "12:30 PM", title: "Team Highlight", platform: "LinkedIn", status: "Draft", description: "Meeting the minds behind the Brandavox magic." },
  { id: 3, day: 10, time: "04:00 PM", title: "Influencer Reel", platform: "Instagram", status: "Published", description: "Collaboration with top tech influencers." },
  { id: 4, day: 15, time: "09:00 AM", title: "Morning Coffee Thoughts", platform: "Twitter", status: "Scheduled", description: "Quick update on mission vision." },
  { id: 5, day: 15, time: "12:30 PM", title: "Product Features Spotlight", platform: "Instagram", status: "Draft", description: "In-depth look at AI features." },
  { id: 6, day: 15, time: "04:00 PM", title: "Monthly Newsletter Snippet", platform: "LinkedIn", status: "Published", description: "Key takeaways from our May update." },
];

export default function ContentPlanner({ user }: any) {
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(15);
  const [activePlatform, setActivePlatform] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskToConfirm, setTaskToConfirm] = useState<any | null>(null);

  // New Post State
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    platforms: [] as string[],
    dateTime: "",
    mediaPaths: [] as string[]
  });

  const handleCreatePost = () => {
    if (!newPost.title || newPost.platforms.length === 0) return;

    const dateObj = newPost.dateTime ? new Date(newPost.dateTime) : new Date();
    const day = dateObj.getDate();
    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const createdPosts = newPost.platforms.map(platform => ({
      id: Date.now() + Math.random(),
      day,
      time,
      title: newPost.title,
      platform,
      status: "Scheduled" as const,
      description: newPost.description
    }));

    setPosts(prev => [...prev, ...createdPosts]);
    setShowModal(false);
    setNewPost({ title: "", description: "", platforms: [], dateTime: "", mediaPaths: [] });
  };

  // Sync Tasks from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "tasks"),
      where("authorId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(taskList.sort((a: any, b: any) => {
        // Sort by status (todo first) then by created at
        if (a.status === b.status) return b.createdAt - a.createdAt;
        return a.status === 'done' ? 1 : -1;
      }));
    });

    return () => unsubscribe();
  }, []);

  const addTask = async () => {
    if (!newTaskTitle.trim() || !auth.currentUser) return;
    try {
      await addDoc(collection(db, "tasks"), {
        authorId: auth.currentUser.uid,
        title: newTaskTitle,
        status: "todo",
        priority: "medium",
        createdAt: new Date().toISOString()
      });
      setNewTaskTitle("");
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  const toggleTaskStatus = async (task: any) => {
    if (task.status === "todo") {
      setTaskToConfirm(task);
      return;
    }
    
    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, {
        status: "todo"
      });
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const confirmToggleStatus = async () => {
    if (!taskToConfirm) return;
    try {
      const taskRef = doc(db, "tasks", taskToConfirm.id);
      await updateDoc(taskRef, {
        status: "done"
      });
      setTaskToConfirm(null);
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        let newPosts = [];
        if (file.name.endsWith(".json")) {
          newPosts = JSON.parse(content);
        } else if (file.name.endsWith(".csv")) {
          const lines = content.split("\n");
          const headers = lines[0].split(",");
          newPosts = lines.slice(1).filter(line => line.trim()).map((line, index) => {
            const values = line.split(",");
            return {
              id: Date.now() + index,
              day: parseInt(values[0]),
              time: values[1],
              title: values[2],
              platform: values[3],
              status: values[4],
              description: values[5]
            };
          });
        }

        if (newPosts.length > 0) {
          setPosts(prev => [...prev, ...newPosts]);
          alert(`Successfully scheduled ${newPosts.length} posts from ${file.name}`);
        }
      } catch (err) {
        console.error("Failed to parse file", err);
        alert("Critical Error: Neural sequence corrupt. Ensure CSV/JSON format is valid.");
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = "";
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchPlatform = activePlatform === "All" || post.platform === activePlatform;
      const matchStatus = activeStatus === "All" || post.status === activeStatus;
      const matchSearch = searchQuery === "" || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.platform.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchPlatform && matchStatus && matchSearch;
    });
  }, [posts, activePlatform, activeStatus, searchQuery]);

  const daysInMonth = 30;
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <button className="p-3 nm-button rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
              <button className="p-3 nm-button rounded-xl"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <h3 className="text-2xl font-black">May 2026</h3>
          </div>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input 
                type="text"
                placeholder="AI Search commands, posts, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 nm-inset rounded-xl bg-transparent font-bold text-sm focus:ring-2 focus:ring-orange-600/20 transition-all border-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-orange-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all ${
                showFilters || activePlatform !== "All" || activeStatus !== "All"
                  ? 'nm-inset text-orange-600 bg-orange-600/5' 
                  : 'nm-button text-slate-500'
              }`}
            >
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button 
              onClick={() => document.getElementById('bulk-upload-input')?.click()}
              className="px-6 py-3 nm-button rounded-xl flex items-center gap-2 font-bold text-slate-500 hover:text-orange-600 transition-all"
            >
              <FileUp className="w-4 h-4" /> Bulk Upload
            </button>
            <input 
              id="bulk-upload-input"
              type="file"
              accept=".csv, .json"
              className="hidden"
              onChange={handleBulkUpload}
            />
            <button 
              onClick={() => setShowModal(true)}
              className="px-8 py-3 bg-orange-600 text-white rounded-xl flex items-center gap-2 font-black shadow-lg hover:scale-105 active:scale-95 transition-all w-full md:w-auto justify-center"
            >
              <Plus className="w-5 h-5" /> New Post
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 nm-inset rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <LayoutDashboard className="w-3 h-3" /> Filter by Platform
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", "Twitter", "LinkedIn", "Instagram"].map(p => (
                    <button 
                      key={p}
                      onClick={() => setActivePlatform(p)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        activePlatform === p ? 'bg-orange-600 text-white shadow-lg' : 'nm-button text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Filter by Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", "Draft", "Scheduled", "Published"].map(s => (
                    <button 
                      key={s}
                      onClick={() => setActiveStatus(s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeStatus === s ? 'bg-orange-600 text-white shadow-lg' : 'nm-button text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(day => (
          <div key={day} className="text-center text-[10px] font-black text-slate-400 tracking-widest pb-2">{day}</div>
        ))}
        {calendarDays.map(day => {
          const dayPosts = filteredPosts.filter(p => p.day === day);
          const hasPosts = dayPosts.length > 0;
          
          return (
            <div 
              key={day} 
              className={`min-h-[140px] p-4 rounded-3xl nm-flat relative group transition-all hover:nm-inset cursor-pointer ${
                day === selectedDay ? 'nm-inset border-2 border-orange-500' : ''
              } ${!hasPosts && (activePlatform !== "All" || activeStatus !== "All" || searchQuery !== "") ? 'opacity-40' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <span className={`text-sm font-black transition-colors ${day === selectedDay ? 'text-orange-500' : 'text-slate-300 group-hover:text-orange-500'}`}>
                {day}
              </span>
              
              {/* Algorithm Probability Markers */}
              <div className="absolute top-4 right-4 flex gap-1">
                 {[1, 2, 3].map(i => (
                   <div 
                     key={i} 
                     className={cn(
                       "w-1 h-1 rounded-full",
                       day % 3 === 0 ? "bg-orange-500" : (day % 2 === 0 ? "bg-indigo-500" : "bg-slate-200")
                     )} 
                   />
                 ))}
              </div>
              
              <div className="mt-2 space-y-2">
                {dayPosts.slice(0, 3).map((post) => (
                  <div 
                    key={post.id}
                    className={`p-1.5 rounded-lg flex items-center gap-1 overflow-hidden ${
                      post.platform === 'Twitter' ? 'bg-blue-100/50 text-blue-600' : 
                      post.platform === 'LinkedIn' ? 'bg-orange-100/50 text-orange-600' : 
                      'bg-rose-100/50 text-rose-600'
                    }`}
                  >
                    {post.platform === 'Twitter' ? <Twitter className="w-3 h-3 flex-shrink-0" /> : 
                     post.platform === 'LinkedIn' ? <Linkedin className="w-3 h-3 flex-shrink-0" /> : 
                     <Instagram className="w-3 h-3 flex-shrink-0" />}
                    <span className="text-[9px] font-black truncate">{post.title}</span>
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <div className="text-[8px] font-black text-slate-400 text-center uppercase tracking-tighter">
                    + {dayPosts.length - 3} More
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Panel / Empty State */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 nm-flat p-8 rounded-3xl min-h-[300px]">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 nm-inset rounded-2xl text-orange-500">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Planned for {selectedDay || 'Today'}</h3>
          </div>
          <div className="space-y-4">
            {filteredPosts.filter(p => !selectedDay || p.day === selectedDay).length > 0 ? (
              filteredPosts.filter(p => !selectedDay || p.day === selectedDay).map((post) => (
                <div key={post.id} className="p-5 nm-inset rounded-2xl flex items-center justify-between group hover:nm-flat transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-slate-400">{post.time}</span>
                    <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800" />
                    <div>
                      <p className="font-bold">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{post.platform}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[9px] font-bold text-slate-400 italic truncate max-w-[200px]">{post.description}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest ${
                      post.status === 'Published' ? 'bg-orange-100 text-orange-600' : 
                      post.status === 'Scheduled' ? 'bg-blue-100 text-blue-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {post.status.toUpperCase()}
                    </span>
                    <button className="p-2 nm-button rounded-lg hover:text-orange-600 transition-colors"><FileEdit className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 nm-inset rounded-3xl mx-auto flex items-center justify-center text-slate-300">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Operational Nodes Found</p>
                  <p className="text-xs font-bold text-slate-500 italic mt-1">"Adjust your filters or neural scan to locate content."</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="nm-flat p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-600" />
            Strategic Intelligence
          </h3>
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                { time: "Live", text: "Algorithm shift detected on LinkedIn. Delaying 'Tech Talk' by 45 mins.", type: "adjustment" },
                { time: "5h ago", text: "Organic trend #GreenTech rising. Suggested content injection.", type: "opportunity" },
              ].map((rec, i) => (
                <div key={i} className="nm-inset p-4 rounded-2xl space-y-2 border-l-2 border-orange-500">
                  <div className="flex justify-between items-center text-[8px] font-black uppercase">
                    <span className={rec.type === 'opportunity' ? 'text-blue-500' : 'text-orange-500'}>{rec.type}</span>
                    <span className="text-slate-400">{rec.time}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{rec.text}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-4">
              <button className="w-full py-4 nm-button rounded-2xl font-bold flex items-center justify-center gap-2 text-orange-600">
                <Clock className="w-5 h-5" /> Auto-Optimize Times
              </button>
              <div className="nm-inset p-4 rounded-2xl bg-slate-950 text-white space-y-2">
                <p className="text-[10px] font-black uppercase text-orange-500">Peak Window (May)</p>
                <p className="text-xs font-medium italic text-slate-400 leading-tight">"Reach highest when bridging GMT/PST gap (14:00 - 16:30)."</p>
              </div>
            </div>
          </div>
        </div>

        <div className="nm-flat p-8 rounded-3xl flex flex-col h-full bg-slate-50/30 dark:bg-slate-900/10">
          <div className="space-y-8">
             <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Neural Idea Injection
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Trending nodes based on global algorithm monitoring.</p>
                <div className="flex flex-wrap gap-2">
                   {[
                     { label: 'Neural Aesthetics', score: '+45%' },
                     { label: 'Brutalist UI', score: '+22%' },
                     { label: 'SaaS Scaling', score: '+18%' },
                     { label: 'AI Ethics', score: '+30%' },
                   ].map((node, i) => (
                     <button key={i} className="px-4 py-2 nm-button rounded-xl text-[9px] font-black uppercase flex items-center gap-2 group">
                        <Plus className="w-3 h-3 text-orange-600 transition-transform group-hover:rotate-90" />
                        {node.label}
                        <span className="text-emerald-500">{node.score}</span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="p-6 nm-inset rounded-[2rem] bg-orange-600/5 space-y-4 border border-orange-500/10">
                <h4 className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Algorithm Guard</h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-[9px] font-black uppercase">
                      <span className="text-slate-500">Predicted Reach (Selected Day)</span>
                      <span className="text-orange-600">High Confidence</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-orange-600 shadow-[0_0_10px_orange]" />
                   </div>
                   <p className="text-[9px] font-bold text-slate-500 italic">"Post at 14:15 for maximum transatlantic intersection."</p>
                </div>
             </div>

             <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Workflow Tasks
                </h3>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">
                  {tasks.filter(t => t.status === 'done').length}/{tasks.length}
                </span>
             </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="relative">
              <input 
                type="text"
                placeholder="Add workflow step..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                className="w-full pl-4 pr-12 py-3 nm-inset rounded-xl bg-transparent font-bold text-xs border-none focus:ring-1 focus:ring-orange-500"
              />
              <button 
                onClick={addTask}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-orange-600 text-white rounded-lg hover:scale-110 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={task.id}
                      className={`p-4 nm-inset rounded-2xl flex items-center justify-between group transition-all ${
                        task.status === 'done' ? 'opacity-50' : 'hover:nm-flat'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleTaskStatus(task)}
                          className={`transition-colors ${task.status === 'done' ? 'text-emerald-500' : 'text-slate-300 hover:text-orange-500'}`}
                        >
                          {task.status === 'done' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                        <span className={`text-xs font-bold ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {task.title}
                        </span>
                      </div>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">No active workflow nodes</p>
                    <p className="text-[9px] font-bold text-slate-500 italic mt-1">"Initialize sequences to track growth."</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-8 p-4 nm-inset rounded-2xl bg-slate-900/5 space-y-3">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
              <span>Creation Pipeline</span>
              <span>{Math.round((tasks.filter(t => t.status === 'done').length / (tasks.length || 1)) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(tasks.filter(t => t.status === 'done').length / (tasks.length || 1)) * 100}%` }}
                className="h-full bg-gradient-to-r from-orange-500 to-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal Simulation */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/40">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="nm-flat p-10 md:p-14 rounded-[3.5rem] max-w-3xl w-full space-y-10 bg-white dark:bg-slate-950 border border-white/20 relative"
            >
              <button 
                onClick={() => setShowModal(false)} 
                className="absolute top-8 right-8 p-4 nm-button rounded-2xl text-slate-400 hover:text-orange-600 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/30">
                      <Plus className="w-6 h-6" />
                   </div>
                   <h3 className="text-4xl font-black uppercase tracking-tighter">Compose Node</h3>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">"Synchronizing brand frequency across the neural matrix."</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Target Platforms</label>
                    <div className="flex gap-3">
                      {[
                        { id: 'Twitter', icon: Twitter, color: 'hover:text-sky-500' },
                        { id: 'LinkedIn', icon: Linkedin, color: 'hover:text-blue-700' },
                        { id: 'Instagram', icon: Instagram, color: 'hover:text-pink-600' },
                        { id: 'Facebook', icon: Facebook, color: 'hover:text-blue-600' }
                      ].map((p) => (
                        <button 
                          key={p.id} 
                          onClick={() => {
                            setNewPost(prev => ({
                              ...prev,
                              platforms: prev.platforms.includes(p.id) 
                                ? prev.platforms.filter(plat => plat !== p.id)
                                : [...prev.platforms, p.id]
                            }))
                          }}
                          className={cn(
                            "p-5 nm-button rounded-2xl transition-all",
                            newPost.platforms.includes(p.id) ? "nm-inset text-orange-600 scale-95" : "text-slate-400 " + p.color
                          )}
                        >
                          <p.icon className="w-6 h-6" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Internal Title</label>
                    <input 
                      value={newPost.title}
                      onChange={e => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Identify this sequence..."
                      className="w-full p-5 nm-inset rounded-2xl bg-transparent font-black text-sm outline-none border-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Temporal Sync (Schedule)</label>
                    <div className="relative">
                       <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                        type="datetime-local" 
                        value={newPost.dateTime}
                        onChange={e => setNewPost(prev => ({ ...prev, dateTime: e.target.value }))}
                        className="w-full pl-14 pr-5 py-5 nm-inset rounded-2xl bg-transparent font-black text-xs outline-none border-none" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Signal Content</label>
                    <div className="nm-inset p-5 rounded-[2.5rem] h-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                      <textarea 
                        value={newPost.description}
                        onChange={e => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full h-full bg-transparent border-none focus:ring-0 resize-none font-bold text-sm leading-relaxed"
                        placeholder="Draft the message that will resonate..."
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Visual Assets</label>
                    <div className="grid grid-cols-2 gap-4">
                       <button className="flex flex-col items-center justify-center gap-2 p-6 nm-button rounded-2xl group transition-all">
                          <div className="w-10 h-10 rounded-full nm-inset flex items-center justify-center text-slate-300 group-hover:text-orange-600">
                             <FileUp className="w-5 h-5" />
                          </div>
                          <span className="text-[8px] font-black uppercase text-slate-400">Upload Media</span>
                       </button>
                       <button className="flex flex-col items-center justify-center gap-2 p-6 nm-button rounded-2xl group transition-all">
                          <div className="w-10 h-10 rounded-full nm-inset flex items-center justify-center text-slate-300 group-hover:text-indigo-600">
                             <Sparkles className="w-5 h-5" />
                          </div>
                          <span className="text-[8px] font-black uppercase text-slate-400">AI Gen Asset</span>
                       </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleCreatePost}
                  disabled={!newPost.title || newPost.platforms.length === 0}
                  className={cn(
                    "w-full py-8 rounded-[2rem] font-black text-xl uppercase tracking-tighter shadow-2xl transition-all flex items-center justify-center gap-4 group disabled:opacity-50 disabled:grayscale",
                    "bg-slate-950 text-white hover:scale-[1.02] active:scale-95"
                  )}
                >
                  <Rocket className="w-6 h-6 text-orange-600 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                  Propagate to Grid
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-12 right-12 w-20 h-20 bg-orange-600 text-white rounded-3xl shadow-2xl shadow-orange-600/40 flex items-center justify-center z-40 transition-shadow hover:shadow-orange-600/60"
      >
        <Plus className="w-10 h-10" />
      </motion.button>

      {/* Confirmation Dialog for Task Completion */}
      <AnimatePresence>
        {taskToConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="nm-flat p-8 rounded-[2.5rem] max-w-sm w-full space-y-6 bg-white dark:bg-slate-950 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                 <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                 <h4 className="text-xl font-black uppercase tracking-tighter">Terminate Task?</h4>
                 <p className="text-xs font-bold text-slate-500 uppercase">Are you sure you want to mark <span className="text-slate-900 dark:text-white">"{taskToConfirm.title}"</span> as complete? This will archive the neural sequence.</p>
              </div>
              <div className="flex gap-4 pt-2">
                 <button 
                   onClick={() => setTaskToConfirm(null)}
                   className="flex-1 py-4 nm-button rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                 >
                   Abort
                 </button>
                 <button 
                   onClick={confirmToggleStatus}
                   className="flex-1 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20 hover:scale-105 active:scale-95 transition-all"
                 >
                   Confirm Finish
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
