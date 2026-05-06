import React, { useState } from "react";
import { Plus, Twitter, Linkedin, Facebook, Instagram, Clock, Filter, ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileEdit, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ContentPlanner({ user }: any) {
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = 30;
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <button className="p-3 nm-button rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
            <button className="p-3 nm-button rounded-xl"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <h3 className="text-2xl font-black">May 2026</h3>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 nm-button rounded-xl flex items-center gap-2 font-bold text-slate-500">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="px-8 py-3 bg-orange-600 text-white rounded-xl flex items-center gap-2 font-black shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" /> New Post
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(day => (
          <div key={day} className="text-center text-[10px] font-black text-slate-400 tracking-widest pb-2">{day}</div>
        ))}
        {calendarDays.map(day => (
          <div 
            key={day} 
            className={`min-h-[140px] p-4 rounded-3xl nm-flat relative group transition-all hover:nm-inset cursor-pointer ${
              day === 15 ? 'nm-inset border-2 border-orange-500' : ''
            }`}
            onClick={() => setSelectedDay(day)}
          >
            <span className="text-sm font-black text-slate-300 group-hover:text-orange-500">{day}</span>
            
            {/* Mock Scheduled Posts */}
            {day % 4 === 0 && (
              <div className="mt-2 space-y-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg flex items-center gap-1">
                  <Twitter className="w-3 h-3" />
                  <span className="text-[9px] font-black truncate">Product Launch</span>
                </div>
              </div>
            )}
            {day % 7 === 0 && (
              <div className="mt-2 space-y-2">
                <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg flex items-center gap-1">
                  <Linkedin className="w-3 h-3" />
                  <span className="text-[9px] font-black truncate">Team Highlight</span>
                </div>
              </div>
            )}
             {day % 10 === 0 && (
              <div className="mt-2 space-y-2">
                <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg flex items-center gap-1">
                  <Instagram className="w-3 h-3" />
                  <span className="text-[9px] font-black truncate">Influencer Reel</span>
                </div>
              </div>
            )}
          </div>
        ))}
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
              {[
                { time: "09:00 AM", title: "Morning Coffee Thoughts", platform: "Twitter", status: "Ready" },
                { time: "12:30 PM", title: "Product Features Spotlight", platform: "Instagram", status: "Review" },
                { time: "04:00 PM", title: "Monthly Newsletter Snippet", platform: "LinkedIn", status: "Published" },
              ].map((post, i) => (
                <div key={i} className="p-4 nm-inset rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-slate-400">{post.time}</span>
                    <div className="w-[1px] h-8 bg-slate-200" />
                    <div>
                      <p className="font-bold">{post.title}</p>
                      <span className="text-[10px] font-black opacity-40 uppercase">{post.platform}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-black ${
                      post.status === 'Published' ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {post.status.toUpperCase()}
                    </span>
                    <button className="p-2 hover:text-indigo-500 transition-colors"><FileEdit className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
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
