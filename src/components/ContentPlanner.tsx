import React, { useState, useMemo } from "react";
import { Plus, Twitter, Linkedin, Facebook, Instagram, Clock, Filter, ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileEdit, Sparkles, Search, X, LayoutDashboard, FileUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
      </div>

      {/* Post Modal Simulation */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-black/10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="nm-flat p-12 rounded-[3vw] max-w-2xl w-full space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black">Compose Masterpiece</h3>
                <button onClick={() => setShowModal(false)} className="p-3 nm-button rounded-full">✕</button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Select Platforms</label>
                  <div className="flex gap-4">
                    {[Twitter, Linkedin, Facebook, Instagram].map((Icon, idx) => (
                      <button key={idx} className="p-4 nm-button rounded-2xl hover:text-indigo-500 transition-colors">
                        <Icon className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Content Body</label>
                  <div className="nm-inset p-4 rounded-3xl h-48">
                    <textarea 
                      className="w-full h-full bg-transparent border-none focus:ring-0 resize-none font-medium"
                      placeholder="What is your strategic message?"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-400">Schedule Date</label>
                    <input type="datetime-local" className="w-full p-4 nm-inset rounded-2xl bg-transparent font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-400">Media</label>
                    <button className="w-full p-4 nm-button rounded-2xl flex items-center justify-center gap-2 font-bold text-slate-400">
                      <Plus className="w-4 h-4" /> Add Assets
                    </button>
                  </div>
                </div>

                <button className="w-full py-6 bg-orange-600 text-white rounded-3xl font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                  Sync & Schedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
